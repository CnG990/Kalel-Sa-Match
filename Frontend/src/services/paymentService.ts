// Service de paiement pour les abonnements et réservations
import apiService from './api';

// Interfaces
export interface PaymentDetails {
  subscriptionId?: number;
  reservationId?: number;
  terrainName: string;
  totalAmount: number;
  duration?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  preferences?: any;
  date?: string;
  time?: string;
  price?: number;
}

export interface PaymentRequest {
  subscription_id?: number;
  reservation_id?: number;
  montant: number;
  methode_paiement: 'orange_money' | 'wave' | 'mobile_money';
  reference_transaction?: string;
}

// Service de paiement
export const paymentService = {
  // Traiter un paiement d'abonnement
  async processSubscriptionPayment(
    subscriptionId: number,
    amount: number,
    method: 'orange_money' | 'wave'
  ) {
    try {
      const payload: PaymentRequest = {
        subscription_id: subscriptionId,
        montant: amount,
        methode_paiement: method === 'orange_money' ? 'orange_money' : 'wave'
      };

      const response = await apiService.post('/paiements/subscription', payload);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Paiement traité avec succès'
        };
      } else {
        throw new Error(response.message || 'Erreur lors du traitement du paiement');
      }
    } catch (error) {
      console.error('Erreur paiement abonnement:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du paiement'
      };
    }
  },

  // Traiter un paiement de réservation
  async processReservationPayment(
    reservationId: number,
    amount: number,
    method: 'orange_money' | 'wave'
  ) {
    try {
      const payload: PaymentRequest = {
        reservation_id: reservationId,
        montant: amount,
        methode_paiement: method === 'orange_money' ? 'orange_money' : 'wave'
      };

      const response = await apiService.post('/paiements/reservation', payload);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Paiement traité avec succès'
        };
      } else {
        throw new Error(response.message || 'Erreur lors du traitement du paiement');
      }
    } catch (error) {
      console.error('Erreur paiement réservation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du paiement'
      };
    }
  },

  // Générer une référence de transaction unique
  generateTransactionReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  },

  // Valider les détails de paiement
  validatePaymentDetails(details: PaymentDetails): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!details.terrainName) {
      errors.push('Nom du terrain manquant');
    }

    if (!details.totalAmount || details.totalAmount <= 0) {
      errors.push('Montant invalide');
    }

    if (!details.subscriptionId && !details.reservationId) {
      errors.push('ID d\'abonnement ou de réservation manquant');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
