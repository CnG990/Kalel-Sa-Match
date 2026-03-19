from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from .models import (
    Abonnement,
    Notification,
    PlanAbonnement,
    DemandeAbonnement,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
    ReponseTicket,
    Commission,
    PaiementAbonnement,
)


class TerrainSerializer(serializers.ModelSerializer):
    # Autoriser plusieurs formats de jeu (ex: "5v5, 7v7") sans appliquer les choices strictes
    nombre_joueurs = serializers.CharField(required=False, allow_blank=True, max_length=100)
    gestionnaire = UserSerializer(read_only=True)

    class Meta:
        model = TerrainSynthetiquesDakar
        fields = [
            'id', 'nom', 'description', 'adresse', 'latitude', 'longitude',
            'image_principale', 'images_supplementaires', 'est_actif',
            'prix_heure', 'capacite', 'gestionnaire_id',
            'gestionnaire',
            'type_surface', 'longueur', 'largeur', 'nombre_joueurs',
            'eclairage', 'vestiaires', 'parking', 'douches', 'buvette',
            'telephone', 'ville', 'quartier',
            'taux_commission',
            'horaires_ouverture', 'equipements',
            'type_acompte', 'pourcentage_acompte', 'montant_acompte_fixe',
            'created_at', 'updated_at',
        ]


class AbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abonnement
        fields = '__all__'


class PlanAbonnementSerializer(serializers.ModelSerializer):
    terrain = TerrainSerializer(read_only=True)
    terrain_id = serializers.PrimaryKeyRelatedField(
        source='terrain', queryset=TerrainSynthetiquesDakar.objects.all(), write_only=True
    )

    class Meta:
        model = PlanAbonnement
        fields = [
            'id',
            'terrain',
            'terrain_id',
            'nom',
            'description',
            'type_abonnement',
            'duree_jours',
            'prix',
            'reduction_percent',
            'avantages',
            'actif',
            'created_at',
            'updated_at',
            'deleted_at',
        ]
        read_only_fields = ('id', 'terrain', 'created_at', 'updated_at', 'deleted_at')


class DemandeAbonnementSerializer(serializers.ModelSerializer):
    plan = PlanAbonnementSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        source='plan', queryset=PlanAbonnement.objects.select_related('terrain'), write_only=True, required=False, allow_null=True
    )
    terrain = TerrainSerializer(read_only=True)
    terrain_id = serializers.PrimaryKeyRelatedField(
        source='terrain', queryset=TerrainSynthetiquesDakar.objects.all(), write_only=True
    )
    user_info = UserSerializer(source='user', read_only=True)
    paiements = serializers.SerializerMethodField()

    class Meta:
        model = DemandeAbonnement
        fields = [
            'id',
            'user',
            'user_info',
            'terrain',
            'terrain_id',
            'plan',
            'plan_id',
            'mode_paiement',
            'nb_seances',
            'duree_seance',
            'jours_preferes',
            'creneaux_preferes',
            'prix_calcule',
            'montant_acompte',
            'montant_paye',
            'nb_seances_payees',
            'statut_paiement',
            'statut',
            'disponibilite_confirmee',
            'notes_manager',
            'date_debut',
            'date_fin',
            'paiements',
            'created_at',
            'updated_at',
            'deleted_at',
        ]
        read_only_fields = (
            'id',
            'user',
            'user_info',
            'terrain',
            'plan',
            'prix_calcule',
            'montant_paye',
            'nb_seances_payees',
            'statut_paiement',
            'statut',
            'disponibilite_confirmee',
            'notes_manager',
            'paiements',
            'created_at',
            'updated_at',
            'deleted_at',
        )

    def get_paiements(self, obj):
        return PaiementAbonnementSerializer(obj.paiements.all(), many=True).data

    def validate(self, attrs):
        plan = attrs.get('plan')
        terrain = attrs.get('terrain')
        if plan is not None:
            plan_terrain = plan.terrain
            if terrain is None:
                attrs['terrain'] = plan_terrain
            elif terrain != plan_terrain:
                raise serializers.ValidationError('Le terrain sélectionné ne correspond pas au plan choisi.')
        elif terrain is None:
            raise serializers.ValidationError('Le terrain est obligatoire.')
        return attrs


class SouscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Souscription
        fields = '__all__'


class TicketSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketSupport
        fields = '__all__'


class ReponseTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReponseTicket
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class CommissionSerializer(serializers.ModelSerializer):
    gestionnaire_info = UserSerializer(source='gestionnaire', read_only=True)
    terrain_info = TerrainSerializer(source='terrain', read_only=True)

    class Meta:
        model = Commission
        fields = [
            'id',
            'gestionnaire',
            'gestionnaire_info',
            'terrain',
            'terrain_info',
            'source',
            'periode',
            'date_debut_periode',
            'date_fin_periode',
            'montant_revenus_reservations',
            'montant_revenus_abonnements',
            'montant_revenus',
            'nb_reservations',
            'nb_abonnements',
            'taux_commission',
            'montant_commission',
            'statut',
            'date_paiement',
            'reference_paiement',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'montant_commission', 'created_at', 'updated_at')


class PaiementAbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaiementAbonnement
        fields = [
            'id',
            'demande',
            'type_paiement',
            'montant',
            'date_paiement',
            'numero_seance',
            'reference_paiement',
            'notes',
            'created_at',
        ]
        read_only_fields = ('id', 'date_paiement', 'created_at')
