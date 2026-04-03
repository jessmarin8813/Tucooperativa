import socket
import os
import re

def get_local_ip():
    """Detects the current active local IP address"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # We don't need actually to connect, just to see which interface is active
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def sync_env_ip():
    """Updates the .env file with the current detected IP"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    current_ip = get_local_ip()
    
    if not os.path.exists(env_path):
        print(f"[WARN] .env no encontrado en {env_path}")
        return

    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find BACKEND_URL=http://[IP]/...
    new_content = re.sub(
        r'BACKEND_URL=http://[0-9.]+/TuCooperativa/api',
        f'BACKEND_URL=http://{current_ip}/TuCooperativa/api',
        content
    )

    if content != new_content:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[SUCCESS] IP Sincronizada Automáticamente: {current_ip}")
    else:
        print(f"[INFO] El .env ya tiene la IP correcta o usa localhost: {current_ip}")

if __name__ == "__main__":
    sync_env_ip()
