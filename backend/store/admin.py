from django.contrib import admin
from .models import Product, ProductEmbeddingText, ProductEmbeddingImage, Order, OrderItem


class ProductEmbeddingTextInline(admin.TabularInline):
    """The generated vibes, inline on the Product admin page."""
    model = ProductEmbeddingText
    extra = 0
    # Readonly: rendering an editable 384-d vector freezes the browser, and it
    # would be corruptible by hand.
    readonly_fields = ['embedding_type', 'text_content', 'embedding', 'category', 'color']
    can_delete = False


class ProductEmbeddingImageInline(admin.StackedInline):
    """The precomputed Fashion-CLIP image embedding."""
    model = ProductEmbeddingImage
    extra = 0
    readonly_fields = ['embedding', 'category', 'color']
    can_delete = False


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'brand']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description', 'brand', 'color']
    list_editable = ['is_active', 'price']

    inlines = [ProductEmbeddingTextInline, ProductEmbeddingImageInline]


@admin.register(ProductEmbeddingText)
class ProductEmbeddingTextAdmin(admin.ModelAdmin):
    list_display = ['product', 'embedding_type', 'category', 'color', 'text_content']
    list_filter = ['embedding_type', 'category']
    search_fields = ['product__name', 'text_content']
    readonly_fields = ['embedding']


@admin.register(ProductEmbeddingImage)
class ProductEmbeddingImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'category', 'color']
    list_filter = ['category']
    search_fields = ['product__name']
    readonly_fields = ['embedding']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'total_price', 'created_at', 'updated_at']
    list_filter = ['status']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'quantity', 'price']
    list_filter = ['order__status']