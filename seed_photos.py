"""
Adds photo URLs to all articles that don't have photos yet.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_securise.settings')
import django
django.setup()

from catalogue.models import Article, PhotoArticle

# Map category -> list of image URLs
IMAGES = {
    "High-Tech": [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
    ],
    "Consoles & Jeux Video": [
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=400&fit=crop",
    ],
    "Mode": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
    ],
    "Cuisine & Maison": [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=400&fit=crop",
    ],
    "Sport & Voyage": [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop",
    ],
    "Livres": [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=400&fit=crop",
    ],
    "Jardin": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
    ],
    "Accessoires": [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop",
    ],
    "Animalerie": [
        "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop",
    ],
}

# Fallback
FALLBACK = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop"

def run():
    articles = Article.objects.filter(photos__isnull=True)
    count = 0
    for article in articles:
        cat = article.id_famille.libelle if article.id_famille else ""
        urls = IMAGES.get(cat, [FALLBACK])
        url = urls[count % len(urls)]
        PhotoArticle.objects.create(
            id_article=article,
            chemin_fichier=url,
            est_principale=True,
        )
        count += 1
        print(f"  [+] Photo added: {article.designation[:50]}")
    
    print(f"\n  Total: {count} photos added to articles without images.")

if __name__ == "__main__":
    print("Adding photos to articles...\n")
    run()
    print("\nDone!")
