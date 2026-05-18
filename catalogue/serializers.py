from rest_framework import serializers
from .models import Famille, Article, PhotoArticle

class FamilleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Famille
        fields = ('id_famille', 'libelle', 'description', 'slug')
        read_only_fields = ('id_famille', 'libelle', 'description', 'slug')

class PhotoArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoArticle
        fields = ('id_photo', 'chemin_fichier', 'est_principale')

class ArticleListSerializer(serializers.ModelSerializer):
    photo_principale = serializers.SerializerMethodField()
    stock_dispo = serializers.IntegerField(source='quantite_disponible')
    famille_libelle = serializers.CharField(source='id_famille.libelle', read_only=True)
    vendeur_boutique = serializers.CharField(source='id_vendeur.nom_boutique', read_only=True)

    class Meta:
        model = Article
        fields = ('id_article', 'designation', 'prix_vente', 'photo_principale', 'stock_dispo', 'famille_libelle', 'vendeur_boutique', 'actif')

    def get_photo_principale(self, obj):
        photo = obj.photos.filter(est_principale=True).first()
        if not photo:
            photo = obj.photos.first()
        if not photo or not photo.chemin_fichier:
            return None
        # If it's an uploaded file (ImageField), build absolute URI
        val = str(photo.chemin_fichier)
        if val.startswith('http'):
            return val
        request = self.context.get('request')
        if request and hasattr(photo.chemin_fichier, 'url'):
            return request.build_absolute_uri(photo.chemin_fichier.url)
        return val

class ArticleDetailSerializer(serializers.ModelSerializer):
    photos = PhotoArticleSerializer(many=True, read_only=True)
    vendeur_boutique = serializers.CharField(source='id_vendeur.nom_boutique', read_only=True)
    famille_libelle = serializers.CharField(source='id_famille.libelle', read_only=True)
    similaires = serializers.SerializerMethodField()
    est_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            'id_article', 'designation', 'description', 'prix_vente', 
            'quantite_disponible', 'est_disponible', 'id_famille', 'famille_libelle', 
            'id_vendeur', 'vendeur_boutique', 'photos', 'similaires', 'date_ajout', 'actif'
        )

    def get_est_disponible(self, obj):
        return obj.est_disponible()

    def get_similaires(self, obj):
        similaires = obj.obtenir_similaires(limite=4)
        return ArticleListSerializer(similaires, many=True, context=self.context).data

class ArticleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ('id_article', 'designation', 'description', 'prix_vente', 'quantite_disponible', 'id_famille', 'actif')
        
    def validate_prix_vente(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix de vente doit être supérieur à 0.")
        return value
        
    def validate_quantite_disponible(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif.")
        return value

    def create(self, validated_data):
        # On assigne le vendeur à partir de l'utilisateur connecté (géré dans la vue)
        validated_data['id_vendeur'] = self.context['request'].user
        return super().create(validated_data)