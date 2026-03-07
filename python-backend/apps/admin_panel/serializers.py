from rest_framework import serializers
from apps.accounts.models import User
from apps.terrains.models import (
    TerrainSynthetiquesDakar,
    TicketSupport,
    Notification,
    Abonnement,
    Souscription,
)
from apps.reservations.models import Reservation
from apps.payments.models import Payment


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class AdminTerrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainSynthetiquesDakar
        fields = '__all__'


class AdminReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'


class AdminPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class AdminTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketSupport
        fields = '__all__'


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class AdminAbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abonnement
        fields = '__all__'


class AdminSouscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Souscription
        fields = '__all__'
