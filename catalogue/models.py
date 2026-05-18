from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model

Membre = get_user_model()

class Famille(models.Model):
    id_famille = models.AutoField(primary_key=True)
    libelle = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True, max_length=120)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.libelle)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.libelle

class Article(models.Model):
    id_article = models.AutoField(primary_key=True)
    designation = models.CharField(max_length=200)
    description = models.TextField()
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    quantite_disponible = models.IntegerField(default=0)
    id_vendeur = models.ForeignKey(Membre, on_delete=models.CASCADE, limit_choices_to={'role': 'VENDEUR'}, related_name='articles')
    id_famille = models.ForeignKey(Famille, on_delete=models.CASCADE)
    actif = models.BooleanField(default=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    def est_disponible(self, qte=1):
        return self.actif and self.quantite_disponible >= qte

    def consommer_stock(self, qte):
        if self.est_disponible(qte):
            self.quantite_disponible -= qte
            self.save()
            return True
        return False

    def reapprovisionner(self, qte):
        if qte > 0:
            self.quantite_disponible += qte
            self.save()
            return True
        return False

    def obtenir_similaires(self, limite=4):
        return Article.objects.filter(
            id_famille=self.id_famille, 
            actif=True
        ).exclude(id_article=self.id_article).order_by('?')[:limite]

    def __str__(self):
        return self.designation

class PhotoArticle(models.Model):
    id_photo = models.AutoField(primary_key=True)
    chemin_fichier = models.CharField(max_length=500, blank=True)
    est_principale = models.BooleanField(default=False)
    id_article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='photos')

    def save(self, *args, **kwargs):
        if self.est_principale:
            PhotoArticle.objects.filter(id_article=self.id_article).update(est_principale=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Photo de {self.id_article.designation}"