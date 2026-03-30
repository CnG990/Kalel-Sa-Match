import pandas as pd

# Lire le fichier Excel
df = pd.read_excel(r'c:/laragon/www/Terrains-Synthetiques/Questionnaire_pour_les_gestionnaires_de_terrains_synthétiques_-_all_versions_-_labels_-_2026-03-27-21-36-01.xlsx')

print("=== QUESTIONNAIRE GESTIONNAIRES TERRAINS SYNTHÉTIQUES ===")
print(f"Nombre de réponses: {len(df)}")
print()

print("=== INFOS GESTIONNAIRES ===")
for i, row in df.iterrows():
    print(f"{i+1}. {row['Prénom & Nom']} - {row['Numéro de téléphone']}")
    if pd.notna(row['Email du terrain']) and row['Email du terrain'] != 'Néant':
        print(f"   Email: {row['Email du terrain']}")
    print()

print("=== TERRAINS GÉRÉS ===")
for i, row in df.iterrows():
    print(f"{i+1}. {row['Nom du terrain']}")
    print(f"   Adresse: {row['Adresse du terrain']}")
    print()

print("=== RÔLES SUR TERRAIN ===")
print(df['Quel est votre rôle sur le terrain ?'].value_counts())
print()

print("=== MODES DE PAIEMENT ACCEPTÉS ===")
# Analyser les modes de paiement (colonne principale)
paiement_text = df['Quel mode de paiement acceptez-vous'].dropna().str.cat(sep=' ')
modes = set()
for response in paiement_text.split():
    if 'espèce' in response.lower():
        modes.add('Espèce')
    elif 'orange' in response.lower():
        modes.add('Orange Money')
    elif 'wave' in response.lower():
        modes.add('Wave')
    elif 'carte' in response.lower():
        modes.add('Carte bancaire')
    elif 'djamo' in response.lower():
        modes.add('Djamo')
    elif 'free' in response.lower():
        modes.add('Free Money')

for mode in sorted(modes):
    print(f"✓ {mode}")

print("\n=== GESTION DES RÉSERVATIONS ===")
reservation_text = df['Comment gérez-vous actuellement les réservations ?'].dropna().str.cat(sep=' ')
methods = set()
for response in reservation_text.split():
    if 'sur place' in response.lower() or 'place' in response.lower():
        methods.add('Sur place')
    elif 'téléphone' in response.lower() or 'phone' in response.lower():
        methods.add('Téléphone')
    elif 'whatsapp' in response.lower():
        methods.add('WhatsApp')
    elif 'application' in response.lower() or 'appli' in response.lower():
        methods.add('Application web/mobile')

for method in sorted(methods):
    print(f"✓ {method}")

print("\n=== TARIFICATION ===")
print("Tarifs du matin:", df['Quel est le tarif du matin ?'].tolist())
print("Tarifs après-midi:", df["Quel est l'après-midis ?"].tolist() if "Quel est l'après-midis ?" in df.columns else "Non spécifié")
print("Tarifs soir:", df['Quel est le tarif le soir ?'].tolist())

print("\n=== INTÉRÊT POUR UN SITE INTERNET ===")
print(df['Seriez-vous intéressé par un site internet'].value_counts())

print("\n=== INTÉRÊT POUR COLLABORATION ===")
print(df['Souhaitez-vous prêt pour travailler avec nous sur ce projet ?'].value_counts())
