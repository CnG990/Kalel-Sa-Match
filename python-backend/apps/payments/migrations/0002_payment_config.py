# Generated migration for PaymentConfig

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('methode', models.CharField(choices=[('wave', 'Wave Business'), ('orange_money', 'Orange Money')], help_text='Méthode de paiement', max_length=20, unique=True)),
                ('est_actif', models.BooleanField(default=True, help_text='Activer/désactiver cette méthode de paiement')),
                ('wave_payment_link', models.URLField(blank=True, help_text='Lien Wave Business principal (ex: https://pay.wave.com/m/M_sn_OnnKDQNjnuxG/c/sn/)', null=True)),
                ('wave_merchant_name', models.CharField(blank=True, default='Kalel Sa Match', help_text='Nom du compte marchand Wave', max_length=255, null=True)),
                ('wave_merchant_id', models.CharField(blank=True, help_text='ID marchand Wave (ex: M_sn_OnnKDQNjnuxG)', max_length=100, null=True)),
                ('orange_merchant_number', models.CharField(blank=True, help_text='Numéro marchand Orange Money principal (ex: 77 123 45 67)', max_length=20, null=True)),
                ('orange_merchant_name', models.CharField(blank=True, default='Kalel Sa Match', help_text='Nom du compte marchand Orange Money', max_length=255, null=True)),
                ('commission_pourcentage', models.DecimalField(decimal_places=2, default=0.0, help_text='Commission plateforme en % (ex: 2.5 pour 2.5%)', max_digits=5)),
                ('instructions', models.TextField(blank=True, help_text='Instructions de paiement affichées aux clients', null=True)),
                ('logo_url', models.URLField(blank=True, help_text='URL du logo de la méthode de paiement', null=True)),
                ('ordre_affichage', models.IntegerField(default=0, help_text="Ordre d'affichage sur le frontend (0 = premier)")),
            ],
            options={
                'verbose_name': 'Configuration Paiement',
                'verbose_name_plural': 'Configurations Paiements',
                'db_table': 'payment_configs',
                'ordering': ['ordre_affichage', 'methode'],
            },
        ),
        migrations.CreateModel(
            name='PaymentStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True, unique=True)),
                ('wave_count', models.IntegerField(default=0)),
                ('wave_total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('wave_success_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('orange_count', models.IntegerField(default=0)),
                ('orange_total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('orange_success_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('total_count', models.IntegerField(default=0)),
                ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
            ],
            options={
                'verbose_name': 'Statistique Paiement',
                'verbose_name_plural': 'Statistiques Paiements',
                'db_table': 'payment_stats',
                'ordering': ['-date'],
            },
        ),
    ]
