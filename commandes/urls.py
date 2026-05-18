from django.urls import path
from .views import (
    PanierView, LignePanierUpdateView, ViderPanierView,
    CheckoutView, HistoriqueCommandesView, TelechargerFactureView
)
urlpatterns = [
    # Panier
    path('panier/', PanierView.as_view(), name='panier'),
    path('panier/lignes/<int:pk>/', LignePanierUpdateView.as_view(), name='panier-ligne'),
    path('panier/vider/', ViderPanierView.as_view(), name='panier-vider'),

    # Commandes
    path('commandes/checkout/', CheckoutView.as_view(), name='checkout'),
    path('commandes/', HistoriqueCommandesView.as_view(), name='historique-commandes'),
    path('commandes/<int:pk>/facture/', TelechargerFactureView.as_view(), name='telecharger-facture'),
]