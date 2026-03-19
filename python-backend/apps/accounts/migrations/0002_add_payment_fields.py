# Generated migration for payment fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='orange_money_number',
            field=models.CharField(
                blank=True,
                help_text='Numéro marchand Orange Money (ex: 77 123 45 67)',
                max_length=20,
                null=True
            ),
        ),
        migrations.AlterField(
            model_name='user',
            name='wave_contact_label',
            field=models.CharField(
                blank=True,
                help_text='Nom/description du compte Wave (ex: Kalel Sa Match)',
                max_length=255,
                null=True
            ),
        ),
    ]
