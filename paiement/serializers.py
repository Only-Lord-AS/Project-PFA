from rest_framework import serializers
from .models import TransactionPaiement

class TransactionPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionPaiement
        fields = (
            'id_transaction', 'reference_transaction', 'montant', 
            'devise', 'methode', 'statut', 'date_transaction', 
            'donnees_carte_masquees', 'id_commande'
        )
        read_only_fields = ('reference_transaction', 'statut', 'date_transaction')
        
    def validate(self, data):
        # Validation métier spécifique au paiement
        if data.get('montant') <= 0:
            raise serializers.ValidationError("Le montant de la transaction doit être positif.")
        return data