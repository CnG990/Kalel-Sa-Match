import pandas as pd

# Lire le fichier Excel
df = pd.read_excel(r'c:/laragon/www/Terrains-Synthetiques/Questionnaire_pour_les_gestionnaires_de_terrains_synthétiques_-_all_versions_-_labels_-_2026-03-27-21-36-01.xlsx')

print("=== PRÉPARATION IMPORT TERRAINS ===")
print()

# Nettoyer et préparer les données
terrains_import = []

for i, row in df.iterrows():
    terrain = {
        'nom': row['Nom du terrain'],
        'description': f"Terrain géré par {row['Prénom & Nom']}. Contact: {row['Numéro de téléphone']}",
        'adresse': str(row['Adresse du terrain']).replace('nan', ''),
        'telephone': str(row['Numéro de téléphone']),
        'email': str(row['Email du terrain']) if pd.notna(row['Email du terrain']) and row['Email du terrain'] != 'Néant' else '',
        'prix_heure': None,  # Sera déterminé plus bas
        'capacite': 10,  # Valeur par défaut
        'est_actif': True,
        'type_surface': 'synthetique',
        'nombre_joueurs': '5x5, 7x7, 11x11',
        'eclairage': True,
        'vestiaires': True,
        'parking': True,
        'douches': False,
        'buvette': False,
        'latitude': None,
        'longitude': None
    }
    
    # Extraire les coordonnées GPS si disponibles
    adresse = str(row['Adresse du terrain'])
    if 'nan' not in adresse and ',' in adresse:
        try:
            coords = adresse.split(',')
            if len(coords) >= 2:
                terrain['latitude'] = float(coords[0].strip())
                terrain['longitude'] = float(coords[1].split()[0].strip())
                # Nettoyer l'adresse pour ne garder que la partie textuelle
                terrain['adresse'] = ' '.join(coords[1].split()[1:]) if len(coords[1].split()) > 1 else ''
        except:
            pass
    
    # Déterminer le prix (moyenne matin/soir si disponibles)
    prix_matin = row['Quel est le tarif du matin ?']
    prix_soir = row['Quel est le tarif le soir ?']
    
    if pd.notna(prix_matin) and pd.notna(prix_soir):
        terrain['prix_heure'] = (prix_matin + prix_soir) / 2
    elif pd.notna(prix_matin):
        terrain['prix_heure'] = prix_matin
    elif pd.notna(prix_soir):
        terrain['prix_heure'] = prix_soir
    else:
        terrain['prix_heure'] = 25000  # Prix par défaut
    
    # Capacités spécifiques
    capacites = []
    for taille in ['3X3', '5X5', '8X8', '11X11']:
        col_name = f'Capacité du terrain/{taille}'
        if col_name in df.columns and pd.notna(row[col_name]) and row[col_name] > 0:
            capacites.append(f"{taille}: {int(row[col_name])} joueurs")
    
    if capacites:
        terrain['nombre_joueurs'] = ', '.join(capacites)
    
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

print(f"\n📋 Le fichier {csv_file} est prêt pour l'import via l'interface admin !")
