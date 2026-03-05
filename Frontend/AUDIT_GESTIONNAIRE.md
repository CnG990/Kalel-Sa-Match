# 🔍 AUDIT INTERFACE GESTIONNAIRE

**Date**: 5 Mars 2026  
**Pages**: 10 fichiers manager/

---

## 📋 **INVENTAIRE PAGES GESTIONNAIRE**

1. ✅ ManagerLayout.tsx - Layout principal
2. ⏳ ManagerDashboard.tsx - Dashboard stats
3. ⏳ TerrainsPage.tsx - Liste terrains
4. ⏳ AddTerrainPage.tsx - Ajout terrain
5. ⏳ ReservationsPage.tsx - Réservations terrains
6. ⏳ RevenuePage.tsx - Revenus et stats
7. ⏳ QrScannerPage.tsx - Scanner QR codes
8. ⏳ PromotionsPage.tsx - Gestion promos
9. ⏳ ProfilePage.tsx - Profil gestionnaire
10. ⏳ SettingsPage.tsx - Paramètres

---

## 🔍 **AUDIT DÉTAILLÉ**

### **1. ManagerDashboard.tsx** ⚠️

**Endpoint utilisé** :
```typescript
const { data } = await apiService.getManagerStats();
```

**Questions** :
- ❓ Endpoint `getManagerStats()` existe dans api.ts ?
- ❓ Backend a route `/api/manager/stats/` ?
- ❓ DTO `ManagerDashboardStatsDTO` complet ?

**Structure attendue** :
```typescript
interface ManagerDashboardStatsDTO {
  total_terrains: number;
  total_reservations?: number;
  revenus_total?: number;
  reservations_en_attente?: number;
  // ...autres stats
}
```

**Problèmes potentiels** :
- Pas de gestion si endpoint n'existe pas
- Pas d'affichage revenus avec acompte
- Pas de stats litiges terrains

**UI/UX** : ✅ Bon
- Loading state présent
- Empty state si pas de terrains
- Cards statistiques claires

---

### **2. TerrainsPage.tsx** ⏳

**À vérifier** :
```typescript
// Endpoints probables
apiService.getMyTerrains()
apiService.createTerrain()
apiService.updateTerrain(id)
apiService.deleteTerrain(id)
```

**Doit inclure** :
- [ ] Configuration acompte par terrain
- [ ] Champs type_acompte, pourcentage_acompte, montant_acompte_fixe
- [ ] Liens paiement Wave/Orange Money
- [ ] Horaires et équipements
- [ ] Images multiples

**Checklist fonctionnalités** :
- [ ] Création terrain avec tous champs
- [ ] Modification terrain
- [ ] Désactivation terrain
- [ ] Upload images
- [ ] Configuration acompte UI

---

### **3. ReservationsPage.tsx** ⏳

**Endpoints attendus** :
```typescript
// Réservations des terrains du gestionnaire
apiService.getManagerReservations()
// Ou avec filtre
apiService.get('/reservations/', { params: { manager: true }})
```

**Doit afficher** :
- [ ] Liste réservations tous terrains du gestionnaire
- [ ] Statuts incluant 'acompte_paye'
- [ ] Montants acompte/solde
- [ ] Filtre par terrain
- [ ] Filtre par statut
- [ ] Validation QR codes

**Actions requises** :
- [ ] Valider réservation
- [ ] Annuler réservation
- [ ] Voir détails paiement
- [ ] Scanner QR code
- [ ] Exporter liste

---

### **4. RevenuePage.tsx** ⏳

**Données requises** :
```typescript
interface RevenueStats {
  revenus_total: number;
  revenus_mois: number;
  revenus_semaine: number;
  acomptes_recus: number;
  soldes_recus: number;
  paiements_en_attente: number;
  // Par terrain
  revenus_par_terrain: Array<{
    terrain_id: number;
    terrain_nom: string;
    revenus: number;
    nb_reservations: number;
  }>;
}
```

**Graphiques nécessaires** :
- [ ] Évolution revenus (chart)
- [ ] Répartition par terrain (pie chart)
- [ ] Acomptes vs Soldes (bar chart)
- [ ] Comparaison mois précédent

**Export** :
- [ ] PDF rapport mensuel
- [ ] CSV transactions
- [ ] Filtres date

---

### **5. QrScannerPage.tsx** ⏳

**Fonctionnalité** :
- Scanner QR code réservation
- Valider présence client
- Marquer réservation comme utilisée

**Endpoint validation** :
```typescript
POST /api/reservations/{id}/validate-qr/
{
  qr_token: string
}
```

**À vérifier** :
- [ ] Scanner fonctionne mobile
- [ ] Validation backend sécurisée
- [ ] Historique validations
- [ ] Erreur si déjà utilisé
- [ ] Expiration QR code

---

### **6. AddTerrainPage.tsx** 🔴 CRITIQUE

**Formulaire complet requis** :
```typescript
{
  nom: string;
  description: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  capacite: number;
  image_principale: File;
  images_supplementaires: File[];
  equipements: string[];
  horaires_ouverture: string;
  
  // AJOUTER CHAMPS ACOMPTE
  type_acompte: 'pourcentage' | 'montant_fixe';
  pourcentage_acompte?: number;
  montant_acompte_fixe?: number;
  wave_payment_link?: string;
  orange_money_number?: string;
}
```

**UI Acompte** :
```tsx
<div className="space-y-4">
  <h3>Configuration Acompte</h3>
  
  <select name="type_acompte">
    <option value="pourcentage">Pourcentage</option>
    <option value="montant_fixe">Montant fixe</option>
  </select>
  
  {type_acompte === 'pourcentage' && (
    <input type="number" name="pourcentage_acompte" 
      placeholder="30" min="0" max="100" />
  )}
  
  {type_acompte === 'montant_fixe' && (
    <input type="number" name="montant_acompte_fixe" 
      placeholder="5000" />
  )}
  
  <input type="url" name="wave_payment_link" 
    placeholder="https://pay.wave.com/..." />
    
  <input type="tel" name="orange_money_number" 
    placeholder="+221..." />
</div>
```

**Validation** :
- [ ] Tous champs obligatoires présents
- [ ] Coordonnées GPS valides
- [ ] Images format/taille OK
- [ ] Pourcentage entre 0-100
- [ ] Montant fixe > 0

---

### **7. PromotionsPage.tsx** ⏳

**Fonctionnalité** :
- Créer codes promo
- Réductions temporaires
- Offres spéciales

**Backend** :
- ❓ Modèle Promotion existe ?
- ❓ Endpoints API créés ?

**Si non implémenté** : Marquer comme "À développer"

---

### **8. ProfilePage.tsx** ⏳

**Données profil gestionnaire** :
```typescript
{
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  wave_payment_link?: string;
  orange_money_number?: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  date_inscription: string;
}
```

**Actions** :
- [ ] Modifier informations
- [ ] Changer mot de passe
- [ ] Configurer paiements
- [ ] Voir statut validation

---

### **9. SettingsPage.tsx** ⏳

**Paramètres** :
- [ ] Notifications email
- [ ] Alertes SMS
- [ ] Langue interface
- [ ] Fuseau horaire
- [ ] Préférences affichage

---

## 🐛 **PROBLÈMES IDENTIFIÉS**

### **Critiques** 🔴

1. **Endpoints API gestionnaire manquants** ❌
   - `getManagerStats()` - À créer
   - `getManagerReservations()` - À créer
   - `getManagerRevenue()` - À créer

2. **Configuration acompte terrain** ❌
   - Pas d'UI pour configurer acompte
   - Champs manquants dans formulaire terrain
   - Pas de validation frontend

3. **Page litiges gestionnaire** ❌
   - Aucune page pour gérer litiges
   - Pas de communication client

### **Majeurs** 🟠

4. **Revenus avec acompte** ⚠️
   - Dashboard ne sépare pas acomptes/soldes
   - Pas de stats paiements en attente
   - Graphiques manquants

5. **Réservations** ⚠️
   - Filtre par statut incomplet
   - Pas d'affichage montants acompte
   - Validation QR à tester

6. **Upload images** ⚠️
   - Gestion images multiples à vérifier
   - Optimisation images ?
   - Preview avant upload ?

### **Mineurs** 🟢

7. **UI/UX** 📝
   - Responsive à vérifier
   - Messages d'erreur à améliorer
   - Loading states à uniformiser

---

## 📋 **CHECKLIST ENDPOINTS BACKEND À CRÉER**

### **Routes Manager** (à implémenter)

```python
# apps/manager/views.py ou apps/terrains/views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_dashboard_stats(request):
    """Stats dashboard gestionnaire"""
    if not request.user.role == 'gestionnaire':
        return Response({'error': 'Permission denied'}, 403)
    
    terrains = TerrainSynthetiquesDakar.objects.filter(
        gestionnaire=request.user
    )
    
    reservations = Reservation.objects.filter(
        terrain__in=terrains
    )
    
    stats = {
        'total_terrains': terrains.count(),
        'total_reservations': reservations.count(),
        'reservations_en_attente': reservations.filter(
            statut='en_attente'
        ).count(),
        'revenus_total': reservations.filter(
            statut__in=['confirmee', 'terminee']
        ).aggregate(Sum('montant_total'))['montant_total__sum'] or 0,
        'acomptes_recus': reservations.filter(
            acompte_paye=True
        ).aggregate(Sum('montant_acompte'))['montant_acompte__sum'] or 0,
        # ...
    }
    
    return api_success(data=stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_reservations(request):
    """Réservations des terrains du gestionnaire"""
    terrains = TerrainSynthetiquesDakar.objects.filter(
        gestionnaire=request.user
    )
    
    reservations = Reservation.objects.filter(
        terrain__in=terrains
    ).select_related('terrain', 'user', 'paiement_acompte', 'paiement_solde')
    
    serializer = ReservationSerializer(reservations, many=True)
    return api_success(data=serializer.data)
```

**URLs à ajouter** :
```python
# apps/manager/urls.py ou ksm_backend/urls.py

path('api/manager/stats/', manager_dashboard_stats),
path('api/manager/reservations/', manager_reservations),
path('api/manager/revenue/', manager_revenue_stats),
```

---

## ✅ **ACTIONS REQUISES GESTIONNAIRE**

### **Phase 1 : Backend Endpoints** (2-3h)

1. **Créer routes manager**
   - Dashboard stats
   - Réservations
   - Revenus

2. **Ajouter serializers**
   - ManagerDashboardStatsDTO
   - ManagerReservationDTO
   - RevenueStatsDTO

3. **Tester endpoints**
   - Créer terrains test
   - Créer réservations test
   - Vérifier stats correctes

### **Phase 2 : Frontend UI** (3-4h)

1. **Ajouter config acompte**
   - UI dans AddTerrainPage
   - UI dans TerrainsPage (edit)
   - Validation frontend

2. **Compléter ReservationsPage**
   - Filtres statut incluant acompte_paye
   - Affichage montants
   - Actions validation

3. **Améliorer RevenuePage**
   - Graphiques revenus
   - Séparation acomptes/soldes
   - Export données

4. **Créer DisputesPage**
   - Liste litiges terrains
   - Répondre messages
   - Escalader si besoin

### **Phase 3 : Tests** (1-2h)

1. Test création terrain avec config acompte
2. Test réservation avec acompte
3. Test validation QR code
4. Test dashboard stats
5. Test litiges communication

---

## 📊 **ÉTAT ACTUEL GESTIONNAIRE**

```
ManagerLayout         ✅ OK (routing)
ManagerDashboard      ⚠️ 60% (endpoint manquant)
TerrainsPage          ⚠️ 70% (config acompte manquante)
AddTerrainPage        🔴 40% (formulaire acompte manquant)
ReservationsPage      ⚠️ 50% (à vérifier endpoints)
RevenuePage           🔴 30% (stats acompte manquantes)
QrScannerPage         ⏳ ??? (à tester)
PromotionsPage        ❌ 0% (non implémenté ?)
ProfilePage           ⏳ ??? (à auditer)
SettingsPage          ⏳ ??? (à auditer)
DisputesPage          ❌ 0% (n'existe pas, à créer)
```

**Moyenne** : ~40% fonctionnel

---

**Prochaine étape** : Auditer chaque page en détail et interface Admin
