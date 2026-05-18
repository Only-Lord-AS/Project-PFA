from django.db import models
from django.contrib.auth import get_user_model
from catalogue.models import Article, Famille

Membre = get_user_model()

class JournalVisite(models.Model):
    id_visite = models.AutoField(primary_key=True)
    date_consultation = models.DateTimeField(auto_now_add=True)
    duree_secondes = models.IntegerField(blank=True, null=True)
    id_acheteur = models.ForeignKey(Membre, on_delete=models.CASCADE, related_name='visites')
    id_article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='visites')

    def __str__(self):
        return f"Visite {self.id_acheteur.nom_complet} → {self.id_article.designation}"

class ScoreAffinite(models.Model):
    id_score = models.AutoField(primary_key=True)
    valeur_score = models.FloatField(default=0.0)
    date_calcul = models.DateTimeField(auto_now=True)
    id_acheteur = models.ForeignKey(Membre, on_delete=models.CASCADE, related_name='scores_affinite')
    id_famille = models.ForeignKey(Famille, on_delete=models.CASCADE, related_name='scores_affinite')

    class Meta:
        unique_together = ('id_acheteur', 'id_famille')

    def __str__(self):
        return f"Score {self.id_acheteur.nom_complet} → {self.id_famille.libelle}: {self.valeur_score:.2f}"

class RecommandationEngine(models.Model):
    nom_algo = models.CharField(max_length=100)
    actif = models.BooleanField(default=True)
    parametres = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.nom_algo