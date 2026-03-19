from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('terrains', '0003_add_terrain_characteristics'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlanAbonnement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('nom', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('type_abonnement', models.CharField(choices=[('mensuel', 'Mensuel'), ('trimestriel', 'Trimestriel'), ('annuel', 'Annuel')], default='mensuel', max_length=20)),
                ('duree_jours', models.PositiveIntegerField(default=30)),
                ('prix', models.DecimalField(decimal_places=2, max_digits=10)),
                ('avantages', models.JSONField(blank=True, default=list)),
                ('actif', models.BooleanField(default=True)),
                ('terrain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='plans_abonnement', to='terrains.terrainsynthetiquesdakar')),
            ],
            options={
                'db_table': 'plan_abonnements',
                'ordering': ['terrain', 'type_abonnement', 'prix'],
            },
        ),
        migrations.CreateModel(
            name='DemandeAbonnement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('mode_paiement', models.CharField(choices=[('integral', 'Paiement intégral'), ('differe', 'Paiement différé'), ('par_seance', 'Paiement par séance')], default='integral', max_length=20)),
                ('nb_seances', models.PositiveIntegerField(default=1)),
                ('duree_seance', models.PositiveIntegerField(default=1)),
                ('jours_preferes', models.JSONField(blank=True, default=list)),
                ('creneaux_preferes', models.JSONField(blank=True, default=list)),
                ('prix_calcule', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('statut', models.CharField(choices=[('pending_manager', 'En attente gestionnaire'), ('pending_payment', 'En attente paiement'), ('active', 'Active'), ('refused', 'Refusée'), ('cancelled', 'Annulée')], default='pending_manager', max_length=20)),
                ('disponibilite_confirmee', models.BooleanField(default=False)),
                ('notes_manager', models.TextField(blank=True, default='')),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes', to='terrains.planabonnement')),
                ('terrain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes_abonnement', to='terrains.terrainsynthetiquesdakar')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes_abonnement', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'demandes_abonnement',
                'ordering': ['-created_at'],
            },
        ),
    ]
