# Migration to add all missing fields to TerrainSynthetiquesDakar

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terrains', '0002_terrainsynthetiquesdakar_capacite_and_more'),
    ]

    operations = [
        # Make image_principale and description optional
        migrations.AlterField(
            model_name='terrainsynthetiquesdakar',
            name='image_principale',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='terrainsynthetiquesdakar',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        # Add acompte config fields
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='type_acompte',
            field=models.CharField(
                choices=[('pourcentage', 'Pourcentage'), ('montant_fixe', 'Montant fixe')],
                default='pourcentage',
                help_text="Type d'acompte requis",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='pourcentage_acompte',
            field=models.DecimalField(
                decimal_places=2,
                default=30.00,
                help_text="Pourcentage d'acompte requis (ex: 30.00 pour 30%)",
                max_digits=5,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='montant_acompte_fixe',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text="Montant fixe d'acompte en FCFA (alternatif au pourcentage)",
                max_digits=10,
                null=True,
            ),
        ),
        # Add payment link fields
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='wave_payment_link',
            field=models.URLField(
                blank=True,
                help_text='Lien Wave Business personnel du gestionnaire',
                max_length=500,
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='orange_money_number',
            field=models.CharField(
                blank=True,
                help_text='Numéro Orange Money du gestionnaire',
                max_length=20,
            ),
        ),
        # Add horaires and equipements
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='horaires_ouverture',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Horaires d'ouverture par jour",
            ),
        ),
        migrations.AddField(
            model_name='terrainsynthetiquesdakar',
            name='equipements',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Liste des équipements disponibles',
            ),
        ),
    ]
