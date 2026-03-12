from rest_framework import serializers
from .models import Payment, WavePayment


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


class InitPaymentSerializer(serializers.Serializer):
    """Serializer pour l'initialisation d'un paiement"""
    payment_id = serializers.IntegerField(required=False, help_text="ID d'un paiement existant à initialiser")
    montant = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, help_text="Montant si création d'un nouveau paiement")
    methode = serializers.ChoiceField(choices=Payment.METHODE_CHOICES)
    customer_phone = serializers.CharField(max_length=20)
    customer_name = serializers.CharField(max_length=255)
    # Pour les réservations
    reservation_id = serializers.IntegerField(required=False)
    # Pour les abonnements
    abonnement_id = serializers.IntegerField(required=False)
    
    def validate(self, attrs):
        """Valider que payment_id OU montant est fourni"""
        payment_id = attrs.get('payment_id')
        montant = attrs.get('montant')
        
        if not payment_id and not montant:
            raise serializers.ValidationError("payment_id ou montant est requis")
        
        return attrs
