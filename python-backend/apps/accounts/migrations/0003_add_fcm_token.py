# Generated migration for FCM token

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_add_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='fcm_token',
            field=models.CharField(
                blank=True,
                help_text='Firebase Cloud Messaging token pour notifications push',
                max_length=255,
                null=True
            ),
        ),
    ]
