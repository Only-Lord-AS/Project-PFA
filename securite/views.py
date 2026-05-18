from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import AlerteSecurite
from .serializers import AlerteSecuriteSerializer
from commandes.models import DemandeAchat
from catalogue.models import Article, Famille

User = get_user_model()


class IsAdminUser:
    """Custom permission: only ADMIN role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class AlerteSecuriteViewSet(viewsets.ModelViewSet):
    queryset = AlerteSecurite.objects.all().order_by('-horodatage')
    serializer_class = AlerteSecuriteSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Return real-time stats for the admin dashboard from the database."""
    if request.user.role != 'ADMIN':
        return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    # ── Users ─────────────────────────────────────────────────────────
    total_users = User.objects.count()
    clients_count = User.objects.filter(role='CLIENT').count()
    vendeurs_count = User.objects.filter(role='VENDEUR').count()
    admins_count = User.objects.filter(role='ADMIN').count()
    active_users = User.objects.filter(is_active=True).count()
    new_users_30d = User.objects.filter(date_inscription__gte=thirty_days_ago).count()

    # ── Orders ────────────────────────────────────────────────────────
    total_orders = DemandeAchat.objects.count()
    orders_by_status = dict(
        DemandeAchat.objects.values_list('statut').annotate(count=Count('id_commande'))
    )
    recent_orders = DemandeAchat.objects.filter(date_commande__gte=thirty_days_ago).count()

    revenue_data = DemandeAchat.objects.exclude(statut='ANNULEE').aggregate(
        total_ht=Sum('montant_ht'),
        total_ttc=Sum('montant_ttc'),
    )
    chiffre_affaires_ht = float(revenue_data['total_ht'] or 0)
    chiffre_affaires_ttc = float(revenue_data['total_ttc'] or 0)

    revenue_30d_data = DemandeAchat.objects.filter(
        date_commande__gte=thirty_days_ago
    ).exclude(statut='ANNULEE').aggregate(
        total_ttc=Sum('montant_ttc'),
    )
    revenue_30d = float(revenue_30d_data['total_ttc'] or 0)

    # ── Products ──────────────────────────────────────────────────────
    total_products = Article.objects.count()
    active_products = Article.objects.filter(actif=True).count()
    out_of_stock = Article.objects.filter(quantite_disponible=0).count()
    categories_count = Famille.objects.count()

    # ── Security ──────────────────────────────────────────────────────
    total_alerts = AlerteSecurite.objects.count()
    new_alerts = AlerteSecurite.objects.filter(statut_alerte='NOUVEAU').count()
    alerts_by_severity = dict(
        AlerteSecurite.objects.values_list('niveau_severite').annotate(count=Count('id_alerte'))
    )
    alerts_by_type = dict(
        AlerteSecurite.objects.values_list('type_attaque').annotate(count=Count('id_alerte'))
    )
    recent_alerts = AlerteSecuriteSerializer(
        AlerteSecurite.objects.order_by('-horodatage')[:10], many=True
    ).data

    # ── Top vendeurs (by revenue) ─────────────────────────────────────
    from commandes.models import DetailCommande
    top_vendeurs_qs = (
        DetailCommande.objects
        .filter(id_article__isnull=False)
        .values('id_article__id_vendeur__nom_complet', 'id_article__id_vendeur__nom_boutique')
        .annotate(
            total_ventes=Sum('prix_unitaire_fixe'),
            nb_commandes=Count('id_commande', distinct=True),
        )
        .order_by('-total_ventes')[:5]
    )
    top_vendeurs = [
        {
            'nom': v['id_article__id_vendeur__nom_boutique'] or v['id_article__id_vendeur__nom_complet'] or '—',
            'ventes': float(v['total_ventes'] or 0),
            'commandes': v['nb_commandes'],
        }
        for v in top_vendeurs_qs
    ]

    # ── Recent actions (latest orders) ────────────────────────────────
    recent_orders_list = DemandeAchat.objects.select_related('id_acheteur').order_by('-date_commande')[:8]
    recent_actions = [
        {
            'action': f"Commande #{o.reference} — {o.get_statut_display()}",
            'user': o.id_acheteur.email,
            'time': o.date_commande.isoformat(),
            'montant': float(o.montant_ttc),
        }
        for o in recent_orders_list
    ]

    return Response({
        'users': {
            'total': total_users,
            'clients': clients_count,
            'vendeurs': vendeurs_count,
            'admins': admins_count,
            'actifs': active_users,
            'nouveaux_30j': new_users_30d,
        },
        'orders': {
            'total': total_orders,
            'par_statut': orders_by_status,
            'recents_30j': recent_orders,
        },
        'revenue': {
            'chiffre_affaires_ht': chiffre_affaires_ht,
            'chiffre_affaires_ttc': chiffre_affaires_ttc,
            'revenue_30j': revenue_30d,
        },
        'products': {
            'total': total_products,
            'actifs': active_products,
            'rupture_stock': out_of_stock,
            'categories': categories_count,
        },
        'security': {
            'total_alertes': total_alerts,
            'nouvelles': new_alerts,
            'par_severite': alerts_by_severity,
            'par_type': alerts_by_type,
            'recentes': recent_alerts,
        },
        'top_vendeurs': top_vendeurs,
        'recent_actions': recent_actions,
    })
