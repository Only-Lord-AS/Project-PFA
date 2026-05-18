import os
from decimal import Decimal
from django.db import transaction
from django.http import FileResponse
from django.conf import settings
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import PanierCommande, LignePanier, DemandeAchat, DetailCommande
from .serializers import (
    PanierCommandeSerializer, LignePanierSerializer, 
    DemandeAchatSerializer
)
from catalogue.models import Article
from paiement.models import TransactionPaiement
from paiement.serializers import TransactionPaiementSerializer
from .services import generer_facture_pdf

# PANIER

class PanierView(APIView):
    """
    GET  /api/panier/  → voir le panier du membre connecté
    POST /api/panier/  → ajouter un article au panier
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        panier, _ = PanierCommande.objects.get_or_create(id_acheteur=request.user)
        serializer = PanierCommandeSerializer(panier)
        return Response(serializer.data)

    def post(self, request):
        panier, _ = PanierCommande.objects.get_or_create(id_acheteur=request.user)
        id_article = request.data.get('id_article')
        quantite = int(request.data.get('quantite', 1))

        try:
            article = Article.objects.get(id_article=id_article, actif=True)
        except Article.DoesNotExist:
            return Response(
                {"detail": "Article introuvable ou inactif."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not article.est_disponible(quantite):
            return Response(
                {"detail": f"Stock insuffisant. Disponible : {article.quantite_disponible}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Si l'article est déjà dans le panier, on additionne la quantité
        ligne, created = LignePanier.objects.get_or_create(
            id_panier=panier, id_article=article,
            defaults={'quantite': quantite}
        )
        if not created:
            ligne.quantite += quantite
            ligne.save()

        serializer = PanierCommandeSerializer(panier)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LignePanierUpdateView(APIView):
    """
    PUT    /api/panier/lignes/:id/  → modifier quantité
    DELETE /api/panier/lignes/:id/  → supprimer ligne
    """
    permission_classes = [IsAuthenticated]

    def get_ligne(self, pk, user):
        try:
            return LignePanier.objects.get(id_ligne=pk, id_panier__id_acheteur=user)
        except LignePanier.DoesNotExist:
            return None

    def put(self, request, pk):
        ligne = self.get_ligne(pk, request.user)
        if not ligne:
            return Response({"detail": "Ligne introuvable."}, status=status.HTTP_404_NOT_FOUND)

        quantite = int(request.data.get('quantite', 1))
        if quantite <= 0:
            return Response({"detail": "La quantité doit être supérieure à 0."}, status=status.HTTP_400_BAD_REQUEST)

        if not ligne.id_article.est_disponible(quantite):
            return Response(
                {"detail": f"Stock insuffisant. Disponible : {ligne.id_article.quantite_disponible}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ligne.quantite = quantite
        ligne.save()

        panier = ligne.id_panier
        return Response(PanierCommandeSerializer(panier).data)

    def delete(self, request, pk):
        ligne = self.get_ligne(pk, request.user)
        if not ligne:
            return Response({"detail": "Ligne introuvable."}, status=status.HTTP_404_NOT_FOUND)

        panier = ligne.id_panier
        ligne.delete()
        return Response(PanierCommandeSerializer(panier).data)


class ViderPanierView(APIView):
    """DELETE /api/panier/vider/ → vider tout le panier"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            panier = PanierCommande.objects.get(id_acheteur=request.user)
            panier.vider()
            return Response({"detail": "Panier vidé."}, status=status.HTTP_204_NO_CONTENT)
        except PanierCommande.DoesNotExist:
            return Response({"detail": "Aucun panier trouvé."}, status=status.HTTP_404_NOT_FOUND)

# CHECKOUT – flux atomique

class CheckoutView(APIView):
    """
    POST /api/commandes/checkout/
    Flux complet en transaction atomique :
    a. Valider stocks
    b. Créer DemandeAchat + DetailCommande (prix figés)
    c. Décrémenter stock
    d. Créer TransactionPaiement
    e. Simuler autorisation → rollback si refus
    f. Si approuvé → générer facture PDF
    g. Retourner résultat
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        methode_paiement = request.data.get('methode', 'CARTE_SIMULEE')
        adresse = request.data.get('adresse_livraison', request.user.adresse_livraison or '')

        # 1. Récupérer le panier
        try:
            panier = PanierCommande.objects.get(id_acheteur=request.user)
        except PanierCommande.DoesNotExist:
            return Response({"detail": "Aucun panier trouvé."}, status=status.HTTP_404_NOT_FOUND)

        lignes = panier.lignes.select_related('id_article').all()
        if not lignes.exists():
            return Response({"detail": "Le panier est vide."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # a. Valider les stocks pour chaque ligne
                for ligne in lignes:
                    article = ligne.id_article
                    if not article.actif:
                        raise ValueError(f"L'article \"{article.designation}\" n'est plus disponible.")
                    if not article.est_disponible(ligne.quantite):
                        raise ValueError(
                            f"Stock insuffisant pour \"{article.designation}\". "
                            f"Demandé : {ligne.quantite}, Disponible : {article.quantite_disponible}"
                        )

                # b. Calculer le montant total
                montant_ht = Decimal('0.00')
                for ligne in lignes:
                    montant_ht += ligne.quantite * ligne.id_article.prix_vente
                tva = Decimal('0.20')
                montant_ttc = montant_ht * (1 + tva)

                # c. Créer la DemandeAchat
                commande = DemandeAchat.objects.create(
                    id_acheteur=request.user,
                    montant_ht=montant_ht,
                    montant_ttc=montant_ttc,
                )

                # d. Créer les DetailCommande et décrémenter les stocks
                for ligne in lignes:
                    article = ligne.id_article
                    DetailCommande.objects.create(
                        id_commande=commande,
                        id_article=article,
                        quantite_commandee=ligne.quantite,
                        prix_unitaire_fixe=article.prix_vente,
                    )
                    # Décrémenter le stock
                    article.consommer_stock(ligne.quantite)

                # e. Créer la TransactionPaiement
                donnees_carte = None
                if methode_paiement == 'CARTE_SIMULEE':
                    carte = request.data.get('carte', '0000000000000000')
                    donnees_carte = f"**** **** **** {carte[-4:]}"

                transaction_paiement = TransactionPaiement.objects.create(
                    id_commande=commande,
                    montant=montant_ttc,
                    methode=methode_paiement,
                    donnees_carte_masquees=donnees_carte,
                )

                # f. Simuler l'autorisation
                autorisation = transaction_paiement.simuler_autorisation()

                if not autorisation:
                    # Paiement refusé → rollback complet via l'exception
                    raise ValueError("Paiement refusé par la banque. Aucun montant n'a été débité.")

                # g. Générer la facture PDF via le service dédié
                chemin_facture = generer_facture_pdf(commande)
                commande.chemin_facture_pdf = chemin_facture
                commande.save()

                # Vider le panier après succès
                panier.vider()

                return Response({
                    "commande_id": commande.id_commande,
                    "reference": commande.reference,
                    "statut": commande.statut,
                    "montant_ttc": str(commande.montant_ttc),
                    "paiement_statut": transaction_paiement.statut,
                    "chemin_facture": str(commande.chemin_facture_pdf),
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# HISTORIQUE COMMANDES


class HistoriqueCommandesView(generics.ListAPIView):
    """GET /api/commandes/ → historique commandes du membre connecté"""
    serializer_class = DemandeAchatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DemandeAchat.objects.filter(
            id_acheteur=self.request.user
        ).order_by('-date_commande')


class TelechargerFactureView(APIView):
    """GET /api/commandes/:id/facture/ → télécharger le PDF"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            commande = DemandeAchat.objects.get(id_commande=pk, id_acheteur=request.user)
        except DemandeAchat.DoesNotExist:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if not commande.chemin_facture_pdf:
            return Response({"detail": "Facture non disponible."}, status=status.HTTP_404_NOT_FOUND)

        filepath = os.path.join(settings.MEDIA_ROOT, str(commande.chemin_facture_pdf))
        if not os.path.exists(filepath):
            return Response({"detail": "Fichier PDF introuvable."}, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(open(filepath, 'rb'), content_type='application/pdf', filename=f"facture_{commande.reference}.pdf")
