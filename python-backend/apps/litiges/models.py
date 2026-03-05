"""
Modèles pour la gestion des litiges entre clients et gestionnaires
"""
from django.db import models
from apps.core.models import TimeStampedSoftDeleteModel


class Litige(TimeStampedSoftDeleteModel):
    """
    Modèle représentant un litige/dispute entre un client et un gestionnaire
    """
    STATUT_CHOICES = [
        ('ouvert', 'Ouvert'),
        ('en_cours', 'En cours de traitement'),
        ('resolu', 'Résolu'),
        ('ferme', 'Fermé'),
    ]
    
    PRIORITE_CHOICES = [
        ('basse', 'Basse'),
        ('moyenne', 'Moyenne'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]
    
    TYPE_CHOICES = [
        ('annulation', 'Problème d\'annulation'),
        ('remboursement', 'Demande de remboursement'),
        ('qualite', 'Problème de qualité du terrain'),
        ('service', 'Problème de service'),
        ('facturation', 'Problème de facturation'),
        ('autre', 'Autre'),
    ]
    
    # Relations
    client = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='litiges_crees',
        help_text='Client ayant créé le litige'
    )
    
    gestionnaire = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='litiges_recus',
        null=True,
        blank=True,
        help_text='Gestionnaire concerné par le litige'
    )
    
    reservation = models.ForeignKey(
        'reservations.Reservation',
        on_delete=models.SET_NULL,
        related_name='litiges',
        null=True,
        blank=True,
        help_text='Réservation concernée par le litige'
    )
    
    terrain = models.ForeignKey(
        'terrains.TerrainSynthetiquesDakar',
        on_delete=models.SET_NULL,
        related_name='litiges',
        null=True,
        blank=True,
        help_text='Terrain concerné'
    )
    
    admin_assigne = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        related_name='litiges_assignes',
        null=True,
        blank=True,
        help_text='Admin assigné au traitement du litige'
    )
    
    # Informations du litige
    titre = models.CharField(
        max_length=200,
        help_text='Titre court du litige'
    )
    
    type_litige = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='autre',
        help_text='Type de litige'
    )
    
    description = models.TextField(
        help_text='Description détaillée du problème'
    )
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='ouvert',
        help_text='Statut actuel du litige'
    )
    
    priorite = models.CharField(
        max_length=20,
        choices=PRIORITE_CHOICES,
        default='moyenne',
        help_text='Niveau de priorité'
    )
    
    # Résolution
    resolution = models.TextField(
        blank=True,
        null=True,
        help_text='Description de la résolution apportée'
    )
    
    date_resolution = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date de résolution du litige'
    )
    
    montant_rembourse = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Montant remboursé si applicable'
    )
    
    # Métadonnées
    pieces_jointes = models.JSONField(
        default=list,
        blank=True,
        help_text='URLs des pièces jointes (screenshots, etc.)'
    )
    
    notes_internes = models.TextField(
        blank=True,
        null=True,
        help_text='Notes internes visibles uniquement par les admins'
    )
    
    class Meta:
        db_table = 'litiges'
        verbose_name = 'Litige'
        verbose_name_plural = 'Litiges'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['statut', '-created_at']),
            models.Index(fields=['client', '-created_at']),
            models.Index(fields=['gestionnaire', '-created_at']),
            models.Index(fields=['priorite', 'statut']),
        ]
    
    def __str__(self):
        return f"Litige #{self.id} - {self.titre} ({self.get_statut_display()})"
    
    def peut_etre_modifie_par(self, user):
        """Vérifie si l'utilisateur peut modifier ce litige"""
        if user.role == 'admin':
            return True
        if user.role == 'client' and user == self.client and self.statut == 'ouvert':
            return True
        if user.role == 'gestionnaire' and user == self.gestionnaire:
            return True
        return False


class MessageLitige(TimeStampedSoftDeleteModel):
    """
    Modèle représentant un message/commentaire dans un litige
    """
    litige = models.ForeignKey(
        Litige,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text='Litige concerné'
    )
    
    auteur = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='messages_litiges',
        help_text='Auteur du message'
    )
    
    contenu = models.TextField(
        help_text='Contenu du message'
    )
    
    est_interne = models.BooleanField(
        default=False,
        help_text='Message visible uniquement par les admins'
    )
    
    pieces_jointes = models.JSONField(
        default=list,
        blank=True,
        help_text='URLs des pièces jointes'
    )
    
    class Meta:
        db_table = 'messages_litiges'
        verbose_name = 'Message de litige'
        verbose_name_plural = 'Messages de litiges'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['litige', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message de {self.auteur} sur litige #{self.litige.id}"
