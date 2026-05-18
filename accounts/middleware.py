import re
import logging
import json
from django.http import HttpResponseBadRequest

logger = logging.getLogger('django.request')

class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Patterns for detection
        self.patterns = {
            'SQL_INJECTION': re.compile(r"(UNION\s+SELECT|DROP\s+TABLE|--|;\s*SELECT|xp_cmdshell|OR\s+1=1)", re.IGNORECASE),
            'XSS': re.compile(r"(<script|javascript:|onerror\s*=|alert\s*\(|<iframe)", re.IGNORECASE),
            'PATH_TRAVERSAL': re.compile(r"(\.\./|/etc/passwd|/proc/self|\.\.\\)", re.IGNORECASE),
        }

    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        method = request.method
        path = request.path

        # 1. Check Query Parameters (GET)
        for key, value in request.GET.items():
            if self.scan_payload(value, ip, method, path):
                return HttpResponseBadRequest("Security Alert: Malicious activity detected.")

        # 2. Check Form Data (POST)
        for key, value in request.POST.items():
            if isinstance(value, str) and self.scan_payload(value, ip, method, path):
                return HttpResponseBadRequest("Security Alert: Malicious activity detected.")

        # 3. Check JSON Body (REST API)
        if request.content_type == 'application/json' and request.body:
            try:
                data = json.loads(request.body)
                if self.scan_json(data, ip, method, path):
                    return HttpResponseBadRequest("Security Alert: Malicious activity detected.")
            except json.JSONDecodeError:
                pass

        response = self.get_response(request)
        return response

    def scan_payload(self, payload, ip, method, path):
        if not payload or not isinstance(payload, str):
            return False
            
        for attack_type, regex in self.patterns.items():
            if regex.search(payload):
                # Log in the format ids.py expects
                log_msg = f"[SECURITY] {attack_type} detected from {ip} | {method} {path} | Payload: {payload[:100]}"
                logger.warning(log_msg)
                return True
        return False

    def scan_json(self, data, ip, method, path):
        """Recursively scan JSON data for threats."""
        if isinstance(data, str):
            return self.scan_payload(data, ip, method, path)
        elif isinstance(data, dict):
            return any(self.scan_json(v, ip, method, path) for v in data.values())
        elif isinstance(data, list):
            return any(self.scan_json(item, ip, method, path) for item in data)
        return False