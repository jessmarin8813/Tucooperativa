import os
import subprocess
import datetime

def generate_changelog():
    print("========================================")
    print("[CHANGELOG] GIT AI RELEASE MANAGER")
    print("========================================\n")
    
    try:
        result = subprocess.run(['git', 'log', '-n', '20', '--pretty=format:%s|%h|%ad', '--date=short'], capture_output=True, text=True)
        if result.returncode != 0:
            print("[ERROR] Git no esta inicializado:")
            return
            
        logs = result.stdout.strip().split('\\n')
    except Exception as e:
        print(f"[CRITICAL] Falla al ejecutar GIT: {e}")
        return

    features = []
    bugfixes = []
    others = []
    
    for log in logs:
        if not log: continue
        parts = log.split('|')
        msg = parts[0].strip()
        hash_id = parts[1] if len(parts) > 1 else ""
        
        if msg.lower().startswith('feat') or msg.lower().startswith('add') or msg.lower().startswith('nuevo'):
            features.append(f"- **{hash_id}**: {msg}")
        elif msg.lower().startswith('fix') or msg.lower().startswith('bug') or msg.lower().startswith('corregir'):
            bugfixes.append(f"- **{hash_id}**: {msg}")
        else:
            others.append(f"- **{hash_id}**: {msg}")

    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    changelog = f"# Release Notes - Latest\\n\\n"
    changelog += f"**Fecha de Construccion**: {today}\\n\\n"
    
    changelog += "## Nuevas Caracteristicas (Features)\\n"
    if features: changelog += "\\n".join(features) + "\\n\\n"
    else: changelog += "- No hay nuevas funcionalidades.\\n\\n"
        
    changelog += "## Correcciones (Bug Fixes)\\n"
    if bugfixes: changelog += "\\n".join(bugfixes) + "\\n\\n"
    else: changelog += "- Sistema estable.\\n\\n"
        
    changelog += "## Optimizaciones y Otros\\n"
    if others: changelog += "\\n".join(others) + "\\n\\n"
    else: changelog += "- Sin cambios.\\n\\n"
        
    with open('CHANGELOG_PREVIEW.md', 'w', encoding='utf-8') as f:
        f.write(changelog)
        
    print(f"[OK] Historial procesado correctamente ({len(logs)} commits).")
    print(f"[OK] Generado CHANGELOG_PREVIEW.md en la raiz.")
    
if __name__ == "__main__":
    generate_changelog()
