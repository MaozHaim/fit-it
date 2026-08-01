import csv
import random
from io import BytesIO

import requests
from PIL import Image
from django.db import transaction
from django.utils.text import slugify
from sentence_transformers import SentenceTransformer

from store.models import Product, ProductEmbeddingText, ProductEmbeddingImage

# Some image hosts reject default user-agents, so mimic a browser.
IMAGE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
}


def _download_image(url):
    """PIL RGB image, or ``None`` if the URL is empty, unreachable, or not a
    decodable image. ``None`` means the caller skips the product entirely.
    """
    if not url:
        return None
    try:
        response = requests.get(url, headers=IMAGE_HEADERS, timeout=12)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert("RGB")
    except Exception:
        return None


def _clip_item_text(product):
    """Text side of the Fashion-CLIP item embedding: metadata only."""
    parts = [
        product.name,
        product.description,
        product.get_category_display(),
        product.color,
        product.color_shade,
        product.appearance,
        product.brand,
    ]
    return " ".join(str(part) for part in parts if part)


def run_product_import(csv_file_path, stdout_writer=None):
    """Read the enriched CSV, embed each product, and insert into PostgreSQL
    inside one atomic transaction.

    Two embeddings per product: ProductEmbeddingText (BGE, description + vibes,
    for semantic search) and ProductEmbeddingImage (one Fashion-CLIP item
    vector, for bundling). Precomputing the CLIP vector here is what keeps the
    image download + CLIP forward pass out of request time.
    """

    def log(message, is_success=False):
        """Print via Django's writer when available, plain stdout otherwise."""
        prefix = "✅ [SUCCESS] " if is_success else "ℹ️ "
        if stdout_writer:
            stdout_writer.write(f"{prefix}{message}")
        else:
            print(f"{prefix}{message}")

    log('Loading SentenceTransformer model (BAAI/bge-small-en-v1.5)...')
    text_model = SentenceTransformer('BAAI/bge-small-en-v1.5')
    log('Text model loaded successfully!', is_success=True)

    # The CLIP backbone is frozen, so precompute_clip_embedding() is independent
    # of any trained checkpoint - image vectors can be built without weights.
    log('Loading Fashion-CLIP item encoder (Outfit Transformer)...')
    from store.ml_manager import ml_models
    from store.outfit_transformer.data.datatypes import FashionItem
    clip_model = ml_models.outfit_complementary_model
    clip_model.eval()
    log('Fashion-CLIP encoder loaded successfully!', is_success=True)

    log(f'Starting import from {csv_file_path}...')

    try:
        with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)

            # All-or-nothing: no partially embedded catalog on failure.
            with transaction.atomic():
                for row_num, row in enumerate(reader, start=1):
                    prod_name = row.get('prod_name', '').strip()
                    if not prod_name:
                        continue

                    # Already normalized by data_cleaning_and_filtering.py.
                    category_choice = row.get('product_type_name', '').strip()

                    # H&M metadata has no price.
                    random_price = round(random.uniform(29.90, 200.90), 2)

                    color_val = row.get('perceived_colour_master_name', '').strip()
                    shade_val = row.get('perceived_colour_value_name', '').strip()

                    # Row number + random suffix guarantee slug uniqueness.
                    base_slug = slugify(prod_name) or "product"
                    unique_slug = f"{base_slug}-{row_num}-{random.randint(1000, 9999)}"

                    image_url = row.get('image_url', '').strip()

                    # Check duplicates (name + color + shade) before any network work.
                    if Product.objects.filter(
                        name=prod_name, color=color_val, color_shade=shade_val
                    ).exists():
                        continue

                    # No image means no CLIP vector, so the product is useless for
                    # bundling: fetch up front and skip the whole row on failure.
                    image = _download_image(image_url)
                    if image is None:
                        log(f"Skipping '{prod_name}': image unavailable ({image_url or 'no url'})")
                        continue

                    product = Product.objects.create(
                        name=prod_name,
                        color=color_val,
                        color_shade=shade_val,
                        slug=unique_slug,
                        description=row.get('detail_desc', '').strip(),
                        category=category_choice,
                        appearance=row.get('graphical_appearance_name', '').strip(),
                        image_url=image_url,
                        price=random_price,
                        brand="H&M",
                    )

                    # ----- 1. Text embeddings (semantic search) -----
                    # One vector per text, so any of them can match a query.
                    texts_to_embed = [
                        row.get('detail_desc', '').strip(),
                        row.get('vibe_1', '').strip(),
                        row.get('vibe_2', '').strip(),
                        row.get('vibe_3', '').strip()
                    ]

                    types_mapping = ['description', 'vibe_1', 'vibe_2', 'vibe_3']

                    valid_texts = []
                    valid_types = []
                    for text, t_type in zip(texts_to_embed, types_mapping):
                        if text:
                            valid_texts.append(text)
                            valid_types.append(t_type)

                    if not valid_texts:
                        continue

                    embeddings = text_model.encode(valid_texts)

                    # category/color are denormalized onto each row for fast filtering.
                    text_embedding_objects = []
                    for text, t_type, vector in zip(valid_texts, valid_types, embeddings):
                        text_embedding_objects.append(
                            ProductEmbeddingText(
                                product=product,
                                embedding_type=t_type,
                                text_content=text,
                                embedding=vector.tolist(),  # pgvector wants a plain list
                                category=product.category,
                                color=product.color,
                            )
                        )

                    ProductEmbeddingText.objects.bulk_create(text_embedding_objects)

                    # ----- 2. Fashion-CLIP image embedding (bundling) -----
                    clip_item = FashionItem(
                        item_id=product.id,
                        category=product.category,
                        image=image,
                        description=_clip_item_text(product),
                    )
                    # precompute_clip_embedding is batched; we pass a single item.
                    clip_vector = clip_model.precompute_clip_embedding([clip_item])[0]

                    ProductEmbeddingImage.objects.create(
                        product=product,
                        embedding=clip_vector.tolist(),
                        category=product.category,
                        color=product.color,
                    )

                    if row_num % 50 == 0:
                        log(f"Processed {row_num} items...")

            log('\nDatabase population and vector encoding completed successfully!', is_success=True)

    except FileNotFoundError:
        log(f'ERROR: File not found at {csv_file_path}')
    except Exception as e:
        log(f'CRITICAL ERROR during execution: {str(e)}')
