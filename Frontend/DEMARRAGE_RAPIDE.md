# 🚀 Démarrage Rapide - Import de Données

## ⏱️ En 5 Minutes : Premier Import

### **1. Téléchargez le Template** 
```
📁 Backend/storage/app/exemples/template_vide.csv
```

### **2. Ouvrez avec Excel/LibreOffice/Google Sheets**

### **3. Remplacez par vos vraies données :**
```csv
nom,latitude,longitude,adresse,description
"Terrain ASC Jaraaf",14.6928,-17.4467,"Médina, Dakar","Terrain du club ASC Jaraaf"
"Stade LSS",14.6749,-17.4638,"Mermoz, Dakar","Stade Léopold Sédar Senghor"
```

### **4. Sauvegardez en CSV (UTF-8)**

### **5. Importez dans l'Admin**
1. Allez dans **Admin > Terrains** 
2. Cliquez **Import Géomatique**
3. Sélectionnez votre fichier CSV
4. Cliquez **Importer**

## 📍 Trouver vos Coordonnées GPS

### **Méthode Simple :**
1. Ouvrez **Google Maps**
2. Recherchez votre terrain
3. **Clic droit** sur l'emplacement exact
4. Sélectionnez **"Les coordonnées"** 
5. Copiez les nombres (ex: 14.6928, -17.4467)

### **Format Attendu :**
- **Latitude** : 14.6928 (positif pour Sénégal)
- **Longitude** : -17.4467 (négatif pour Sénégal)

## ✅ Checklist Rapide

- [ ] **En-têtes** en première ligne
- [ ] **Latitude** entre 12.0 et 17.0  
- [ ] **Longitude** entre -18.0 et -11.0

- [ ] **Texte** entre guillemets si espaces
- [ ] **Sauvegarde** en UTF-8

## 🎯 Exemple Complet Valide

```csv
nom,latitude,longitude,adresse,description
"Terrain Almadies",14.7158,-17.4853,"Almadies, Dakar","Terrain premium éclairé"
"Terrain Yoff",14.7392,-17.4692,"Yoff, Dakar","Terrain communautaire"
```

## 🚨 Erreurs Fréquentes

❌ **Coordonnées inversées** : longitude,latitude  
✅ **Correct** : latitude,longitude

❌ **Hors Sénégal** : lat: 48.8566 (Paris)  
✅ **Correct** : lat: 14.6928 (Dakar)

---

**🏁 Vous êtes prêt !** En cas de problème, consultez le `GUIDE_PREPARATION_FICHIERS.md` complet. 