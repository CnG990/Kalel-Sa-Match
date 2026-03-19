"""
Admin pour la gestion des litiges
"""
from django.contrib import admin
from .models import Litige, MessageLitige


@admin.register(Litige)
class LitigeAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'titre', 'type_litige', 'statut', 'priorite',
        'client', 'gestionnaire', 'created_at'
    ]
    list_filter = ['statut', 'priorite', 'type_litige', 'created_at']
    search_fields = ['titre', 'description', 'client__email', 'gestionnaire__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('titre', 'type_litige', 'description', 'statut', 'priorite')
        }),
        ('Relations', {
            'fields': ('client', 'gestionnaire', 'admin_assigne', 'reservation', 'terrain')
        }),
        ('Résolution', {
            'fields': ('resolution', 'date_resolution', 'montant_rembourse')
        }),
        ('Métadonnées', {
            'fields': ('pieces_jointes', 'notes_internes', 'created_at', 'updated_at')
        }),
    )


@admin.register(MessageLitige)
class MessageLitigeAdmin(admin.ModelAdmin):
    list_display = ['id', 'litige', 'auteur', 'est_interne', 'created_at']
    list_filter = ['est_interne', 'created_at']
    search_fields = ['contenu', 'auteur__email', 'litige__titre']
    readonly_fields = ['created_at', 'updated_at']
