from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terrains', '0002_terrainsynthetiquesdakar_capacite_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='type_surface',
            field=models.CharField(
                choices=[
                    ('gazon_synthetique', 'Gazon synthétique'),
                    ('gazon_naturel', 'Gazon naturel'),
                    ('terre_battue', 'Terre battue'),
                    ('beton', 'Béton'),
                    ('sable', 'Sable'),
                    ('autre', 'Autre'),
                ],
                default='gazon_synthetique',
                help_text='Type de surface du terrain',
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='longueur',
            field=models.DecimalField(
                blank=True, decimal_places=2, help_text='Longueur du terrain en mètres',
                max_digits=6, null=True,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='largeur',
            field=models.DecimalField(
                blank=True, decimal_places=2, help_text='Largeur du terrain en mètres',
                max_digits=6, null=True,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='nombre_joueurs',
            field=models.CharField(
                choices=[
                    ('5v5', '5 contre 5'),
                    ('7v7', '7 contre 7'),
                    ('9v9', '9 contre 9'),
                    ('11v11', '11 contre 11'),
                ],
                default='5v5',
                help_text='Format de jeu',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='eclairage',
            field=models.BooleanField(default=False, help_text='Éclairage nocturne disponible'),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='vestiaires',
            field=models.BooleanField(default=False, help_text='Vestiaires disponibles'),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='parking',
            field=models.BooleanField(default=False, help_text='Parking disponible'),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='douches',
            field=models.BooleanField(default=False, help_text='Douches disponibles'),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='buvette',
            field=models.BooleanField(default=False, help_text='Buvette / espace détente'),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='telephone',
            field=models.CharField(blank=True, default='', help_text='Téléphone de contact', max_length=20),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='ville',
            field=models.CharField(blank=True, default='', help_text='Ville', max_length=100),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='quartier',
            field=models.CharField(blank=True, default='', help_text='Quartier', max_length=100),
        ),
    ]
