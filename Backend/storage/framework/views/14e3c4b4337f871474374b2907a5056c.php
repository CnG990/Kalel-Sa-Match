<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Email - Terrains Synthetiques</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎾 Terrains Synthetiques</h1>
        </div>
        
        <div class="content">
            <h2>Bonjour <?php echo e($name); ?> !</h2>
            <p><?php echo e($message); ?></p>
            <p>Ceci est un test de la configuration SMTP Mailtrap pour votre application de gestion de terrains synthétiques.</p>
            
            <h3>Fonctionnalités testées :</h3>
            <ul>
                <li>✅ Configuration SMTP Mailtrap</li>
                <li>✅ Envoi d'emails avec Laravel</li>
                <li>✅ Templates Blade</li>
                <li>✅ Variables dans les templates</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Test effectué le <?php echo e(date('d/m/Y H:i:s')); ?></p>
            <p>Application Terrains Synthetiques - Laravel 12</p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\Terrains-Synthetiques\Backend\resources\views/emails/test.blade.php ENDPATH**/ ?>