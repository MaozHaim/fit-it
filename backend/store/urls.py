from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProductViewSet, OrderViewSet, OrderItemViewSet, OutfitBundleView

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='orderitem')

urlpatterns = [
	path('', include(router.urls)),
	path('bundling/', OutfitBundleView.as_view(), name='bundling-search'),
]
