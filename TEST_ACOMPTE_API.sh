#!/bin/bash

# SCRIPT DE TEST - API ACOMPTE
# À exécuter sur EC2 ou en local après déploiement

echo "🧪 TEST API ACOMPTE - Kalel Sa Match"
echo "===================================="

# Configuration
API_URL="https://kalelsamatch.duckdns.org/api"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "❌ Usage: $0 <JWT_TOKEN>"
    echo "Obtenez un token avec: curl -X POST $API_URL/auth/login/ -d '{\"email\":\"...\",\"password\":\"...\"}'"
    exit 1
fi

echo ""
echo "1️⃣  Test création réservation avec acompte"
echo "------------------------------------------"

# Créer une réservation
RESERVATION_RESPONSE=$(curl -s -X POST "$API_URL/reservations/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "terrain_id": 1,
        "date_debut": "2026-03-10T10:00:00Z",
        "date_fin": "2026-03-10T12:00:00Z",
        "duree_heures": 2,
        "telephone": "+221771234567",
        "notes": "Test acompte"
    }')

echo "Réponse création:"
echo "$RESERVATION_RESPONSE" | jq '.' 2>/dev/null || echo "$RESERVATION_RESPONSE"

# Extraire l'ID de réservation
RESERVATION_ID=$(echo "$RESERVATION_RESPONSE" | jq -r '.data.id' 2>/dev/null)
PAYMENT_ID=$(echo "$RESERVATION_RESPONSE" | jq -r '.data.payment_id' 2>/dev/null)

if [ "$RESERVATION_ID" = "null" ] || [ -z "$RESERVATION_ID" ]; then
    echo "❌ Erreur: Impossible de créer la réservation"
    exit 1
fi

echo ""
echo "✅ Réservation créée (ID: $RESERVATION_ID)"
echo "💰 Acompte à payer: $(echo "$RESERVATION_RESPONSE" | jq -r '.data.montant_acompte') FCFA"
echo "💰 Solde restant: $(echo "$RESERVATION_RESPONSE" | jq -r '.data.montant_restant') FCFA"

echo ""
echo "2️⃣  Test statut de paiement"
echo "----------------------------"

# Vérifier le statut de paiement
STATUS_RESPONSE=$(curl -s -X GET "$API_URL/reservations/$RESERVATION_ID/payment-status/" \
    -H "Authorization: Bearer $TOKEN")

echo "Statut de paiement:"
echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"

echo ""
echo "3️⃣  Test initialisation paiement acompte"
echo "-----------------------------------------"

# Initialiser le paiement de l'acompte
if [ -n "$PAYMENT_ID" ] && [ "$PAYMENT_ID" != "null" ]; then
    PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/init/" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"payment_id\": $PAYMENT_ID,
            \"methode\": \"wave\",
            \"customer_phone\": \"+221771234567\",
            \"customer_name\": \"Test Client\"
        }")
    
    echo "Initialisation paiement:"
    echo "$PAYMENT_RESPONSE" | jq '.' 2>/dev/null || echo "$PAYMENT_RESPONSE"
else
    echo "❌ Pas de payment_id trouvé"
fi

echo ""
echo "4️⃣  Test création paiement solde"
echo "--------------------------------"

# Créer le paiement pour le solde
BALANCE_RESPONSE=$(curl -s -X POST "$API_URL/reservations/$RESERVATION_ID/pay-balance/" \
    -H "Authorization: Bearer $TOKEN")

echo "Création paiement solde:"
echo "$BALANCE_RESPONSE" | jq '.' 2>/dev/null || echo "$BALANCE_RESPONSE"

echo ""
echo "5️⃣  Test détails réservation"
echo "---------------------------"

# Vérifier les détails complets
DETAILS_RESPONSE=$(curl -s -X GET "$API_URL/reservations/$RESERVATION_ID/" \
    -H "Authorization: Bearer $TOKEN")

echo "Détails réservation:"
echo "$DETAILS_RESPONSE" | jq '.data | {id, statut, montant_total, montant_acompte, montant_restant, acompte_paye, solde_paye}' 2>/dev/null || echo "$DETAILS_RESPONSE"

echo ""
echo "✅ Tests terminés !"
echo ""
echo "📝 Résumé attendu:"
echo "- montant_acompte: 30% du total (ex: 3000 FCFA sur 10000 FCFA)"
echo "- montant_restant: 70% du total (ex: 7000 FCFA)"
echo "- statut: 'en_attente' initialement"
echo "- acompte_paye: false initialement"
echo "- solde_paye: false initialement"
