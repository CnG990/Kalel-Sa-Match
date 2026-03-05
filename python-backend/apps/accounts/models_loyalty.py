"""
Système de fidélité et points pour les clients
"""

from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedSoftDeleteModel
from decimal import Decimal


class LoyaltyConfig(models.Model):
    """Configuration globale du programme de fidélité"""
    
    points_par_fcfa = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=1.00,
        help_text='Points gagnés pour chaque 1000 FCFA dépensés'
    )
    
    fcfa_par_point = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=100.00,
        help_text='Valeur en FCFA de 1 point lors de l\'utilisation'
    )
    
    points_inscription = models.IntegerField(
        default=500,
        help_text='Points bonus lors de l\'inscription'
    )
    
    points_parrainage_parrain = models.IntegerField(
        default=1000,
        help_text='Points pour le parrain'
    )
    
    points_parrainage_filleul = models.IntegerField(
        default=500,
        help_text='Points pour le filleul'
    )
    
    points_minimum_utilisation = models.IntegerField(
        default=1000,
        help_text='Nombre minimum de points pour utiliser'
    )
    
    pourcentage_max_paiement = models.IntegerField(
        default=50,
        help_text='% max du paiement payable en points (ex: 50 = max 50%)'
    )
    
    est_actif = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'loyalty_config'
        verbose_name = 'Configuration Fidélité'
    
    def __str__(self):
        return f"Config Fidélité - {self.points_par_fcfa} pts/1000 FCFA"
    
    @classmethod
    def get_config(cls):
        """Récupère la config active ou crée une par défaut"""
        config, _ = cls.objects.get_or_create(id=1)
        return config


class LoyaltyAccount(TimeStampedSoftDeleteModel):
    """Compte de points fidélité pour chaque client"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loyalty_account'
    )
    
    points_balance = models.IntegerField(
        default=0,
        help_text='Solde actuel de points'
    )
    
    points_lifetime = models.IntegerField(
        default=0,
        help_text='Total points gagnés depuis inscription'
    )
    
    points_used = models.IntegerField(
        default=0,
        help_text='Total points utilisés'
    )
    
    niveau = models.CharField(
        max_length=20,
        choices=[
            ('bronze', 'Bronze'),
            ('argent', 'Argent'),
            ('or', 'Or'),
            ('platine', 'Platine'),
        ],
        default='bronze'
    )
    
    code_parrainage = models.CharField(
        max_length=10,
        unique=True,
        help_text='Code unique pour parrainer d\'autres clients'
    )
    
    parrain = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='filleuls',
        help_text='Utilisateur qui a parrainé ce client'
    )
    
    class Meta:
        db_table = 'loyalty_accounts'
        verbose_name = 'Compte Fidélité'
        verbose_name_plural = 'Comptes Fidélité'
    
    def __str__(self):
        return f"{self.user.nom_complet} - {self.points_balance} pts ({self.niveau})"
    
    def add_points(self, points, raison, reference=None):
        """Ajouter des points au compte"""
        self.points_balance += points
        self.points_lifetime += points
        self._update_niveau()
        self.save()
        
        # Créer transaction
        LoyaltyTransaction.objects.create(
            loyalty_account=self,
            type='credit',
            points=points,
            raison=raison,
            reference=reference,
            balance_apres=self.points_balance
        )
    
    def use_points(self, points, raison, reference=None):
        """Utiliser des points"""
        if points > self.points_balance:
            raise ValueError("Solde de points insuffisant")
        
        self.points_balance -= points
        self.points_used += points
        self.save()
        
        # Créer transaction
        LoyaltyTransaction.objects.create(
            loyalty_account=self,
            type='debit',
            points=points,
            raison=raison,
            reference=reference,
            balance_apres=self.points_balance
        )
    
    def _update_niveau(self):
        """Mettre à jour le niveau selon les points lifetime"""
        if self.points_lifetime >= 50000:
            self.niveau = 'platine'
        elif self.points_lifetime >= 20000:
            self.niveau = 'or'
        elif self.points_lifetime >= 5000:
            self.niveau = 'argent'
        else:
            self.niveau = 'bronze'
    
    @property
    def valeur_fcfa(self):
        """Valeur en FCFA du solde de points"""
        config = LoyaltyConfig.get_config()
        return int(self.points_balance * config.fcfa_par_point)
    
    @classmethod
    def generate_code_parrainage(cls):
        """Générer un code de parrainage unique"""
        import random
        import string
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not cls.objects.filter(code_parrainage=code).exists():
                return code


class LoyaltyTransaction(TimeStampedSoftDeleteModel):
    """Historique des transactions de points"""
    
    TYPE_CHOICES = [
        ('credit', 'Crédit'),
        ('debit', 'Débit'),
    ]
    
    loyalty_account = models.ForeignKey(
        LoyaltyAccount,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    points = models.IntegerField()
    raison = models.CharField(max_length=255)
    reference = models.CharField(max_length=255, null=True, blank=True)
    balance_apres = models.IntegerField()
    
    class Meta:
        db_table = 'loyalty_transactions'
        verbose_name = 'Transaction Fidélité'
        verbose_name_plural = 'Transactions Fidélité'
        ordering = ['-created_at']
    
    def __str__(self):
        op = '+' if self.type == 'credit' else '-'
        return f"{op}{self.points} pts - {self.raison}"


class LoyaltyReward(TimeStampedSoftDeleteModel):
    """Récompenses disponibles contre des points"""
    
    titre = models.CharField(max_length=255)
    description = models.TextField()
    points_requis = models.IntegerField()
    
    type_recompense = models.CharField(
        max_length=20,
        choices=[
            ('reduction', 'Réduction en %'),
            ('montant_fixe', 'Montant fixe'),
            ('heure_gratuite', 'Heure gratuite'),
            ('cadeau', 'Cadeau physique'),
        ]
    )
    
    valeur = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Valeur de la réduction ou montant'
    )
    
    stock = models.IntegerField(
        null=True,
        blank=True,
        help_text='Stock disponible (null = illimité)'
    )
    
    est_actif = models.BooleanField(default=True)
    image_url = models.URLField(null=True, blank=True)
    
    class Meta:
        db_table = 'loyalty_rewards'
        verbose_name = 'Récompense Fidélité'
        verbose_name_plural = 'Récompenses Fidélité'
        ordering = ['points_requis']
    
    def __str__(self):
        return f"{self.titre} - {self.points_requis} pts"


class LoyaltyRedemption(TimeStampedSoftDeleteModel):
    """Échanges de points contre récompenses"""
    
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('validee', 'Validée'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    
    loyalty_account = models.ForeignKey(
        LoyaltyAccount,
        on_delete=models.CASCADE,
        related_name='redemptions'
    )
    
    reward = models.ForeignKey(
        LoyaltyReward,
        on_delete=models.CASCADE,
        related_name='redemptions'
    )
    
    points_utilises = models.IntegerField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    code_validation = models.CharField(max_length=20, unique=True)
    
    class Meta:
        db_table = 'loyalty_redemptions'
        verbose_name = 'Échange Fidélité'
        verbose_name_plural = 'Échanges Fidélité'
    
    def __str__(self):
        return f"{self.loyalty_account.user.nom_complet} - {self.reward.titre}"
