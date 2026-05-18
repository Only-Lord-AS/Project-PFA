from django.urls import path
from .views import (
    RecommandationsView, ArticlesSimilairesView,
    MesScoresView, EnregistrerVisiteView, RecalculerScoresView
)

urlpatterns = [
    path('recommandations/', RecommandationsView.as_view(), name='recommandations'),
    path('recommandations/similaires/<int:pk>/', ArticlesSimilairesView.as_view(), name='articles-similaires'),
    path('recommandations/scores/', MesScoresView.as_view(), name='mes-scores'),
    path('recommandations/visite/', EnregistrerVisiteView.as_view(), name='enregistrer-visite'),
    path('recommandations/recalculer/', RecalculerScoresView.as_view(), name='recalculer-scores'),
]