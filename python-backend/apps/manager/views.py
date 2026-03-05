from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.terrains.models import TerrainSynthetiquesDakar, Paiement
from apps.terrains.serializers import TerrainSerializer, PaiementSerializer
from apps.accounts.models import User


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
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


class ManagerTerrainViewSet(BaseViewSet):
    serializer_class = TerrainSerializer

    def get_queryset(self):
        if self.request.user.role == 'gestionnaire':
            return TerrainSynthetiquesDakar.objects.filter(gestionnaire=self.request.user)
        return TerrainSynthetiquesDakar.objects.all()

    @action(detail=True, methods=['put'])
    def prix_capacite(self, request, pk=None):
        terrain = self.get_object()
        prix_heure = request.data.get('prix_heure')
        capacite = request.data.get('capacite')
        
        if prix_heure is not None:
            terrain.prix_heure = prix_heure
        if capacite is not None:
            terrain.capacite = capacite
        
        terrain.save()
        return Response({'data': TerrainSerializer(terrain).data, 'meta': {'success': True, 'message': 'Prix/capacité mis à jour'}})

    @action(detail=True, methods=['put'])
    def toggle_disponibilite(self, request, pk=None):
        terrain = self.get_object()
        terrain.est_actif = not terrain.est_actif
        terrain.save()
        return Response({'data': TerrainSerializer(terrain).data, 'meta': {'success': True, 'message': 'Disponibilité modifiée'}})

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        terrain = self.get_object()
        # Implémenter la logique des statistiques
        stats = {
            'reservations_total': 0,  # À calculer
            'reservations_ce_mois': 0,  # À calculer
            'revenus_total': 0,  # À calculer
            'revenus_ce_mois': 0,  # À calculer
        }
        return Response({'data': stats, 'meta': {'success': True}})


class ManagerStatsViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        # Implémenter les statistiques du dashboard
        stats = {
            'terrains_count': 0,
            'reservations_count': 0,
            'revenus_mensuel': 0,
            'clients_count': 0,
        }
        return Response({'data': stats, 'meta': {'success': True}})

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        # Implémenter les statistiques de revenus
        revenue_stats = {
            'total': 0,
            'ce_mois': 0,
            'mois_precedent': 0,
        }
        return Response({'data': revenue_stats, 'meta': {'success': True}})


class ManagerValidationViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def validate_ticket(self, request):
        ticket_code = request.data.get('ticket_code')
        # Implémenter la validation de ticket
        return Response({'data': None, 'meta': {'success': True, 'message': 'Ticket validé'}})

    @action(detail=False, methods=['get'])
    def validation_history(self, request):
        # Implémenter l'historique de validation
        history = []
        return Response({'data': history, 'meta': {'success': True}})
