# 📋 Guide Pratique - Préparation des Fichiers

## 🎯 Formats Recommandés par Situation

### **Situation 1 : Données collectées sur terrain (KoboCollect/ODK)**
➡️ **Format** : CSV
➡️ **Facilité** : ⭐⭐⭐⭐⭐

### **Situation 2 : Données existantes dans Google Earth**
➡️ **Format** : KML
➡️ **Facilité** : ⭐⭐⭐⭐

### **Situation 3 : Données SIG professionnelles (QGIS/ArcMap)**
➡️ **Format** : GeoJSON
➡️ **Facilité** : ⭐⭐⭐

## 📊 1. PRÉPARER UN FICHIER CSV (Le Plus Simple)

### Structure Obligatoire :
```csv
nom,latitude,longitude,prix_heure,capacite,adresse
```

### ✅ Exemple Correct :
```csv
nom,latitude,longitude,prix_heure,capacite,adresse,description
"Terrain Almadies",14.7158,-17.4853,25000,22,"Almadies, Dakar","Terrain moderne"
"Terrain Médina",14.6928,-17.4467,18000,20,"Médina, Dakar","Terrain communautaire"
"Terrain Point E",14.6937,-17.4441,22000,22,"Point E, Dakar","Terrain premium"
```

### 📝 Règles à Respecter :

#### **1. En-têtes (Première ligne)**
```csv
# Colonnes OBLIGATOIRES (au moins une de chaque) :
nom | name | titre                    # Nom du terrain
latitude | lat | y                    # Latitude GPS
longitude | lon | lng | x             # Longitude GPS

# Colonnes OPTIONNELLES :
prix_heure | prix | price | tarif     # Prix par heure en FCFA
capacite | capacity | places          # Nombre de joueurs
adresse | address | location          # Adresse complète
description | desc                    # Description
surface | area | superficie           # Surface en m²
```

#### **2. Données**
- **Coordonnées** : Format décimal (ex: 14.7158, -17.4853)
- **Prix** : Nombres entiers (ex: 25000, pas 25,000)
- **Texte** : Entre guillemets si espaces (ex: "Terrain Almadies")
- **Pas de ligne vide** entre les données

#### **3. Coordonnées Sénégal Valides**
```
Latitude  : entre 12.0 et 17.0  (ex: 14.6928)
Longitude : entre -18.0 et -11.0 (ex: -17.4467)
```

### ❌ Erreurs à Éviter :
```csv
# MAUVAIS - Coordonnées inversées
nom,longitude,latitude,prix_heure
"Terrain",-17.4467,14.6928,25000

# MAUVAIS - Virgule française dans prix
nom,latitude,longitude,prix_heure
"Terrain",14.69,-17.44,"25,000"

# MAUVAIS - Coordonnées au mauvais format
nom,latitude,longitude
"Terrain","14°41'45''N","17°26'48''W"
```

### ✅ Template CSV à Copier :
```csv
nom,latitude,longitude,prix_heure,capacite,adresse,description
"Votre Terrain 1",14.7000,-17.4500,20000,22,"Votre Adresse","Votre Description"
"Votre Terrain 2",14.7100,-17.4600,15000,18,"Votre Adresse 2","Votre Description 2"
```

## 🌍 2. PRÉPARER UN FICHIER KML (Google Earth)

### Méthode 1 : Exporter depuis Google Earth

#### **Étapes dans Google Earth :**
1. **Créer vos terrains** dans Google Earth
2. **Clic droit** sur dossier → Propriétés
3. **Description** : Ajouter infos selon format :
   ```
   Prix: 25000 FCFA
   Capacité: 22 joueurs
   Adresse: Almadies, Dakar
   Surface: 1800 m²
   ```
4. **Fichier** → Enregistrer → Enregistrer sous KML

#### **Structure Description Reconnue :**
```xml
<description>
Prix: 25000
Capacité: 22
Adresse: Almadies, Dakar
Contact: 77 123 45 67
</description>
```

### Méthode 2 : Créer KML Manuel

#### **Template KML :**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Terrains Dakar</name>
    
    <Placemark>
      <name>Terrain Almadies</name>
      <description>Prix: 25000 FCFA, Capacité: 22</description>
      <Point>
        <coordinates>-17.4853,14.7158,0</coordinates>
      </Point>
    </Placemark>
    
    <Placemark>
      <name>Terrain Médina</name>
      <description>Prix: 18000 FCFA, Capacité: 20</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -17.4467,14.6928,0
              -17.4462,14.6928,0
              -17.4462,14.6933,0
              -17.4467,14.6933,0
              -17.4467,14.6928,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    
  </Document>
</kml>
```

## 📍 3. PRÉPARER UN FICHIER GEOJSON (SIG Professionnel)

### Depuis QGIS :

#### **Étapes :**
1. **Ouvrir QGIS** avec vos données
2. **Clic droit couche** → Exporter → Sauvegarder les entités sous
3. **Format** : GeoJSON
4. **SCR** : WGS 84 (EPSG:4326)
5. **Nom fichier** : terrains.geojson

### Depuis ArcMap/ArcGIS :

#### **Étapes :**
1. **ArcToolbox** → Conversion Tools → JSON
2. **Features to JSON**
3. **Format** : GeoJSON
4. **Spatial Reference** : Geographic WGS 1984

### **Structure GeoJSON Attendue :**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-17.4853, 14.7158]
      },
      "properties": {
        "nom": "Terrain Almadies",
        "prix_heure": 25000,
        "capacite": 22,
        "adresse": "Almadies, Dakar",
        "description": "Terrain moderne avec éclairage"
      }
    }
  ]
}
```

## 🔧 4. OUTILS DE PRÉPARATION RECOMMANDÉS

### **Pour CSV :**
- **Excel/LibreOffice** : Export CSV UTF-8
- **Google Sheets** : Télécharger → CSV
- **Notepad++** : Édition manuelle

### **Pour KML :**
- **Google Earth Pro** (Gratuit)
- **Google My Maps**
- **QGIS** (Export KML)

### **Pour GeoJSON :**
- **QGIS** (Recommandé)
- **ArcGIS**
- **geojson.io** (En ligne)

## ✅ 5. CHECKLIST AVANT IMPORT

### **Vérifications Obligatoires :**

#### **CSV :**
- [ ] En-têtes en première ligne
- [ ] Colonnes nom, latitude, longitude présentes
- [ ] Coordonnées au format décimal
- [ ] Pas de caractères spéciaux dans les nombres
- [ ] Encodage UTF-8

#### **KML :**
- [ ] Fichier s'ouvre dans Google Earth
- [ ] Chaque Placemark a un nom
- [ ] Coordonnées au format lon,lat,altitude
- [ ] Descriptions contiennent prix/capacité

#### **GeoJSON :**
- [ ] Validation JSON (jsonlint.com)
- [ ] Projection WGS84 (EPSG:4326)
- [ ] Properties contiennent les attributs nécessaires
- [ ] Géométries valides (pas d'auto-intersection)

### **Test Rapide :**
1. **Ouvrir** votre fichier dans un éditeur de texte
2. **Vérifier** les premières lignes
3. **Compter** le nombre d'entrées
4. **Valider** une coordonnée sur Google Maps

## 📍 6. EXEMPLES PRATIQUES PAR QUARTIER DAKAR

### **CSV pour Collecte Terrain :**
```csv
nom,latitude,longitude,prix_heure,capacite,adresse,description
"Terrain Almadies",14.7158,-17.4853,25000,22,"Route des Almadies","Terrain moderne éclairé"
"Terrain Mermoz",14.6749,-17.4638,20000,22,"Cité Mermoz","Terrain communautaire"
"Terrain Médina",14.6928,-17.4467,18000,20,"Médina rue 15","Terrain historique"
"Terrain Point E",14.6937,-17.4441,22000,22,"Point E Extension","Terrain premium"
"Terrain Yoff",14.7392,-17.4692,15000,20,"Yoff Virage","Terrain en bord de mer"
```

### **Coordonnées GPS Quartiers Dakar :**
```
Plateau      : 14.6928, -17.4467
Médina       : 14.6928, -17.4467  
Point E      : 14.6937, -17.4441
Mermoz       : 14.6749, -17.4638
Almadies     : 14.7158, -17.4853
Yoff         : 14.7392, -17.4692
Parcelles    : 14.7797, -17.3944
Pikine       : 14.7547, -17.3927
Guédiawaye   : 14.7644, -17.4138
```

## 🚨 7. ERREURS COURANTES À ÉVITER

### **❌ CSV Problématique :**
```csv
# Erreur : Pas d'en-têtes
"Terrain 1",14.69,-17.44,25000

# Erreur : Coordonnées inversées  
nom,longitude,latitude
"Terrain",-17.44,14.69

# Erreur : Virgules françaises
nom,prix
"Terrain","25,000"
```

### **❌ Coordonnées Invalides :**
```
# Hors Sénégal
latitude: 48.8566 (Paris)
longitude: 2.3522 (Paris)

# Format degrés/minutes
"14°41'45''N"
```

### **❌ Encodage :**
```
# Caractères corrompus
"Terrain Médina" → "Terrain MÃ©dina"
```

## 🎯 8. VALIDATION FINALE

### **Avant Import :**
1. **Tester** 1-2 entrées d'abord
2. **Vérifier** coordonnées sur Google Maps
3. **Compter** lignes attendues vs importées
4. **Sauvegarder** fichier original

### **Après Import :**
1. **Vérifier** terrains dans l'admin
2. **Contrôler** coordonnées sur carte
3. **Valider** prix et capacités
4. **Tester** recherche par nom

---

## 🏁 RÉSUMÉ QUICK START

### **Le Plus Simple (CSV) :**
1. **Créer** fichier avec : nom,latitude,longitude,prix_heure,capacite,adresse
2. **Ajouter** vos terrains ligne par ligne
3. **Vérifier** coordonnées Dakar (lat: 14.x, lon: -17.x)
4. **Sauvegarder** en UTF-8
5. **Importer** dans Admin > Terrains > Import Géomatique

**Vous êtes prêt !** 🚀

---
**💡 Conseil** : Commencez avec 2-3 terrains en CSV pour tester, puis ajoutez le reste !

**📞 Support** : En cas de problème, gardez votre fichier original et notez le message d'erreur exact. 