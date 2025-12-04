import apiService from './api';
import type { ApiResponse } from './api';

export interface TerrainConditions {
  terrain: {
    id: number;
    nom: string;
    adresse: string;
    prix_heure: number;
    horaires_ouverture: string;
    horaires_fermeture: string;
  };
  conditions: {
    jours_disponibles: string[];
    creneaux_disponibles: string[];
    conditions_abonnement: {
      engagement_minimum: number;
      acompte_requis: number;
      paiement_differe: boolean;
      annulation: string;
      report: string;
    };
    reductions: {
      trimestriel: number;
      annuel: number;
      semestriel: number;
    };
    paiement_differe: boolean;
    acompte_minimum: number;
  };
}

export interface HistoriqueReservation {
  id: number;
  date_debut: string;
  date_fin: string;
  montant_total: number;
  statut: string;
  notes?: string;
}

export interface StatistiquesUtilisateur {
  total_reservations: number;
  montant_total: number;
  jours_preferes: string[];
  creneaux_preferes: string[];
}

export interface HistoriqueData {
  historique: HistoriqueReservation[];
  statistiques: StatistiquesUtilisateur;
}

export interface DisponibiliteRequest {
  terrain_id: number;
  date: string;
  creneau: string;
}

export interface DisponibiliteResponse {
  disponible: boolean;
  date: string;
  creneau: string;
}

export interface CalculPrixRequest {
  terrain_id: number;
  type_abonnement: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel';
  nb_seances: number;
  duree_seance: number;
  mode_paiement: 'integral' | 'differe' | 'par_seance';
}

export interface CalculPrixResponse {
  prix_base: number;
  reduction_appliquee: number;
  prix_final: number;
  acompte?: number;
  reste_a_payer?: number;
  prix_par_seance?: number;
  total_seances?: number;
}

class AbonnementConditionsService {
  /**
   * Récupérer les conditions d'abonnement d'un terrain
   */
  async getConditionsTerrain(terrainId: number): Promise<TerrainConditions> {
    try {
      const response = await apiService.get(`/abonnements/conditions/${terrainId}`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des conditions');
      }
    } catch (error) {
      console.error('Erreur getConditionsTerrain:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des réservations d'un utilisateur pour un terrain
   */
  async getHistoriqueReservations(terrainId: number): Promise<HistoriqueData> {
    try {
      const response = await apiService.get(`/abonnements/historique/${terrainId}`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération de l\'historique');
      }
    } catch (error) {
      console.error('Erreur getHistoriqueReservations:', error);
      throw error;
    }
  }

  /**
   * Vérifier la disponibilité d'un créneau
   */
  async verifierDisponibilite(request: DisponibiliteRequest): Promise<DisponibiliteResponse> {
    try {
      const response = await apiService.post('/abonnements/verifier-disponibilite', request);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la vérification de disponibilité');
      }
    } catch (error) {
      console.error('Erreur verifierDisponibilite:', error);
      throw error;
    }
  }

  /**
   * Vérifier la disponibilité des créneaux pour un abonnement
   */
  async verifierDisponibiliteAbonnement(request: {
    terrain_id: number;
    jours_preferes: number[];
    creneaux_preferes: string[];
    duree_seance: number;
    nb_seances: number;
  }): Promise<ApiResponse> {
    try {
      const response = await apiService.post('/abonnements/verifier-disponibilite-abonnement', request);
      return response;
    } catch (error) {
      console.error('Erreur verifierDisponibiliteAbonnement:', error);
      throw error;
    }
  }

  /**
   * Calculer le prix d'un abonnement avec options
   */
  async calculerPrixAbonnement(request: CalculPrixRequest): Promise<CalculPrixResponse> {
    try {
      const response = await apiService.post('/abonnements/calculer-prix', request);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors du calcul du prix');
      }
    } catch (error) {
      console.error('Erreur calculerPrixAbonnement:', error);
      throw error;
    }
  }

  /**
   * Formater les jours de la semaine en français
   */
  formatJoursSemaine(jours: string[]): string[] {
    const joursMap: { [key: string]: string } = {
      'monday': 'Lundi',
      'tuesday': 'Mardi',
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche',
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };

    return jours.map(jour => joursMap[jour.toLowerCase()] || jour);
  }

  /**
   * Formater les créneaux horaires
   */
  formatCreneaux(creneaux: string[]): string[] {
    return creneaux.map(creneau => {
      // Convertir "08:00-10:00" en "08h00 - 10h00"
      return creneau.replace(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/, '$1h$2 - $3h$4');
    });
  }

  /**
   * Générer les options de jours pour un select
   */
  generateJoursOptions(joursDisponibles: string[]) {
    const joursFormates = this.formatJoursSemaine(joursDisponibles);
    return joursFormates.map((jour, index) => ({
      value: joursDisponibles[index],
      label: jour
    }));
  }

  /**
   * Générer les options de créneaux pour un select
   */
  generateCreneauxOptions(creneauxDisponibles: string[]) {
    const creneauxFormates = this.formatCreneaux(creneauxDisponibles);
    return creneauxFormates.map((creneau, index) => ({
      value: creneauxDisponibles[index],
      label: creneau
    }));
  }
}

export const abonnementConditionsService = new AbonnementConditionsService();
