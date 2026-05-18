from django.contrib import admin
from .models import ScoreAffinite, RecommandationEngine, JournalVisite

@admin.register(JournalVisite)
class JournalVisiteAdmin(admin.ModelAdmin):
    list_display = ('id_acheteur', 'id_article', 'date_consultation', 'duree_secondes')
    list_filter = ('date_consultation',)

@admin.register(ScoreAffinite)
class ScoreAffiniteAdmin(admin.ModelAdmin):
    list_display = ('id_acheteur', 'id_famille', 'valeur_score', 'date_calcul')
    list_filter = ('date_calcul',)

admin.site.register(RecommandationEngine)