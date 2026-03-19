from django.urls import path
from . import views
from .views_payment import pay_balance, reservation_payment_status

urlpatterns = [
    path('', views.create_reservation, name='create_reservation'),
    path('my/', views.my_reservations, name='my_reservations'),
    path('tickets/', views.user_tickets, name='user_tickets'),
    path('<int:reservation_id>/', views.reservation_detail, name='reservation_detail'),
    path('<int:reservation_id>/ticket/', views.reservation_ticket, name='reservation_ticket'),
    path('test-ticket/<int:reservation_id>/', views.test_ticket, name='test_ticket'),
    path('<int:reservation_id>/cancel/', views.cancel_reservation, name='cancel_reservation'),
    path('<int:reservation_id>/pay-balance/', pay_balance, name='pay_balance'),
    path('<int:reservation_id>/payment-status/', reservation_payment_status, name='payment_status'),
    path('validate-qr/', views.validate_qr_code, name='validate_qr_code'),
    path('check/', views.check_disponibilite, name='check_disponibilite'),
    path('<int:terrain_id>/disponibilites/', views.terrain_disponibilites, name='terrain_disponibilites'),
]
