<?php

echo "=== TEST MAILTRAP ===\n\n";

echo "1. Récupérez votre token Mailtrap :\n";
echo "   - Allez sur https://mailtrap.io\n";
echo "   - Settings > API Tokens\n";
echo "   - Create Token\n";
echo "   - Copiez le token\n\n";

echo "2. Configuration .env :\n";
echo "MAIL_MAILER=smtp\n";
echo "MAIL_HOST=live.smtp.mailtrap.io\n";
echo "MAIL_PORT=587\n";
echo "MAIL_USERNAME=api\n";
echo "MAIL_PASSWORD=VOTRE_TOKEN_ICI\n";
echo "MAIL_ENCRYPTION=tls\n";
echo "MAIL_FROM_ADDRESS=hello@demomailtrap.co\n";
echo "MAIL_FROM_NAME=\"Terrains Synthétiques Dakar\"\n\n";

echo "3. Test avec cURL :\n";
echo "curl --ssl-reqd --url 'smtp://live.smtp.mailtrap.io:587' \\\n";
echo "--user 'api:VOTRE_TOKEN' \\\n";
echo "--mail-from hello@demomailtrap.co \\\n";
echo "--mail-rcpt test@example.com \\\n";
echo "--upload-file email.txt\n\n";

echo "4. Créer email.txt avec :\n";
echo "From: Terrains Dakar <hello@demomailtrap.co>\n";
echo "To: Test <test@example.com>\n";
echo "Subject: Test Mailtrap\n";
echo "Content-Type: text/html; charset=UTF-8\n\n";
echo "<h1>Test Mailtrap</h1>\n";
echo "<p>Configuration réussie !</p>\n";






















