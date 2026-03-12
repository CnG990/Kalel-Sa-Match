from django.contrib import admin
from .models import Payment, WavePayment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference', 'montant', 'methode', 'statut', 'user', 'created_at']
    list_filter = ['statut', 'methode', 'created_at']
    search_fields = ['reference', 'user__email']
    readonly_fields = ['reference', 'transaction_id', 'created_at', 'updated_at']


@admin.register(WavePayment)
class WavePaymentAdmin(admin.ModelAdmin):
    list_display = ['payment', 'customer_phone', 'customer_name', 'checkout_url', 'created_at']
    readonly_fields = ['payment', 'checkout_url', 'payment_token', 'created_at']
