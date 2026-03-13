from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

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


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        email = request.data.get('email')
        nom = request.data.get('nom', '')
        prenom = request.data.get('prenom', '')
        photo_url = request.data.get('photo_url')
        firebase_token = request.data.get('firebase_token')

        if not uid or not email:
            return Response({
                'data': None, 
                'meta': {'success': False, 'message': 'UID et email sont requis'}
            }, status=400)

        try:
            # Vérifier si l'utilisateur existe déjà avec ce Firebase UID
            user = User.objects.filter(firebase_uid=uid).first()
            
            if user:
                # Utilisateur Google existant - mettre à jour les infos si nécessaire
                user.photo_url = photo_url
                user.save(update_fields=['photo_url'])
            else:
                # Vérifier si un utilisateur avec le même email existe
                existing_user = User.objects.filter(email=email).first()
                if existing_user:
                    if existing_user.firebase_uid:
                        # Email déjà utilisé par un autre compte Google
                        return Response({
                            'data': None,
                            'meta': {'success': False, 'message': 'Cet email est déjà associé à un compte Google'}
                        }, status=400)
                    else:
                        # Lier le compte existant à Google
                        existing_user.firebase_uid = uid
                        existing_user.is_google_user = True
                        existing_user.photo_url = photo_url
                        existing_user.save(update_fields=['firebase_uid', 'is_google_user', 'photo_url'])
                        user = existing_user
                else:
                    # Créer un nouvel utilisateur Google
                    user = User.objects.create(
                        email=email,
                        nom=nom,
                        prenom=prenom,
                        firebase_uid=uid,
                        photo_url=photo_url,
                        is_google_user=True,
                        statut_validation='approuve',  # Auto-approuver les utilisateurs Google
                        email_verified_at=timezone.now(),
                        is_active=True
                    )

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })

        except Exception as e:
            return Response({
                'data': None,
                'meta': {'success': False, 'message': f'Erreur lors de la connexion Google: {str(e)}'}
            }, status=500)


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
