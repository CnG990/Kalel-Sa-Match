"""
ViewSets admin pour gérer les configurations de paiement
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from apps.payments.models_config import PaymentConfig, PaymentStats
from apps.payments.serializers_config import (
    PaymentConfigSerializer,
    PaymentStatsSerializer
)


class AdminPaymentConfigViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour gérer les comptes de réception Wave et Orange Money
    Accessible uniquement par les admins
    """
    
    queryset = PaymentConfig.objects.filter(deleted_at__isnull=True)
    serializer_class = PaymentConfigSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return PaymentConfig.objects.none()
        return super().get_queryset()
    
    def perform_destroy(self, instance):
        """Soft delete"""
        instance.soft_delete()
    
    @action(detail=True, methods=['post'])
    def toggle_activation(self, request, pk=None):
        """Activer/désactiver une méthode de paiement"""
        config = self.get_object()
        config.est_actif = not config.est_actif
        config.save()
        
        return Response({
            'data': PaymentConfigSerializer(config).data,
            'meta': {
                'success': True,
                'message': f"Méthode {config.get_methode_display()} {'activée' if config.est_actif else 'désactivée'}"
            }
        })
    
    @action(detail=False, methods=['get'])
    def active_methods(self, request):
        """Liste des méthodes de paiement actives"""
        active = PaymentConfig.get_active_methods()
        serializer = self.get_serializer(active, many=True)
        
        return Response({
            'data': serializer.data,
            'meta': {'success': True}
        })
    
    @action(detail=False, methods=['post'])
    def initialize_defaults(self, request):
        """
        Créer les configurations par défaut si elles n'existent pas
        Utilise les valeurs de Kalel Sa Match
        """
        configs_created = []
        
        # Wave Business - Kalel Sa Match
        wave_config, created = PaymentConfig.objects.get_or_create(
            methode='wave',
            defaults={
                'wave_payment_link': 'https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/',
                'wave_merchant_name': 'Kalel Sa Match',
                'wave_merchant_id': 'M_sn_OnnKDQNjnuxG',
                'est_actif': True,
                'commission_pourcentage': 0.00,
                'ordre_affichage': 1,
                'instructions': 'Scanner le QR code avec votre application Wave ou cliquer sur le lien de paiement.',
                'logo_url': 'https://www.wave.com/assets/img/logo.svg'
            }
        )
        if created:
            configs_created.append('Wave Business')
        
        if configs_created:
            message = f"Configurations créées: {', '.join(configs_created)}"
        else:
            message = "Configurations déjà existantes"
        
        return Response({
            'data': PaymentConfigSerializer(wave_config).data,
            'meta': {
                'success': True,
                'message': message
            }
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques d'utilisation des méthodes de paiement"""
        from apps.payments.models import Payment
        from django.db.models import Count, Sum, Q
        from django.utils import timezone
        from datetime import timedelta
        
        # Stats 30 derniers jours
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        stats = Payment.objects.filter(
            created_at__gte=thirty_days_ago
        ).values('methode').annotate(
            total_count=Count('id'),
            total_amount=Sum('montant'),
            success_count=Count('id', filter=Q(statut='reussi')),
            pending_count=Count('id', filter=Q(statut='en_attente')),
            failed_count=Count('id', filter=Q(statut='echoue'))
        )
        
        return Response({
            'data': list(stats),
            'meta': {'success': True, 'period': '30 derniers jours'}
        })


class AdminPaymentStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lecture seule des statistiques de paiement
    """
    
    queryset = PaymentStats.objects.all()
    serializer_class = PaymentStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return PaymentStats.objects.none()
        return super().get_queryset()
