<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($notification->type ?? 'Notification'); ?> - Terrains Synthétiques</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #28a745;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }
        .title {
            color: #28a745;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
            margin: 5px 0 0 0;
        }
        .content {
            margin-bottom: 30px;
        }
        .message {
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .details {
            background-color: #e9ecef;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
        }
        .detail-value {
            color: #6c757d;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background-color: #218838;
        }
        .priority-high {
            border-left-color: #dc3545;
        }
        .priority-normal {
            border-left-color: #28a745;
        }
        .priority-low {
            border-left-color: #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="<?php echo e(asset('images/logo-1.webp')); ?>" alt="Logo Terrains Synthétiques" class="logo">
            <h1 class="title">Terrains Synthétiques</h1>
            <p class="subtitle">Gestion intelligente des terrains de sport</p>
        </div>

        <div class="content">
            <h2><?php echo e($data['message'] ?? 'Nouvelle notification'); ?></h2>
            
            <?php if(isset($data['message'])): ?>
                <div class="message priority-<?php echo e($notification->priority ?? 'normal'); ?>">
                    <?php echo e($data['message']); ?>

                </div>
            <?php endif; ?>

            <?php if(count($data) > 1): ?>
                <div class="details">
                    <h3>Détails :</h3>
                    <?php $__currentLoopData = $data; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <?php if($key !== 'message' && !is_array($value)): ?>
                            <div class="detail-row">
                                <span class="detail-label"><?php echo e(ucfirst(str_replace('_', ' ', $key))); ?> :</span>
                                <span class="detail-value"><?php echo e($value); ?></span>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            <?php endif; ?>

            <?php if(isset($data['reservation_id'])): ?>
                <div style="text-align: center;">
                    <a href="<?php echo e(url('/reservations/' . $data['reservation_id'])); ?>" class="button">
                        Voir la réservation
                    </a>
                </div>
            <?php endif; ?>

            <?php if(isset($data['terrain_id'])): ?>
                <div style="text-align: center;">
                    <a href="<?php echo e(url('/terrains/' . $data['terrain_id'])); ?>" class="button">
                        Voir le terrain
                    </a>
                </div>
            <?php endif; ?>
        </div>

        <div class="footer">
            <p>Ce message a été envoyé automatiquement par le système Terrains Synthétiques.</p>
            <p>Si vous avez des questions, contactez-nous à support@terrains-synthetiques.com</p>
            <p>&copy; <?php echo e(date('Y')); ?> Terrains Synthétiques. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\Terrains-Synthetiques\Backend\resources\views/emails/notification.blade.php ENDPATH**/ ?>