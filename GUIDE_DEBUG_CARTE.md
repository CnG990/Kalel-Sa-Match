# 🛠️ GUIDE DEBUG CARTE - Terrains Synthétiques

## ✅ **ÉTAT ACTUEL VÉRIFIÉ**

### **Backend ✅**
- ✅ API fonctionne : http://127.0.0.1:8000/api/terrains/all-for-map
- ✅ 13 terrains retournés avec coordonnées valides
- ✅ Colonne `geom` présente dans PostgreSQL
- ✅ Table `terrains` inutile supprimée

### **Données API ✅**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "nom": "Complexe Be Sport", 
      "latitude": 14.741066,
      "longitude": -17.46907,
      "prix_heure": 18000,
      "est_actif": true
    }
    // ... 12 autres terrains
  ]
}
```

---

## 🔍 **ÉTAPES DE DÉBOGAGE FRONTEND**

### **1. Ouvrir la Console du Navigateur**
1. Aller sur : http://127.0.0.1:5173/dashboard/map
2. Appuyer sur **F12** pour ouvrir les outils développeur
3. Aller dans l'onglet **Console**
4. Rechercher ces messages :

**Messages attendus :**
```
🗺️ Initialisation carte ULTRA-STABLE...
✅ Carte créée ULTRA-STABLE
🎉 Carte chargée ULTRA-STABLE!
📍 Demande géolocalisation SIMPLE (2D seulement)...
✅ Position 2D obtenue (SANS altitude/Z): {latitude: X, longitude: Y}
🔄 Chargement terrains STABLE...
📄 Réponse API STABLE: {success: true, data: [...]}
✅ 13 terrains récupérés STABLE
🗺️ Création STABLE 13 marqueurs...
📍 Marqueur 2D STABLE Complexe Be Sport → [-17.46907, 14.741066]
✅ Tous les marqueurs créés STABLE
```

### **2. Vérifier les Erreurs Communes**

**❌ Erreur Token Mapbox :**
```
❌ Token Mapbox manquant
Error: Token required
```
**Solution :** Vérifier le fichier `.env` dans Frontend

**❌ Erreur CORS :**
```
Access-Control-Allow-Origin
Failed to fetch
```
**Solution :** Serveur Laravel pas démarré sur port 8000

**❌ Erreur Géolocalisation :**
```
⚠️ Géolocalisation échouée: User denied
```
**Solution :** Accepter la géolocalisation ou continuer sans

**❌ Erreur Coordonnées :**
```
❌ Coordonnées 2D invalides: [NaN, NaN]
```
**Solution :** Problème de format des données API

### **3. Tests Manuels**

**Test 1 - API directe :**
```bash
curl http://127.0.0.1:8000/api/terrains/all-for-map
```
Doit retourner `{"success": true, "data": [...13 terrains...]}`

**Test 2 - Token Mapbox :**
Vérifier dans `Frontend/.env` :
```
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
```

**Test 3 - Serveurs démarrés :**
- Backend : http://127.0.0.1:8000 ✅
- Frontend : http://127.0.0.1:5173 ✅

---

## 🚀 **SOLUTIONS RAPIDES**

### **Solution 1 - Recharger les serveurs**
```powershell
# Terminal 1: Backend
cd Backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Frontend  
cd Frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### **Solution 2 - Vider le cache navigateur**
1. **F12** → Onglet **Network**
2. Clic droit → **Clear browser cache**
3. **F5** pour recharger

### **Solution 3 - Token Mapbox**
Si erreur token, créer/vérifier `.env` dans Frontend :
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV...
```

### **Solution 4 - Désactiver géolocalisation**
Si bloqué sur géolocalisation, modifier temporairement `MapPage.tsx` ligne ~170 :
```typescript
// Commenter cette ligne pour ignorer géolocalisation
// const autoLocation = await getAutoLocation();
const autoLocation = null; // FORCER à null
```

---

## 📊 **CHECK-LIST DEBUG**

### **Côté Backend :**
- [ ] Serveur Laravel démarré sur port 8000
- [ ] API retourne 13 terrains
- [ ] Base PostgreSQL connectée
- [ ] Colonne `geom` présente

### **Côté Frontend :**
- [ ] Serveur React démarré sur port 5173
- [ ] Token Mapbox configuré dans `.env`
- [ ] Console sans erreurs JavaScript
- [ ] Géolocalisation autorisée (ou ignorée)

### **Côté Navigateur :**
- [ ] Pas de bloqueur de publicité
- [ ] JavaScript activé
- [ ] Cache vidé
- [ ] Onglet réseau montre API 200 OK

---

## 🆘 **DÉPANNAGE D'URGENCE**

**Si rien ne fonctionne :**

1. **Redémarrer TOUT :**
   ```powershell
   # Fermer tous les terminaux
   # Relancer avec le script automatique
   .\start-project.ps1
   ```

2. **Vérification ultime :**
   ```powershell
   # Test API
   curl http://127.0.0.1:8000/api/terrains/all-for-map
   
   # Test Frontend
   curl http://127.0.0.1:5173
   ```

3. **Script de diagnostic :**
   Créer un fichier `debug-map.html` simple pour tester Mapbox :
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
       <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
   </head>
   <body>
       <div id='map' style='width: 100%; height: 400px;'></div>
       <script>
           mapboxgl.accessToken = 'VOTRE_TOKEN_ICI';
           const map = new mapboxgl.Map({
               container: 'map',
               style: 'mapbox://styles/mapbox/streets-v11',
               center: [-17.4467, 14.6928],
               zoom: 10
           });
           
           // Test marqueur simple
           new mapboxgl.Marker()
               .setLngLat([-17.46907, 14.741066])
               .addTo(map);
               
           console.log('Test Mapbox: Marqueur ajouté');
       </script>
   </body>
   </html>
   ```

**⚡ CONTACT DEBUG :**
- Vérifier logs console navigateur
- Partager messages d'erreur exacts
- Confirmer quels serveurs sont démarrés 