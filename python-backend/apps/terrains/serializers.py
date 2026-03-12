from rest_framework import serializers

from .models import (
    Abonnement,
    Notification,
    PlanAbonnement,
    DemandeAbonnement,
    Souscription,
    TerrainSynthetiquesDakar,
    TicketSupport,
    ReponseTicket,
)


class TerrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainSynthetiquesDakar
        fields = [
            'id', 'nom', 'description', 'adresse', 'latitude', 'longitude',
            'image_principale', 'images_supplementaires', 'est_actif',
            'prix_heure', 'capacite', 'gestionnaire_id',
            'type_surface', 'longueur', 'largeur', 'nombre_joueurs',
            'eclairage', 'vestiaires', 'parking', 'douches', 'buvette',
            'telephone', 'ville', 'quartier',
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
        source='plan', queryset=PlanAbonnement.objects.select_related('terrain'), write_only=True
    )
    terrain = TerrainSerializer(read_only=True)
    terrain_id = serializers.PrimaryKeyRelatedField(
        source='terrain', queryset=TerrainSynthetiquesDakar.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = DemandeAbonnement
        fields = [
            'id',
            'user',
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
            'statut',
            'disponibilite_confirmee',
            'notes_manager',
            'created_at',
            'updated_at',
            'deleted_at',
        ]
        read_only_fields = (
            'id',
            'user',
            'terrain',
            'plan',
            'prix_calcule',
            'statut',
            'disponibilite_confirmee',
            'notes_manager',
            'created_at',
            'updated_at',
            'deleted_at',
        )

    def validate(self, attrs):
        plan = attrs.get('plan')
        terrain = attrs.get('terrain')
        if plan is not None:
            plan_terrain = plan.terrain
            if terrain is None:
                attrs['terrain'] = plan_terrain
            elif terrain != plan_terrain:
                raise serializers.ValidationError('Le terrain sélectionné ne correspond pas au plan choisi.')
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
