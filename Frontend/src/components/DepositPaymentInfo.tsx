import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DepositPaymentInfoProps {
  montantTotal: number;
  montantAcompte: number;
  montantRestant: number;
  acomptePaye: boolean;
  soldePaye: boolean;
  statut: string;
  pourcentageAcompte?: number;
}

export const DepositPaymentInfo: React.FC<DepositPaymentInfoProps> = ({
  montantTotal,
  montantAcompte,
  montantRestant,
  acomptePaye,
  soldePaye,
  pourcentageAcompte = 30
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = () => {
    if (soldePaye) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Payé intégralement</span>
        </div>
      );
    }
    if (acomptePaye) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>Acompte payé - Solde à payer</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        <span>En attente de paiement</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Détails du paiement</h3>
        {getStatusBadge()}
      </div>

      <div className="space-y-4">
        {/* Montant total */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600">Montant total</span>
          <span className="text-lg font-semibold text-gray-900">{formatPrice(montantTotal)}</span>
        </div>

        {/* Acompte */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm font-medium text-blue-900">Acompte requis</span>
              <span className="ml-2 text-xs text-blue-700">({pourcentageAcompte}%)</span>
            </div>
            <span className="text-lg font-bold text-blue-900">{formatPrice(montantAcompte)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {acomptePaye ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Acompte payé ✓</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700">À payer pour confirmer la réservation</span>
              </>
            )}
          </div>
        </div>

        {/* Solde restant */}
        {montantRestant > 0 && (
          <div className={`rounded-lg p-4 ${soldePaye ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">Solde restant</span>
              <span className={`text-lg font-bold ${soldePaye ? 'text-green-900' : 'text-gray-900'}`}>
                {formatPrice(montantRestant)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {soldePaye ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">Solde payé ✓</span>
                </>
              ) : acomptePaye ? (
                <>
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">À payer avant ou sur place</span>
                </>
              ) : (
                <span className="text-gray-600">Payable après l'acompte</span>
              )}
            </div>
          </div>
        )}

        {/* Barre de progression */}
        <div className="pt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progression du paiement</span>
            <span>{soldePaye ? '100%' : acomptePaye ? `${pourcentageAcompte}%` : '0%'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                soldePaye ? 'bg-green-500' : acomptePaye ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{
                width: soldePaye ? '100%' : acomptePaye ? `${pourcentageAcompte}%` : '0%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
