from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlerteSecuriteViewSet, admin_dashboard_stats

router = DefaultRouter()
router.register(r'alertes', AlerteSecuriteViewSet, basename='alertes')

urlpatterns = [
    path('securite/', include(router.urls)),
    path('securite/dashboard-stats/', admin_dashboard_stats, name='dashboard-stats'),
]
