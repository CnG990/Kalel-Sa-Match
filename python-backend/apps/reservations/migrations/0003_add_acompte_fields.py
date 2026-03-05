# Generated migration for adding acompte/solde fields to Reservation

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0002_add_indexes'),
        ('payments', '0001_initial'),
    ]

    operations = [
        # Add montant_acompte
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
        # Add montant_restant
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
        # Add acompte_paye
        migrations.AddField(
            model_name='reservation',
            name='acompte_paye',
            field=models.BooleanField(
                default=False,
                help_text="L'acompte a été payé",
            ),
        ),
        # Add solde_paye
        migrations.AddField(
            model_name='reservation',
            name='solde_paye',
            field=models.BooleanField(
                default=False,
                help_text='Le solde a été payé',
            ),
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
        # Update statut choices
        migrations.AlterField(
            model_name='reservation',
            name='statut',
            field=models.CharField(
                choices=[
                    ('en_attente', 'En attente de paiement'),
                    ('acompte_paye', 'Acompte payé - Solde à payer'),
                    ('confirmee', 'Confirmée (entièrement payée)'),
                    ('annulee', 'Annulée'),
                    ('terminee', 'Terminée'),
                    ('en_cours', 'En cours'),
                ],
                default='en_attente',
                max_length=20,
            ),
        ),
    ]
