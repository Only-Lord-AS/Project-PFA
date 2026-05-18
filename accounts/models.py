from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class MembreManager(BaseUserManager):
    def create_user(self, email, nom_complet, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        if not nom_complet:
            raise ValueError("Le nom complet est obligatoire")
            
        email = self.normalize_email(email)
        user = self.model(email=email, nom_complet=nom_complet, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nom_complet, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser=True.')

        return self.create_user(email, nom_complet, password, **extra_fields)

class Membre(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrateur'),
        ('VENDEUR', 'Vendeur'),
        ('CLIENT', 'Client'),
    )

    ADMIN_SPECIALITE_CHOICES = (
        ('SUPER', 'Super Administrateur'),
        ('UTILISATEURS', 'Gestion des Utilisateurs'),
        ('COMMANDES', 'Gestion des Commandes'),
        ('PRODUITS', 'Gestion des Produits'),
        ('SECURITE', 'Sécurité & IDS'),
    )

    id_membre = models.AutoField(primary_key=True)
    nom_complet = models.CharField(max_length=255)
    email = models.EmailField(unique=True, max_length=255)

    # mot_de_passe_hash est géré par AbstractBaseUser (password)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CLIENT')
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_inscription = models.DateTimeField(auto_now_add=True)
    
    # Champs spécifiques Admin
    admin_specialite = models.CharField(
        max_length=30, choices=ADMIN_SPECIALITE_CHOICES,
        blank=True, null=True, default='SUPER'
    )

    # Champs spécifiques Vendeur
    nom_boutique = models.CharField(max_length=255, blank=True, null=True)
    
    # Champs spécifiques Client
    raison_sociale = models.CharField(max_length=255, blank=True, null=True)
    adresse_livraison = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MembreManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom_complet']

    def __str__(self):
        return f"{self.nom_complet} ({self.email})"

    def get_full_name(self):
        return self.nom_complet

    def get_short_name(self):
        return self.nom_complet.split()[0] if self.nom_complet else self.email

    @property
    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser

    @property
    def is_vendeur(self):
        return self.role == 'VENDEUR'

    @property
    def is_client(self):
        return self.role == 'CLIENT'