# 🚀 Guide Rapide : ngrok + Vercel

## ✅ **Prérequis Vérifiés**
- ✅ ngrok installé (dans le répertoire)
- ✅ Serveur Laravel fonctionne sur `http://localhost:8000`
- ✅ CORS configuré pour Vercel

## 🎯 **Étapes Simples**

### **Étape 1 : Démarrer le Serveur Laravel**
```bash
# Dans un premier terminal PowerShell
.\start-laravel-direct.ps1
```

### **Étape 2 : Démarrer ngrok**
```bash
# Dans un second terminal PowerShell
.\start-ngrok-direct.bat
```

### **Étape 3 : Copier l'URL ngrok**
Quand ngrok démarre, tu verras :
```
Session Status                online
Account                       (Plan: Free)
Version                       3.25.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-def456.ngrok.io -> http://localhost:8000
```

**Copie l'URL : `https://abc123-def456.ngrok.io`**

### **Étape 4 : Configurer Vercel**
Dans ton code frontend Vercel, remplace :
```javascript
// AVANT
const API_URL = 'https://kalel-sa-match.onrender.com/api';

// APRÈS (remplace par ton URL ngrok)
const API_URL = 'https://abc123-def456.ngrok.io/api';
```

## 🧪 **Tests Rapides**

### Test Local
```bash
php test-local-server.php
```

### Test ngrok
```bash
php test-ngrok-url.php
```

### Test depuis Vercel
Ouvre `https://kalel-sa-match.vercel.app` et teste les fonctionnalités API.

## 📋 **Commandes Utiles**

```bash
# Démarrer Laravel
.\start-laravel-direct.ps1

# Démarrer ngrok
.\start-ngrok-direct.bat

# Test rapide
php test-ngrok-url.php

# Test local
php test-local-server.php
```

## ⚠️ **Points Importants**

1. **URL Changeante** : L'URL ngrok change à chaque redémarrage
2. **Deux Terminaux** : Garde Laravel ET ngrok en cours d'exécution
3. **CORS OK** : Ton domaine Vercel est déjà autorisé
4. **Gratuit** : ngrok gratuit = 1 tunnel simultané

## 🔄 **Redémarrage**

Si tu dois redémarrer :
1. Arrête ngrok (Ctrl+C)
2. Relance : `.\start-ngrok-direct.bat`
3. Copie la nouvelle URL
4. Met à jour ton frontend Vercel

## 🎯 **URLs de Test**

- **Local** : `http://localhost:8000/api/status`
- **ngrok** : `https://abc123-def456.ngrok.io/api/status`
- **Frontend** : `https://kalel-sa-match.vercel.app`

---

**💡 Conseil** : Garde les deux terminaux ouverts ! 