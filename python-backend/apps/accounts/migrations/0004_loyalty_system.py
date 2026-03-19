# Generated migration for loyalty system

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_add_fcm_token'),
    ]

    operations = [
        migrations.CreateModel(
            name='LoyaltyConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points_par_fcfa', models.DecimalField(decimal_places=2, default=1.0, help_text='Points gagnés pour chaque 1000 FCFA dépensés', max_digits=6)),
                ('fcfa_par_point', models.DecimalField(decimal_places=2, default=100.0, help_text="Valeur en FCFA de 1 point lors de l'utilisation", max_digits=6)),
                ('points_inscription', models.IntegerField(default=500, help_text="Points bonus lors de l'inscription")),
                ('points_parrainage_parrain', models.IntegerField(default=1000, help_text='Points pour le parrain')),
                ('points_parrainage_filleul', models.IntegerField(default=500, help_text='Points pour le filleul')),
                ('points_minimum_utilisation', models.IntegerField(default=1000, help_text='Nombre minimum de points pour utiliser')),
                ('pourcentage_max_paiement', models.IntegerField(default=50, help_text='% max du paiement payable en points (ex: 50 = max 50%)')),
                ('est_actif', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Configuration Fidélité',
                'db_table': 'loyalty_config',
            },
        ),
        migrations.CreateModel(
            name='LoyaltyReward',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('titre', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('points_requis', models.IntegerField()),
                ('type_recompense', models.CharField(choices=[('reduction', 'Réduction en %'), ('montant_fixe', 'Montant fixe'), ('heure_gratuite', 'Heure gratuite'), ('cadeau', 'Cadeau physique')], max_length=20)),
                ('valeur', models.DecimalField(decimal_places=2, help_text='Valeur de la réduction ou montant', max_digits=10)),
                ('stock', models.IntegerField(blank=True, help_text='Stock disponible (null = illimité)', null=True)),
                ('est_actif', models.BooleanField(default=True)),
                ('image_url', models.URLField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Récompense Fidélité',
                'verbose_name_plural': 'Récompenses Fidélité',
                'db_table': 'loyalty_rewards',
                'ordering': ['points_requis'],
            },
        ),
        migrations.CreateModel(
            name='LoyaltyAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('points_balance', models.IntegerField(default=0, help_text='Solde actuel de points')),
                ('points_lifetime', models.IntegerField(default=0, help_text='Total points gagnés depuis inscription')),
                ('points_used', models.IntegerField(default=0, help_text='Total points utilisés')),
                ('niveau', models.CharField(choices=[('bronze', 'Bronze'), ('argent', 'Argent'), ('or', 'Or'), ('platine', 'Platine')], default='bronze', max_length=20)),
                ('code_parrainage', models.CharField(help_text="Code unique pour parrainer d'autres clients", max_length=10, unique=True)),
                ('parrain', models.ForeignKey(blank=True, help_text='Utilisateur qui a parrainé ce client', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='filleuls', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='loyalty_account', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Compte Fidélité',
                'verbose_name_plural': 'Comptes Fidélité',
                'db_table': 'loyalty_accounts',
            },
        ),
        migrations.CreateModel(
            name='LoyaltyTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('type', models.CharField(choices=[('credit', 'Crédit'), ('debit', 'Débit')], max_length=10)),
                ('points', models.IntegerField()),
                ('raison', models.CharField(max_length=255)),
                ('reference', models.CharField(blank=True, max_length=255, null=True)),
                ('balance_apres', models.IntegerField()),
                ('loyalty_account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='accounts.loyaltyaccount')),
            ],
            options={
                'verbose_name': 'Transaction Fidélité',
                'verbose_name_plural': 'Transactions Fidélité',
                'db_table': 'loyalty_transactions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='LoyaltyRedemption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('points_utilises', models.IntegerField()),
                ('statut', models.CharField(choices=[('en_attente', 'En attente'), ('validee', 'Validée'), ('livree', 'Livrée'), ('annulee', 'Annulée')], default='en_attente', max_length=20)),
                ('code_validation', models.CharField(max_length=20, unique=True)),
                ('loyalty_account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='redemptions', to='accounts.loyaltyaccount')),
                ('reward', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='redemptions', to='accounts.loyaltyreward')),
            ],
            options={
                'verbose_name': 'Échange Fidélité',
                'verbose_name_plural': 'Échanges Fidélité',
                'db_table': 'loyalty_redemptions',
            },
        ),
    ]
