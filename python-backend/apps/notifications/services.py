"""
Service pour envoyer des notifications push via Firebase Cloud Messaging (FCM)
"""
import json
import logging
from datetime import datetime
from typing import List, Optional

import requests
from django.conf import settings
from django.utils import timezone

from .models import DeviceToken, PushNotificationLog

logger = logging.getLogger(__name__)


class FCMService:
    """Service pour envoyer des notifications via Firebase Cloud Messaging"""
    
    FCM_URL = 'https://fcm.googleapis.com/fcm/send'
    
    def __init__(self):
        self.server_key = getattr(settings, 'FCM_SERVER_KEY', None)
    
    def send_to_token(self, token: str, title: str, body: str, data: dict = None) -> bool:
        """Envoyer une notification à un token FCM spécifique"""
        if not self.server_key:
            logger.warning("FCM_SERVER_KEY non configuré")
            return False
        
        headers = {
            'Authorization': f'key={self.server_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'to': token,
            'notification': {
                'title': title,
                'body': body,
                'icon': '/icon-192x192.png',
                'click_action': data.get('url', '/') if data else '/'
            },
            'data': data or {}
        }
        
        try:
            response = requests.post(self.FCM_URL, headers=headers, json=payload, timeout=10)
            result = response.json()
            
            if result.get('success') == 1:
                logger.info(f"Notification envoyée avec succès à {token[:20]}...")
                return True
            else:
                logger.error(f"Échec envoi notification: {result}")
                return False
        except Exception as e:
            logger.error(f"Erreur envoi FCM: {e}")
            return False
    
    def send_to_user(self, user, title: str, body: str, data: dict = None) -> int:
        """Envoyer une notification à tous les appareils d'un utilisateur"""
        tokens = DeviceToken.objects.filter(user=user, is_active=True)
        success_count = 0
        
        for device in tokens:
            if self.send_to_token(device.fcm_token, title, body, data):
                success_count += 1
            else:
                # Marquer le token comme inactif si l'envoi échoue
                device.is_active = False
                device.save(update_fields=['is_active'])
        
        # Logger la notification
        PushNotificationLog.objects.create(
            recipient=user,
            title=title,
            body=body,
            data=data or {},
            statut='sent' if success_count > 0 else 'failed',
            sent_at=timezone.now() if success_count > 0 else None
        )
        
        return success_count
    
    def send_to_role(self, role: str, title: str, body: str, data: dict = None) -> int:
        """Envoyer une notification à tous les utilisateurs d'un rôle"""
        from apps.accounts.models import User
        
        users = User.objects.filter(role=role, is_active=True)
        total_sent = 0
        
        for user in users:
            total_sent += self.send_to_user(user, title, body, data)
        
        return total_sent
    
    def send_to_terrain_manager(self, terrain_id: int, title: str, body: str, data: dict = None) -> int:
        """Envoyer une notification au gestionnaire d'un terrain spécifique"""
        from apps.terrains.models import TerrainSynthetiquesDakar
        
        try:
            terrain = TerrainSynthetiquesDakar.objects.select_related('gestionnaire').get(pk=terrain_id)
            if terrain.gestionnaire:
                return self.send_to_user(terrain.gestionnaire, title, body, data)
        except TerrainSynthetiquesDakar.DoesNotExist:
            logger.warning(f"Terrain {terrain_id} non trouvé")
        
        return 0


# Instance singleton du service
fcm_service = FCMService()


def notify_new_subscription_request(demande):
    """Notifier le gestionnaire d'une nouvelle demande d'abonnement"""
    user_name = f"{demande.user.prenom or ''} {demande.user.nom or ''}".strip() or demande.user.email
    plan_name = demande.plan.nom if demande.plan else "Abonnement"
    terrain_name = demande.terrain.nom if demande.terrain else "Terrain"
    
    title = "Nouvelle demande d'abonnement"
    body = f"{user_name} souhaite s'abonner à {plan_name} sur {terrain_name}"
    data = {
        'type': 'new_subscription_request',
        'demande_id': str(demande.id),
        'url': '/manager/abonnements'
    }
    
    # Notifier le gestionnaire du terrain
    if demande.terrain and demande.terrain.gestionnaire:
        fcm_service.send_to_user(demande.terrain.gestionnaire, title, body, data)
    
    # Notifier aussi les admins
    data['url'] = '/admin/subscriptions'
    fcm_service.send_to_role('admin', title, body, data)


def notify_subscription_status_change(demande, old_status: str):
    """Notifier le client d'un changement de statut de sa demande"""
    status_messages = {
        'pending_payment': "Votre demande d'abonnement a été approuvée ! Procédez au paiement.",
        'active': "Votre abonnement est maintenant actif !",
        'refused': "Votre demande d'abonnement a été refusée.",
        'cancelled': "Votre demande d'abonnement a été annulée."
    }
    
    body = status_messages.get(demande.statut, f"Statut mis à jour: {demande.statut}")
    title = "Mise à jour de votre abonnement"
    data = {
        'type': 'subscription_status_change',
        'demande_id': str(demande.id),
        'new_status': demande.statut,
        'url': '/dashboard'
    }
    
    fcm_service.send_to_user(demande.user, title, body, data)
