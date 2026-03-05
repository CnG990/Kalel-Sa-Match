from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.core.utils.api_response import api_success, api_error, api_paginated
from apps.terrains.models import TerrainSynthetiquesDakar
from .models import Reservation, Disponibilite, CreneauReservation
from .serializers import (
    ReservationSerializer, 
    CreateReservationSerializer,
    CheckDisponibiliteSerializer,
    CreneauReservationSerializer,
    DisponibiliteSerializer
)


class ReservationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return api_paginated(
            data=data,
            pagination={
                'count': self.page.paginator.count,
                'current_page': self.page.number,
                'last_page': self.page.paginator.num_pages,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
            }
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_reservation(request):
    """Créer une nouvelle réservation"""
    serializer = CreateReservationSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(
            message="Données invalides",
            errors=serializer.errors,
            http_status=status.HTTP_400_BAD_REQUEST
        )
    
    terrain_id = serializer.validated_data['terrain_id']
    date_debut = serializer.validated_data['date_debut']
    date_fin = serializer.validated_data['date_fin']
    duree_heures = serializer.validated_data['duree_heures']
    telephone = serializer.validated_data.get('telephone', '')
    notes = serializer.validated_data.get('notes', '')
    
    try:
        terrain = TerrainSynthetiquesDakar.objects.get(id=terrain_id, est_actif=True)
    except TerrainSynthetiquesDakar.DoesNotExist:
        return api_error("Terrain non trouvé", status.HTTP_404_NOT_FOUND)
    
    # Vérifier la disponibilité
    if not _check_disponibilite(terrain, date_debut, date_fin):
        return api_error("Le terrain n'est pas disponible pour cette période", status.HTTP_400_BAD_REQUEST)
    
    # Calculer le montant
    prix_heure = terrain.prix_heure or 5000  # Prix par défaut
    montant_total = prix_heure * duree_heures
    
    # Calculer l'acompte selon la configuration du terrain
    from decimal import Decimal
    if terrain.type_acompte == 'montant_fixe' and terrain.montant_acompte_fixe:
        montant_acompte = terrain.montant_acompte_fixe
    else:
        # Pourcentage par défaut
        pourcentage = terrain.pourcentage_acompte or Decimal('30.00')
        montant_acompte = (montant_total * pourcentage) / Decimal('100')
    
    montant_restant = montant_total - montant_acompte
    
    # Créer la réservation avec acompte
    reservation = Reservation.objects.create(
        terrain=terrain,
        user=request.user,
        date_debut=date_debut,
        date_fin=date_fin,
        duree_heures=duree_heures,
        montant_total=montant_total,
        montant_acompte=montant_acompte,
        montant_restant=montant_restant,
        telephone=telephone,
        notes=notes,
        statut='en_attente'  # En attente de paiement acompte
    )
    
    # Générer le QR code token et code ticket
    reservation.generer_qr_code_token()
    import random
    import string
    reservation.code_ticket = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    reservation.save()
    
    # Créer le paiement pour l'ACOMPTE uniquement
    from apps.payments.models import Payment
    import uuid
    
    payment_acompte = Payment.objects.create(
        reference=str(uuid.uuid4()),
        montant=montant_acompte,  # Montant de l'acompte, pas le total
        methode='en_attente',
        statut='en_attente',
        user=request.user,
        payment_type='acompte'
    )
    
    # Lier le paiement acompte à la réservation
    reservation.paiement_acompte = payment_acompte
    reservation.save()
    
    return api_success(
        data={
            **ReservationSerializer(reservation).data,
            'payment_id': payment_acompte.id,
            'payment_reference': payment_acompte.reference,
            'montant_acompte': float(montant_acompte),
            'montant_total': float(montant_total),
            'montant_restant': float(montant_restant),
            'pourcentage_acompte': float(terrain.pourcentage_acompte or 30)
        },
        message="Réservation créée - Veuillez payer l'acompte",
        http_status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_reservations(request):
    """Liste des réservations de l'utilisateur"""
    reservations = Reservation.objects.filter(user=request.user).order_by('-date_debut')
    
    paginator = ReservationPagination()
    page = paginator.paginate_queryset(reservations)
    serializer = ReservationSerializer(page, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def reservation_detail(request, reservation_id):
    """Détails d'une réservation"""
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=request.user)
        return api_success(
            data=ReservationSerializer(reservation).data,
            message="Détails de la réservation"
        )
    except Reservation.DoesNotExist:
        return api_error("Réservation non trouvée", status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation(request, reservation_id):
    """Annuler une réservation"""
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=request.user)
        
        motif = request.data.get('motif', 'Annulé par l\'utilisateur')
        reservation.annuler(motif, request.user)
        
        return api_success(
            message="Réservation annulée avec succès"
        )
    except Reservation.DoesNotExist:
        return api_error("Réservation non trouvée", status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_qr_code(request):
    """Valider un QR code de réservation - GESTIONNAIRES UNIQUEMENT"""
    from apps.accounts.models import User
    
    # Vérifier que l'utilisateur est gestionnaire
    if request.user.role not in ['gestionnaire', 'admin']:
        return api_error(
            "Seuls les gestionnaires peuvent valider des QR codes",
            status.HTTP_403_FORBIDDEN
        )
    
    qr_token = request.data.get('qr_token')
    
    if not qr_token:
        return api_error("Token QR code requis", status.HTTP_400_BAD_REQUEST)
    
    try:
        reservation = Reservation.objects.get(qr_code_token=qr_token)
        
        if not reservation.est_valide:
            return api_error("Réservation non valide", status.HTTP_400_BAD_REQUEST)
        
        # Marquer comme en cours
        reservation.statut = 'en_cours'
        reservation.save()
        
        return api_success(
            data={
                'reservation_id': reservation.id,
                'terrain_nom': reservation.terrain.nom,
                'user_nom': f"{reservation.user.prenom} {reservation.user.nom}",
                'date_debut': reservation.date_debut,
                'date_fin': reservation.date_fin,
                'code_ticket': reservation.code_ticket
            },
            message="Réservation validée avec succès"
        )
    except Reservation.DoesNotExist:
        return api_error("QR code invalide", status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_disponibilite(request):
    """Vérifier la disponibilité d'un terrain"""
    serializer = CheckDisponibiliteSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(
            message="Données invalides",
            errors=serializer.errors,
            http_status=status.HTTP_400_BAD_REQUEST
        )
    
    terrain_id = serializer.validated_data['terrain_id']
    date = serializer.validated_data['date']
    heure_debut = serializer.validated_data['heure_debut']
    heure_fin = serializer.validated_data['heure_fin']
    duree_heures = serializer.validated_data['duree_heures']
    
    try:
        terrain = TerrainSynthetiquesDakar.objects.get(id=terrain_id, est_actif=True)
    except TerrainSynthetiquesDakar.DoesNotExist:
        return api_error("Terrain non trouvé", status.HTTP_404_NOT_FOUND)
    
    date_debut = datetime.combine(date, heure_debut)
    date_fin = datetime.combine(date, heure_fin) + timedelta(hours=duree_heures - 1)
    
    disponibilite = _check_disponibilite(terrain, date_debut, date_fin)
    
    return api_success(
        data={
            'disponible': disponibilite,
            'terrain': terrain.nom,
            'date_debut': date_debut.isoformat(),
            'date_fin': date_fin.isoformat(),
            'prix_heure': terrain.prix_heure,
            'montant_total': (terrain.prix_heure or 5000) * duree_heures
        },
        message="Disponibilité vérifiée"
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def terrain_disponibilites(request, terrain_id):
    """Voir les disponibilités d'un terrain pour une période"""
    try:
        terrain = TerrainSynthetiquesDakar.objects.get(id=terrain_id, est_actif=True)
    except TerrainSynthetiquesDakar.DoesNotExist:
        return api_error("Terrain non trouvé", status.HTTP_404_NOT_FOUND)
    
    date_debut = request.GET.get('date_debut')
    date_fin = request.GET.get('date_fin')
    
    if not date_debut or not date_fin:
        return api_error("date_debut et date_fin sont requis", status.HTTP_400_BAD_REQUEST)
    
    try:
        date_debut = datetime.fromisoformat(date_debut)
        date_fin = datetime.fromisoformat(date_fin)
    except ValueError:
        return api_error("Format de date invalide", status.HTTP_400_BAD_REQUEST)
    
    # Récupérer les réservations existantes
    reservations = Reservation.objects.filter(
        terrain=terrain,
        statut='confirmee',
        date_debut__lt=date_fin,
        date_fin__gt=date_debut
    )
    
    # Créer une liste des créneaux occupés
    creneaux_occupes = []
    for reservation in reservations:
        creneaux_occupes.append({
            'date_debut': reservation.date_debut.isoformat(),
            'date_fin': reservation.date_fin.isoformat(),
            'duree_heures': reservation.duree_heures
        })
    
    return api_success(
        data={
            'terrain': terrain.nom,
            'creneaux_occupes': creneaux_occupes,
            'prix_heure': terrain.prix_heure
        },
        message="Disponibilités récupérées"
    )


def _check_disponibilite(terrain, date_debut, date_fin):
    """Vérifier si un terrain est disponible pour une période donnée"""
    # Vérifier les réservations confirmées
    reservations_conflict = Reservation.objects.filter(
        terrain=terrain,
        statut='confirmee',
        date_debut__lt=date_fin,
        date_fin__gt=date_debut
    )
    
    return not reservations_conflict.exists()
