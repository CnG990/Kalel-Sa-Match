# 🚀 Déploiement GitHub → EC2 - Kalel Sa Match

## 📋 Checklist Pré-Déploiement

- [ ] ✅ Tous les fichiers créés/modifiés
- [ ] ✅ Requirements.txt à jour
- [ ] ✅ Migrations créées
- [ ] ✅ Tests locaux réussis
- [ ] ⏳ Push sur GitHub
- [ ] ⏳ Pull sur EC2 + migrations

---

## 1️⃣ Push sur GitHub

### A. Vérifier les fichiers modifiés

```bash
cd c:\laragon\www\Terrains-Synthetiques
git status
```

**Nouveaux fichiers créés** :
```
Backend:
✅ apps/accounts/models_loyalty.py                   - Système fidélité
✅ apps/accounts/migrations/0002_add_payment_fields.py
✅ apps/accounts/migrations/0003_add_fcm_token.py
✅ apps/accounts/migrations/0004_loyalty_system.py
✅ apps/payments/models_config.py                     - PaymentConfig admin
✅ apps/payments/serializers_config.py
✅ apps/payments/migrations/0002_payment_config.py
✅ apps/admin_panel/views_payment_config.py
✅ apps/manager/exports.py                            - Exports Excel/PDF
✅ apps/notifications/firebase_service.py             - Firebase push
✅ apps/terrains/analytics.py                         - Analytics avancés
✅ apps/terrains/migrations/0002_add_indexes.py
✅ apps/reservations/migrations/0002_add_indexes.py
✅ deploy_ec2.sh                                      - Script déploiement
✅ WAVE_BUSINESS_GUIDE.md                             - Doc Wave Business
✅ DEPLOIEMENT_GUIDE.md                               - Guide complet

Frontend:
✅ src/components/LeafletMap.tsx                      - Carte Leaflet/OSM
✅ src/pages/dashboard/MapPageNew.tsx                 - Page carte optimisée
```

**Fichiers modifiés** :
```
✅ apps/accounts/models.py                            - +orange_money_number, +fcm_token
✅ apps/admin_panel/views.py                          - Analytics admin
✅ apps/admin_panel/urls.py                           - Routes PaymentConfig
✅ apps/manager/views.py                              - +ManagerExportsViewSet
✅ apps/manager/urls.py                               - Routes exports
✅ requirements.txt                                    - +openpyxl, reportlab, firebase-admin
```

### B. Commit et Push

```bash
# Ajouter tous les fichiers
git add .

# Commit avec message descriptif
git commit -m "feat: Système complet Wave/Orange Money + Fidélité + Exports + Leaflet

BACKEND:
- PaymentConfig CRUD admin (comptes réception Wave/Orange)
- Système fidélité/points clients (LoyaltyAccount, Rewards)
- Exports Excel/PDF gestionnaires (réservations, stats, paiements)
- Notifications push Firebase (FCM)
- Analytics avancés (revenus, performance, top clients)
- Migrations DB indexation (lat/lng, dates, statuts)
- Script déploiement automatisé (deploy_ec2.sh)

FRONTEND:
- Migration Mapbox → Leaflet + OpenStreetMap (gratuit)
- 3 fonds de carte (OSM, ESRI Satellite, Topo)
- Filtres statuts + géolocalisation + distances

DOCS:
- Guide Wave Business Sénégal (QR codes, webhooks)
- Guide déploiement EC2 complet
"

# Push vers GitHub
git push origin main
```

---

## 2️⃣ Déploiement sur EC2

### A. Connexion EC2

```bash
# Via AWS Console Session Manager
# ou AWS CLI
aws ssm start-session --target <instance-id>
```

### B. Pull depuis GitHub

```bash
# Accéder au projet backend
cd /home/ssm-user/projects/ksm/python-backend

# Sauvegarder éventuels changements locaux
git stash

# Pull dernières modifications
git pull origin main
```

### C. Installation Nouvelles Dépendances

```bash
# Activer venv
source .venv/bin/activate

# Installer nouvelles dépendances
pip install -r requirements.txt

# Vérifier installation
pip list | grep -E "openpyxl|reportlab|firebase"
```

**Devrait afficher** :
```
firebase-admin==6.4.0
openpyxl==3.1.2
reportlab==4.0.9
```

### D. Appliquer Migrations

```bash
# Vérifier migrations en attente
python manage.py showmigrations

# Appliquer toutes les migrations
python manage.py migrate

# Vérifier succès
python manage.py showmigrations | grep "\[ \]"  # Ne devrait rien afficher
```

**Migrations appliquées** :
```
accounts:
  [X] 0002_add_payment_fields      - orange_money_number
  [X] 0003_add_fcm_token            - fcm_token
  [X] 0004_loyalty_system           - LoyaltyAccount, Rewards

payments:
  [X] 0002_payment_config           - PaymentConfig, PaymentStats

terrains:
  [X] 0002_add_indexes              - Index géospatial

reservations:
  [X] 0002_add_indexes              - Index dates/statuts
```

### E. Initialiser PaymentConfig par Défaut

```bash
# Via Django shell
python manage.py shell
```

```python
from apps.payments.models_config import PaymentConfig

# Wave Business - Kalel Sa Match
wave_config, created = PaymentConfig.objects.get_or_create(
    methode='wave',
    defaults={
        'wave_payment_link': 'https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/',
        'wave_merchant_name': 'Kalel Sa Match',
        'wave_merchant_id': 'M_sn_OnnKDQNjnuxG',
        'est_actif': True,
        'commission_pourcentage': 0.00,
        'ordre_affichage': 1,
        'instructions': 'Scannez le QR code avec votre application Wave ou cliquez sur le lien de paiement.',
    }
)

# Orange Money - Kalel Sa Match
orange_config, created = PaymentConfig.objects.get_or_create(
    methode='orange_money',
    defaults={
        'orange_merchant_number': '77 XXX XX XX',  # À CONFIGURER
        'orange_merchant_name': 'Kalel Sa Match',
        'est_actif': True,
        'commission_pourcentage': 0.00,
        'ordre_affichage': 2,
        'instructions': 'Composez #144#95# et suivez les instructions pour payer.',
    }
)

print(f"Wave: {wave_config.wave_payment_link}")
print(f"Orange: {orange_config.orange_merchant_number}")
exit()
```

### F. Configuration Firebase (Optionnel)

Si vous utilisez Firebase :

```bash
# Télécharger le fichier credentials Firebase depuis Firebase Console
# Security > Service Accounts > Generate new private key

# Upload sur EC2 (depuis votre machine locale)
scp firebase-credentials.json ssm-user@<ec2-ip>:/home/ssm-user/projects/ksm/

# Sur EC2, ajouter au .env
nano .env
```

Ajouter :
```env
FIREBASE_CREDENTIALS=/home/ssm-user/projects/ksm/firebase-credentials.json
```

### G. Collecter Statiques

```bash
python manage.py collectstatic --noinput
```

### H. Redémarrer Services

```bash
# Gunicorn
sudo systemctl restart gunicorn
sudo systemctl status gunicorn

# Nginx
sudo nginx -t
sudo systemctl reload nginx
```

**OU utiliser le script automatique** :

```bash
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

---

## 3️⃣ Tests Post-Déploiement

### A. Santé API

```bash
# Test health endpoint
curl https://kalelsamatch.duckdns.org/api/health/

# Devrait retourner: {"status": "ok"}
```

### B. Nouveaux Endpoints

```bash
# PaymentConfig admin
curl -H "Authorization: Bearer <token>" \
  https://kalelsamatch.duckdns.org/api/admin/payment-config/

# Analytics
curl -H "Authorization: Bearer <token>" \
  https://kalelsamatch.duckdns.org/api/admin/stats/revenue_trends/?days=30

# Export Excel gestionnaire (télécharge fichier)
curl -H "Authorization: Bearer <token>" \
  https://kalelsamatch.duckdns.org/api/manager/exports/reservations_excel/ \
  -o reservations.xlsx
```

### C. Vérifier Base de Données

```bash
python manage.py shell
```

```python
from apps.payments.models_config import PaymentConfig
from apps.accounts.models_loyalty import LoyaltyConfig

# Vérifier PaymentConfig
print(PaymentConfig.objects.all())

# Vérifier tables créées
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'loyalty%'")
print(cursor.fetchall())
```

### D. Logs

```bash
# Gunicorn
tail -f /var/log/gunicorn/error.log

# Nginx
tail -f /var/log/nginx/error.log

# Django (si configuré)
tail -f /var/log/django/debug.log
```

---

## 4️⃣ Configuration Admin Post-Déploiement

### A. Accéder Admin Django

```
URL: https://kalelsamatch.duckdns.org/admin/
```

### B. Configurer PaymentConfig

1. Aller dans **Payments** > **Payment Configs**
2. Modifier **Wave Business** :
   - ✅ Lien vérifié : `https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/`
   - ✅ Merchant Name : **Kalel Sa Match**
   - ✅ Actif : Oui

3. Modifier **Orange Money** :
   - ⚠️ **Configurer le numéro marchand réel**
   - ✅ Merchant Name : **Kalel Sa Match**
   - ✅ Actif : Oui

### C. Activer Programme Fidélité

```bash
python manage.py shell
```

```python
from apps.accounts.models_loyalty import LoyaltyConfig

config, created = LoyaltyConfig.objects.get_or_create(id=1)
config.points_par_fcfa = 1.0  # 1 point par 1000 FCFA
config.fcfa_par_point = 100.0  # 1 point = 100 FCFA
config.points_inscription = 500
config.points_parrainage_parrain = 1000
config.points_parrainage_filleul = 500
config.est_actif = True
config.save()

print(f"Programme fidélité activé: {config.points_par_fcfa} pts/1000 FCFA")
```

---

## 5️⃣ Frontend - Déploiement (si nécessaire)

### A. Build Frontend Local

```bash
cd Frontend
npm install
npm run build
```

### B. Upload dist/ sur EC2

```bash
# Via SCP
scp -r dist/* ssm-user@<ec2-ip>:/var/www/ksm-frontend/dist/

# Ou via rsync
rsync -avz --delete dist/ ssm-user@<ec2-ip>:/var/www/ksm-frontend/dist/
```

### C. Vérifier Nginx

Le fichier `/etc/nginx/conf.d/ksm_nginx.conf` devrait déjà pointer vers `/var/www/ksm-frontend/dist`

---

## 6️⃣ Endpoints Disponibles

### Admin

```
GET  /api/admin/payment-config/                  - Liste configs paiement
POST /api/admin/payment-config/                  - Créer config
PUT  /api/admin/payment-config/{id}/             - Modifier config
POST /api/admin/payment-config/{id}/toggle_activation/
POST /api/admin/payment-config/initialize_defaults/
GET  /api/admin/payment-config/stats/

GET  /api/admin/stats/dashboard/                 - Dashboard complet
GET  /api/admin/stats/revenue_trends/?days=30
GET  /api/admin/stats/terrain_performance/
GET  /api/admin/stats/user_statistics/
GET  /api/admin/stats/top_clients/?limit=10
GET  /api/admin/stats/popular_times/
GET  /api/admin/stats/monthly_comparison/?months=6
```

### Gestionnaire

```
GET  /api/manager/exports/reservations_excel/?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD
GET  /api/manager/exports/statistiques_pdf/?mois=3&annee=2024
GET  /api/manager/exports/paiements_excel/?date_debut=YYYY-MM-DD
```

### Client

```
POST /api/accounts/register/                     - Inscription (reçoit 500 pts)
POST /api/accounts/update_fcm_token/             - Token Firebase
GET  /api/loyalty/my_account/                    - Solde points
GET  /api/loyalty/rewards/                       - Récompenses disponibles
POST /api/loyalty/redeem/{reward_id}/            - Échanger points
```

---

## ✅ Checklist Déploiement Final

- [ ] Code pushé sur GitHub ✅
- [ ] Pull sur EC2 ✅
- [ ] Dépendances installées (openpyxl, reportlab, firebase) ✅
- [ ] Migrations appliquées ✅
- [ ] PaymentConfig initialisé ✅
- [ ] LoyaltyConfig configuré ✅
- [ ] Services redémarrés (Gunicorn, Nginx) ✅
- [ ] Tests API réussis ✅
- [ ] Frontend build déployé (si nécessaire) ⏳
- [ ] Numéro Orange Money réel configuré ⚠️
- [ ] Firebase credentials uploadé (si notifications push) ⏳
- [ ] Backup DB effectué ✅

---

## 🆘 Troubleshooting

### Erreur Migration

```bash
# Faker la migration si déjà appliquée manuellement
python manage.py migrate --fake accounts 0004_loyalty_system

# Ou rollback et réappliquer
python manage.py migrate accounts 0003_add_fcm_token
python manage.py migrate accounts 0004_loyalty_system
```

### Erreur Import Firebase

```bash
# Vérifier installation
pip show firebase-admin

# Réinstaller si nécessaire
pip uninstall firebase-admin
pip install firebase-admin==6.4.0
```

### Export Excel vide

```bash
# Vérifier openpyxl
python -c "import openpyxl; print(openpyxl.__version__)"

# Si erreur, réinstaller
pip install --force-reinstall openpyxl==3.1.2
```

---

## 📊 Résultat Attendu

Après déploiement réussi :

✅ **Backend** : 
- Paiements Wave/Orange configurables
- Système fidélité actif
- Analytics temps réel
- Exports Excel/PDF fonctionnels
- Notifications Firebase prêtes

✅ **Frontend** :
- Carte Leaflet interactive
- 3 fonds de carte gratuits
- Filtres statuts temps réel
- Géolocalisation utilisateur

✅ **Admin** :
- Dashboard analytics complet
- Gestion PaymentConfig CRUD
- Top clients, revenus, performance

✅ **Gestionnaires** :
- Exports réservations Excel
- Stats PDF mensuelles
- Exports paiements

🎉 **Plateforme complète opérationnelle !**
