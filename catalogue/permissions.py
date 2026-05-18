from rest_framework import permissions

class IsVendeurProprietaire(permissions.BasePermission):
    """
    Permission personnalisée pour n'autoriser que le vendeur propriétaire 
    de l'article à le modifier ou le supprimer.
    """
    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(request.user and request.user.is_authenticated and obj.id_vendeur == request.user)

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour n'autoriser que les administrateurs à modifier.
    Tous les autres utilisateurs sont en lecture seule.
    Utile pour le modèle Famille.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')