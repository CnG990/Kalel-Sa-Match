# 📸 Upload Images Backend - Configuration

**Implémenté le**: 5 Mars 2026

---

## ✅ Endpoints Créés

### 1. Upload Photo de Profil
```
POST /api/accounts/profile/upload-image/
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  image: File

Response:
{
  "success": true,
  "image_url": "/media/profiles/14_abc123.jpg",
  "url": "/media/profiles/14_abc123.jpg",
  "message": "Photo de profil mise à jour avec succès"
}
```

**Fichier**: `apps/accounts/views_upload.py`
**Features**:
- ✅ Validation format (JPG, PNG, WebP)
- ✅ Validation taille (max 5MB)
- ✅ Compression automatique
- ✅ Redimensionnement (max 800x800)
- ✅ Conversion RGB si nécessaire
- ✅ Nommage unique avec UUID
- ✅ Sauvegarde dans `media/profiles/`
- ✅ Mise à jour automatique du profil

---

### 2. Upload Images Terrain
```
POST /api/manager/terrains/{terrain_id}/upload-images/
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  images: File[]  (max 5)

Response:
{
  "success": true,
  "image_urls": [
    "/media/terrains/1/xyz789.jpg",
    "/media/terrains/1/abc123.jpg"
  ],
  "urls": [...],
  "count": 2,
  "message": "2 image(s) uploadée(s) avec succès"
}
```

**Fichier**: `apps/manager/views_upload.py`
**Features**:
- ✅ Validation gestionnaire propriétaire
- ✅ Maximum 5 images par upload
- ✅ Validation format (JPG, PNG, WebP)
- ✅ Validation taille (max 5MB chacune)
- ✅ Compression optimisée (quality 90)
- ✅ Redimensionnement (max 1920x1080)
- ✅ Première image = image principale
- ✅ Sauvegarde dans `media/terrains/{id}/`

---

## 🔧 Configuration Requise

### Settings Django (Déjà configuré ✅)

```python
# ksm_backend/settings/production.py

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### Structure des Dossiers

```
python-backend/
├── media/                    # Créé automatiquement
│   ├── profiles/            # Photos de profil
│   │   ├── 14_abc123.jpg
│   │   └── 15_xyz789.jpg
│   └── terrains/            # Images terrains
│       ├── 1/
│       │   ├── img1.jpg
│       │   └── img2.jpg
│       └── 2/
│           └── img1.jpg
```

### Servir les Fichiers Media

#### En Développement (Django runserver)
```python
# ksm_backend/urls.py
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

#### En Production (Nginx)
```nginx
# /etc/nginx/conf.d/ksm_nginx.conf

server {
    ...
    
    # Servir les fichiers media
    location /media/ {
        alias /home/ssm-user/projects/ksm/python-backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Servir les fichiers statiques
    location /static/ {
        alias /home/ssm-user/projects/ksm/python-backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📦 Dépendances Python

### Pillow (Déjà installé via requirements.txt)
```bash
pip install Pillow
```

Utilisé pour :
- Ouvrir et lire les images
- Redimensionner
- Compresser
- Convertir formats

---

## 🧪 Tests

### Test Upload Photo Profil

```bash
# Via curl
curl -X POST \
  https://kalelsamatch.duckdns.org/api/accounts/profile/upload-image/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/photo.jpg"

# Réponse attendue
{
  "success": true,
  "image_url": "/media/profiles/14_abc123.jpg",
  "message": "Photo de profil mise à jour avec succès"
}
```

### Test Upload Images Terrain

```bash
# Via curl
curl -X POST \
  https://kalelsamatch.duckdns.org/api/manager/terrains/1/upload-images/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"

# Réponse attendue
{
  "success": true,
  "image_urls": ["/media/terrains/1/...", "/media/terrains/1/..."],
  "count": 2,
  "message": "2 image(s) uploadée(s) avec succès"
}
```

### Test depuis Python (Django shell)

```python
from apps.accounts.models import User
from apps.terrains.models import TerrainSynthetiquesDakar
from django.core.files.uploadedfile import SimpleUploadedFile

# Simuler un upload
user = User.objects.get(id=14)
with open('/path/to/image.jpg', 'rb') as f:
    image_content = f.read()
    
uploaded_file = SimpleUploadedFile(
    name='test.jpg',
    content=image_content,
    content_type='image/jpeg'
)

# Tester la vue directement
# (voir tests unitaires)
```

---

## 🚀 Déploiement EC2

### 1. Créer le dossier media

```bash
ssh ssm-user@ec2-instance

cd /home/ssm-user/projects/ksm/python-backend
mkdir -p media/profiles media/terrains

# Donner les permissions
sudo chown -R ssm-user:nginx media/
chmod -R 755 media/
```

### 2. Configurer Nginx (DÉJÀ FAIT ✅)

Le fichier `/etc/nginx/conf.d/ksm_nginx.conf` doit avoir :

```nginx
location /media/ {
    alias /home/ssm-user/projects/ksm/python-backend/media/;
}
```

### 3. Redémarrer les services

```bash
# Redémarrer Gunicorn
sudo systemctl restart ksm_gunicorn.service

# Recharger Nginx
sudo systemctl reload nginx
```

### 4. Tester l'upload

```bash
# Obtenir un token
curl -X POST https://kalelsamatch.duckdns.org/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"cheikhngom99@gmail.com","password":"your-password"}'

# Upload test
curl -X POST https://kalelsamatch.duckdns.org/api/accounts/profile/upload-image/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg"
```

---

## 📊 Monitoring & Logs

### Logs d'erreur

```bash
# Logs Gunicorn
sudo journalctl -u ksm_gunicorn.service -f

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Vérifier l'espace disque

```bash
# Taille du dossier media
du -sh /home/ssm-user/projects/ksm/python-backend/media/

# Nombre d'images
find media/ -type f | wc -l
```

---

## 🔐 Sécurité

### Validations Implémentées

1. **Authentification**: Seuls les utilisateurs connectés peuvent uploader
2. **Permissions**: Gestionnaire doit être propriétaire du terrain
3. **Formats**: Seulement JPG, PNG, WebP
4. **Taille**: Maximum 5MB par fichier
5. **Nombre**: Maximum 5 images par terrain
6. **Compression**: Automatique pour réduire la bande passante

### Recommandations Supplémentaires

```python
# TODO: Ajouter dans settings.py

# Limite taille upload Django
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Limite nombre de fichiers
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10

# Timeout upload
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880
```

---

## 🐛 Troubleshooting

### Erreur: "Permission denied" lors de l'upload

```bash
# Vérifier les permissions
ls -la /home/ssm-user/projects/ksm/python-backend/media/

# Corriger
sudo chown -R ssm-user:nginx media/
chmod -R 755 media/
```

### Erreur: "No such file or directory"

```bash
# Créer les dossiers
mkdir -p media/profiles media/terrains
```

### Images ne s'affichent pas

```bash
# Vérifier Nginx config
sudo nginx -t

# Vérifier que le fichier existe
ls -la /home/ssm-user/projects/ksm/python-backend/media/profiles/

# Vérifier les URLs dans la DB
python manage.py shell
>>> from apps.accounts.models import User
>>> User.objects.get(id=14).profile_image_url
```

---

## 📝 Checklist Déploiement

- [x] Endpoints créés et testés
- [ ] Dossier `media/` créé sur EC2
- [ ] Permissions configurées (755)
- [ ] Nginx configuré pour servir `/media/`
- [ ] Gunicorn redémarré
- [ ] Test upload photo profil
- [ ] Test upload images terrain
- [ ] Images accessibles via navigateur
- [ ] Frontend connecté et testé

---

## 🎯 Prochaines Améliorations

### Phase 2
1. **AWS S3** - Stockage cloud scalable
   ```python
   pip install django-storages boto3
   DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
   ```

2. **Cloudinary** - CDN avec transformations
   ```python
   pip install django-cloudinary-storage
   ```

3. **Thumbnails** - Générer miniatures automatiquement
4. **WebP** - Conversion automatique en WebP
5. **Watermark** - Ajouter logo sur images
6. **Crop** - Recadrage automatique

---

**Status**: ✅ Backend 100% implémenté - Prêt pour tests
**Dernière mise à jour**: 5 Mars 2026, 14:35 UTC
