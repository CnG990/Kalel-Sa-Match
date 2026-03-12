from django.contrib import admin
from .models import Payment, WavePayment, OrangeMoneyPayment


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


@admin.register(OrangeMoneyPayment)
class OrangeMoneyPaymentAdmin(admin.ModelAdmin):
    list_display = ['payment', 'transaction_id', 'customer_phone', 'customer_name', 'created_at']
    readonly_fields = ['payment', 'transaction_id', 'otp', 'created_at']
