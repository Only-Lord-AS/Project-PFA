"""
Sets up the Super Admin account: amineouhadine@emsi.ma / Amineraja1
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_securise.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

EMAIL = "amineouhadine@emsi.ma"
PASSWORD = "Amineraja1"

user, created = User.objects.get_or_create(
    email=EMAIL,
    defaults={
        "nom_complet": "Amine Ouhadine",
        "role": "ADMIN",
        "admin_specialite": "SUPER",
    }
)

if created:
    user.set_password(PASSWORD)
    user.save()
    print(f"[+] Super Admin created: {EMAIL}")
else:
    user.role = "ADMIN"
    user.admin_specialite = "SUPER"
    user.set_password(PASSWORD)
    user.save()
    print(f"[i] Super Admin updated: {EMAIL}")

print("Done!")
