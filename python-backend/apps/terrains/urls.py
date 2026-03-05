from rest_framework.routers import DefaultRouter

from .views import (
    TerrainViewSet,
    TicketSupportViewSet,
    AbonnementViewSet,
    SouscriptionViewSet,
    PaiementViewSet,
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r'terrains', TerrainViewSet, basename='terrain')
router.register(r'tickets', TicketSupportViewSet, basename='ticket')
router.register(r'abonnements', AbonnementViewSet, basename='abonnement')
router.register(r'souscriptions', SouscriptionViewSet, basename='souscription')
router.register(r'paiements', PaiementViewSet, basename='paiement')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = router.urls
