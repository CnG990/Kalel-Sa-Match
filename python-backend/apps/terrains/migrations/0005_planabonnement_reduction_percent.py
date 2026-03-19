from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('terrains', '0004_planabonnement_demandeabonnement'),
    ]

    operations = [
        migrations.AddField(
            model_name='planabonnement',
            name='reduction_percent',
            field=models.DecimalField(default=0, max_digits=5, decimal_places=2),
        ),
    ]
