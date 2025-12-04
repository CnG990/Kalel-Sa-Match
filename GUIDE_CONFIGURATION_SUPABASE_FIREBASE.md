# Guide Pratique : Configuration Supabase + Firebase

## 🚀 Démarrage Rapide

### Étape 1 : Créer le Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Noter les informations de connexion :
   - URL du projet : `https://xxxxx.supabase.co`
   - Anon Key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Étape 2 : Activer PostGIS dans Supabase

PostGIS est **déjà activé par défaut** dans Supabase ! ✅

Vérification :
```sql
-- Dans l'éditeur SQL de Supabase
SELECT PostGIS_version();
-- Devrait retourner : 3.x.x
```

### Étape 3 : Migrer votre Base de Données

#### Option A : Via pg_dump (Recommandé)

```bash
# 1. Exporter depuis votre base PostgreSQL actuelle
pg_dump -h localhost -U postgres -d terrains_db > terrains_backup.sql

# 2. Importer dans Supabase
# Via l'interface Supabase : SQL Editor > New Query > Coller le contenu
# OU via psql :
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f terrains_backup.sql
```

#### Option B : Via l'Interface Supabase

1. Aller dans **Database** > **Migrations**
2. Créer une nouvelle migration
3. Copier vos migrations Laravel (fichiers dans `Backend/database/migrations/`)
4. Adapter pour Supabase si nécessaire

### Étape 4 : Configurer Laravel pour Supabase

Modifier `Backend/.env` :

```env
DB_CONNECTION=pgsql
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe_supabase

# Optionnel : Pooler de connexion (recommandé)
DB_POOLER_HOST=db.xxxxx.supabase.co
DB_POOLER_PORT=6543
```

**Important** : Utiliser le **Pooler** (port 6543) pour les connexions serverless !

### Étape 5 : Configurer Firebase Hosting

1. Installer Firebase CLI :
```bash
npm install -g firebase-tools
```

2. Initialiser Firebase dans le projet :
```bash
cd Frontend
firebase login
firebase init hosting
```

3. Configuration `firebase.json` :
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
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

4. Build et déployer :
```bash
npm run build
firebase deploy --only hosting
```

### Étape 6 : Connecter React à Supabase

1. Installer le client Supabase :
```bash
cd Frontend
npm install @supabase/supabase-js
```

2. Créer un fichier de configuration :
```typescript
// Frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

3. Créer un fichier `.env` dans Frontend :
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Exemple d'utilisation :
```typescript
// Frontend/src/services/terrains.ts
import { supabase } from '@/lib/supabase'

export async function getTerrains() {
  const { data, error } = await supabase
    .from('terrains_synthetiques_dakar')
    .select(`
      id,
      nom,
      surface,
      latitude,
      longitude,
      est_actif
    `)
    .eq('est_actif', true)
    .order('nom')
  
  if (error) {
    console.error('Error fetching terrains:', error)
    throw error
  }
  
  return data
}

// Requête avec PostGIS
export async function getTerrainsWithGeometry() {
  const { data, error } = await supabase.rpc('get_terrains_with_surface', {
    // Fonction PostgreSQL personnalisée
  })
  
  return { data, error }
}
```

### Étape 7 : Créer des Fonctions PostgreSQL dans Supabase

Pour les requêtes PostGIS complexes, créer des fonctions :

```sql
-- Dans Supabase SQL Editor
CREATE OR REPLACE FUNCTION get_terrains_with_surface()
RETURNS TABLE (
  id bigint,
  nom text,
  surface numeric,
  surface_calculee numeric,
  has_geometry boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.nom,
    t.surface,
    CASE 
      WHEN t.geom_polygon IS NOT NULL 
      THEN ROUND(ST_Area(ST_Transform(t.geom_polygon, 32628))::numeric, 2)
      ELSE NULL
    END as surface_calculee,
    (t.geom_polygon IS NOT NULL) as has_geometry
  FROM terrains_synthetiques_dakar t
  WHERE t.est_actif = true;
END;
$$ LANGUAGE plpgsql;
```

Appeler depuis le frontend :
```typescript
const { data, error } = await supabase.rpc('get_terrains_with_surface')
```

### Étape 8 : Configurer l'Authentification

#### Option A : Supabase Auth (Recommandé)

```typescript
// Frontend/src/services/auth.ts
import { supabase } from '@/lib/supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Écouter les changements d'authentification
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session)
})
```

#### Option B : Garder Laravel Sanctum

Si vous gardez Laravel, l'auth reste identique. Juste changer la connexion DB.

### Étape 9 : Configurer le Storage Supabase

```typescript
// Upload d'image de terrain
export async function uploadTerrainImage(
  terrainId: number,
  file: File
) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${terrainId}-${Date.now()}.${fileExt}`
  const filePath = `terrains/${fileName}`

  const { data, error } = await supabase.storage
    .from('terrain-images')
    .upload(filePath, file)

  if (error) throw error

  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('terrain-images')
    .getPublicUrl(filePath)

  return { publicUrl }
}
```

Créer le bucket dans Supabase :
1. Aller dans **Storage** > **New bucket**
2. Nom : `terrain-images`
3. Public : `true` (pour images publiques)

### Étape 10 : Configurer Firebase Cloud Messaging

1. Installer Firebase SDK :
```bash
npm install firebase
```

2. Configuration :
```typescript
// Frontend/src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

// Obtenir le token FCM
export async function getFCMToken() {
  const token = await getToken(messaging, {
    vapidKey: 'your-vapid-key'
  })
  return token
}
```

### Étape 11 : Déployer le Backend Laravel (Optionnel)

Si vous gardez Laravel, déployer sur :

#### Option A : Render.com

1. Créer un compte Render
2. Créer un nouveau **Web Service**
3. Connecter votre repo GitHub
4. Configuration :
   - Build Command : `cd Backend && composer install --no-dev --optimize-autoloader`
   - Start Command : `cd Backend && php artisan serve --host=0.0.0.0 --port=$PORT`
   - Environment Variables : Ajouter vos variables `.env`

#### Option B : Google Cloud Run

1. Créer un Dockerfile (déjà présent dans votre projet)
2. Build l'image :
```bash
cd Backend
gcloud builds submit --tag gcr.io/your-project/laravel-api
```

3. Déployer :
```bash
gcloud run deploy laravel-api \
  --image gcr.io/your-project/laravel-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔒 Sécurité : Row Level Security (RLS)

Supabase permet de sécuriser les données au niveau de la base :

```sql
-- Exemple : Seuls les admins peuvent modifier les terrains
CREATE POLICY "Admins can update terrains"
ON terrains_synthetiques_dakar
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
```

---

## 📊 Monitoring et Analytics

### Supabase Dashboard
- Métriques en temps réel
- Logs des requêtes
- Performance de la base de données

### Firebase Analytics
- Tracking des événements utilisateur
- Funnels de conversion
- Cohorts d'utilisateurs

---

## 🧪 Tests

### Tester la Connexion Supabase

```typescript
// test-supabase.ts
import { supabase } from './lib/supabase'

async function testConnection() {
  // Test connexion
  const { data, error } = await supabase
    .from('terrains_synthetiques_dakar')
    .select('count')
    .limit(1)
  
  console.log('Connection test:', error ? 'FAILED' : 'SUCCESS')
  
  // Test PostGIS
  const { data: postgisTest } = await supabase.rpc('test_postgis')
  console.log('PostGIS test:', postgisTest)
}

testConnection()
```

---

## 🚨 Problèmes Courants

### 1. Erreur de connexion PostgreSQL

**Problème** : `Connection refused` ou `Timeout`

**Solution** :
- Vérifier que vous utilisez le **Pooler** (port 6543) pour les connexions serverless
- Vérifier les IPs autorisées dans Supabase Settings > Database

### 2. PostGIS non disponible

**Problème** : `function ST_Area does not exist`

**Solution** :
```sql
-- Activer PostGIS (normalement déjà fait)
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. CORS Errors

**Problème** : Erreurs CORS depuis le frontend

**Solution** :
- Vérifier les URLs autorisées dans Supabase Settings > API
- Ajouter votre domaine Firebase Hosting

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [PostGIS dans Supabase](https://supabase.com/docs/guides/database/extensions/postgis)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Supabase + React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

## ✅ Checklist de Déploiement

- [ ] Projet Supabase créé
- [ ] PostGIS vérifié
- [ ] Base de données migrée
- [ ] Laravel connecté à Supabase (si gardé)
- [ ] Frontend configuré avec Supabase client
- [ ] Firebase Hosting configuré
- [ ] Frontend déployé sur Firebase
- [ ] Authentification testée
- [ ] Storage configuré
- [ ] FCM configuré
- [ ] Tests end-to-end passés
- [ ] Monitoring configuré

---

**Vous êtes prêt à déployer ! 🚀**

