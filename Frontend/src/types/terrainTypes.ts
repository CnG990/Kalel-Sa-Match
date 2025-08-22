// NOUVEAU FICHIER POUR CONTOURNER LE CACHE VITE

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