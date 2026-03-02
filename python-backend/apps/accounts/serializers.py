from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'role', 'statut_validation',
            'nom_entreprise', 'numero_ninea', 'numero_registre_commerce', 'adresse_entreprise',
            'documents_legaux', 'taux_commission_defaut', 'date_validation', 'email_verified_at',
            'slogan', 'profile_image_url', 'nom_complet', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'role', 'statut_validation', 'nom_complet', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    mot_de_passe = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['nom', 'prenom', 'email', 'telephone', 'role', 'mot_de_passe']

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
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
