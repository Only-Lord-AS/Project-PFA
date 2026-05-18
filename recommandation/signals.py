from django.db.models.signals import post_save
from django.dispatch import receiver
from commandes.models import DemandeAchat
from .engine import calculer_scores

@receiver(post_save, sender=DemandeAchat)
def recalculer_scores_apres_commande(sender, instance, **kwargs):
    """
    Recalcule les scores d'affinité de l'acheteur à chaque fois qu'une 
    DemandeAchat est sauvegardée avec un statut confirmé (EN_PREPARATION).
    
    Le statut passe à EN_PREPARATION après la simulation d'autorisation 
    de paiement approuvée dans le flux checkout.
    """
    if instance.statut == 'EN_PREPARATION':
        try:
            calculer_scores(instance.id_acheteur_id)
        except Exception as e:
     
            import logging
            logger = logging.getLogger('django.request')
            logger.warning(f"[RECOMMANDATION] Erreur calcul scores pour acheteur {instance.id_acheteur_id}: {e}")