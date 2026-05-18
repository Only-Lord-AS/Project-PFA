import os
import re
import time
import signal
import sys
from datetime import datetime, timedelta
from collections import defaultdict

import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_securise.settings')
django.setup()

from securite.models import AlerteSecurite

LOG_FILE = os.path.join(BASE_DIR, 'django.log')
CHECK_INTERVAL = 10
BRUTE_FORCE_THRESHOLD = 5
BRUTE_FORCE_WINDOW = 600

PATTERNS = {
    'SQL_INJECTION': {
        'regex': re.compile(r"(UNION\s+SELECT|DROP\s+TABLE|--|;\s*SELECT|xp_cmdshell|OR\s+1=1)", re.IGNORECASE),
        'severite': 'CRITICAL'
    },
    'XSS': {
        'regex': re.compile(r"(<script|javascript:|onerror\s*=|alert\s*\(|<iframe)", re.IGNORECASE),
        'severite': 'HIGH'
    },
    'PATH_TRAVERSAL': {
        'regex': re.compile(r"(\.\./|/etc/passwd|/proc/self|\.\.\\)", re.IGNORECASE),
        'severite': 'MEDIUM'
    }
}
failed_attempts = defaultdict(list)

def log_message(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def handle_sigint(sig, frame):
    log_message("Arrêt du système IDS...")
    sys.exit(0)

signal.signal(signal.SIGINT, handle_sigint)

def parse_log_line(line):
    """
    Extrait les informations d'une ligne de log.
    Supporte le format custom [SECURITY] et le format standard Django (HTTP 401/403).
    """

    security_match = re.search(r"\[SECURITY\] (\w+) detected from ([\d\.]+) \| (\w+) ([^|]+) \| Payload: (.*)", line)
    if security_match:
        return {
            'type': security_match.group(1),
            'ip': security_match.group(2),
            'method': security_match.group(3),
            'path': security_match.group(4).strip(),
            'payload': security_match.group(5),
            'is_security_log': True
        }

    standard_match = re.search(r"\"(\w+) ([^\s?]+).*\" (401|403)", line)
    if standard_match:
    
        ip_match = re.match(r"([\d\.]+)", line)
        ip = ip_match.group(1) if ip_match else "0.0.0.0"
        return {
            'type': 'AUTH_FAILURE',
            'ip': ip,
            'method': standard_match.group(1),
            'path': standard_match.group(2),
            'status': standard_match.group(3),
            'is_security_log': False
        }
    
    return None

def analyze_line(line):
    data = parse_log_line(line)
    if not data:
        return

    content_to_scan = data.get('payload', line)
    
    for attack_type, config in PATTERNS.items():
        if config['regex'].search(content_to_scan):
            AlerteSecurite.objects.create(
                type_attaque=attack_type,
                niveau_severite=config['severite'],
                ip_source=data['ip'],
                details=f"Détecté dans: {line.strip()}"
            )
            log_message(f"ALERTE: {attack_type} créée pour {data['ip']}")

    if data.get('type') == 'AUTH_FAILURE' or 'login' in data.get('path', ''):
        ip = data['ip']
        now = time.time()
        
        failed_attempts[ip].append(now)
        failed_attempts[ip] = [t for t in failed_attempts[ip] if now - t < BRUTE_FORCE_WINDOW]
        
        if len(failed_attempts[ip]) >= BRUTE_FORCE_THRESHOLD:

            AlerteSecurite.objects.get_or_create(
                type_attaque='BRUTE_FORCE',
                ip_source=ip,
                statut_alerte='NOUVEAU',
                defaults={
                    'niveau_severite': 'HIGH',
                    'details': f"Tentatives multiples ({len(failed_attempts[ip])}) détectées en moins de 10 min."
                }
            )
            log_message(f" ALERTE BRUTE_FORCE créée pour {ip}")

            failed_attempts[ip] = []

def tail_f(filename):
    """Générateur qui lit les nouvelles lignes d'un fichier."""
    if not os.path.exists(filename):
        with open(filename, 'w') as f:
            pass
            
    with open(filename, 'r') as f:
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if not line:
                time.sleep(1)
                continue
            yield line

def main():
    log_message(f"Démarrage de l'IDS sur {LOG_FILE}...")
    log_message(f"Surveillance des patterns: {', '.join(PATTERNS.keys())} + BRUTE_FORCE")
    
    try:
        for line in tail_f(LOG_FILE):
            analyze_line(line)
    except Exception as e:
        log_message(f"Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()