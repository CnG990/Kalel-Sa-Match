# 📋 PLAN D'IMPLÉMENTATION - LOGIQUE ACOMPTE

**Date**: 5 Mars 2026  
**Objectif**: Implémenter la logique d'acompte configurable par terrain

---

## 🎯 PROBLÈME ACTUEL

Le système demande le **paiement du montant total** de la réservation, alors que la logique métier exige :
- Paiement d'un **acompte** lors de la réservation
- Acompte configurable par **terrain** (pourcentage ou montant fixe)
- Paiement du **solde restant** sur place ou avant l'événement
- Tracking du statut de paiement (acompte payé, solde payé, remboursé)

---

## 📊 MODIFICATIONS NÉCESSAIRES

### 1. MODÈLE TERRAIN (`TerrainSynthetiquesDakar`)

**Ajouter champs** :
```python
# Acompte
pourcentage_acompte = DecimalField(default=30.00)  # Défaut 30%
montant_acompte_fixe = DecimalField(null=True, blank=True)  # Alternative
type_acompte = CharField(choices=[('pourcentage', 'Pourcentage'), ('montant_fixe', 'Montant fixe')], default='pourcentage')

# Paiement gestionnaire
wave_payment_link = URLField(blank=True)  # Lien Wave perso du gestionnaire
orange_money_number = CharField(blank=True)  # Numéro Orange Money

# Horaires (optionnel)
horaires_ouverture = JSONField(default=dict)  # {"lundi": {"debut": "08:00", "fin": "22:00"}, ...}

# Équipements (optionnel)
equipements = JSONField(default=list)  # ["vestiaires", "douches", "éclairage", ...]
```

---

### 2. MODÈLE RÉSERVATION (`Reservation`)

**Ajouter champs** :
```python
# Acompte
montant_acompte = DecimalField()  # Montant de l'acompte calculé
montant_restant = DecimalField()  # Solde à payer
acompte_paye = BooleanField(default=False)
solde_paye = BooleanField(default=False)

# Paiements multiples
paiement_acompte = ForeignKey('payments.Payment', related_name='reservation_acompte', null=True, blank=True)
paiement_solde = ForeignKey('payments.Payment', related_name='reservation_solde', null=True, blank=True)
```

**Supprimer** :
```python
# ANCIEN (à supprimer dans migration)
paiement = OneToOneField('payments.Payment')  # Remplacé par paiement_acompte et paiement_solde
```

---

### 3. MODÈLE PAYMENT (`Payment`)

**Ajouter champs** :
```python
# Informations client (actuellement dans serializer mais pas modèle)
customer_phone = CharField(max_length=20, blank=True)
customer_name = CharField(max_length=255, blank=True)

# Type de paiement
payment_type = CharField(choices=[('acompte', 'Acompte'), ('solde', 'Solde'), ('total', 'Total')], default='acompte')
```

---

### 4. LOGIQUE DE CRÉATION RÉSERVATION

**Fichier** : `apps/reservations/views.py` - fonction `create_reservation`

**Modifications** :
```python
# 1. Récupérer la configuration acompte du terrain
if terrain.type_acompte == 'pourcentage':
    montant_acompte = (montant_total * terrain.pourcentage_acompte) / 100
else:
    montant_acompte = terrain.montant_acompte_fixe or (montant_total * 0.30)  # 30% par défaut

montant_restant = montant_total - montant_acompte

# 2. Créer la réservation
reservation = Reservation.objects.create(
    terrain=terrain,
    user=request.user,
    date_debut=date_debut,
    date_fin=date_fin,
    duree_heures=duree_heures,
    montant_total=montant_total,
    montant_acompte=montant_acompte,  # NOUVEAU
    montant_restant=montant_restant,  # NOUVEAU
    telephone=telephone,
    notes=notes,
    statut='en_attente'
)

# 3. Créer le paiement pour l'acompte UNIQUEMENT
payment_acompte = Payment.objects.create(
    reference=str(uuid.uuid4()),
    montant=montant_acompte,  # CHANGÉ : montant_acompte au lieu de montant_total
    methode='en_attente',
    statut='en_attente',
    user=request.user,
    payment_type='acompte'  # NOUVEAU
)

# 4. Lier le paiement acompte
reservation.paiement_acompte = payment_acompte  # CHANGÉ
reservation.save()

# 5. Retourner les infos acompte
return api_success(
    data={
        **ReservationSerializer(reservation).data,
        'payment_id': payment_acompte.id,
        'payment_reference': payment_acompte.reference,
        'montant_acompte': float(montant_acompte),  # NOUVEAU
        'montant_restant': float(montant_restant),  # NOUVEAU
        'pourcentage_acompte': float(terrain.pourcentage_acompte)  # NOUVEAU
    },
    message="Réservation créée - Veuillez payer l'acompte",
    http_status=status.HTTP_201_CREATED
)
```

---

### 5. WEBHOOK PAIEMENT

**Fichier** : `apps/payments/views.py` - fonction `wave_webhook`

**Modifications** :
```python
# Mettre à jour le statut selon la réponse Wave
if payment_status in ['success', 'completed', 'successful']:
    payment.statut = 'reussi'
    payment.transaction_id = transaction_id
    
    # Si paiement d'acompte, marquer acompte comme payé
    if hasattr(payment, 'reservation_acompte'):
        reservation = payment.reservation_acompte
        reservation.acompte_paye = True  # NOUVEAU
        if reservation.montant_restant == 0 or payment.payment_type == 'total':
            reservation.statut = 'confirmee'
            reservation.solde_paye = True  # NOUVEAU
        else:
            reservation.statut = 'acompte_paye'  # NOUVEAU STATUT
        reservation.save()
    
    # Si paiement de solde, confirmer la réservation
    elif hasattr(payment, 'reservation_solde'):
        reservation = payment.reservation_solde
        reservation.solde_paye = True  # NOUVEAU
        reservation.statut = 'confirmee'
        reservation.save()
```

---

### 6. NOUVEAUX ENDPOINTS

#### A. Payer le solde
**URL** : `POST /api/reservations/{id}/pay-balance/`
```python
@action(detail=True, methods=['post'])
def pay_balance(self, request, pk=None):
    """Payer le solde restant d'une réservation"""
    reservation = self.get_object()
    
    if not reservation.acompte_paye:
        return Response({'error': 'Acompte non payé'}, status=400)
    
    if reservation.solde_paye:
        return Response({'error': 'Solde déjà payé'}, status=400)
    
    # Créer paiement pour le solde
    payment_solde = Payment.objects.create(
        reference=str(uuid.uuid4()),
        montant=reservation.montant_restant,
        methode='en_attente',
        statut='en_attente',
        user=request.user,
        payment_type='solde'
    )
    
    reservation.paiement_solde = payment_solde
    reservation.save()
    
    return Response({
        'payment_id': payment_solde.id,
        'payment_reference': payment_solde.reference,
        'montant_solde': float(reservation.montant_restant)
    })
```

#### B. Configuration acompte terrain (gestionnaire)
**URL** : `PATCH /api/manager/terrains/{id}/deposit-config/`
```python
@action(detail=True, methods=['patch'])
def deposit_config(self, request, pk=None):
    """Configurer l'acompte d'un terrain"""
    terrain = self.get_object()
    
    # Vérifier permissions
    if request.user != terrain.gestionnaire and request.user.role != 'admin':
        return Response({'error': 'Permission refusée'}, status=403)
    
    # Mettre à jour config acompte
    type_acompte = request.data.get('type_acompte')
    if type_acompte:
        terrain.type_acompte = type_acompte
    
    if type_acompte == 'pourcentage':
        terrain.pourcentage_acompte = request.data.get('pourcentage_acompte', 30)
    else:
        terrain.montant_acompte_fixe = request.data.get('montant_acompte_fixe')
    
    # Liens paiement perso
    terrain.wave_payment_link = request.data.get('wave_payment_link', '')
    terrain.orange_money_number = request.data.get('orange_money_number', '')
    
    terrain.save()
    
    return Response(TerrainSerializer(terrain).data)
```

---

### 7. STATUTS RÉSERVATION

**Ajouter dans** `Reservation.STATUT_CHOICES` :
```python
STATUT_CHOICES = [
    ('en_attente', 'En attente de paiement'),
    ('acompte_paye', 'Acompte payé - Solde à payer'),  # NOUVEAU
    ('confirmee', 'Confirmée (entièrement payée)'),
    ('annulee', 'Annulée'),
    ('terminee', 'Terminée'),
    ('en_cours', 'En cours'),
]
```

---

## 🗂️ ORDRE D'IMPLÉMENTATION

1. ✅ **Créer les migrations** pour les nouveaux champs
2. ✅ **Modifier la logique de création** de réservation
3. ✅ **Mettre à jour le webhook** de paiement
4. ✅ **Créer l'endpoint** de paiement solde
5. ✅ **Créer l'endpoint** de config acompte
6. ✅ **Mettre à jour les serializers** avec nouveaux champs
7. ✅ **Tester** le flux complet
8. ✅ **Mettre à jour le frontend** (si nécessaire)

---

## 📝 MIGRATIONS À CRÉER

### Migration 1 : Terrains - Ajouter champs acompte
```bash
python manage.py makemigrations terrains --name add_acompte_config
```

### Migration 2 : Réservations - Modifier champs paiement
```bash
python manage.py makemigrations reservations --name update_payment_fields
```

### Migration 3 : Payments - Ajouter champs client
```bash
python manage.py makemigrations payments --name add_customer_fields
```

---

## ✅ CHECKLIST VALIDATION

- [ ] Terrain peut avoir pourcentage OU montant fixe acompte
- [ ] Réservation calcule correctement acompte et solde
- [ ] Paiement acompte crée réservation en statut "acompte_payé"
- [ ] Paiement solde confirme la réservation
- [ ] Webhook Wave/Orange Money met à jour les bons statuts
- [ ] Gestionnaire peut configurer son acompte
- [ ] Client voit montant acompte ET montant total
- [ ] Interface affiche solde restant à payer
- [ ] Annulation rembourse selon statut (acompte uniquement ou total)

---

**PROCHAINE ÉTAPE** : Commencer l'implémentation des migrations et modifications
