from rest_framework import serializers
from .models import PanierCommande, LignePanier, DemandeAchat, DetailCommande
from catalogue.serializers import ArticleListSerializer

class LignePanierSerializer(serializers.ModelSerializer):
    article_details = ArticleListSerializer(source='id_article', read_only=True)
    
    class Meta:
        model = LignePanier
        fields = ('id_ligne', 'quantite', 'id_article', 'article_details')

class PanierCommandeSerializer(serializers.ModelSerializer):
    lignes = LignePanierSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = PanierCommande
        fields = ('id_panier', 'date_modification', 'lignes', 'total')

    def get_total(self, obj):
        return obj.calculer_total()

class DetailCommandeSerializer(serializers.ModelSerializer):
    article_designation = serializers.CharField(source='id_article.designation', read_only=True)
    article_prix = serializers.DecimalField(source='id_article.prix_vente', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = DetailCommande
        fields = ('id_detail', 'quantite_commandee', 'prix_unitaire_fixe', 'id_article', 'article_designation', 'article_prix')

class DemandeAchatSerializer(serializers.ModelSerializer):
    details = DetailCommandeSerializer(many=True, read_only=True)
    acheteur_nom = serializers.CharField(source='id_acheteur.nom_complet', read_only=True)

    class Meta:
        model = DemandeAchat
        fields = (
            'id_commande', 'reference', 'date_commande', 'statut', 
            'montant_ht', 'montant_ttc', 'chemin_facture_pdf', 
            'id_acheteur', 'acheteur_nom', 'details'
        )
        read_only_fields = ('reference', 'date_commande', 'montant_ht', 'montant_ttc', 'chemin_facture_pdf')