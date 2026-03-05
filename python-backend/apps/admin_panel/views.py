from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.terrains.models import TerrainSynthetiquesDakar, Paiement, TicketSupport, Notification
from apps.terrains.serializers import (
    TerrainSerializer, 
    PaiementSerializer, 
    TicketSupportSerializer, 
    NotificationSerializer
)
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer


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


class AdminUserViewSet(BaseViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.none()


class AdminTerrainViewSet(BaseViewSet):
    serializer_class = TerrainSerializer
    queryset = TerrainSynthetiquesDakar.objects.all()


class AdminPaiementViewSet(BaseViewSet):
    serializer_class = PaiementSerializer
    queryset = Paiement.objects.all()


class AdminTicketViewSet(BaseViewSet):
    serializer_class = TicketSupportSerializer
    queryset = TicketSupport.objects.all()


class AdminNotificationViewSet(BaseViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()

    @action(detail=False, methods=['post'])
    def broadcast(self, request):
        """Envoyer une notification à tous les utilisateurs"""
        message = request.data.get('message')
        titre = request.data.get('titre')
        
        if not message or not titre:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Titre et message requis'}}, status=400)
        
        # Créer des notifications pour tous les utilisateurs
        users = User.objects.all()
        notifications = []
        for user in users:
            notifications.append(Notification(
                user=user,
                titre=titre,
                message=message,
                type='broadcast'
            ))
        
        Notification.objects.bulk_create(notifications)
        
        return Response({'data': None, 'meta': {'success': True, 'message': 'Notification envoyée à tous les utilisateurs'}})


class AdminStatsViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        stats = {
            'users_count': User.objects.count(),
            'terrains_count': TerrainSynthetiquesDakar.objects.count(),
            'paiements_count': Paiement.objects.count(),
            'tickets_count': TicketSupport.objects.count(),
            'notifications_count': Notification.objects.count(),
        }
        return Response({'data': stats, 'meta': {'success': True}})

    @action(detail=False, methods=['get'])
    def logs(self, request):
        # Implémenter les logs système
        logs = []
        return Response({'data': logs, 'meta': {'success': True}})
