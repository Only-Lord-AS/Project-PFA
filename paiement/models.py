import uuid
import random
from django.db import models
from commandes.models import DemandeAchat

class TransactionPaiement(models.Model):
    METHODE_CHOICES = (
        ('CARTE_SIMULEE', 'Carte Bancaire (Simulée)'),
        ('VIREMENT_SIMULE', 'Virement Bancaire (Simulé)'),
        ('CASH_LIVRAISON', 'Paiement à la livraison'),
    )
    
    STATUT_CHOICES = (
        ('EN_COURS', 'En cours de traitement'),
        ('APPROUVE', 'Paiement approuvé'),
        ('REFUSE', 'Paiement refusé'),
        ('REMBOURSE', 'Remboursé'),
    )

    id_transaction = models.AutoField(primary_key=True)
    reference_transaction = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    devise = models.CharField(max_length=3, default='MAD')
    methode = models.CharField(max_length=20, choices=METHODE_CHOICES, default='CARTE_SIMULEE')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_COURS')
    date_transaction = models.DateTimeField(auto_now_add=True)
    donnees_carte_masquees = models.CharField(max_length=20, blank=True, null=True)
    
    id_commande = models.OneToOneField(DemandeAchat, on_delete=models.CASCADE, related_name='transaction_paiement')

    def simuler_autorisation(self):
        """
        Simule l'autorisation bancaire. 
        Retourne True 90% du temps, False 10% du temps.
        Met à jour le statut de la transaction et de la commande associée.
        """
        if self.methode == 'CASH_LIVRAISON':
            self.statut = 'APPROUVE'
            self.save()
            # La commande passe en préparation
            self.id_commande.statut = 'EN_PREPARATION'
            self.id_commande.save()
            return True

        if self.statut == 'EN_COURS':
            # Simulation : 90% de succès
            succes = random.random() < 0.9
            
            if succes:
                self.statut = 'APPROUVE'
                self.save()
                # On valide la commande
                self.id_commande.statut = 'EN_PREPARATION'
                self.id_commande.save()
                return True
            else:
                self.statut = 'REFUSE'
                self.save()
                return False
                
        return self.statut == 'APPROUVE'

    def rembourser(self):
        if self.statut == 'APPROUVE':
            self.statut = 'REMBOURSE'
            self.save()
            return True
        return False

    def __str__(self):
        return f"Transaction {self.reference_transaction} - {self.statut}"
