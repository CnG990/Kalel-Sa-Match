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
    
    # Champs manquants pour la tarification
    prix_heure = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Prix par heure en FCFA')
    capacite = models.PositiveIntegerField(null=True, blank=True, help_text='Capacité maximale du terrain')
    
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


class Reservation(TimeStampedSoftDeleteModel):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
    ]

    terrain = models.ForeignKey(
        TerrainSynthetiquesDakar,
        on_delete=models.CASCADE,
        related_name='reservations',
    )
    terrain_synthetique = models.ForeignKey(
        TerrainSynthetiquesDakar,
        db_column='terrain_synthetique_id',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reservations_legacies',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations',
    )
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    notes = models.TextField(blank=True)
    qr_code_path = models.CharField(max_length=255, blank=True)
    qr_code_token = models.CharField(max_length=255, blank=True)
    code_ticket = models.CharField(max_length=20, blank=True)
    derniere_validation = models.DateTimeField(null=True, blank=True)
    date_annulation = models.DateTimeField(null=True, blank=True)
    motif_annulation = models.TextField(blank=True)
    annule_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        db_column='annule_par',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reservations_annulees',
    )
    heures_avant_annulation = models.FloatField(null=True, blank=True)
    acompte_verse = models.BooleanField(default=False)

    class Meta:
        db_table = 'reservations'
        ordering = ('-date_debut',)

    def __str__(self) -> str:  # pragma: no cover
        return f"Reservation #{self.pk}"


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


class Paiement(TimeStampedSoftDeleteModel):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('reussi', 'Réussi'),
        ('echoue', 'Échoué'),
        ('rembourse', 'Remboursé'),
    ]
    METHODE_CHOICES = [
        ('carte', 'Carte'),
        ('mobile_money', 'Mobile Money'),
        ('especes', 'Espèces'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='paiements')
    payable_id = models.PositiveBigIntegerField()
    payable_type = models.CharField(max_length=255)
    reference_transaction = models.CharField(max_length=255, unique=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    methode = models.CharField(max_length=50, choices=METHODE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    details_transaction = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'paiements'


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
    'Reservation',
    'Abonnement',
    'Souscription',
    'Paiement',
    'TicketSupport',
    'ReponseTicket',
    'Notification',
]
