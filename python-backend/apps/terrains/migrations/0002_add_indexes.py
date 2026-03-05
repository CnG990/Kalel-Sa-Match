# Generated migration for performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terrains', '0001_initial'),
    ]

    operations = [
        # Index géospatial sur latitude/longitude pour recherches proximité
        migrations.AddIndex(
            model_name='terrainsynthetiquesداkar',
            index=models.Index(fields=['latitude', 'longitude'], name='terrain_geo_idx'),
        ),
        
        # Index sur est_actif pour filtrage rapide
        migrations.AddIndex(
            model_name='terrainsynthetiquesداkar',
            index=models.Index(fields=['est_actif'], name='terrain_actif_idx'),
        ),
        
        # Index composite pour requêtes fréquentes
        migrations.AddIndex(
            model_name='terrainsynthetiquesداkar',
            index=models.Index(fields=['gestionnaire', 'est_actif'], name='terrain_gest_actif_idx'),
        ),
        
        # Index sur prix pour tri/filtre
        migrations.AddIndex(
            model_name='terrainsynthetiquesداkar',
            index=models.Index(fields=['prix_heure'], name='terrain_prix_idx'),
        ),
    ]
