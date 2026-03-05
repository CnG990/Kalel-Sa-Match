# ✅ Vérification Connexion Frontend-Backend

## 🗺️ Carte Interactive Client

### Backend API
**Endpoint**: `GET /api/terrains/all-for-map`

**Fonctionnalités**:
- ✅ Liste tous les terrains actifs avec coordonnées GPS
- ✅ Calcule distances depuis position utilisateur (si fournie)
- ✅ Retourne statuts réservation en temps réel
- ✅ Tri automatique par distance

**Paramètres optionnels**:
```
?user_lat=14.7167&user_lng=-17.4677
```

**Réponse**:
```json
{
  "data": [
    {
      "id": 1,
      "nom": "Terrain Municipal",
      "adresse": "Dakar Plateau",
      "latitude": 14.6928,
      "longitude": -17.4467,
      "prix_heure": 15000,
      "capacite": 22,
      "statut_reservation": "libre",
      "est_actif": true,
      "distance": 2.34  // en km si user_lat/lng fournis
    }
  ]
}
```

---

## 📱 Frontend - Carte Client

### Fichiers
- `Frontend/src/components/LeafletMap.tsx` ✅
- `Frontend/src/pages/dashboard/MapPageNew.tsx` ✅

### Fonctionnalités Carte
1. **Géolocalisation Client** ✅
   - Détecte automatiquement la position de l'utilisateur
   - Affiche marker bleu pour la position client
   - Centre la carte sur le client

2. **Affichage Terrains** ✅
   - Markers verts (libres) ou rouges (réservés)
   - Affiche distance depuis position client
   - Popup avec détails terrain

3. **Filtres** ✅
   - Tous / Libres / Réservés
   - Recherche par nom/adresse

4. **Liste Latérale** ✅
   - Terrains triés par distance
   - Clic → sélection + zoom sur carte
   - Bouton "Voir détails et réserver"

### Workflow Client
```
1. Client ouvre MapPageNew
   ↓
2. Demande géolocalisation navigateur
   ↓
3. Fetch /api/terrains/all-for-map?user_lat=X&user_lng=Y
   ↓
4. Affichage carte + liste terrains proches
   ↓
5. Client clique sur terrain
   ↓
6. Redirection vers /terrain/{id} (page créneaux)
   ↓
7. Client choisit créneau + réserve
```

---

## 🔗 Connexion Frontend ↔ Backend

### Configuration
**Frontend** (`Frontend/.env` ou hardcodé):
```env
VITE_API_URL=http://127.0.0.1:8000
```

**Backend** (CORS dans `settings.py`):
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev
    "https://kalelsamatch.duckdns.org",  # Production
]
```

### Tests Connexion

**1. Backend accessible**:
```bash
curl http://127.0.0.1:8000/api/terrains/all-for-map
```

**2. Frontend dev server**:
```bash
cd Frontend
npm run dev
# Ouvre http://localhost:5173
```

**3. Test carte**:
- Naviguer vers `/map` ou `/carte`
- Autoriser géolocalisation
- Vérifier terrains affichés
- Cliquer sur terrain → détails

---

## 📍 Admin Mobile - Ajout Terrain Sur Place

### Endpoint Backend
`POST /api/admin/terrain-mobile/create_on_site/`

**Champs obligatoires**:
```json
{
  "nom": "Terrain XYZ",
  "latitude": 14.6928,      // GPS automatique
  "longitude": -17.4467,    // GPS automatique
  "prix_heure": 15000,
  "capacite": 22
}
```

**Champs optionnels**:
```json
{
  "adresse": "Auto-détecté par reverse geocoding",
  "surface_m2": 1000,
  "gestionnaire_id": 5,
  "telephone": "77 617 32 61",
  "type_surface": "gazon_synthetique",
  "disponible_eclairage": true,
  "disponible_vestiaires": false,
  "disponible_parking": true,
  "description": "Terrain à proximité de..."
}
```

### Page Frontend
`Frontend/src/pages/admin/AjouterTerrainMobile.tsx` ✅

**Fonctionnalités**:
1. Bouton "Obtenir Ma Position GPS"
   - Utilise `navigator.geolocation`
   - Précision haute activée
   - Reverse geocoding OSM pour adresse

2. Formulaire mobile-friendly
   - Champs obligatoires marqués *
   - Valeurs par défaut (téléphone: 77 617 32 61)
   - Sélection gestionnaire depuis liste

3. Validation
   - Position GPS requise avant soumission
   - Vérification champs obligatoires
   - Toast notifications succès/erreur

### Workflow Admin Mobile
```
1. Admin sur le terrain physique
   ↓
2. Ouvre /admin/ajouter-terrain-mobile
   ↓
3. Clic "Obtenir Ma Position GPS"
   ↓
4. Navigateur détecte coordonnées exactes du terrain
   ↓
5. Adresse auto-remplie (reverse geocoding)
   ↓
6. Admin remplit: nom, prix, capacité, surface, etc.
   ↓
7. Sélectionne gestionnaire (optionnel)
   ↓
8. Submit → Terrain créé avec GPS précis
   ↓
9. Visible immédiatement sur carte clients
```

---

## 🎯 Endpoints Admin Disponibles

```
GET  /api/admin/terrain-mobile/formulaire_specs/
     → Retourne specs du formulaire

GET  /api/admin/terrain-mobile/gestionnaires_disponibles/
     → Liste gestionnaires pour assignation

POST /api/admin/terrain-mobile/create_on_site/
     → Créer terrain avec GPS mobile
```

---

## ✅ Checklist Vérification

**Backend**:
- [x] Endpoint all-for-map fonctionnel
- [x] Calcul distances GPS
- [x] Statuts réservation temps réel
- [x] CORS configuré pour frontend

**Frontend**:
- [x] LeafletMap avec 3 fonds gratuits
- [x] Géolocalisation client
- [x] Affichage terrains + distances
- [x] Filtres libres/réservés
- [x] Liste cliquable avec tri distance
- [x] Page admin mobile ajout terrain

**Workflow**:
- [x] Client voit terrains proches sur carte
- [x] Distances calculées automatiquement
- [x] Clic terrain → page créneaux
- [x] Admin peut ajouter terrain sur place avec GPS précis

---

## 🚀 Déploiement

**Production**:
1. Backend: `https://kalelsamatch.duckdns.org/api/terrains/all-for-map`
2. Frontend: Mettre à jour `VITE_API_URL` en prod
3. CORS: Ajouter domaine production

**Test final**:
```bash
# Backend
curl https://kalelsamatch.duckdns.org/api/terrains/all-for-map

# Frontend
# Ouvrir https://kalelsamatch.duckdns.org/carte
# Autoriser géolocalisation
# Vérifier terrains affichés
```

---

## 📞 Contact Support
Téléphone/WhatsApp par défaut: **77 617 32 61**
