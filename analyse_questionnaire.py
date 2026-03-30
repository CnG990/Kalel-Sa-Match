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

print("\n=== MODES DE PAIEMENT ACCEPTÉS ===")
paiement_cols = [col for col in df.columns if 'Quel mode de paiement acceptez-vous' in col]
for col in paiement_cols:
    mode = col.split('/')[-1]
    # Compter les valeurs non nulles/vides
    count = df[col].notna().sum() - df[col].isna().sum()
    print(f"{mode}: {int(count)} gestionnaire(s)")

print("\n=== PROBLÈMES RENCONTRÉS ===")
problemes_cols = [col for col in df.columns if 'Quels problèmes rencontrez-vous le plus souvent ?' in col]
for col in problemes_cols:
    probleme = col.split('/')[-1]
    count = df[col].sum()
    if count > 0:
        print(f"{probleme}: {int(count)} gestionnaire(s)")

print("\n=== TARIFICATION ===")
print("Tarifs du matin:", df['Quel est le tarif du matin ?'].tolist())
print("Tarifs après-midi:", df["Quel est l'après-midis ?"].tolist() if "Quel est l'après-midis ?" in df.columns else "Non spécifié")
print("Tarifs soir:", df['Quel est le tarif le soir ?'].tolist())
