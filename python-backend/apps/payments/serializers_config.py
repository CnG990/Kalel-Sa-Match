"""
Serializers pour configuration des paiements admin
"""

from rest_framework import serializers
from .models_config import PaymentConfig, PaymentStats


class PaymentConfigSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()
    payment_identifier = serializers.ReadOnlyField()
    
    class Meta:
        model = PaymentConfig
        fields = [
            'id',
            'methode',
            'est_actif',
            'wave_payment_link',
            'wave_merchant_name',
            'wave_merchant_id',
            'orange_merchant_number',
            'orange_merchant_name',
            'commission_pourcentage',
            'instructions',
            'logo_url',
            'ordre_affichage',
            'display_name',
            'payment_identifier',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_wave_payment_link(self, value):
        """Valider le format du lien Wave"""
        if value and 'pay.wave.com' not in value:
            raise serializers.ValidationError("Le lien Wave doit être un lien pay.wave.com valide")
        return value
    
    def validate_orange_merchant_number(self, value):
        """Valider le format du numéro Orange Money"""
        if value:
            # Nettoyer les espaces
            cleaned = value.replace(' ', '').replace('-', '')
            if not cleaned.isdigit():
                raise serializers.ValidationError("Le numéro doit contenir uniquement des chiffres")
            if len(cleaned) < 9 or len(cleaned) > 12:
                raise serializers.ValidationError("Numéro invalide (9-12 chiffres attendus)")
        return value


class PaymentStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentStats
        fields = '__all__'


class PaymentConfigPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour le frontend (infos limitées)"""
    
    class Meta:
        model = PaymentConfig
        fields = [
            'id',
            'methode',
            'display_name',
            'instructions',
            'logo_url',
            'ordre_affichage'
        ]
