"""
Service Firebase Cloud Messaging pour notifications push
"""

from firebase_admin import messaging, credentials, initialize_app
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class FirebaseNotificationService:
    """Service de gestion des notifications Firebase"""
    
    _initialized = False
    
    @classmethod
    def initialize(cls):
        """Initialiser Firebase Admin SDK"""
        if cls._initialized:
            return
        
        try:
            # Charger credentials depuis settings ou fichier JSON
            if hasattr(settings, 'FIREBASE_CREDENTIALS'):
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
                initialize_app(cred)
                cls._initialized = True
                logger.info("Firebase Admin SDK initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur initialisation Firebase: {e}")
    
    @classmethod
    def send_notification(cls, token, title, body, data=None):
        """
        Envoyer une notification push à un appareil
        
        Args:
            token (str): FCM token de l'appareil
            title (str): Titre de la notification
            body (str): Corps du message
            data (dict): Données additionnelles
        
        Returns:
            str: Message ID si succès, None sinon
        """
        cls.initialize()
        
        if not cls._initialized:
            logger.warning("Firebase non initialisé, notification non envoyée")
            return None
        
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=token,
            )
            
            response = messaging.send(message)
            logger.info(f"Notification envoyée avec succès: {response}")
            return response
        
        except Exception as e:
            logger.error(f"Erreur envoi notification: {e}")
            return None
    
    @classmethod
    def send_multicast(cls, tokens, title, body, data=None):
        """
        Envoyer une notification à plusieurs appareils
        
        Args:
            tokens (list): Liste de FCM tokens
            title (str): Titre
            body (str): Corps
            data (dict): Données additionnelles
        
        Returns:
            dict: Résultats de l'envoi
        """
        cls.initialize()
        
        if not cls._initialized or not tokens:
            return {'success': 0, 'failure': 0}
        
        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                tokens=tokens,
            )
            
            response = messaging.send_multicast(message)
            logger.info(f"Multicast envoyé: {response.success_count} succès, {response.failure_count} échecs")
            
            return {
                'success': response.success_count,
                'failure': response.failure_count,
                'responses': response.responses
            }
        
        except Exception as e:
            logger.error(f"Erreur envoi multicast: {e}")
            return {'success': 0, 'failure': len(tokens)}
    
    @classmethod
    def send_topic_notification(cls, topic, title, body, data=None):
        """
        Envoyer une notification à un topic (groupe d'appareils)
        
        Args:
            topic (str): Nom du topic (ex: 'all_users', 'clients', 'gestionnaires')
            title (str): Titre
            body (str): Corps
            data (dict): Données additionnelles
        """
        cls.initialize()
        
        if not cls._initialized:
            return None
        
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                topic=topic,
            )
            
            response = messaging.send(message)
            logger.info(f"Notification topic '{topic}' envoyée: {response}")
            return response
        
        except Exception as e:
            logger.error(f"Erreur envoi topic notification: {e}")
            return None


# Fonctions helper pour notifications spécifiques
def notify_reservation_confirmed(user, reservation):
    """Notifier client que sa réservation est confirmée"""
    if not hasattr(user, 'fcm_token') or not user.fcm_token:
        return
    
    FirebaseNotificationService.send_notification(
        token=user.fcm_token,
        title="✅ Réservation confirmée",
        body=f"Votre réservation pour {reservation.terrain.nom} le {reservation.date_debut.strftime('%d/%m/%Y')} est confirmée !",
        data={
            'type': 'reservation_confirmed',
            'reservation_id': str(reservation.id),
            'terrain_id': str(reservation.terrain.id),
        }
    )


def notify_payment_success(user, payment):
    """Notifier client que son paiement est réussi"""
    if not hasattr(user, 'fcm_token') or not user.fcm_token:
        return
    
    FirebaseNotificationService.send_notification(
        token=user.fcm_token,
        title="💰 Paiement réussi",
        body=f"Votre paiement de {payment.montant} FCFA a été confirmé.",
        data={
            'type': 'payment_success',
            'payment_id': str(payment.id),
            'amount': str(payment.montant),
        }
    )


def notify_new_reservation_manager(gestionnaire, reservation):
    """Notifier gestionnaire d'une nouvelle réservation"""
    if not hasattr(gestionnaire, 'fcm_token') or not gestionnaire.fcm_token:
        return
    
    FirebaseNotificationService.send_notification(
        token=gestionnaire.fcm_token,
        title="🆕 Nouvelle réservation",
        body=f"{reservation.user.nom_complet} a réservé {reservation.terrain.nom}",
        data={
            'type': 'new_reservation',
            'reservation_id': str(reservation.id),
            'terrain_id': str(reservation.terrain.id),
        }
    )


def notify_reservation_validation_client(user, reservation):
    """Notifier le client que le gestionnaire a validé sa réservation"""
    if not hasattr(user, 'fcm_token') or not user.fcm_token:
        return

    FirebaseNotificationService.send_notification(
        token=user.fcm_token,
        title="🔓 Réservation validée",
        body=f"{reservation.terrain.nom} est approuvé. Vous pouvez payer l'acompte.",
        data={
            'type': 'reservation_validated',
            'reservation_id': str(reservation.id),
            'terrain_id': str(reservation.terrain.id),
        }
    )


def notify_reservation_refused_client(user, reservation, motif=""):
    """Notifier le client que sa réservation a été refusée"""
    if not hasattr(user, 'fcm_token') or not user.fcm_token:
        return

    reason = motif or "Votre demande a été refusée par le gestionnaire."
    FirebaseNotificationService.send_notification(
        token=user.fcm_token,
        title="❌ Réservation refusée",
        body=reason,
        data={
            'type': 'reservation_refused',
            'reservation_id': str(reservation.id),
            'terrain_id': str(reservation.terrain.id),
        }
    )


def notify_loyalty_points_earned(user, points, raison):
    """Notifier client qu'il a gagné des points"""
    if not hasattr(user, 'fcm_token') or not user.fcm_token:
        return
    
    FirebaseNotificationService.send_notification(
        token=user.fcm_token,
        title="🎁 Points de fidélité !",
        body=f"Vous avez gagné {points} points - {raison}",
        data={
            'type': 'loyalty_points',
            'points': str(points),
            'raison': raison,
        }
    )


def notify_reminder_24h(user, reservation):
    """Rappel 24h avant la réservation"""
    if not hasattr(user, 'fcm_token') or not user.fcm_token:
        return
    
    FirebaseNotificationService.send_notification(
        token=user.fcm_token,
        title="⏰ Rappel - Réservation demain",
        body=f"N'oubliez pas votre réservation à {reservation.terrain.nom} demain à {reservation.date_debut.strftime('%H:%M')}",
        data={
            'type': 'reservation_reminder',
            'reservation_id': str(reservation.id),
            'hours_before': '24',
        }
    )


def notify_promo_campaign(topic, titre, message):
    """Envoyer campagne promotionnelle"""
    FirebaseNotificationService.send_topic_notification(
        topic=topic,
        title=titre,
        body=message,
        data={
            'type': 'promo',
            'campaign': titre,
        }
    )
