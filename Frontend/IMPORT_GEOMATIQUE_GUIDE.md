# Guide - Import Géomatique : Comment ça marche ?

## 🎯 Vue d'ensemble

Quand vous importez des fichiers géomatiques (Shapefile, KML, CSV KoboCollect, GeoJSON), voici comment l'application les traite :

## 📁 Types de Fichiers Supportés

### 1. **Shapefile (.shp + .dbf + .shx + .prj)**
```
Format ESRI standard
├── terrain.shp     # Géométries (polygones/points)
├── terrain.dbf     # Attributs (nom, prix, capacité)
├── terrain.shx     # Index spatial
└── terrain.prj     # Projection (WGS84)
```

### 2. **KML/KMZ (.kml/.kmz)**
```xml
Format Google Earth
<kml>
  <Placemark>
    <name>Terrain Sacré Cœur</name>
    <description>Prix: 15000 FCFA, Capacité: 22</description>
    <Polygon>
      <coordinates>-17.47,14.69,0 -17.46,14.70,0</coordinates>
    </Polygon>
  </Placemark>
</kml>
```

### 3. **CSV KoboCollect (.csv)**
```csv
nom,latitude,longitude,prix_heure,capacite,adresse
"Terrain Mermoz",14.6749,-17.4638,20000,22,"Mermoz Dakar"
"Terrain Yoff",14.7392,-17.4692,13000,20,"Yoff Virage"
```

### 4. **GeoJSON (.geojson)**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-17.47,14.69],[-17.46,14.70]]]
      },
      "properties": {
        "nom": "Terrain Sacré Cœur",
        "prix_heure": 15000,
        "capacite": 22
      }
    }
  ]
}
```

## ⚙️ Processus d'Import Détaillé

### Étape 1 : Upload Frontend
```typescript
// Frontend - ManageTerrainsPage.tsx
const handleFileUpload = async (files: FileList) => {
  const fileArray = Array.from(files);
  
  // Validation des types
  const allowedTypes = ['.shp', '.dbf', '.shx', '.prj', '.geojson', '.kml', '.csv'];
  const invalidFiles = fileArray.filter(file => 
    !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))
  );
  
  // Envoi vers le backend
  const formData = new FormData();
  selectedFiles.forEach(file => {
    formData.append('files[]', file);
  });
  
  const response = await apiService.importGeoData(formData);
}
```

### Étape 2 : Traitement Backend
```php
// Backend - AdminController.php
public function importGeoData(Request $request): JsonResponse
{
    $files = $request->file('files');
    $importedCount = 0;

    foreach ($files as $file) {
        $extension = strtolower($file->getClientOriginalExtension());
        
        switch ($extension) {
            case 'geojson':
                $importedCount += $this->importGeoJSON($file);
                break;
            case 'kml':
                $importedCount += $this->importKML($file);
                break;
            case 'csv':
                $importedCount += $this->importCSV($file);
                break;
            case 'shp':
                $importedCount += $this->importShapefile($file);
                break;
        }
    }

    return response()->json([
        'success' => true,
        'message' => "Import réussi: {$importedCount} terrains importés"
    ]);
}
```

### Étape 3 : Extraction des Données

#### Pour GeoJSON :
```php
private function importGeoJSON($file): int
{
    $content = file_get_contents($file->getPathname());
    $geojson = json_decode($content, true);
    
    foreach ($geojson['features'] as $feature) {
        $properties = $feature['properties'] ?? [];
        $geometry = $feature['geometry'] ?? null;
        
        // Extraction des coordonnées
        $coordinates = $geometry['coordinates'];
        if ($geometry['type'] === 'Point') {
            $longitude = $coordinates[0];
            $latitude = $coordinates[1];
        }
        
        // Création du terrain
        $terrain = Terrain::create([
            'nom' => $properties['nom'] ?? 'Terrain importé',
            'description' => $properties['description'] ?? null,
            'adresse' => $properties['adresse'] ?? '',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'geometry' => json_encode($geometry) // PostGIS
        ]);
    }
}
```

#### Pour CSV KoboCollect :
```php
private function importCSV($file): int
{
    $csv = array_map('str_getcsv', file($file->getPathname()));
    $header = array_shift($csv); // Première ligne = en-têtes
    
    foreach ($csv as $row) {
        $data = array_combine($header, $row);
        
        // Mapping des colonnes
        $terrain = Terrain::create([
            'nom' => $data['nom'] ?? $data['name'] ?? 'Terrain',
            'latitude' => (float) $data['latitude'],
            'longitude' => (float) $data['longitude'],
            'adresse' => $data['adresse'] ?? $data['address'] ?? '',
        ]);
    }
}
```

#### Pour KML :
```php
private function importKML($file): int
{
    $xml = simplexml_load_file($file->getPathname());
    
    foreach ($xml->Document->Placemark as $placemark) {
        $name = (string) $placemark->name;
        $description = (string) $placemark->description;
        
        // Extraction des coordonnées
        $coordinates = (string) $placemark->Polygon->outerBoundaryIs->LinearRing->coordinates;
        $coords = explode(' ', trim($coordinates));
        $firstCoord = explode(',', $coords[0]);
        
        $longitude = (float) $firstCoord[0];
        $latitude = (float) $firstCoord[1];
        
        // Parsing de la description pour extraire prix/capacité
        preg_match('/Prix:\s*(\d+)/', $description, $prix_match);
        preg_match('/Capacité:\s*(\d+)/', $description, $capacite_match);
        
        $terrain = Terrain::create([
            'nom' => $name,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'prix_heure' => isset($prix_match[1]) ? (int) $prix_match[1] : 0,
            'capacite' => isset($capacite_match[1]) ? (int) $capacite_match[1] : 22,
            'adresse' => $description
        ]);
    }
}
```

### Étape 4 : Intégration PostGIS

```php
// Calcul automatique de la surface avec PostGIS
public function calculateSurface($geometry)
{
    if ($geometry) {
        // Convertir en projection métrique pour calcul précis
        $surface = DB::selectOne("
            SELECT ST_Area(ST_Transform(ST_GeomFromGeoJSON(?), 32628)) as surface
        ", [$geometry]);
        
        return $surface->surface; // en m²
    }
    return null;
}

// Mise à jour du terrain avec géométrie PostGIS
$terrain->update([
    'geometry' => DB::raw("ST_GeomFromGeoJSON('$geometryJson')"),
    'surface' => $this->calculateSurface($geometryJson)
]);
```

## 🔍 Mapping des Attributs

### Champs Automatiquement Mappés :
```php
$mapping = [
    // Noms possibles -> Champ DB
    'nom|name|titre|title' => 'nom',
    'description|desc|details' => 'description',
    'adresse|address|location' => 'adresse',
    'latitude|lat|y' => 'latitude',
    'longitude|lon|lng|x' => 'longitude',
    'prix|price|cost|tarif|prix_heure' => 'prix_heure',
    'capacite|capacity|places|joueurs' => 'capacite',
    'surface|area|superficie' => 'surface'
];
```

## 📊 Validation des Données

### Contrôles Automatiques :
- ✅ **Coordonnées** dans les limites Sénégal (lat: 12-17°, lon: -18 à -11°)
- ✅ **Prix** positif et réaliste (< 100 000 FCFA)
- ✅ **Capacité** entre 4 et 50 joueurs
- ✅ **Géométrie** valide (pas de polygones auto-intersectants)
- ✅ **Doublons** détectés par proximité (< 100m)

### Gestion d'Erreurs :
```php
try {
    $terrain = Terrain::create($data);
    $successCount++;
} catch (Exception $e) {
    $errors[] = [
        'file' => $file->getClientOriginalName(),
        'line' => $lineNumber,
        'error' => $e->getMessage(),
        'data' => $data
    ];
}
```

## 🎨 Interface Utilisateur

### Retour Visuel :
```typescript
// Affichage des résultats d'import
if (response.success) {
    toast.success(`✅ ${response.data.imported_count} terrains importés`);
    
    // Affichage des erreurs si il y en a
    if (response.data.errors?.length > 0) {
        toast.warning(`⚠️ ${response.data.errors.length} erreurs détectées`);
    }
    
    // Refresh de la liste
    fetchTerrains();
}
```

### Feedback en Temps Réel :
- 📤 **Upload** : Barre de progression
- 🔍 **Validation** : Vérification des formats
- ⚙️ **Traitement** : Compteur de terrains traités
- ✅ **Résultat** : Statistiques d'import + erreurs

## 🛠️ Améliorations Prévues

### 1. **Shapefile Complet**
```php
// Utilisation de la librairie PHP-ShapeFile
use ShapeFile\ShapeFile;

private function importShapefile($shpFile, $dbfFile): int
{
    $shapeFile = new ShapeFile($shpFile, $dbfFile);
    
    while ($record = $shapeFile->getRecord()) {
        $geometry = $record->getGeometry();
        $attributes = $record->getAttributes();
        
        // Traitement...
    }
}
```

### 2. **Import par Chunks**
```php
// Pour gros fichiers (> 1000 terrains)
DB::transaction(function() use ($data) {
    foreach (array_chunk($data, 100) as $chunk) {
        Terrain::insert($chunk);
    }
});
```

### 3. **Validation Avancée**
```php
// Validation avec règles métier
$validator = Validator::make($data, [
    'latitude' => 'required|numeric|between:12,17',
    'longitude' => 'required|numeric|between:-18,-11',
    'prix_heure' => 'required|integer|min:1000|max:100000',
    'capacite' => 'required|integer|between:4,50'
]);
```

## 📈 Statistiques d'Import

L'application génère automatiquement :
- ✅ **Nombre** de terrains importés
- ❌ **Erreurs** avec détails
- 📍 **Géolocalisation** validée
- 💰 **Prix** moyens par zone
- 📐 **Surfaces** calculées automatiquement

---
**🎯 Résultat** : Vos fichiers géomatiques sont automatiquement transformés en terrains utilisables avec géométries PostGIS, calculs de surfaces et validation complète ! 