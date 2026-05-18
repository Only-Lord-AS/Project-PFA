import uuid
from django.db import models
from django.contrib.auth import get_user_model
from catalogue.models import Article

Membre = get_user_model()

def generate_uuid8():
    return str(uuid.uuid4()).replace('-', '')[:8].upper()

class PanierCommande(models.Model):
    id_panier = models.AutoField(primary_key=True)
    date_modification = models.DateTimeField(auto_now=True)
    id_acheteur = models.OneToOneField(Membre, on_delete=models.CASCADE, related_name='panier')

    def vider(self):
        self.lignes.all().delete()

    def calculer_total(self):
        return sum(ligne.quantite * ligne.id_article.prix_vente for ligne in self.lignes.all())

    def __str__(self):
        return f"Panier de {self.id_acheteur.nom_complet}"

class LignePanier(models.Model):
    id_ligne = models.AutoField(primary_key=True)
    quantite = models.PositiveIntegerField(default=1)
    id_panier = models.ForeignKey(PanierCommande, on_delete=models.CASCADE, related_name='lignes')
    id_article = models.ForeignKey(Article, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.quantite}x {self.id_article.designation}"

class DemandeAchat(models.Model):
    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('CONFIRMEE', 'Confirmée'),
        ('EN_PREPARATION', 'En préparation'),
        ('EXPEDIEE', 'Expédiée'),
        ('LIVREE', 'Livrée'),
        ('ANNULEE', 'Annulée'),
    )

    id_commande = models.AutoField(primary_key=True)
    reference = models.CharField(max_length=8, unique=True, default=generate_uuid8, editable=False)
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    montant_ht = models.DecimalField(max_digits=10, decimal_places=2)
    montant_ttc = models.DecimalField(max_digits=10, decimal_places=2)
    chemin_facture_pdf = models.FileField(upload_to='factures/', blank=True, null=True)
    id_acheteur = models.ForeignKey(Membre, on_delete=models.CASCADE, related_name='commandes')

    def marquer_expediee(self):
        self.statut = 'EXPEDIEE'
        self.save()

    def annuler_commande(self):
        # On annule la commande et on restitue les stocks
        if self.statut in ['EN_ATTENTE', 'EN_PREPARATION']:
            for detail in self.details.all():
                detail.id_article.reapprovisionner(detail.quantite_commandee)
            self.statut = 'ANNULEE'
            self.save()
            return True
        return False

    def __str__(self):
        return f"Commande #{self.reference} - {self.statut}"

class DetailCommande(models.Model):
    id_detail = models.AutoField(primary_key=True)
    quantite_commandee = models.PositiveIntegerField()
    prix_unitaire_fixe = models.DecimalField(max_digits=10, decimal_places=2)
    id_commande = models.ForeignKey(DemandeAchat, on_delete=models.CASCADE, related_name='details')
    id_article = models.ForeignKey(Article, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.quantite_commandee}x de l'article {self.id_article.id_article if self.id_article else 'Supprimé'}"
