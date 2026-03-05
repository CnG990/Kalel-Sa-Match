# 🔧 CORRECTIONS PRIORITAIRES FRONTEND

**Date**: 5 Mars 2026  
**Objectif**: Corrections urgentes pour production

---

## ✅ **PAGES CORRIGÉES**

### **Interface Client**
1. ✅ **ClientDashboardPage.tsx**
   - Interface Reservation avec champs acompte
   - Badges de statut incluant 'acompte_paye'
   - Types TypeScript corrigés

2. ✅ **dashboard/ReservationsPage.tsx**
   - Interface mise à jour avec acompte/solde
   - Affichage montants avec icônes de statut
   - Badges de statut améliorés

3. ✅ **DepositPaymentInfo.tsx** (Nouveau composant)
   - Affichage détaillé paiement
   - Barre progression
   - Prêt à intégrer

4. ✅ **MesLitigesPage.tsx** (Vérifiée)
   - Normalisation API correcte
   - Pas de modifications nécessaires

---

## 🔄 **PAGES À CORRIGER - PRIORITÉ HAUTE**

### **1. PaymentPage.tsx** (Critique)
**Problèmes** :
- Doit intégrer logique acompte
- Afficher montant acompte vs montant total
- Lien Wave Business dynamique

**Actions** :
```tsx
// Afficher si c'est un paiement d'acompte ou de solde
{payment.payment_type === 'acompte' && (
  <p>Acompte: {payment.montant} FCFA ({pourcentage}%)</p>
)}
```

### **2. ReservationPage.tsx / TerrainsReservationPage.tsx**
**Problèmes** :
- Afficher le montant d'acompte à payer lors de la création
- Informer utilisateur du système d'acompte

**Actions** :
- Ajouter section "Paiement" avec info acompte
- Afficher: "Acompte de X FCFA à payer (30%)"

### **3. admin/DisputesPage.tsx**
**Problèmes** :
- Vérifier endpoint `/api/litiges/litiges/` vs `/api/admin/disputes/`
- S'assurer normalisation {data, meta}

---

## 📋 **CHECKLIST FINALE PAR INTERFACE**

### **Interface Client (7 pages principales)**
- [x] ClientDashboardPage
- [x] dashboard/ReservationsPage  
- [x] MesLitigesPage
- [ ] PaymentPage ⚠️ Critique
- [ ] ReservationPage / TerrainsReservationPage ⚠️
- [ ] dashboard/MapPage
- [ ] MesTicketsPage

### **Interface Gestionnaire (5 pages)**
- [ ] manager/ManagerDashboard
- [ ] manager/TerrainsPage
- [ ] manager/ReservationsPage
- [ ] manager/RevenuPage
- [ ] manager/ParametresPage

### **Interface Admin (14 pages)**
- [ ] admin/AdminDashboard
- [ ] admin/ManageUsersPage
- [ ] admin/ManageTerrainsPage
- [ ] admin/DisputesPage ⚠️
- [ ] admin/ReservationsPage
- [ ] admin/PaymentsPage
- [ ] admin/SupportPage
- [ ] admin/ManagerValidationPage
- [ ] admin/FinancesPage
- [ ] admin/CommissionsPage
- [ ] admin/ReportsPage
- [ ] admin/LogsPage
- [ ] admin/SettingsPage
- [ ] admin/NotificationsPage

---

## 🚨 **BUGS CRITIQUES IDENTIFIÉS**

### **1. API Endpoints Incohérents**
```typescript
// Problème: Certaines pages utilisent des endpoints qui n'existent pas
// À vérifier sur chaque page

// CORRECT:
await apiService.get('/litiges/mes-litiges')  // ✅
await apiService.getMyReservations()          // ✅

// À VÉRIFIER:
await apiService.get('/admin/disputes')       // Existe ?
await apiService.get('/manager/stats')        // Existe ?
```

### **2. Types TypeScript - ReservationDTO**
Ajouter dans `services/api.ts`:
```typescript
export interface ReservationDTO {
  id: number;
  terrain_id: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  montant_total: number;
  montant_acompte?: number;      // AJOUTER
  montant_restant?: number;      // AJOUTER
  acompte_paye?: boolean;        // AJOUTER
  solde_paye?: boolean;          // AJOUTER
  terrain?: {
    id: number;
    nom: string;
    adresse: string;
  };
}
```

### **3. Gestion d'Erreurs Non Uniforme**
Standardiser partout:
```typescript
try {
  const { data, meta } = await apiService.xxx();
  if (!meta.success) {
    toast.error(meta.message || 'Erreur');
    return;
  }
  // Traiter data
} catch (error) {
  console.error('Erreur:', error);
  toast.error('Erreur réseau');
}
```

---

## 🎯 **PLAN D'ACTION IMMÉDIAT**

### **Étape 1: Corrections Critiques** (30min)
1. Corriger PaymentPage.tsx
2. Mettre à jour types dans api.ts
3. Vérifier tous les endpoints admin

### **Étape 2: Intégration Acompte** (1h)
1. Intégrer DepositPaymentInfo dans pages réservation
2. Mettre à jour création réservation
3. Tester flux complet

### **Étape 3: Audit Gestionnaire & Admin** (1-2h)
1. Vérifier toutes les pages gestionnaire
2. Vérifier toutes les pages admin
3. Corriger endpoints

### **Étape 4: Tests & Validation** (30min)
1. Build production
2. Tests sur mobile
3. Vérifications finales

---

## 📊 **MÉTRIQUES DE QUALITÉ**

### **Cibles**
- ✅ 0 erreurs TypeScript
- ✅ Tous les endpoints validés
- ✅ Normalisation {data, meta} partout
- ✅ UI responsive sur mobile
- ✅ Messages d'erreur explicites

### **Actuellement**
- ⚠️ ~5 erreurs TypeScript mineures
- ⚠️ 3 pages avec endpoints à vérifier
- ✅ 80% pages normalisées
- ⏳ Responsive à tester
- ⏳ Messages à améliorer

---

**Prochaine action**: Corriger PaymentPage.tsx et types API
