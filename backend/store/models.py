from django.db import models
from pgvector.django import VectorField


CATEGORY_CHOICES = [
        ('shirts', 'Shirts'),
        ('pants', 'Pants'),
        ('footwear', 'Footwear'),
        ('coats_jackets', 'Coats & Jackets'),
    ]

class Product(models.Model):
    # Trailing comments give the source CSV column, or how the import script
    # fills fields the H&M dataset doesn't have.
    name = models.CharField(max_length=255)                                     # prod_name
    slug = models.SlugField(unique=True)                                        # slugify(prod_name) + unique suffix
    description = models.TextField(blank=True)                                  # detail_desc
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)        # product_type_name
    color = models.CharField(max_length=50, blank=True)                         # perceived_colour_master_name
    color_shade = models.CharField(max_length=50, blank=True)                   # perceived_colour_value_name
    appearance = models.CharField(max_length=100, blank=True)                   # graphical_appearance_name
    image_url = models.URLField(blank=True, max_length=500)                     # image_url
    price = models.DecimalField(max_digits=10, decimal_places=2)                # not in CSV: randomized
    brand = models.CharField(max_length=100, blank=True, default="H&M")         # not in CSV: hardcoded

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['color']),
        ]
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'color', 'color_shade'],
                name='unique_product_variant'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.color_shade} {self.color})"


class ProductEmbeddingText(models.Model):
    """BGE text embeddings for natural-language semantic search.

    Several rows per product (description + vibes). ``category``/``color`` are
    denormalized from Product so the vector search can hard-filter on this
    table's indexes without joining back to Product on every query.
    """
    TYPE_CHOICES = [
        ('description', 'Original Description'),
        ('vibe_1', 'Vibe 1'),
        ('vibe_2', 'Vibe 2'),
        ('vibe_3', 'Vibe 3'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='text_embeddings')
    embedding_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    text_content = models.TextField()               # the CSV detail_desc / vibe_N this row embeds
    embedding = VectorField(dimensions=384)         # SentenceTransformer over text_content

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True)
    color = models.CharField(max_length=50, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['category'], name='store_pet_category_idx'),
            models.Index(fields=['color'], name='store_pet_color_idx'),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.get_embedding_type_display()}"


class ProductEmbeddingImage(models.Model):
    """Fashion-CLIP item embedding, consumed by the Outfit Transformer bundling flow.

    Produced by ``OutfitCLIPTransformer.precompute_clip_embedding``. One vector
    per product (a single product photo), hence OneToOne. ``category``/``color``
    are denormalized for the same reason as ProductEmbeddingText.
    """
    CLIP_EMBEDDING_DIM = 1024  # 512 image projection + 512 text projection

    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='image_embedding')
    embedding = VectorField(dimensions=CLIP_EMBEDDING_DIM)

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True)
    color = models.CharField(max_length=50, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['category'], name='store_pei_category_idx'),
            models.Index(fields=['color'], name='store_pei_color_idx'),
        ]

    def __str__(self):
        return f"{self.product.name} - CLIP image embedding"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    shipping_first_name = models.CharField(max_length=100, blank=True)
    shipping_last_name = models.CharField(max_length=100, blank=True)
    shipping_address = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_zip = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} - {self.status}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}x {self.product.name} (Order #{self.order.id})'