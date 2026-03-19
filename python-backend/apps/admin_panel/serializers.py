from rest_framework import serializers
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.terrains.models import (
    TerrainSynthetiquesDakar,
    TicketSupport,
    Notification,
    Abonnement,
    Souscription,
)
from apps.reservations.models import Reservation
from apps.payments.models import Payment
from apps.payments.serializers import PaymentSerializer


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class AdminTerrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainSynthetiquesDakar
        fields = '__all__'


class AdminReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    terrain = serializers.SerializerMethodField()
    notes_admin = serializers.CharField(source='validation_notes', allow_blank=True, required=False)
    derniere_validation = serializers.DateTimeField(source='date_validation', read_only=True)
    paiements = serializers.SerializerMethodField()
    has_ticket = serializers.SerializerMethodField()
    ticket_validated = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'terrain', 'terrain_id', 'user', 'user_id',
            'date_debut', 'date_fin', 'duree_heures',
            'montant_total', 'montant_acompte', 'montant_restant',
            'acompte_paye', 'solde_paye',
            'statut', 'notes', 'notes_admin',
            'code_ticket', 'derniere_validation', 'date_annulation', 'motif_annulation',
            'created_at', 'updated_at',
            'paiements', 'has_ticket', 'ticket_validated',
        ]

    def get_terrain(self, obj):
        terrain = getattr(obj, 'terrain', None)
        if not terrain:
            return None
        terrain_info = {
            'id': terrain.id,
            'nom': terrain.nom,
            'adresse': getattr(terrain, 'adresse', ''),
            'terrain_synthetique': {
                'nom': getattr(terrain, 'nom', ''),
                'adresse': getattr(terrain, 'adresse', '')
            }
        }
        return terrain_info

    def _serialize_payment(self, payment):
        if not payment:
            return None
        return PaymentSerializer(payment).data

    def get_paiements(self, obj):
        payments = []
        if obj.paiement_acompte:
            payments.append(self._serialize_payment(obj.paiement_acompte))
        if obj.paiement_solde:
            payments.append(self._serialize_payment(obj.paiement_solde))
        if obj.paiement:
            payments.append(self._serialize_payment(obj.paiement))
        return [p for p in payments if p]

    def get_has_ticket(self, obj):
        return bool(obj.code_ticket)

    def get_ticket_validated(self, obj):
        return bool(obj.date_validation)


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
