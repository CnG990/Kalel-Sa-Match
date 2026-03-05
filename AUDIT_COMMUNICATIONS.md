# 🔍 AUDIT DES COMMUNICATIONS UTILISATEURS

**Date**: 5 Mars 2026  
**Objectif**: Vérifier toutes les fonctionnalités de communication entre Client, Gestionnaire et Admin

---

## 📊 **SYSTÈMES DE COMMUNICATION**

### **1. LITIGES (Disputes)**
**Type**: Communication tripartite (Client ↔ Gestionnaire ↔ Admin)

**Backend** :
- ✅ App `litiges` créée et déployée
- ✅ Modèles `Litige` et `MessageLitige`
- ✅ Endpoints `/api/litiges/litiges/`
- ✅ Actions: créer, ajouter message, résoudre, fermer, assigner

**Frontend** :
- ✅ `MesLitigesPage.tsx` (Client)
- ✅ `LitigeDetailsPage.tsx` (Client)
- ⏳ `admin/DisputesPage.tsx` (Admin) - Endpoint à corriger
- ⏳ Page gestionnaire litiges - À vérifier

**Flux** :
1. Client crée un litige sur une réservation
2. Gestionnaire reçoit notification et peut répondre
3. Si non résolu, escalade vers admin
4. Admin peut résoudre et fermer

### **2. TICKETS SUPPORT**
**Type**: Communication Client → Support/Admin

**Backend** :
- ⏳ Modèle `TicketSupport` dans `terrains/models.py`
- ⏳ Endpoints à vérifier
- ⏳ Migration vers système Litiges ?

**Frontend** :
- ✅ `MesTicketsPage.tsx` (Client)
- ⏳ Admin support page - À vérifier

**Flux** :
1. Client crée un ticket
2. Admin/Support répond
3. Ticket résolu/fermé

### **3. NOTIFICATIONS**
**Type**: Alertes système pour tous les utilisateurs

**Backend** :
- ⏳ Modèle `Notification` dans `terrains/models.py`
- ⏳ Endpoints notifications
- ⏳ Système temps réel ?

**Frontend** :
- ⏳ Composant NotificationCenter
- ⏳ Badges de notification
- ⏳ Popup temps réel

**Types de notifications** :
- Nouvelle réservation (→ Gestionnaire)
- Paiement reçu (→ Gestionnaire)
- Réservation confirmée (→ Client)
- Litige créé (→ Gestionnaire/Admin)
- Réponse à litige (→ Tous concernés)
- Validation gestionnaire (→ Gestionnaire)

---

## 🔍 **VÉRIFICATION DÉTAILLÉE**

### **✅ Backend Litiges - FONCTIONNEL**

#### **Modèles**
```python
# apps/litiges/models.py
class Litige:
  - client (FK User)
  - gestionnaire (FK User, nullable)
  - admin_assigne (FK User, nullable)
  - reservation (FK Reservation, nullable)
  - terrain (FK Terrain, nullable)
  - type_litige (choices)
  - sujet, description
  - priorite (faible, normale, elevee, urgente)
  - statut (nouveau, en_cours, resolu, ferme, escalade)
  - niveau_escalade (client, gestionnaire, admin)
  - resolution, date_resolution
  - pieces_jointes (JSON)

class MessageLitige:
  - litige (FK)
  - expediteur (FK User)
  - message
  - pieces_jointes (JSON)
  - lu_par_client, lu_par_gestionnaire, lu_par_admin
```

#### **Endpoints API**
```
GET    /api/litiges/litiges/              ✅ Liste
POST   /api/litiges/litiges/              ✅ Créer
GET    /api/litiges/litiges/{id}/         ✅ Détail
POST   /api/litiges/litiges/{id}/ajouter_message/  ✅ Message
POST   /api/litiges/litiges/{id}/resoudre/         ✅ Résoudre
POST   /api/litiges/litiges/{id}/fermer/           ✅ Fermer
POST   /api/litiges/litiges/{id}/assigner/         ✅ Assigner
```

#### **Permissions**
- ✅ Client: voir ses litiges, créer, ajouter messages
- ✅ Gestionnaire: voir litiges de ses terrains, répondre
- ✅ Admin: voir tous, assigner, résoudre, fermer

---

### **⏳ Frontend Litiges - À COMPLÉTER**

#### **MesLitigesPage.tsx** ✅
**Statut**: Fonctionnel
- Liste des litiges du client
- Filtres par statut et priorité
- Navigation vers détails
- Normalisation API {data, meta} ✅

#### **LitigeDetailsPage.tsx** ⏳
**À vérifier** :
- [ ] Affichage messages
- [ ] Formulaire réponse
- [ ] Upload pièces jointes
- [ ] Badges de statut
- [ ] Historique complet

#### **admin/DisputesPage.tsx** ⚠️
**Problèmes identifiés** :
- ❌ Utilise `apiService.getDisputes()` qui n'existe pas
- ❌ Doit utiliser `/api/litiges/litiges/` à la place
- ⏳ Pagination à vérifier
- ⏳ Actions admin (assigner, résoudre) à implémenter

**Corrections nécessaires** :
```typescript
// AVANT (incorrect)
const response = await apiService.getDisputes(params);

// APRÈS (correct)
const { data, meta } = await apiService.get('/litiges/litiges/', { params });
```

#### **manager/DisputesPage.tsx** ❓
**Statut**: Page à créer ?
- [ ] Liste litiges des terrains du gestionnaire
- [ ] Répondre aux litiges
- [ ] Escalader vers admin

---

### **⏳ Tickets Support - À AUDITER**

#### **Backend**
```python
# apps/terrains/models.py
class TicketSupport:
  user, terrain, type_ticket, statut, sujet, description
  
class ReponseTicket:
  ticket, auteur, reponse
```

**Questions** :
- ❓ Endpoints support créés ?
- ❓ Migration vers app litiges ?
- ❓ Distinction tickets vs litiges ?

#### **Frontend**
**MesTicketsPage.tsx** - À auditer
- [ ] Endpoint utilisé ?
- [ ] Création ticket
- [ ] Affichage réponses
- [ ] Normalisation API

---

### **⏳ Notifications - À AUDITER**

#### **Backend**
```python
# apps/terrains/models.py  
class Notification:
  user, type_notification, titre, message, lu, lien
```

**Questions** :
- ❓ Endpoints notifications ?
- ❓ Création automatique ?
- ❓ Marquage comme lu ?
- ❓ WebSocket temps réel ?

#### **Frontend**
**Composants** :
- [ ] NotificationCenter.tsx
- [ ] Badge non lues
- [ ] Liste notifications
- [ ] Marquage lu/non lu

---

## 📋 **CHECKLIST COMMUNICATIONS**

### **Litiges**
- [x] Modèles backend créés
- [x] Endpoints API fonctionnels
- [x] Permissions par rôle
- [x] Page client fonctionnelle
- [ ] Page détails complète
- [ ] Page admin corrigée (endpoint)
- [ ] Page gestionnaire créée
- [ ] Tests end-to-end

### **Tickets Support**
- [x] Modèles backend existants
- [ ] Endpoints vérifiés
- [ ] Page client auditée
- [ ] Page admin vérifiée
- [ ] Clarifier vs Litiges

### **Notifications**
- [x] Modèle backend existant
- [ ] Endpoints créés
- [ ] Composant frontend
- [ ] Création automatique
- [ ] Temps réel (optionnel)

---

## 🐛 **PROBLÈMES IDENTIFIÉS**

### **Critiques**
1. ❌ **admin/DisputesPage** - Endpoint `getDisputes()` n'existe pas
2. ⚠️ **Gestionnaire litiges** - Pas d'interface dédiée
3. ⚠️ **Tickets vs Litiges** - Duplication système ?

### **Majeurs**
4. 🔧 **Notifications** - Pas d'implémentation frontend visible
5. 🔧 **Upload fichiers** - Pièces jointes litiges non testées
6. 🔧 **Temps réel** - Pas de WebSocket pour notifs instantanées

### **Mineurs**
7. 📝 **Marquage lu** - Messages litiges lus par qui ?
8. 📝 **Historique** - Traçabilité actions litiges
9. 📝 **Email notifs** - Notifications par email ?

---

## 🚀 **PLAN D'ACTION**

### **Phase 1: Corriger Litiges** (1-2h)
1. ✅ Backend fonctionnel
2. Corriger `admin/DisputesPage.tsx` endpoint
3. Créer `manager/DisputesPage.tsx`
4. Compléter `LitigeDetailsPage.tsx`

### **Phase 2: Clarifier Tickets** (30min)
1. Auditer `MesTicketsPage.tsx`
2. Vérifier endpoints support
3. Décider: fusionner avec litiges ou garder séparé

### **Phase 3: Implémenter Notifications** (1-2h)
1. Créer endpoints notifications
2. Créer composant NotificationCenter
3. Intégrer dans layout
4. Tests

### **Phase 4: Tests Communications** (1h)
1. Créer litige client → gestionnaire répond → admin résout
2. Créer ticket → admin répond
3. Vérifier notifications
4. Tests permissions

---

## 📊 **MATRICE DE COMMUNICATION**

| Action | Client | Gestionnaire | Admin |
|--------|--------|--------------|-------|
| Créer litige réservation | ✅ | ❌ | ❌ |
| Répondre à litige | ✅ | ✅ | ✅ |
| Escalader litige | ✅ | ✅ | ❌ |
| Assigner litige | ❌ | ❌ | ✅ |
| Résoudre litige | ❌ | ✅ | ✅ |
| Fermer litige | ❌ | ❌ | ✅ |
| Créer ticket support | ✅ | ❌ | ❌ |
| Répondre ticket | ❌ | ❌ | ✅ |
| Recevoir notification | ✅ | ✅ | ✅ |

---

**Prochaine étape**: Auditer LitigeDetailsPage et corriger DisputesPage
