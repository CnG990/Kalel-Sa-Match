import logging

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'role', 'statut_validation',
            'nom_entreprise', 'numero_ninea', 'numero_registre_commerce', 'adresse_entreprise',
            'documents_legaux', 'taux_commission_defaut', 'wave_payment_link', 'wave_contact_label',
            'date_validation', 'email_verified_at',
            'slogan', 'profile_image_url', 'nom_complet', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'role', 'statut_validation', 'nom_complet', 'created_at', 'updated_at']

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request') if hasattr(self, 'context') else None
        if not request or not getattr(request.user, 'is_authenticated', False) or request.user.role != User.Role.ADMIN:
            fields.pop('wave_payment_link', None)
            fields.pop('wave_contact_label', None)
        return fields


class RegisterSerializer(serializers.ModelSerializer):
    mot_de_passe = serializers.CharField(write_only=True, min_length=8, required=False)
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = ['nom', 'prenom', 'email', 'telephone', 'role', 'mot_de_passe', 'password']

    def validate(self, attrs):
        # Accepter 'password' comme alias de 'mot_de_passe'
        password = attrs.pop('password', None)
        mot_de_passe = attrs.get('mot_de_passe')
        if not mot_de_passe and password:
            attrs['mot_de_passe'] = password
        elif not mot_de_passe and not password:
            raise serializers.ValidationError({'password': 'Le mot de passe est obligatoire.'})
        return attrs

    def create(self, validated_data):
        mot_de_passe = validated_data.pop('mot_de_passe')
        user = User(**validated_data)
        user.set_password(mot_de_passe)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['nom'] = user.nom
        token['prenom'] = user.prenom
        return token

    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            serializer_context = getattr(self, 'context', {}) or {}
            user_data = UserSerializer(self.user, context=serializer_context).data
            data['user'] = user_data
            logger.info(f'Login successful for user: {self.user.email}, role: {self.user.role}')
            logger.info(f'Returning data keys: {list(data.keys())}')
            logger.info(f'Token present: {"access" in data and "refresh" in data}')
            return data
        except Exception:
            logger.exception('Unexpected error during login serialization')
            raise
