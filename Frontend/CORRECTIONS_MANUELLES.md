# 🔧 CORRECTIONS MANUELLES REQUISES

**Date**: 5 Mars 2026  
**Priorité**: HAUTE - Appliquer avant déploiement production

---

## 🚨 **CORRECTIONS CRITIQUES**

### **1. LitigeDetailsPage.tsx**

**Fichier**: `Frontend/src/pages/LitigeDetailsPage.tsx`

**Ligne 69-72** : Corriger les endpoints
```typescript
// AVANT (INCORRECT)
const [litigeResponse, messagesResponse] = await Promise.all([
  apiService.get(`/litiges/${id}`),
  apiService.get(`/litiges/${id}/messages`)
]);

// APRÈS (CORRECT)
const litigeResponse = await apiService.get(`/litiges/litiges/${id}/`);
```

**Ligne 74-85** : Utiliser messages inclus
```typescript
// AVANT
const litigeData = litigeResponse.data;
if (litigeData) {
  setLitige(litigeData as LitigeDetails);
}

const messagesData = messagesResponse.data;
if (messagesData) {
  setMessages(Array.isArray(messagesData) ? messagesData : []);
}

// APRÈS
const litigeData = litigeResponse.data;
if (litigeData) {
  setLitige(litigeData as LitigeDetails);
  // Messages inclus dans la réponse
  if (litigeData.messages) {
    setMessages(Array.isArray(litigeData.messages) ? litigeData.messages : []);
  }
}
```

**Ligne 103** : Corriger endpoint envoi message
```typescript
// AVANT
const response = await apiService.post(`/litiges/${id}/messages`, {
  message: newMessage.trim()
});

// APRÈS
const response = await apiService.post(`/litiges/litiges/${id}/ajouter_message/`, {
  message: newMessage.trim()
});
```

**Ligne 128** : Corriger endpoint escalade
```typescript
// AVANT
const response = await apiService.post(`/litiges/${id}/escalader`);

// APRÈS
const response = await apiService.post(`/litiges/litiges/${id}/escalader/`);
```

**Ligne 147** : Corriger endpoint fermeture
```typescript
// AVANT
const response = await apiService.post(`/litiges/${id}/fermer`);

// APRÈS
const response = await apiService.post(`/litiges/litiges/${id}/fermer/`);
```

---

### **2. admin/DisputesPage.tsx**

**Fichier**: `Frontend/src/pages/admin/DisputesPage.tsx`

**Ligne 28** : Remplacer méthode inexistante
```typescript
// AVANT (INCORRECT)
const response = await apiService.getDisputes(params);
if (response.data) {
  setDisputes(response.data.data || []);
  setTotalPages(response.data.last_page || 1);
}

// APRÈS (CORRECT)
const { data, meta } = await apiService.get('/litiges/litiges/', { params });
if (data?.results) {
  setDisputes(data.results);
  setTotalPages(data.last_page || 1);
} else if (Array.isArray(data)) {
  setDisputes(data);
}
```

---

### **3. Interface LitigeDetails**

**Fichier**: `Frontend/src/pages/LitigeDetailsPage.tsx`

**Ligne 20** : Ajouter champ messages
```typescript
// AVANT
interface LitigeDetails {
  id: number;
  numero_litige: string;
  type_litige: string;
  sujet: string;
  description: string;
  priorite: string;
  statut: 'nouveau' | 'en_cours' | 'resolu' | 'ferme' | 'escalade';
  niveau_escalade: string;
  terrain_nom: string;
  terrain_adresse: string;
  client_nom: string;
  client_email: string;
  reservation_id: number | null;
  reservation_date: string | null;
  created_at: string;
  updated_at: string;
  preuves: string[];
}

// APRÈS
interface LitigeDetails {
  id: number;
  numero_litige: string;
  type_litige: string;
  sujet: string;
  description: string;
  priorite: string;
  statut: 'nouveau' | 'en_cours' | 'resolu' | 'ferme' | 'escalade';
  niveau_escalade: string;
  terrain_nom: string;
  terrain_adresse: string;
  client_nom: string;
  client_email: string;
  reservation_id: number | null;
  reservation_date: string | null;
  created_at: string;
  updated_at: string;
  preuves: string[];
  messages?: Message[];  // AJOUTER CETTE LIGNE
}
```

---

## ⚠️ **CORRECTIONS RECOMMANDÉES**

### **4. Créer manager/DisputesPage.tsx**

**Nouveau fichier**: `Frontend/src/pages/manager/DisputesPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const ManagerDisputesPage: React.FC = () => {
  const [litiges, setLitiges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerLitigesTerrains();
  }, []);

  const chargerLitigesTerrains = async () => {
    try {
      setLoading(true);
      // Litiges des terrains du gestionnaire
      const { data, meta } = await apiService.get('/litiges/litiges/', {
        params: { gestionnaire: 'current' }
      });
      
      if (Array.isArray(data)) {
        setLitiges(data);
      } else if (data?.results) {
        setLitiges(data.results);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des litiges');
    } finally {
      setLoading(false);
    }
  };

  // UI similaire à MesLitigesPage mais avec actions gestionnaire
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Litiges de mes terrains</h1>
      {/* ... reste de l'UI */}
    </div>
  );
};

export default ManagerDisputesPage;
```

---

### **5. Ajouter action escalader backend**

**Fichier**: `python-backend/apps/litiges/views.py`

Ajouter cette action au viewset :

```python
@action(detail=True, methods=['post'])
def escalader(self, request, pk=None):
    """Escalader le litige au niveau supérieur"""
    litige = self.get_object()
    
    # Vérifier permissions
    if not (request.user == litige.client or 
            request.user == litige.gestionnaire or 
            request.user.is_staff):
        return Response(
            {'message': 'Permission refusée'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Escalader
    if litige.niveau_escalade == 'client':
        litige.niveau_escalade = 'gestionnaire'
        message = 'Litige escaladé au gestionnaire'
    elif litige.niveau_escalade == 'gestionnaire':
        litige.niveau_escalade = 'admin'
        message = 'Litige escaladé à l\'administration'
    else:
        return Response(
            {'message': 'Litige déjà au niveau maximum'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    litige.statut = 'escalade'
    litige.save()
    
    # Créer notification
    MessageLitige.objects.create(
        litige=litige,
        expediteur=request.user,
        message=f'Litige escaladé au niveau {litige.niveau_escalade}',
        type_message='action'
    )
    
    serializer = self.get_serializer(litige)
    return Response({
        'data': serializer.data,
        'meta': {'success': True, 'message': message}
    })
```

---

### **6. Ajouter routes manager**

**Fichier**: `Frontend/src/App.tsx`

Ajouter dans les routes protégées gestionnaire :

```typescript
import ManagerDisputesPage from './pages/manager/DisputesPage';

// Dans les routes manager
<Route path="/manager/disputes" element={<ManagerDisputesPage />} />
```

---

## 📋 **CHECKLIST APPLICATION**

### **Corrections Endpoints**
- [ ] LitigeDetailsPage - chargerDetailsLitige (ligne 69-72)
- [ ] LitigeDetailsPage - gérer messages inclus (ligne 74-85)
- [ ] LitigeDetailsPage - envoyerMessage (ligne 103)
- [ ] LitigeDetailsPage - escaladerLitige (ligne 128)
- [ ] LitigeDetailsPage - fermerLitige (ligne 147)
- [ ] admin/DisputesPage - fetchDisputes (ligne 28)
- [ ] LitigeDetails interface - ajouter messages (ligne 20)

### **Nouvelles Fonctionnalités**
- [ ] Créer manager/DisputesPage.tsx
- [ ] Ajouter action escalader backend
- [ ] Ajouter routes manager
- [ ] Tester flux complet

### **Tests**
- [ ] Client crée litige
- [ ] Gestionnaire répond
- [ ] Client escalade
- [ ] Admin assigne et résout
- [ ] Vérifier notifications

---

## 🚀 **COMMANDES D'APPLICATION**

### **1. Backend - Ajouter action escalader**

```bash
# Sur EC2
cd /home/ssm-user/projects/ksm/python-backend
source .venv/bin/activate

# Éditer apps/litiges/views.py
# Ajouter la méthode escalader() ci-dessus

# Redémarrer
sudo systemctl restart ksm_gunicorn.service

# Tester
curl -X POST https://kalelsamatch.duckdns.org/api/litiges/litiges/1/escalader/ \
  -H "Authorization: Bearer $TOKEN"
```

### **2. Frontend - Appliquer corrections**

```bash
# En local
cd C:\laragon\www\Terrains-Synthetiques\Frontend

# Appliquer manuellement les corrections ci-dessus dans les fichiers

# Tester en dev
npm run dev

# Build production
npm run build
```

---

## ✅ **VÉRIFICATION FINALE**

Après application des corrections :

1. **Build réussit sans erreurs**
   ```bash
   npm run build
   # Vérifier 0 erreurs TypeScript
   ```

2. **Tests litiges fonctionnent**
   - Créer litige depuis interface client
   - Voir litige dans admin
   - Ajouter message
   - Escalader
   - Résoudre

3. **Pas de console errors**
   - Ouvrir DevTools
   - Naviguer dans app
   - Vérifier aucune erreur rouge

---

**Note**: Ces corrections sont **critiques** pour le bon fonctionnement des communications. Appliquer en priorité avant déploiement production.
