"""
Management command to populate the database with products and photos.
Each category gets at least 5 products with real image URLs.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from catalogue.models import Famille, Article, PhotoArticle

Membre = get_user_model()

PRODUCTS = [
    # ── High-Tech (id_famille will be resolved by libelle) ──
    {"famille": "High-Tech", "designation": "Apple iPhone 15 128 Go", "description": "Dynamic Island, design innovant, appareil photo 48 Mpx avec téléobjectif x2.", "prix": 7990, "stock": 24, "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=350&fit=crop"},
    {"famille": "High-Tech", "designation": "Samsung Galaxy S24 Ultra", "description": "Écran 6.8 pouces QHD+, processeur Snapdragon 8 Gen 3, S Pen intégré.", "prix": 12990, "stock": 15, "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=350&fit=crop"},
    {"famille": "High-Tech", "designation": "MacBook Air M3 13 pouces", "description": "Puce Apple M3, 8 Go RAM, 256 Go SSD, écran Liquid Retina.", "prix": 13490, "stock": 10, "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=350&fit=crop"},
    {"famille": "High-Tech", "designation": "Écouteurs Bluetooth JBL Tune 230NC", "description": "Écouteurs sans fil avec réduction de bruit active et autonomie 40h.", "prix": 790, "stock": 51, "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=350&fit=crop"},
    {"famille": "High-Tech", "designation": "Samsung Galaxy Tab S9", "description": "Tablette 11 pouces, écran AMOLED, 256 Go, S Pen inclus.", "prix": 7890, "stock": 16, "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=350&fit=crop"},
    {"famille": "High-Tech", "designation": "Montre connectée Apple Watch SE", "description": "Suivi santé, GPS, étanche 50m, compatible iPhone.", "prix": 2990, "stock": 30, "image": "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&h=350&fit=crop"},

    # ── Consoles & Jeux Vidéo ──
    {"famille": "Consoles & Jeux Vidéo", "designation": "Sony PlayStation 5 Slim", "description": "Design élégant, processeur amélioré, stockage SSD rapide, compatible PS4.", "prix": 6490, "stock": 11, "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=350&fit=crop"},
    {"famille": "Consoles & Jeux Vidéo", "designation": "Nintendo Switch OLED", "description": "Écran OLED 7 pouces, mode portable et TV, Joy-Con détachables.", "prix": 3990, "stock": 20, "image": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&h=350&fit=crop"},
    {"famille": "Consoles & Jeux Vidéo", "designation": "Xbox Series X", "description": "Console 4K native, 1 To SSD, rétrocompatible, Game Pass inclus 3 mois.", "prix": 5990, "stock": 14, "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&h=350&fit=crop"},
    {"famille": "Consoles & Jeux Vidéo", "designation": "The Witcher 3 Complete Edition - PS5", "description": "RPG culte avec un monde ouvert immersif, DLC inclus.", "prix": 399, "stock": 38, "image": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=350&fit=crop"},
    {"famille": "Consoles & Jeux Vidéo", "designation": "Manette PS5 DualSense Midnight Black", "description": "Retour haptique, gâchettes adaptatives, micro intégré.", "prix": 690, "stock": 45, "image": "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&h=350&fit=crop"},

    # ── Cuisine & Maison ──
    {"famille": "Cuisine & Maison", "designation": "Robot de cuisine Moulinex i-Companion", "description": "12 programmes automatiques, app connectée, bol 4.5L.", "prix": 4299, "stock": 14, "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=350&fit=crop"},
    {"famille": "Cuisine & Maison", "designation": "Aspirateur Robot Xiaomi S10+", "description": "Navigation laser, serpillère vibrante, autonomie 2h.", "prix": 3190, "stock": 19, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=350&fit=crop"},
    {"famille": "Cuisine & Maison", "designation": "Machine à café Nespresso Vertuo", "description": "Technologie centrifusion, 5 tailles de tasses, chauffe en 30s.", "prix": 1990, "stock": 28, "image": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&h=350&fit=crop"},
    {"famille": "Cuisine & Maison", "designation": "Set de poêles anti-adhésives 3 pièces", "description": "Compatible induction, revêtement durable sans PFOA.", "prix": 490, "stock": 40, "image": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500&h=350&fit=crop"},
    {"famille": "Cuisine & Maison", "designation": "Mixeur plongeant Bosch 1000W", "description": "4 lames inox, pied anti-éclaboussures, vitesse variable.", "prix": 549, "stock": 35, "image": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=350&fit=crop"},

    # ── Livres ──
    {"famille": "Livres", "designation": "Le Petit Prince - Édition Collector", "description": "Édition illustrée de luxe du chef-d'œuvre de Saint-Exupéry.", "prix": 149, "stock": 62, "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=350&fit=crop"},
    {"famille": "Livres", "designation": "Atomic Habits - Édition Française", "description": "Maîtriser les petits comportements qui mènent à des résultats remarquables.", "prix": 189, "stock": 45, "image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=350&fit=crop"},
    {"famille": "Livres", "designation": "Sapiens - Une brève histoire de l'humanité", "description": "Yuval Noah Harari retrace 70 000 ans d'histoire humaine.", "prix": 159, "stock": 38, "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&h=350&fit=crop"},
    {"famille": "Livres", "designation": "L'Alchimiste - Paulo Coelho", "description": "Le voyage initiatique de Santiago à la recherche de son trésor.", "prix": 99, "stock": 55, "image": "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=500&h=350&fit=crop"},
    {"famille": "Livres", "designation": "Clean Code - Robert C. Martin", "description": "Guide essentiel pour écrire du code propre et maintenable.", "prix": 350, "stock": 22, "image": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=350&fit=crop"},

    # ── Jardin ──
    {"famille": "Jardin", "designation": "Salon de jardin 4 places en résine", "description": "Canapé + 2 fauteuils + table basse, résistant UV.", "prix": 2890, "stock": 9, "image": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&h=350&fit=crop"},
    {"famille": "Jardin", "designation": "Tondeuse électrique Bosch ARM 37", "description": "1400W, largeur de coupe 37cm, bac 40L.", "prix": 1390, "stock": 17, "image": "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=500&h=350&fit=crop"},
    {"famille": "Jardin", "designation": "Barbecue à gaz Weber Spirit E-310", "description": "3 brûleurs, grille émaillée, thermomètre intégré.", "prix": 4990, "stock": 8, "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=350&fit=crop"},
    {"famille": "Jardin", "designation": "Hamac double avec support bois", "description": "Toile coton résistante, support eucalyptus traité.", "prix": 890, "stock": 25, "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&h=350&fit=crop"},
    {"famille": "Jardin", "designation": "Kit arrosage automatique 15m", "description": "Programmateur digital, 20 goutteurs, tuyau renforcé.", "prix": 459, "stock": 32, "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=350&fit=crop"},

    # ── Mode ──
    {"famille": "Mode", "designation": "Nike Air Max Excee Homme", "description": "Style moderne avec amorti confortable grâce à l'unité Air visible.", "prix": 1090, "stock": 34, "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=350&fit=crop"},
    {"famille": "Mode", "designation": "Veste trench femme beige", "description": "Coupe moderne mi-longue, parfaite pour la mi-saison.", "prix": 790, "stock": 28, "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=350&fit=crop"},
    {"famille": "Mode", "designation": "Sac à dos cuir marron vintage", "description": "Cuir véritable, compartiment laptop 15 pouces, bretelles réglables.", "prix": 650, "stock": 20, "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=350&fit=crop"},
    {"famille": "Mode", "designation": "Montre homme classique acier", "description": "Mouvement quartz japonais, bracelet acier inoxydable, étanche 30m.", "prix": 890, "stock": 18, "image": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=350&fit=crop"},
    {"famille": "Mode", "designation": "Lunettes de soleil Ray-Ban Aviator", "description": "Verres polarisés, monture métal doré, protection UV 100%.", "prix": 1490, "stock": 22, "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=350&fit=crop"},

    # ── Accessoires ──
    {"famille": "Accessoires", "designation": "Câble USB-C tressé 2m 100W", "description": "Charge rapide et transfert de données pour smartphone/PC.", "prix": 129, "stock": 120, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=350&fit=crop"},
    {"famille": "Accessoires", "designation": "Support téléphone voiture magnétique", "description": "Fixation grille d'aération, rotation 360°, compatible tous smartphones.", "prix": 149, "stock": 85, "image": "https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=500&h=350&fit=crop"},
    {"famille": "Accessoires", "designation": "Batterie externe 20000mAh", "description": "Charge rapide 22.5W, 2 ports USB + USB-C, affichage LED.", "prix": 299, "stock": 60, "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=350&fit=crop"},
    {"famille": "Accessoires", "designation": "Coque iPhone 15 silicone MagSafe", "description": "Silicone doux, aimants MagSafe intégrés, 12 coloris.", "prix": 199, "stock": 90, "image": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=350&fit=crop"},
    {"famille": "Accessoires", "designation": "Clavier mécanique sans fil RGB", "description": "Switches blue, rétroéclairage RGB, batterie 4000mAh.", "prix": 549, "stock": 30, "image": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&h=350&fit=crop"},

    # ── Animalerie ──
    {"famille": "Animalerie", "designation": "Croquettes premium chien adulte 12kg", "description": "Formule équilibrée pour chiens adultes, digestion optimale.", "prix": 469, "stock": 31, "image": "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&h=350&fit=crop"},
    {"famille": "Animalerie", "designation": "Arbre à chat 3 niveaux", "description": "Sisal naturel, plateforme d'observation, niche intégrée.", "prix": 599, "stock": 18, "image": "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&h=350&fit=crop"},
    {"famille": "Animalerie", "designation": "Fontaine à eau pour chat 2.5L", "description": "Filtre charbon actif, pompe silencieuse, capteur de niveau.", "prix": 249, "stock": 40, "image": "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&h=350&fit=crop"},
    {"famille": "Animalerie", "designation": "Laisse rétractable chien 8m", "description": "Mécanisme anti-blocage, poignée ergonomique, frein progressif.", "prix": 179, "stock": 55, "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=350&fit=crop"},
    {"famille": "Animalerie", "designation": "Aquarium complet 60L avec LED", "description": "Filtre intégré, éclairage LED, chauffage réglable, décor inclus.", "prix": 890, "stock": 12, "image": "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=500&h=350&fit=crop"},

    # ── Sport & Voyage ──
    {"famille": "Sport & Voyage", "designation": "Valise cabine rigide 55cm", "description": "Roulettes 360°, serrure TSA, rangement optimisé.", "prix": 599, "stock": 26, "image": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500&h=350&fit=crop"},
    {"famille": "Sport & Voyage", "designation": "Tapis de yoga antidérapant 6mm", "description": "TPE écologique, double face, sangle de transport incluse.", "prix": 249, "stock": 50, "image": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=350&fit=crop"},
    {"famille": "Sport & Voyage", "designation": "Haltères réglables 2x20kg", "description": "Ajustement rapide par molette, gain de place.", "prix": 1890, "stock": 15, "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=350&fit=crop"},
    {"famille": "Sport & Voyage", "designation": "Sac de randonnée 45L imperméable", "description": "Dos ventilé, housse de pluie, multiples compartiments.", "prix": 690, "stock": 22, "image": "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&h=350&fit=crop"},
    {"famille": "Sport & Voyage", "designation": "Vélo électrique pliant 20 pouces", "description": "Moteur 250W, batterie 36V, autonomie 50km, 7 vitesses.", "prix": 8990, "stock": 7, "image": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=350&fit=crop"},
]


class Command(BaseCommand):
    help = "Populate DB with products (5+ per category) and photo URLs"

    def handle(self, *args, **options):
        # Get or create a default vendor
        vendeur = Membre.objects.filter(role='VENDEUR').first()
        if not vendeur:
            vendeur, _ = Membre.objects.get_or_create(
                email='vendor@marocshop.ma',
                defaults={
                    'nom_complet': 'MarocShop Vendor',
                    'role': 'VENDEUR',
                    'nom_boutique': 'MarocShop Store',
                }
            )
            if vendeur.pk and not vendeur.has_usable_password():
                vendeur.set_password('Vendor123!')
                vendeur.save()
            self.stdout.write(f"Created vendor: {vendeur.email}")

        # Clear old articles and photos
        PhotoArticle.objects.all().delete()
        Article.objects.all().delete()
        self.stdout.write("Cleared old articles and photos.")

        # Build famille lookup
        familles = {}
        for f in Famille.objects.all():
            familles[f.libelle] = f
        self.stdout.write(f"Found {len(familles)} families: {list(familles.keys())}")

        created = 0
        skipped = 0
        for p in PRODUCTS:
            famille = familles.get(p["famille"])
            if not famille:
                self.stdout.write(self.style.WARNING(f"  Famille '{p['famille']}' not found, skipping {p['designation']}"))
                skipped += 1
                continue

            article = Article.objects.create(
                designation=p["designation"],
                description=p["description"],
                prix_vente=p["prix"],
                quantite_disponible=p["stock"],
                id_famille=famille,
                id_vendeur=vendeur,
                actif=True,
            )

            PhotoArticle.objects.create(
                chemin_fichier=p["image"],
                est_principale=True,
                id_article=article,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created {created} articles with photos. Skipped {skipped}."
        ))
