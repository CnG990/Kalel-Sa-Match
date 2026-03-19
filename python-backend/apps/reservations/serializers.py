from rest_framework import serializers
from datetime import datetime, timedelta
from .models import Reservation, Disponibilite, CreneauReservation


class ReservationSerializer(serializers.ModelSerializer):
    terrain_nom = serializers.CharField(source='terrain.nom', read_only=True)
    terrain_adresse = serializers.CharField(source='terrain.adresse', read_only=True)
    terrain_image = serializers.CharField(source='terrain.image_principale', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_nom = serializers.SerializerMethodField()
    duree = serializers.SerializerMethodField()
    paiement_acompte_id = serializers.SerializerMethodField()
    paiement_solde_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'terrain', 'terrain_nom', 'terrain_adresse', 'terrain_image',
            'user', 'user_email', 'user_nom',
            'date_debut', 'date_fin', 'duree_heures', 'duree',
            'montant_total', 'montant_acompte', 'montant_restant',
            'acompte_paye', 'solde_paye',
            'paiement_acompte_id', 'paiement_solde_id',
            'statut', 'telephone', 'notes',
            'qr_code_token', 'code_ticket', 'valide_par',
            'date_validation', 'date_annulation', 'motif_annulation',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'qr_code_token', 'code_ticket', 'created_at', 'updated_at']
    
    def get_user_nom(self, obj):
        return f"{obj.user.prenom} {obj.user.nom}"
    
    def get_duree(self, obj):
        return f"{obj.duree_heures}h"

    def get_paiement_acompte_id(self, obj):
        return obj.paiement_acompte.id if obj.paiement_acompte else None

    def get_paiement_solde_id(self, obj):
        return obj.paiement_solde.id if obj.paiement_solde else None


class CreneauReservationSerializer(serializers.ModelSerializer):
    terrain_nom = serializers.CharField(source='terrain.nom', read_only=True)
    
    class Meta:
        model = CreneauReservation
        fields = [
            'id', 'terrain', 'terrain_nom', 'jour_semaine',
            'heure_debut', 'heure_fin', 'est_actif'
        ]


class DisponibiliteSerializer(serializers.ModelSerializer):
    terrain_nom = serializers.CharField(source='terrain.nom', read_only=True)
    
    class Meta:
        model = Disponibilite
        fields = [
            'id', 'terrain', 'terrain_nom', 'date',
            'heure_debut', 'heure_fin', 'est_disponible'
        ]


class CreateReservationSerializer(serializers.Serializer):
    """Serializer pour la création de réservation"""
    terrain_id = serializers.IntegerField()
    date_debut = serializers.DateTimeField()
    duree_heures = serializers.IntegerField(min_value=1)
    telephone = serializers.CharField(max_length=20, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        date_debut = attrs['date_debut']
        duree = attrs['duree_heures']
        
        # Calculer la date de fin
        date_fin = date_debut + timedelta(hours=duree)
        
        # Validation de la date
        from django.utils import timezone
        if date_debut < timezone.now():
            raise serializers.ValidationError("La date de début ne peut pas être dans le passé")
        
        if date_fin < timezone.now():
            raise serializers.ValidationError("La date de fin ne peut pas être dans le passé")
        
        attrs['date_fin'] = date_fin
        return attrs


class CheckDisponibiliteSerializer(serializers.Serializer):
    """Serializer pour vérifier la disponibilité"""
    terrain_id = serializers.IntegerField()
    date = serializers.DateField()
    heure_debut = serializers.TimeField()
    heure_fin = serializers.TimeField()
    duree_heures = serializers.IntegerField(min_value=1)
