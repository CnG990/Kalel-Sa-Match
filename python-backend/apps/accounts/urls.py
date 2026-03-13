from django.urls import path

from .views import LoginView, ProfileView, RegisterView, UserListView, GoogleLoginView
from .views_upload import upload_profile_image
from .views_admin import list_users, dashboard_stats, update_user_status, delete_user

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('me/', ProfileView.as_view(), name='profile'),
    path('users/', list_users, name='users-list-admin'),
    path('users/<int:user_id>/', update_user_status, name='update-user-status'),
    path('users/<int:user_id>/delete/', delete_user, name='delete-user'),
    path('change-password/', ProfileView.as_view(), name='change-password'),
    path('profile/upload-image/', upload_profile_image, name='upload-profile-image'),
]
