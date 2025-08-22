import React, { useEffect, useState, useCallback } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import KMLGoogleEarthImport from '../../components/KMLGoogleEarthImport';
import CSVTerrainImport from '../../components/CSVTerrainImport';
import TerrainManagerAssignment from '../../components/TerrainManagerAssignment';
import TerrainPricingDisplay from '../../components/TerrainPricingDisplay';
import TerrainSurfaceDisplay from '../../components/TerrainSurfaceDisplay';

import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Upload, 
  Layers,
  Globe,
  FileText,
  RefreshCw,
  Users,
  User,
  Calculator,
  } from 'lucide-react';

interface Terrain {
  id: number;
  nom: string;
  description?: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  prix_par_heure?: number;
  prix_heure?: number;
  capacite: number;
  capacite_spectateurs?: number;
  est_disponible?: boolean;
  statut?: string;
  terrain_synthetique?: {
    nom: string;
    adresse: string;
  };
  geometry?: any; // Données géométriques
  geometrie?: string; // Alternative GeoJSON
  geometrie_geojson?: string; // GeoJSON from PostGIS
  has_geometry?: boolean; // PostGIS
  surface?: number; // Surface manuelle
  surface_postgis?: number; // Surface calculée PostGIS (prioritaire)
  surface_calculee?: number; // Surface finale calculée
  gestionnaire_id?: number;
  gestionnaire?: {
    nom: string;
    prenom: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

const ManageTerrainsPage: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [showKMLModal, setShowKMLModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingTerrain, setEditingTerrain] = useState<Terrain | null>(null);
  const [selectedTerrainForManager, setSelectedTerrainForManager] = useState<Terrain | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [terrainToDelete, setTerrainToDelete] = useState<Terrain | null>(null);
  const [calculatingSurfaces, setCalculatingSurfaces] = useState(false);
  const [calculatingTerrain, setCalculatingTerrain] = useState<number | null>(null);


  // Form states
  const [addForm, setAddForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    latitude: '',
    longitude: '',
    prix_heure: '',
    capacite: '',
    terrain_synthetique_id: '',
    surface: ''
  });

  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    latitude: '',
    longitude: '',
    prix_par_heure: '',
    capacite: '',
    surface: ''
  });



  const [] = useState(false);
  const [] = useState(false);
  const [] = useState('');
  const [] = useState('all');

  const fetchTerrains = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    try {
      const query = searchQuery !== undefined ? searchQuery : searchTerm;
      const response = await apiService.getAllTerrains(query);
      if (response.success) {
        // Gestion flexible de la structure des données
        const terrainsData = response.data?.data || response.data || [];
        
        // Validation et nettoyage des données
        const validTerrains = Array.isArray(terrainsData) ? terrainsData.map(terrain => ({
          ...terrain,
          id: terrain.id || 0,
          nom: terrain.nom || 'Terrain sans nom',
          adresse: terrain.adresse || '',
          gestionnaire: terrain.gestionnaire && typeof terrain.gestionnaire === 'object' 
            ? {
                nom: terrain.gestionnaire.nom || '',
                prenom: terrain.gestionnaire.prenom || '',
                email: terrain.gestionnaire.email || ''
              }
            : null,
          gestionnaire_id: terrain.gestionnaire_id || null
        })) : [];
        
        setTerrains(validTerrains);
      } else {
        console.error('Erreur API:', response.message);
        toast.error(response.message || "Impossible de charger les terrains.");
        setTerrains([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des terrains:', error);
      toast.error("Erreur réseau lors du chargement.");
      setTerrains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerrains();
  }, []);

  // Recharger quand le terme de recherche change (avec délai)
  useEffect(() => {
    // Ne pas déclencher la recherche au chargement initial
    if (terrains.length === 0 && searchTerm === '') return;
    
    const timer = setTimeout(() => {
      fetchTerrains(searchTerm);
    }, 300); // Délai réduit pour une meilleure UX
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddTerrain = async () => {
    try {
      const terrainData = {
        ...addForm,
        latitude: parseFloat(addForm.latitude),
        longitude: parseFloat(addForm.longitude),
        prix_heure: parseFloat(addForm.prix_heure),
        capacite: parseInt(addForm.capacite),
        terrain_synthetique_id: parseInt(addForm.terrain_synthetique_id),
        surface: parseFloat(addForm.surface) || 0
      };

      const response = await apiService.createTerrain(terrainData);
      if (response.success) {
        toast.success('Terrain ajouté avec succès');
        setShowAddModal(false);
        setAddForm({
          nom: '',
          description: '',
          adresse: '',
          latitude: '',
          longitude: '',
          prix_heure: '',
          capacite: '',
          terrain_synthetique_id: '',
          surface: ''
        });
        fetchTerrains();
      } else {
        toast.error(response.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleEditTerrain = (terrain: Terrain) => {
    setEditingTerrain(terrain);
    setEditForm({
      nom: terrain.nom || '',
      description: terrain.description || '',
      adresse: terrain.adresse || '',
      latitude: terrain.latitude?.toString() || '',
      longitude: terrain.longitude?.toString() || '',
      prix_par_heure: (terrain.prix_par_heure || terrain.prix_heure || 0).toString(),
      capacite: (terrain.capacite || terrain.capacite_spectateurs || 0).toString(),
      surface: (terrain.surface_postgis || terrain.surface || terrain.surface_calculee || 0).toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateTerrain = async () => {
    if (!editingTerrain) return;

    try {
      // 1. Mettre à jour les données de base
      const terrainData = {
        nom: editForm.nom,
        description: editForm.description,
        adresse: editForm.adresse,
        latitude: parseFloat(editForm.latitude),
        longitude: parseFloat(editForm.longitude),
        prix_par_heure: parseFloat(editForm.prix_par_heure),
        capacite: parseInt(editForm.capacite),
        surface: parseFloat(editForm.surface) || 0
      };

      const response = await apiService.updateTerrain(editingTerrain.id, terrainData);
      if (!response.success) {
        toast.error(response.message || 'Erreur lors de la mise à jour');
        return;
      }

      toast.success('Terrain mis à jour avec succès');

      // 3. Réinitialiser le formulaire et fermer
      setShowEditModal(false);
      setEditingTerrain(null);
      
      // 4. Rafraîchir les données pour mettre à jour les statistiques
      await fetchTerrains();
      
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteTerrain = (terrain: Terrain) => {
    setTerrainToDelete(terrain);
    setShowDeleteModal(true);
  };

  const handleCompleteData = (terrain: Terrain) => {
    setEditingTerrain(terrain);
    setShowGeoModal(true);
  };

  const handleAssignManager = (terrain: Terrain) => {
    setSelectedTerrainForManager(terrain);
    setShowManagerModal(true);
  };

  const handleCalculateAllSurfaces = async () => {
    if (calculatingSurfaces) return;
    
    try {
      setCalculatingSurfaces(true);
      toast.loading('🔄 Calcul des surfaces PostGIS en cours...', { id: 'calc-surfaces' });
      
      const response = await apiService.calculateTerrainSurfaces();
      
      if (response.success && response.data) {
        const stats = response.data;
        toast.success(
          `✅ Surfaces PostGIS calculées ! ${stats.terrains_updated} terrains mis à jour\n📏 Surface totale: ${stats.surface_totale?.toLocaleString('fr-FR')} m²\n📊 Moyenne: ${stats.surface_moyenne?.toLocaleString('fr-FR')} m²`,
          { 
            id: 'calc-surfaces',
            duration: 8000
          }
        );
        
        // Rafraîchir les données pour voir les nouvelles surfaces
        await fetchTerrains();
      } else {
        toast.error(response.message || 'Erreur lors du calcul des surfaces PostGIS', { id: 'calc-surfaces' });
      }
    } catch (error) {
      console.error('Erreur calcul surfaces PostGIS:', error);
      toast.error('Erreur réseau lors du calcul des surfaces', { id: 'calc-surfaces' });
    } finally {
      setCalculatingSurfaces(false);
    }
  };

  const handleCalculateTerrainSurface = async (terrainId: number) => {
    if (calculatingTerrain === terrainId) return;
    
    setCalculatingTerrain(terrainId);
    try {
      toast.loading(`🔄 Calcul de la surface pour ${terrains.find(t => t.id === terrainId)?.nom}...`, { id: `calc-surface-${terrainId}` });
      
      const response = await apiService.calculateTerrainSurface(terrainId);
      
      if (response.success && response.data) {
        const { surface_calculee, terrain_nom } = response.data;
        toast.success(
          `✅ Surface calculée pour ${terrain_nom}: ${surface_calculee?.toLocaleString('fr-FR')} m²`,
          { 
            id: `calc-surface-${terrainId}`,
            duration: 5000
          }
        );
        
        // Rafraîchir uniquement ce terrain
        await fetchTerrains();
      } else {
        toast.error(response.message || 'Erreur lors du calcul de la surface', { id: `calc-surface-${terrainId}` });
      }
    } catch (error) {
      console.error('Erreur calcul surface terrain:', error);
      toast.error('Erreur réseau lors du calcul de la surface', { id: `calc-surface-${terrainId}` });
    } finally {
      setCalculatingTerrain(null);
    }
  };



  const confirmDeleteTerrain = async () => {
    if (!terrainToDelete) return;

    try {
      const response = await apiService.deleteTerrain(terrainToDelete.id);
      if (response.success) {
        toast.success('Terrain supprimé avec succès');
        setShowDeleteModal(false);
        setTerrainToDelete(null);
        fetchTerrains();
      } else {
        toast.error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    
    // Vérifier les types de fichiers
    const allowedTypes = ['.shp', '.dbf', '.shx', '.prj', '.geojson', '.kml', '.csv'];
    const invalidFiles = fileArray.filter(file => 
      !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))
    );
    
    if (invalidFiles.length > 0) {
      toast.error('Types de fichiers non supportés détectés');
      return;
    }
    
    toast.success(`${fileArray.length} fichier(s) géomatique(s) sélectionné(s)`);
  };



  const handleGeoImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Veuillez sélectionner des fichiers');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files[]', file);
    });

    try {
      const response = await apiService.importGeoData(formData);
      if (response.success) {
        toast.success('Import géomatique réussi');
        setShowGeoModal(false);
        setSelectedFiles([]);
        fetchTerrains();
      } else {
        toast.error(response.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Terrains</h1>
          <p className="text-gray-600 mt-2">
            Gérez {terrains.length} terrain{terrains.length > 1 ? 's' : ''} de votre base de données - Toutes les informations sont modifiables
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowCSVModal(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          <FileText className="w-5 h-5 mr-2" />
          Import CSV Terrains
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter Manuel
        </button>
        <button
          onClick={() => setShowKMLModal(true)}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Globe className="w-5 h-5 mr-2" />
          Import KML
        </button>
        <button
          onClick={() => setShowGeoModal(true)}
          className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Upload className="w-5 h-5 mr-2" />
          Autres Formats
        </button>
      </div>
    </div>

    {/* Guide d'utilisation CSV */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-2">🎯 Import CSV Privilégié - Workflow Recommandé</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>1. Import CSV :</strong> Utilisez "Import CSV Terrains" pour ajouter plusieurs terrains rapidement</p>
            <p>• <strong>2. Attribution :</strong> Attribuez ensuite chaque terrain à un gestionnaire via la colonne "Gestionnaire"</p>
            <p>• <strong>3. Complétion :</strong> Ajoutez données géomatiques si nécessaire</p>
            <p className="text-blue-700">
              <strong>Colonnes CSV requises :</strong> nom, latitude, longitude | 
              <strong> Optionnelles :</strong> prix_heure, adresse, capacite, description
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Barre de recherche */}
    <div className="mb-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => fetchTerrains()}
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>
    </div>

    {/* Section terrains incomplets */}
    {terrains.filter(t => {
      const hasNoSurface = !t.surface_postgis && !t.surface;
      const hasNoGeometry = !t.has_geometry && !t.geometrie && !t.geometrie_geojson;
      return hasNoSurface || hasNoGeometry;
    }).length > 0 && (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-orange-900">
              {terrains.filter(t => {
                const hasNoSurface = !t.surface_postgis && !t.surface;
                const hasNoGeometry = !t.has_geometry && !t.geometrie && !t.geometrie_geojson;
                return hasNoSurface || hasNoGeometry;
              }).length} terrain(s) nécessitent des améliorations
            </h3>
                          <div className="text-sm text-orange-700 mt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span>{terrains.filter(t => !t.surface_postgis && !t.surface).length} sans surface définie</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <span>{terrains.filter(t => !t.has_geometry && !t.geometrie && !t.geometrie_geojson).length} sans géométrie</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>{terrains.filter(t => t.surface_postgis || t.surface).length} avec surface calculée</span>
                  </div>
                </div>
                <p className="text-xs mt-2">Utilisez le bouton "Calculer Surfaces" pour calculer automatiquement les surfaces PostGIS des terrains avec géométrie définie.</p>
              </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCalculateAllSurfaces}
              disabled={calculatingSurfaces}
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                calculatingSurfaces 
                  ? 'border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed' 
                  : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${calculatingSurfaces ? 'animate-spin' : ''}`} />
              {calculatingSurfaces ? 'Calcul...' : 'Calculer Surfaces'}
            </button>
            <button
              onClick={() => setShowGeoModal(true)}
              className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Compléter
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Statistiques géomatiques */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <MapPin className="w-8 h-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Terrains</p>
            <p className="text-2xl font-bold">{terrains.length}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <Layers className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-500">Avec Géométrie</p>
            <p className="text-2xl font-bold">{terrains.filter(t => t.has_geometry || t.geometrie || t.geometrie_geojson).length}</p>
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-green-600">{terrains.filter(t => t.has_geometry).length} PostGIS</span>
              {terrains.filter(t => !t.has_geometry && (t.geometrie || t.geometrie_geojson)).length > 0 && (
                <span className="text-blue-600 ml-2">
                  {terrains.filter(t => !t.has_geometry && (t.geometrie || t.geometrie_geojson)).length} GeoJSON
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <Globe className="w-8 h-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-500">Données Incomplètes</p>
            <p className="text-2xl font-bold text-orange-600">
              {terrains.filter(t => {
                const hasNoSurface = !t.surface_postgis && !t.surface;
                const hasNoGeometry = !t.has_geometry && !t.geometrie && !t.geometrie_geojson;
                return hasNoSurface || hasNoGeometry;
              }).length}
            </p>
            <p className="text-xs text-gray-500">Terrains à compléter</p>
          </div>
        </div>
      </div>

    </div>

    {/* Tableau des terrains */}
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terrain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestionnaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix/Heure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Géométrie</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-gray-600">Chargement des terrains...</span>
                  </div>
                </td>
              </tr>
            ) : terrains.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Aucun terrain trouvé</p>
                    <p className="text-sm">
                      {searchTerm 
                        ? `Aucun résultat pour "${searchTerm}"`
                        : 'Commencez par ajouter des terrains à votre base de données'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : terrains.map((terrain, idx) => (
              <tr key={terrain.id} className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-black">{terrain.nom}</div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Éditable
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {terrain.terrain_synthetique?.nom || 'Base de données principale'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {terrain.gestionnaire ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {terrain.gestionnaire.prenom} {terrain.gestionnaire.nom}
                        </div>
                        <div className="text-sm text-gray-500">{terrain.gestionnaire.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Non attribué</span>
                        <button
                          onClick={() => handleAssignManager(terrain)}
                          className="block text-xs text-blue-600 hover:text-blue-800"
                        >
                          Attribuer
                        </button>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {terrain.prix_heure || terrain.prix_par_heure ? (
                      <TerrainPricingDisplay
                        terrainName={terrain.nom}
                        basePrice={terrain.prix_heure || terrain.prix_par_heure}
                        compact={true}
                        showEdit={true}
                        onEdit={() => handleEditTerrain(terrain)}
                        terrainData={terrain}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Non défini</span>
                        <button
                          onClick={() => handleEditTerrain(terrain)}
                          className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                          title="Définir le prix par heure"
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* ✅ SURFACE AUTOMATIQUE POSTGIS - Plus de champ manuel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Surface PostGIS */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Calculator className="w-5 h-5 mr-2 text-green-600" />
                        Surface Automatique (PostGIS)
                      </h3>
                      
                      <TerrainSurfaceDisplay
                        terrain={terrain}
                        showActions={true}
                        isCalculating={calculatingTerrain === terrain.id}
                        onCalculate={(terrainId) => handleCalculateTerrainSurface(terrainId)}
                      />
                      
                      {/* ✅ Actions de surface */}
                      <div className="flex flex-wrap gap-2">
                        {terrain.has_geometry ? (
                          <button
                            onClick={() => handleCalculateTerrainSurface(terrain.id)}
                            disabled={calculatingTerrain === terrain.id}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <RefreshCw className={`w-4 h-4 ${calculatingTerrain === terrain.id ? 'animate-spin' : ''}`} />
                            <span>{calculatingTerrain === terrain.id ? 'Calcul...' : 'Recalculer Surface'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
                            <Globe className="w-4 h-4" />
                            <span className="text-sm">Géométrie requise pour calcul automatique</span>
                          </div>
                        )}
                      </div>

                      {/* ✅ Info méthode PostGIS */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Calcul Automatique</h4>
                        <p className="text-xs text-blue-700">
                          La surface est calculée automatiquement par PostGIS à partir de la géométrie du terrain.
                          <br />
                          <strong>Méthode :</strong> ST_Area + Transform EPSG:32628 (précision métrique)
                        </p>
                      </div>
                    </div>

                    {/* Statut géométrie et actions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-blue-600" />
                        Géométrie Terrain
                      </h3>

                      <div className="space-y-3">
                        {/* Statut géométrie */}
                        <div className={`p-4 border rounded-lg ${
                          terrain.has_geometry 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              terrain.has_geometry ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className={`font-medium ${
                                terrain.has_geometry ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {terrain.has_geometry ? 'Géométrie définie' : 'Géométrie manquante'}
                              </p>
                              <p className={`text-sm ${
                                terrain.has_geometry ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {terrain.has_geometry 
                                  ? 'Surface calculable automatiquement' 
                                  : 'Importez un fichier KML ou définissez les coordonnées'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions géométrie */}
                        <div className="space-y-2">
                          <button
                            onClick={() => {/* Action import KML */}}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Importer KML</span>
                          </button>
                          
                          {terrain.geometrie && (
                            <button
                              onClick={() => {/* Action voir géométrie */}}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Voir sur carte</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {terrain.has_geometry || terrain.geometrie || terrain.geometrie_geojson ? (
                    <div className="flex flex-col">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Layers className="w-3 h-3 mr-1" />
                        Géométrie
                      </span>
                      {terrain.has_geometry && (
                        <span className="text-xs text-green-600 mt-1">
                          ✓ PostGIS
                        </span>
                      )}
                      {!terrain.has_geometry && (terrain.geometrie || terrain.geometrie_geojson) && (
                        <span className="text-xs text-blue-600 mt-1">
                          ⊕ GeoJSON
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <MapPin className="w-3 h-3 mr-1" />
                        GPS seul
                      </span>
                      <button
                        onClick={() => handleCompleteData(terrain)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        title="Ajouter géométrie (SHP, KML, CSV)"
                      >
                        + Géo
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-1">
                    <button 
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                      title="Voir détails"
                      onClick={() => window.open(`/terrains/${terrain.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50" 
                      title="Attribuer gestionnaire"
                      onClick={() => handleAssignManager(terrain)}
                    >
                      <Users className="w-4 h-4" />
                    </button>

                    <button 
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" 
                      title="Modifier"
                      onClick={() => handleEditTerrain(terrain)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" 
                      title="Supprimer"
                      onClick={() => handleDeleteTerrain(terrain)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal d'édition de terrain */}
    {showEditModal && editingTerrain && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Modifier le terrain</h3>
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditingTerrain(null);
              }} 
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du terrain</label>
              <input
                type="text"
                value={editForm.nom}
                onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du terrain"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description du terrain"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={editForm.adresse}
                onChange={(e) => setEditForm(prev => ({ ...prev, adresse: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={editForm.latitude}
                onChange={(e) => setEditForm(prev => ({ ...prev, latitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 14.6928"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={editForm.longitude}
                onChange={(e) => setEditForm(prev => ({ ...prev, longitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: -17.4467"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix par heure (FCFA)</label>
              <input
                type="number"
                value={editForm.prix_par_heure}
                onChange={(e) => setEditForm(prev => ({ ...prev, prix_par_heure: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 15000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (joueurs)</label>
              <input
                type="number"
                value={editForm.capacite}
                onChange={(e) => setEditForm(prev => ({ ...prev, capacite: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 22"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface (m²)
              </label>
              <input
                type="number"
                value={editForm.surface}
                onChange={(e) => setEditForm(prev => ({ ...prev, surface: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optionnel - Sera calculé automatiquement si vous importez une géométrie KML
              </p>
            </div>


          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingTerrain(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              onClick={handleUpdateTerrain}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmation de suppression */}
    {showDeleteModal && terrainToDelete && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Supprimer le terrain</h3>
              <p className="text-sm text-gray-500">Cette action est irréversible.</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              Êtes-vous sûr de vouloir supprimer le terrain <strong>"{terrainToDelete.nom}"</strong> ?
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setTerrainToDelete(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={confirmDeleteTerrain}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Formulaire d'ajout manuel */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Ajouter un nouveau terrain</h3>
            <button 
              onClick={() => setShowAddModal(false)} 
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du terrain *
              </label>
              <input
                type="text"
                value={addForm.nom}
                onChange={(e) => setAddForm(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Complexe Sportif Dakar"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description du terrain, tarifs spéciaux, règles..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                value={addForm.adresse}
                onChange={(e) => setAddForm(prev => ({ ...prev, adresse: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Corniche Ouest, Dakar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={addForm.latitude}
                onChange={(e) => setAddForm(prev => ({ ...prev, latitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 14.6928"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Coordonnée GPS Nord (Google Maps)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={addForm.longitude}
                onChange={(e) => setAddForm(prev => ({ ...prev, longitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: -17.4467"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Coordonnée GPS Ouest (Google Maps)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de base par heure (FCFA) *
              </label>
              <input
                type="number"
                value={addForm.prix_heure}
                onChange={(e) => setAddForm(prev => ({ ...prev, prix_heure: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 30000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Prix principal - options multiples configurables après</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité maximale (joueurs) *
              </label>
              <input
                type="number"
                value={addForm.capacite}
                onChange={(e) => setAddForm(prev => ({ ...prev, capacite: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 22"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Nombre maximum de joueurs (11x11 = 22)</p>
            </div>

            {/* ✅ SURFACE AUTOMATIQUE POSTGIS - Champ manuel supprimé */}
            <div className="md:col-span-2">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Surface Automatique (PostGIS)</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  La surface sera calculée automatiquement par PostGIS après importation de la géométrie.
                </p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• <strong>Précision :</strong> Calcul métrique EPSG:32628</li>
                  <li>• <strong>Méthode :</strong> ST_Area + Transform PostGIS</li>
                  <li>• <strong>Source :</strong> Géométrie KML/coordonnées</li>
                  <li>• <strong>Mise à jour :</strong> Automatique lors des modifications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Après ajout</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Assignez un gestionnaire à ce terrain</li>
              <li>• Importez les géométries KML pour calcul automatique des surfaces</li>
              <li>• Configurez les options de tarification multiples si nécessaire</li>
              <li>• Ajoutez des images via l'interface de gestion</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAddTerrain}
              disabled={!addForm.nom || !addForm.latitude || !addForm.longitude || !addForm.prix_heure || !addForm.capacite}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter le terrain
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal d'import géomatique */}
    {showGeoModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingTerrain ? `Compléter "${editingTerrain.nom}"` : 'Import de Données Géomatiques'}
            </h3>
            <button 
              onClick={() => {
                setShowGeoModal(false);
                setEditingTerrain(null);
              }} 
              className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          {editingTerrain && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Terrain sélectionné :</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Nom :</strong> {editingTerrain.nom}</p>
                <p><strong>Adresse :</strong> {editingTerrain.adresse}</p>
                <div className="mt-2 flex space-x-4">
                  <span className={`px-2 py-1 rounded text-xs ${editingTerrain.surface ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Surface: {editingTerrain.surface ? `${editingTerrain.surface} m²` : 'Manquante'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${editingTerrain.has_geometry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Géométrie: {editingTerrain.has_geometry ? 'Présente' : 'Manquante'}
                  </span>

                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import de fichiers géomatiques */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Import Géomatique</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="geo-files" className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">
                      Fichiers géomatiques
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      SHP, KML, GeoJSON, CSV KoboCollect
                    </span>
                  </label>
                  <input
                    id="geo-files"
                    type="file"
                    multiple
                    accept=".shp,.dbf,.shx,.prj,.geojson,.kml,.csv"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>


          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Fichiers sélectionnés :</h4>
              <ul className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h4 className="font-medium text-blue-900 mb-2">Formats supportés :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Shapefile</strong> : .shp, .dbf, .shx, .prj (ArcMap, QGIS)</li>
              <li>• <strong>KML/KMZ</strong> : Google Earth, terrain surveys</li>
              <li>• <strong>CSV KoboCollect</strong> : avec coordonnées latitude/longitude</li>
              <li>• <strong>GeoJSON</strong> : format web standard</li>

              <li>• Coordonnées en WGS84 (EPSG:4326)</li>
            </ul>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowGeoModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleGeoImport}
              disabled={selectedFiles.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Importer
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal Import KML Google Earth */}
    <KMLGoogleEarthImport
      isOpen={showKMLModal}
      onClose={() => setShowKMLModal(false)}
      onSuccess={() => {
        fetchTerrains();
        setShowKMLModal(false);
      }}
    />

    {/* Modal Import CSV Terrains */}
    <CSVTerrainImport
      isOpen={showCSVModal}
      onClose={() => setShowCSVModal(false)}
      onSuccess={() => {
        fetchTerrains();
        setShowCSVModal(false);
      }}
    />

    {/* Modal Attribution Gestionnaire */}
    <TerrainManagerAssignment
      isOpen={showManagerModal}
      onClose={() => {
        setShowManagerModal(false);
        setSelectedTerrainForManager(null);
      }}
      onSuccess={() => {
        fetchTerrains();
        setShowManagerModal(false);
        setSelectedTerrainForManager(null);
      }}
      selectedTerrain={selectedTerrainForManager || undefined}
    />


  </div>
);
};

export default ManageTerrainsPage; 