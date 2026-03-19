import type { FeatureCollection, Polygon, Point } from 'geojson';

export interface TerrainGeometryFeatureCollection extends FeatureCollection<Polygon | Point> {}

export interface TerrainUI {
  id: number;
  nom: string;
  name?: string;
  description?: string;
  adresse?: string;
  latitude?: number | null;
  longitude?: number | null;
  prix_heure?: number | null;
  capacite?: number | null;
  terrain_synthetique_id?: number | null;
  images?: string[];
  equipements?: string[];
  regles_terrain?: string;
  surface_calculee?: number | null;
  surface?: number | null;
  geometry?: GeoJSON.Geometry;
  est_disponible?: boolean;
  est_actif?: boolean;
  horaires_ouverture?: Record<string, unknown> | string;
  horaires_fermeture?: string;
  note_moyenne?: number | null;
  nombre_avis?: number | null;
  image_principale?: string;
  type_surface?: string;
  longueur?: number | null;
  largeur?: number | null;
  nombre_joueurs?: string;
  eclairage?: boolean;
  vestiaires?: boolean;
  parking?: boolean;
  douches?: boolean;
  buvette?: boolean;
  telephone?: string;
  ville?: string;
  quartier?: string;
  [key: string]: unknown;
}
