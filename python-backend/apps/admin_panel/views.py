from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.terrains.models import TerrainSynthetiquesDakar, TicketSupport, Notification
from apps.terrains.serializers import (
    TerrainSerializer, 
    TicketSupportSerializer, 
    NotificationSerializer
)
from apps.terrains.analytics import Analytics
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.payments.models import Payment
from apps.payments.serializers import PaymentSerializer


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
    
    @action(detail=True, methods=['post'])
    def toggle_activation(self, request, pk=None):
        """Activer/désactiver un gestionnaire ou client"""
        user = self.get_object()
        
        if user.role == 'admin':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Impossible de désactiver un admin'}
            }, status=400)
        
        user.est_actif = not user.est_actif
        user.save()
        
        action_text = 'activé' if user.est_actif else 'désactivé'
        
        # Si gestionnaire désactivé, désactiver aussi ses terrains
        if user.role == 'gestionnaire' and not user.est_actif:
            terrains_count = TerrainSynthetiquesDakar.objects.filter(
                gestionnaire=user,
                est_actif=True
            ).update(est_actif=False)
            message = f"Gestionnaire {action_text} - {terrains_count} terrain(s) désactivé(s)"
        else:
            message = f"Utilisateur {action_text}"
        
        return Response({
            'data': UserSerializer(user).data,
            'meta': {'success': True, 'message': message}
        })
    
    @action(detail=True, methods=['post'])
    def validate_user(self, request, pk=None):
        """Valider un compte gestionnaire en attente"""
        user = self.get_object()
        
        if user.statut_validation != 'en_attente':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Utilisateur déjà traité'}
            }, status=400)
        
        action = request.data.get('action')  # 'approuver' ou 'rejeter'
        raison = request.data.get('raison', '')
        
        if action == 'approuver':
            user.statut_validation = 'valide'
            user.est_actif = True
            message = 'Compte gestionnaire approuvé'
        elif action == 'rejeter':
            user.statut_validation = 'rejete'
            message = f"Compte gestionnaire rejeté: {raison}"
        else:
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Action invalide'}
            }, status=400)
        
        user.save()
        
        # Créer notification pour l'utilisateur
        from apps.terrains.models import Notification
        Notification.objects.create(
            user=user,
            titre='Statut de votre compte',
            message=message,
            type='compte'
        )
        
        return Response({
            'data': UserSerializer(user).data,
            'meta': {'success': True, 'message': message}
        })
    
    @action(detail=False, methods=['get'])
    def pending_validations(self, request):
        """Liste des gestionnaires en attente de validation"""
        pending = User.objects.filter(
            role='gestionnaire',
            statut_validation='en_attente'
        ).order_by('-created_at')
        
        serializer = self.get_serializer(pending, many=True)
        
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'count': pending.count()}
        })
    
    @action(detail=False, methods=['get'])
    def stats_by_role(self, request):
        """Statistiques utilisateurs par rôle"""
        from django.db.models import Count, Q
        
        stats = {
            'total': User.objects.count(),
            'admins': User.objects.filter(role='admin').count(),
            'gestionnaires': User.objects.filter(role='gestionnaire').count(),
            'clients': User.objects.filter(role='client').count(),
            'actifs': User.objects.filter(est_actif=True).count(),
            'inactifs': User.objects.filter(est_actif=False).count(),
            'en_attente_validation': User.objects.filter(
                statut_validation='en_attente'
            ).count(),
        }
        
        return Response({
            'data': stats,
            'meta': {'success': True}
        })


class AdminTerrainViewSet(BaseViewSet):
    serializer_class = TerrainSerializer
    queryset = TerrainSynthetiquesDakar.objects.all()


class AdminPaymentViewSet(BaseViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
    
    @action(detail=False, methods=['get'])
    def methods_breakdown(self, request):
        """Répartition des méthodes de paiement"""
        data = Analytics.get_payment_methods_breakdown()
        return Response({'data': data, 'meta': {'success': True}})


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
        """Dashboard admin complet avec analytics"""
        from apps.reservations.models import Reservation
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Stats de base
        stats = {
            'users_count': User.objects.count(),
            'terrains_count': TerrainSynthetiquesDakar.objects.count(),
            'payments_count': Payment.objects.count(),
            'tickets_count': TicketSupport.objects.count(),
            'notifications_count': Notification.objects.count(),
        }
        
        # Réservations ce mois
        stats['reservations_mois'] = Reservation.objects.filter(
            created_at__gte=debut_mois,
            deleted_at__isnull=True
        ).count()
        
        # Revenus ce mois
        from django.db.models import Sum
        stats['revenus_mois'] = float(Reservation.objects.filter(
            created_at__gte=debut_mois,
            statut__in=['confirmee', 'terminee'],
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0)
        
        # Utilisateurs actifs (30 derniers jours)
        thirty_days_ago = now - timedelta(days=30)
        stats['users_actifs_30j'] = User.objects.filter(
            reservations__created_at__gte=thirty_days_ago
        ).distinct().count()
        
        # Tickets en attente
        stats['tickets_ouverts'] = TicketSupport.objects.filter(
            statut__in=['ouvert', 'en_cours'],
            deleted_at__isnull=True
        ).count()
        
        # Gestionnaires en attente validation
        stats['gestionnaires_en_attente'] = User.objects.filter(
            role='gestionnaire',
            statut_validation='en_attente'
        ).count()
        
        return Response({'data': stats, 'meta': {'success': True}})
    
    @action(detail=False, methods=['get'])
    def revenue_trends(self, request):
        """Tendances revenus"""
        days = int(request.query_params.get('days', 30))
        data = Analytics.get_revenue_trends(days=days)
        return Response({'data': data, 'meta': {'success': True}})
    
    @action(detail=False, methods=['get'])
    def terrain_performance(self, request):
        """Performance des terrains"""
        data = Analytics.get_terrain_performance()
        return Response({'data': data, 'meta': {'success': True}})
    
    @action(detail=False, methods=['get'])
    def user_statistics(self, request):
        """Statistiques utilisateurs détaillées"""
        data = Analytics.get_user_statistics()
        return Response({'data': data, 'meta': {'success': True}})
    
    @action(detail=False, methods=['get'])
    def top_clients(self, request):
        """Top clients par dépenses"""
        limit = int(request.query_params.get('limit', 10))
        data = Analytics.get_top_clients(limit=limit)
        return Response({'data': data, 'meta': {'success': True}})
    
    @action(detail=False, methods=['get'])
    def popular_times(self, request):
        """Heures populaires de réservation"""
        data = Analytics.get_popular_times()
        return Response({'data': data, 'meta': {'success': True}})
    
    @action(detail=False, methods=['get'])
    def monthly_comparison(self, request):
        """Comparaison mensuelle"""
        months = int(request.query_params.get('months', 6))
        data = Analytics.get_monthly_comparison(months=months)
        return Response({'data': data, 'meta': {'success': True}})

    @action(detail=False, methods=['get'])
    def logs(self, request):
        # Implémenter les logs système
        logs = []
        return Response({'data': logs, 'meta': {'success': True}})
