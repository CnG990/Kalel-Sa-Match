# 📱 Guide Wave Business - Sénégal

## 🌊 Comment fonctionne Wave Business au Sénégal

### 1. Types de Paiements Wave

Wave Business au Sénégal propose **2 méthodes principales** :

#### A) **Lien de Paiement** (Notre méthode actuelle)
```
Format: https://pay.wave.com/m/{MERCHANT_ID}/c/{COUNTRY_CODE}/
Exemple: https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/
```

**Avantages** :
- ✅ Aucune intégration API nécessaire
- ✅ Simple : partager le lien
- ✅ Fonctionne sur mobile et desktop
- ✅ QR code généré automatiquement par Wave
- ✅ Pas de frais d'intégration

**Fonctionnement** :
1. Client clique sur le lien ou scanne le QR code
2. Wave ouvre avec le montant pré-rempli
3. Client confirme le paiement
4. Notification SMS/Email au marchand

#### B) **API Wave** (Avancé - optionnel)
- Requiert inscription Wave Business
- Clé API + Secret
- Webhooks pour confirmations automatiques
- Permet génération de QR codes dynamiques

---

### 2. Configuration Kalel Sa Match

#### Compte Principal (Admin)
```
Nom marchand: Kalel Sa Match
Lien: https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/
ID Marchand: M_sn_OnnKDQNjnuxG
Pays: Sénégal (sn)
```

#### Comptes Gestionnaires (Optionnel)
Chaque gestionnaire peut avoir son propre lien Wave :
```python
User.wave_payment_link = "https://pay.wave.com/m/M_sn_XXXXXXXXX/c/sn/"
User.wave_contact_label = "Nom du gestionnaire"
```

**Scénario** :
- Si gestionnaire a `wave_payment_link` → paiement vers son compte
- Sinon → paiement vers le compte principal Kalel Sa Match

---

### 3. Génération de QR Codes

#### Option 1: QR Code Wave Natif (Recommandé)
Wave génère automatiquement un QR code pour chaque lien de paiement.

**Accès au QR** :
1. Se connecter à Wave Business Dashboard
2. Aller dans "Moyens de Paiement"
3. Télécharger le QR code du compte

**Pour afficher sur le frontend** :
```html
<!-- Méthode 1: Iframe Wave -->
<iframe src="https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/" 
        width="300" height="400"></iframe>

<!-- Méthode 2: QR Code image hébergée -->
<img src="https://votre-cdn.com/qr-codes/wave-ksm.png" alt="QR Code Wave">
```

#### Option 2: Générer QR Code Dynamique (Notre implémentation)
Générer un QR code qui encode le lien Wave + montant :

```python
import qrcode
from io import BytesIO
import base64

def generate_wave_qr(payment_link, montant, reference):
    """
    Génère un QR code pour paiement Wave
    """
    # URL avec paramètres
    qr_data = f"{payment_link}?amount={montant}&reference={reference}"
    
    # Générer QR
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convertir en base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"
```

---

### 4. Workflow de Paiement

```
┌─────────────┐
│   Client    │
│  réserve    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Backend génère Payment         │
│  reference: KSM_20240305_001    │
│  montant: 15000 FCFA            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Backend retourne:              │
│  - Lien Wave avec montant       │
│  - QR code (optionnel)          │
│  - Instructions                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Client scanne QR ou clique     │
│  → App Wave s'ouvre             │
│  → Montant pré-rempli           │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Client confirme paiement       │
│  → Wave envoie notification     │
│  → SMS au marchand              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Marchand/Admin confirme        │
│  manuellement sur dashboard     │
│  OU webhook auto (si API)       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Réservation confirmée          │
│  Client reçoit ticket QR        │
└─────────────────────────────────┘
```

---

### 5. Implémentation Actuelle

#### Backend (`apps/payments/views.py`)
```python
@api_view(['POST'])
def init_payment(request):
    # ...
    if methode == 'wave':
        # Récupérer config gestionnaire ou admin
        terrain = reservation.terrain
        gestionnaire = terrain.gestionnaire
        
        if gestionnaire and gestionnaire.wave_payment_link:
            payment_link = gestionnaire.wave_payment_link
            merchant_name = gestionnaire.wave_contact_label or gestionnaire.nom_complet
        else:
            # Config admin par défaut
            wave_config = PaymentConfig.get_wave_config()
            payment_link = wave_config.wave_payment_link
            merchant_name = wave_config.wave_merchant_name
        
        # Construire URL avec montant
        checkout_url = f"{payment_link}?amount={montant}&reference={payment.reference}"
        
        return Response({
            'data': {
                'payment_id': payment.id,
                'reference': payment.reference,
                'checkout_url': checkout_url,
                'merchant_name': merchant_name,
                'montant': montant,
                'methode': 'wave',
                'instructions': 'Scannez le QR code ou cliquez sur le lien'
            }
        })
```

---

### 6. Confirmation Paiements

#### Sans API (Manuel)
1. Client paie via Wave
2. Marchand reçoit notification SMS
3. Marchand se connecte à l'admin Kalel Sa Match
4. Marchand marque le paiement comme "réussi"
5. Système confirme automatiquement la réservation

#### Avec API Wave (Automatique)
```python
@api_view(['POST'])
def wave_webhook(request):
    """
    Wave envoie une notification POST quand paiement réussi
    """
    data = request.data
    
    # Vérifier signature Wave (sécurité)
    # ...
    
    reference = data.get('reference')
    status = data.get('status')  # 'success' ou 'failed'
    
    payment = Payment.objects.get(reference=reference)
    
    if status == 'success':
        payment.statut = 'reussi'
        payment.transaction_id = data.get('transaction_id')
        
        # Confirmer la réservation automatiquement
        reservation = payment.reservation
        reservation.statut = 'confirmee'
        reservation.save()
    
    payment.save()
```

---

### 7. QR Codes Réservation vs Paiement

**Attention: 2 types de QR codes différents !**

#### QR Code Paiement (Wave)
- Encode le lien Wave + montant
- Client le scanne pour **payer**
- Généré au moment de l'initialisation du paiement

#### QR Code Ticket (Validation Entrée)
- Encode `reservation.qr_code_token`
- Gestionnaire le scanne pour **valider l'entrée** au terrain
- Généré automatiquement à la création de la réservation

```python
# Exemple frontend
def render_payment():
    if methode == 'wave':
        return (
            <QRCode value={payment.checkout_url} />  # QR paiement
            <button onClick={() => window.open(payment.checkout_url)}>
                Payer avec Wave
            </button>
        )

def render_ticket():
    return (
        <QRCode value={reservation.qr_code_token} />  # QR ticket
        <p>Présentez ce QR code à l'entrée du terrain</p>
    )
```

---

### 8. Sécurisation du webhook Wave

Depuis mars 2026, l'API Django vérifie systématiquement la signature HMAC envoyée par Wave avant de traiter un webhook.

1. **Configurer la variable d'environnement** `WAVE_WEBHOOK_SECRET` (même valeur que dans le back-office Wave).
2. Redémarrer le backend pour que `ksm_backend.settings.base` charge le secret.
3. Wave enverra un en-tête `X-Wave-Signature=sha256=<hash>` calculé avec ce secret → Django recalculera et rejettera toute requête dont la signature est absente ou invalide.
4. Sans secret, le webhook reste ouvert mais un warning apparaît dans les logs (`WAVE_WEBHOOK_SECRET non configuré - webhook non sécurisé`).

Recommandation : activer le secret dès que possible en production afin de bloquer toute tentative de spoofing.

---

### 8. Tests & Débogage

#### Tester le lien Wave
```bash
# Ouvrir dans navigateur
https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/?amount=5000&reference=TEST_001

# Vérifier que l'app Wave s'ouvre avec montant pré-rempli
```

#### Générer QR code de test
```python
import qrcode
qr = qrcode.make("https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/?amount=1000")
qr.save("wave_test_qr.png")
```

---

### 9. Recommandations

✅ **Utiliser les liens Wave natifs** (pas besoin d'API pour commencer)
✅ **Stocker les liens gestionnaires** dans `User.wave_payment_link`
✅ **Fallback sur compte principal** si gestionnaire n'a pas de lien
✅ **QR codes dynamiques** avec montant et référence
✅ **Confirmation manuelle** au début, puis webhook Wave si volume élevé
✅ **Instructions claires** : "Scannez avec Wave ou cliquez sur le lien"

❌ **Ne pas** mélanger QR paiement et QR ticket
❌ **Ne pas** hardcoder les montants dans les QR
❌ **Ne pas** partager les clés API Wave (si utilisées)

---

### 10. Ressources

- **Wave Business Sénégal** : https://www.wave.com/business
- **Support Wave** : support@wave.com
- **Inscription marchand** : Via l'app Wave Mobile
- **Documentation API** : Disponible sur demande Wave

---

## 📞 Contact Wave Business

- **Téléphone** : #156# (depuis Wave)
- **Email** : support@wave.com
- **WhatsApp** : +221 XX XXX XX XX (vérifier sur le site Wave)
