from rest_framework import serializers
from .models import Product, Order, OrderItem

SALE_ID_MIN = 496
SALE_ID_MAX = 596

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='get_category_display', read_only=True)
    is_on_sale = serializers.SerializerMethodField()
    matched_vibe = serializers.CharField(read_only=True, required=False)
    match_distance = serializers.FloatField(read_only=True, required=False)

    def get_is_on_sale(self, obj):
        return SALE_ID_MIN <= obj.id <= SALE_ID_MAX

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'name', 'slug', 'description',
            'brand', 'color', 'color_shade', 'appearance',
            'price', 'image_url', 'is_active', 'is_on_sale', 'created_at',
            'matched_vibe', 'match_distance'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'created_at', 'updated_at', 'total_price', 'status', 'items',
            'shipping_first_name', 'shipping_last_name', 'shipping_address',
            'shipping_city', 'shipping_zip', 'shipping_country',
        ]
        read_only_fields = ['user']