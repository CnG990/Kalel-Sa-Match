# 🚀 Guide d'Hébergement DigitalOcean - Kalel Sa Match (KSM)

> **Hébergement complet de l'application KSM sur DigitalOcean**

---

## ✅ **OUI, DigitalOcean peut gérer l'ensemble du projet KSM !**

DigitalOcean peut héberger **tous les composants** de votre application :

- ✅ **Backend Laravel** (API REST)
- ✅ **Frontend React** (Admin Panel, Client Portal, Public Pages)
- ✅ **Base de données PostgreSQL + PostGIS**
- ✅ **Redis** (Cache et sessions)
- ✅ **Storage** (Fichiers, images, documents)
- ✅ **Applications mobiles Flutter** (via API uniquement, les apps sont compilées séparément)
- ✅ **SMS** (via APIs tierces : Twilio, MessageBird, Africa's Talking)
- ✅ **Paiements** (Wave, Orange Money, Yas)
- ✅ **Notifications** (Email, Push, SMS)

---

## 🏗️ Architecture Recommandée sur DigitalOcean

### **Option 1 : Architecture Monolithique (Recommandée pour débuter)**

```
┌─────────────────────────────────────────────────────────┐
│              DigitalOcean Droplet (4GB RAM)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Nginx      │  │   Laravel    │  │   React      │  │
│  │  (Reverse    │  │   (Backend)  │  │  (Frontend)  │  │
│  │   Proxy)     │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │           │
│  ┌──────▼─────────────────▼──────────────────▼───────┐  │
│  │         PostgreSQL + PostGIS (Database)           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Redis     │  │   Storage    │  │   SSL/HTTPS   │  │
│  │   (Cache)    │  │   (Files)    │  │  (Let's Encrypt)│
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Coût estimé : ~$24-48/mois** (Droplet 4GB RAM + 80GB SSD)

---

### **Option 2 : Architecture Scalable (Pour production)**

```
┌─────────────────────────────────────────────────────────┐
│         DigitalOcean App Platform (Managed)              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │   Backend    │  │   Workers    │  │
│  │   (React)    │  │   (Laravel)  │  │  (Queue Jobs) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │    Managed PostgreSQL + PostGIS          │
         │    (Database Cluster)                    │
         └──────────────────────────────────────────┘
```

**Coût estimé : ~$50-100/mois** (selon le trafic)

---

## 📦 Composants à Héberger

### **1. Backend Laravel (API REST)**

**Fichiers concernés :**
- `Backend/` (toute l'application Laravel)

**Configuration :**
```bash
# Sur le serveur DigitalOcean
cd /var/www/ksm-backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

**Variables d'environnement (.env) :**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.ksm.sn

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=ksm_db
DB_USERNAME=ksm_user
DB_PASSWORD=secure_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# SMS Configuration
SMS_PROVIDER=africas_talking  # ou twilio, messagebird
AFRICASTALKING_API_KEY=your_key
AFRICASTALKING_USERNAME=your_username

# Payment APIs
WAVE_API_KEY=your_wave_key
ORANGE_MONEY_API_KEY=your_orange_key
YAS_API_KEY=your_yas_key

# Storage
FILESYSTEM_DISK=s3  # ou local
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET=ksm-storage
AWS_REGION=us-east-1
```

---

### **2. Frontend React**

**Fichiers concernés :**
- `Frontend/` (toute l'application React)

**Configuration :**
```bash
# Build de production
cd Frontend
npm install
npm run build

# Le dossier 'dist' ou 'build' contient les fichiers statiques
# À servir via Nginx
```

**Variables d'environnement (.env.production) :**
```env
VITE_API_URL=https://api.ksm.sn/api
VITE_APP_NAME=Kalel Sa Match
```

---

### **3. Base de Données PostgreSQL + PostGIS**

**Installation :**
```bash
# Sur le serveur DigitalOcean
sudo apt update
sudo apt install postgresql postgresql-contrib postgis

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE ksm_db;
CREATE USER ksm_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ksm_db TO ksm_user;
\c ksm_db
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
```

**Alternative : Managed Database (Recommandé)**
- DigitalOcean Managed PostgreSQL avec PostGIS
- Sauvegardes automatiques
- Scaling facile
- **Coût : ~$15-30/mois**

---

### **4. Redis (Cache et Sessions)**

**Installation :**
```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**Configuration Laravel :**
```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

---

### **5. Storage (Fichiers)**

**Option A : Local Storage**
```bash
# Créer le dossier de stockage
sudo mkdir -p /var/www/ksm-storage
sudo chown -R www-data:www-data /var/www/ksm-storage
```

**Option B : DigitalOcean Spaces (S3-compatible) - Recommandé**
- Stockage objet scalable
- CDN intégré
- **Coût : ~$5/mois pour 250GB**

---

## 🔧 Configuration Nginx

**Fichier : `/etc/nginx/sites-available/ksm`**

```nginx
# Frontend React (Port 80/443)
server {
    listen 80;
    listen [::]:80;
    server_name ksm.sn www.ksm.sn;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ksm.sn www.ksm.sn;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/ksm.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ksm.sn/privkey.pem;

    # Frontend React
    root /var/www/ksm-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage (Images, fichiers)
    location /storage {
        alias /var/www/ksm-storage/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📱 Applications Mobiles Flutter

**Important :** Les applications mobiles Flutter ne sont **pas hébergées** sur DigitalOcean. Elles sont :

1. **Compilées localement** ou via CI/CD (GitHub Actions, GitLab CI)
2. **Publiées sur les stores** :
   - **Android** : Google Play Store
   - **iOS** : Apple App Store
3. **Se connectent à l'API** hébergée sur DigitalOcean

**Configuration API dans les apps :**
```dart
// mobile-client/lib/services/api_service.dart
// mobile-gestionnaire/lib/services/api_service.dart
static const String baseUrl = 'https://api.ksm.sn/api';
```

---

## 🔐 Intégration SMS

### **Option 1 : Africa's Talking (Recommandé pour l'Afrique)**

**Installation :**
```bash
composer require africastalking/africastalking
```

**Configuration Laravel :**
```php
// config/services.php
'africas_talking' => [
    'api_key' => env('AFRICASTALKING_API_KEY'),
    'username' => env('AFRICASTALKING_USERNAME'),
],

// app/Services/SmsService.php
use AfricasTalking\SDK\AfricasTalking;

class SmsService
{
    public function sendOTP($phone, $code)
    {
        $username = config('services.africas_talking.username');
        $apiKey = config('services.africas_talking.api_key');
        
        $AT = new AfricasTalking($username, $apiKey);
        $sms = $AT->sms();
        
        $result = $sms->send([
            'to' => $phone,
            'message' => "Votre code OTP KSM: $code"
        ]);
        
        return $result;
    }
}
```

### **Option 2 : Twilio**

```bash
composer require twilio/sdk
```

```php
use Twilio\Rest\Client;

$client = new Client($accountSid, $authToken);
$client->messages->create(
    $phone,
    ['from' => '+221XXXXXXXXX', 'body' => "Votre code OTP: $code"]
);
```

---

## 💳 Intégration Paiements

### **Wave API**

**Configuration :**
```php
// app/Services/PaymentService.php
class PaymentService
{
    public function processWavePayment($amount, $phone)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.wave.api_key'),
        ])->post('https://api.wave.com/v1/payments', [
            'amount' => $amount,
            'phone' => $phone,
            'currency' => 'XOF',
        ]);
        
        return $response->json();
    }
}
```

### **Orange Money API**

```php
public function processOrangeMoneyPayment($amount, $phone)
{
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . config('services.orange_money.api_key'),
    ])->post('https://api.orange.com/orange-money-webpay/sen/v1/webpayment', [
        'amount' => $amount,
        'phone' => $phone,
    ]);
    
    return $response->json();
}
```

---

## 🔔 Notifications

### **Email (Laravel Mail)**

**Configuration :**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io  # ou SendGrid, Mailgun
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@ksm.sn
MAIL_FROM_NAME="Kalel Sa Match"
```

### **Push Notifications (Firebase Cloud Messaging)**

```bash
composer require kreait/firebase-php
```

```php
use Kreait\Firebase\Factory;

$factory = (new Factory)->withServiceAccount('path/to/serviceAccount.json');
$messaging = $factory->createMessaging();

$message = CloudMessage::withTarget('token', $deviceToken)
    ->withNotification(Notification::create('Nouvelle réservation', 'Votre réservation est confirmée'));

$messaging->send($message);
```

---

## 🚀 Déploiement Automatique (CI/CD)

### **GitHub Actions**

**Fichier : `.github/workflows/deploy.yml`**

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.DROPLET_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/ksm-backend
            git pull origin master
            composer install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            sudo systemctl restart php8.2-fpm
            sudo systemctl reload nginx
```

---

## 📊 Monitoring et Logs

### **DigitalOcean Monitoring**

- Monitoring intégré du serveur
- Alertes automatiques
- Métriques CPU, RAM, Disque

### **Laravel Logs**

```bash
# Voir les logs en temps réel
tail -f /var/www/ksm-backend/storage/logs/laravel.log
```

### **Nginx Logs**

```bash
# Logs d'accès
tail -f /var/log/nginx/access.log

# Logs d'erreurs
tail -f /var/log/nginx/error.log
```

---

## 🔒 Sécurité

### **1. Firewall (UFW)**

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **2. SSL/HTTPS (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ksm.sn -d www.ksm.sn
```

### **3. Fail2Ban (Protection contre les attaques)**

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 💰 Estimation des Coûts

### **Architecture Basique (Début)**
- **Droplet 4GB RAM** : $24/mois
- **Managed PostgreSQL** : $15/mois
- **Spaces (Storage)** : $5/mois
- **Total : ~$44/mois**

### **Architecture Production**
- **Droplet 8GB RAM** : $48/mois
- **Managed PostgreSQL (Haute disponibilité)** : $30/mois
- **Spaces (Storage)** : $10/mois
- **Load Balancer** : $12/mois
- **Total : ~$100/mois**

---

## ✅ Checklist de Déploiement

- [ ] Créer un compte DigitalOcean
- [ ] Créer un Droplet Ubuntu 22.04 LTS
- [ ] Configurer le firewall (UFW)
- [ ] Installer Nginx, PHP, PostgreSQL, PostGIS, Redis
- [ ] Cloner le repository GitHub
- [ ] Configurer les variables d'environnement (.env)
- [ ] Exécuter les migrations de base de données
- [ ] Configurer Nginx (reverse proxy)
- [ ] Installer SSL (Let's Encrypt)
- [ ] Configurer les services SMS (Africa's Talking)
- [ ] Configurer les APIs de paiement (Wave, Orange Money)
- [ ] Configurer les notifications (Email, Push)
- [ ] Configurer CI/CD (GitHub Actions)
- [ ] Tester l'application complète
- [ ] Configurer les sauvegardes automatiques
- [ ] Mettre en place le monitoring

---

## 📚 Ressources Utiles

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

---

## 🎯 Conclusion

**OUI, DigitalOcean peut gérer l'ensemble du projet KSM !**

Tous les composants peuvent être hébergés sur DigitalOcean :
- ✅ Backend Laravel
- ✅ Frontend React
- ✅ Base de données PostgreSQL + PostGIS
- ✅ Redis
- ✅ Storage
- ✅ SMS (via APIs tierces)
- ✅ Paiements (via APIs tierces)
- ✅ Notifications

Les applications mobiles Flutter sont compilées et publiées sur les stores, mais se connectent à l'API hébergée sur DigitalOcean.

**Recommandation :** Commencer avec l'architecture basique (~$44/mois) et scaler selon les besoins.

---

**Dernière mise à jour :** Janvier 2025

