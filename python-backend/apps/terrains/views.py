from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import (
    Abonnement,
    Notification,
    Paiement,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
    ReponseTicket,
)
from .serializers import (
    AbonnementSerializer,
    NotificationSerializer,
    PaiementSerializer,
    SouscriptionSerializer,
    TerrainSerializer,
    TicketSupportSerializer,
    ReponseTicketSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'per_page'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'data': {
                'count': self.page.paginator.count,
                'current_page': self.page.number,
                'last_page': self.page.paginator.num_pages,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'results': data,
            },
            'meta': {'success': True}
        })


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_paginated_response(self, data):
        if hasattr(self, 'paginator') and self.paginator is not None:
            return self.paginator.get_paginated_response(data)
        return Response({'data': data, 'meta': {'success': True}})


class TerrainViewSet(BaseViewSet):
    queryset = TerrainSynthetiquesDakar.objects.filter(est_actif=True)
    serializer_class = TerrainSerializer

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Endpoint pour obtenir tous les terrains sans pagination"""
        terrains = self.queryset
        serializer = self.get_serializer(terrains, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True}})

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Endpoint pour obtenir les détails complets d'un terrain"""
        terrain = self.get_object()
        serializer = self.get_serializer(terrain)
        return Response({'data': serializer.data, 'meta': {'success': True}})


class AbonnementViewSet(BaseViewSet):
    serializer_class = AbonnementSerializer

    def get_queryset(self):
        if self.request.user.role == 'client':
            return Abonnement.objects.filter(user=self.request.user)
        return Abonnement.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        abonnement = serializer.save(user=request.user)
        return Response({'data': AbonnementSerializer(abonnement).data, 'meta': {'success': True, 'message': 'Abonnement créé avec succès'}}, status=201)


class SouscriptionViewSet(BaseViewSet):
    serializer_class = SouscriptionSerializer

    def get_queryset(self):
        if self.request.user.role == 'client':
            return Souscription.objects.filter(user=self.request.user)
        return Souscription.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        souscription = serializer.save(user=request.user)
        return Response({'data': SouscriptionSerializer(souscription).data, 'meta': {'success': True, 'message': 'Souscription créée avec succès'}}, status=201)

    @action(detail=False, methods=['get'])
    def my_subscriptions(self, request):
        """Endpoint pour les souscriptions du client connecté"""
        souscriptions = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(souscriptions)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class PaiementViewSet(BaseViewSet):
    serializer_class = PaiementSerializer

    def get_queryset(self):
        qs = Paiement.objects.all()
        if self.request.user.role == 'client':
            qs = qs.filter(user=self.request.user)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paiement = serializer.save(user=request.user)
        return Response({'data': PaiementSerializer(paiement).data, 'meta': {'success': True, 'message': 'Paiement enregistré avec succès'}}, status=201)

    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Endpoint pour les paiements du client connecté"""
        payments = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(payments)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class TicketSupportViewSet(BaseViewSet):
    serializer_class = TicketSupportSerializer

    def get_queryset(self):
        if self.request.user.role == 'client':
            return TicketSupport.objects.filter(user=self.request.user)
        return TicketSupport.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(user=request.user)
        return Response({'data': TicketSupportSerializer(ticket).data, 'meta': {'success': True, 'message': 'Ticket créé avec succès'}}, status=201)

    @action(detail=True, methods=['post'])
    def repondre(self, request, pk=None):
        ticket = self.get_object()
        serializer = ReponseTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reponse = serializer.save(ticket=ticket, user=request.user, est_reponse_admin=request.user.role != 'client')
        return Response({'data': ReponseTicketSerializer(reponse).data, 'meta': {'success': True, 'message': 'Réponse ajoutée avec succès'}})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        ticket = self.get_object()
        reponses = ticket.reponses.all().order_by('created_at')
        serializer = ReponseTicketSerializer(reponses, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True}})


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
        return Response({'data': None, 'meta': {'success': True, 'message': 'Notification marquée comme lue'}})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(est_lu=False).count()
        return Response({'data': {'count': count}, 'meta': {'success': True}})
