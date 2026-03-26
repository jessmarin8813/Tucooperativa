import os
import json

def check_pwa_health():
    print("========================================")
    print("[PWA] PWA OFFLINE SIMULATOR & AUDITOR")
    print("========================================\n")
    
    manifest_path = "manifest.webmanifest"
    sw_path = "sw.js"
    
    # Check Manifest
    if os.path.exists(manifest_path):
        print("[OK] manifest.webmanifest encontrado.")
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'display' in data and data['display'] == 'standalone':
                    print("  -> [OK] Display mode: standalone (Instalable como App).")
                else:
                    print("  -> [WARN] El modo display no es 'standalone'.")
        except:
             print("  -> [ERROR] manifest.webmanifest no tiene JSON vÃ¡lido.")
    else:
        print("[FAIL] manifest.webmanifest NO ENCONTRADO en el root.")

    # Check Service Worker
    if os.path.exists(sw_path):
        print("\n[OK] sw.js encontrado.")
        with open(sw_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'workbox' in content or 'registerRoute' in content or 'precacheAndRoute' in content:
                print("  -> [OK] Workbox PWA Engine detectado. Estrategias de cachÃ© activas.")
                print("  -> [OK] Interceptor Fetch gestionado automÃ¡ticamente mediante registerRoute.")
            elif 'self.addEventListener("fetch"' in content:
                print("  -> [OK] Interceptor Fetch nativo (Vanilla JS) detectado.")
            else:
                print("  -> [CRITICAL] No hay listener ni motor (Workbox) para peticiones Offline.")
    else:
        print("\n[FAIL] sw.js NO ENCONTRADO en el root.")
        
    print("\n----------------------------------------")
    print("SimulaciÃ³n teÃ³rica completada.")
    print("Test recomendado en Google Chrome: F12 -> Application -> Service Workers -> Marcar 'Offline' -> F5")

if __name__ == "__main__":
    check_pwa_health()
