"""Outfit bundling: retrieve-then-rerank, so every item in a bundle stays
relevant to the query.

Working from per-category top-M pools (rather than the whole catalog) both
enforces that relevance and keeps the per-request CIR projection small. The
expensive image download + Fashion-CLIP pass already happened offline in
``upload_products_to_db.py``; here we only read the stored 1024-d vectors and
run the cheap transformer heads with ``use_precomputed_embedding=True``.
"""

from collections import namedtuple

import numpy as np
import torch

from store.consts import (
    BUNDLE_CATEGORIES,
    TOP_M_PER_CATEGORY,
    SELECTION_RELEVANCE_WEIGHT,
    SELECTION_COMPATIBILITY_WEIGHT,
    DEFAULT_QUERY_WEIGHT,
    DEFAULT_COMPATIBILITY_WEIGHT,
    DEFAULT_NUM_BUNDLES,
    CIR_BATCH_SIZE,
)
from store.models import ProductEmbeddingImage
from store.ml_manager import ml_models
from store.semantic_search.semantic_search import perform_semantic_search
from store.outfit_transformer.data.datatypes import (
    FashionItem,
    FashionComplementaryQuery,
    FashionCompatibilityQuery,
)

# query_sim is 1 - cosine distance, in [0, 1].
Candidate = namedtuple("Candidate", ["product", "query_sim", "image_row"])


def _to_fashion_item(image_row: ProductEmbeddingImage) -> FashionItem:
    """Wrap a stored CLIP embedding as an Outfit Transformer item.

    Image/text are intentionally omitted: every downstream call uses
    ``use_precomputed_embedding=True`` and reads only ``embedding``.
    """
    return FashionItem(
        item_id=image_row.product_id,
        category=image_row.category or image_row.product.category,
        embedding=np.asarray(image_row.embedding, dtype=np.float32),
        metadata={"product_id": image_row.product_id},
    )


def build_candidate_pools(query_text, excluded_colors=None, top_m=TOP_M_PER_CATEGORY):
    """Retrieve the top-M query-relevant candidates per bundle category.

    Returns ``{category: [Candidate, ...]}`` ordered by descending relevance.
    Products without a CLIP image embedding are dropped — they can't take part
    in the Outfit Transformer flow.
    """
    relevance_by_category = {}
    pooled_ids = set()
    for category in BUNDLE_CATEGORIES:
        products = perform_semantic_search(
            limit=top_m,
            query_text=query_text,
            main_category=category,
            excluded_colors=excluded_colors,
        )
        relevance_by_category[category] = products
        pooled_ids.update(product.id for product in products)

    # One DB query for the pooled products only.
    image_rows = ProductEmbeddingImage.objects.select_related("product").filter(
        product_id__in=pooled_ids
    )
    rows_by_pid = {row.product_id: row for row in image_rows}

    pools = {}
    for category, products in relevance_by_category.items():
        candidates = []
        for product in products:
            image_row = rows_by_pid.get(product.id)
            if image_row is None:
                continue
            match_distance = getattr(product, "match_distance", None)
            query_sim = 1.0 - float(match_distance) if match_distance is not None else 0.0
            candidates.append(Candidate(product=product, query_sim=query_sim, image_row=image_row))
        pools[category] = candidates

    return pools


def build_cir_catalog(cir_model, image_rows, batch_size=CIR_BATCH_SIZE):
    """Project stored CLIP vectors into the 128-d CIR space; product_id -> ndarray.

    Cheap relative to CLIP: only the transformer + embed head run, on the
    already-computed 1024-d vectors.
    """
    catalog = {}
    cir_model.eval()
    with torch.no_grad():
        for start in range(0, len(image_rows), batch_size):
            chunk = image_rows[start:start + batch_size]
            items = [_to_fashion_item(row) for row in chunk]
            vectors = cir_model.embed_item(items, use_precomputed_embedding=True)
            for row, vector in zip(chunk, vectors):
                catalog[row.product_id] = vector.detach().cpu().numpy()
    return catalog


def predict_complementary_embedding(cir_model, outfit_items):
    """Embedding of the next complementary item for a partial outfit."""
    query = FashionComplementaryQuery(outfit=outfit_items)
    with torch.no_grad():
        prediction = cir_model.embed_query([query], use_precomputed_embedding=True)
    return prediction[0].detach().cpu().numpy()


def _normalize_unit(values):
    """Min-max normalize into [0, 1]; all-equal -> zeros, i.e. no preference."""
    values = np.asarray(values, dtype=np.float64)
    low, high = values.min(), values.max()
    if high - low < 1e-12:
        return np.zeros_like(values)
    return (values - low) / (high - low)


def select_best_candidate(
    predicted,
    candidates,
    cir_catalog,
    exclude_ids,
    relevance_weight=SELECTION_RELEVANCE_WEIGHT,
    compatibility_weight=SELECTION_COMPATIBILITY_WEIGHT,
):
    """Pick the next item from a category pool by blending relevance + compatibility.

    Compatibility is the negated L2 distance from the CIR-predicted embedding.
    Both signals are min-max normalized within the pool so the weights are
    directly comparable.

    Returns ``(Candidate, cir_l2_distance)``, or ``None`` if the pool is empty.
    """
    pool = [c for c in candidates if c.product.id not in exclude_ids]
    if not pool:
        return None

    matrix = np.stack([cir_catalog[c.product.id] for c in pool])
    distances = np.linalg.norm(matrix - predicted.reshape(1, -1), axis=1)

    # Higher is better for both normalized signals.
    compatibility_score = _normalize_unit(-distances)
    relevance_score = _normalize_unit([c.query_sim for c in pool])
    blended = relevance_weight * relevance_score + compatibility_weight * compatibility_score

    best_idx = int(np.argmax(blended))
    return pool[best_idx], float(distances[best_idx])


def score_outfit_compatibility(cp_model, outfit_items):
    """Score a complete outfit with the compatibility model."""
    query = FashionCompatibilityQuery(outfit=outfit_items)
    with torch.no_grad():
        score = cp_model.predict_score([query], use_precomputed_embedding=True)[0]
    return float(score.detach().cpu().reshape(-1)[0])


def generate_bundles(
    query_text,
    main_category="shirts",
    num_bundles=DEFAULT_NUM_BUNDLES,
    excluded_colors=None,
    query_weight=DEFAULT_QUERY_WEIGHT,
    compatibility_weight=DEFAULT_COMPATIBILITY_WEIGHT,
):
    """Build ranked outfit bundles for a natural-language query.

    Each bundle carries ranking metadata plus ``items`` (category -> Product)
    and ``item_relevances`` (category -> float). The view serializes the
    Products — same contract as semantic_search.
    """
    if not query_text or not query_text.strip():
        raise ValueError("query_text must not be empty.")
    if main_category not in BUNDLE_CATEGORIES:
        raise ValueError(
            f"main_category must be one of {BUNDLE_CATEGORIES}, got {main_category!r}."
        )

    # 1. Per-category top-M query-relevant candidate pools.
    pools = build_candidate_pools(query_text, excluded_colors=excluded_colors)
    seeds = pools.get(main_category, [])[:num_bundles]
    if not seeds:
        return []

    # 2. Project every pooled candidate into CIR space, in one small pass.
    cir_model = ml_models.outfit_complementary_model
    cp_model = ml_models.outfit_compatibility_model

    all_rows = [candidate.image_row for pool in pools.values() for candidate in pool]
    if not all_rows:
        return []
    cir_catalog = build_cir_catalog(cir_model, all_rows)

    fill_categories = [c for c in BUNDLE_CATEGORIES if c != main_category]

    bundles = []
    for seed in seeds:
        outfit_items = [_to_fashion_item(seed.image_row)]
        chosen = {main_category: seed.product}
        item_relevances = {main_category: seed.query_sim}
        distances = {}
        used_ids = {seed.product.id}

        # 3. Fill each remaining category from its pool.
        for category in fill_categories:
            predicted = predict_complementary_embedding(cir_model, outfit_items)
            selection = select_best_candidate(
                predicted, pools[category], cir_catalog, used_ids
            )
            if selection is None:
                continue
            candidate, distance = selection
            outfit_items.append(_to_fashion_item(candidate.image_row))
            chosen[category] = candidate.product
            item_relevances[category] = candidate.query_sim
            distances[category] = distance
            used_ids.add(candidate.product.id)
            pools[category].remove(candidate)  # no repeats across bundles

        # 4. Rank on the weakest item's relevance, so the whole bundle stays on-query.
        compatibility = score_outfit_compatibility(cp_model, outfit_items)
        min_relevance = min(item_relevances.values())
        score = query_weight * min_relevance + compatibility_weight * compatibility

        bundles.append({
            "score": score,
            "query_relevance": min_relevance,
            "compatibility": compatibility,
            "items": chosen,
            "item_relevances": item_relevances,
            "cir_distances": distances,
        })

    bundles.sort(key=lambda bundle: bundle["score"], reverse=True)
    for rank, bundle in enumerate(bundles, start=1):
        bundle["rank"] = rank
    return bundles
