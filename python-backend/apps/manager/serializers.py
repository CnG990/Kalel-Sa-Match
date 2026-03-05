from rest_framework import serializers
from apps.terrains.models import TerrainSynthetiquesDakar, Reservation, Paiement


class ManagerTerrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainSynthetiquesDakar
        fields = '__all__'


class ManagerReservationSerializer(serializers.ModelSerializer):
    terrain = ManagerTerrainSerializer(read_only=True)
    
    class Meta:
        model = Reservation
        fields = '__all__'


class ManagerPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = '__all__'
