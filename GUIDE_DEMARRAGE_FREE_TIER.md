# Guide de Démarrage : Configuration Free Tier

## 🎯 Objectif

Configurer votre application avec **100% gratuit** :
- ✅ Supabase (Free Tier)
- ✅ Firebase (Spark Plan - Gratuit)
- ✅ Laravel sur Render.com (750h gratuites/mois)

---

## 📋 Checklist de Démarrage

- [ ] Créer compte Supabase
- [ ] Créer projet Supabase
- [ ] Migrer base de données vers Supabase
- [ ] Créer compte Firebase
- [ ] Configurer Firebase Hosting
- [ ] Configurer Firebase FCM
- [ ] Créer compte Render.com
- [ ] Déployer Laravel sur Render
- [ ] Connecter Laravel à Supabase
- [ ] Tester l'ensemble

---

## Étape 1 : Configuration Supabase (Free Tier)

### 1.1 Créer un Compte Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur **"Start your project"**
3. Se connecter avec GitHub (recommandé) ou Email
4. Confirmer votre email

### 1.2 Créer un Nouveau Projet

1. Cliquer sur **"New Project"**
2. Remplir les informations :
   - **Name** : `terrains-synthetiques` (ou votre nom)
   - **Database Password** : Créer un mot de passe fort (⚠️ **SAUVEZ-LE !**)
   - **Region** : Choisir la région la plus proche (ex: `West US` pour Amérique, `Europe West` pour Europe)
   - **Pricing Plan** : **Free** (déjà sélectionné)

3. Cliquer sur **"Create new project"**
4. ⏳ Attendre 2-3 minutes (création de la base de données)

### 1.3 Récupérer les Informations de Connexion

Une fois le projet créé :

1. Aller dans **Settings** > **Database**
2. Noter les informations suivantes :
   - **Host** : `db.xxxxx.supabase.co`
   - **Database name** : `postgres`
   - **Port** : `5432`
   - **User** : `postgres`
   - **Password** : (celui que vous avez créé)

3. Aller dans **Settings** > **API**
4. Noter :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Secret !)

### 1.4 Activer PostGIS (Déjà Activé !)

PostGIS est **déjà activé** par défaut dans Supabase ! ✅

Vérification :
1. Aller dans **SQL Editor**
2. Exécuter :
```sql
SELECT PostGIS_version();
```
3. Vous devriez voir : `3.x.x`

### 1.5 Migrer votre Base de Données

#### Option A : Via pg_dump (Si vous avez PostgreSQL local)

```bash
# 1. Exporter votre base de données locale
pg_dump -h localhost -U postgres -d votre_base_de_donnees > backup.sql

# 2. Importer dans Supabase
# Via l'interface Supabase : SQL Editor > New Query > Coller le contenu
```

#### Option B : Via l'Interface Supabase (Recommandé)

1. Aller dans **SQL Editor** > **New Query**
2. Copier vos migrations Laravel (fichiers dans `Backend/database/migrations/`)
3. Adapter si nécessaire pour PostgreSQL
4. Exécuter les migrations une par une

#### Option C : Créer les Tables Manuellement

Si vous partez de zéro, créer les tables via SQL Editor.

---

## Étape 2 : Configuration Firebase (Free Tier)

### 2.1 Créer un Compte Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquer sur **"Add project"** ou **"Create a project"**
3. Remplir :
   - **Project name** : `terrains-synthetiques` (ou votre nom)
   - **Google Analytics** : Activer (recommandé, gratuit)
   - Cliquer sur **"Create project"**
4. ⏳ Attendre la création (30 secondes)

### 2.2 Configurer Firebase Hosting

1. Dans Firebase Console, aller dans **Hosting**
2. Cliquer sur **"Get started"**
3. Installer Firebase CLI :
```bash
npm install -g firebase-tools
```

4. Se connecter :
```bash
firebase login
```

5. Initialiser Firebase dans votre projet Frontend :
```bash
cd Frontend
firebase init hosting
```

6. Répondre aux questions :
   - **What do you want to use as your public directory?** : `dist`
   - **Configure as a single-page app?** : `Yes`
   - **Set up automatic builds?** : `No` (pour l'instant)

7. Créer `firebase.json` (déjà créé par l'init) :
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

8. Build et déployer :
```bash
npm run build
firebase deploy --only hosting
```

9. Votre site sera disponible sur : `https://votre-projet.firebaseapp.com`

### 2.3 Configurer Firebase Cloud Messaging (FCM)

1. Dans Firebase Console, aller dans **Project Settings** (⚙️)
2. Aller dans l'onglet **Cloud Messaging**
3. Noter le **Server key** (pour Laravel)
4. Pour Flutter, vous devrez ajouter les apps Android/iOS plus tard

---

## Étape 3 : Configuration Render.com (Free Tier)

### 3.1 Créer un Compte Render

1. Aller sur [render.com](https://render.com)
2. Cliquer sur **"Get Started for Free"**
3. Se connecter avec GitHub (recommandé)
4. Autoriser Render à accéder à vos repos

### 3.2 Préparer Laravel pour Render

1. Créer un fichier `render.yaml` à la racine du projet :
```yaml
services:
  - type: web
    name: terrains-api
    env: php
    buildCommand: cd Backend && composer install --no-dev --optimize-autoloader
    startCommand: cd Backend && php artisan serve --host=0.0.0.0 --port=$PORT
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: false
      - key: LOG_CHANNEL
        value: stderr
```

2. Vérifier que `Backend/Dockerfile` existe (déjà présent dans votre projet)

### 3.3 Déployer Laravel sur Render

1. Dans Render Dashboard, cliquer sur **"New +"** > **"Web Service"**
2. Connecter votre repository GitHub
3. Sélectionner le repo `Terrains-Synthetiques`
4. Configuration :
   - **Name** : `terrains-api`
   - **Environment** : `PHP`
   - **Root Directory** : `Backend`
   - **Build Command** : `composer install --no-dev --optimize-autoloader`
   - **Start Command** : `php artisan serve --host=0.0.0.0 --port=$PORT`

5. **Environment Variables** (cliquer sur **"Advanced"** > **"Add Environment Variable"**) :
   ```
   APP_NAME=Terrains Synthetiques
   APP_ENV=production
   APP_KEY=base64:... (générer avec: php artisan key:generate --show)
   APP_DEBUG=false
   APP_URL=https://votre-api.onrender.com
   
   DB_CONNECTION=pgsql
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres
   DB_PASSWORD=votre_mot_de_passe_supabase
   
   CACHE_DRIVER=file
   SESSION_DRIVER=file
   QUEUE_CONNECTION=sync
   ```

6. Cliquer sur **"Create Web Service"**
7. ⏳ Attendre le déploiement (5-10 minutes)

### 3.4 Configurer la Base de Données

Une fois déployé :

1. Dans Render, aller dans votre service
2. Aller dans **"Shell"** (terminal)
3. Exécuter les migrations :
```bash
php artisan migrate --force
```

4. (Optionnel) Exécuter les seeders :
```bash
php artisan db:seed --force
```

---

## Étape 4 : Connecter Laravel à Supabase

### 4.1 Modifier le fichier .env

Dans votre projet local `Backend/.env` :

```env
DB_CONNECTION=pgsql
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe_supabase

# Utiliser le pooler pour les connexions serverless (optionnel mais recommandé)
# DB_POOLER_HOST=db.xxxxx.supabase.co
# DB_POOLER_PORT=6543
```

### 4.2 Tester la Connexion

```bash
cd Backend
php artisan migrate:status
```

Si ça fonctionne, vous verrez la liste des migrations.

---

## Étape 5 : Configurer le Frontend React

### 5.1 Créer un fichier .env dans Frontend

```env
VITE_API_URL=https://votre-api.onrender.com/api
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 Mettre à jour les appels API

Vérifier que votre frontend utilise `import.meta.env.VITE_API_URL` pour les appels API.

### 5.3 Build et Déployer sur Firebase

```bash
cd Frontend
npm install
npm run build
firebase deploy --only hosting
```

---

## Étape 6 : Configurer les Apps Flutter (Optionnel pour l'instant)

Les apps Flutter peuvent attendre. Pour l'instant, concentrez-vous sur le web.

Quand vous serez prêt :
1. Ajouter les apps Android/iOS dans Firebase Console
2. Télécharger `google-services.json` et `GoogleService-Info.plist`
3. Configurer FCM dans Flutter (voir `ARCHITECTURE_MOBILE_FLUTTER.md`)

---

## Étape 7 : Tester l'Ensemble

### 7.1 Tester l'API Laravel

```bash
curl https://votre-api.onrender.com/api/status
```

Devrait retourner :
```json
{
  "status": "OK",
  "message": "API fonctionne correctement"
}
```

### 7.2 Tester Supabase

Dans Supabase SQL Editor :
```sql
SELECT COUNT(*) FROM users;
```

### 7.3 Tester le Frontend

Aller sur `https://votre-projet.firebaseapp.com`

---

## ⚠️ Limitations du Free Tier

### Supabase Free Tier

- ⚠️ **Pause automatique** : Après 1 semaine d'inactivité, le projet se met en pause
- ⚠️ **500 MB max** : Base de données limitée à 500 MB
- ⚠️ **Pas de sauvegardes** : Pas de sauvegardes automatiques
- ✅ **Solution** : Se connecter régulièrement pour éviter la pause

### Firebase Free Tier

- ⚠️ **10 GB hosting/mois** : Limite de bande passante
- ⚠️ **5 GB storage** : Limite de stockage
- ✅ **FCM illimité** : Notifications push toujours gratuites

### Render Free Tier

- ⚠️ **750 heures/mois** : ≈ 1 mois continu (31 jours × 24h = 744h)
- ⚠️ **Spin down** : Le service se met en pause après 15 minutes d'inactivité
- ⚠️ **Cold start** : Premier démarrage peut prendre 30-60 secondes
- ✅ **Solution** : Utiliser un service de ping pour garder actif (UptimeRobot gratuit)

---

## 🛠️ Outils Utiles (Gratuits)

### Garder Render Actif

1. Créer un compte sur [UptimeRobot](https://uptimerobot.com) (gratuit)
2. Ajouter un monitor HTTP
3. URL : `https://votre-api.onrender.com/api/status`
4. Intervalle : 5 minutes
5. Cela gardera votre service actif

### Monitoring

- **Supabase Dashboard** : Monitoring intégré
- **Firebase Console** : Analytics intégré
- **Render Dashboard** : Logs et métriques

---

## 📝 Checklist Finale

- [ ] Supabase projet créé
- [ ] Base de données migrée
- [ ] Firebase projet créé
- [ ] Frontend déployé sur Firebase Hosting
- [ ] Laravel déployé sur Render
- [ ] Laravel connecté à Supabase
- [ ] API testée et fonctionnelle
- [ ] Frontend testé et fonctionnel
- [ ] UptimeRobot configuré (pour garder Render actif)

---

## 🎉 Félicitations !

Vous avez maintenant une architecture **100% gratuite** :
- ✅ Supabase : Base de données + PostGIS
- ✅ Firebase : Hosting + FCM
- ✅ Render : Backend Laravel

**Coût total** : **$0/mois** 🎉

---

## 🆘 Problèmes Courants

### Render se met en pause

**Solution** : Configurer UptimeRobot pour ping toutes les 5 minutes

### Supabase se met en pause

**Solution** : Se connecter au dashboard Supabase régulièrement (au moins 1 fois par semaine)

### Erreur de connexion à Supabase

**Vérifier** :
- Les credentials dans `.env`
- Les IPs autorisées dans Supabase Settings > Database
- Utiliser le pooler (port 6543) pour Render

### Frontend ne se connecte pas à l'API

**Vérifier** :
- L'URL de l'API dans `.env`
- CORS configuré dans Laravel
- Le service Render est actif

---

## 📚 Prochaines Étapes

Une fois tout configuré :
1. ✅ Tester toutes les fonctionnalités
2. ✅ Configurer les apps Flutter (optionnel)
3. ✅ Ajouter Firebase Analytics
4. ✅ Configurer les notifications push
5. ✅ Monitorer les limites du free tier

**Vous êtes prêt à démarrer ! 🚀**

