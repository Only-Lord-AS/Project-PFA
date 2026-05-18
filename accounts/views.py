from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import MemberSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class InscriptionView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = MemberSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        

        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['nom_complet'] = user.nom_complet
        
        return Response({
            'user': MemberSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Token invalide ou déjà blacklisté."}, status=status.HTTP_400_BAD_REQUEST)

class ProfilView(generics.RetrieveAPIView):
    serializer_class = MemberSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

class IsAdminUserCustom(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class AdminUtilisateursViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_inscription')
    serializer_class = MemberSerializer
    permission_classes = [IsAdminUserCustom]


class IsSuperAdmin(BasePermission):
    """Only allows access to admins with admin_specialite == SUPER"""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
            and getattr(request.user, 'admin_specialite', '') == 'SUPER'
        )


class CreateAdminView(APIView):
    """Super Admin can create new admin accounts"""
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        nom_complet = request.data.get('nom_complet', '').strip()
        admin_specialite = request.data.get('admin_specialite', 'UTILISATEURS')

        if not email or not password or not nom_complet:
            return Response(
                {"detail": "Email, mot de passe et nom complet sont obligatoires."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Un compte avec cet email existe déjà."},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_specs = ['SUPER', 'UTILISATEURS', 'COMMANDES', 'PRODUITS', 'SECURITE']
        if admin_specialite not in valid_specs:
            return Response(
                {"detail": f"Spécialité invalide. Valeurs autorisées : {', '.join(valid_specs)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create(
            email=email,
            nom_complet=nom_complet,
            role='ADMIN',
            admin_specialite=admin_specialite,
        )
        user.set_password(password)
        user.save()

        return Response({
            "detail": f"Administrateur '{nom_complet}' créé avec succès.",
            "user": MemberSerializer(user).data,
        }, status=status.HTTP_201_CREATED)