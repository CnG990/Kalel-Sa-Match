# 🚀 Commandes de Déploiement - Kalel Sa Match

**Date**: 5 Mars 2026

---

## 📤 1. PUSH SUR GITHUB (Local Windows)

```powershell
# Dans le dossier racine du projet
cd C:\laragon\www\Terrains-Synthetiques

# Vérifier le statut
git status

# Ajouter tous les nouveaux fichiers
git add .

# Commit avec message descriptif
git commit -m "feat: Implémentation upload images (profil + terrain) + APIs complètes + SEO + Responsivité mobile"

# Push vers GitHub
git push origin main
```

**Si premier push** :
```powershell
git remote add origin https://github.com/YOUR_USERNAME/Terrains-Synthetiques.git
git branch -M main
git push -u origin main
```

---

## 📥 2. PULL SUR EC2 (Backend)

```bash
# Connexion SSH
ssh ssm-user@13.247.209.171
# OU
ssh ssm-user@kalelsamatch.duckdns.org

# Naviguer vers le projet
cd /home/ssm-user/projects/ksm/python-backend

# Activer l'environnement virtuel
source .venv/bin/activate

# Pull les derniers changements
git pull origin main

# Si conflit avec .env (normal)
git stash  # Sauvegarder les changements locaux
git pull origin main
git stash pop  # Restaurer .env

# Installer les nouvelles dépendances (si nécessaire)
pip install -r requirements.txt

# Créer les dossiers media si nécessaire
mkdir -p media/profiles media/terrains
sudo chown -R ssm-user:nginx media/
chmod -R 755 media/

# Redémarrer Gunicorn
sudo systemctl restart ksm_gunicorn.service
sudo systemctl status ksm_gunicorn.service

# Vérifier les logs
sudo journalctl -u ksm_gunicorn.service -n 50 --no-pager
```

---

## 🧪 3. TESTER LES APIS UPLOAD

### Test 1: Upload Photo Profil

```bash
# Obtenir un token JWT
TOKEN=$(curl -s -X POST https://kalelsamatch.duckdns.org/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"cheikhngom99@gmail.com","password":"YOUR_PASSWORD"}' | jq -r '.access')

echo "Token: $TOKEN"

# Upload une image de test
curl -X POST https://kalelsamatch.duckdns.org/api/accounts/profile/upload-image/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/tmp/test-profile.jpg"

# Résultat attendu:
# {
#   "success": true,
#   "image_url": "/media/profiles/14_abc123.jpg",
#   "message": "Photo de profil mise à jour avec succès"
# }
```

### Test 2: Upload Images Terrain

```bash
# Utiliser le même token
curl -X POST https://kalelsamatch.duckdns.org/api/manager/terrains/1/upload-images/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@/tmp/terrain1.jpg" \
  -F "images=@/tmp/terrain2.jpg"

# Résultat attendu:
# {
#   "success": true,
#   "image_urls": ["/media/terrains/1/xyz.jpg", "/media/terrains/1/abc.jpg"],
#   "count": 2,
#   "message": "2 image(s) uploadée(s) avec succès"
# }
```

### Test 3: Vérifier les images sont accessibles

```bash
# Tester l'accès direct
curl -I https://kalelsamatch.duckdns.org/media/profiles/14_abc123.jpg

# Résultat attendu: HTTP/1.1 200 OK
```

---

## 🔍 4. VÉRIFICATIONS POST-DÉPLOIEMENT

### Vérifier Gunicorn

```bash
sudo systemctl status ksm_gunicorn.service
# Doit afficher: active (running)

# Logs récents
sudo journalctl -u ksm_gunicorn.service -n 100 --no-pager
```

### Vérifier Nginx

```bash
sudo nginx -t
# Doit afficher: test is successful

sudo systemctl status nginx
# Doit afficher: active (running)
```

### Vérifier la configuration media

```bash
# Vérifier que Nginx sert /media/
sudo cat /etc/nginx/conf.d/ksm_nginx.conf | grep -A 3 "location /media"

# Doit afficher:
# location /media/ {
#     alias /home/ssm-user/projects/ksm/python-backend/media/;
# }
```

### Vérifier les permissions

```bash
ls -la /home/ssm-user/projects/ksm/python-backend/media/
# Doit afficher: drwxr-xr-x ssm-user nginx
```

---

## 🧪 5. TESTS COMPLETS DEPUIS POSTMAN/INSOMNIA

### Collection de tests

**Base URL**: `https://kalelsamatch.duckdns.org`

1. **Login**
   ```
   POST /api/accounts/login/
   Body: {
     "email": "cheikhngom99@gmail.com",
     "password": "your-password"
   }
   ```

2. **Upload Photo Profil**
   ```
   POST /api/accounts/profile/upload-image/
   Headers: Authorization: Bearer {token}
   Body (form-data):
     image: [fichier.jpg]
   ```

3. **Récupérer Profil**
   ```
   GET /api/accounts/me/
   Headers: Authorization: Bearer {token}
   
   Vérifier: profile_image_url contient la nouvelle URL
   ```

4. **Upload Images Terrain**
   ```
   POST /api/manager/terrains/1/upload-images/
   Headers: Authorization: Bearer {token}
   Body (form-data):
     images: [fichier1.jpg]
     images: [fichier2.jpg]
   ```

5. **Liste Terrains**
   ```
   GET /api/terrains/terrains/
   
   Vérifier: image_principale contient une URL
   ```

---

## 🐛 TROUBLESHOOTING

### Erreur: "Permission denied" sur media/

```bash
sudo chown -R ssm-user:nginx /home/ssm-user/projects/ksm/python-backend/media/
chmod -R 755 /home/ssm-user/projects/ksm/python-backend/media/
sudo systemctl restart ksm_gunicorn.service
```

### Erreur: "404 Not Found" sur /media/

```bash
# Vérifier la config Nginx
sudo cat /etc/nginx/conf.d/ksm_nginx.conf

# Si location /media/ manque, l'ajouter:
sudo nano /etc/nginx/conf.d/ksm_nginx.conf

# Ajouter:
# location /media/ {
#     alias /home/ssm-user/projects/ksm/python-backend/media/;
# }

# Recharger Nginx
sudo systemctl reload nginx
```

### Erreur: "No module named 'PIL'"

```bash
cd /home/ssm-user/projects/ksm/python-backend
source .venv/bin/activate
pip install Pillow
sudo systemctl restart ksm_gunicorn.service
```

### Images ne s'affichent pas

```bash
# Vérifier que les fichiers existent
ls -la /home/ssm-user/projects/ksm/python-backend/media/profiles/
ls -la /home/ssm-user/projects/ksm/python-backend/media/terrains/

# Vérifier les URLs dans la base
cd /home/ssm-user/projects/ksm/python-backend
source .venv/bin/activate
python manage.py shell

>>> from apps.accounts.models import User
>>> user = User.objects.get(id=14)
>>> print(user.profile_image_url)
```

---

## 📊 CHECKLIST FINALE

### Backend
- [ ] Code pushé sur GitHub
- [ ] Code pullé sur EC2
- [ ] Gunicorn redémarré
- [ ] Dossiers media/ créés avec bonnes permissions
- [ ] Nginx configuré pour servir /media/
- [ ] Test upload photo profil réussi
- [ ] Test upload images terrain réussi
- [ ] Images accessibles via navigateur

### Frontend
- [ ] Erreurs TypeScript corrigées
- [ ] `npm run build` réussi
- [ ] `firebase deploy --only hosting` réussi
- [ ] App accessible sur kalelsamatch.web.app
- [ ] Upload photo profil fonctionne depuis l'interface
- [ ] Upload images terrain fonctionne

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

```bash
# 1. Local Windows - Push code
cd C:\laragon\www\Terrains-Synthetiques
git add .
git commit -m "feat: Upload images implementation"
git push origin main

# 2. EC2 - Pull et redémarrer
ssh ssm-user@kalelsamatch.duckdns.org
cd /home/ssm-user/projects/ksm/python-backend
git pull origin main
mkdir -p media/profiles media/terrains
sudo chown -R ssm-user:nginx media/
chmod -R 755 media/
sudo systemctl restart ksm_gunicorn.service

# 3. EC2 - Tester API
# [Exécuter les tests curl ci-dessus]

# 4. Local Windows - Build frontend
cd C:\laragon\www\Terrains-Synthetiques\Frontend
npm run build
firebase deploy --only hosting

# 5. Tester l'application complète
# Ouvrir https://kalelsamatch.web.app
```

---

**Dernière mise à jour**: 5 Mars 2026, 14:35 UTC
