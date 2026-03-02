from rest_framework import serializers

from .models import (
    Abonnement,
    Notification,
    Paiement,
    Reservation,
    ReponseTicket,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
)


class TerrainSerializer(serializers.ModelSerializer):
    gestionnaire_nom = serializers.CharField(source='gestionnaire.nom', read_only=True)

    class Meta:
        model = TerrainSynthetiquesDakar
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    terrain = TerrainSerializer(read_only=True)
    terrain_id = serializers.PrimaryKeyRelatedField(
        source='terrain', queryset=TerrainSynthetiquesDakar.objects.all(), write_only=True
    )

    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ('code_ticket', 'qr_code_token')


class AbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abonnement
        fields = '__all__'


class SouscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Souscription
        fields = '__all__'


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
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
