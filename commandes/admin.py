from django.contrib import admin
from .models import PanierCommande, LignePanier, DemandeAchat, DetailCommande

admin.site.register(PanierCommande)
admin.site.register(LignePanier)
admin.site.register(DemandeAchat)
admin.site.register(DetailCommande)