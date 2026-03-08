from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from django.utils import timezone

from apps.terrains.models import TerrainSynthetiquesDakar
from apps.terrains.serializers import TerrainSerializer
from apps.payments.models import Payment
from apps.payments.serializers import PaymentSerializer
from apps.accounts.models import User
from apps.reservations.models import Reservation
from apps.notifications.firebase_service import (
    notify_reservation_validation_client,
    notify_reservation_refused_client,
)
from .exports import generate_reservations_excel_response, generate_statistiques_pdf_response, ManagerExports
from .serializers import ManagerReservationSerializer


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
        from apps.reservations.models import Reservation
        from apps.payments.models import Payment
        from django.db.models import Count, Sum, Q
        from django.utils import timezone
        from datetime import timedelta
        
        terrain = self.get_object()
        now = timezone.now()
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Statistiques réservations
        reservations_total = Reservation.objects.filter(
            terrain=terrain,
            deleted_at__isnull=True
        ).count()
        
        reservations_ce_mois = Reservation.objects.filter(
            terrain=terrain,
            created_at__gte=debut_mois,
            deleted_at__isnull=True
        ).count()
        
        # Statistiques revenus
        revenus_total = Reservation.objects.filter(
            terrain=terrain,
            statut__in=['confirmee', 'terminee'],
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0
        
        revenus_ce_mois = Reservation.objects.filter(
            terrain=terrain,
            statut__in=['confirmee', 'terminee'],
            created_at__gte=debut_mois,
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0
        
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
        
        stats = {
            'reservations_total': reservations_total,
            'reservations_ce_mois': reservations_ce_mois,
            'revenus_total': float(revenus_total),
            'revenus_ce_mois': float(revenus_ce_mois),
            'taux_occupation': round(taux_occupation, 2),
            'heures_reservees_mois': heures_reservees,
        }
        return Response({'data': stats, 'meta': {'success': True}})


class ManagerStatsViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        from apps.reservations.models import Reservation
        from apps.payments.models import Payment
        from apps.accounts.models import User
        from django.db.models import Sum, Count
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        now = timezone.now()
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Filtrer selon le rôle
        if user.role == 'gestionnaire':
            terrains = TerrainSynthetiquesDakar.objects.filter(gestionnaire=user)
        else:
            terrains = TerrainSynthetiquesDakar.objects.all()
        
        terrains_count = terrains.count()
        terrains_actifs = terrains.filter(est_actif=True).count()
        
        # Réservations
        reservations_mois = Reservation.objects.filter(
            terrain__in=terrains,
            created_at__gte=debut_mois,
            deleted_at__isnull=True
        ).count()
        
        # Revenus
        revenus_mensuel = Reservation.objects.filter(
            terrain__in=terrains,
            statut__in=['confirmee', 'terminee'],
            created_at__gte=debut_mois,
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0
        
        # Clients uniques
        clients_count = Reservation.objects.filter(
            terrain__in=terrains,
            deleted_at__isnull=True
        ).values('user').distinct().count()
        
        # Prochaines réservations
        prochaines = Reservation.objects.filter(
            terrain__in=terrains,
            date_debut__gte=now,
            statut='confirmee',
            deleted_at__isnull=True
        ).select_related('terrain', 'user').order_by('date_debut')[:5]
        
        prochaines_data = [{
            'id': r.id,
            'terrain_nom': r.terrain.nom,
            'client_nom': f"{r.user.prenom} {r.user.nom}",
            'date_debut': r.date_debut.isoformat(),
            'montant': float(r.montant_total)
        } for r in prochaines]
        
        stats = {
            'total_terrains': terrains_count,
            'terrains_actifs': terrains_actifs,
            'reservations_mois': reservations_mois,
            'revenus_mois': float(revenus_mensuel),
            'clients_count': clients_count,
            'prochaines_reservations': prochaines_data,
        }
        return Response({'data': stats, 'meta': {'success': True}})

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        from apps.reservations.models import Reservation
        from django.db.models import Sum
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        now = timezone.now()
        
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        debut_mois_precedent = (debut_mois - timedelta(days=1)).replace(day=1)
        
        if user.role == 'gestionnaire':
            terrains = TerrainSynthetiquesDakar.objects.filter(gestionnaire=user)
        else:
            terrains = TerrainSynthetiquesDakar.objects.all()
        
        # Total tous temps
        total = Reservation.objects.filter(
            terrain__in=terrains,
            statut__in=['confirmee', 'terminee'],
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0
        
        # Ce mois
        ce_mois = Reservation.objects.filter(
            terrain__in=terrains,
            statut__in=['confirmee', 'terminee'],
            created_at__gte=debut_mois,
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0
        
        # Mois précédent
        mois_precedent = Reservation.objects.filter(
            terrain__in=terrains,
            statut__in=['confirmee', 'terminee'],
            created_at__gte=debut_mois_precedent,
            created_at__lt=debut_mois,
            deleted_at__isnull=True
        ).aggregate(total=Sum('montant_total'))['total'] or 0
        
        # Revenus par terrain
        revenus_par_terrain = []
        for terrain in terrains[:10]:  # Top 10
            revenus = Reservation.objects.filter(
                terrain=terrain,
                statut__in=['confirmee', 'terminee'],
                deleted_at__isnull=True
            ).aggregate(total=Sum('montant_total'))['total'] or 0
            
            nb_resa = Reservation.objects.filter(
                terrain=terrain,
                deleted_at__isnull=True
            ).count()
            
            revenus_par_terrain.append({
                'terrain_nom': terrain.nom,
                'revenus': float(revenus),
                'reservations_count': nb_resa
            })
        
        revenue_stats = {
            'revenus_total': float(total),
            'revenus_mois_actuel': float(ce_mois),
            'revenus_mois_precedent': float(mois_precedent),
            'evolution': round(((ce_mois - mois_precedent) / mois_precedent * 100) if mois_precedent > 0 else 0, 2),
            'revenus_par_terrain': sorted(revenus_par_terrain, key=lambda x: x['revenus'], reverse=True),
        }
        return Response({'data': revenue_stats, 'meta': {'success': True}})


class ManagerValidationViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ManagerReservationSerializer

    def get_queryset(self):
        base_qs = Reservation.objects.select_related('terrain', 'terrain__gestionnaire', 'user').filter(deleted_at__isnull=True)
        user = self.request.user
        if user.role == 'gestionnaire':
            return base_qs.filter(terrain__gestionnaire=user)
        if user.role in ['admin', 'superuser']:
            return base_qs
        return base_qs.none()

    def _get_reservation(self, pk):
        try:
            return self.get_queryset().get(pk=pk)
        except Reservation.DoesNotExist:
            return None

    @action(detail=False, methods=['get'])
    def pending(self, request):
        queryset = self.get_queryset().filter(statut='en_attente_validation').order_by('date_debut')
        serializer = self.get_serializer(queryset, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True}})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        reservation = self._get_reservation(pk)
        if reservation is None:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Réservation introuvable'}}, status=status.HTTP_404_NOT_FOUND)

        if reservation.statut != 'en_attente_validation':
            return Response({'data': None, 'meta': {'success': False, 'message': 'Cette réservation a déjà été traitée'}}, status=status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('notes', '').strip()
        reservation.statut = 'en_attente'
        reservation.valide_par = request.user
        reservation.date_validation = timezone.now()
        reservation.validation_notes = notes
        reservation.save()

        notify_reservation_validation_client(reservation.user, reservation)
        serializer = self.get_serializer(reservation)
        return Response({'data': serializer.data, 'meta': {'success': True, 'message': 'Réservation approuvée - acompte autorisé'}})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reservation = self._get_reservation(pk)
        if reservation is None:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Réservation introuvable'}}, status=status.HTTP_404_NOT_FOUND)

        if reservation.statut not in ['en_attente_validation', 'en_attente']:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Cette réservation ne peut pas être refusée'}}, status=status.HTTP_400_BAD_REQUEST)

        motif = request.data.get('motif', '').strip() or 'Réservation refusée par le gestionnaire'
        reservation.statut = 'refusee'
        reservation.valide_par = request.user
        reservation.date_validation = timezone.now()
        reservation.validation_notes = motif
        reservation.save()

        notify_reservation_refused_client(reservation.user, reservation, motif=motif)
        serializer = self.get_serializer(reservation)
        return Response({'data': serializer.data, 'meta': {'success': True, 'message': 'Réservation refusée'}})

    @action(detail=False, methods=['post'])
    def validate_ticket(self, request):
        from apps.reservations.models import Reservation
        ticket_code = request.data.get('ticket_code')
        qr_token = request.data.get('qr_token')
        
        if not ticket_code and not qr_token:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Code ticket ou QR token requis'}}, status=400)
        
        try:
            if qr_token:
                reservation = Reservation.objects.select_related('terrain', 'user').get(qr_code_token=qr_token)
            else:
                reservation = Reservation.objects.select_related('terrain', 'user').get(code_ticket=ticket_code)
            
            if not reservation.est_valide:
                return Response({'data': None, 'meta': {'success': False, 'message': 'Réservation non valide ou expirée'}}, status=400)
            
            reservation.statut = 'en_cours'
            reservation.save()
            
            return Response({
                'data': {
                    'valid': True,
                    'reservation': {
                        'id': reservation.id,
                        'terrain_nom': reservation.terrain.nom,
                        'client_nom': f"{reservation.user.prenom} {reservation.user.nom}",
                        'date_debut': reservation.date_debut.isoformat(),
                        'date_fin': reservation.date_fin.isoformat() if reservation.date_fin else None,
                        'code_ticket': reservation.code_ticket,
                        'montant': float(reservation.montant_total) if reservation.montant_total else 0,
                    }
                },
                'meta': {'success': True, 'message': 'Ticket validé avec succès'}
            })
        except Reservation.DoesNotExist:
            return Response({'data': {'valid': False}, 'meta': {'success': False, 'message': 'Code ticket invalide'}}, status=404)

    @action(detail=False, methods=['get'])
    def validation_history(self, request):
        # Implémenter l'historique de validation
        history = []
        return Response({'data': history, 'meta': {'success': True}})


class ManagerExportsViewSet(viewsets.GenericViewSet):
    """Endpoints pour exporter les données gestionnaire en Excel/PDF"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def reservations_excel(self, request):
        """Export Excel des réservations"""
        if request.user.role != 'gestionnaire':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Accès réservé aux gestionnaires'}
            }, status=403)
        
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        # Convertir dates si fournies
        from datetime import datetime
        if date_debut:
            date_debut = datetime.strptime(date_debut, '%Y-%m-%d')
        if date_fin:
            date_fin = datetime.strptime(date_fin, '%Y-%m-%d')
        
        return generate_reservations_excel_response(request.user, date_debut, date_fin)
    
    @action(detail=False, methods=['get'])
    def statistiques_pdf(self, request):
        """Export PDF des statistiques mensuelles"""
        if request.user.role != 'gestionnaire':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Accès réservé aux gestionnaires'}
            }, status=403)
        
        mois = request.query_params.get('mois')
        annee = request.query_params.get('annee')
        
        if mois:
            mois = int(mois)
        if annee:
            annee = int(annee)
        
        return generate_statistiques_pdf_response(request.user, mois, annee)
    
    @action(detail=False, methods=['get'])
    def paiements_excel(self, request):
        """Export Excel des paiements"""
        if request.user.role != 'gestionnaire':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Accès réservé aux gestionnaires'}
            }, status=403)
        
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        from datetime import datetime
        if date_debut:
            date_debut = datetime.strptime(date_debut, '%Y-%m-%d')
        if date_fin:
            date_fin = datetime.strptime(date_fin, '%Y-%m-%d')
        
        output = ManagerExports.export_paiements_excel(request.user, date_debut, date_fin)
        
        from django.utils import timezone
        filename = f"paiements_{request.user.id}_{timezone.now().strftime('%Y%m%d')}.xlsx"
        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
