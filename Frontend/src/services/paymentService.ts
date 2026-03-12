// Service de paiement pour les abonnements et réservations
import apiService, { type InitPaymentResponseDTO } from './api';

// Interfaces
export interface PaymentDetails {
  subscriptionId?: number;
  reservationId?: number;
  terrainName: string;
  totalAmount: number;
  montant_acompte?: number;
  payment_type?: 'acompte' | 'solde' | 'total';
  duration?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  preferences?: any;
  date?: string;
  time?: string;
  price?: number;
}

// Service de paiement
export const paymentService = {
  // Traiter un paiement d'abonnement (init Wave/OM)
  async processSubscriptionPayment(
    subscriptionId: number,
    amount: number,
    method: 'orange_money' | 'wave',
    customer_phone: string,
    customer_name: string,
  ): Promise<{ success: boolean; data?: InitPaymentResponseDTO | null; message?: string }> {
    try {
      const { data, meta } = await apiService.initPayment({
        abonnement_id: subscriptionId,
        montant: amount,
        methode: method === 'orange_money' ? 'orange_money' : 'wave',
        customer_phone,
        customer_name,
      });

      if (!data) {
        throw new Error((meta?.message as string | undefined) ?? 'Erreur lors du traitement du paiement');
      }

      return {
        success: true,
        data,
        message: (meta?.message as string | undefined) ?? 'Paiement traité avec succès'
      };
    } catch (error) {
      console.error('Erreur paiement abonnement:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du paiement'
      };
    }
  },

  // Traiter un paiement de réservation (init Wave/OM)
  async processReservationPayment(
    reservationId: number,
    amount: number,
    method: 'orange_money' | 'wave',
    customer_phone: string,
    customer_name: string,
    payment_id?: number,
  ): Promise<{ success: boolean; data?: InitPaymentResponseDTO | null; message?: string }> {
    try {
      const { data, meta } = await apiService.initPayment({
        payment_id,
        reservation_id: reservationId,
        montant: payment_id ? undefined : amount,
        methode: method === 'orange_money' ? 'orange_money' : 'wave',
        customer_phone,
        customer_name,
      });

      if (!data) {
        throw new Error((meta?.message as string | undefined) ?? 'Erreur lors du traitement du paiement');
      }

      return {
        success: true,
        data,
        message: (meta?.message as string | undefined) ?? 'Paiement traité avec succès'
      };
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
