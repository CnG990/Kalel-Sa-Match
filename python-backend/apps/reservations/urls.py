from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_reservation, name='create_reservation'),
    path('my/', views.my_reservations, name='my_reservations'),
    path('<int:reservation_id>/', views.reservation_detail, name='reservation_detail'),
    path('<int:reservation_id>/cancel/', views.cancel_reservation, name='cancel_reservation'),
    path('validate-qr/', views.validate_qr_code, name='validate_qr_code'),
    path('check/', views.check_disponibilite, name='check_disponibilite'),
    path('<int:terrain_id>/disponibilites/', views.terrain_disponibilites, name='terrain_disponibilites'),
]
