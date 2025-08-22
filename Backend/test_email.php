<?php

/**
 * Script de test pour Mailtrap
 * Remplacez YOUR_API_TOKEN par votre vrai token
 */

$apiToken = 'YOUR_API_TOKEN'; // Remplacez par votre token
$toEmail = 'cheikhngom99@gmail.com';

echo "=== TEST ENVOI EMAIL MAILTRAP ===\n\n";

if ($apiToken === 'YOUR_API_TOKEN') {
    echo "❌ ERREUR : Remplacez YOUR_API_TOKEN par votre vrai token Mailtrap\n\n";
    echo "1. Allez sur https://mailtrap.io\n";
    echo "2. Settings > API Tokens\n";
    echo "3. Create Token\n";
    echo "4. Copiez le token et remplacez dans ce script\n\n";
    exit;
}

// Créer le contenu de l'email
$emailContent = "From: Terrains Synthétiques Dakar <hello@demomailtrap.co>\r\n";
$emailContent .= "To: Test <{$toEmail}>\r\n";
$emailContent .= "Subject: Test Configuration Mailtrap - Terrains Dakar\r\n";
$emailContent .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
$emailContent .= "<!DOCTYPE html>\r\n";
$emailContent .= "<html>\r\n";
$emailContent .= "<head>\r\n";
$emailContent .= "    <meta charset=\"UTF-8\">\r\n";
$emailContent .= "    <title>Test Mailtrap</title>\r\n";
$emailContent .= "</head>\r\n";
$emailContent .= "<body style=\"font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;\">\r\n";
$emailContent .= "    <div style=\"max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">\r\n";
$emailContent .= "        <div style=\"text-align: center; margin-bottom: 30px;\">\r\n";
$emailContent .= "            <h1 style=\"color: #667eea; margin: 0;\">🎾 Terrains Synthétiques Dakar</h1>\r\n";
$emailContent .= "            <p style=\"color: #666; margin: 10px 0 0 0;\">Test de configuration Mailtrap</p>\r\n";
$emailContent .= "        </div>\r\n";
$emailContent .= "        \r\n";
$emailContent .= "        <div style=\"background: #e8f5e8; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;\">\r\n";
$emailContent .= "            <h2 style=\"color: #28a745; margin: 0 0 10px 0;\">✅ Configuration Réussie !</h2>\r\n";
$emailContent .= "            <p style=\"margin: 0; color: #333;\">Si vous recevez cet email, la configuration Mailtrap fonctionne parfaitement.</p>\r\n";
$emailContent .= "        </div>\r\n";
$emailContent .= "        \r\n";
$emailContent .= "        <div style=\"margin: 20px 0;\">\r\n";
$emailContent .= "            <h3 style=\"color: #333;\">Détails du test :</h3>\r\n";
$emailContent .= "            <ul style=\"color: #666;\">\r\n";
$emailContent .= "                <li>Date : " . date('d/m/Y H:i:s') . "</li>\r\n";
$emailContent .= "                <li>Serveur : live.smtp.mailtrap.io</li>\r\n";
$emailContent .= "                <li>Port : 587</li>\r\n";
$emailContent .= "                <li>Chiffrement : TLS</li>\r\n";
$emailContent .= "            </ul>\r\n";
$emailContent .= "        </div>\r\n";
$emailContent .= "        \r\n";
$emailContent .= "        <div style=\"background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;\">\r\n";
$emailContent .= "            <h3 style=\"color: #333; margin: 0 0 10px 0;\">Prochaines étapes :</h3>\r\n";
$emailContent .= "            <ol style=\"color: #666; margin: 0;\">\r\n";
$emailContent .= "                <li>Configurer le fichier .env avec ces paramètres</li>\r\n";
$emailContent .= "                <li>Tester les emails automatiques de l'application</li>\r\n";
$emailContent .= "                <li>Configurer les templates d'emails</li>\r\n";
$emailContent .= "            </ol>\r\n";
$emailContent .= "        </div>\r\n";
$emailContent .= "        \r\n";
$emailContent .= "        <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;\">\r\n";
$emailContent .= "            <p style=\"color: #666; font-size: 12px;\">© " . date('Y') . " Terrains Synthétiques Dakar</p>\r\n";
$emailContent .= "        </div>\r\n";
$emailContent .= "    </div>\r\n";
$emailContent .= "</body>\r\n";
$emailContent .= "</html>\r\n";

// Sauvegarder le contenu dans un fichier temporaire
$tempFile = 'email_test.txt';
file_put_contents($tempFile, $emailContent);

echo "📧 Envoi d'email de test...\n";
echo "Destinataire : {$toEmail}\n";
echo "Token : " . substr($apiToken, 0, 10) . "...\n\n";

// Commande cURL
$curlCommand = "curl --ssl-reqd --url 'smtp://live.smtp.mailtrap.io:587' --user 'api:{$apiToken}' --mail-from hello@demomailtrap.co --mail-rcpt {$toEmail} --upload-file {$tempFile}";

echo "Commande cURL :\n{$curlCommand}\n\n";

// Exécuter la commande
$output = shell_exec($curlCommand . " 2>&1");

echo "Résultat :\n";
echo $output . "\n";

// Nettoyer le fichier temporaire
unlink($tempFile);

echo "=== FIN DU TEST ===\n";
echo "Vérifiez votre inbox Mailtrap pour voir l'email.\n";






















