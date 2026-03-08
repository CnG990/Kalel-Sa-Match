import uuid
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.core.utils.api_response import api_success, api_error, api_paginated
from apps.reservations.models import Reservation
from .models import Payment, WavePayment, OrangeMoneyPayment
from .serializers import PaymentSerializer, WavePaymentSerializer, OrangeMoneyPaymentSerializer, InitPaymentSerializer


class PaymentPagination(PageNumberPagination):
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
def init_payment(request):
    """Initialiser un paiement"""
    serializer = InitPaymentSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(
            message="Données invalides",
            errors=serializer.errors,
            http_status=status.HTTP_400_BAD_REQUEST
        )
    
    payment_id = serializer.validated_data.get('payment_id')
    reservation_id = serializer.validated_data.get('reservation_id')
    methode = serializer.validated_data['methode']
    customer_phone = serializer.validated_data['customer_phone']
    customer_name = serializer.validated_data['customer_name']
    reservation = None

    # Récupérer la réservation liée si fournie (ou via payment_id)
    if reservation_id:
        try:
            reservation = Reservation.objects.select_related('terrain', 'terrain__gestionnaire', 'user').get(
                id=reservation_id,
                deleted_at__isnull=True
            )
        except Reservation.DoesNotExist:
            return api_error("Réservation non trouvée", status.HTTP_404_NOT_FOUND)

        if reservation.user != request.user and request.user.role not in ['admin', 'gestionnaire']:
            return api_error("Vous ne pouvez pas initier ce paiement", status.HTTP_403_FORBIDDEN)

    elif payment_id:
        reservation = (
            Reservation.objects.filter(paiement_acompte_id=payment_id, deleted_at__isnull=True).first()
            or Reservation.objects.filter(paiement_solde_id=payment_id, deleted_at__isnull=True).first()
            or Reservation.objects.filter(paiement_id=payment_id, deleted_at__isnull=True).first()
        )
        if reservation and reservation.user != request.user and request.user.role not in ['admin', 'gestionnaire']:
            return api_error("Vous ne pouvez pas initier ce paiement", status.HTTP_403_FORBIDDEN)

    if reservation:
        if reservation.statut == 'en_attente_validation':
            return api_error(
                "Cette réservation est encore en attente de validation du gestionnaire",
                status.HTTP_400_BAD_REQUEST
            )
        if reservation.statut == 'refusee':
            return api_error("Cette réservation a été refusée", status.HTTP_400_BAD_REQUEST)
        if reservation.statut == 'annulee':
            return api_error("Cette réservation est annulée", status.HTTP_400_BAD_REQUEST)

    # Récupérer le paiement existant ou en créer un nouveau
    if payment_id:
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
            # Mettre à jour la méthode et les infos client
            payment.methode = methode
            payment.customer_phone = customer_phone
            payment.customer_name = customer_name
            payment.save()
            montant = payment.montant
        except Payment.DoesNotExist:
            return api_error("Paiement non trouvé", status.HTTP_404_NOT_FOUND)
    else:
        # Créer un nouveau paiement
        montant = serializer.validated_data['montant']
        payment = Payment.objects.create(
            reference=str(uuid.uuid4()),
            montant=montant,
            methode=methode,
            user=request.user,
            customer_phone=customer_phone,
            customer_name=customer_name
        )
    
    # Créer le paiement spécifique selon la méthode
    if methode == 'wave':
        wave_payment = WavePayment.objects.create(
            payment=payment,
            customer_phone=customer_phone,
            customer_name=customer_name
        )
        
        # Wave Business Link - Ch Tech Business
        # Lien par défaut de l'admin, peut être remplacé par celui du gestionnaire
        wave_business_link = "https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/"
        
        # Si la réservation a un terrain avec un gestionnaire qui a son propre lien Wave
        reservation_id = serializer.validated_data.get('reservation_id')
        if reservation_id:
            from apps.reservations.models import Reservation
            try:
                reservation = Reservation.objects.get(id=reservation_id)
                gestionnaire = reservation.terrain.gestionnaire
                if gestionnaire and gestionnaire.wave_payment_link:
                    wave_business_link = gestionnaire.wave_payment_link
            except Reservation.DoesNotExist:
                pass
        
        # Format Wave: ajouter montant et référence en paramètres
        checkout_url = f"{wave_business_link}?amount={montant}&ref={payment.reference}"
        wave_payment.checkout_url = checkout_url
        wave_payment.save()
        
        return api_success(
            data={
                'payment_id': payment.id,
                'reference': payment.reference,
                'checkout_url': wave_payment.checkout_url,
                'montant': float(montant),
                'methode': 'wave'
            },
            message="Paiement Wave initialisé - Veuillez payer via le lien"
        )
    
    elif methode == 'orange_money':
        orange_payment = OrangeMoneyPayment.objects.create(
            payment=payment,
            customer_phone=customer_phone,
            customer_name=customer_name
        )
        
        # Orange Money - Format Sénégal: #144#montant#
        # Génération transaction ID unique
        import time
        orange_payment.transaction_id = f"OM{int(time.time())}{payment.id}"
        orange_payment.save()
        
        # Instructions pour le client
        instructions = f"Composez *144*montant# sur votre téléphone Orange Money"
        ussd_code = f"*144*{int(montant)}#"
        
        return api_success(
            data={
                'payment_id': payment.id,
                'reference': payment.reference,
                'transaction_id': orange_payment.transaction_id,
                'montant': float(montant),
                'methode': 'orange_money',
                'ussd_code': ussd_code,
                'instructions': instructions,
                'numero_marchand': '+221 XX XXX XX XX'  # À remplacer par le vrai numéro
            },
            message="Paiement Orange Money initialisé - Suivez les instructions"
        )
    
    return api_success(
        data={'payment_id': payment.id, 'reference': payment.reference},
        message="Paiement initialisé"
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Webhook public
def wave_webhook(request):
    """Webhook pour confirmer les paiements Wave"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        data = request.data
        logger.info(f"Wave webhook reçu: {data}")
        
        payment_reference = data.get('reference') or data.get('ref')
        payment_status = data.get('status')
        transaction_id = data.get('transaction_id') or data.get('id')
        
        if not payment_reference or not payment_status:
            logger.error(f"Données webhook invalides: {data}")
            return api_error("Données webhook invalides", status.HTTP_400_BAD_REQUEST)
        
        try:
            payment = Payment.objects.get(reference=payment_reference)
        except Payment.DoesNotExist:
            logger.error(f"Paiement non trouvé: {payment_reference}")
            return api_error("Paiement non trouvé", status.HTTP_404_NOT_FOUND)
        
        # Stocker les données du webhook
        payment.webhook_data = data
        
        # Mettre à jour le statut selon la réponse Wave
        if payment_status in ['success', 'completed', 'successful']:
            payment.statut = 'reussi'
            payment.transaction_id = transaction_id
            
            # Si paiement d'acompte, marquer acompte comme payé
            if hasattr(payment, 'reservation_acompte'):
                reservation = payment.reservation_acompte.first()
                if reservation:
                    reservation.acompte_paye = True
                    if reservation.montant_restant == 0 or payment.payment_type == 'total':
                        reservation.statut = 'confirmee'
                        reservation.solde_paye = True
                    else:
                        reservation.statut = 'acompte_paye'
                    reservation.save()
                    logger.info(f"Réservation {reservation.id} - Acompte payé")
            
            # Si paiement de solde, confirmer la réservation
            elif hasattr(payment, 'reservation_solde'):
                reservation = payment.reservation_solde.first()
                if reservation:
                    reservation.solde_paye = True
                    reservation.statut = 'confirmee'
                    reservation.save()
                    logger.info(f"Réservation {reservation.id} - Solde payé, confirmée")
            
            # Ancien système (legacy) - paiement unique
            elif hasattr(payment, 'reservation_legacy') and payment.reservation_legacy:
                reservation = payment.reservation_legacy
                reservation.statut = 'confirmee'
                reservation.save()
                logger.info(f"Réservation {reservation.id} confirmée (legacy)")
        
        elif payment_status in ['failed', 'error', 'cancelled']:
            payment.statut = 'echoue'
            
            # Annuler la réservation si paiement échoué
            reservation = None
            if hasattr(payment, 'reservation_acompte'):
                reservation = payment.reservation_acompte.first()
            elif hasattr(payment, 'reservation_solde'):
                reservation = payment.reservation_solde.first()
            elif hasattr(payment, 'reservation_legacy') and payment.reservation_legacy:
                reservation = payment.reservation_legacy
            
            if reservation:
                reservation.statut = 'annulee'
                reservation.motif_annulation = f"Paiement {payment.payment_type} échoué"
                reservation.save()
                logger.info(f"Réservation {reservation.id} annulée - paiement échoué")
        
        payment.save()
        logger.info(f"Paiement {payment.reference} mis à jour: {payment.statut}")
        
        return api_success(message="Webhook traité avec succès")
    
    except Exception as e:
        logger.exception(f"Erreur webhook: {str(e)}")
        return api_error(f"Erreur webhook: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_status(request, payment_id):
    """Vérifier le statut d'un paiement"""
    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
        serializer = PaymentSerializer(payment)
        return api_success(
            data=serializer.data,
            message="Statut du paiement récupéré"
        )
    except Payment.DoesNotExist:
        return api_error("Paiement non trouvé", status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_payments(request):
    """Liste des paiements de l'utilisateur"""
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    
    paginator = PaymentPagination()
    page = paginator.paginate_queryset(payments)
    serializer = PaymentSerializer(page, many=True)
    
    return paginator.get_paginated_response(serializer.data)
