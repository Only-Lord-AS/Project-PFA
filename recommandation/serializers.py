from rest_framework import serializers
from .models import JournalVisite, ScoreAffinite
from catalogue.serializers import ArticleListSerializer

class JournalVisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalVisite
        fields = ('id_visite', 'date_consultation', 'duree_secondes', 'id_acheteur', 'id_article')
        read_only_fields = ('id_visite', 'date_consultation', 'id_acheteur')

class ScoreAffiniteSerializer(serializers.ModelSerializer):
    famille_libelle = serializers.CharField(source='id_famille.libelle', read_only=True)

    class Meta:
        model = ScoreAffinite
        fields = ('id_score', 'valeur_score', 'date_calcul', 'id_famille', 'famille_libelle')