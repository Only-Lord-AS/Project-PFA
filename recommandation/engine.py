from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from catalogue.models import Article, Famille
from commandes.models import DemandeAchat, DetailCommande
from .models import JournalVisite, ScoreAffinite


def calculer_scores(id_acheteur):
    """
    Analyse les 30 derniers jours de JournalVisite et DemandeAchat
    pour calculer un score d'affinité par Famille.
    
    Score = (nb_visites × 0.3) + (nb_achats × 0.7), normalisé entre 0 et 1.
    Upsert dans ScoreAffinite.
    """
    date_limite = timezone.now() - timedelta(days=30)

    # 1. Comptage des visites par famille (30 derniers jours)
    visites_par_famille = (
        JournalVisite.objects
        .filter(id_acheteur_id=id_acheteur, date_consultation__gte=date_limite)
        .values('id_article__id_famille')
        .annotate(nb_visites=Count('id_visite'))
    )
    visites_dict = {
        item['id_article__id_famille']: item['nb_visites']
        for item in visites_par_famille
    }

    # 2. Comptage des achats par famille (30 derniers jours)
    achats_par_famille = (
        DetailCommande.objects
        .filter(
            id_commande__id_acheteur_id=id_acheteur,
            id_commande__date_commande__gte=date_limite,
        )
        .values('id_article__id_famille')
        .annotate(nb_achats=Count('id_detail'))
    )
    achats_dict = {
        item['id_article__id_famille']: item['nb_achats']
        for item in achats_par_famille
    }

    # 3. Fusionner toutes les familles concernées
    toutes_familles = set(visites_dict.keys()) | set(achats_dict.keys())

    if not toutes_familles:
        return  # Rien à calculer

    # 4. Calculer les scores bruts
    scores_bruts = {}
    for fam_id in toutes_familles:
        nb_v = visites_dict.get(fam_id, 0)
        nb_a = achats_dict.get(fam_id, 0)
        scores_bruts[fam_id] = (nb_v * 0.3) + (nb_a * 0.7)

    # 5. Normaliser entre 0 et 1
    max_score = max(scores_bruts.values()) if scores_bruts else 1
    if max_score == 0:
        max_score = 1  # Éviter la division par zéro

    # 6. Upsert dans ScoreAffinite
    for fam_id, score_brut in scores_bruts.items():
        score_normalise = score_brut / max_score

        ScoreAffinite.objects.update_or_create(
            id_acheteur_id=id_acheteur,
            id_famille_id=fam_id,
            defaults={'valeur_score': round(score_normalise, 4)}
        )


def recommander_articles(id_acheteur, limite=8):
    """
    Recommande des articles à un acheteur :
    1. Récupère les top 3 familles selon ScoreAffinite
    2. Retourne les articles actifs de ces familles (excluant ceux déjà achetés)
    3. Fallback : si pas de ScoreAffinite → articles les plus récents
    """

    top_familles = (
        ScoreAffinite.objects
        .filter(id_acheteur_id=id_acheteur)
        .order_by('-valeur_score')[:3]
        .values_list('id_famille_id', flat=True)
    )

    top_familles = list(top_familles)

    if not top_familles:
        return list(
            Article.objects
            .filter(actif=True, quantite_disponible__gt=0)
            .order_by('-date_ajout')[:limite]
        )

    articles_achetes = (
        DetailCommande.objects
        .filter(id_commande__id_acheteur_id=id_acheteur)
        .values_list('id_article_id', flat=True)
        .distinct()
    )

    articles = (
        Article.objects
        .filter(
            actif=True,
            quantite_disponible__gt=0,
            id_famille_id__in=top_familles,
        )
        .exclude(id_article__in=articles_achetes)
        .order_by('-date_ajout')[:limite]
    )

    return list(articles)


def articles_similaires(id_article, limite=4):
    """
    Retourne les articles de la même Famille, triés par stock descendant.
    """
    try:
        article = Article.objects.get(id_article=id_article)
    except Article.DoesNotExist:
        return []

    return list(
        Article.objects
        .filter(id_famille=article.id_famille, actif=True)
        .exclude(id_article=id_article)
        .order_by('-quantite_disponible')[:limite]
    )