from rest_framework.routers import DefaultRouter

from .views import (
    AdminUserViewSet,
    AdminTerrainViewSet,
    AdminPaymentViewSet,
    AdminTicketViewSet,
    AdminNotificationViewSet,
    AdminStatsViewSet,
)
from .views_payment_config import AdminPaymentConfigViewSet, AdminPaymentStatsViewSet
from .views_terrain_mobile import AdminTerrainMobileViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'terrains', AdminTerrainViewSet, basename='admin-terrains')
router.register(r'terrain-mobile', AdminTerrainMobileViewSet, basename='admin-terrain-mobile')
router.register(r'payments', AdminPaymentViewSet, basename='admin-payments')
router.register(r'payment-config', AdminPaymentConfigViewSet, basename='admin-payment-config')
router.register(r'payment-stats', AdminPaymentStatsViewSet, basename='admin-payment-stats')
router.register(r'tickets', AdminTicketViewSet, basename='admin-tickets')
router.register(r'notifications', AdminNotificationViewSet, basename='admin-notifications')
router.register(r'stats', AdminStatsViewSet, basename='admin-stats')

urlpatterns = router.urls
