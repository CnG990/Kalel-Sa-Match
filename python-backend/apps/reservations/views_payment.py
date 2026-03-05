"""
Vues pour la gestion des paiements de réservation
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.core.utils.api_response import api_success, api_error
from apps.payments.models import Payment
from .models import Reservation
import uuid


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_balance(request, reservation_id):
    """
    Payer le solde restant d'une réservation
    """
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=request.user)
    except Reservation.DoesNotExist:
        return api_error("Réservation non trouvée", status.HTTP_404_NOT_FOUND)
    
    # Vérifications
    if not reservation.acompte_paye:
        return api_error(
            "L'acompte n'a pas encore été payé",
            status.HTTP_400_BAD_REQUEST
        )
    
    if reservation.solde_paye:
        return api_error(
            "Le solde a déjà été payé",
            status.HTTP_400_BAD_REQUEST
        )
    
    if reservation.montant_restant <= 0:
        return api_error(
            "Aucun solde à payer",
            status.HTTP_400_BAD_REQUEST
        )
    
    # Créer le paiement pour le solde
    payment_solde = Payment.objects.create(
        reference=str(uuid.uuid4()),
        montant=reservation.montant_restant,
        methode='en_attente',
        statut='en_attente',
        user=request.user,
        payment_type='solde'
    )
    
    # Lier le paiement à la réservation
    reservation.paiement_solde = payment_solde
    reservation.save()
    
    return api_success(
        data={
            'payment_id': payment_solde.id,
            'payment_reference': payment_solde.reference,
            'montant_solde': float(reservation.montant_restant),
            'reservation_id': reservation.id
        },
        message="Paiement du solde créé - Veuillez procéder au paiement",
        http_status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reservation_payment_status(request, reservation_id):
    """
    Obtenir le statut de paiement d'une réservation
    """
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=request.user)
    except Reservation.DoesNotExist:
        return api_error("Réservation non trouvée", status.HTTP_404_NOT_FOUND)
    
    return api_success(
        data={
            'reservation_id': reservation.id,
            'montant_total': float(reservation.montant_total),
            'montant_acompte': float(reservation.montant_acompte),
            'montant_restant': float(reservation.montant_restant),
            'acompte_paye': reservation.acompte_paye,
            'solde_paye': reservation.solde_paye,
            'statut': reservation.statut,
            'paiement_acompte_id': reservation.paiement_acompte.id if reservation.paiement_acompte else None,
            'paiement_solde_id': reservation.paiement_solde.id if reservation.paiement_solde else None,
        }
    )
