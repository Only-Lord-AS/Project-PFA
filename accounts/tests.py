import logging
from django.test import TestCase, RequestFactory
from django.urls import reverse
from accounts.middleware import SecurityMiddleware
from django.http import HttpResponse

class SecurityMiddlewareTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        
        # Un simple mock pour get_response qui retourne 200 OK
        def get_response_mock(request):
            return HttpResponse("OK")
            
        self.middleware = SecurityMiddleware(get_response_mock)
        
    def test_normal_get_request(self):
        """Test qu'une requête normale passe sans problème."""
        request = self.factory.get('/test/', {'q': 'normal_search'})
        response = self.middleware(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"OK")

    def test_normal_post_request(self):
        """Test qu'une requête POST normale passe."""
        request = self.factory.post('/test/', {'username': 'testuser'})
        response = self.middleware(request)
        self.assertEqual(response.status_code, 200)

    def test_xss_detection_get(self):
        """Test la détection XSS dans les paramètres GET."""
        # Test avec <script>
        request1 = self.factory.get('/test/', {'q': '<script>alert(1)</script>'})
        response1 = self.middleware(request1)
        self.assertEqual(response1.status_code, 400)
        
        # Test avec javascript:
        request2 = self.factory.get('/test/', {'url': 'javascript:alert(1)'})
        response2 = self.middleware(request2)
        self.assertEqual(response2.status_code, 400)
        
        # Test avec onerror=
        request3 = self.factory.get('/test/', {'img': 'x onerror=alert(1)'})
        response3 = self.middleware(request3)
        self.assertEqual(response3.status_code, 400)

    def test_sqli_detection_post(self):
        """Test la détection SQLi dans les paramètres POST."""
    
        request1 = self.factory.post('/test/', {'id': '1 UNION SELECT password FROM users'})
        response1 = self.middleware(request1)
        self.assertEqual(response1.status_code, 400)
        
    
        request2 = self.factory.post('/test/', {'query': 'DROP TABLE accounts_membre'})
        response2 = self.middleware(request2)
        self.assertEqual(response2.status_code, 400)
        
    
        request3 = self.factory.post('/test/', {'username': 'admin\' --'})
        response3 = self.middleware(request3)
        self.assertEqual(response3.status_code, 400)

    def test_logging_format(self):
        """Test que le format du log de sécurité est correct."""
        with self.assertLogs('django.request', level='WARNING') as cm:
            request = self.factory.get('/test_path/', {'q': 'UNION SELECT 1'})
            request.META['REMOTE_ADDR'] = '192.168.1.100'
            response = self.middleware(request)
            
            self.assertEqual(response.status_code, 400)
            
            self.assertEqual(len(cm.output), 1)
            
            log_msg = cm.output[0]
            self.assertIn("[SECURITY]", log_msg)
            self.assertIn("IP=192.168.1.100", log_msg)
            self.assertIn("METHOD=GET", log_msg)
            self.assertIn("PATH=/test_path/", log_msg)
            self.assertIn("PAYLOAD=UNION SELECT 1", log_msg)

    def test_payload_truncation(self):
        """Test que les très longs payloads sont tronqués dans les logs."""
        long_payload = "UNION SELECT " + ("A" * 100)
        with self.assertLogs('django.request', level='WARNING') as cm:
            request = self.factory.post('/test/', {'data': long_payload})
            self.middleware(request)
            
            log_msg = cm.output[0]
            self.assertIn("PAYLOAD=", log_msg)
            
            payload_str = log_msg.split("PAYLOAD=")[1]
            self.assertTrue(payload_str.endswith('...'))
            self.assertLess(len(payload_str), 60)
