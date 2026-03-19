from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('litiges', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='litige',
            name='niveau_escalade',
            field=models.CharField(
                choices=[('client', 'Niveau client'), ('gestionnaire', 'Niveau gestionnaire'), ('admin', 'Niveau administration')],
                default='client',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='litige',
            name='statut',
            field=models.CharField(
                choices=[('ouvert', 'Ouvert'), ('en_cours', 'En cours de traitement'), ('escalade', 'Escaladé'), ('resolu', 'Résolu'), ('ferme', 'Fermé')],
                default='ouvert',
                max_length=20,
            ),
        ),
    ]
