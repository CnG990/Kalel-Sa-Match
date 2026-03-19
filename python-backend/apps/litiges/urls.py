from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LitigeViewSet, MessageLitigeViewSet

router = DefaultRouter()
router.register(r'litiges', LitigeViewSet, basename='litiges')
router.register(r'messages', MessageLitigeViewSet, basename='messages-litiges')

app_name = 'litiges'

urlpatterns = router.urls
