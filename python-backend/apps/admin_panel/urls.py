from rest_framework.routers import DefaultRouter

from .views import (
    AdminUserViewSet,
    AdminTerrainViewSet,
    AdminPaiementViewSet,
    AdminTicketViewSet,
    AdminNotificationViewSet,
    AdminStatsViewSet,
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'terrains', AdminTerrainViewSet, basename='admin-terrains')
router.register(r'paiements', AdminPaiementViewSet, basename='admin-paiements')
router.register(r'tickets', AdminTicketViewSet, basename='admin-tickets')
router.register(r'notifications', AdminNotificationViewSet, basename='admin-notifications')
router.register(r'stats', AdminStatsViewSet, basename='admin-stats')

urlpatterns = router.urls
