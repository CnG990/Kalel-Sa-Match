from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.core.utils.api_response import api_success, api_error, api_paginated
from apps.notifications.firebase_service import notify_new_reservation_manager
from apps.terrains.models import TerrainSynthetiquesDakar
from .models import Reservation, Disponibilite, CreneauReservation
from .utils import generate_ticket_pdf, generate_ticket_image
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
        montant_acompte=montant_acompte,  # Toujours défini pour nouvelles réservations
        montant_restant=montant_restant,  # Toujours défini pour nouvelles réservations
        telephone=telephone,
        notes=notes,
        statut='en_attente'
    )
    
    # Générer le QR code token et code ticket
    reservation.generer_qr_code_token()
    import random
    import string
    reservation.code_ticket = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    reservation.save()
    if terrain.gestionnaire:
        notify_new_reservation_manager(terrain.gestionnaire, reservation)
    
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
        message="Réservation créée - En attente de validation du gestionnaire",
        http_status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_reservations(request):
    """Liste des réservations de l'utilisateur"""
    reservations = Reservation.objects.filter(user=request.user).order_by('-date_debut')
    
    paginator = ReservationPagination()
    page = paginator.paginate_queryset(reservations, request)
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
    code_ticket = request.data.get('code_ticket')
    
    if not qr_token and not code_ticket:
        return api_error("Token QR code ou code ticket requis", status.HTTP_400_BAD_REQUEST)
    
    try:
        if qr_token:
            reservation = Reservation.objects.get(qr_code_token=qr_token)
        else:
            reservation = Reservation.objects.get(code_ticket=code_ticket)
        
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

    date_debut_str = request.GET.get('date_debut')
    date_fin_str = request.GET.get('date_fin')

    if not date_debut_str or not date_fin_str:
        return api_error("date_debut et date_fin sont requis", status.HTTP_400_BAD_REQUEST)

    try:
        date_debut_naive = datetime.fromisoformat(date_debut_str)
        date_fin_naive = datetime.fromisoformat(date_fin_str)
        # Rendre les datetimes timezone-aware (UTC)
        date_debut = timezone.make_aware(date_debut_naive) if timezone.is_naive(date_debut_naive) else date_debut_naive
        date_fin = timezone.make_aware(date_fin_naive) if timezone.is_naive(date_fin_naive) else date_fin_naive
    except (ValueError, TypeError):
        return api_error("Format de date invalide (attendu: ISO 8601)", status.HTTP_400_BAD_REQUEST)

    try:
        # Récupérer les réservations existantes (exclu les soft-deleted)
        reservations = Reservation.objects.filter(
            terrain=terrain,
            statut__in=['confirmee', 'en_cours', 'en_attente', 'acompte_paye'],
            date_debut__lt=date_fin,
            date_fin__gt=date_debut,
            deleted_at__isnull=True
        ).values('date_debut', 'date_fin', 'duree_heures', 'statut')

        creneaux_occupes = [
            {
                'date_debut': r['date_debut'].isoformat(),
                'date_fin': r['date_fin'].isoformat(),
                'duree_heures': r['duree_heures'],
                'statut': r['statut']
            }
            for r in reservations
        ]

        return api_success(
            data={
                'terrain_id': terrain.id,
                'terrain': terrain.nom,
                'creneaux_occupes': creneaux_occupes,
                'prix_heure': float(terrain.prix_heure) if terrain.prix_heure else None,
                'total_occupe': len(creneaux_occupes)
            },
            message="Disponibilités récupérées"
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"terrain_disponibilites error: {e}", exc_info=True)
        return api_error("Erreur interne lors du calcul des disponibilités", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_tickets(request):
    """Retourne tous les tickets de l'utilisateur connecté"""
    try:
        reservations = Reservation.objects.filter(
            user=request.user,
            statut__in=['confirmee', 'en_cours', 'terminee'],
            deleted_at__isnull=True
        ).order_by('-date_debut')

        tickets = []
        for reservation in reservations:
            terrain_photo = getattr(reservation.terrain, 'photo_url', None)
            montant_total = getattr(reservation, 'montant_total', None)
            ticket_data = {
                'id': reservation.id,
                'code_ticket': reservation.code_ticket,
                'statut': reservation.statut,
                'date_debut': reservation.date_debut,
                'date_fin': reservation.date_fin,
                'terrain': {
                    'id': reservation.terrain.id,
                    'nom': reservation.terrain.nom,
                    'adresse': reservation.terrain.adresse,
                    'photo_url': terrain_photo
                },
                'montant_total': float(montant_total) if montant_total is not None else None,
                'created_at': reservation.created_at
            }
            tickets.append(ticket_data)

        return api_success(
            data=tickets,
            message="Tickets récupérés avec succès"
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"user_tickets error: {e}", exc_info=True)
        return api_error("Erreur lors de la récupération des tickets", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reservation_ticket(request, reservation_id):
    """Retourne le ticket d'une réservation spécifique"""
    try:
        reservation = get_object_or_404(
            Reservation,
            id=reservation_id,
            user=request.user,
            statut__in=['confirmee', 'en_cours', 'terminee'],
            deleted_at__isnull=True
        )

        download_type = request.query_params.get('download') or request.query_params.get('format')
        if download_type == 'pdf':
            pdf_bytes = generate_ticket_pdf(reservation)
            filename = f"ticket-{reservation.code_ticket or reservation.id}.pdf"
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        if download_type in {'png', 'image'}:
            image_bytes = generate_ticket_image(reservation)
            filename = f"ticket-{reservation.code_ticket or reservation.id}.png"
            response = HttpResponse(image_bytes, content_type='image/png')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        terrain_photo = getattr(reservation.terrain, 'photo_url', None)
        montant_total = getattr(reservation, 'montant_total', None)
        ticket_data = {
            'id': reservation.id,
            'code_ticket': reservation.code_ticket,
            'statut': reservation.statut,
            'date_debut': reservation.date_debut,
            'date_fin': reservation.date_fin,
            'duree_heures': reservation.duree_heures,
            'terrain': {
                'id': reservation.terrain.id,
                'nom': reservation.terrain.nom,
                'adresse': reservation.terrain.adresse,
                'photo_url': terrain_photo,
                'prix_heure': float(reservation.terrain.prix_heure) if reservation.terrain.prix_heure else None
            },
            'montant_total': float(montant_total) if montant_total is not None else None,
            'user_nom': f"{reservation.user.prenom} {reservation.user.nom}",
            'user_email': reservation.user.email,
            'created_at': reservation.created_at,
            'payment_status': getattr(reservation, 'payment_status', 'completed')
        }

        return api_success(
            data=ticket_data,
            message="Ticket récupéré avec succès"
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"reservation_ticket error: {e}", exc_info=True)
        return api_error("Erreur lors de la récupération du ticket", status.HTTP_500_INTERNAL_SERVER_ERROR)


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
