from rest_framework import serializers

from .models import (
    Abonnement,
    Notification,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
    ReponseTicket,
)


class TerrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainSynthetiquesDakar
        fields = [
            'id', 'nom', 'description', 'adresse', 'latitude', 'longitude',
            'image_principale', 'images_supplementaires', 'est_actif',
            'prix_heure', 'capacite', 'gestionnaire_id',
            'type_surface', 'longueur', 'largeur', 'nombre_joueurs',
            'eclairage', 'vestiaires', 'parking', 'douches', 'buvette',
            'telephone', 'ville', 'quartier',
            'horaires_ouverture', 'equipements',
            'type_acompte', 'pourcentage_acompte', 'montant_acompte_fixe',
            'created_at', 'updated_at',
        ]


class AbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abonnement
        fields = '__all__'


class SouscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Souscription
        fields = '__all__'


class TicketSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketSupport
        fields = '__all__'


class ReponseTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReponseTicket
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
