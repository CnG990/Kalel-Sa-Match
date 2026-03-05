# 🚀 GUIDE DÉPLOIEMENT FRONTEND - KALEL SA MATCH

**Date**: 5 Mars 2026  
**Version**: 2.0.0  
**Stack**: React + TypeScript + Vite + Tailwind CSS

---

## 📋 **PRÉ-REQUIS**

### **Environnement Local**
- ✅ Node.js 18+ installé
- ✅ npm ou yarn
- ✅ Git configuré
- ✅ Éditeur de code (VS Code recommandé)

### **Comptes Nécessaires**
- ✅ Compte GitHub (code déjà pushé)
- ⏳ Compte Vercel OU Netlify (déploiement)
- ⏳ Compte Cloudflare (optionnel, CDN)

---

## 🔧 **PRÉPARATION DÉPLOIEMENT**

### **Étape 1 : Appliquer corrections critiques**

Avant de déployer, appliquer les corrections dans `CORRECTIONS_MANUELLES.md` :

1. **LitigeDetailsPage.tsx** - Corriger 5 endpoints
2. **admin/DisputesPage.tsx** - Corriger endpoint
3. **Vérifier types** - Tous à jour

### **Étape 2 : Configuration environnement**

**Créer fichier** : `Frontend/.env.production`

```bash
# API Backend
VITE_API_BASE_URL=https://kalelsamatch.duckdns.org/api

# Wave Payment
VITE_WAVE_BUSINESS_LINK=https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/

# App Config
VITE_APP_NAME=Kalel Sa Match
VITE_APP_VERSION=2.0.0

# Features Flags
VITE_ENABLE_NOTIFICATIONS=false
VITE_ENABLE_WEBSOCKET=false
```

**Créer fichier** : `Frontend/.env.development`

```bash
# API Backend Local (si nécessaire)
VITE_API_BASE_URL=http://localhost:8000/api

# Ou pointer vers EC2 en dev
# VITE_API_BASE_URL=https://kalelsamatch.duckdns.org/api

VITE_WAVE_BUSINESS_LINK=https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/
VITE_APP_NAME=Kalel Sa Match (Dev)
```

### **Étape 3 : Vérifier apiService**

**Fichier** : `Frontend/src/services/api.ts`

Vérifier que le baseURL utilise la variable d'environnement :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});
```

---

## 🏗️ **BUILD PRODUCTION**

### **Commandes de build**

```bash
# Naviguer vers frontend
cd C:\laragon\www\Terrains-Synthetiques\Frontend

# Installer dépendances (si nécessaire)
npm install

# Build production
npm run build

# Vérifier le build
npm run preview
```

### **Vérifications Build**

✅ **Aucune erreur TypeScript**
```bash
# Devrait afficher : "built in XXXms"
# Pas de lignes rouges "error TS..."
```

✅ **Taille bundle raisonnable**
```bash
# dist/assets/*.js - < 500KB gzipped
# dist/assets/*.css - < 50KB gzipped
```

✅ **Fichiers générés**
```
Frontend/dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   ├── index-[hash].css
  │   └── [autres assets]
  └── [images, fonts, etc.]
```

---

## 🌐 **DÉPLOIEMENT VERCEL** (Recommandé)

### **Étape 1 : Installation Vercel CLI**

```bash
npm install -g vercel
```

### **Étape 2 : Login Vercel**

```bash
vercel login
# Suivre instructions pour se connecter
```

### **Étape 3 : Configuration projet**

**Créer** : `Frontend/vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://kalelsamatch.duckdns.org/api"
  }
}
```

### **Étape 4 : Premier déploiement**

```bash
cd Frontend

# Déploiement
vercel

# Suivre les prompts :
# ? Set up and deploy? Yes
# ? Which scope? [Votre compte]
# ? Link to existing project? No
# ? What's your project's name? kalel-sa-match
# ? In which directory is your code located? ./
```

### **Étape 5 : Production**

```bash
# Déployer en production
vercel --prod

# URL de production sera affichée
# Ex: https://kalel-sa-match.vercel.app
```

### **Étape 6 : Configuration domaine** (Optionnel)

```bash
# Ajouter domaine personnalisé
vercel domains add kalelsamatch.com

# Configurer DNS
# A record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

---

## 🌍 **DÉPLOIEMENT NETLIFY** (Alternative)

### **Étape 1 : Installation Netlify CLI**

```bash
npm install -g netlify-cli
```

### **Étape 2 : Login**

```bash
netlify login
```

### **Étape 3 : Configuration**

**Créer** : `Frontend/netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_API_BASE_URL = "https://kalelsamatch.duckdns.org/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### **Étape 4 : Déploiement**

```bash
cd Frontend

# Premier déploiement
netlify init

# Build et deploy
netlify deploy --prod
```

---

## 🔒 **CONFIGURATION BACKEND CORS**

**Important** : Autoriser le domaine frontend dans Django

**Fichier** : `python-backend/ksm_backend/settings/production.py`

```python
CORS_ALLOWED_ORIGINS = [
    'https://kalelsamatch.duckdns.org',
    'https://kalel-sa-match.vercel.app',  # Ajouter URL Vercel
    'https://www.kalelsamatch.com',       # Si domaine personnalisé
]

# Ou pour dev/test
CORS_ALLOW_ALL_ORIGINS = False  # Garder False en production
```

**Redémarrer Gunicorn après modification** :

```bash
# Sur EC2
sudo systemctl restart ksm_gunicorn.service
```

---

## ✅ **VÉRIFICATIONS POST-DÉPLOIEMENT**

### **1. Fonctionnalités de base**

- [ ] Page d'accueil charge correctement
- [ ] Connexion/Inscription fonctionnent
- [ ] Dashboard client accessible
- [ ] Liste terrains affichée
- [ ] Création réservation fonctionne
- [ ] Paiement Wave redirige correctement

### **2. API Backend**

- [ ] Appels API réussissent (pas d'erreurs CORS)
- [ ] Authentification JWT fonctionne
- [ ] Création réservation avec acompte OK
- [ ] Litiges accessibles

### **3. Performance**

- [ ] Page charge en < 3 secondes
- [ ] Images optimisées (WebP)
- [ ] Pas de lag navigation
- [ ] Mobile responsive

### **4. Erreurs**

```bash
# Ouvrir DevTools Console
# Vérifier :
- Pas d'erreurs réseau (rouge)
- Pas d'erreurs CORS
- Pas d'erreurs 404 assets
- JWT token refresh fonctionne
```

---

## 🐛 **TROUBLESHOOTING**

### **Erreur CORS**

```
Access to fetch at 'https://kalelsamatch.duckdns.org/api/...' 
from origin 'https://kalel-sa-match.vercel.app' has been blocked by CORS
```

**Solution** : Ajouter domaine dans `CORS_ALLOWED_ORIGINS` backend

---

### **Erreur 404 sur routes**

```
Page not found when refreshing /dashboard
```

**Solution Vercel** : Déjà configuré dans `vercel.json`
**Solution Netlify** : Déjà configuré dans `netlify.toml`

---

### **Variables d'environnement non chargées**

```
VITE_API_BASE_URL is undefined
```

**Solution** :
1. Vérifier `.env.production` existe
2. Variables commencent par `VITE_`
3. Rebuild : `npm run build`
4. Redeploy

---

### **Build trop gros**

```
Warning: Bundle size exceeds recommended limit
```

**Solution** :
1. Analyser bundle : `npm run build -- --analyze`
2. Code splitting : Dynamic imports
3. Lazy loading routes

```typescript
// Lazy load pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
```

---

## 🚀 **WORKFLOW DÉPLOIEMENT CONTINU**

### **Option 1 : Auto-deploy GitHub** (Recommandé)

**Vercel** :
1. Connecter repo GitHub sur Vercel dashboard
2. Activer auto-deploy
3. Chaque push sur `main` → deploy auto

**Netlify** :
1. Connecter repo GitHub sur Netlify dashboard
2. Activer continuous deployment
3. Chaque push → build + deploy auto

### **Option 2 : GitHub Actions**

**Créer** : `.github/workflows/deploy.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths:
      - 'Frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./Frontend
        run: npm ci
      
      - name: Build
        working-directory: ./Frontend
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Deploy to Vercel
        working-directory: ./Frontend
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 📊 **MONITORING PRODUCTION**

### **Analytics** (Optionnel)

```bash
npm install --save-dev @vercel/analytics
```

```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react';

<React.StrictMode>
  <App />
  <Analytics />
</React.StrictMode>
```

### **Error Tracking** (Recommandé)

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

---

## 🎯 **CHECKLIST FINALE DÉPLOIEMENT**

### **Avant Déploiement**
- [ ] Corrections manuelles appliquées
- [ ] Build local réussit sans erreurs
- [ ] Tests locaux passent
- [ ] Variables environnement configurées
- [ ] .env.production créé

### **Déploiement**
- [ ] Code pushé sur GitHub
- [ ] Vercel/Netlify configuré
- [ ] Premier deploy réussi
- [ ] URL production accessible

### **Configuration Backend**
- [ ] CORS_ALLOWED_ORIGINS mis à jour
- [ ] Gunicorn redémarré
- [ ] Test API depuis frontend OK

### **Tests Production**
- [ ] Navigation complète fonctionne
- [ ] Authentification OK
- [ ] Création réservation OK
- [ ] Paiements redirigent correctement
- [ ] Pas d'erreurs console
- [ ] Mobile responsive

### **Optimisations**
- [ ] Images compressées
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 80
- [ ] SEO meta tags ajoutés

---

## 📝 **URLS FINALES**

```
Frontend Production: https://kalel-sa-match.vercel.app
Backend API:         https://kalelsamatch.duckdns.org/api
Admin Django:        https://kalelsamatch.duckdns.org/admin
```

---

## 🎉 **FÉLICITATIONS !**

Votre application est maintenant déployée en production ! 

**Prochaines étapes** :
1. Tester tous les flux utilisateurs
2. Monitorer erreurs et performances
3. Collecter feedback utilisateurs
4. Itérer et améliorer

---

**Support** : Pour toute question, consulter :
- `SYNTHESE_AUDIT_COMPLET.md` - État général
- `CORRECTIONS_MANUELLES.md` - Corrections critiques
- `AUDIT_COMMUNICATIONS.md` - Système communications
