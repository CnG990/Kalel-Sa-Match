# 🚀 DÉPLOIEMENT FRONTEND - GUIDE RAPIDE

**Build réussi** : ✅  
**Fichiers prêts** : ✅  
**Configuration** : ✅

---

## 🎯 **OPTION 1 : VERCEL (Recommandé)**

### **Installation et déploiement** (5 min)

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
cd Frontend
vercel --prod

# 4. Suivre les instructions :
# - Set up project? YES
# - Which scope? [choisir votre compte]
# - Link to existing project? NO
# - Project name? kalel-sa-match
# - Directory? ./
# - Override settings? NO
```

**URL finale** : `https://kalel-sa-match.vercel.app`

---

## 🎯 **OPTION 2 : NETLIFY**

### **Installation et déploiement** (5 min)

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Se connecter
netlify login

# 3. Déployer
cd Frontend
netlify deploy --prod

# 4. Configuration :
# - Build directory? dist
# - Deploy path? dist
```

**URL finale** : `https://kalel-sa-match.netlify.app`

---

## ⚙️ **CONFIGURATION BACKEND (CRITIQUE)**

Après déploiement, **ajouter l'URL frontend aux CORS** :

### **Sur EC2** :

```bash
ssh ec2-user@kalelsamatch.duckdns.org
cd /home/ssm-user/projects/ksm/python-backend

# Éditer settings.py
nano ksm_backend/settings.py
```

**Ajouter dans CORS_ALLOWED_ORIGINS** :

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://kalel-sa-match.vercel.app',      # AJOUTER
    'https://kalel-sa-match.netlify.app',     # OU CELUI-CI
]
```

**Redémarrer Gunicorn** :

```bash
sudo systemctl restart ksm_gunicorn.service
```

---

## ✅ **VÉRIFICATIONS POST-DÉPLOIEMENT**

### **1. Site accessible**
- [ ] URL ouvre le site
- [ ] Page login s'affiche
- [ ] Pas d'erreurs console

### **2. API fonctionne**
- [ ] Login réussit
- [ ] Dashboard charge
- [ ] Données s'affichent

### **3. Fonctionnalités**
- [ ] Créer réservation
- [ ] Paiement acompte
- [ ] Litiges (si gestionnaire/admin)

---

## 🐛 **DÉPANNAGE**

### **Erreur CORS**
```
Access to fetch at 'https://kalelsamatch.duckdns.org/api/...' 
from origin 'https://kalel-sa-match.vercel.app' has been blocked by CORS
```

**Solution** : Ajouter l'URL dans CORS_ALLOWED_ORIGINS (voir ci-dessus)

### **Erreur 404 après refresh**
**Vercel** : Créer `vercel.json` :
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** : Créer `public/_redirects` :
```
/*    /index.html   200
```

### **Variables d'environnement non chargées**
- Vérifier `.env.production` existe
- Vérifier `VITE_API_BASE_URL=https://kalelsamatch.duckdns.org`
- Re-build : `npm run build`

---

## 📊 **MÉTRIQUES BUILD**

```
✓ Build réussi en 7.46s
✓ 0 erreurs TypeScript
✓ Taille bundle : 961 KB (gzippé: 232 KB)
⚠️ Chunk size warning (normal pour React app)
```

---

## 🎉 **APRÈS DÉPLOIEMENT**

1. **Tester** toutes les fonctionnalités
2. **Noter** l'URL production
3. **Partager** avec l'équipe
4. **Monitorer** les erreurs (Vercel/Netlify dashboard)

---

**Temps total** : 10-15 minutes

**Prochaine étape** : Choisir Vercel ou Netlify et exécuter les commandes
