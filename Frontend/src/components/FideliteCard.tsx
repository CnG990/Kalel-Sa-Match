import React from 'react';
import { Star, Trophy, Gift, TrendingUp, Crown, Award } from 'lucide-react';

interface FideliteData {
  score_fidelite: number;
  niveau_fidelite: string;
  reduction_pourcentage: number;
  nb_reservations_annee: number;
  montant_total_annee: number;
  anciennete_mois: number;
  avantages: string[];
  prochaine_etape: {
    niveau_suivant?: string;
    points_manquants?: number;
    message: string;
  };
  message_specifique?: string;
  nb_reservations_terrain?: number;
  anciennete_terrain_mois?: number;
  montant_total_terrain?: number;
}

interface FideliteCardProps {
  fideliteData: FideliteData | null;
  terrainNom: string;
  isLoading?: boolean;
}

const FideliteCard: React.FC<FideliteCardProps> = ({ fideliteData, terrainNom, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!fideliteData) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Programme Fidélité</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Commencez à réserver sur <strong>{terrainNom}</strong> pour débloquer des réductions exclusives !
        </p>
      </div>
    );
  }

  const getNiveauIcon = (niveau: string) => {
    switch (niveau) {
      case 'Platine': return <Crown className="w-6 h-6 text-purple-600" />;
      case 'Or': return <Trophy className="w-6 h-6 text-yellow-600" />;
      case 'Argent': return <Award className="w-6 h-6 text-gray-600" />;
      case 'Bronze': return <Star className="w-6 h-6 text-orange-600" />;
      default: return <Gift className="w-6 h-6 text-blue-600" />;
    }
  };

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Platine': return 'from-purple-500 to-pink-500';
      case 'Or': return 'from-yellow-400 to-orange-500';
      case 'Argent': return 'from-gray-400 to-gray-600';
      case 'Bronze': return 'from-orange-400 to-red-500';
      default: return 'from-blue-400 to-indigo-500';
    }
  };

  const progressPercentage = fideliteData.prochaine_etape?.points_manquants !== undefined 
    ? Math.max(0, Math.min(100, ((fideliteData.score_fidelite) / (fideliteData.score_fidelite + fideliteData.prochaine_etape.points_manquants)) * 100))
    : 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header avec niveau de fidélité */}
      <div className={`bg-gradient-to-r ${getNiveauColor(fideliteData.niveau_fidelite)} text-white p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getNiveauIcon(fideliteData.niveau_fidelite)}
            <div>
              <h3 className="text-lg font-bold">{fideliteData.niveau_fidelite}</h3>
              <p className="text-white/80 text-sm">
                {fideliteData.message_specifique || `Fidélité sur ${terrainNom}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{fideliteData.reduction_pourcentage}%</div>
            <div className="text-white/80 text-sm">de réduction</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{fideliteData.score_fidelite}</div>
            <div className="text-blue-700 text-sm">Points</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {fideliteData.nb_reservations_terrain || fideliteData.nb_reservations_annee}
            </div>
            <div className="text-green-700 text-sm">Réservations</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {fideliteData.anciennete_terrain_mois || fideliteData.anciennete_mois}
            </div>
            <div className="text-purple-700 text-sm">Mois ici</div>
          </div>
        </div>

        {/* Progression vers le niveau suivant */}
        {fideliteData.prochaine_etape?.niveau_suivant && fideliteData.prochaine_etape.points_manquants! > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression vers {fideliteData.prochaine_etape.niveau_suivant}
              </span>
              <span className="text-sm text-gray-500">
                {fideliteData.prochaine_etape.points_manquants} points restants
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{fideliteData.prochaine_etape.message}</p>
          </div>
        )}

        {/* Avantages actuels */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-indigo-600" />
            Vos avantages
          </h4>
          <div className="space-y-2">
            {fideliteData.avantages.map((avantage, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{avantage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Économies réalisées */}
        {(fideliteData.montant_total_terrain || fideliteData.montant_total_annee) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Économies sur ce terrain</span>
            </div>
            <p className="text-sm text-green-700">
              Avec votre niveau actuel, vous économisez{' '}
              <strong>
                {Math.round(((fideliteData.montant_total_terrain || fideliteData.montant_total_annee) * fideliteData.reduction_pourcentage) / 100).toLocaleString()} FCFA
              </strong>{' '}
              par an sur <strong>{terrainNom}</strong> !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FideliteCard; 