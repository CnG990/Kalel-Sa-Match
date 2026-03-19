from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("terrains", "0004_planabonnement_demandeabonnement"),
    ]

    operations = [
        migrations.AlterField(
            model_name="terrainsynthetiquesdakar",
            name="nombre_joueurs",
            field=models.CharField(
                max_length=100,
                default="5v5",
                help_text='Format(s) de jeu, ex: "5v5, 7v7"',
                blank=True,
            ),
        ),
    ]
