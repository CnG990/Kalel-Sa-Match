"""
Serializers pour la gestion des litiges
"""
from rest_framework import serializers
from .models import Litige, MessageLitige
from apps.accounts.serializers import UserSerializer


class MessageLitigeSerializer(serializers.ModelSerializer):
    """Serializer pour les messages de litige"""
    auteur = UserSerializer(read_only=True)
    auteur_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageLitige
        fields = [
            'id', 'litige', 'auteur', 'auteur_nom', 'contenu',
            'est_interne', 'pieces_jointes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'auteur']
    
    def get_auteur_nom(self, obj):
        return f"{obj.auteur.prenom} {obj.auteur.nom}"


class LitigeListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des litiges"""
    client_nom = serializers.SerializerMethodField()
    gestionnaire_nom = serializers.SerializerMethodField()
    terrain_nom = serializers.SerializerMethodField()
    nb_messages = serializers.SerializerMethodField()
    
    class Meta:
        model = Litige
        fields = [
            'id', 'titre', 'type_litige', 'description', 'statut', 'priorite',
            'client', 'client_nom', 'gestionnaire', 'gestionnaire_nom',
            'terrain', 'terrain_nom', 'reservation', 'nb_messages',
            'created_at', 'updated_at', 'date_resolution'
        ]
    
    def get_client_nom(self, obj):
        if obj.client:
            return f"{obj.client.prenom} {obj.client.nom}"
        return None
    
    def get_gestionnaire_nom(self, obj):
        if obj.gestionnaire:
            return f"{obj.gestionnaire.prenom} {obj.gestionnaire.nom}"
        return None
    
    def get_terrain_nom(self, obj):
        if obj.terrain:
            return obj.terrain.nom
        return None
    
    def get_nb_messages(self, obj):
        return obj.messages.count()


class LitigeDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un litige"""
    client = UserSerializer(read_only=True)
    gestionnaire = UserSerializer(read_only=True)
    admin_assigne = UserSerializer(read_only=True)
    messages = MessageLitigeSerializer(many=True, read_only=True)
    terrain_nom = serializers.SerializerMethodField()
    reservation_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Litige
        fields = [
            'id', 'titre', 'type_litige', 'description', 'statut', 'priorite',
            'client', 'gestionnaire', 'admin_assigne', 'reservation',
            'reservation_details', 'terrain', 'terrain_nom', 'resolution',
            'date_resolution', 'montant_rembourse', 'pieces_jointes',
            'notes_internes', 'messages', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_terrain_nom(self, obj):
        if obj.terrain:
            return obj.terrain.nom
        return None
    
    def get_reservation_details(self, obj):
        if obj.reservation:
            return {
                'id': obj.reservation.id,
                'date_debut': obj.reservation.date_debut.isoformat() if obj.reservation.date_debut else None,
                'date_fin': obj.reservation.date_fin.isoformat() if obj.reservation.date_fin else None,
                'statut': obj.reservation.statut,
                'montant_total': str(obj.reservation.montant_total),
            }
        return None


class LitigeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un litige"""
    
    class Meta:
        model = Litige
        fields = [
            'titre', 'type_litige', 'description', 'priorite',
            'gestionnaire', 'reservation', 'terrain', 'pieces_jointes'
        ]
    
    def validate(self, data):
        # Le client est automatiquement l'utilisateur connecté
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Utilisateur non authentifié")
        
        # Vérifier que l'utilisateur est un client
        if request.user.role != 'client':
            raise serializers.ValidationError("Seuls les clients peuvent créer des litiges")
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['client'] = request.user
        return super().create(validated_data)


class LitigeUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour d'un litige"""
    
    class Meta:
        model = Litige
        fields = [
            'statut', 'priorite', 'resolution', 'date_resolution',
            'montant_rembourse', 'notes_internes', 'admin_assigne'
        ]
    
    def validate(self, data):
        request = self.context.get('request')
        instance = self.instance
        
        # Vérifier les permissions
        if request.user.role == 'client':
            # Les clients ne peuvent que fermer leur propre litige ouvert
            if instance.client != request.user:
                raise serializers.ValidationError("Vous ne pouvez pas modifier ce litige")
            if 'statut' in data and data['statut'] not in ['ouvert', 'ferme']:
                raise serializers.ValidationError("Statut invalide pour un client")
        
        elif request.user.role == 'gestionnaire':
            # Les gestionnaires peuvent répondre à leurs litiges
            if instance.gestionnaire != request.user:
                raise serializers.ValidationError("Ce litige ne vous concerne pas")
            # Ne peuvent pas changer la priorité
            if 'priorite' in data:
                data.pop('priorite')
        
        # Seuls les admins peuvent tout modifier
        
        return data
