import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

interface Promotion {
  id: number;
  nom: string;
  description: string;
  type_reduction: 'pourcentage' | 'montant_fixe';
  valeur_reduction: number;
  date_debut: string;
  date_fin: string;
  code_promo?: string;
  limite_utilisations?: number;
  utilisations_actuelles: number;
  est_active: boolean;
  cible_abonnes: boolean;
  created_at: string;
}

const PromotionsPage: React.FC = () => {
  const { } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await apiService.get('/manager/promotions');
      if (response.success) {
        setPromotions(response.data || []);
      }
    } catch (error) {
      console.error('Erreur fetch promotions:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2"> Promotions Abonnés</h1>
        <p className="text-purple-100">Fidélisez vos clients avec des offres attractives</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mes promotions</h2>
        </div>
        <div className="p-6">
          {promotions.length === 0 ? (
            <p className="text-gray-600">Aucune promotion pour le moment.</p>
          ) : (
            promotions.map((promotion) => (
              <div key={promotion.id} className="border rounded p-4 mb-4">
                <h3 className="font-semibold">{promotion.nom}</h3>
                <p>{promotion.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;
