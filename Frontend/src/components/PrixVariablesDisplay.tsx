import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface PrixVariable {
  id: number;
  terrain_id: number;
  taille?: string;
  nom_terrain_specifique?: string;
  periode?: string;
  jour_semaine?: string;
  prix: number;
  duree: string;
  heure_debut?: string;
  heure_fin?: string;
}

interface PrixVariablesDisplayProps {
  terrainId: number;
  terrainName: string;
  onPrixChange?: (prix: number) => void;
}

const PrixVariablesDisplay: React.FC<PrixVariablesDisplayProps> = ({
  terrainId,
  terrainName,
  onPrixChange
}) => {
  const [prixVariables, setPrixVariables] = useState<PrixVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrix, setSelectedPrix] = useState<PrixVariable | null>(null);
  const [selectedTaille, setSelectedTaille] = useState<string>('');
  const [selectedPeriode, setSelectedPeriode] = useState<string>('');
  const [selectedJour, setSelectedJour] = useState<string>('');

  useEffect(() => {
    fetchPrixVariables();
  }, [terrainId]);

  const fetchPrixVariables = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/admin/terrains/${terrainId}/prix-variables`);
      if (response.success) {
        setPrixVariables(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des prix variables:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculerPrix = async () => {
    try {
      const params: any = {
        terrain_id: terrainId
      };

      if (selectedTaille) params.taille = selectedTaille;
      if (selectedPeriode) params.periode = selectedPeriode;
      if (selectedJour) params.jour = selectedJour;

      const response = await apiService.post('/admin/terrains/calculer-prix', params);
      if (response.success) {
        setSelectedPrix(response.data);
        onPrixChange?.(response.data.prix);
      }
    } catch (error) {
      console.error('Erreur lors du calcul du prix:', error);
    }
  };

  const getTaillesUniques = () => {
    return [...new Set(prixVariables.map(p => p.taille).filter(Boolean))];
  };

  const getPeriodesUniques = () => {
    return [...new Set(prixVariables.map(p => p.periode).filter(Boolean))];
  };

  const getJoursUniques = () => {
    return [...new Set(prixVariables.map(p => p.jour_semaine).filter(Boolean))];
  };

  const getTerrainsSpecifiques = () => {
    return [...new Set(prixVariables.map(p => p.nom_terrain_specifique).filter(Boolean))];
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des prix variables...</div>;
  }

  if (prixVariables.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600">Aucun prix variable configuré pour ce terrain.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Prix variables - {terrainName}</h3>
      
      {/* Sélecteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {getTaillesUniques().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille du terrain
            </label>
            <select
              value={selectedTaille}
              onChange={(e) => setSelectedTaille(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner une taille</option>
              {getTaillesUniques().map(taille => (
                <option key={taille} value={taille}>{taille}</option>
              ))}
            </select>
          </div>
        )}

        {getTerrainsSpecifiques().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terrain spécifique
            </label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner un terrain</option>
              {getTerrainsSpecifiques().map(terrain => (
                <option key={terrain} value={terrain}>{terrain}</option>
              ))}
            </select>
          </div>
        )}

        {getPeriodesUniques().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période
            </label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner une période</option>
              {getPeriodesUniques().map(periode => (
                <option key={periode} value={periode}>
                  {periode === 'creuses' ? 'Heures creuses' : 
                   periode === 'pleines' ? 'Heures pleines' :
                   periode === 'jour' ? 'Jour' :
                   periode === 'nuit' ? 'Nuit' : periode}
                </option>
              ))}
            </select>
          </div>
        )}

        {getJoursUniques().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jour de la semaine
            </label>
            <select
              value={selectedJour}
              onChange={(e) => setSelectedJour(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner un jour</option>
              {getJoursUniques().map(jour => (
                <option key={jour} value={jour}>{jour}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bouton de calcul */}
      <button
        onClick={calculerPrix}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
      >
        Calculer le prix
      </button>

      {/* Prix calculé */}
      {selectedPrix && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">Prix calculé :</h4>
          <div className="text-2xl font-bold text-green-600">
            {selectedPrix.prix.toLocaleString()} FCFA
          </div>
          <div className="text-sm text-green-700">
            Durée : {selectedPrix.duree}
            {selectedPrix.heure_debut && selectedPrix.heure_fin && (
              <span> • Horaires : {selectedPrix.heure_debut} - {selectedPrix.heure_fin}</span>
            )}
          </div>
        </div>
      )}

      {/* Liste des prix variables */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">Tous les prix disponibles :</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prixVariables.map((prix) => (
            <div
              key={prix.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedPrix(prix);
                onPrixChange?.(prix.prix);
              }}
            >
              <div className="font-semibold text-lg">
                {prix.prix.toLocaleString()} FCFA
              </div>
              <div className="text-sm text-gray-600">
                {prix.taille && <span className="block">Taille: {prix.taille}</span>}
                {prix.nom_terrain_specifique && (
                  <span className="block">Terrain: {prix.nom_terrain_specifique}</span>
                )}
                {prix.periode && (
                  <span className="block">
                    Période: {
                      prix.periode === 'creuses' ? 'Heures creuses' :
                      prix.periode === 'pleines' ? 'Heures pleines' :
                      prix.periode === 'jour' ? 'Jour' :
                      prix.periode === 'nuit' ? 'Nuit' : prix.periode
                    }
                  </span>
                )}
                {prix.jour_semaine && (
                  <span className="block">Jour: {prix.jour_semaine}</span>
                )}
                <span className="block">Durée: {prix.duree}</span>
                {prix.heure_debut && prix.heure_fin && (
                  <span className="block">Horaires: {prix.heure_debut} - {prix.heure_fin}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrixVariablesDisplay;





