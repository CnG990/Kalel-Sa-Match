# 🚀 GUIDE D'IMPLÉMENTATION IMMÉDIATE

**Date**: 5 Mars 2026  
**Temps estimé**: 3-4 heures  
**Priorité**: CRITIQUE

---

## ⚡ **CORRECTIONS À FAIRE MAINTENANT**

### **Étape 1 : Backend - Créer action escalader** (15min)

**Fichier** : `python-backend/apps/litiges/views.py`

Ajouter cette méthode dans la classe `LitigeViewSet` :

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
    
    # Créer message action
    from apps.litiges.models import MessageLitige
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

**Déployer** :
```bash
# Sur EC2
cd /home/ssm-user/projects/ksm/python-backend
source .venv/bin/activate
sudo systemctl restart ksm_gunicorn.service
```

---

### **Étape 2 : Backend - Créer endpoints Manager** (2h)

**Créer fichier** : `python-backend/apps/manager/views.py`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Q
from apps.core.utils.api_response import api_success, api_error
from apps.terrains.models import TerrainSynthetiquesDakar
from apps.reservations.models import Reservation
from apps.reservations.serializers import ReservationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_dashboard_stats(request):
    """Statistiques dashboard gestionnaire"""
    # Vérifier que c'est bien un gestionnaire
    if request.user.role != 'gestionnaire':
        return api_error('Permission refusée', status.HTTP_403_FORBIDDEN)
    
    # Terrains du gestionnaire
    terrains = TerrainSynthetiquesDakar.objects.filter(gestionnaire=request.user)
    
    # Réservations
    reservations = Reservation.objects.filter(terrain__in=terrains)
    
    # Stats
    stats = {
        'total_terrains': terrains.count(),
        'total_reservations': reservations.count(),
        'reservations_en_attente': reservations.filter(
            statut='en_attente'
        ).count(),
        'reservations_acompte_paye': reservations.filter(
            acompte_paye=True
        ).count(),
        'revenus_total': reservations.filter(
            statut__in=['confirmee', 'terminee', 'en_cours']
        ).aggregate(Sum('montant_total'))['montant_total__sum'] or 0,
        'acomptes_recus': reservations.filter(
            acompte_paye=True
        ).aggregate(Sum('montant_acompte'))['montant_acompte__sum'] or 0,
        'soldes_recus': reservations.filter(
            solde_paye=True
        ).aggregate(Sum('montant_restant'))['montant_restant__sum'] or 0,
    }
    
    return api_success(data=stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_reservations(request):
    """Réservations des terrains du gestionnaire"""
    if request.user.role != 'gestionnaire':
        return api_error('Permission refusée', status.HTTP_403_FORBIDDEN)
    
    terrains = TerrainSynthetiquesDakar.objects.filter(gestionnaire=request.user)
    reservations = Reservation.objects.filter(
        terrain__in=terrains
    ).select_related('terrain', 'user', 'paiement_acompte', 'paiement_solde').order_by('-created_at')
    
    serializer = ReservationSerializer(reservations, many=True)
    return api_success(data=serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_revenue_stats(request):
    """Statistiques revenus gestionnaire"""
    if request.user.role != 'gestionnaire':
        return api_error('Permission refusée', status.HTTP_403_FORBIDDEN)
    
    terrains = TerrainSynthetiquesDakar.objects.filter(gestionnaire=request.user)
    reservations = Reservation.objects.filter(terrain__in=terrains)
    
    # Stats par terrain
    revenus_par_terrain = []
    for terrain in terrains:
        resa_terrain = reservations.filter(terrain=terrain)
        revenus_par_terrain.append({
            'terrain_id': terrain.id,
            'terrain_nom': terrain.nom,
            'nb_reservations': resa_terrain.count(),
            'revenus': resa_terrain.filter(
                statut__in=['confirmee', 'terminee']
            ).aggregate(Sum('montant_total'))['montant_total__sum'] or 0,
            'acomptes': resa_terrain.filter(
                acompte_paye=True
            ).aggregate(Sum('montant_acompte'))['montant_acompte__sum'] or 0,
        })
    
    stats = {
        'revenus_total': sum(t['revenus'] for t in revenus_par_terrain),
        'acomptes_total': sum(t['acomptes'] for t in revenus_par_terrain),
        'revenus_par_terrain': revenus_par_terrain,
    }
    
    return api_success(data=stats)
```

**Créer fichier** : `python-backend/apps/manager/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.manager_dashboard_stats, name='manager-stats'),
    path('reservations/', views.manager_reservations, name='manager-reservations'),
    path('revenue/', views.manager_revenue_stats, name='manager-revenue'),
]
```

**Ajouter dans** : `python-backend/ksm_backend/urls.py`

```python
# Ajouter cette ligne dans urlpatterns
path('api/manager/', include('apps.manager.urls')),
```

**Déployer** :
```bash
cd /home/ssm-user/projects/ksm/python-backend
source .venv/bin/activate
sudo systemctl restart ksm_gunicorn.service

# Tester
curl https://kalelsamatch.duckdns.org/api/manager/stats/ \
  -H "Authorization: Bearer $TOKEN"
```

---

### **Étape 3 : Frontend - Build et test** (30min)

```bash
cd C:\laragon\www\Terrains-Synthetiques\Frontend

# Installer dépendances si nécessaire
npm install

# Build production
npm run build

# Si erreurs TypeScript, les noter et corriger
```

**Erreurs courantes** :
- Variables non utilisées : Commenter ou supprimer
- Types manquants : Ajouter `any` temporairement

---

### **Étape 4 : Déploiement Frontend** (1h)

**Option A : Vercel (Recommandé)**

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd Frontend
vercel --prod
```

**Option B : Netlify**

```bash
npm install -g netlify-cli
netlify login
cd Frontend
netlify deploy --prod
```

---

## 📋 **CHECKLIST RAPIDE**

### **Backend** ✅
- [ ] Action `escalader` ajoutée dans `litiges/views.py`
- [ ] Fichier `manager/views.py` créé
- [ ] Fichier `manager/urls.py` créé
- [ ] URLs manager ajoutées dans `ksm_backend/urls.py`
- [ ] Gunicorn redémarré
- [ ] Tests API `manager/stats/` OK

### **Frontend** ✅  
- [ ] Build `npm run build` réussit
- [ ] 0 erreurs TypeScript critiques
- [ ] Deploy Vercel/Netlify OK
- [ ] URL production accessible

### **Configuration** ✅
- [ ] CORS backend inclut URL frontend
- [ ] Variables environnement `.env.production` créées
- [ ] Tests navigation OK

---

## 🧪 **TESTS APRÈS DÉPLOIEMENT**

```bash
# 1. Tester stats gestionnaire (si TOKEN gestionnaire)
curl https://kalelsamatch.duckdns.org/api/manager/stats/ \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# Devrait retourner :
# {
#   "data": {
#     "total_terrains": X,
#     "total_reservations": Y,
#     "revenus_total": Z
#   }
# }

# 2. Tester escalade litige
curl -X POST https://kalelsamatch.duckdns.org/api/litiges/litiges/1/escalader/ \
  -H "Authorization: Bearer $TOKEN"

# Devrait retourner :
# {
#   "data": {...},
#   "meta": {"success": true, "message": "Litige escaladé..."}
# }
```

---

## 🎯 **RÉSULTAT ATTENDU**

Après ces étapes :
- ✅ Backend endpoints manager opérationnels
- ✅ Action escalader fonctionne
- ✅ Frontend déployé en production
- ✅ Toutes les interfaces accessibles

**Temps total** : 3-4 heures

---

## 🆘 **EN CAS DE PROBLÈME**

### **Build frontend échoue**
```bash
# Vérifier les erreurs
npm run build 2>&1 | tee build.log

# Si erreurs TypeScript : Ajouter // @ts-ignore
# Si dépendances manquantes : npm install
```

### **Gunicorn ne redémarre pas**
```bash
# Vérifier logs
sudo journalctl -u ksm_gunicorn.service -n 50

# Vérifier syntaxe Python
python manage.py check

# Redémarrer manuellement
sudo systemctl restart ksm_gunicorn.service
```

### **Frontend 404 sur refresh**
- Vercel/Netlify gère automatiquement
- Si problème : Vérifier configuration routing

---

**Commencer maintenant par l'Étape 1 !**
