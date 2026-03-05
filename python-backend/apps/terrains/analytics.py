"""
Analytics avancés pour admin et gestionnaires
Graphiques et statistiques détaillées
"""

from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from apps.reservations.models import Reservation
from apps.payments.models import Payment
from apps.terrains.models import TerrainSynthetiquesDakar
from apps.accounts.models import User


class Analytics:
    """Classe utilitaire pour analytics"""
    
    @staticmethod
    def get_revenue_trends(gestionnaire=None, days=30):
        """Tendance des revenus sur N jours"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        qs = Reservation.objects.filter(
            statut__in=['confirmee', 'terminee'],
            created_at__gte=start_date,
            deleted_at__isnull=True
        )
        
        if gestionnaire:
            qs = qs.filter(terrain__gestionnaire=gestionnaire)
        
        daily_revenue = qs.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenus=Sum('montant_total'),
            reservations=Count('id')
        ).order_by('date')
        
        return list(daily_revenue)
    
    @staticmethod
    def get_terrain_performance(gestionnaire=None):
        """Performance par terrain (revenus, taux occupation)"""
        qs = TerrainSynthetiquesDakar.objects.filter(est_actif=True)
        
        if gestionnaire:
            qs = qs.filter(gestionnaire=gestionnaire)
        
        performance = []
        now = timezone.now()
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        for terrain in qs:
            reservations = Reservation.objects.filter(
                terrain=terrain,
                statut__in=['confirmee', 'terminee'],
                deleted_at__isnull=True
            )
            
            revenus_total = reservations.aggregate(total=Sum('montant_total'))['total'] or 0
            
            revenus_mois = reservations.filter(
                created_at__gte=debut_mois
            ).aggregate(total=Sum('montant_total'))['total'] or 0
            
            nb_reservations = reservations.count()
            
            # Taux d'occupation ce mois
            heures_reservees = Reservation.objects.filter(
                terrain=terrain,
                date_debut__gte=debut_mois,
                statut__in=['confirmee', 'en_cours'],
                deleted_at__isnull=True
            ).aggregate(total=Sum('duree_heures'))['total'] or 0
            
            jours_mois = (now - debut_mois).days + 1
            heures_disponibles = jours_mois * 24
            taux_occupation = (heures_reservees / heures_disponibles * 100) if heures_disponibles > 0 else 0
            
            performance.append({
                'terrain_id': terrain.id,
                'terrain_nom': terrain.nom,
                'revenus_total': float(revenus_total),
                'revenus_mois': float(revenus_mois),
                'nb_reservations': nb_reservations,
                'taux_occupation': round(taux_occupation, 2),
                'prix_moyen': float(revenus_total / nb_reservations) if nb_reservations > 0 else 0,
            })
        
        return sorted(performance, key=lambda x: x['revenus_total'], reverse=True)
    
    @staticmethod
    def get_user_statistics():
        """Statistiques utilisateurs globales"""
        total_users = User.objects.count()
        
        by_role = User.objects.values('role').annotate(count=Count('id'))
        by_status = User.objects.values('est_actif').annotate(count=Count('id'))
        
        # Nouveaux utilisateurs (7 derniers jours)
        seven_days_ago = timezone.now() - timedelta(days=7)
        new_users = User.objects.filter(created_at__gte=seven_days_ago).count()
        
        # Utilisateurs actifs (avec réservations récentes)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_users = User.objects.filter(
            reservations__created_at__gte=thirty_days_ago
        ).distinct().count()
        
        return {
            'total': total_users,
            'by_role': list(by_role),
            'by_status': list(by_status),
            'new_last_7_days': new_users,
            'active_last_30_days': active_users,
        }
    
    @staticmethod
    def get_popular_times():
        """Heures de réservation les plus populaires"""
        from django.db.models.functions import ExtractHour
        
        reservations = Reservation.objects.filter(
            deleted_at__isnull=True
        ).annotate(
            hour=ExtractHour('date_debut')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        return list(reservations)
    
    @staticmethod
    def get_payment_methods_breakdown():
        """Répartition des méthodes de paiement"""
        payments = Payment.objects.filter(
            statut='reussi'
        ).values('methode').annotate(
            count=Count('id'),
            total=Sum('montant')
        )
        
        return list(payments)
    
    @staticmethod
    def get_top_clients(limit=10):
        """Top clients par dépenses"""
        clients = User.objects.filter(
            role='client'
        ).annotate(
            total_depenses=Sum(
                'reservations__montant_total',
                filter=Q(reservations__statut__in=['confirmee', 'terminee'])
            ),
            nb_reservations=Count(
                'reservations',
                filter=Q(reservations__deleted_at__isnull=True)
            )
        ).filter(
            total_depenses__gt=0
        ).order_by('-total_depenses')[:limit]
        
        return [{
            'user_id': c.id,
            'nom_complet': f"{c.prenom} {c.nom}",
            'email': c.email,
            'total_depenses': float(c.total_depenses or 0),
            'nb_reservations': c.nb_reservations,
        } for c in clients]
    
    @staticmethod
    def get_monthly_comparison(months=6):
        """Comparaison mensuelle revenus et réservations"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=months * 31)
        
        monthly_data = Reservation.objects.filter(
            statut__in=['confirmee', 'terminee'],
            created_at__gte=start_date,
            deleted_at__isnull=True
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenus=Sum('montant_total'),
            reservations=Count('id'),
            revenus_moyen=Avg('montant_total')
        ).order_by('month')
        
        return list(monthly_data)
