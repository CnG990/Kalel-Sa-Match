# Guide de Création de la Carte de Situation Géographique
## Terrains Synthétiques de Dakar

### Objectif
Créer une carte de situation géographique montrant l'emplacement de tous les terrains synthétiques de Dakar pour inclusion dans le mémoire.

### Données Nécessaires
- Coordonnées GPS des 12 terrains synthétiques (WGS84, SRID 4326)
- Fichiers KML des terrains (déjà créés)
- Données de base de Dakar (limites administratives, routes principales)

### Étapes de Création avec ArcMap 10.8

#### Étape 1 : Préparation des Données
1. **Ouvrir ArcMap 10.8**
2. **Importer les fichiers KML** :
   - Aller dans `File > Add Data > Add Data from ArcGIS Online`
   - Ou utiliser `Conversion Tools > From KML > KML to Layer`
   - Importer tous les fichiers KML des terrains

#### Étape 2 : Configuration de la Carte
1. **Définir le système de coordonnées** :
   - `View > Data Frame Properties > Coordinate System`
   - Sélectionner `Geographic Coordinate Systems > World > WGS 1984`
   - Ou utiliser `Projected Coordinate Systems > UTM > WGS 1984 > Northern Hemisphere > WGS 1984 UTM Zone 28N`

2. **Ajouter les données de base** :
   - Limites administratives de Dakar
   - Routes principales
   - Points de repère (aéroport, centre-ville)

#### Étape 3 : Création de la Carte
1. **Organiser les couches** :
   - Limites administratives (fond)
   - Routes principales
   - Points des terrains synthétiques
   - Étiquettes des terrains

2. **Styliser les éléments** :
   - **Terrains** : Symboles distinctifs (cercle coloré avec icône football)
   - **Limites** : Ligne fine grise
   - **Routes** : Ligne fine noire
   - **Étiquettes** : Police Arial 10pt, couleur noire

3. **Ajouter les éléments de carte** :
   - **Titre** : "Carte de Situation Géographique des Terrains Synthétiques de Dakar"
   - **Échelle** : Barre d'échelle numérique et graphique
   - **Flèche du Nord** : Orientation géographique
   - **Légende** : Explication des symboles utilisés

#### Étape 4 : Mise en Page
1. **Passer en mode Layout** :
   - `View > Layout View`

2. **Configurer la page** :
   - Format A4 paysage
   - Marges appropriées (1 cm minimum)

3. **Positionner les éléments** :
   - Carte principale au centre
   - Titre en haut
   - Légende à droite
   - Échelle et flèche du Nord en bas à gauche

#### Étape 5 : Ajout d'Informations Complémentaires
1. **Tableau des terrains** :
   - Nom du terrain
   - Commune
   - Coordonnées GPS
   - Prix indicatif

2. **Note explicative** :
   - Source des données
   - Date de collecte
   - Système de coordonnées utilisé

#### Étape 6 : Export et Finalisation
1. **Exporter la carte** :
   - `File > Export Map`
   - Format : PNG haute résolution (300 DPI)
   - Taille : A4 paysage

2. **Vérifications finales** :
   - Lisibilité de tous les éléments
   - Précision des emplacements
   - Qualité visuelle générale

### Données des Terrains à Inclure

| N° | Nom du Terrain | Commune | Coordonnées GPS | Prix (FCFA/h) |
|----|----------------|---------|-----------------|----------------|
| 1 | Complexe Be Sport | Route de l'Aéroport | 14.7245, -17.4673 | 45,000 |
| 2 | Fara Foot | Fann-Point E-Amitié | 14.7167, -17.4567 | 35,000 |
| 3 | Fit Park Academy | Route de la Corniche Ouest | 14.7189, -17.4589 | 80,000 |
| 4 | Skate Parc | Corniche Ouest | 14.7201, -17.4601 | 30,000 |
| 5 | Sowfoot | Central Park Avenue Malick Sy | 14.7213, -17.4623 | 27,500 |
| 6 | Stade Deggo | Marriste | 14.7225, -17.4645 | 22,500 |
| 7 | Terrain ASC Jaraaf | Médina | 14.7237, -17.4667 | 16,500 |
| 8 | TENNIS Mini Foot Squash | ASTU, Dakar | 14.7249, -17.4689 | 30,000 |
| 9 | Temple du Foot | Dakar | 14.6868, -17.4547 | 42,500 |
| 10 | Terrain École Police | École de Police | 14.7020, -17.4654 | 125,000 |
| 11 | Terrain Sacré Cœur | Sacré Cœur | 14.7136, -17.4635 | 27,500 |
| 12 | Terrain Thia | Dakar | 14.7148, -17.4637 | 20,000 |

### Emplacement dans le Mémoire

La carte de situation géographique doit être placée dans le **Chapitre 2 : Travaux Réalisés**, spécifiquement dans la section **2.1.1 Travail numéro 1 : Collecte et traitement géomatique des données spatiales**.

**Structure recommandée :**

```
2.1.1 Travail numéro 1 : Collecte et traitement géomatique des données spatiales

[Texte existant...]

**Carte de situation géographique :**

[Insérer la carte ici]

*Figure 2.1 : Carte de situation géographique des terrains synthétiques de Dakar*

[Suite du texte...]
```

### Éléments à Inclure dans la Légende

- **Symbole des terrains** : Cercle avec icône football
- **Limites administratives** : Ligne grise fine
- **Routes principales** : Ligne noire fine
- **Échelle** : 1:50,000 ou 1:100,000 selon la zone couverte
- **Système de coordonnées** : WGS 1984 (EPSG:4326)

### Conseils pour une Carte Professionnelle

1. **Couleurs harmonieuses** : Utiliser une palette de couleurs cohérente
2. **Hiérarchie visuelle** : Les terrains doivent être l'élément le plus visible
3. **Lisibilité** : Vérifier que tous les textes sont lisibles
4. **Équilibre** : Répartir harmonieusement les éléments sur la page
5. **Qualité** : Exporter en haute résolution pour une impression de qualité

### Validation Finale

Avant d'inclure la carte dans le mémoire, vérifier :
- Précision géographique des emplacements
- Complétude des informations
- Qualité visuelle et professionnelle
- Cohérence avec le style du mémoire 