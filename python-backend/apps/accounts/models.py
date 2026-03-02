from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('L\'email est requis')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', User.Role.CLIENT)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrateur'
        GESTIONNAIRE = 'gestionnaire', 'Gestionnaire'
        CLIENT = 'client', 'Client'

    class StatutValidation(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        APPROUVE = 'approuve', 'Approuvé'
        REJETE = 'rejete', 'Rejeté'
        SUSPENDU = 'suspendu', 'Suspendu'

    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=32, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    statut_validation = models.CharField(
        max_length=20, choices=StatutValidation.choices, default=StatutValidation.EN_ATTENTE
    )
    mot_de_passe = models.CharField(max_length=255)
    nom_entreprise = models.CharField(max_length=255, null=True, blank=True)
    numero_ninea = models.CharField(max_length=50, null=True, blank=True)
    numero_registre_commerce = models.CharField(max_length=50, null=True, blank=True)
    adresse_entreprise = models.CharField(max_length=255, null=True, blank=True)
    documents_legaux = models.JSONField(null=True, blank=True)
    taux_commission_defaut = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    slogan = models.CharField(max_length=255, null=True, blank=True)
    profile_image_url = models.URLField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=['deleted_at', 'is_active'])

    @property
    def nom_complet(self) -> str:
        return f"{self.prenom} {self.nom}".strip()

    def set_password(self, raw_password):
        super().set_password(raw_password)
        self.mot_de_passe = self.password

# Create your models here.
