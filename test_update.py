import os
import sys

os.environ['DJANGO_SETTINGS_MODULE'] = 'ecommerce_securise.settings'
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

import django
django.setup()

from django.contrib.auth import get_user_model
from accounts.serializers import MemberSerializer
from rest_framework.test import APIRequestFactory

User = get_user_model()
u = User.objects.filter(email='a1@a1.com').first()
if u:
    factory = APIRequestFactory()
    request = factory.patch(f'/api/auth/admin/users/{u.id_membre}/', {'is_active': False}, format='json')
    # we need to pass this request to the serializer
    # wait, just use the view!
    from accounts.views import AdminUtilisateursViewSet
    from rest_framework.test import force_authenticate
    
    admin_user = User.objects.filter(role='ADMIN', is_active=True).first()
    force_authenticate(request, user=admin_user)
    
    view = AdminUtilisateursViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy'})
    
    response = view(request, pk=u.id_membre)
    print("PATCH RESPONSE STATUS:", response.status_code)
    print("PATCH RESPONSE DATA:", response.data)
    
    # Try Delete
    request_del = factory.delete(f'/api/auth/admin/users/{u.id_membre}/')
    force_authenticate(request_del, user=admin_user)
    response_del = view(request_del, pk=u.id_membre)
    print("DELETE RESPONSE STATUS:", response_del.status_code)
    try:
        print("DELETE RESPONSE DATA:", response_del.data)
    except:
        pass
else:
    print("User a1@a1.com not found")
