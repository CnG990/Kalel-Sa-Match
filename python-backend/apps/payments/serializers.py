from rest_framework import serializers
from .models import Payment, WavePayment, OrangeMoneyPayment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'reference', 'montant', 'methode', 'statut', 
            'transaction_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reference', 'transaction_id', 'created_at', 'updated_at']


class WavePaymentSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = WavePayment
        fields = '__all__'


class OrangeMoneyPaymentSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = OrangeMoneyPayment
        fields = '__all__'


class InitPaymentSerializer(serializers.Serializer):
    """Serializer pour l'initialisation d'un paiement"""
    montant = serializers.DecimalField(max_digits=10, decimal_places=2)
    methode = serializers.ChoiceField(choices=Payment.METHODE_CHOICES)
    customer_phone = serializers.CharField(max_length=20)
    customer_name = serializers.CharField(max_length=255)
    # Pour les réservations
    reservation_id = serializers.IntegerField(required=False)
    # Pour les abonnements
    abonnement_id = serializers.IntegerField(required=False)
