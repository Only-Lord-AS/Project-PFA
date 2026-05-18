import time
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, 'django.log')

def inject_log(line):
    with open(LOG_FILE, 'a') as f:
        f.write(line + '\n')
    print(f"Injecté: {line}")

def test_ids():
    print("DÉBUT DES TESTS :")
    
    inject_log('[SECURITY] SQL_INJECTION detected from 127.0.0.1 | POST /api/auth/login/ | Payload: admin\' OR 1=1 --')
    time.sleep(2)

 
    inject_log('[SECURITY] XSS detected from 127.0.0.1 | GET /api/catalogue/recherche/ | Payload: <script>alert("Hacked")</script>')
    time.sleep(2)

    inject_log('[SECURITY] PATH_TRAVERSAL detected from 127.0.0.1 | GET /api/download/ | Payload: ../../../etc/passwd')
    time.sleep(2)

    print("Simulation Brute Force (5x 401)...")
    for i in range(5):
        inject_log(f'127.0.0.1 - - [27/Apr/2026 10:00:0{i}] "POST /api/auth/login/ HTTP/1.1" 401 56')
        time.sleep(0.5)

    print("TESTS TERMINÉS")
    print(f"Vérifiez les alertes dans la base de données (admin Django) ou les logs de ids.py.")
if __name__ == "__main__":
    test_ids()