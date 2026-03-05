from django.urls import path

from .views import LoginView, ProfileView, RegisterView, UserListView
from .views_upload import upload_profile_image

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', ProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='users-list'),
    path('change-password/', ProfileView.as_view(), name='change-password'),
    path('profile/upload-image/', upload_profile_image, name='upload-profile-image'),
]
