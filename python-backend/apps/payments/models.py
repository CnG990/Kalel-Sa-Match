from django.db import models
from apps.terrains.models import TimeStampedSoftDeleteModel
from apps.accounts.models import User


class Payment(TimeStampedSoftDeleteModel):
    """Modèle de base pour les paiements"""
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('reussi', 'Réussi'),
        ('echoue', 'Échoué'),
        ('rembourse', 'Remboursé'),
    ]
    
    METHODE_CHOICES = [
        ('wave', 'Wave'),
        ('orange_money', 'Orange Money'),
        ('especes', 'Espèces'),
        ('carte', 'Carte bancaire'),
    ]

    reference = models.CharField(max_length=255, unique=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    methode = models.CharField(max_length=20, choices=METHODE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    webhook_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Paiement {self.reference} - {self.montant} FCFA"


class WavePayment(TimeStampedSoftDeleteModel):
    """Paiements spécifiques à Wave"""
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='wave_payment')
    checkout_url = models.URLField(max_length=500, blank=True)
    payment_token = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'wave_payments'


class OrangeMoneyPayment(TimeStampedSoftDeleteModel):
    """Paiements spécifiques à Orange Money"""
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='orange_payment')
    transaction_id = models.CharField(max_length=255, unique=True)
    otp = models.CharField(max_length=10, blank=True)
    customer_phone = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'orange_money_payments'
