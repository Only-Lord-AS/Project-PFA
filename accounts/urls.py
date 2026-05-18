from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import InscriptionView, CustomTokenObtainPairView, LogoutView, ProfilView, AdminUtilisateursViewSet, CreateAdminView

router = DefaultRouter()
router.register(r'admin/users', AdminUtilisateursViewSet, basename='admin-users')

urlpatterns = [
    path('auth/register/', InscriptionView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', ProfilView.as_view(), name='profil'),
    path('auth/', include(router.urls)),
    path('auth/admin/create-admin/', CreateAdminView.as_view(), name='create-admin'),
]
