from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Product, Order, OrderItem, CATEGORY_CHOICES
from .serializers import ProductSerializer, OrderSerializer, OrderItemSerializer
from .semantic_search.semantic_search import perform_semantic_search
from .consts import SEMANTIC_SEARCH_LIMIT, BUNDLE_CATEGORIES, NUM_BUNDLES


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'slug', 'category', 'brand', 'color']
    ordering_fields = ['name', 'price', 'created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)

        category_display = self.request.query_params.get('category', '').strip()
        if category_display:
            category_key = next(
                (key for key, display in CATEGORY_CHOICES if display.lower() == category_display.lower()),
                None,
            )
            if category_key:
                queryset = queryset.filter(category=category_key)

        return queryset

    def list(self, request, *args, **kwargs):
        tag = request.query_params.get('tag', '').strip()
        if tag == 'new':
            products = Product.objects.filter(is_active=True, id__gte=533, id__lte=593).order_by('id')
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        if tag == 'sale':
            products = Product.objects.filter(is_active=True, id__gte=496, id__lte=596).order_by('id')
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'post'])
    def semantic_search(self, request):
        query_text = request.query_params.get('q', '').strip()
        main_category = request.query_params.get('main_category', '').strip()
        colors_param = request.query_params.get('colors', '').strip()
        excluded_colors = [c.strip().title() for c in colors_param.split(',') if c.strip()] or None
        category_filter = main_category if main_category else "shirts"

        if not query_text:
            return Response(
                {"error": "Please provide a search query using the 'q' parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            matched_products = perform_semantic_search(
                limit=SEMANTIC_SEARCH_LIMIT,
                query_text=query_text,
                main_category=category_filter,
                excluded_colors=excluded_colors
            )

            serializer = self.get_serializer(matched_products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Semantic search failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    ordering_fields = ['created_at', 'status', 'total_price']

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items__product')
        if user and user.is_authenticated:
            return qs.filter(user=user)
        return qs.all()

    def perform_create(self, serializer):
        user = self.request.user
        data = self.request.data
        shipping = data.get('shipping', {})

        order = serializer.save(
            user=user if user and user.is_authenticated else None,
            shipping_first_name=shipping.get('firstName', ''),
            shipping_last_name=shipping.get('lastName', ''),
            shipping_address=shipping.get('address', ''),
            shipping_city=shipping.get('city', ''),
            shipping_zip=shipping.get('zip', ''),
            shipping_country=shipping.get('country', ''),
        )

        items_data = data.get('items', [])
        for item in items_data:
            product_id = item.get('id')
            try:
                product = Product.objects.get(pk=product_id)
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.get('quantity', 1),
                    price=item.get('price', product.price),
                )
            except Product.DoesNotExist:
                pass


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.select_related('order', 'product').all()
    serializer_class = OrderItemSerializer


class OutfitBundleView(APIView):
    """GET /api/store/bundling/?q=<query>&main_category=shirts&num_bundles=5&colors=Black,White

    Thin wrapper over ``store.bundling.bundle_service.generate_bundles``.
    """

    def get(self, request, *args, **kwargs):
        # Lazy import: loads torch/transformers only when bundling is actually hit.
        from .bundling.bundle_service import generate_bundles

        query_text = (request.query_params.get('q') or request.query_params.get('query') or '').strip()
        if not query_text:
            return Response(
                {"error": "Please provide a search query using the 'q' parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        main_category = (request.query_params.get('main_category') or 'shirts').strip()
        if main_category not in BUNDLE_CATEGORIES:
            return Response(
                {"error": f"main_category must be one of {BUNDLE_CATEGORIES}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            num_bundles = int(request.query_params.get('num_bundles', NUM_BUNDLES))
        except ValueError:
            num_bundles = NUM_BUNDLES
        num_bundles = max(1, min(num_bundles, 20))

        colors_param = request.query_params.get('colors', '').strip()
        excluded_colors = [c.strip().title() for c in colors_param.split(',') if c.strip()] or None

        try:
            bundles = generate_bundles(
                query_text=query_text,
                main_category=main_category,
                num_bundles=num_bundles,
                excluded_colors=excluded_colors,
            )
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response(
                {"error": f"Bundle generation failed: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serialized_bundles = []
        for bundle in bundles:
            serialized_bundles.append({
                "rank": bundle["rank"],
                "score": bundle["score"],
                "query_relevance": bundle["query_relevance"],  # min across items
                "compatibility": bundle["compatibility"],
                "item_relevances": bundle["item_relevances"],
                "items": {
                    category: ProductSerializer(product).data
                    for category, product in bundle["items"].items()
                },
            })

        return Response(
            {
                "query": query_text,
                "main_category": main_category,
                "num_bundles": len(serialized_bundles),
                "bundles": serialized_bundles,
            },
            status=status.HTTP_200_OK,
        )