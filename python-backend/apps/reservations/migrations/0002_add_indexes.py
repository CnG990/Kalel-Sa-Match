# Generated migration for reservations performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0001_initial'),
    ]

    operations = [
        # Index sur dates pour recherche disponibilités
        migrations.AddIndex(
            model_name='reservation',
            index=models.Index(fields=['date_debut', 'date_fin'], name='resa_dates_idx'),
        ),
        
        # Index sur statut pour filtrage rapide
        migrations.AddIndex(
            model_name='reservation',
            index=models.Index(fields=['statut'], name='resa_statut_idx'),
        ),
        
        # Index composite terrain + dates (requête la plus fréquente)
        migrations.AddIndex(
            model_name='reservation',
            index=models.Index(fields=['terrain', 'date_debut', 'date_fin'], name='resa_terrain_dates_idx'),
        ),
        
        # Index sur user pour "mes réservations"
        migrations.AddIndex(
            model_name='reservation',
            index=models.Index(fields=['user', 'created_at'], name='resa_user_created_idx'),
        ),
        
        # Index sur QR code pour validation rapide
        migrations.AddIndex(
            model_name='reservation',
            index=models.Index(fields=['qr_code_token'], name='resa_qr_idx'),
        ),
    ]
