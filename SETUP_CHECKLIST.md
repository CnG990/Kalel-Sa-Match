# ✅ Checklist de Configuration Free Tier

## 📋 Étape par Étape

### Phase 1 : Supabase (15 minutes)

- [ ] **1.1** Créer compte sur [supabase.com](https://supabase.com)
- [ ] **1.2** Créer nouveau projet "terrains-synthetiques"
- [ ] **1.3** Noter les credentials :
  - [ ] Host: `db.xxxxx.supabase.co`
  - [ ] Database: `postgres`
  - [ ] Port: `5432`
  - [ ] Username: `postgres`
  - [ ] Password: (celui créé)
  - [ ] Project URL: `https://xxxxx.supabase.co`
  - [ ] Anon Key: `eyJ...`
- [ ] **1.4** Vérifier PostGIS : `SELECT PostGIS_version();`
- [ ] **1.5** Migrer la base de données (via SQL Editor ou pg_dump)

**Temps estimé** : 15-30 minutes

---

### Phase 2 : Firebase (10 minutes)

- [ ] **2.1** Créer compte sur [console.firebase.google.com](https://console.firebase.google.com)
- [ ] **2.2** Créer projet "terrains-synthetiques"
- [ ] **2.3** Activer Google Analytics (optionnel, gratuit)
- [ ] **2.4** Installer Firebase CLI : `npm install -g firebase-tools`
- [ ] **2.5** Se connecter : `firebase login`
- [ ] **2.6** Initialiser dans Frontend : `cd Frontend && firebase init hosting`
- [ ] **2.7** Noter le Server Key (Cloud Messaging > Settings)

**Temps estimé** : 10-15 minutes

---

### Phase 3 : Render.com (20 minutes)

- [ ] **3.1** Créer compte sur [render.com](https://render.com) (avec GitHub)
- [ ] **3.2** Connecter repository GitHub
- [ ] **3.3** Créer nouveau Web Service
- [ ] **3.4** Configuration :
  - [ ] Name: `terrains-api`
  - [ ] Environment: `PHP`
  - [ ] Root Directory: `Backend`
  - [ ] Build Command: `composer install --no-dev --optimize-autoloader`
  - [ ] Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] **3.5** Ajouter Environment Variables :
  - [ ] `APP_NAME=Terrains Synthetiques`
  - [ ] `APP_ENV=production`
  - [ ] `APP_KEY=` (générer avec `php artisan key:generate --show`)
  - [ ] `APP_DEBUG=false`
  - [ ] `APP_URL=https://votre-api.onrender.com`
  - [ ] `DB_CONNECTION=pgsql`
  - [ ] `DB_HOST=db.xxxxx.supabase.co`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_DATABASE=postgres`
  - [ ] `DB_USERNAME=postgres`
  - [ ] `DB_PASSWORD=votre_mot_de_passe`
- [ ] **3.6** Déployer et attendre (5-10 minutes)
- [ ] **3.7** Exécuter migrations : Shell > `php artisan migrate --force`

**Temps estimé** : 20-30 minutes

---

### Phase 4 : Configuration Locale (10 minutes)

- [ ] **4.1** Mettre à jour `Backend/.env` avec credentials Supabase
- [ ] **4.2** Tester connexion : `php artisan migrate:status`
- [ ] **4.3** Mettre à jour `Frontend/.env` avec URL API Render
- [ ] **4.4** Tester frontend local : `npm run dev`

**Temps estimé** : 10 minutes

---

### Phase 5 : Déploiement Frontend (5 minutes)

- [ ] **5.1** Build frontend : `cd Frontend && npm run build`
- [ ] **5.2** Déployer sur Firebase : `firebase deploy --only hosting`
- [ ] **5.3** Tester : Aller sur `https://votre-projet.firebaseapp.com`

**Temps estimé** : 5-10 minutes

---

### Phase 6 : Configuration UptimeRobot (5 minutes)

- [ ] **6.1** Créer compte sur [uptimerobot.com](https://uptimerobot.com) (gratuit)
- [ ] **6.2** Ajouter monitor HTTP
- [ ] **6.3** URL : `https://votre-api.onrender.com/api/status`
- [ ] **6.4** Intervalle : 5 minutes
- [ ] **6.5** Cela gardera Render actif (évite le spin down)

**Temps estimé** : 5 minutes

---

### Phase 7 : Tests Finaux (10 minutes)

- [ ] **7.1** Tester API : `curl https://votre-api.onrender.com/api/status`
- [ ] **7.2** Tester Frontend : Ouvrir `https://votre-projet.firebaseapp.com`
- [ ] **7.3** Tester connexion DB : Vérifier dans Supabase SQL Editor
- [ ] **7.4** Tester authentification (si configuré)
- [ ] **7.5** Vérifier les logs Render

**Temps estimé** : 10 minutes

---

## ⏱️ Temps Total Estimé

**Total** : **75-100 minutes** (1h15 - 1h40)

---

## 📝 Informations à Noter

Créez un fichier `CREDENTIALS.md` (ne pas commiter dans Git !) :

```markdown
# Credentials (NE PAS COMMITER !)

## Supabase
- Host: db.xxxxx.supabase.co
- Database: postgres
- Port: 5432
- Username: postgres
- Password: ********
- Project URL: https://xxxxx.supabase.co
- Anon Key: eyJ...
- Service Role Key: eyJ...

## Firebase
- Project ID: votre-projet
- Server Key: AAAA...
- Web App API Key: AIza...

## Render
- Service URL: https://votre-api.onrender.com
- Service Name: terrains-api
```

---

## 🎯 Ordre Recommandé

1. ✅ **Supabase** (le plus important - base de données)
2. ✅ **Render** (backend Laravel)
3. ✅ **Firebase** (frontend hosting)
4. ✅ **UptimeRobot** (garder Render actif)

---

## 🆘 Besoin d'Aide ?

Si vous bloquez à une étape :
1. Vérifier les logs dans chaque service
2. Consulter la documentation officielle
3. Vérifier les credentials
4. Tester chaque composant individuellement

**Vous êtes prêt à commencer ! 🚀**

