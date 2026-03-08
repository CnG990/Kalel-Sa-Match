from rest_framework import serializers
from apps.terrains.models import TerrainSynthetiquesDakar
from apps.reservations.models import Reservation
from apps.payments.models import Payment


class ManagerTerrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainSynthetiquesDakar
        fields = '__all__'


class ManagerReservationSerializer(serializers.ModelSerializer):
    terrain = ManagerTerrainSerializer(read_only=True)
    client = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = '__all__'

    def get_client(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'nom': obj.user.nom,
                'prenom': obj.user.prenom,
                'email': obj.user.email,
                'telephone': getattr(obj.user, 'telephone', ''),
            }
        return None


class ManagerPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
