import pandas as pd

# Lire le fichier Excel
df = pd.read_excel(r'c:/laragon/www/Terrains-Synthetiques/Questionnaire_pour_les_gestionnaires_de_terrains_synthétiques_-_all_versions_-_labels_-_2026-03-27-21-36-01.xlsx')

print("=== PRÉPARATION IMPORT TERRAINS (VERSION CORRIGÉE) ===")
print()

# Nettoyer et préparer les données
terrains_import = []

for i, row in df.iterrows():
    terrain = {
        'nom': row['Nom du terrain'],
        'description': f"Terrain géré par {row['Prénom & Nom']}. Contact: {row['Numéro de téléphone']}. Modes de paiement: Espèce, Orange Money, Wave, Free Money.",
        'adresse': '',
        'telephone': str(row['Numéro de téléphone']),
        'email': str(row['Email du terrain']) if pd.notna(row['Email du terrain']) and row['Email du terrain'] != 'Néant' else '',
        'prix_heure': None,
        'capacite': 15,  # Valeur par défaut plus réaliste
        'est_actif': True,
        'type_surface': 'synthetique',
        'nombre_joueurs': '5x5, 7x7, 9x9, 11x11',
        'eclairage': True,
        'vestiaires': True,
        'parking': True,
        'douches': False,
        'buvette': False,
        'latitude': None,
        'longitude': None
    }
    
    # Extraire et corriger les coordonnées GPS
    adresse_brute = str(row['Adresse du terrain'])
    
    # Vérifier si on a des coordonnées séparées dans les colonnes dédiées
    if '_Adresse du terrain_latitude' in df.columns:
        lat = row['_Adresse du terrain_latitude']
        lng = row['_Adresse du terrain_longitude']
        if pd.notna(lat) and pd.notna(lng):
            terrain['latitude'] = float(lat)
            terrain['longitude'] = float(lng)
            terrain['adresse'] = f"Zone {row['Nom du terrain']} - Dakar"
    
    # Si pas de coordonnées séparées, essayer de parser l'adresse
    if terrain['latitude'] is None and 'nan' not in adresse_brute and ',' in adresse_brute:
        try:
            coords = adresse_brute.split(',')
            if len(coords) >= 2:
                lat_str = coords[0].strip()
                lng_str = coords[1].split()[0].strip()
                terrain['latitude'] = float(lat_str)
                terrain['longitude'] = float(lng_str)
                terrain['adresse'] = f"Zone {row['Nom du terrain']} - Dakar"
        except:
            terrain['adresse'] = f"Zone {row['Nom du terrain']} - Dakar"
    
    # Si toujours pas d'adresse, utiliser une valeur par défaut
    if not terrain['adresse']:
        terrain['adresse'] = f"Zone {row['Nom du terrain']} - Dakar"
    
    # Déterminer le prix (moyenne matin/soir si disponibles)
    prix_matin = row['Quel est le tarif du matin ?']
    prix_soir = row['Quel est le tarif le soir ?']
    
    if pd.notna(prix_matin) and pd.notna(prix_soir):
        terrain['prix_heure'] = int((prix_matin + prix_soir) / 2)
    elif pd.notna(prix_matin):
        terrain['prix_heure'] = int(prix_matin)
    elif pd.notna(prix_soir):
        terrain['prix_heure'] = int(prix_soir)
    else:
        terrain['prix_heure'] = 25000  # Prix par défaut réaliste
    
    # Capacités spécifiques
    capacites = []
    for taille in ['3X3', '5X5', '8X8', '11X11']:
        col_name = f'Capacité du terrain/{taille}'
        if col_name in df.columns and pd.notna(row[col_name]) and row[col_name] > 0:
            capacites.append(f"{taille}: {int(row[col_name])} joueurs")
    
    if capacites:
        terrain['nombre_joueurs'] = ', '.join(capacites)
    
    # Ajouter le gestionnaire comme info supplémentaire
    terrain['description'] += f" Gérant: {row['Prénom & Nom']}."
    
    terrains_import.append(terrain)

print(f"{len(terrains_import)} terrains préparés pour l'import")
print()

# Générer le CSV
import csv
csv_file = 'terrains_questionnaire_import.csv'

with open(csv_file, 'w', newline='', encoding='utf-8') as file:
    fieldnames = ['nom', 'description', 'adresse', 'latitude', 'longitude', 'prix_heure', 
                  'capacite', 'telephone', 'email', 'est_actif', 'type_surface', 
                  'nombre_joueurs', 'eclairage', 'vestiaires', 'parking', 'douches', 'buvette']
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    
    writer.writeheader()
    for terrain in terrains_import:
        writer.writerow(terrain)

print(f"✅ Fichier CSV généré : {csv_file}")
print()

# Afficher les détails pour validation
print("=== DÉTAILS DES TERRAINS À IMPORTER ===")
for i, terrain in enumerate(terrains_import, 1):
    print(f"\n{i}. {terrain['nom']}")
    print(f"   Adresse: {terrain['adresse']}")
    print(f"   Coordonnées: {terrain['latitude']}, {terrain['longitude']}")
    print(f"   Prix: {terrain['prix_heure']} FCFA/heure")
    print(f"   Capacités: {terrain['nombre_joueurs']}")
    print(f"   Contact: {terrain['telephone']}")
    print(f"   Équipements: Éclairage✓ Vestiaires✓ Parking✓")

print(f"\n📋 Le fichier {csv_file} est prêt pour l'import via l'interface admin !")
print("\n🔧 ÉTAPES SUIVANTES:")
print("1. Connecter à l'interface admin")
print("2. Aller dans 'Import CSV Terrains'")
print("3.Uploader le fichier terrains_questionnaire_import.csv")
print("4. Valider l'import")
print("5. Attribuer les gestionnaires aux terrains")
