from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .engine import recommander_articles, articles_similaires, calculer_scores
from .models import JournalVisite, ScoreAffinite
from .serializers import ScoreAffiniteSerializer
from catalogue.serializers import ArticleListSerializer
from catalogue.models import Article


class RecommandationsView(APIView):
    """GET /api/recommandations/ → articles recommandés pour le membre connecté"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limite = int(request.query_params.get('limite', 8))
        articles = recommander_articles(request.user.pk, limite=limite)
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)


class ArticlesSimilairesView(APIView):
    """GET /api/recommandations/similaires/:id/ → 4 articles de la même famille"""

    def get(self, request, pk):
        limite = int(request.query_params.get('limite', 4))
        articles = articles_similaires(pk, limite=limite)
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)


class MesScoresView(APIView):
    """GET /api/recommandations/scores/ → scores d'affinité du membre connecté"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scores = ScoreAffinite.objects.filter(
            id_acheteur=request.user
        ).order_by('-valeur_score')
        serializer = ScoreAffiniteSerializer(scores, many=True)
        return Response(serializer.data)


class EnregistrerVisiteView(APIView):
    """POST /api/recommandations/visite/ → log une visite d'article"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_article = request.data.get('id_article')
        duree = request.data.get('duree_secondes', None)

        try:
            article = Article.objects.get(id_article=id_article, actif=True)
        except Article.DoesNotExist:
            return Response({"detail": "Article introuvable."}, status=status.HTTP_404_NOT_FOUND)

        JournalVisite.objects.create(
            id_acheteur=request.user,
            id_article=article,
            duree_secondes=duree,
        )
        return Response({"detail": "Visite enregistrée."}, status=status.HTTP_201_CREATED)


class RecalculerScoresView(APIView):
    """POST /api/recommandations/recalculer/ → force le recalcul des scores"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        calculer_scores(request.user.pk)
        scores = ScoreAffinite.objects.filter(
            id_acheteur=request.user
        ).order_by('-valeur_score')
        serializer = ScoreAffiniteSerializer(scores, many=True)
        return Response({
            "detail": "Scores recalculés.",
            "scores": serializer.data
        })