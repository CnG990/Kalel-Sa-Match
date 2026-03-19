"""
Vues pour la gestion des litiges
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Litige, MessageLitige
from .serializers import (
    LitigeListSerializer,
    LitigeDetailSerializer,
    LitigeCreateSerializer,
    LitigeUpdateSerializer,
    MessageLitigeSerializer
)


class LitigeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des litiges
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            # Les admins voient tous les litiges
            return Litige.objects.all().select_related(
                'client', 'gestionnaire', 'admin_assigne', 'terrain', 'reservation'
            ).prefetch_related('messages')
        elif user.role == 'gestionnaire':
            # Les gestionnaires voient leurs litiges
            return Litige.objects.filter(
                gestionnaire=user
            ).select_related(
                'client', 'gestionnaire', 'admin_assigne', 'terrain', 'reservation'
            ).prefetch_related('messages')
        else:
            # Les clients voient uniquement leurs litiges
            return Litige.objects.filter(
                client=user
            ).select_related(
                'client', 'gestionnaire', 'admin_assigne', 'terrain', 'reservation'
            ).prefetch_related('messages')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LitigeListSerializer
        elif self.action == 'create':
            return LitigeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LitigeUpdateSerializer
        return LitigeDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='add-message')
    def add_message(self, request, pk=None):
        """Ajouter un message à un litige"""
        litige = self.get_object()
        
        # Vérifier les permissions
        user = request.user
        if user.role == 'client' and user != litige.client:
            return Response({
                'detail': 'Vous ne pouvez pas commenter ce litige'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if user.role == 'gestionnaire' and user != litige.gestionnaire:
            return Response({
                'detail': 'Ce litige ne vous concerne pas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Créer le message
        contenu = request.data.get('contenu')
        if not contenu:
            return Response({
                'detail': 'Le contenu du message est requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        est_interne = request.data.get('est_interne', False)
        if est_interne and user.role != 'admin':
            est_interne = False
        
        message = MessageLitige.objects.create(
            litige=litige,
            auteur=user,
            contenu=contenu,
            est_interne=est_interne,
            pieces_jointes=request.data.get('pieces_jointes', [])
        )
        
        # Mettre à jour le statut du litige si nécessaire
        if litige.statut == 'ouvert' and user.role in ['gestionnaire', 'admin']:
            litige.statut = 'en_cours'
            litige.save()
        
        serializer = MessageLitigeSerializer(message)
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'message': 'Message ajouté avec succès'}
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='resoudre')
    def resoudre(self, request, pk=None):
        """Marquer un litige comme résolu (admin seulement)"""
        if request.user.role != 'admin':
            return Response({
                'detail': 'Seuls les admins peuvent résoudre des litiges'
            }, status=status.HTTP_403_FORBIDDEN)
        
        litige = self.get_object()
        
        litige.statut = 'resolu'
        litige.date_resolution = timezone.now()
        litige.resolution = request.data.get('resolution', '')
        litige.montant_rembourse = request.data.get('montant_rembourse')
        litige.save()
        
        serializer = self.get_serializer(litige)
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'message': 'Litige résolu avec succès'}
        })
    
    @action(detail=True, methods=['post'], url_path='fermer')
    def fermer(self, request, pk=None):
        """Fermer un litige"""
        litige = self.get_object()
        user = request.user
        
        # Vérifier les permissions
        if user.role == 'client' and user != litige.client:
            return Response({
                'detail': 'Vous ne pouvez pas fermer ce litige'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if user.role == 'gestionnaire' and user != litige.gestionnaire:
            return Response({
                'detail': 'Ce litige ne vous concerne pas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Seuls les litiges résolus peuvent être fermés (sauf admin)
        if litige.statut != 'resolu' and user.role != 'admin':
            return Response({
                'detail': 'Le litige doit être résolu avant d\'être fermé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        litige.statut = 'ferme'
        if not litige.date_resolution:
            litige.date_resolution = timezone.now()
        litige.save()
        
        serializer = self.get_serializer(litige)
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'message': 'Litige fermé avec succès'}
        })
    
    @action(detail=True, methods=['post'], url_path='escalader')
    def escalader(self, request, pk=None):
        """Escalader le litige au niveau supérieur"""
        litige = self.get_object()
        user = request.user
        
        # Vérifier les permissions
        if user.role == 'client' and user != litige.client:
            return Response({
                'detail': 'Vous ne pouvez pas escalader ce litige'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if user.role == 'gestionnaire' and user != litige.gestionnaire:
            return Response({
                'detail': 'Ce litige ne vous concerne pas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Escalader selon le niveau actuel
        if litige.niveau_escalade == 'client':
            litige.niveau_escalade = 'gestionnaire'
            message_text = 'Litige escaladé au gestionnaire'
        elif litige.niveau_escalade == 'gestionnaire':
            litige.niveau_escalade = 'admin'
            message_text = 'Litige escaladé à l\'administration'
        else:
            return Response({
                'detail': 'Litige déjà au niveau maximum'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        litige.statut = 'escalade'
        litige.save()
        
        # Créer un message d'action
        MessageLitige.objects.create(
            litige=litige,
            auteur=user,
            contenu=message_text,
            est_interne=False
        )
        
        serializer = self.get_serializer(litige)
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'message': message_text}
        })
    
    @action(detail=True, methods=['post'], url_path='assigner')
    def assigner(self, request, pk=None):
        """Assigner un admin à un litige (admin seulement)"""
        if request.user.role != 'admin':
            return Response({
                'detail': 'Seuls les admins peuvent assigner des litiges'
            }, status=status.HTTP_403_FORBIDDEN)
        
        litige = self.get_object()
        
        admin_id = request.data.get('admin_id')
        if admin_id:
            from apps.accounts.models import User
            try:
                admin = User.objects.get(id=admin_id, role='admin')
                litige.admin_assigne = admin
                litige.save()
            except User.DoesNotExist:
                return Response({
                    'detail': 'Admin non trouvé'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            litige.admin_assigne = request.user
            litige.save()
        
        serializer = self.get_serializer(litige)
        return Response({
            'data': serializer.data,
            'meta': {'success': True, 'message': 'Litige assigné avec succès'}
        })


class MessageLitigeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour lire les messages de litige
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MessageLitigeSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        queryset = MessageLitige.objects.select_related('litige', 'auteur')
        
        # Filtrer les messages selon le rôle
        if user.role == 'admin':
            # Les admins voient tout
            pass
        elif user.role == 'gestionnaire':
            # Les gestionnaires voient les messages de leurs litiges (sauf internes)
            queryset = queryset.filter(
                litige__gestionnaire=user,
                est_interne=False
            )
        else:
            # Les clients voient les messages de leurs litiges (sauf internes)
            queryset = queryset.filter(
                litige__client=user,
                est_interne=False
            )
        
        # Filtrer par litige si spécifié
        litige_id = self.request.query_params.get('litige_id')
        if litige_id:
            queryset = queryset.filter(litige_id=litige_id)
        
        return queryset.order_by('created_at')
