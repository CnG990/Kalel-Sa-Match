from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import datetime, timedelta

from apps.terrains.models import TimeStampedSoftDeleteModel, TerrainSynthetiquesDakar
from apps.accounts.models import User


class Reservation(TimeStampedSoftDeleteModel):
    """Modèle de réservation de terrain"""
    STATUT_CHOICES = [
        ('en_attente', 'En attente de paiement'),
        ('acompte_paye', 'Acompte payé - Solde à payer'),
        ('confirmee', 'Confirmée (entièrement payée)'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
        ('en_cours', 'En cours'),
    ]
    
    terrain = models.ForeignKey(
        TerrainSynthetiquesDakar,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    duree_heures = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Durée en heures"
    )
    
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Acompte et solde
    montant_acompte = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Montant de l\'acompte à payer'
    )
    montant_restant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Solde restant à payer'
    )
    acompte_paye = models.BooleanField(
        default=False,
        help_text='L\'acompte a été payé'
    )
    solde_paye = models.BooleanField(
        default=False,
        help_text='Le solde a été payé'
    )
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )
    
    # Informations de contact
    telephone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    
    # QR Code et validation
    qr_code_token = models.CharField(max_length=255, unique=True, blank=True)
    qr_code_path = models.CharField(max_length=255, blank=True)
    code_ticket = models.CharField(max_length=20, blank=True)
    
    # Validation
    valide_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservations_valides'
    )
    date_validation = models.DateTimeField(null=True, blank=True)
    
    # Annulation
    date_annulation = models.DateTimeField(null=True, blank=True)
    motif_annulation = models.TextField(blank=True)
    annule_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservations_annulees'
    )
    
    # Paiements séparés (acompte et solde)
    paiement_acompte = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservation_acompte',
        help_text='Paiement de l\'acompte'
    )
    paiement_solde = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservation_solde',
        help_text='Paiement du solde'
    )
    
    # DEPRECATED - Ancien champ paiement unique (gardé pour compatibilité migration)
    paiement = models.OneToOneField(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservation_legacy'
    )
    
    class Meta:
        db_table = 'reservations'
        ordering = ['-date_debut']
        indexes = [
            models.Index(fields=['terrain', 'date_debut']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['statut']),
            models.Index(fields=['qr_code_token']),
        ]
    
    def __str__(self):
        return f"Réservation {self.id} - {self.terrain.nom}"
    
    @property
    def est_terminee(self):
        """Vérifie si la réservation est terminée"""
        return self.date_fin < timezone.now()
    
    @property
    def est_valide(self):
        """Vérifie si la réservation est valide pour aujourd'hui"""
        now = timezone.now()
        return (
            self.statut == 'confirmee' and
            self.date_debut <= now <= self.date_fin
        )
    
    def generer_qr_code_token(self):
        """Générer un token unique pour le QR code"""
        import uuid
        self.qr_code_token = str(uuid.uuid4())
        self.save()
        return self.qr_code_token
    
    def valider(self, utilisateur):
        """Valider la réservation"""
        self.statut = 'confirmee'
        self.valide_par = utilisateur
        self.date_validation = timezone.now()
        self.save()
    
    def annuler(self, motif, utilisateur=None):
        """Annuler la réservation"""
        self.statut = 'annulee'
        self.date_annulation = timezone.now()
        self.motif_annulation = motif
        if utilisateur:
            self.annule_par = utilisateur
        self.save()


class Disponibilite(TimeStampedSoftDeleteModel):
    """Modèle pour gérer les disponibilités des terrains"""
    terrain = models.ForeignKey(
        TerrainSynthetiquesDakar,
        on_delete=models.CASCADE,
        related_name='disponibilites'
    )
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    est_disponible = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'disponibilites'
        unique_together = ['terrain', 'date', 'heure_debut', 'heure_fin']
        indexes = [
            models.Index(fields=['terrain', 'date']),
        ]
    
    def __str__(self):
        return f"{self.terrain.nom} - {self.date} {self.heure_debut}-{self.heure_fin}"


class CreneauReservation(TimeStampedSoftDeleteModel):
    """Créneaux de réservation disponibles pour un terrain"""
    terrain = models.ForeignKey(
        TerrainSynthetiquesDakar,
        on_delete=models.CASCADE,
        related_name='creneaux'
    )
    jour_semaine = models.IntegerField(
        choices=[
            (1, 'Lundi'),
            (2, 'Mardi'),
            (3, 'Mercredi'),
            (4, 'Jeudi'),
            (5, 'Vendredi'),
            (6, 'Samedi'),
            (7, 'Dimanche'),
        ]
    )
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    est_actif = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'creneaux_reservation'
        unique_together = ['terrain', 'jour_semaine', 'heure_debut', 'heure_fin']
        ordering = ['jour_semaine', 'heure_debut']
    
    def __str__(self):
        return f"{self.terrain.nom} - {self.get_jour_semaine_display()} {self.heure_debut}-{self.heure_fin}"
