import os
import re
import sys

def diagnose():
    bot_path = 'bot/bot.py'
    if not os.path.exists(bot_path):
        print(f"❌ Error: No se encontró {bot_path}")
        return

    with open(bot_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    
    # 1. Check common imports in telegram.ext
    required_ext = ['ApplicationBuilder', 'CommandHandler', 'MessageHandler', 'filters', 'ConversationHandler', 'CallbackQueryHandler']
    for req in required_ext:
        if req in content and f' {req}' not in content and f'({req}' not in content:
           # This is a bit naive but good for a start
           pass
    
    # Let's do a real regex check for imports
    import_match = re.search(r'from telegram\.ext import \((.*?)\)', content, re.DOTALL)
    if import_match:
        imported_names = [n.strip() for n in import_match.group(1).split(',')]
        
        # Check usage vs import
        usages = re.findall(r'(\w+)\(', content)
        for usage in set(usages):
            if usage in required_ext and usage not in imported_names:
                errors.append(f"⚠️  ERROR DE IMPORTACIÓN: '{usage}' se usa pero no está en la lista de imports de telegram.ext")

    # 2. Check handle_callback registration
    if 'handle_callback' in content and 'CallbackQueryHandler(handle_callback)' not in content:
        errors.append("⚠️  REGISTRO FALTANTE: Se definió 'handle_callback' pero no parece estar registrado en add_handler")

    # 3. Check for unsafe f-strings (NoneType formatting)
    # Search for things like f"{var:.2f}" or similar
    unsafe_formats = re.findall(r'f".*?\{(\w+):.*?\}.*?"', content)
    for var in unsafe_formats:
        # Check if there is a None guard before the usage
        # Simple check: is there something like 'var = ... if ... else 0' or 'if not var: return'
        if f"{var} =" not in content or ("if" not in content and "is not None" not in content):
             # This is a heuristic, but good for catching the previous bug
             pass
    
    # Let's do a more direct check for the specific bug we had
    if "f\"💰 Deuda Acumulada: **${status.get('deuda'):.2f}**\\n\"" in content:
        errors.append("⚠️  FORMATO INSEGURO: Se detectó formateo directo de 'deuda' sin guardia de None/Float.")

    # 4. Check for Global Error Handler
    if "add_error_handler" not in content:
        errors.append("⚠️  ESTABILIDAD: No se ha registrado un 'error_handler' global. El bot podría morir ante excepciones inesperadas.")

    # 5. Check for hardcoded Demo IDs
    if "vehiculo_id'] = 1" in content:
        errors.append("⚠️  LÓGICA HARDCODED: Se detectó 'vehiculo_id = 1'. Las unidades deben ser dinámicas.")

    # 6. Check IP sync
    if 'sync_env_ip' not in content:
        errors.append("⚠️  SISTEMA DE IP: 'sync_env_ip' no está presente, el bot podría fallar al cambiar de red")

    if not errors:
        print("✅ Bot Médico: No se detectaron anomalías estructurales evidentes.")
        sys.exit(0)
    else:
        print("🚨 Bot Médico detectó problemas:")
        for err in errors:
            print(err)
        sys.exit(1)

if __name__ == '__main__':
    diagnose()

