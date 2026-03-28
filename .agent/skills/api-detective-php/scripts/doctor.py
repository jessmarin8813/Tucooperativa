import urllib.request
import json
import socket
import ssl

def check_endpoint(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Antigravity-Detective'})
        # Auto-bypass SSL errors on local xampp
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            status = response.status
            try:
                data = json.loads(response.read().decode('utf-8'))
                return f"[OK] [STATUS {status}] {url} -> RESPUESTA JSON VALIDA."
            except json.JSONDecodeError:
                return f"[WARN] [STATUS {status}] {url} -> ADVERTENCIA: La respuesta no es JSON puro. Posible error PHP impreso."
    except urllib.error.HTTPError as e:
        return f"[FAIL] [ERROR {e.code}] {url} -> {e.reason}"
    except urllib.error.URLError as e:
        return f"[NO CONNECT] {url} -> Servidor inalcanzable ({e.reason})"
    except Exception as e:
        return f"[CRITICAL] {url} -> {str(e)}"

def run_diagnostics():
    print("========================================")
    print("[DETECTIVE] API DETECTIVE: XAMPP HEALTH CHECK")
    print("========================================\n")
    
    # Check localhost port 80
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 80))
    if result == 0:
        print("[OK] Puerto 80 Abierto (Apache Activo)")
    else:
        print("[FAIL] Puerto 80 Cerrado (Revise XAMPP)")
    sock.close()

    print("\n[VERIFICANDO ENDPOINTS CRITICOS]")
    
    # We test locally in TuCooperativa by default.
    endpoints = [
        "http://localhost/TuCooperativa/api/includes/middleware.php",
        "http://localhost/TuCooperativa/api/admin/stats.php",
        "http://localhost/TuCooperativa/api/login.php"
    ]

    for ep in endpoints:
        print(check_endpoint(ep))

    print("\n----------------------------------------")
    print("Fin del diagnÃ³stico.")

if __name__ == "__main__":
    run_diagnostics()
