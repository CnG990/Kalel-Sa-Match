from django.conf import settings
from django.db import models


class DeviceToken(models.Model):
    """Token FCM pour les notifications push"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='device_tokens'
    )
    fcm_token = models.TextField(unique=True)
    device_type = models.CharField(
        max_length=20,
        choices=[('web', 'Web'), ('android', 'Android'), ('ios', 'iOS')],
        default='web'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'device_tokens'
        verbose_name = 'Token d\'appareil'
        verbose_name_plural = 'Tokens d\'appareils'

    def __str__(self):
        return f"{self.user} - {self.device_type} ({self.fcm_token[:20]}...)"


class PushNotificationLog(models.Model):
    """Journal des notifications envoyées"""
    STATUT_CHOICES = [
        ('pending', 'En attente'),
        ('sent', 'Envoyée'),
        ('failed', 'Échec'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='push_notifications'
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='pending')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'push_notification_logs'
        ordering = ['-created_at']
        verbose_name = 'Log notification push'
        verbose_name_plural = 'Logs notifications push'

    def __str__(self):
        return f"{self.title} -> {self.recipient} ({self.statut})"
