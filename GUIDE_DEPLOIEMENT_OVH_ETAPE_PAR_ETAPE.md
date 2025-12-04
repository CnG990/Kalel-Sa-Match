# 🚀 Guide de Déploiement OVH Cloud - Étape par Étape

> **Guide pratique pour déployer KSM directement sur OVH Cloud**

---

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer votre application KSM sur OVH Cloud depuis zéro.

**Durée estimée :** 2-3 heures (première fois)

---

## 🎯 Phase 1 : Création du Compte OVH

### **1.1 Créer un compte OVH**

1. **Aller sur** : https://www.ovh.com/fr/
2. **Cliquer sur** : "Créer un compte" (en haut à droite)
3. **Remplir le formulaire** :
   - Nom, prénom
   - Email
   - Téléphone
   - Mot de passe
4. **Valider l'email** reçu
5. **Valider le numéro de téléphone** (SMS)

### **1.2 Vérifier l'identité**

OVH peut demander une vérification d'identité :
- **Pièce d'identité** (carte d'identité, passeport)
- **Justificatif de domicile** (facture, etc.)

### **1.3 Ajouter un moyen de paiement**

1. **Accéder à** : Manager OVH → Facturation → Moyens de paiement
2. **Ajouter** :
   - Carte bancaire (recommandé)
   - OU Virement bancaire
3. **Valider** le moyen de paiement

---

## 🌐 Phase 2 : Accéder à OVH Public Cloud

### **2.1 Activer Public Cloud**

1. **Se connecter au Manager OVH** : https://www.ovh.com/manager/
2. **Aller dans** : "Public Cloud" (menu de gauche)
3. **Si c'est la première fois** :
   - Cliquer sur "Créer un projet Public Cloud"
   - Choisir un nom : `ksm-production` ou `kalel-sa-match`
   - Sélectionner la région : **Gravelines (GRA)** - France
   - Valider

### **2.2 Interface Public Cloud**

Vous arrivez sur le dashboard Public Cloud avec :
- **Instances** (serveurs)
- **Databases** (bases de données)
- **Object Storage** (stockage)
- **Networking** (réseau)

---

## 🖥️ Phase 3 : Créer une Instance (Serveur)

### **3.1 Créer une instance**

1. **Dans le menu Public Cloud**, cliquer sur **"Instances"**
2. **Cliquer sur** : "Créer une instance"

### **3.2 Configuration de l'instance**

#### **Étape 1 : Modèle**

- **Type** : Général Purpose
- **Modèle** : **B2-7** (recommandé pour débuter)
  - 4 vCPU
  - 7 GB RAM
  - 50 GB SSD
  - **Prix : ~€15-20/mois**

**Alternatives :**
- **B2-15** : 8 vCPU, 15 GB RAM, 100 GB SSD (~€30-40/mois) - pour production
- **B2-30** : 16 vCPU, 30 GB RAM, 200 GB SSD (~€60-80/mois) - haute charge

#### **Étape 2 : Région**

- **Sélectionner** : **Gravelines (GRA)** - France
  - Meilleure latence depuis le Sénégal (~80-100ms)
  - Prix compétitifs
  - Support français

#### **Étape 3 : Image (OS)**

- **Sélectionner** : **Ubuntu 22.04 LTS**
  - Stable et bien supporté
  - Compatible avec Laravel et React

#### **Étape 4 : Clé SSH**

**Option A : Créer une nouvelle clé SSH**

1. **Sur votre machine locale** (Windows PowerShell) :
   ```powershell
   # Générer une clé SSH
   ssh-keygen -t ed25519 -C "ksm-ovh"
   
   # Appuyer sur Entrée pour accepter l'emplacement par défaut
   # Entrer un mot de passe (optionnel mais recommandé)
   ```

2. **Afficher la clé publique** :
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   # OU
   type $env:USERPROFILE\.ssh\id_ed25519.pub
   ```

3. **Dans OVH** :
   - Cliquer sur "Ajouter une clé SSH"
   - Nom : `ksm-ovh-key`
   - Coller la clé publique
   - Valider

**Option B : Utiliser une clé existante**

- Sélectionner une clé déjà créée

#### **Étape 5 : Réseau**

- **Laisser par défaut** (réseau public)
- **IPv6** : Optionnel (peut être activé plus tard)

#### **Étape 6 : Options supplémentaires**

- **Sauvegarde automatique** : Optionnel (coût supplémentaire)
- **Script d'initialisation** : Laisser vide pour l'instant

#### **Étape 7 : Nom et quantité**

- **Nom de l'instance** : `ksm-server` ou `ksm-production`
- **Quantité** : 1
- **Facturation** : Mensuelle (recommandé)

### **3.3 Créer l'instance**

1. **Vérifier le récapitulatif**
2. **Cliquer sur** : "Créer l'instance"
3. **Attendre** 2-3 minutes (création en cours)

### **3.4 Récupérer l'IP de l'instance**

1. **Dans la liste des instances**, trouver votre instance
2. **Noter l'IP publique** (ex: `51.xxx.xxx.xxx`)
3. **Cliquer sur l'instance** pour voir les détails

---

## 🗄️ Phase 4 : Créer une Base de Données PostgreSQL

### **4.1 Créer une Managed Database**

1. **Dans Public Cloud**, cliquer sur **"Databases"**
2. **Cliquer sur** : "Créer une base de données"
3. **Sélectionner** : **PostgreSQL**

### **4.2 Configuration de la base de données**

#### **Étape 1 : Région**

- **Sélectionner** : **Gravelines (GRA)** - France
  - Même région que l'instance (meilleure latence)

#### **Étape 2 : Version**

- **Sélectionner** : **PostgreSQL 15** ou **16**
  - Compatible avec PostGIS

#### **Étape 3 : Plan**

- **Starter** (recommandé pour débuter)
  - 1 GB RAM
  - 10 GB SSD
  - **Prix : ~€15/mois**

**Alternatives :**
- **Business** : 4 GB RAM, 50 GB SSD (~€30/mois) - pour production
- **Enterprise** : 8 GB RAM, 100 GB SSD (~€60/mois) - haute charge

#### **Étape 4 : Nom et utilisateur**

- **Nom de la base** : `ksm_db`
- **Utilisateur** : `ksm_user`
- **Mot de passe** : Générer un mot de passe fort
  - **⚠️ IMPORTANT : Noter ce mot de passe !**

#### **Étape 5 : Réseau**

- **Autoriser l'accès depuis** : L'IP de votre instance
  - Cliquer sur "Ajouter une IP"
  - Entrer l'IP de votre instance créée précédemment

### **4.3 Créer la base de données**

1. **Vérifier le récapitulatif**
2. **Cliquer sur** : "Créer la base de données"
3. **Attendre** 5-10 minutes (création en cours)

### **4.4 Activer PostGIS**

1. **Une fois la base créée**, cliquer dessus
2. **Aller dans l'onglet** : "Extensions disponibles"
3. **Activer** : `postgis` et `postgis_topology`
4. **OU via SSH** (plus tard) :
   ```bash
   psql -h <DB_HOST> -U ksm_user -d ksm_db
   CREATE EXTENSION postgis;
   CREATE EXTENSION postgis_topology;
   ```

### **4.5 Récupérer les informations de connexion**

1. **Dans les détails de la base**, noter :
   - **Host** : `postgresql-xxxxx.db.cloud.ovh.net`
   - **Port** : `5432`
   - **Database** : `ksm_db`
   - **User** : `ksm_user`
   - **Password** : (celui que vous avez créé)

---

## 📦 Phase 5 : Créer un Bucket Object Storage (Optionnel)

### **5.1 Créer un conteneur Object Storage**

1. **Dans Public Cloud**, cliquer sur **"Object Storage"**
2. **Cliquer sur** : "Créer un conteneur"
3. **Configuration** :
   - **Nom** : `ksm-storage`
   - **Région** : Gravelines (GRA)
   - **Type** : Public (pour les fichiers accessibles) ou Private
4. **Créer**

### **5.2 Générer les credentials S3**

1. **Dans Object Storage**, aller dans **"S3 Users"**
2. **Créer un utilisateur S3** :
   - Nom : `ksm-s3-user`
3. **Générer les credentials** :
   - **Access Key**
   - **Secret Key**
   - **⚠️ IMPORTANT : Noter ces clés !**

### **5.3 Configurer les permissions**

1. **Attacher l'utilisateur S3 au conteneur** `ksm-storage`
2. **Donner les permissions** : Read/Write

---

## 🔐 Phase 6 : Configuration du Firewall

### **6.1 Configurer le Security Group**

1. **Dans Public Cloud**, aller dans **"Network" → "Security Groups"**
2. **Créer un Security Group** : `ksm-firewall`
3. **Ajouter les règles** :

| Type | Protocole | Port | Source | Description |
|------|-----------|------|--------|-------------|
| SSH | TCP | 22 | Votre IP | Accès SSH |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS |

4. **Appliquer le Security Group à l'instance** :
   - Aller dans "Instances"
   - Cliquer sur votre instance
   - Onglet "Security Groups"
   - Ajouter `ksm-firewall`

### **6.2 OU Configurer UFW sur le serveur (plus tard)**

```bash
# Après connexion SSH
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🖥️ Phase 7 : Connexion SSH au Serveur

### **7.1 Se connecter au serveur**

**Sur Windows PowerShell :**

```powershell
# Se connecter
ssh ubuntu@<IP_DE_VOTRE_INSTANCE>

# Exemple :
ssh ubuntu@51.xxx.xxx.xxx
```

**Si vous utilisez une clé SSH :**

```powershell
ssh -i ~/.ssh/id_ed25519 ubuntu@<IP_DE_VOTRE_INSTANCE>
```

### **7.2 Première connexion**

- **Accepter** la clé de l'hôte (taper `yes`)
- Vous êtes maintenant connecté au serveur OVH !

---

## 📝 Checklist de Configuration OVH

### **Compte et Infrastructure**

- [ ] Compte OVH créé et validé
- [ ] Moyen de paiement ajouté
- [ ] Projet Public Cloud créé
- [ ] Instance créée (B2-7 minimum)
- [ ] IP de l'instance notée
- [ ] Clé SSH configurée

### **Base de Données**

- [ ] Managed Database PostgreSQL créée
- [ ] PostGIS activé
- [ ] Credentials de connexion notés
- [ ] IP de l'instance autorisée dans le firewall de la DB

### **Storage (Optionnel)**

- [ ] Bucket Object Storage créé
- [ ] Utilisateur S3 créé
- [ ] Access Key et Secret Key notés

### **Sécurité**

- [ ] Security Group configuré
- [ ] Règles firewall ajoutées (SSH, HTTP, HTTPS)
- [ ] Security Group appliqué à l'instance

### **Connexion**

- [ ] Connexion SSH testée
- [ ] Accès au serveur fonctionnel

---

## 🚀 Prochaines Étapes

Une fois l'infrastructure OVH configurée, vous pouvez :

1. **Installer les dépendances** (Nginx, PHP, Node.js, etc.)
2. **Déployer l'application** (Backend Laravel + Frontend React)
3. **Configurer Nginx** (reverse proxy)
4. **Installer SSL** (Let's Encrypt)
5. **Configurer les services** (Redis, cron, etc.)

**Voir le guide complet** : `GUIDE_HEBERGEMENT_OVHCLOUD.md`

---

## 💰 Estimation des Coûts OVH

### **Configuration de Base (Début)**

| Service | Configuration | Coût mensuel |
|---------|--------------|--------------|
| **Instance** | B2-7 (4 vCPU, 7GB RAM) | ~€15-20 |
| **Database** | PostgreSQL Starter (1GB) | ~€15 |
| **Object Storage** | 50GB | ~€5 |
| **Total** | | **~€35-40/mois** |

### **Configuration Production**

| Service | Configuration | Coût mensuel |
|---------|--------------|--------------|
| **Instance** | B2-15 (8 vCPU, 15GB RAM) | ~€30-40 |
| **Database** | PostgreSQL Business (4GB) | ~€30 |
| **Object Storage** | 250GB | ~€10 |
| **Load Balancer** | Standard | ~€15 |
| **Total** | | **~€85-95/mois** |

---

## 🆘 Support OVH

- **Documentation** : https://docs.ovh.com/fr/public-cloud/
- **Support technique** : Via le Manager OVH → Support
- **Communauté** : https://community.ovh.com/

---

## ✅ Résumé des Informations à Noter

**⚠️ IMPORTANT : Notez ces informations dans un endroit sûr !**

### **Instance**
- IP publique : `_________________`
- Nom : `_________________`
- Clé SSH : `_________________`

### **Base de Données**
- Host : `_________________`
- Port : `5432`
- Database : `ksm_db`
- User : `ksm_user`
- Password : `_________________`

### **Object Storage (si créé)**
- Bucket : `ksm-storage`
- Access Key : `_________________`
- Secret Key : `_________________`
- Endpoint : `https://s3.gra.io.cloud.ovh.net`

---

**Dernière mise à jour :** Janvier 2025

