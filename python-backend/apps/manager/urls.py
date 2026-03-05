from rest_framework.routers import DefaultRouter

from .views import (
    ManagerTerrainViewSet,
    ManagerStatsViewSet,
    ManagerValidationViewSet,
    ManagerExportsViewSet,
)

router = DefaultRouter()
router.register(r'terrains', ManagerTerrainViewSet, basename='manager-terrain')
router.register(r'stats', ManagerStatsViewSet, basename='manager-stats')
router.register(r'validation', ManagerValidationViewSet, basename='manager-validation')
router.register(r'exports', ManagerExportsViewSet, basename='manager-exports')

urlpatterns = router.urls
