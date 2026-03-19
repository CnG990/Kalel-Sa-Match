from django.contrib import admin
from .models import Reservation, Disponibilite, CreneauReservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'terrain', 'user', 'date_debut', 'date_fin', 
        'duree_heures', 'montant_total', 'statut', 'created_at'
    ]
    list_filter = ['statut', 'created_at', 'terrain']
    search_fields = ['user__email', 'terrain__nom', 'code_ticket']
    readonly_fields = ['qr_code_token', 'code_ticket', 'created_at', 'updated_at']
    date_hierarchy = 'date_debut'
    ordering = ['-date_debut']


@admin.register(Disponibilite)
class DisponibiliteAdmin(admin.ModelAdmin):
    list_display = ['terrain', 'date', 'heure_debut', 'heure_fin', 'est_disponible']
    list_filter = ['est_disponible', 'date']
    search_fields = ['terrain__nom']


@admin.register(CreneauReservation)
class CreneauReservationAdmin(admin.ModelAdmin):
    list_display = ['terrain', 'jour_semaine', 'heure_debut', 'heure_fin', 'est_actif']
    list_filter = ['est_actif', 'jour_semaine']
    search_fields = ['terrain__nom']
