# 🔧 CORRECTIONS COMMUNICATIONS - PLAN D'ACTION

**Date**: 5 Mars 2026  
**Priorité**: HAUTE

---

## 🚨 **INCOHÉRENCES ENDPOINTS IDENTIFIÉES**

### **1. LitigeDetailsPage.tsx**

**Problème** : Endpoints frontend ≠ backend

**Frontend actuel** :
```typescript
// INCORRECT
apiService.get(`/litiges/${id}`)               // ❌
apiService.get(`/litiges/${id}/messages`)      // ❌
apiService.post(`/litiges/${id}/messages`)     // ❌
apiService.post(`/litiges/${id}/escalader`)    // ❌
apiService.post(`/litiges/${id}/fermer`)       // ❌
```

**Backend réel** :
```python
GET    /api/litiges/litiges/{id}/              ✅
POST   /api/litiges/litiges/{id}/ajouter_message/  ✅
POST   /api/litiges/litiges/{id}/fermer/           ✅
POST   /api/litiges/litiges/{id}/resoudre/         ✅
# Pas d'action escalader
```

**Corrections nécessaires** :
```typescript
// CORRECT
apiService.get(`/litiges/litiges/${id}/`)
apiService.post(`/litiges/litiges/${id}/ajouter_message/`, { message })
apiService.post(`/litiges/litiges/${id}/fermer/`)
apiService.post(`/litiges/litiges/${id}/resoudre/`)
```

---

### **2. MesLitigesPage.tsx**

**Frontend actuel** :
```typescript
apiService.get('/litiges/mes-litiges')  // ⚠️ À vérifier
```

**Backend** :
```python
GET /api/litiges/litiges/?user=current  # Filtre côté backend
```

**Action** : Vérifier si endpoint `/mes-litiges` existe ou utiliser filtre

---

### **3. admin/DisputesPage.tsx**

**Problème** : Méthode inexistante

**Frontend actuel** :
```typescript
apiService.getDisputes(params)  // ❌ N'EXISTE PAS
```

**Correction** :
```typescript
apiService.get('/litiges/litiges/', { params })  // ✅
```

---

### **4. MesTicketsPage.tsx**

**Frontend actuel** :
```typescript
apiService.get('/user/tickets')                    // ⚠️
apiService.downloadFile(`/tickets/${id}/download/`) // ⚠️
```

**Question** : Ces endpoints existent côté backend ?

**À vérifier** :
- Endpoint tickets de réservation vs tickets support
- Confusion possible entre QR codes et tickets support

---

## 📋 **CORRECTIONS À APPLIQUER**

### **Priorité 1 : LitigeDetailsPage.tsx**
```typescript
// Dans chargerDetailsLitige()
const [litigeResponse, messagesResponse] = await Promise.all([
  apiService.get(`/litiges/litiges/${id}/`),  // CORRIGER
  // Messages inclus dans la réponse litige
]);

// Les messages sont dans litigeData.messages
setMessages(litigeData.messages || []);

// Dans envoyerMessage()
await apiService.post(`/litiges/litiges/${id}/ajouter_message/`, {
  message: newMessage.trim()
});

// Dans fermerLitige()
await apiService.post(`/litiges/litiges/${id}/fermer/`);

// Supprimer escaladerLitige() ou créer action backend
```

### **Priorité 2 : admin/DisputesPage.tsx**
```typescript
// Dans fetchDisputes()
const { data, meta } = await apiService.get('/litiges/litiges/', { 
  params: {
    page: currentPage,
    per_page: 15,
    search: search || undefined,
    statut: statusFilter || undefined
  }
});

if (data?.results) {
  setDisputes(data.results);
  setTotalPages(data.last_page || 1);
} else if (Array.isArray(data)) {
  setDisputes(data);
}
```

### **Priorité 3 : Créer actions admin**

**Ajouter dans DisputesPage** :
```typescript
const assignerLitige = async (litigeId: number, adminId: number) => {
  const { data, meta } = await apiService.post(
    `/litiges/litiges/${litigeId}/assigner/`,
    { admin_id: adminId }
  );
  if (meta.success) {
    toast.success('Litige assigné');
    fetchDisputes();
  }
};

const resoudreLitige = async (litigeId: number, resolution: string) => {
  const { data, meta } = await apiService.post(
    `/litiges/litiges/${litigeId}/resoudre/`,
    { resolution }
  );
  if (meta.success) {
    toast.success('Litige résolu');
    fetchDisputes();
  }
};
```

---

## 🔄 **CLARIFICATION TICKETS vs LITIGES**

### **Système actuel** :
1. **Tickets Support** (TicketSupport model) - Questions générales
2. **Litiges** (Litige model) - Problèmes réservations/paiements
3. **QR Codes** (Reservation.qr_code_token) - Validation réservation

### **Recommandation** :
- **Fusionner Tickets Support → Litiges** avec type "support"
- **Garder QR Codes** dans réservations (différent)
- **MesTicketsPage** → Afficher QR codes des réservations

---

## 🎯 **PLAN D'EXÉCUTION**

### **Étape 1 : Corrections urgentes** (30min)
1. Corriger LitigeDetailsPage endpoints
2. Corriger admin/DisputesPage endpoint
3. Tester litiges end-to-end

### **Étape 2 : Améliorer fonctionnalités** (1h)
1. Ajouter actions admin (assigner, résoudre)
2. Créer page gestionnaire litiges
3. Améliorer affichage messages

### **Étape 3 : Clarifier tickets** (30min)
1. Décider fusion tickets support
2. Renommer MesTicketsPage → MesQRCodesPage
3. Créer vraie page support si nécessaire

### **Étape 4 : Tests** (30min)
1. Test client crée litige
2. Test gestionnaire répond
3. Test admin assigne et résout
4. Test notifications

---

## 📊 **BACKEND ACTIONS MANQUANTES**

### **À créer ou vérifier** :
```python
# apps/litiges/views.py

@action(detail=True, methods=['post'])
def escalader(self, request, pk=None):
    """Escalader vers niveau supérieur"""
    litige = self.get_object()
    
    if litige.niveau_escalade == 'client':
        litige.niveau_escalade = 'gestionnaire'
    elif litige.niveau_escalade == 'gestionnaire':
        litige.niveau_escalade = 'admin'
    
    litige.statut = 'escalade'
    litige.save()
    
    return Response({'message': 'Litige escaladé'})
```

---

## ✅ **CHECKLIST FINALE**

### **Frontend**
- [ ] LitigeDetailsPage endpoints corrigés
- [ ] admin/DisputesPage endpoint corrigé
- [ ] Actions admin implémentées
- [ ] Page gestionnaire litiges créée
- [ ] MesTicketsPage clarifiée

### **Backend**  
- [x] Modèles litiges créés
- [x] Endpoints CRUD fonctionnels
- [ ] Action escalader ajoutée
- [ ] Permissions vérifiées
- [ ] Tests unitaires

### **Tests**
- [ ] Client → Gestionnaire → Admin
- [ ] Upload pièces jointes
- [ ] Notifications créées
- [ ] Permissions respectées

---

**Prochaine action** : Appliquer corrections LitigeDetailsPage et DisputesPage
