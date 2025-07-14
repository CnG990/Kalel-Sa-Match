<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ImportTerrain;
use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ImportTerrainController extends Controller
{
    /**
     * Lister les imports avec pagination
     */
    public function index(Request $request)
    {
        $query = ImportTerrain::with('importateur');

        // Filtres
        if ($request->has('type_fichier')) {
            $query->where('type_fichier', $request->type_fichier);
        }

        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        if ($request->has('statut_traitement')) {
            $query->where('statut_traitement', $request->statut_traitement);
        }

        $imports = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $imports
        ]);
    }

    /**
     * Upload et traitement d'un fichier
     */
    public function uploadFichier(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:51200', // 50MB max
            'source' => 'required|in:upload_manuel,kobocollect,api_externe'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier invalide',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $typeFichier = $this->determinerTypeFichier($extension);

        if (!$typeFichier) {
            return response()->json([
                'success' => false,
                'message' => 'Format de fichier non supporté'
            ], 422);
        }

        try {
            // Stocker le fichier
            $nomFichier = Str::uuid() . '.' . $extension;
            $cheminFichier = $file->storeAs('imports', $nomFichier, 'local');

            // Créer l'enregistrement d'import
            $import = ImportTerrain::create([
                'importe_par' => auth()->id(),
                'nom_fichier_original' => $file->getClientOriginalName(),
                'chemin_fichier' => $cheminFichier,
                'type_fichier' => $typeFichier,
                'source' => $request->source,
                'statut_traitement' => 'en_attente'
            ]);

            // Analyser les métadonnées du fichier
            $metadonnees = $this->analyserMetadonnees($cheminFichier, $typeFichier);
            $import->ajouterMetadonnees($metadonnees);

            // Démarrer le traitement en arrière-plan
            $this->traiterImport($import);

            return response()->json([
                'success' => true,
                'message' => 'Fichier uploadé avec succès',
                'data' => $import
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import depuis KoBoCollect
     */
    public function importKoboCollect(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'api_key' => 'required|string',
            'form_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètres KoBoCollect invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Appel à l'API KoBoCollect
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $request->api_key
            ])->get("https://kf.kobotoolbox.org/api/v2/assets/{$request->form_id}/data/");

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la connexion à KoBoCollect'
                ], 400);
            }

            $data = $response->json();

            // Créer un fichier temporaire avec les données
            $nomFichier = "kobocollect_{$request->form_id}_" . now()->format('Y-m-d_H-i-s') . '.json';
            $cheminFichier = 'imports/' . $nomFichier;
            Storage::put($cheminFichier, json_encode($data, JSON_PRETTY_PRINT));

            // Créer l'enregistrement d'import
            $import = ImportTerrain::create([
                'importe_par' => auth()->id(),
                'nom_fichier_original' => $nomFichier,
                'chemin_fichier' => $cheminFichier,
                'type_fichier' => 'json',
                'source' => 'kobocollect',
                'statut_traitement' => 'en_attente',
                'metadonnees' => [
                    'form_id' => $request->form_id,
                    'nb_enregistrements' => count($data['results'] ?? []),
                    'date_recuperation' => now()->toISOString()
                ]
            ]);

            // Traiter l'import
            $this->traiterImportKobo($import, $data);

            return response()->json([
                'success' => true,
                'message' => 'Import KoBoCollect démarré',
                'data' => $import
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'import KoBoCollect',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les détails d'un import
     */
    public function show($id)
    {
        $import = ImportTerrain::with(['importateur', 'terrainsCreees'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $import
        ]);
    }

    /**
     * Réessayer un import en erreur
     */
    public function retry($id)
    {
        $import = ImportTerrain::where('statut_traitement', 'erreur')->findOrFail($id);

        try {
            $import->update(['statut_traitement' => 'en_attente']);
            $this->traiterImport($import);

            return response()->json([
                'success' => true,
                'message' => 'Import relancé',
                'data' => $import
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du relancement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un import
     */
    public function destroy($id)
    {
        $import = ImportTerrain::findOrFail($id);

        try {
            // Supprimer le fichier physique
            $import->deleteFile();
            
            // Supprimer l'enregistrement
            $import->delete();

            return response()->json([
                'success' => true,
                'message' => 'Import supprimé'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Déterminer le type de fichier à partir de l'extension
     */
    private function determinerTypeFichier($extension)
    {
        $types = [
            'csv' => 'csv',
            'json' => 'json',
            'geojson' => 'geojson',
            'kml' => 'kml',
            'zip' => 'shapefile'
        ];

        return $types[strtolower($extension)] ?? null;
    }

    /**
     * Analyser les métadonnées d'un fichier
     */
    private function analyserMetadonnees($cheminFichier, $typeFichier)
    {
        $metadonnees = [
            'taille_fichier' => Storage::size($cheminFichier),
            'type_analyse' => $typeFichier
        ];

        try {
            switch ($typeFichier) {
                case 'csv':
                    $contenu = Storage::get($cheminFichier);
                    $lignes = explode("\n", $contenu);
                    $metadonnees['nb_lignes'] = count($lignes);
                    $metadonnees['colonnes'] = str_getcsv($lignes[0]);
                    break;

                case 'json':
                case 'geojson':
                    $contenu = Storage::get($cheminFichier);
                    $data = json_decode($contenu, true);
                    $metadonnees['structure'] = is_array($data) ? 'array' : 'object';
                    $metadonnees['nb_elements'] = is_array($data) ? count($data) : 1;
                    break;
            }
        } catch (\Exception $e) {
            $metadonnees['erreur_analyse'] = $e->getMessage();
        }

        return $metadonnees;
    }

    /**
     * Traiter un import de fichier
     */
    private function traiterImport(ImportTerrain $import)
    {
        try {
            $import->marquerEnCours();

            $contenu = Storage::get($import->chemin_fichier);
            $terrainsImportes = 0;

            switch ($import->type_fichier) {
                case 'csv':
                    $terrainsImportes = $this->traiterCSV($import, $contenu);
                    break;

                case 'json':
                    $terrainsImportes = $this->traiterJSON($import, $contenu);
                    break;

                case 'geojson':
                    $terrainsImportes = $this->traiterGeoJSON($import, $contenu);
                    break;

                default:
                    throw new \Exception("Type de fichier non supporté: {$import->type_fichier}");
            }

            $import->marquerTermine($terrainsImportes, "Import réussi: {$terrainsImportes} terrains importés");

        } catch (\Exception $e) {
            $import->marquerErreur("Erreur durant l'import: " . $e->getMessage());
        }
    }

    /**
     * Traiter un fichier CSV
     */
    private function traiterCSV(ImportTerrain $import, $contenu)
    {
        $lignes = array_map('str_getcsv', explode("\n", $contenu));
        $entetes = array_shift($lignes);
        $terrainsImportes = 0;

        foreach ($lignes as $ligne) {
            if (empty(array_filter($ligne))) continue;

            $donnees = array_combine($entetes, $ligne);
            
            if ($this->creerTerrainDepuisDonnees($import, $donnees)) {
                $terrainsImportes++;
            }
        }

        return $terrainsImportes;
    }

    /**
     * Traiter un fichier JSON
     */
    private function traiterJSON(ImportTerrain $import, $contenu)
    {
        $data = json_decode($contenu, true);
        $terrainsImportes = 0;

        if (!is_array($data)) {
            $data = [$data];
        }

        foreach ($data as $donnees) {
            if ($this->creerTerrainDepuisDonnees($import, $donnees)) {
                $terrainsImportes++;
            }
        }

        return $terrainsImportes;
    }

    /**
     * Traiter un fichier GeoJSON
     */
    private function traiterGeoJSON(ImportTerrain $import, $contenu)
    {
        $geojson = json_decode($contenu, true);
        $terrainsImportes = 0;

        if (!isset($geojson['features'])) {
            throw new \Exception('Fichier GeoJSON invalide: pas de features');
        }

        foreach ($geojson['features'] as $feature) {
            $donnees = $feature['properties'] ?? [];
            $geometrie = $feature['geometry'] ?? null;

            if ($geometrie) {
                $donnees['coordonnees_polygon'] = $geometrie;
                
                // Extraire latitude/longitude du centroïde
                if ($geometrie['type'] === 'Point') {
                    $donnees['longitude'] = $geometrie['coordinates'][0];
                    $donnees['latitude'] = $geometrie['coordinates'][1];
                }
            }

            if ($this->creerTerrainDepuisDonnees($import, $donnees)) {
                $terrainsImportes++;
            }
        }

        return $terrainsImportes;
    }

    /**
     * Traiter un import KoBoCollect
     */
    private function traiterImportKobo(ImportTerrain $import, $data)
    {
        try {
            $import->marquerEnCours();
            $terrainsImportes = 0;

            foreach ($data['results'] ?? [] as $enregistrement) {
                if ($this->creerTerrainDepuisKobo($import, $enregistrement)) {
                    $terrainsImportes++;
                }
            }

            $import->marquerTermine($terrainsImportes, "Import KoBoCollect réussi: {$terrainsImportes} terrains importés");

        } catch (\Exception $e) {
            $import->marquerErreur("Erreur durant l'import KoBoCollect: " . $e->getMessage());
        }
    }

    /**
     * Créer un terrain depuis des données KoBoCollect
     */
    private function creerTerrainDepuisKobo(ImportTerrain $import, $enregistrement)
    {
        // Mapping des champs KoBoCollect vers notre modèle
        $mapping = [
            'nom' => ['nom_terrain', 'name', 'terrain_name'],
            'description' => ['description', 'desc', 'terrain_description'],
            'adresse' => ['adresse', 'address', 'location'],
            'latitude' => ['_geolocation_latitude', 'lat', 'latitude'],
            'longitude' => ['_geolocation_longitude', 'lon', 'longitude']
        ];

        $donnees = [];
        foreach ($mapping as $champ => $possibilites) {
            foreach ($possibilites as $cle) {
                if (isset($enregistrement[$cle])) {
                    $donnees[$champ] = $enregistrement[$cle];
                    break;
                }
            }
        }

        return $this->creerTerrainDepuisDonnees($import, $donnees);
    }

    /**
     * Créer un terrain depuis des données génériques
     */
    private function creerTerrainDepuisDonnees(ImportTerrain $import, $donnees)
    {
        try {
            // Validation des données minimales
            if (empty($donnees['nom']) || (!isset($donnees['latitude']) && !isset($donnees['longitude']))) {
                return false;
            }

            TerrainSynthetiquesDakar::create([
                'nom' => $donnees['nom'],
                'description' => $donnees['description'] ?? 'Importé automatiquement',
                'adresse' => $donnees['adresse'] ?? '',
                'latitude' => $donnees['latitude'] ?? 0,
                'longitude' => $donnees['longitude'] ?? 0,
                'coordonnees_polygon' => $donnees['coordonnees_polygon'] ?? null,
                'image_principale' => 'images/default-terrain.jpg',
                'images_supplementaires' => [],
                'import_id' => $import->id,
                'source_creation' => $import->source === 'kobocollect' ? 'kobocollect' : 'import_csv',
                'statut_validation' => 'en_attente',
                'est_actif' => false // En attente de validation par l'admin
            ]);

            return true;

        } catch (\Exception $e) {
            \Log::error("Erreur création terrain: " . $e->getMessage(), $donnees);
            return false;
        }
    }

    /**
     * Obtenir les statistiques d'import
     */
    public function statistiques()
    {
        $stats = [
            'total_imports' => ImportTerrain::count(),
            'imports_reussis' => ImportTerrain::termine()->count(),
            'imports_en_erreur' => ImportTerrain::enErreur()->count(),
            'terrains_importes_total' => ImportTerrain::sum('nb_terrains_importes'),
            'imports_par_source' => ImportTerrain::groupBy('source')
                                                 ->selectRaw('source, count(*) as count')
                                                 ->pluck('count', 'source'),
            'imports_par_type' => ImportTerrain::groupBy('type_fichier')
                                               ->selectRaw('type_fichier, count(*) as count')
                                               ->pluck('count', 'type_fichier')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 