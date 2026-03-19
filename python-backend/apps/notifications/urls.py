from django.urls import path

from . import views

urlpatterns = [
    path('register-device/', views.register_device, name='register-device'),
    path('unregister-device/', views.unregister_device, name='unregister-device'),
    path('status/', views.notification_status, name='notification-status'),
]
