from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer, UserSerializer


User = get_user_model()


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == User.Role.ADMIN
        )


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'per_page'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'data': {
                'count': self.page.paginator.count,
                'current_page': self.page.number,
                'last_page': self.page.paginator.num_pages,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'results': data,
            },
            'meta': {'success': True}
        })


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'data': UserSerializer(user).data, 'meta': {'success': True, 'message': 'Inscription réussie'}}, status=201)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'data': UserSerializer(request.user).data, 'meta': {'success': True}})

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data, 'meta': {'success': True, 'message': 'Profil mis à jour'}})

    def post(self, request):
        """Change password endpoint"""
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        new_password_confirmation = request.data.get('new_password_confirmation')

        if not current_password or not new_password or not new_password_confirmation:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Tous les champs sont requis'}}, status=400)

        if not request.user.check_password(current_password):
            return Response({'data': None, 'meta': {'success': False, 'message': 'Mot de passe actuel incorrect'}}, status=400)

        if new_password != new_password_confirmation:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Les mots de passe ne correspondent pas'}}, status=400)

        if len(new_password) < 6:
            return Response({'data': None, 'meta': {'success': False, 'message': 'Le mot de passe doit contenir au moins 6 caractères'}}, status=400)

        request.user.set_password(new_password)
        request.user.save()
        return Response({'data': None, 'meta': {'success': True, 'message': 'Mot de passe modifié avec succès'}})


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search)
                | Q(prenom__icontains=search)
                | Q(email__icontains=search)
            )

        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        statut = self.request.query_params.get('statut_validation')
        if statut:
            queryset = queryset.filter(statut_validation=statut)

        return queryset
