from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ManagerTerrainViewSet,
    ManagerStatsViewSet,
    ManagerValidationViewSet,
    ManagerExportsViewSet,
)
from .views_upload import upload_terrain_images

router = DefaultRouter()
router.register(r'terrains', ManagerTerrainViewSet, basename='manager-terrain')
router.register(r'stats', ManagerStatsViewSet, basename='manager-stats')
router.register(r'validation', ManagerValidationViewSet, basename='manager-validation')
router.register(r'exports', ManagerExportsViewSet, basename='manager-exports')

urlpatterns = router.urls + [
    path('terrains/<int:terrain_id>/upload-images/', upload_terrain_images, name='upload-terrain-images'),
]
