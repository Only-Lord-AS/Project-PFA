from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db.models import Q
from .models import Famille, Article, PhotoArticle
from recommandation.models import JournalVisite
from .serializers import (
    FamilleSerializer, ArticleListSerializer, ArticleDetailSerializer, 
    ArticleWriteSerializer, PhotoArticleSerializer
)
from .permissions import IsVendeurProprietaire, IsAdminOrReadOnly
from .pagination import CataloguePagination

class FamilleViewSet(viewsets.ModelViewSet):
    queryset = Famille.objects.all()
    serializer_class = FamilleSerializer
    permission_classes = [IsAdminOrReadOnly]

class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vue publique pour les clients et visiteurs.
    """
    serializer_class = ArticleDetailSerializer
    pagination_class = CataloguePagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Exclure automatiquement les articles inactifs
        queryset = Article.objects.filter(actif=True)
        
        # Filtres
        famille = self.request.query_params.get('famille', None)
        prix_min = self.request.query_params.get('prix_min', None)
        prix_max = self.request.query_params.get('prix_max', None)
        vendeur = self.request.query_params.get('vendeur', None)
        recherche = self.request.query_params.get('recherche', None)
        tri = self.request.query_params.get('tri', None)

        if famille:
            queryset = queryset.filter(id_famille=famille)
        if vendeur:
            queryset = queryset.filter(id_vendeur=vendeur)
        if prix_min:
            queryset = queryset.filter(prix_vente__gte=prix_min)
        if prix_max:
            queryset = queryset.filter(prix_vente__lte=prix_max)
        if recherche:
            queryset = queryset.filter(
                Q(designation__icontains=recherche) | 
                Q(description__icontains=recherche)
            )

        # Tri
        if tri == 'prix_asc':
            queryset = queryset.order_by('prix_vente')
        elif tri == 'prix_desc':
            queryset = queryset.order_by('-prix_vente')
        elif tri == 'nouveaute':
            queryset = queryset.order_by('-date_ajout')
        else:
            queryset = queryset.order_by('-date_ajout') # par défaut

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleDetailSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vue(self, request, pk=None):
        """Enregistre une vue d'article pour l'algo de recommandation"""
        article = self.get_object()
        duree = request.data.get('duree_secondes', None)
        JournalVisite.objects.create(
            id_acheteur=request.user,
            id_article=article,
            duree_secondes=duree,
        )
        return Response({"detail": "Visite enregistrée"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def similaires(self, request, pk=None):
        """Retourne les articles similaires via le moteur de recommandation"""
        from recommandation.engine import articles_similaires as engine_similaires
        limite = int(request.query_params.get('limite', 4))
        articles = engine_similaires(self.get_object().id_article, limite=limite)
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)

class VendeurArticleViewSet(viewsets.ModelViewSet):
    """
    Vue pour les vendeurs gérant leur propre stock.
    """
    serializer_class = ArticleWriteSerializer
    permission_classes = [IsAuthenticated, IsVendeurProprietaire]

    def get_queryset(self):
        # Le vendeur ne voit que ses propres articles
        return Article.objects.filter(id_vendeur=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        # Archivage logique (actif=False)
        instance.actif = False
        instance.save()

    @action(detail=True, methods=['post'])
    def photos(self, request, pk=None):
        article = self.get_object()
        file = request.FILES.get('chemin_fichier')
        est_principale = request.data.get('est_principale', 'true').lower() == 'true'
        
        if file:
            # Save uploaded file to media/produits/
            import os, uuid
            from django.conf import settings
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'produits')
            os.makedirs(upload_dir, exist_ok=True)
            ext = os.path.splitext(file.name)[1].lower()
            filename = f"{uuid.uuid4().hex}{ext}"
            filepath = os.path.join(upload_dir, filename)
            with open(filepath, 'wb+') as dest:
                for chunk in file.chunks():
                    dest.write(chunk)
            chemin = f"produits/{filename}"
        else:
            chemin = request.data.get('chemin_fichier', '')
        
        photo = PhotoArticle.objects.create(
            id_article=article,
            chemin_fichier=chemin,
            est_principale=est_principale,
        )
        return Response({
            'id_photo': photo.id_photo,
            'chemin_fichier': chemin,
            'est_principale': photo.est_principale,
        }, status=status.HTTP_201_CREATED)

class AdminArticleViewSet(viewsets.ReadOnlyModelViewSet, mixins.DestroyModelMixin, mixins.UpdateModelMixin):
    """
    Vue pour l'administrateur, voit tout et peut modifier ou supprimer définitivement.
    """
    queryset = Article.objects.all()
    serializer_class = ArticleDetailSerializer
    permission_classes = [IsAdminUser]
