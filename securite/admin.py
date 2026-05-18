from django.contrib import admin
from .models import AlerteSecurite

@admin.register(AlerteSecurite)
class AlerteSecuriteAdmin(admin.ModelAdmin):
    list_display = ('type_attaque', 'niveau_severite', 'ip_source', 'horodatage', 'statut_alerte')
    list_filter = ('niveau_severite', 'statut_alerte', 'horodatage')
    search_fields = ('type_attaque', 'ip_source')