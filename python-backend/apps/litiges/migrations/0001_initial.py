# Generated migration for litiges app

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('reservations', '0003_add_acompte_fields'),
        ('terrains', '0002_terrainsynthetiquesdakar_capacite_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Litige',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('titre', models.CharField(help_text='Titre court du litige', max_length=200)),
                ('type_litige', models.CharField(
                    choices=[
                        ('annulation', "Problème d'annulation"),
                        ('remboursement', 'Demande de remboursement'),
                        ('qualite', 'Problème de qualité du terrain'),
                        ('service', 'Problème de service'),
                        ('facturation', 'Problème de facturation'),
                        ('autre', 'Autre'),
                    ],
                    default='autre',
                    help_text='Type de litige',
                    max_length=20,
                )),
                ('description', models.TextField(help_text='Description détaillée du problème')),
                ('statut', models.CharField(
                    choices=[
                        ('ouvert', 'Ouvert'),
                        ('en_cours', 'En cours de traitement'),
                        ('resolu', 'Résolu'),
                        ('ferme', 'Fermé'),
                    ],
                    default='ouvert',
                    help_text='Statut actuel du litige',
                    max_length=20,
                )),
                ('priorite', models.CharField(
                    choices=[
                        ('basse', 'Basse'),
                        ('moyenne', 'Moyenne'),
                        ('haute', 'Haute'),
                        ('urgente', 'Urgente'),
                    ],
                    default='moyenne',
                    help_text='Niveau de priorité',
                    max_length=20,
                )),
                ('resolution', models.TextField(blank=True, help_text='Description de la résolution apportée', null=True)),
                ('date_resolution', models.DateTimeField(blank=True, help_text='Date de résolution du litige', null=True)),
                ('montant_rembourse', models.DecimalField(blank=True, decimal_places=2, help_text='Montant remboursé si applicable', max_digits=10, null=True)),
                ('pieces_jointes', models.JSONField(blank=True, default=list, help_text='URLs des pièces jointes (screenshots, etc.)')),
                ('notes_internes', models.TextField(blank=True, help_text='Notes internes visibles uniquement par les admins', null=True)),
                ('client', models.ForeignKey(
                    help_text='Client ayant créé le litige',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='litiges_crees',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('gestionnaire', models.ForeignKey(
                    blank=True,
                    help_text='Gestionnaire concerné par le litige',
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='litiges_recus',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('admin_assigne', models.ForeignKey(
                    blank=True,
                    help_text='Admin assigné au traitement du litige',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='litiges_assignes',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('reservation', models.ForeignKey(
                    blank=True,
                    help_text='Réservation concernée par le litige',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='litiges',
                    to='reservations.reservation',
                )),
                ('terrain', models.ForeignKey(
                    blank=True,
                    help_text='Terrain concerné',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='litiges',
                    to='terrains.terrainsynthetiquesdakar',
                )),
            ],
            options={
                'verbose_name': 'Litige',
                'verbose_name_plural': 'Litiges',
                'db_table': 'litiges',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['statut', '-created_at'], name='litiges_statut_created_idx'),
                    models.Index(fields=['client', '-created_at'], name='litiges_client_created_idx'),
                    models.Index(fields=['gestionnaire', '-created_at'], name='litiges_gestionnaire_idx'),
                    models.Index(fields=['priorite', 'statut'], name='litiges_priorite_statut_idx'),
                ],
            },
        ),
        migrations.CreateModel(
            name='MessageLitige',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('contenu', models.TextField(help_text='Contenu du message')),
                ('est_interne', models.BooleanField(default=False, help_text='Message visible uniquement par les admins')),
                ('pieces_jointes', models.JSONField(blank=True, default=list, help_text='URLs des pièces jointes')),
                ('litige', models.ForeignKey(
                    help_text='Litige concerné',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='messages',
                    to='litiges.litige',
                )),
                ('auteur', models.ForeignKey(
                    help_text='Auteur du message',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='messages_litiges',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Message de litige',
                'verbose_name_plural': 'Messages de litiges',
                'db_table': 'messages_litiges',
                'ordering': ['created_at'],
                'indexes': [
                    models.Index(fields=['litige', 'created_at'], name='msg_litige_created_idx'),
                ],
            },
        ),
    ]
