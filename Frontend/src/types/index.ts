// Types pour Terrains Synthétiques Dakar

export interface TerrainOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  duration?: number;
  description: string;
  allowedDays?: number[];
  restrictions?: string[];
  allowedHours?: { start: number; end: number };
}

export interface TerrainData {
  id: number;
  nom: string;
  prix_heure: number;
  capacite?: number;
  adresse?: string;
  ville?: string;
  type_terrain?: string;
  surface?: number;
  surface_postgis?: number;
  surface_calculee?: number;
  has_geometry?: boolean;
  geometrie?: string;
  geometrie_geojson?: string;
  latitude?: number;
  longitude?: number;
  gestionnaire_id?: number;
  gestionnaire?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface Terrain {
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
  geometry?: any;
  geometrie?: string;
  geometrie_geojson?: string;
  has_geometry?: boolean;
  surface?: number;
  surface_postgis?: number;
  surface_calculee?: number;
  gestionnaire_id?: number;
  gestionnaire?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  terrain_id: number;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  prix_total: number;
  statut: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  terrain?: Terrain;
}

export interface Abonnement {
  id: number;
  user_id: number;
  terrain_id: number;
  type_abonnement_id?: number;
  type_abonnement: string;
  prix: number;
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  description?: string;
  avantages?: string[];
  categorie?: string;
  est_actif?: boolean;
  est_visible?: boolean;
  ordre_affichage?: number;
  created_at?: string;
  updated_at?: string;
  user?: User;
  terrain?: Terrain;
}

export interface TypeAbonnement {
  id: number;
  nom: string;
  description: string;
  prix: number;
  duree_jours: number;
  avantages: string[];
  categorie: string;
  est_actif: boolean;
  est_visible: boolean;
  ordre_affichage: number;
  couleur_theme?: string;
  icone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  status?: number;
}

export interface FideliteData {
  niveau: string;
  score: number;
  reduction_pourcentage: number;
  prochain_niveau?: string;
  points_requis?: number;
  historique_reductions?: any[];
}

export interface Litige {
  id: number;
  user_id: number;
  terrain_id?: number;
  reservation_id?: number;
  type: string;
  priorite: string;
  sujet: string;
  description: string;
  statut: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  terrain?: Terrain;
  messages?: LitigeMessage[];
}

export interface LitigeMessage {
  id: number;
  litige_id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  created_at: string;
  user?: User;
}

export interface TicketData {
  reservation_id: number;
  qr_code: string;
  qr_code_svg?: string;
  validation_code: string;
  expire_at: string;
  terrain: {
    nom: string;
    adresse: string;
  };
  user: {
    nom: string;
    prenom: string;
  };
  reservation: {
    date_reservation: string;
    heure_debut: string;
    heure_fin: string;
    prix_total: number;
  };
} 