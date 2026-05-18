from django.db import models

class AlerteSecurite(models.Model):
    NIVEAU_CHOICES = (
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyen'),
        ('HIGH', 'Élevé'),
        ('CRITICAL', 'Critique'),
    )
    
    STATUT_ALERTE_CHOICES = (
        ('NOUVEAU', 'Nouveau'),
        ('VU', 'Vu'),
        ('RESOLU', 'Résolu'),
    )
    
    id_alerte = models.AutoField(primary_key=True)
    type_attaque = models.CharField(max_length=100) 
    niveau_severite = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default='MEDIUM')
    ip_source = models.GenericIPAddressField()
    horodatage = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True, null=True)
    statut_alerte = models.CharField(max_length=20, choices=STATUT_ALERTE_CHOICES, default='NOUVEAU')

    def __str__(self):
        return f"Alerte {self.type_attaque} depuis {self.ip_source}"