import logging

from django.db.models import Q, ProtectedError
from django.utils import timezone
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.terrains.models import TerrainSynthetiquesDakar, TicketSupport, Notification, Abonnement, Souscription
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
from apps.reservations.models import Reservation
from .serializers import (
    AdminAbonnementSerializer,
    AdminSouscriptionSerializer,
    AdminReservationSerializer,
)


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


logger = logging.getLogger(__name__)


class AdminUserViewSet(BaseViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.none()
    
    def partial_update(self, request, *args, **kwargs):
        """PATCH /api/admin/users/{id}/ - retourne {data, meta} pour cohérence frontend"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'message': 'Utilisateur mis à jour'}
        })
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {
                    'data': None,
                    'meta': {
                        'success': False,
                        'message': "Vous n'avez pas la permission de supprimer cet utilisateur",
                    },
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        instance = self.get_object()

        if instance.id == request.user.id:
            return Response(
                {
                    'data': None,
                    'meta': {
                        'success': False,
                        'message': 'Vous ne pouvez pas supprimer votre propre compte',
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {
                    'data': None,
                    'meta': {
                        'success': False,
                        'message': 'Impossible de supprimer cet utilisateur car des ressources y sont rattachées.',
                    },
                },
                status=status.HTTP_409_CONFLICT,
            )
        except Exception as exc:
            logger.exception('Erreur lors de la suppression utilisateur %s', instance.id)
            return Response(
                {
                    'data': None,
                    'meta': {
                        'success': False,
                        'message': "Erreur interne lors de la suppression de l'utilisateur",
                    },
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                'data': None,
                'meta': {
                    'success': True,
                    'message': "Utilisateur supprimé avec succès",
                },
            },
            status=status.HTTP_200_OK,
        )
    
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

    @action(detail=False, methods=['post'], url_path='import-csv')
    def import_csv(self, request):
        """Importer des terrains depuis un fichier CSV"""
        import csv
        import io
        
        if 'file' not in request.FILES:
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Aucun fichier fourni'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        csv_file = request.FILES['file']
        
        if not csv_file.name.endswith('.csv'):
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Le fichier doit être au format CSV'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Lire le fichier CSV
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            imported_count = 0
            errors = []
            terrain_ids = []
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Préparer les données du terrain
                    terrain_data = {
                        'nom': row.get('nom', '').strip(),
                        'description': row.get('description', '').strip(),
                        'adresse': row.get('adresse', '').strip(),
                        'latitude': row.get('latitude', '').strip(),
                        'longitude': row.get('longitude', '').strip(),
                        'prix_heure': row.get('prix_heure', '').strip(),
                        'capacite': row.get('capacite', '15').strip(),
                        'telephone': row.get('telephone', '').strip(),
                        'email': row.get('email', '').strip(),
                        'est_actif': row.get('est_actif', 'True').strip().lower() in ['true', '1', 'yes'],
                        'type_surface': row.get('type_surface', 'synthetique').strip(),
                        'nombre_joueurs': row.get('nombre_joueurs', '').strip(),
                        'eclairage': row.get('eclairage', 'True').strip().lower() in ['true', '1', 'yes'],
                        'vestiaires': row.get('vestiaires', 'True').strip().lower() in ['true', '1', 'yes'],
                        'parking': row.get('parking', 'True').strip().lower() in ['true', '1', 'yes'],
                        'douches': row.get('douches', 'False').strip().lower() in ['true', '1', 'yes'],
                        'buvette': row.get('buvette', 'False').strip().lower() in ['true', '1', 'yes'],
                    }
                    
                    # Validation des champs obligatoires
                    if not terrain_data['nom']:
                        errors.append(f"Ligne {row_num}: Le nom est obligatoire")
                        continue
                    
                    # Convertir les coordonnées GPS
                    if terrain_data['latitude'] and terrain_data['longitude']:
                        try:
                            terrain_data['latitude'] = float(terrain_data['latitude'])
                            terrain_data['longitude'] = float(terrain_data['longitude'])
                        except ValueError:
                            errors.append(f"Ligne {row_num}: Coordonnées GPS invalides")
                            continue
                    else:
                        terrain_data['latitude'] = None
                        terrain_data['longitude'] = None
                    
                    # Convertir le prix
                    if terrain_data['prix_heure']:
                        try:
                            terrain_data['prix_heure'] = float(terrain_data['prix_heure'])
                        except ValueError:
                            terrain_data['prix_heure'] = None
                    else:
                        terrain_data['prix_heure'] = None
                    
                    # Convertir la capacité
                    if terrain_data['capacite']:
                        try:
                            terrain_data['capacite'] = int(terrain_data['capacite'])
                        except ValueError:
                            terrain_data['capacite'] = 15
                    else:
                        terrain_data['capacite'] = 15
                    
                    # Créer le terrain
                    serializer = self.get_serializer(data=terrain_data)
                    if serializer.is_valid():
                        terrain = serializer.save()
                        terrain_ids.append(terrain.id)
                        imported_count += 1
                    else:
                        errors.append(f"Ligne {row_num}: {serializer.errors}")
                
                except Exception as e:
                    errors.append(f"Ligne {row_num}: {str(e)}")
            
            return Response({
                'data': {
                    'success': True,
                    'imported_count': imported_count,
                    'errors': errors,
                    'terrain_ids': terrain_ids
                },
                'meta': {
                    'success': True,
                    'message': f'{imported_count} terrain(s) importé(s) avec succès'
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.exception('Erreur lors de l\'import CSV')
            return Response({
                'data': None,
                'meta': {'success': False, 'message': f'Erreur lors de l\'import: {str(e)}'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminPaymentViewSet(BaseViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
    
    @action(detail=False, methods=['get'])
    def methods_breakdown(self, request):
        """Répartition des méthodes de paiement"""
        data = Analytics.get_payment_methods_breakdown()
        return Response({'data': data, 'meta': {'success': True}})


class AdminReservationViewSet(BaseViewSet):
    serializer_class = AdminReservationSerializer
    queryset = Reservation.objects.select_related('terrain', 'terrain__gestionnaire', 'user').prefetch_related(
        'paiement_acompte', 'paiement_solde', 'paiement'
    ).filter(deleted_at__isnull=True)

    def get_queryset(self):
        queryset = super().get_queryset()
        request = getattr(self, 'request', None)
        user = getattr(request, 'user', None)
        if not user or getattr(user, 'role', None) != 'admin':
            return Reservation.objects.none()

        params = request.query_params
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__nom__icontains=search) |
                Q(user__prenom__icontains=search) |
                Q(user__email__icontains=search) |
                Q(terrain__nom__icontains=search)
            )

        statut = params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)

        date_debut = params.get('date_debut')
        if date_debut:
            queryset = queryset.filter(date_debut__date__gte=date_debut)

        date_fin = params.get('date_fin')
        if date_fin:
            queryset = queryset.filter(date_debut__date__lte=date_fin)

        terrain_id = params.get('terrain_id')
        if terrain_id:
            queryset = queryset.filter(Q(terrain_id=terrain_id) | Q(terrain__id=terrain_id))

        probleme = params.get('probleme')
        if probleme and probleme.lower() in ['1', 'true', 'yes']:
            queryset = queryset.filter(
                Q(statut='annulee') |
                Q(paiement_acompte__statut='echoue') |
                Q(paiement_solde__statut='echoue') |
                Q(date_debut__lt=timezone.now(), statut='en_attente')
            )

        sort_by = params.get('sort_by', '-created_at')
        queryset = queryset.order_by(sort_by)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({'data': serializer.data, 'meta': {'success': True}})

    @action(detail=True, methods=['patch'], url_path='notes')
    def update_notes(self, request, pk=None):
        reservation = self.get_object()
        notes = request.data.get('notes')
        if not notes:
            return Response({'meta': {'success': False, 'message': 'Notes requises'}}, status=400)
        reservation.validation_notes = notes
        reservation.save(update_fields=['validation_notes', 'updated_at'])
        return Response({'data': self.get_serializer(reservation).data, 'meta': {'success': True, 'message': 'Notes mises à jour'}})

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        reservation = self.get_object()
        new_status = request.data.get('status')
        allowed = [choice[0] for choice in Reservation.STATUT_CHOICES]
        if new_status not in allowed:
            return Response({'meta': {'success': False, 'message': 'Statut invalide'}}, status=400)
        reservation.statut = new_status
        if new_status == 'annulee':
            reservation.date_annulation = timezone.now()
            reservation.motif_annulation = request.data.get('motif_annulation', "Annulé par l'administrateur")
        reservation.save(update_fields=['statut', 'date_annulation', 'motif_annulation', 'updated_at'])
        return Response({'data': self.get_serializer(reservation).data, 'meta': {'success': True, 'message': 'Statut mis à jour'}})


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


class AdminAbonnementViewSet(BaseViewSet):
    serializer_class = AdminAbonnementSerializer

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Abonnement.objects.select_related('user', 'terrain').all()
        return Abonnement.objects.none()


class AdminSouscriptionViewSet(BaseViewSet):
    serializer_class = AdminSouscriptionSerializer

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Souscription.objects.select_related('user', 'abonnement', 'abonnement__terrain').all()
        return Souscription.objects.none()


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
