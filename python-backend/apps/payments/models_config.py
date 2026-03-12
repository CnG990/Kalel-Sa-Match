"""
Configuration des comptes de réception de paiements
Géré par l'admin via interface CRUD
"""

from django.db import models
from django.core.validators import URLValidator
from apps.core.models import TimeStampedSoftDeleteModel


class PaymentConfig(TimeStampedSoftDeleteModel):
    """Configuration globale des comptes de réception (Wave, Orange Money)"""
    
    PAYMENT_METHOD_CHOICES = [
        ('wave', 'Wave Business'),
    ]
    
    methode = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        unique=True,
        help_text='Méthode de paiement'
    )
    
    est_actif = models.BooleanField(
        default=True,
        help_text='Activer/désactiver cette méthode de paiement'
    )
    
    wave_payment_link = models.URLField(
        null=True,
        blank=True,
        help_text='Lien Wave Business principal (ex: https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/)'
    )
    wave_merchant_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        default='Kalel Sa Match',
        help_text='Nom du compte marchand Wave'
    )
    wave_merchant_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text='ID marchand Wave (ex: M_sn_OnnKDQNjnuxG)'
    )
    
    # Paramètres communs
    commission_pourcentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text='Commission plateforme en % (ex: 2.5 pour 2.5%)'
    )
    
    instructions = models.TextField(
        null=True,
        blank=True,
        help_text='Instructions de paiement affichées aux clients'
    )
    
    logo_url = models.URLField(
        null=True,
        blank=True,
        help_text='URL du logo de la méthode de paiement'
    )
    
    ordre_affichage = models.IntegerField(
        default=0,
        help_text='Ordre d\'affichage sur le frontend (0 = premier)'
    )
    
    class Meta:
        db_table = 'payment_configs'
        verbose_name = 'Configuration Paiement'
        verbose_name_plural = 'Configurations Paiements'
        ordering = ['ordre_affichage', 'methode']
    
    def __str__(self):
        return f"{self.get_methode_display()} - {'Actif' if self.est_actif else 'Inactif'}"
    
    @property
    def display_name(self):
        """Nom affiché sur le frontend"""
        if self.methode == 'wave':
            return self.wave_merchant_name or 'Wave Business'
        return self.get_methode_display()
    
    @property
    def payment_identifier(self):
        """Identifiant de paiement (lien Wave ou numéro Orange)"""
        if self.methode == 'wave':
            return self.wave_payment_link
        return None
    
    @classmethod
    def get_active_methods(cls):
        """Retourne toutes les méthodes de paiement actives"""
        return cls.objects.filter(est_actif=True, deleted_at__isnull=True)
    
    @classmethod
    def get_wave_config(cls):
        """Récupère la configuration Wave active"""
        try:
            return cls.objects.get(methode='wave', est_actif=True, deleted_at__isnull=True)
        except cls.DoesNotExist:
            return None
    

class PaymentStats(models.Model):
    """Statistiques temps réel des paiements (cache)"""
    
    date = models.DateField(unique=True, auto_now_add=True)
    
    # Wave
    wave_count = models.IntegerField(default=0)
    wave_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    wave_success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Global
    total_count = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'payment_stats'
        verbose_name = 'Statistique Paiement'
        verbose_name_plural = 'Statistiques Paiements'
        ordering = ['-date']
    
    def __str__(self):
        return f"Stats {self.date} - {self.total_count} paiements"
