"""
Vues d'administration pour la gestion des utilisateurs
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import User
from .serializers import UserSerializer


class UserPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'per_page'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    Liste tous les utilisateurs avec pagination et filtres
    """
    # Vérifier que l'utilisateur est admin
    if request.user.role != 'admin':
        return Response({
            'detail': 'Vous n\'avez pas la permission d\'accéder à cette ressource'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Récupérer les paramètres de requête
    search = request.GET.get('search', '').strip()
    role_filter = request.GET.get('role', '').strip()
    statut_filter = request.GET.get('statut', '').strip()
    
    # Construire la requête
    queryset = User.objects.all().order_by('-created_at')
    
    # Appliquer les filtres
    if search:
        queryset = queryset.filter(
            Q(nom__icontains=search) |
            Q(prenom__icontains=search) |
            Q(email__icontains=search) |
            Q(telephone__icontains=search)
        )
    
    if role_filter and role_filter != 'all':
        queryset = queryset.filter(role=role_filter)
    
    if statut_filter and statut_filter != 'all':
        queryset = queryset.filter(statut_validation=statut_filter)
    
    # Paginer les résultats
    paginator = UserPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if page is not None:
        serializer = UserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = UserSerializer(queryset, many=True)
    return Response({
        'data': serializer.data,
        'meta': {
            'success': True,
            'count': queryset.count()
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Statistiques pour le dashboard admin
    """
    # Vérifier que l'utilisateur est admin
    if request.user.role != 'admin':
        return Response({
            'detail': 'Vous n\'avez pas la permission d\'accéder à cette ressource'
        }, status=status.HTTP_403_FORBIDDEN)
    
    from django.utils import timezone
    from datetime import timedelta
    
    # Date il y a 30 jours
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Calculer les statistiques de base
    stats = {
        'revenue': '0 FCFA',
        'newUsers': User.objects.filter(created_at__gte=thirty_days_ago).count(),
        'pendingManagers': User.objects.filter(
            role='gestionnaire',
            statut_validation='en_attente'
        ).count(),
        'pendingRefunds': 0,
        'openDisputes': 0,
        'totalReservations': 0,
        'totalTerrains': 0,
        'totalUsers': User.objects.count(),
    }
    
    # Ajouter les stats des réservations si le modèle existe
    try:
        from apps.reservations.models import Reservation
        stats['totalReservations'] = Reservation.objects.count()
    except ImportError:
        pass
    
    # Ajouter les stats des litiges si le modèle existe
    try:
        from apps.support.models import SupportTicket
        stats['openDisputes'] = SupportTicket.objects.filter(
            statut__in=['ouvert', 'en_cours']
        ).count()
    except (ImportError, AttributeError):
        pass
    
    # Ajouter les stats des terrains si le modèle existe
    try:
        from apps.terrains.models import TerrainSynthetiquesDakar
        stats['totalTerrains'] = TerrainSynthetiquesDakar.objects.count()
    except ImportError:
        pass
    
    return Response({
        'data': stats,
        'meta': {
            'success': True
        }
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_status(request, user_id):
    """
    Mettre à jour le statut d'un utilisateur
    """
    # Vérifier que l'utilisateur est admin
    if request.user.role != 'admin':
        return Response({
            'detail': 'Vous n\'avez pas la permission d\'accéder à cette ressource'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'detail': 'Utilisateur non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Récupérer le nouveau statut
    new_status = request.data.get('statut_validation')
    if new_status and new_status in ['en_attente', 'approuve', 'rejete']:
        user.statut_validation = new_status
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'data': serializer.data,
            'meta': {
                'success': True,
                'message': 'Statut mis à jour avec succès'
            }
        })
    
    return Response({
        'detail': 'Statut invalide'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    Supprimer un utilisateur
    """
    # Vérifier que l'utilisateur est admin
    if request.user.role != 'admin':
        return Response({
            'detail': 'Vous n\'avez pas la permission d\'accéder à cette ressource'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'detail': 'Utilisateur non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Empêcher la suppression du propre compte admin
    if user.id == request.user.id:
        return Response({
            'detail': 'Vous ne pouvez pas supprimer votre propre compte'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.delete()
    
    return Response({
        'meta': {
            'success': True,
            'message': 'Utilisateur supprimé avec succès'
        }
    }, status=status.HTTP_204_NO_CONTENT)
