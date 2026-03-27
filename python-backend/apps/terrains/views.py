from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

from .models import (
    Abonnement,
    DemandeAbonnement,
    Notification,
    PlanAbonnement,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
    ReponseTicket,
    Commission,
    PaiementAbonnement,
)
from .serializers import (
    AbonnementSerializer,
    DemandeAbonnementSerializer,
    NotificationSerializer,
    PlanAbonnementSerializer,
    SouscriptionSerializer,
    TerrainSerializer,
    TicketSupportSerializer,
    ReponseTicketSerializer,
    CommissionSerializer,
    PaiementAbonnementSerializer,
)
from apps.payments.models import Payment
from apps.payments.serializers import PaymentSerializer


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
    queryset = TerrainSynthetiquesDakar.objects.all()
    serializer_class = TerrainSerializer

    def get_queryset(self):
        base_qs = TerrainSynthetiquesDakar.objects.all()
        request = getattr(self, 'request', None)
        user = None

        if request is not None:
            user = request.user if hasattr(request, 'user') else None

        # Les admins voient tous les terrains (actifs et inactifs) sans parametre
        if user and user.is_authenticated and getattr(user, 'role', None) == 'admin':
            return base_qs

        # Les gestionnaires peuvent voir les inactifs avec include_inactive=true
        include_param = request.query_params.get('include_inactive') if request else None
        include_inactive = str(include_param).lower() in ['1', 'true', 'yes']
        if include_inactive and user and user.is_authenticated and getattr(user, 'role', None) == 'gestionnaire':
            return base_qs

        return base_qs.filter(est_actif=True)
        return base_qs.filter(est_actif=True)

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Endpoint pour obtenir tous les terrains sans pagination"""
        terrains = self.get_queryset()
        serializer = self.get_serializer(terrains, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True}})

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Endpoint pour obtenir les détails complets d'un terrain"""
        terrain = self.get_object()
        serializer = self.get_serializer(terrain)
        return Response({'data': serializer.data, 'meta': {'success': True}})

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.AllowAny],
        url_path='all-for-map'
    )
    def all_for_map(self, request):
        """Endpoint pour la carte - retourne tous les terrains avec coordonnées (actifs et inactifs)"""
        from apps.reservations.models import Reservation
        from django.utils import timezone
        from django.db.models import Q
        
        # Pour la carte publique, on montre tous les terrains (actifs et inactifs)
        terrains = TerrainSynthetiquesDakar.objects.all().select_related('gestionnaire')
        terrain_data = []
        
        now = timezone.now()
        
        for terrain in terrains:
            if not terrain.latitude or not terrain.longitude:
                continue
                
            reservations_actives = Reservation.objects.filter(
                terrain=terrain,
                statut__in=['confirmee', 'en_cours'],
                date_debut__lte=now,
                date_fin__gte=now,
                deleted_at__isnull=True
            ).exists()
            
            terrain_dict = self.get_serializer(terrain).data
            terrain_dict['statut_reservation'] = 'reserve' if reservations_actives else 'libre'
            terrain_data.append(terrain_dict)
        
        stats = {
            'total': len(terrain_data),
            'libres': sum(1 for t in terrain_data if t.get('statut_reservation') == 'libre'),
            'reserves': sum(1 for t in terrain_data if t.get('statut_reservation') == 'reserve'),
            'fermes': 0
        }
        
        return Response({
            'data': terrain_data,
            'meta': {
                'success': True,
                'libres': stats['libres'],
                'reserves': stats['reserves'],
                'fermes': stats['fermes']
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def nearby(self, request):
        """Recherche des terrains à proximité d'une position"""
        from math import radians, cos, sin, asin, sqrt
        
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
            radius = float(request.query_params.get('radius', 10))  # km
        except (TypeError, ValueError):
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Paramètres lat, lng requis (nombres)'}
            }, status=400)
        
        def haversine_distance(lat1, lon1, lat2, lon2):
            """Calcule la distance en km entre deux points GPS"""
            R = 6371  # Rayon de la Terre en km
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return R * c
        
        terrains = self.get_queryset().filter(
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        terrains_proches = []
        for terrain in terrains:
            distance = haversine_distance(lat, lng, float(terrain.latitude), float(terrain.longitude))
            if distance <= radius:
                terrain_dict = self.get_serializer(terrain).data
                terrain_dict['distance'] = round(distance, 2)
                terrains_proches.append(terrain_dict)
        
        # Trier par distance
        terrains_proches.sort(key=lambda x: x['distance'])
        
        return Response({
            'data': terrains_proches,
            'meta': {
                'success': True,
                'count': len(terrains_proches),
                'radius_km': radius
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search_location(self, request):
        """Recherche des terrains par nom de lieu/quartier"""
        from django.db.models import Q
        
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Paramètre q requis'}
            }, status=400)
        
        terrains = self.get_queryset().filter(
            Q(adresse__icontains=query) |
            Q(nom__icontains=query)
        )
        
        serializer = self.get_serializer(terrains, many=True)
        
        return Response({
            'data': serializer.data,
            'meta': {
                'success': True,
                'count': terrains.count(),
                'query': query
            }
        })


class PlanAbonnementViewSet(BaseViewSet):
    serializer_class = PlanAbonnementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = PlanAbonnement.objects.select_related('terrain')
        terrain_id = self.request.query_params.get('terrain_id')
        if terrain_id:
            queryset = queryset.filter(terrain_id=terrain_id)

        user = getattr(self.request, 'user', None)
        user_role = getattr(user, 'role', None) if user and user.is_authenticated else None
        if user_role not in ['admin', 'gestionnaire']:
            queryset = queryset.filter(actif=True, terrain__est_actif=True)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='public')
    def public_plans(self, request):
        queryset = PlanAbonnement.objects.select_related('terrain').filter(actif=True, terrain__est_actif=True)
        terrain_id = request.query_params.get('terrain_id')
        if terrain_id:
            queryset = queryset.filter(terrain_id=terrain_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True, 'count': len(serializer.data)}})


class DemandeAbonnementViewSet(BaseViewSet):
    serializer_class = DemandeAbonnementSerializer

    def get_queryset(self):
        queryset = DemandeAbonnement.objects.select_related('terrain', 'plan', 'user', 'terrain__gestionnaire')
        user = getattr(self.request, 'user', None)
        if not user or not user.is_authenticated:
            return DemandeAbonnement.objects.none()

        role = getattr(user, 'role', None)
        if role == 'client':
            return queryset.filter(user=user)
        if role == 'gestionnaire':
            return queryset.filter(terrain__gestionnaire=user)
        return queryset

    def perform_create(self, serializer):
        plan = serializer.validated_data['plan']
        nb_seances = serializer.validated_data.get('nb_seances') or 1
        prix_brut = plan.prix * nb_seances
        reduction = float(plan.reduction_percent or 0)
        prix_calcule = prix_brut * (1 - reduction / 100)
        demande = serializer.save(
            user=self.request.user,
            terrain=plan.terrain,
            prix_calcule=prix_calcule,
        )
        # Envoyer notification push aux gestionnaires/admins
        try:
            from apps.notifications.services import notify_new_subscription_request
            notify_new_subscription_request(demande)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Erreur envoi notification: {e}")

    def _user_can_manage(self, user):
        return bool(user and user.is_authenticated and getattr(user, 'role', None) in ['admin', 'gestionnaire'])

    @action(detail=True, methods=['post'])
    def confirmer_disponibilite(self, request, pk=None):
        demande = self.get_object()
        if not self._user_can_manage(request.user):
            return Response({'meta': {'success': False, 'message': 'Accès refusé'}}, status=403)

        old_status = demande.statut
        disponibilite = request.data.get('disponibilite_confirmee', True)
        notes = request.data.get('notes_manager')
        demande.disponibilite_confirmee = bool(disponibilite)
        if notes is not None:
            demande.notes_manager = notes
        if demande.disponibilite_confirmee and demande.statut == 'pending_manager':
            demande.statut = 'pending_payment'
        demande.save(update_fields=['disponibilite_confirmee', 'notes_manager', 'statut', 'updated_at'])
        
        # Notifier le client du changement de statut
        if old_status != demande.statut:
            try:
                from apps.notifications.services import notify_subscription_status_change
                notify_subscription_status_change(demande, old_status)
            except Exception:
                pass
        
        return Response({'data': DemandeAbonnementSerializer(demande).data, 'meta': {'success': True}})

    @action(detail=True, methods=['post'], url_path='changer-statut')
    def changer_statut(self, request, pk=None):
        if not self._user_can_manage(request.user):
            return Response({'meta': {'success': False, 'message': 'Accès refusé'}}, status=403)

        nouveau_statut = request.data.get('statut')
        choix_valides = dict(DemandeAbonnement.STATUT_CHOICES).keys()
        if nouveau_statut not in dict(DemandeAbonnement.STATUT_CHOICES):
            return Response({'meta': {'success': False, 'message': 'Statut invalide'}}, status=400)

        demande = self.get_object()
        old_status = demande.statut
        demande.statut = nouveau_statut
        notes = request.data.get('notes_manager')
        if notes is not None:
            demande.notes_manager = notes
        demande.save(update_fields=['statut', 'notes_manager', 'updated_at'])
        
        # Notifier le client du changement de statut
        if old_status != demande.statut:
            try:
                from apps.notifications.services import notify_subscription_status_change
                notify_subscription_status_change(demande, old_status)
            except Exception:
                pass
        
        return Response({'data': DemandeAbonnementSerializer(demande).data, 'meta': {'success': True}})

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        demande = self.get_object()
        if demande.user != request.user:
            return Response({'meta': {'success': False, 'message': 'Vous ne pouvez pas annuler cette demande'}}, status=403)
        demande.statut = 'cancelled'
        demande.save(update_fields=['statut', 'updated_at'])
        return Response({'data': DemandeAbonnementSerializer(demande).data, 'meta': {'success': True}})


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

    @action(detail=True, methods=['post'])
    def souscrire(self, request, pk=None):
        """Souscrire à un abonnement existant (crée une Souscription)"""
        from django.utils import timezone
        from datetime import timedelta

        abonnement = self.get_object()
        duree_jours = abonnement.date_fin and abonnement.date_debut and (abonnement.date_fin - abonnement.date_debut).days or 30

        date_debut = timezone.now()
        date_fin = date_debut + timedelta(days=duree_jours)

        souscription = Souscription.objects.create(
            user=request.user,
            abonnement=abonnement,
            date_debut=date_debut,
            date_fin=date_fin,
            statut='active',
        )

        return Response({
            'data': {
                'id': souscription.id,
                'abonnement_id': abonnement.id,
                'terrain_nom': abonnement.terrain.nom if abonnement.terrain else '',
                'prix_total': float(abonnement.prix),
                'type_abonnement': abonnement.type_abonnement,
                'date_debut': date_debut.isoformat(),
                'date_fin': date_fin.isoformat(),
                'statut': souscription.statut,
                'preferences': request.data.get('preferences', {}),
            },
            'meta': {'success': True, 'message': 'Souscription créée avec succès'}
        }, status=201)

    @action(detail=False, methods=['get'], url_path='conditions/(?P<terrain_id>[^/.]+)')
    def conditions(self, request, terrain_id=None):
        """Conditions d'abonnement d'un terrain"""
        try:
            terrain = TerrainSynthetiquesDakar.objects.get(pk=terrain_id)
        except TerrainSynthetiquesDakar.DoesNotExist:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Terrain non trouvé'}}, status=404)

        return Response({
            'data': {
                'terrain_id': terrain.id,
                'terrain_nom': terrain.nom,
                'prix_heure': float(terrain.prix_heure) if terrain.prix_heure else 0,
                'conditions': {
                    'acompte_minimum': 0,
                    'conditions_abonnement': {
                        'engagement_minimum': 30,
                        'annulation': 'Annulation possible avec préavis de 48h',
                        'report': 'Report de séance possible sous 24h',
                    }
                }
            },
            'meta': {'success': True}
        })

    @action(detail=False, methods=['get'], url_path='historique/(?P<terrain_id>[^/.]+)')
    def historique(self, request, terrain_id=None):
        """Historique de réservations de l'utilisateur sur un terrain"""
        from apps.reservations.models import Reservation

        reservations = Reservation.objects.filter(
            user=request.user,
            terrain_id=terrain_id,
            deleted_at__isnull=True
        ).order_by('-date_debut')

        total = reservations.count()
        return Response({
            'data': {
                'total_reservations': total,
                'statistiques': {
                    'total_reservations': total,
                    'jours_preferes': [],
                    'creneaux_preferes': [],
                }
            },
            'meta': {'success': True}
        })

    @action(detail=False, methods=['post'], url_path='verifier-disponibilite-abonnement')
    def verifier_disponibilite_abonnement(self, request):
        """Vérifier la disponibilité des créneaux pour un abonnement"""
        nb_seances = request.data.get('nb_seances', 1)
        return Response({
            'data': {
                'disponibilite_suffisante': True,
                'creneaux_disponibles_count': nb_seances,
                'conflits_count': 0,
                'conflits_detectes': [],
            },
            'meta': {'success': True}
        })

    @action(detail=False, methods=['post'], url_path='calculer-prix')
    def calculer_prix(self, request):
        """Calculer le prix d'un abonnement"""
        terrain_id = request.data.get('terrain_id')
        nb_seances = request.data.get('nb_seances', 1)
        duree_seance = request.data.get('duree_seance', 1)

        try:
            terrain = TerrainSynthetiquesDakar.objects.get(pk=terrain_id)
            prix_heure = float(terrain.prix_heure) if terrain.prix_heure else 0
        except TerrainSynthetiquesDakar.DoesNotExist:
            prix_heure = 0

        prix_base = prix_heure * duree_seance * nb_seances * 4
        reduction = 10 if nb_seances >= 2 else 5
        prix_final = prix_base * (1 - reduction / 100)

        return Response({
            'data': {
                'prix_base': prix_base,
                'prix_final': prix_final,
                'reduction_appliquee': reduction,
                'acompte': prix_final * 0.3,
                'reste_a_payer': prix_final * 0.7,
                'prix_par_seance': prix_final / (nb_seances * 4) if nb_seances > 0 else 0,
                'total_seances': nb_seances * 4,
            },
            'meta': {'success': True}
        })


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
    """DEPRECATED: Use apps.payments endpoints instead"""
    serializer_class = PaymentSerializer

    def get_queryset(self):
        qs = Payment.objects.all()
        if self.request.user.role == 'client':
            qs = qs.filter(user=self.request.user)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paiement = serializer.save(user=request.user)
        return Response({'data': PaymentSerializer(paiement).data, 'meta': {'success': True, 'message': 'Paiement enregistré avec succès'}}, status=201)

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


class CommissionViewSet(BaseViewSet):
    """Gestion des commissions admin/gestionnaire"""
    serializer_class = CommissionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Commission.objects.all()
        elif user.role == 'gestionnaire':
            return Commission.objects.filter(gestionnaire=user)
        return Commission.objects.none()

    @action(detail=False, methods=['get'])
    def mes_commissions(self, request):
        """Commissions du gestionnaire connecté"""
        if request.user.role != 'gestionnaire':
            return Response({'data': None, 'meta': {'success': False, 'message': 'Accès réservé aux gestionnaires'}}, status=403)
        
        commissions = Commission.objects.filter(gestionnaire=request.user)
        page = self.paginate_queryset(commissions)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['get'])
    def resume(self, request):
        """Résumé des commissions (admin: tous, gestionnaire: les siennes)"""
        user = request.user
        if user.role == 'admin':
            qs = Commission.objects.all()
        elif user.role == 'gestionnaire':
            qs = Commission.objects.filter(gestionnaire=user)
        else:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Accès non autorisé'}}, status=403)

        total_due = qs.filter(statut='due').aggregate(total=Sum('montant_commission'))['total'] or 0
        total_payee = qs.filter(statut='payee').aggregate(total=Sum('montant_commission'))['total'] or 0
        total_en_retard = qs.filter(statut='en_retard').aggregate(total=Sum('montant_commission'))['total'] or 0

        return Response({
            'data': {
                'total_due': float(total_due),
                'total_payee': float(total_payee),
                'total_en_retard': float(total_en_retard),
                'nb_commissions_dues': qs.filter(statut='due').count(),
                'nb_commissions_en_retard': qs.filter(statut='en_retard').count(),
            },
            'meta': {'success': True}
        })

    @action(detail=True, methods=['post'])
    def marquer_payee(self, request, pk=None):
        """Marquer une commission comme payée (admin only)"""
        if request.user.role != 'admin':
            return Response({'data': None, 'meta': {'success': False, 'message': 'Accès réservé aux admins'}}, status=403)
        
        commission = self.get_object()
        commission.statut = 'payee'
        commission.date_paiement = timezone.now()
        commission.reference_paiement = request.data.get('reference_paiement', '')
        commission.save()
        return Response({'data': CommissionSerializer(commission).data, 'meta': {'success': True, 'message': 'Commission marquée comme payée'}})

    @action(detail=False, methods=['post'])
    def calculer(self, request):
        """Calculer les commissions pour une période donnée (admin only)"""
        from apps.reservations.models import Reservation
        from apps.payments.models import Payment
        from datetime import date
        from dateutil.relativedelta import relativedelta
        
        if request.user.role != 'admin':
            return Response({'data': None, 'meta': {'success': False, 'message': 'Accès réservé aux admins'}}, status=403)
        
        periode = request.data.get('periode', 'mensuel')
        gestionnaire_id = request.data.get('gestionnaire_id')
        
        # Calcul des dates selon la période
        today = date.today()
        if periode == 'hebdomadaire':
            date_debut = today - timedelta(days=today.weekday())
            date_fin = date_debut + timedelta(days=6)
        elif periode == 'mensuel':
            date_debut = today.replace(day=1)
            date_fin = (date_debut + relativedelta(months=1)) - timedelta(days=1)
        else:  # annuel
            date_debut = today.replace(month=1, day=1)
            date_fin = today.replace(month=12, day=31)
        
        # Récupérer les gestionnaires à traiter
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if gestionnaire_id:
            gestionnaires = User.objects.filter(id=gestionnaire_id, role='gestionnaire')
        else:
            gestionnaires = User.objects.filter(role='gestionnaire')
        
        commissions_creees = []
        
        for gestionnaire in gestionnaires:
            # Terrains du gestionnaire
            terrains = TerrainSynthetiquesDakar.objects.filter(gestionnaire=gestionnaire)
            terrains_ids = list(terrains.values_list('id', flat=True))
            
            if not terrains_ids:
                continue
            
            # Revenus réservations (paiements confirmés sur la période)
            reservations_payees = Reservation.objects.filter(
                terrain_id__in=terrains_ids,
                statut__in=['confirmee', 'terminee'],
                created_at__date__gte=date_debut,
                created_at__date__lte=date_fin
            )
            revenus_reservations = sum(r.montant_total or 0 for r in reservations_payees)
            nb_reservations = reservations_payees.count()
            
            # Revenus abonnements (demandes actives/complétées sur la période)
            demandes_abos = DemandeAbonnement.objects.filter(
                terrain_id__in=terrains_ids,
                statut__in=['active', 'completed'],
                created_at__date__gte=date_debut,
                created_at__date__lte=date_fin
            )
            revenus_abonnements = sum(d.montant_paye or 0 for d in demandes_abos)
            nb_abonnements = demandes_abos.count()
            
            revenus_total = float(revenus_reservations) + float(revenus_abonnements)
            
            if revenus_total <= 0:
                continue
            
            # Taux de commission (depuis le profil gestionnaire ou défaut 10%)
            taux = float(gestionnaire.taux_commission_defaut or 10)
            
            # Vérifier si une commission existe déjà pour cette période
            existing = Commission.objects.filter(
                gestionnaire=gestionnaire,
                periode=periode,
                date_debut_periode=date_debut,
                date_fin_periode=date_fin
            ).first()
            
            if existing:
                # Mise à jour
                existing.montant_revenus_reservations = revenus_reservations
                existing.montant_revenus_abonnements = revenus_abonnements
                existing.montant_revenus = revenus_total
                existing.nb_reservations = nb_reservations
                existing.nb_abonnements = nb_abonnements
                existing.taux_commission = taux
                existing.save()
                commissions_creees.append(existing)
            else:
                # Création
                commission = Commission.objects.create(
                    gestionnaire=gestionnaire,
                    source='mixte' if (revenus_reservations > 0 and revenus_abonnements > 0) else ('reservation' if revenus_reservations > 0 else 'abonnement'),
                    periode=periode,
                    date_debut_periode=date_debut,
                    date_fin_periode=date_fin,
                    montant_revenus_reservations=revenus_reservations,
                    montant_revenus_abonnements=revenus_abonnements,
                    montant_revenus=revenus_total,
                    nb_reservations=nb_reservations,
                    nb_abonnements=nb_abonnements,
                    taux_commission=taux
                )
                commissions_creees.append(commission)
        
        return Response({
            'data': CommissionSerializer(commissions_creees, many=True).data,
            'meta': {'success': True, 'message': f'{len(commissions_creees)} commission(s) calculée(s)'}
        })

    @action(detail=False, methods=['get'])
    def par_gestionnaire(self, request):
        """Récap des commissions par gestionnaire (admin only)"""
        if request.user.role != 'admin':
            return Response({'data': None, 'meta': {'success': False, 'message': 'Accès réservé aux admins'}}, status=403)
        
        from django.contrib.auth import get_user_model
        from django.db.models import Count
        User = get_user_model()
        
        gestionnaires = User.objects.filter(role='gestionnaire')
        recap = []
        
        for g in gestionnaires:
            commissions = Commission.objects.filter(gestionnaire=g)
            total_due = commissions.filter(statut='due').aggregate(total=Sum('montant_commission'))['total'] or 0
            total_payee = commissions.filter(statut='payee').aggregate(total=Sum('montant_commission'))['total'] or 0
            total_en_retard = commissions.filter(statut='en_retard').aggregate(total=Sum('montant_commission'))['total'] or 0
            
            recap.append({
                'gestionnaire': {
                    'id': g.id,
                    'nom': g.nom,
                    'prenom': g.prenom,
                    'email': g.email,
                    'taux_commission': float(g.taux_commission_defaut or 10)
                },
                'nb_terrains': TerrainSynthetiquesDakar.objects.filter(gestionnaire=g).count(),
                'total_due': float(total_due),
                'total_payee': float(total_payee),
                'total_en_retard': float(total_en_retard),
                'nb_commissions': commissions.count()
            })
        
        return Response({'data': recap, 'meta': {'success': True}})


class PaiementAbonnementViewSet(BaseViewSet):
    """Gestion des paiements d'abonnement (par tranche, par match)"""
    serializer_class = PaiementAbonnementSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PaiementAbonnement.objects.all()
        elif user.role == 'gestionnaire':
            terrains_ids = TerrainSynthetiquesDakar.objects.filter(gestionnaire=user).values_list('id', flat=True)
            return PaiementAbonnement.objects.filter(demande__terrain_id__in=terrains_ids)
        else:
            return PaiementAbonnement.objects.filter(demande__user=user)

    def create(self, request, *args, **kwargs):
        """Enregistrer un paiement pour une demande d'abonnement"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paiement = serializer.save()

        # Mettre à jour la demande
        demande = paiement.demande
        demande.montant_paye += paiement.montant
        
        if paiement.type_paiement == 'acompte':
            demande.statut_paiement = 'acompte_verse'
        elif paiement.type_paiement == 'seance':
            demande.nb_seances_payees += 1
            demande.statut_paiement = 'en_cours'
        elif paiement.type_paiement == 'solde':
            demande.statut_paiement = 'solde'
            demande.statut = 'completed'
        
        # Vérifier si tout est soldé
        if demande.montant_paye >= demande.prix_calcule:
            demande.statut_paiement = 'solde'
        
        demande.save()

        return Response({
            'data': PaiementAbonnementSerializer(paiement).data,
            'meta': {'success': True, 'message': 'Paiement enregistré'}
        }, status=201)

    @action(detail=False, methods=['get'], url_path='demande/(?P<demande_id>[^/.]+)')
    def paiements_demande(self, request, demande_id=None):
        """Liste des paiements pour une demande spécifique"""
        paiements = PaiementAbonnement.objects.filter(demande_id=demande_id)
        serializer = self.get_serializer(paiements, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True}})
