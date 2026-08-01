from pgvector.django import CosineDistance
from store.models import ProductEmbeddingText
from store.ml_manager import ml_models


def perform_semantic_search(limit: int = 10, query_text: str = "", main_category: str = "shirts", excluded_colors: list = None):
    """Semantic search with DB-level hard filters, applied before the vector
    scan so the nearest neighbours can't all be filtered away afterwards.
    """
    bge_prompt = f"Represent this sentence for searching relevant passages: {query_text}"
    query_embedding = ml_models.bge_model.encode(bge_prompt).tolist()

    # Over-fetch: a product has several vibe vectors, so rows collapse on dedup.
    max_vectors_to_fetch = limit * 4

    # category/color are denormalized onto the embedding table, so these filters
    # hit indexes on the vector table directly - no join needed.
    base_qs = ProductEmbeddingText.objects.select_related('product')
    base_qs = base_qs.filter(category=main_category, product__is_active=True)
    if excluded_colors:
        base_qs = base_qs.exclude(color__in=excluded_colors)

    # Runs only on the subset that passed the filters above.
    closest_embeddings = base_qs.annotate(
        distance=CosineDistance('embedding', query_embedding)
    ).order_by('distance')[:max_vectors_to_fetch]

    unique_products = []
    seen_product_ids = set()

    # Keep the best-matching row per product.
    for emb in closest_embeddings:
        prod = emb.product

        if prod.id not in seen_product_ids:
            # Ride back to the serializer on the Product instance.
            prod.matched_vibe = emb.text_content
            prod.match_distance = emb.distance

            unique_products.append(prod)
            seen_product_ids.add(prod.id)

        if len(unique_products) == limit:
            break

    return unique_products