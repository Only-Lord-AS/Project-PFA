"""
Management command: seed_vendeurs
Creates sample vendeur accounts with products so vendor names appear in the catalogue.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_securise.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from catalogue.models import Famille, Article, PhotoArticle

User = get_user_model()

VENDEURS = [
    {
        "email": "tech@marocshop.ma",
        "nom_complet": "TechStore Maroc",
        "password": "Vendeur123",
        "nom_boutique": "TechStore Maroc",
        "articles": [
            {"designation": "Samsung Galaxy S24 Ultra 256Go", "description": "Écran 6.8'' AMOLED, processeur Snapdragon 8 Gen 3, caméra 200MP, batterie 5000mAh", "prix_vente": 13999, "quantite_disponible": 18, "famille": "High-Tech"},
            {"designation": "Apple MacBook Air M3 13 pouces", "description": "Puce M3 Apple, 8Go RAM, 256Go SSD, écran Liquid Retina, autonomie 18h", "prix_vente": 14990, "quantite_disponible": 12, "famille": "High-Tech"},
            {"designation": "Écouteurs Bluetooth JBL Tune 770NC", "description": "Réduction de bruit active, autonomie 44h, connexion multipoint, pliables", "prix_vente": 899, "quantite_disponible": 45, "famille": "High-Tech"},
        ]
    },
    {
        "email": "mode@marocshop.ma",
        "nom_complet": "FashionHub",
        "password": "Vendeur123",
        "nom_boutique": "FashionHub",
        "articles": [
            {"designation": "Nike Air Max 90 Essential Homme", "description": "Chaussures de sport confortables, semelle Air Max visible, cuir synthétique", "prix_vente": 1290, "quantite_disponible": 32, "famille": "Mode"},
            {"designation": "Sac à dos Samsonite Urban 15.6''", "description": "Compartiment laptop rembourré, tissu imperméable, bretelles ergonomiques", "prix_vente": 650, "quantite_disponible": 25, "famille": "Mode"},
        ]
    },
    {
        "email": "maison@marocshop.ma",
        "nom_complet": "MaisonConfort",
        "password": "Vendeur123",
        "nom_boutique": "MaisonConfort",
        "articles": [
            {"designation": "Robot aspirateur Xiaomi S10+", "description": "Navigation laser LDS, aspiration 4000Pa, serpillière intégrée, app Mi Home", "prix_vente": 3490, "quantite_disponible": 15, "famille": "Cuisine & Maison"},
            {"designation": "Machine à café Nespresso Vertuo Next", "description": "Technologie centrifusion, 5 tailles de tasses, réservoir 1.1L", "prix_vente": 1990, "quantite_disponible": 20, "famille": "Cuisine & Maison"},
            {"designation": "Ensemble de casseroles Tefal Ingenio 10 pièces", "description": "Revêtement antiadhésif Titanium, poignée amovible, compatible induction", "prix_vente": 1150, "quantite_disponible": 30, "famille": "Cuisine & Maison"},
        ]
    },
    {
        "email": "gaming@marocshop.ma",
        "nom_complet": "GameZone Maroc",
        "password": "Vendeur123",
        "nom_boutique": "GameZone Maroc",
        "articles": [
            {"designation": "Sony PlayStation 5 Slim Digital", "description": "Console next-gen, SSD 1To, manette DualSense, lecteur digital", "prix_vente": 5990, "quantite_disponible": 8, "famille": "Consoles & Jeux Vidéo"},
            {"designation": "Manette Xbox Elite Series 2", "description": "Manette sans fil premium, palettes interchangeables, autonomie 40h", "prix_vente": 1790, "quantite_disponible": 14, "famille": "Consoles & Jeux Vidéo"},
        ]
    },
    {
        "email": "sport@marocshop.ma",
        "nom_complet": "SportOutdoor",
        "password": "Vendeur123",
        "nom_boutique": "SportOutdoor",
        "articles": [
            {"designation": "Tapis de yoga premium TPE 6mm", "description": "Anti-dérapant double face, matériaux écologiques, sangle de transport incluse", "prix_vente": 349, "quantite_disponible": 50, "famille": "Sport & Voyage"},
            {"designation": "Montre connectée Garmin Venu 3", "description": "GPS, suivi santé avancé, autonomie 14 jours, écran AMOLED", "prix_vente": 4490, "quantite_disponible": 10, "famille": "Sport & Voyage"},
        ]
    },
]


def run():
    created_vendeurs = 0
    created_articles = 0

    for v in VENDEURS:
        # Create or get vendeur
        user, was_created = User.objects.get_or_create(
            email=v["email"],
            defaults={
                "nom_complet": v["nom_complet"],
                "role": "VENDEUR",
                "nom_boutique": v["nom_boutique"],
            }
        )
        if was_created:
            user.set_password(v["password"])
            user.save()
            created_vendeurs += 1
            print(f"  [+] Vendeur cree: {v['nom_boutique']} ({v['email']})")
        else:
            # Update nom_boutique if missing
            if not user.nom_boutique:
                user.nom_boutique = v["nom_boutique"]
                user.save()
            print(f"  [i] Vendeur existant: {v['nom_boutique']} ({v['email']})")

        # Create articles
        for art in v["articles"]:
            famille = Famille.objects.filter(libelle=art["famille"]).first()
            if not famille:
                print(f"  [!] Famille '{art['famille']}' introuvable, article ignore: {art['designation']}")
                continue
            
            existing = Article.objects.filter(designation=art["designation"], id_vendeur=user).exists()
            if existing:
                print(f"  [i] Article existant: {art['designation']}")
                continue

            Article.objects.create(
                designation=art["designation"],
                description=art["description"],
                prix_vente=art["prix_vente"],
                quantite_disponible=art["quantite_disponible"],
                id_vendeur=user,
                id_famille=famille,
                actif=True,
            )
            created_articles += 1
            print(f"  [+] Article cree: {art['designation']} -> {v['nom_boutique']}")

    print(f"\n{'='*50}")
    print(f"Resume: {created_vendeurs} vendeur(s) cree(s), {created_articles} article(s) cree(s)")
    print(f"{'='*50}")


if __name__ == "__main__":
    print("Creation des vendeurs et produits de demonstration...\n")
    run()
    print("\nTermine !")
