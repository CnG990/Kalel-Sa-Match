from django.conf import settings
from django.db import models


class TimeStampedSoftDeleteModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class TerrainSynthetiquesDakar(TimeStampedSoftDeleteModel):
    nom = models.CharField(max_length=255)
    description = models.TextField()
    adresse = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    image_principale = models.CharField(max_length=255)
    images_supplementaires = models.JSONField(default=list, blank=True)
    est_actif = models.BooleanField(default=True)
    
    # Champs pour la tarification
    prix_heure = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Prix par heure en FCFA')
    capacite = models.PositiveIntegerField(null=True, blank=True, help_text='Capacité maximale du terrain')
    
    # Configuration acompte
    TYPE_ACOMPTE_CHOICES = [
        ('pourcentage', 'Pourcentage'),
        ('montant_fixe', 'Montant fixe'),
    ]
    type_acompte = models.CharField(
        max_length=20,
        choices=TYPE_ACOMPTE_CHOICES,
        default='pourcentage',
        help_text='Type d\'acompte requis'
    )
    pourcentage_acompte = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=30.00,
        help_text='Pourcentage d\'acompte requis (ex: 30.00 pour 30%)'
    )
    montant_acompte_fixe = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Montant fixe d\'acompte en FCFA (alternatif au pourcentage)'
    )
    
    # Liens de paiement personnalisés du gestionnaire
    wave_payment_link = models.URLField(
        max_length=500,
        blank=True,
        help_text='Lien Wave Business personnel du gestionnaire'
    )
    orange_money_number = models.CharField(
        max_length=20,
        blank=True,
        help_text='Numéro Orange Money du gestionnaire'
    )
    
    # Horaires et équipements (optionnel)
    horaires_ouverture = models.JSONField(
        default=dict,
        blank=True,
        help_text='Horaires d\'ouverture par jour'
    )
    equipements = models.JSONField(
        default=list,
        blank=True,
        help_text='Liste des équipements disponibles'
    )
    
    gestionnaire = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='terrains_gestionnaire',
    )

    class Meta:
        db_table = 'terrains_synthetiques_dakar'
        verbose_name = 'Terrain synthétique'
        verbose_name_plural = 'Terrains synthétiques'

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return self.nom


class Abonnement(TimeStampedSoftDeleteModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='abonnements')
    terrain = models.ForeignKey(TerrainSynthetiquesDakar, on_delete=models.CASCADE, related_name='abonnements')
    type_abonnement = models.CharField(max_length=100)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    statut = models.CharField(max_length=50, default='en_attente_paiement')

    class Meta:
        db_table = 'abonnements'


class Souscription(TimeStampedSoftDeleteModel):
    STATUT_CHOICES = [
        ('active', 'Active'),
        ('expiree', 'Expirée'),
        ('annulee', 'Annulée'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='souscriptions')
    abonnement = models.ForeignKey(Abonnement, on_delete=models.CASCADE, related_name='souscriptions')
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='active')

    class Meta:
        db_table = 'souscriptions'


# DEPRECATED: Paiement model moved to apps.payments.models.Payment
# This model is kept for backward compatibility but should not be used
# Use apps.payments.models.Payment instead


class TicketSupport(TimeStampedSoftDeleteModel):
    PRIORITE_CHOICES = [
        ('basse', 'Basse'),
        ('moyenne', 'Moyenne'),
        ('haute', 'Haute'),
    ]
    STATUT_CHOICES = [
        ('ouvert', 'Ouvert'),
        ('en_cours', 'En cours'),
        ('resolu', 'Résolu'),
        ('ferme', 'Fermé'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets_support')
    sujet = models.CharField(max_length=255)
    description = models.TextField()
    priorite = models.CharField(max_length=10, choices=PRIORITE_CHOICES, default='moyenne')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ouvert')

    class Meta:
        db_table = 'tickets_support'


class ReponseTicket(TimeStampedSoftDeleteModel):
    ticket = models.ForeignKey(TicketSupport, on_delete=models.CASCADE, related_name='reponses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reponses_tickets')
    contenu = models.TextField()
    est_reponse_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'reponses_tickets'


class Notification(TimeStampedSoftDeleteModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=100)
    est_lu = models.BooleanField(default=False)
    lu_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notifications'


__all__ = [
    'TerrainSynthetiquesDakar',
    'Abonnement',
    'Souscription',
    'TicketSupport',
    'ReponseTicket',
    'Notification',
]
