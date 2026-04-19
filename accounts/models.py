from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Définition des choix de rôles selon le cahier des charges 
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('vendeur', 'Vendeur'),
        ('client', 'Client'),
    )
    
    email = models.EmailField(unique=True) # Requis pour l'authentification 
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    
    # Les relations mentionnées dans le diagramme de classes:
    # 1 User -> N Products (pour les vendeurs)
    # 1 User -> N Orders (pour les clients)

    def __str__(self):
        return f"{self.username} ({self.role})"
