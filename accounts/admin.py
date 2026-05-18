from django.contrib import admin
from .models import Membre

@admin.register(Membre)
class MembreAdmin(admin.ModelAdmin):
    list_display = ('email', 'nom_complet', 'role', 'is_active', 'is_staff')
    search_fields = ('email', 'nom_complet')
    list_filter = ('role', 'is_active', 'is_staff')