from django.urls import path
from . import views

urlpatterns = [
    path('init/', views.init_payment, name='init_payment'),
    path('wave/webhook/', views.wave_webhook, name='wave_webhook'),
    path('<int:payment_id>/status/', views.payment_status, name='payment_status'),
    path('my/', views.my_payments, name='my_payments'),
]
