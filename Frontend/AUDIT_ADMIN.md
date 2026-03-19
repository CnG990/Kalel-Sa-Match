# 🔍 AUDIT INTERFACE ADMIN

**Date**: 5 Mars 2026  
**Pages**: 20 fichiers admin/

---

## 📋 **INVENTAIRE PAGES ADMIN**

### **Core Pages** (8)
1. ⏳ AdminLayout.tsx - Layout principal
2. ✅ AdminDashboard.tsx - Dashboard stats (vérifié)
3. ⏳ ManageUsersPage.tsx - Gestion utilisateurs
4. ⏳ ManageTerrainsPage.tsx - Gestion terrains
5. ⚠️ DisputesPage.tsx - Litiges (endpoint à corriger)
6. ⏳ ReservationsPage.tsx - Toutes réservations
7. ⏳ PaymentsPage.tsx - Tous paiements
8. ⏳ ManagerValidationPage.tsx - Validation gestionnaires

### **Support & Communication** (3)
9. ⏳ SupportPage.tsx - Tickets support
10. ⏳ NotificationsPage.tsx - Notifications
11. ⏳ SubscriptionsPage.tsx - Abonnements

### **Finances** (2)
12. ⏳ FinancesPage.tsx - Vue financière
13. ⏳ CommissionsPage.tsx - Commissions

### **Outils Admin** (5)
14. ⏳ ReportsPage.tsx - Rapports
15. ⏳ LogsPage.tsx - Logs système
16. ⏳ SettingsPage.tsx - Paramètres
17. ⏳ GeoImportPage.tsx - Import données géo
18. ⏳ TerrainsList.tsx - Liste terrains

### **Modals/Utilitaires** (2)
19. ⏳ AddTerrainOnSiteModal.tsx - Ajout terrain modal
20. ⏳ AjouterTerrainMobile.tsx - Ajout mobile

---

## 🔍 **AUDIT DÉTAILLÉ PAR PAGE**

### **1. AdminDashboard.tsx** ✅ 90%

**Endpoint** :
```typescript
const { data } = await apiService.get('/admin/dashboard-stats/');
```

**Status** : ✅ Testé et fonctionnel

**Données retournées** :
```json
{
  "revenue": "0 FCFA",
  "newUsers": 4,
  "pendingManagers": 4,
  "pendingRefunds": 0,
  "openDisputes": 0,
  "totalReservations": 0,
  "totalTerrains": 17,
  "totalUsers": 15
}
```

**Manque** :
- [ ] Stats acomptes/soldes séparées
- [ ] Revenus en attente (acomptes non confirmés)
- [ ] Graphiques évolution

**Améliorations suggérées** :
```typescript
interface AdminDashboardStats {
  // Existant
  revenue: string;
  totalUsers: number;
  totalTerrains: number;
  totalReservations: number;
  
  // AJOUTER
  acomptes_recus: number;
  soldes_recus: number;
  acomptes_en_attente: number;
  reservations_acompte_paye: number;
  taux_conversion_acompte: number; // %
  
  // Par période
  revenus_mois: number;
  revenus_semaine: number;
  reservations_mois: number;
}
```

---

### **2. ManageUsersPage.tsx** ⏳ 50%

**Endpoints attendus** :
```typescript
// Liste utilisateurs
apiService.get('/admin/users/', { params: { role, search, page }})

// Actions
apiService.put('/admin/users/{id}/', { data })
apiService.delete('/admin/users/{id}/')
apiService.post('/admin/users/{id}/toggle-active/')
```

**Fonctionnalités requises** :
- [ ] Liste tous utilisateurs (clients, gestionnaires, admins)
- [ ] Filtre par rôle
- [ ] Recherche nom/email
- [ ] Pagination
- [ ] Modifier utilisateur
- [ ] Activer/désactiver compte
- [ ] Voir historique activité
- [ ] Créer nouvel utilisateur

**Problèmes potentiels** :
- Endpoint existe ? À vérifier
- Permissions modification
- Sécurité suppression

---

### **3. ManageTerrainsPage.tsx** ⏳ 40%

**Endpoints** :
```typescript
// Liste tous terrains
apiService.get('/terrains/terrains/')

// Actions admin
apiService.put('/terrains/terrains/{id}/')
apiService.delete('/terrains/terrains/{id}/')
apiService.post('/terrains/terrains/{id}/toggle-active/')
```

**Fonctionnalités** :
- [ ] Liste tous terrains (tous gestionnaires)
- [ ] Modifier terrain (y compris config acompte)
- [ ] Désactiver terrain
- [ ] Statistiques par terrain
- [ ] Filtres : gestionnaire, ville, statut
- [ ] Voir réservations du terrain

**Config acompte visible** :
```tsx
<div className="terrain-card">
  <h3>{terrain.nom}</h3>
  <p>Gestionnaire: {terrain.gestionnaire_nom}</p>
  <p>Acompte: {terrain.type_acompte === 'pourcentage' 
    ? `${terrain.pourcentage_acompte}%` 
    : `${terrain.montant_acompte_fixe} FCFA fixe`
  }</p>
  <button onClick={() => editTerrain(terrain.id)}>Modifier</button>
</div>
```

---

### **4. DisputesPage.tsx** ⚠️ 60% - CORRECTION REQUISE

**Problème identifié** :
```typescript
// INCORRECT
const response = await apiService.getDisputes(params);

// CORRECT
const { data, meta } = await apiService.get('/litiges/litiges/', { params });
```

**Fonctionnalités** :
- [ ] Liste tous litiges (tous terrains/utilisateurs)
- [ ] Filtres : statut, priorité, type, gestionnaire
- [ ] Assigner litige à admin
- [ ] Résoudre litige
- [ ] Fermer litige
- [ ] Voir historique messages
- [ ] Statistiques litiges

**Actions admin** :
```typescript
const assignerLitige = async (litigeId: number, adminId: number) => {
  await apiService.post(`/litiges/litiges/${litigeId}/assigner/`, {
    admin_id: adminId
  });
};

const resoudreLitige = async (litigeId: number, resolution: string) => {
  await apiService.post(`/litiges/litiges/${litigeId}/resoudre/`, {
    resolution
  });
};
```

**UI Nécessaire** :
- Dropdown sélection admin
- Formulaire résolution
- Badge priorité
- Filtres avancés

---

### **5. ReservationsPage.tsx** ⏳ 50%

**Endpoint** :
```typescript
apiService.get('/reservations/', { params: {
  statut, terrain_id, user_id, date_debut, date_fin, page
}})
```

**Données à afficher** :
```typescript
interface AdminReservation {
  id: number;
  terrain_nom: string;
  user_nom: string;
  date_debut: string;
  montant_total: number;
  montant_acompte: number;
  montant_restant: number;
  acompte_paye: boolean;
  solde_paye: boolean;
  statut: string;
  paiement_acompte?: Payment;
  paiement_solde?: Payment;
}
```

**Colonnes table** :
```tsx
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Client</th>
      <th>Terrain</th>
      <th>Date</th>
      <th>Total</th>
      <th>Acompte</th>
      <th>Solde</th>
      <th>Statut</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {reservations.map(r => (
      <tr key={r.id}>
        <td>{r.id}</td>
        <td>{r.user_nom}</td>
        <td>{r.terrain_nom}</td>
        <td>{formatDate(r.date_debut)}</td>
        <td>{r.montant_total} FCFA</td>
        <td>{r.acompte_paye ? '✓' : '⏳'} {r.montant_acompte} FCFA</td>
        <td>{r.solde_paye ? '✓' : '⏳'} {r.montant_restant} FCFA</td>
        <td><Badge statut={r.statut} /></td>
        <td>
          <button onClick={() => viewDetails(r.id)}>Détails</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Filtres** :
- Par statut (incluant acompte_paye)
- Par terrain
- Par date
- Par gestionnaire
- Acompte payé oui/non
- Solde payé oui/non

---

### **6. PaymentsPage.tsx** ⏳ 40%

**Endpoint** :
```typescript
apiService.get('/payments/', { params: {
  methode, statut, reservation_id, date_debut, date_fin
}})
```

**Données paiements** :
```typescript
interface AdminPayment {
  id: number;
  reference: string;
  montant: number;
  methode: 'wave' | 'orange_money';
  payment_type: 'acompte' | 'solde' | 'total';
  statut: 'en_attente' | 'complete' | 'echoue';
  reservation_id?: number;
  reservation?: {
    terrain_nom: string;
    user_nom: string;
  };
  customer_name: string;
  customer_phone: string;
  created_at: string;
}
```

**Vue nécessaire** :
- [ ] Liste tous paiements
- [ ] Filtres par type (acompte/solde)
- [ ] Filtres par méthode
- [ ] Filtres par statut
- [ ] Export CSV
- [ ] Détails paiement
- [ ] Webhook logs

**Statistiques paiements** :
```tsx
<div className="stats">
  <StatCard 
    title="Acomptes reçus"
    value={formatMoney(stats.acomptes_recus)}
    subtitle="Ce mois"
  />
  <StatCard 
    title="Soldes reçus"
    value={formatMoney(stats.soldes_recus)}
  />
  <StatCard 
    title="En attente"
    value={formatMoney(stats.en_attente)}
  />
</div>
```

---

### **7. ManagerValidationPage.tsx** ⏳ 50%

**Endpoint** :
```typescript
apiService.get('/admin/pending-managers/')
apiService.post('/admin/managers/{id}/approve/')
apiService.post('/admin/managers/{id}/reject/', { reason })
```

**Workflow** :
1. Gestionnaire s'inscrit
2. Admin reçoit notification
3. Admin voit profil complet
4. Admin approuve ou rejette
5. Gestionnaire reçoit email

**UI Validation** :
```tsx
<div className="manager-card">
  <h3>{manager.nom} {manager.prenom}</h3>
  <p>Email: {manager.email}</p>
  <p>Tél: {manager.telephone}</p>
  <p>Date inscription: {formatDate(manager.created_at)}</p>
  
  <div className="documents">
    {manager.documents && manager.documents.map(doc => (
      <a href={doc.url} download>{doc.nom}</a>
    ))}
  </div>
  
  <div className="actions">
    <button onClick={() => approve(manager.id)} className="btn-success">
      Approuver
    </button>
    <button onClick={() => setRejectModal(manager.id)} className="btn-danger">
      Rejeter
    </button>
  </div>
</div>
```

---

### **8. SupportPage.tsx** ⏳ 30%

**Confusion tickets support vs litiges** ⚠️

**Clarification requise** :
- Tickets support = Questions générales système
- Litiges = Problèmes réservations/paiements spécifiques

**Si séparés** :
```typescript
// Tickets support
apiService.get('/support/tickets/')
apiService.post('/support/tickets/{id}/reply/', { message })
apiService.post('/support/tickets/{id}/close/')
```

**Si fusionnés avec litiges** :
- Utiliser `/litiges/litiges/` avec `type_litige='support'`
- Rediriger vers DisputesPage

---

### **9. FinancesPage.tsx** ⏳ 20%

**Vue financière complète** :

```typescript
interface FinanceStats {
  // Revenus
  revenus_total: number;
  revenus_mois_actuel: number;
  revenus_mois_precedent: number;
  
  // Acomptes/Soldes
  acomptes_recus_total: number;
  soldes_recus_total: number;
  acomptes_en_attente: number;
  
  // Par méthode
  revenus_wave: number;
  revenus_orange_money: number;
  
  // Commissions (si applicable)
  commissions_dues: number;
  commissions_payees: number;
  
  // Par gestionnaire
  revenus_par_gestionnaire: Array<{
    gestionnaire_id: number;
    gestionnaire_nom: string;
    revenus: number;
    nb_reservations: number;
    commission_due: number;
  }>;
}
```

**Graphiques** :
- [ ] Évolution revenus (line chart)
- [ ] Acomptes vs Soldes (bar chart)
- [ ] Répartition par méthode (pie chart)
- [ ] Top gestionnaires (bar chart)
- [ ] Taux conversion (gauge)

---

### **10. CommissionsPage.tsx** ⏳ 10%

**Si système de commissions** :

```typescript
interface Commission {
  gestionnaire_id: number;
  gestionnaire_nom: string;
  periode: string; // "2026-03"
  revenus_total: number;
  taux_commission: number; // %
  montant_commission: number;
  statut: 'calculee' | 'payee' | 'en_attente';
  date_paiement?: string;
}
```

**Fonctionnalités** :
- [ ] Calcul automatique commissions
- [ ] Historique paiements
- [ ] Marquer comme payée
- [ ] Export relevé
- [ ] Notifications gestionnaires

---

### **11. ReportsPage.tsx** ⏳ 0%

**Rapports à générer** :
- [ ] Rapport mensuel activité
- [ ] Rapport revenus période
- [ ] Rapport par gestionnaire
- [ ] Rapport paiements
- [ ] Rapport litiges
- [ ] Export PDF/CSV/Excel

**Filtres** :
- Date début/fin
- Gestionnaire
- Terrain
- Type rapport

---

### **12. LogsPage.tsx** ⏳ 0%

**Logs système** :
- [ ] Connexions utilisateurs
- [ ] Actions admin
- [ ] Erreurs système
- [ ] Webhooks paiement
- [ ] Modifications données
- [ ] Tentatives fraude

**Endpoint** :
```typescript
apiService.get('/admin/logs/', { params: {
  type, user_id, date_debut, date_fin, page
}})
```

---

### **13. SettingsPage.tsx** ⏳ 20%

**Paramètres système** :
- [ ] Configuration acompte globale (défaut)
- [ ] Méthodes paiement actives
- [ ] Taux commission
- [ ] Email notifications
- [ ] Maintenance mode
- [ ] Webhooks URLs
- [ ] API keys

---

### **14. NotificationsPage.tsx** ⏳ 0%

**Gestion notifications** :
- [ ] Templates email
- [ ] Templates SMS
- [ ] Règles notifications automatiques
- [ ] Historique envois
- [ ] Tests envoi

---

### **15-20. Autres pages** ⏳

- **GeoImportPage** : Import données géographiques terrains
- **TerrainsList** : Vue liste terrains (alternative)
- **SubscriptionsPage** : Gestion abonnements (si implémenté)
- **AddTerrainOnSiteModal** : Modal ajout terrain admin
- **AjouterTerrainMobile** : Version mobile

---

## 🐛 **PROBLÈMES CRITIQUES ADMIN**

### **🔴 Endpoints Manquants/Incorrects**

1. **DisputesPage** ❌
   ```typescript
   // AVANT
   apiService.getDisputes(params) // N'EXISTE PAS
   
   // APRÈS
   apiService.get('/litiges/litiges/', { params })
   ```

2. **Endpoints admin non créés** ❌
   - `/admin/users/` - Liste utilisateurs
   - `/admin/pending-managers/` - Gestionnaires en attente
   - `/admin/managers/{id}/approve/` - Approuver
   - `/admin/logs/` - Logs système
   - `/admin/finance-stats/` - Stats financières

3. **Permissions backend** ⚠️
   - Vérifier que seuls admins peuvent accéder
   - Logs des actions admin
   - Protection suppression données

### **🟠 Fonctionnalités Incomplètes**

4. **Stats acompte/solde** ⚠️
   - Dashboard ne sépare pas
   - Pas de vue revenus en attente
   - Graphiques manquants

5. **Validation gestionnaires** ⚠️
   - Workflow complet à tester
   - Emails notifications ?
   - Documents justificatifs ?

6. **Rapports et exports** ❌
   - Aucun rapport implémenté
   - Pas d'export données
   - Pas de génération PDF

### **🟢 UI/UX**

7. **Navigation** 📝
   - Menu admin à vérifier
   - Breadcrumbs
   - Raccourcis actions

8. **Responsive** 📝
   - Tables sur mobile
   - Graphiques adaptatifs

---

## 📋 **BACKEND ENDPOINTS À CRÉER**

### **Routes Admin** (django)

```python
# apps/admin_panel/views.py ou apps/accounts/views_admin.py

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """Liste tous les utilisateurs avec filtres"""
    role = request.GET.get('role')
    search = request.GET.get('search')
    
    users = User.objects.all()
    if role:
        users = users.filter(role=role)
    if search:
        users = users.filter(
            Q(email__icontains=search) |
            Q(nom__icontains=search) |
            Q(prenom__icontains=search)
        )
    
    paginator = Paginator(users, 20)
    page = request.GET.get('page', 1)
    users_page = paginator.get_page(page)
    
    serializer = UserSerializer(users_page, many=True)
    return api_success(data={
        'results': serializer.data,
        'count': paginator.count,
        'current_page': page,
        'last_page': paginator.num_pages
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_managers(request):
    """Gestionnaires en attente de validation"""
    managers = User.objects.filter(
        role='gestionnaire',
        statut_validation='en_attente'
    )
    serializer = UserSerializer(managers, many=True)
    return api_success(data=serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_manager(request, pk):
    """Approuver un gestionnaire"""
    manager = get_object_or_404(User, pk=pk, role='gestionnaire')
    manager.statut_validation = 'approuve'
    manager.save()
    
    # Envoyer email
    send_manager_approval_email(manager)
    
    # Log action
    AdminLog.objects.create(
        admin=request.user,
        action='approve_manager',
        target_user=manager
    )
    
    return api_success(message='Gestionnaire approuvé')

@api_view(['GET'])
@permission_classes([IsAdminUser])
def finance_stats(request):
    """Statistiques financières détaillées"""
    # ... calculs complexes
    return api_success(data=stats)
```

**URLs** :
```python
# ksm_backend/urls.py
path('api/admin/users/', admin_users_list),
path('api/admin/pending-managers/', pending_managers),
path('api/admin/managers/<int:pk>/approve/', approve_manager),
path('api/admin/managers/<int:pk>/reject/', reject_manager),
path('api/admin/finance-stats/', finance_stats),
path('api/admin/logs/', admin_logs),
```

---

## ✅ **ACTIONS REQUISES ADMIN**

### **Phase 1 : Corrections Critiques** (1-2h)

1. **Corriger DisputesPage endpoint**
   - Remplacer `getDisputes()` 
   - Utiliser `/litiges/litiges/`
   - Tester filtres

2. **Créer endpoints admin backend**
   - Users list
   - Pending managers
   - Approve/reject
   - Finance stats

3. **Tester permissions**
   - Seuls admins accèdent
   - Logs actions critiques

### **Phase 2 : Compléter Fonctionnalités** (3-4h)

1. **Dashboard admin**
   - Ajouter stats acomptes/soldes
   - Graphiques revenus
   - Alertes importantes

2. **Gestion utilisateurs**
   - Page complète
   - Actions modification
   - Historique activité

3. **Validation gestionnaires**
   - Workflow complet
   - Emails automatiques
   - Documents justificatifs

4. **Réservations & Paiements**
   - Affichage acompte/solde
   - Filtres avancés
   - Export données

### **Phase 3 : Rapports & Outils** (2-3h)

1. **Reports page**
   - Génération rapports
   - Export PDF/CSV
   - Filtres période

2. **Finance page**
   - Vue complète revenus
   - Graphiques
   - Commissions

3. **Logs système**
   - Historique actions
   - Monitoring
   - Alertes erreurs

---

## 📊 **ÉTAT ACTUEL ADMIN**

```
AdminLayout           ✅ 100%
AdminDashboard        ✅ 90% (stats acompte à ajouter)
ManageUsersPage       ⚠️ 50% (endpoint manquant)
ManageTerrainsPage    ⚠️ 40% (config acompte à afficher)
DisputesPage          ⚠️ 60% (endpoint à corriger)
ReservationsPage      ⚠️ 50% (acompte/solde à afficher)
PaymentsPage          ⚠️ 40% (filtres acompte/solde)
ManagerValidationPage ⚠️ 50% (workflow à tester)
SupportPage           ⏳ 30% (clarifier vs litiges)
FinancesPage          🔴 20% (quasi non implémenté)
CommissionsPage       🔴 10% (si applicable)
ReportsPage           ❌ 0% (non implémenté)
LogsPage              ❌ 0% (non implémenté)
SettingsPage          ⏳ 20% (basique)
NotificationsPage     ❌ 0% (non implémenté)
```

**Moyenne** : ~35% fonctionnel

---

**Prochaine étape** : Créer rapport final audit complet Client + Gestionnaire + Admin avec plan d'action global
