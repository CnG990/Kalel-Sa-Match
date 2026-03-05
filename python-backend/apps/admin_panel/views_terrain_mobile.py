"""
Endpoint admin pour ajouter un terrain sur place avec géolocalisation mobile
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.terrains.models import TerrainSynthetiquesDakar
from apps.terrains.serializers import TerrainSerializer
from apps.accounts.models import User


class AdminTerrainMobileViewSet(viewsets.ViewSet):
    """
    ViewSet pour ajouter terrain sur place depuis mobile admin
    Géolocalisation automatique + formulaire simplifié
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def create_on_site(self, request):
        """
        Créer un terrain sur place avec géolocalisation mobile
        
        Champs OBLIGATOIRES:
        - nom (str)
        - latitude (float) - Automatique depuis mobile
        - longitude (float) - Automatique depuis mobile
        - prix_heure (decimal)
        - capacite (int)
        
        Champs OPTIONNELS:
        - adresse (str)
        - description (str)
        - surface_m2 (float)
        - gestionnaire_id (int) - ID du gestionnaire à assigner
        - telephone (str) - Default: 776173261
        - type_surface (str) - gazon_synthetique/gazon_naturel/beton/terre_battue
        - disponible_eclairage (bool)
        - disponible_vestiaires (bool)
        - disponible_parking (bool)
        - images (list[str]) - URLs des images
        """
        
        if request.user.role != 'admin':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Accès réservé aux admins'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Champs obligatoires
        nom = request.data.get('nom')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        prix_heure = request.data.get('prix_heure')
        capacite = request.data.get('capacite')
        
        # Validation
        if not all([nom, latitude, longitude, prix_heure, capacite]):
            return Response({
                'data': None,
                'meta': {
                    'success': False,
                    'message': 'Champs obligatoires: nom, latitude, longitude, prix_heure, capacite'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Champs optionnels avec defaults
        adresse = request.data.get('adresse', 'Adresse à définir')
        description = request.data.get('description', '')
        surface_m2 = request.data.get('surface_m2')
        gestionnaire_id = request.data.get('gestionnaire_id')
        telephone = request.data.get('telephone', '77 617 32 61')
        type_surface = request.data.get('type_surface', 'gazon_synthetique')
        disponible_eclairage = request.data.get('disponible_eclairage', True)
        disponible_vestiaires = request.data.get('disponible_vestiaires', False)
        disponible_parking = request.data.get('disponible_parking', False)
        images = request.data.get('images', [])
        
        # Récupérer gestionnaire si fourni
        gestionnaire = None
        if gestionnaire_id:
            try:
                gestionnaire = User.objects.get(id=gestionnaire_id, role='gestionnaire')
            except User.DoesNotExist:
                return Response({
                    'data': None,
                    'meta': {'success': False, 'message': f'Gestionnaire {gestionnaire_id} non trouvé'}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer le terrain
        try:
            terrain = TerrainSynthetiquesDakar.objects.create(
                nom=nom,
                adresse=adresse,
                latitude=float(latitude),
                longitude=float(longitude),
                prix_heure=float(prix_heure),
                capacite=int(capacite),
                description=description,
                surface_m2=float(surface_m2) if surface_m2 else None,
                gestionnaire=gestionnaire,
                telephone=telephone,
                type_surface=type_surface,
                disponible_eclairage=disponible_eclairage,
                disponible_vestiaires=disponible_vestiaires,
                disponible_parking=disponible_parking,
                images=images,
                est_actif=True  # Actif par défaut
            )
            
            return Response({
                'data': TerrainSerializer(terrain).data,
                'meta': {
                    'success': True,
                    'message': f'Terrain "{nom}" créé avec succès'
                }
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'data': None,
                'meta': {'success': False, 'message': f'Erreur création: {str(e)}'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def gestionnaires_disponibles(self, request):
        """Liste des gestionnaires disponibles pour assignation"""
        if request.user.role != 'admin':
            return Response({
                'data': None,
                'meta': {'success': False, 'message': 'Accès réservé aux admins'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        gestionnaires = User.objects.filter(
            role='gestionnaire',
            est_actif=True,
            statut_validation='approuve'
        ).values('id', 'nom', 'prenom', 'email', 'telephone', 'nom_entreprise')
        
        return Response({
            'data': list(gestionnaires),
            'meta': {'success': True}
        })
    
    @action(detail=False, methods=['get'])
    def formulaire_specs(self, request):
        """
        Retourne les spécifications du formulaire
        (champs obligatoires, optionnels, valeurs possibles)
        """
        specs = {
            'champs_obligatoires': [
                {'nom': 'nom', 'type': 'string', 'description': 'Nom du terrain'},
                {'nom': 'latitude', 'type': 'float', 'description': 'Latitude GPS (auto)'},
                {'nom': 'longitude', 'type': 'float', 'description': 'Longitude GPS (auto)'},
                {'nom': 'prix_heure', 'type': 'decimal', 'description': 'Prix/heure en FCFA'},
                {'nom': 'capacite', 'type': 'integer', 'description': 'Nombre de joueurs max'},
            ],
            'champs_optionnels': [
                {'nom': 'adresse', 'type': 'string', 'default': 'Adresse à définir'},
                {'nom': 'description', 'type': 'text', 'default': ''},
                {'nom': 'surface_m2', 'type': 'float', 'default': None},
                {'nom': 'gestionnaire_id', 'type': 'integer', 'default': None},
                {'nom': 'telephone', 'type': 'string', 'default': '77 617 32 61'},
                {'nom': 'disponible_eclairage', 'type': 'boolean', 'default': True},
                {'nom': 'disponible_vestiaires', 'type': 'boolean', 'default': False},
                {'nom': 'disponible_parking', 'type': 'boolean', 'default': False},
                {'nom': 'images', 'type': 'array', 'default': []},
            ],
            'type_surface_choices': [
                {'value': 'gazon_synthetique', 'label': 'Gazon Synthétique'},
                {'value': 'gazon_naturel', 'label': 'Gazon Naturel'},
                {'value': 'beton', 'label': 'Béton'},
                {'value': 'terre_battue', 'label': 'Terre Battue'},
            ],
            'contact_default': '77 617 32 61'
        }
        
        return Response({
            'data': specs,
            'meta': {'success': True}
        })
