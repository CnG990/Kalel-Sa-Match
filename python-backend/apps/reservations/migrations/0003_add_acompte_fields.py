# Migration to add acompte (deposit) fields to Reservation model

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
        ('reservations', '0002_add_indexes'),
    ]

    operations = [
        # Add acompte amount field
        migrations.AddField(
            model_name='reservation',
            name='montant_acompte',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text="Montant de l'acompte à payer",
                max_digits=10,
                null=True,
            ),
        ),
        # Add remaining amount field
        migrations.AddField(
            model_name='reservation',
            name='montant_restant',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Solde restant à payer',
                max_digits=10,
                null=True,
            ),
        ),
        # Add acompte paid flag
        migrations.AddField(
            model_name='reservation',
            name='acompte_paye',
            field=models.BooleanField(
                default=False,
                help_text="L'acompte a été payé",
            ),
        ),
        # Add solde paid flag
        migrations.AddField(
            model_name='reservation',
            name='solde_paye',
            field=models.BooleanField(
                default=False,
                help_text='Le solde a été payé',
            ),
        ),
        # Add validation notes
        migrations.AddField(
            model_name='reservation',
            name='validation_notes',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        # Add paiement_acompte FK
        migrations.AddField(
            model_name='reservation',
            name='paiement_acompte',
            field=models.ForeignKey(
                blank=True,
                help_text="Paiement de l'acompte",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reservation_acompte',
                to='payments.payment',
            ),
        ),
        # Add paiement_solde FK
        migrations.AddField(
            model_name='reservation',
            name='paiement_solde',
            field=models.ForeignKey(
                blank=True,
                help_text='Paiement du solde',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reservation_solde',
                to='payments.payment',
            ),
        ),
        # Update statut choices to include new statuses
        migrations.AlterField(
            model_name='reservation',
            name='statut',
            field=models.CharField(
                choices=[
                    ('en_attente_validation', 'En attente validation gestionnaire'),
                    ('refusee', 'Refusée par le gestionnaire'),
                    ('en_attente', 'En attente de paiement'),
                    ('acompte_paye', 'Acompte payé - Solde à payer'),
                    ('confirmee', 'Confirmée (entièrement payée)'),
                    ('annulee', 'Annulée'),
                    ('terminee', 'Terminée'),
                    ('en_cours', 'En cours'),
                ],
                default='en_attente_validation',
                max_length=30,
            ),
        ),
        # Update paiement legacy related_name
        migrations.AlterField(
            model_name='reservation',
            name='paiement',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reservation_legacy',
                to='payments.payment',
            ),
        ),
    ]
