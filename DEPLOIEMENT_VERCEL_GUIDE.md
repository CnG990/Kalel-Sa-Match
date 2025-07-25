# 🚀 Guide de Déploiement Vercel + Backend

## 📋 **Stratégie de Déploiement**

### **Architecture Recommandée**
- **Frontend (React)** : Vercel (gratuit, rapide, CDN global)
- **Backend (Laravel)** : Railway, Render, ou DigitalOcean (hébergement PHP)
- **Base de données** : PostgreSQL sur le même serveur que le backend

### **Pourquoi cette approche ?**
- ✅ **Vercel** : Optimisé pour React, déploiement automatique, CDN global
- ✅ **Backend séparé** : Meilleure performance, scalabilité, sécurité
- ✅ **Coût optimisé** : Vercel gratuit, backend économique

---

## 🎯 **Étape 1 : Préparation du Frontend pour Vercel**

### **1.1 Configuration de l'API URL**

Modifiez le fichier `Frontend/src/services/api.ts` pour pointer vers votre backend :

```typescript
// Remplacez l'URL locale par votre backend en production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://votre-backend.railway.app'  // URL de votre backend
  : 'http://127.0.0.1:8000';            // URL locale
```

### **1.2 Configuration des Variables d'Environnement**

Créez un fichier `.env.local` dans le dossier `Frontend` :

```env
# Frontend/.env.local
VITE_API_BASE_URL=https://votre-backend.railway.app
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiY2hlaWtobmdvbTk5IiwiYSI6ImNtYjR5c2NieTF2eXYyaXNia3FmdWd5OTYifQ.yi91
```

### **1.3 Configuration Vercel**

Créez un fichier `vercel.json` dans le dossier `Frontend` :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://votre-backend.railway.app/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🎯 **Étape 2 : Déploiement du Backend**

### **Option A : Railway (Recommandé)**

#### **2.1 Créer un compte Railway**
1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub

#### **2.2 Déployer le Backend**
1. Cliquez sur "New Project"
2. Sélectionnez "Deploy from GitHub repo"
3. Choisissez votre repo `CnG990/Kalel-Sa-Match`
4. Sélectionnez le dossier `Backend`
5. Cliquez sur "Deploy"

#### **2.3 Configuration de la Base de Données**
1. Dans votre projet Railway, cliquez sur "New"
2. Sélectionnez "Database" → "PostgreSQL"
3. Notez les variables de connexion

#### **2.4 Configuration des Variables d'Environnement**
Dans Railway, allez dans "Variables" et ajoutez :

```env
APP_NAME="Kalel Sa Match"
APP_ENV=production
APP_KEY=base64:votre-clé-générée
APP_DEBUG=false
APP_URL=https://votre-backend.railway.app

DB_CONNECTION=pgsql
DB_HOST=votre-host-railway
DB_PORT=5432
DB_DATABASE=votre-database
DB_USERNAME=votre-username
DB_PASSWORD=votre-password

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@kalelsamatch.com"
MAIL_FROM_NAME="${APP_NAME}"
```

#### **2.5 Migration de la Base de Données**
1. Dans Railway, allez dans "Deployments"
2. Cliquez sur votre déploiement
3. Ouvrez le terminal et exécutez :
```bash
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Option B : Render (Alternative)**

#### **2.1 Créer un compte Render**
1. Allez sur [render.com](https://render.com)
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub

#### **2.2 Déployer le Backend**
1. Cliquez sur "New" → "Web Service"
2. Connectez votre repo GitHub
3. Configurez :
   - **Name** : kalel-sa-match-backend
   - **Root Directory** : Backend
   - **Runtime** : PHP
   - **Build Command** : `composer install --no-dev --optimize-autoloader`
   - **Start Command** : `php artisan serve --host 0.0.0.0 --port $PORT`

---

## 🎯 **Étape 3 : Déploiement Frontend sur Vercel**

### **3.1 Créer un compte Vercel**
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub

### **3.2 Importer le Projet**
1. Cliquez sur "New Project"
2. Sélectionnez votre repo `CnG990/Kalel-Sa-Match`
3. Configurez :
   - **Framework Preset** : Vite
   - **Root Directory** : Frontend
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

### **3.3 Configuration des Variables d'Environnement**
Dans Vercel, allez dans "Settings" → "Environment Variables" :

```env
VITE_API_BASE_URL=https://votre-backend.railway.app
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiY2hlaWtobmdvbTk5IiwiYSI6ImNtYjR5c2NieTF2eXYyaXNia3FmdWd5OTYifQ.yi91
```

### **3.4 Déploiement**
1. Cliquez sur "Deploy"
2. Attendez la fin du déploiement
3. Votre site sera disponible sur `https://votre-projet.vercel.app`

---

## 🎯 **Étape 4 : Configuration CORS**

### **4.1 Configuration Laravel CORS**

Dans votre backend, modifiez `config/cors.php` :

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://votre-projet.vercel.app',
        'http://localhost:5173'
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### **4.2 Installation du Package CORS**
Dans votre backend Railway/Render, exécutez :
```bash
composer require fruitcake/laravel-cors
```

---

## 🎯 **Étape 5 : Tests et Validation**

### **5.1 Tests de l'API**
```bash
# Test de l'API backend
curl https://votre-backend.railway.app/api/status

# Test de l'API via Vercel
curl https://votre-projet.vercel.app/api/status
```

### **5.2 Tests Frontend**
1. Ouvrez votre site Vercel
2. Testez la connexion
3. Testez les réservations
4. Testez les litiges

### **5.3 Vérification des Logs**
- **Vercel** : Dashboard → Functions → Logs
- **Railway** : Dashboard → Deployments → Logs
- **Render** : Dashboard → Services → Logs

---

## 🎯 **Étape 6 : Configuration du Domaine Personnalisé**

### **6.1 Ajouter un Domaine sur Vercel**
1. Dans Vercel, allez dans "Settings" → "Domains"
2. Ajoutez votre domaine (ex: `kalelsamatch.com`)
3. Configurez les DNS selon les instructions

### **6.2 Configuration SSL**
- **Vercel** : SSL automatique
- **Railway/Render** : SSL automatique

---

## 📋 **Checklist de Déploiement**

### **✅ Backend**
- [ ] Compte Railway/Render créé
- [ ] Backend déployé
- [ ] Base de données configurée
- [ ] Variables d'environnement définies
- [ ] Migrations exécutées
- [ ] CORS configuré
- [ ] API testée

### **✅ Frontend**
- [ ] Compte Vercel créé
- [ ] Frontend déployé
- [ ] Variables d'environnement configurées
- [ ] API URL mise à jour
- [ ] Site testé

### **✅ Intégration**
- [ ] CORS fonctionnel
- [ ] Authentification testée
- [ ] Réservations testées
- [ ] Litiges testés
- [ ] Domaine configuré

---

## 🎯 **URLs Finales**

### **Production**
- **Frontend** : `https://votre-projet.vercel.app`
- **Backend** : `https://votre-backend.railway.app`
- **API** : `https://votre-backend.railway.app/api`

### **Développement**
- **Frontend** : `http://localhost:5173`
- **Backend** : `http://127.0.0.1:8000`
- **API** : `http://127.0.0.1:8000/api`

---

## 🚀 **Avantages de cette Architecture**

### **✅ Performance**
- Frontend sur CDN global (Vercel)
- Backend optimisé pour PHP (Railway/Render)
- Séparation des responsabilités

### **✅ Scalabilité**
- Frontend et backend indépendants
- Possibilité de scaler séparément
- Cache CDN automatique

### **✅ Coût**
- Vercel gratuit pour le frontend
- Railway/Render économique pour le backend
- Pas de serveur à maintenir

### **✅ Sécurité**
- CORS configuré
- Headers de sécurité
- SSL automatique

---

## 🎉 **Félicitations !**

Votre application **Kalél Sa Match** est maintenant :

- ✅ **Frontend déployé sur Vercel**
- ✅ **Backend déployé sur Railway/Render**
- ✅ **Base de données configurée**
- ✅ **API fonctionnelle**
- ✅ **Prête pour la production**

**🚀 Votre application est maintenant en ligne et accessible partout dans le monde !** 