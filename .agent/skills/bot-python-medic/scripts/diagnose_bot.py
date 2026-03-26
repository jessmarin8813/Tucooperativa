import os
import re
import sys
import requests
from dotenv import load_dotenv

def diagnose():
    bot_path = 'bot/bot.py'
    client_path = 'bot/api_client.py'
    env_path = 'bot/.env'
    
    if not os.path.exists(bot_path):
        print(f"❌ Error: No se encontró {bot_path}")
        return

    load_dotenv(env_path)
    base_url = os.getenv('BACKEND_URL')

    with open(bot_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    
    # --- 1. Análisis Estático (Imports, Handlers, etc.) ---
    required_ext = ['ApplicationBuilder', 'CommandHandler', 'MessageHandler', 'filters', 'ConversationHandler', 'CallbackQueryHandler']
    import_match = re.search(r'from telegram\.ext import \((.*?)\)', content, re.DOTALL)
    if import_match:
        imported_names = [n.strip() for n in import_match.group(1).split(',')]
        usages = re.findall(r'(\w+)\(', content)
        for usage in set(usages):
            if usage in required_ext and usage not in imported_names:
                errors.append(f"⚠️  ERROR DE IMPORTACIÓN: '{usage}' se usa pero no está en la lista de imports")

    if 'handle_callback' in content and 'CallbackQueryHandler(handle_callback)' not in content:
        errors.append("⚠️  REGISTRO FALTANTE: Se definió 'handle_callback' pero no está registrado.")

    if "add_error_handler" not in content:
        errors.append("⚠️  ESTABILIDAD: No se ha registrado un 'error_handler' global.")

    # --- 2. Auditoría de Conectividad (PRE-FLIGHT) ---
    if os.path.exists(client_path) and base_url:
        print(f"🔍 Auditando Conectividad API en {base_url}...")
        with open(client_path, 'r', encoding='utf-8') as f:
            client_content = f.read()
        
        # Extraer endpoints: busca f"{self.base_url}/ruta"
        endpoints = re.findall(r'f"\{self\.base_url\}/(.*?)\.php', client_content)
        for endpoint in set(endpoints):
            full_url = f"{base_url}/{endpoint}.php"
            try:
                # Una petición HEAD es suficiente para verificar existencia (200/403 vs 404)
                res = requests.head(full_url, timeout=3)
                if res.status_code == 404:
                    errors.append(f"🚨 ENDPOINT ROTO (404): No existe '{endpoint}.php' en el backend. Revisar rutas en api_client.py")
                elif res.status_code >= 500:
                    errors.append(f"⚠️  ERROR SERVIDOR (500): '{endpoint}.php' está fallando en el backend.")
            except Exception as e:
                # Si falla la conexión, avisamos pero no matamos el build (podría ser red temporal)
                print(f"⚠️  No se pudo verificar {endpoint}.php ({e})")

    # --- Resultado Final ---
    if not errors:
        print("✅ Bot Médico: No se detectaron anomalías estructurales ni de conectividad.")
        sys.exit(0)
    else:
        print("🚨 Bot Médico detectó problemas:")
        for err in errors:
            print(err)
        sys.exit(1)

if __name__ == '__main__':
    diagnose()
