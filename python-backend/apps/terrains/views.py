from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Abonnement,
    Notification,
    Paiement,
    Reservation,
    ReponseTicket,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
)
from .serializers import (
    AbonnementSerializer,
    NotificationSerializer,
    PaiementSerializer,
    ReservationSerializer,
    ReponseTicketSerializer,
    SouscriptionSerializer,
    TerrainSerializer,
    TicketSupportSerializer,
)


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]


class TerrainViewSet(BaseViewSet):
    queryset = TerrainSynthetiquesDakar.objects.filter(est_actif=True)
    serializer_class = TerrainSerializer


class ReservationViewSet(BaseViewSet):
    serializer_class = ReservationSerializer

    def get_queryset(self):
        queryset = Reservation.objects.select_related('terrain', 'user')
        if self.request.user.role == 'client':
            return queryset.filter(user=self.request.user)
        if self.request.user.role == 'gestionnaire':
            return queryset.filter(terrain__gestionnaire=self.request.user)
        return queryset


class AbonnementViewSet(BaseViewSet):
    serializer_class = AbonnementSerializer

    def get_queryset(self):
        if self.request.user.role == 'client':
            return Abonnement.objects.filter(user=self.request.user)
        return Abonnement.objects.all()


class SouscriptionViewSet(BaseViewSet):
    serializer_class = SouscriptionSerializer

    def get_queryset(self):
        if self.request.user.role == 'client':
            return Souscription.objects.filter(user=self.request.user)
        return Souscription.objects.all()


class PaiementViewSet(BaseViewSet):
    serializer_class = PaiementSerializer

    def get_queryset(self):
        qs = Paiement.objects.all()
        if self.request.user.role == 'client':
            qs = qs.filter(user=self.request.user)
        return qs


class TicketSupportViewSet(BaseViewSet):
    serializer_class = TicketSupportSerializer

    def get_queryset(self):
        if self.request.user.role == 'client':
            return TicketSupport.objects.filter(user=self.request.user)
        return TicketSupport.objects.all()

    @action(detail=True, methods=['post'])
    def repondre(self, request, pk=None):
        ticket = self.get_object()
        serializer = ReponseTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket, user=request.user, est_reponse_admin=request.user.role != 'client')
        return Response(serializer.data)


class NotificationViewSet(BaseViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.est_lu = True
        notification.lu_at = notification.lu_at or notification.updated_at
        notification.save(update_fields=['est_lu', 'lu_at'])
        return Response({'success': True})
