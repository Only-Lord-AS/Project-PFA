from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FamilleViewSet, ArticleViewSet, VendeurArticleViewSet, AdminArticleViewSet

router_public = DefaultRouter()
router_public.register(r'familles', FamilleViewSet, basename='famille')
router_public.register(r'articles', ArticleViewSet, basename='article-public')

router_vendeur = DefaultRouter()
router_vendeur.register(r'articles', VendeurArticleViewSet, basename='article-vendeur')

router_admin = DefaultRouter()
router_admin.register(r'articles', AdminArticleViewSet, basename='article-admin')

urlpatterns = [
    # Routes publiques (et admin pour Familles)
    path('catalogue/', include(router_public.urls)),
    
    # Routes réservées au vendeur
    path('vendeur/', include(router_vendeur.urls)),
    
    # Routes réservées à l'administrateur
    path('admin/', include(router_admin.urls)),
]
