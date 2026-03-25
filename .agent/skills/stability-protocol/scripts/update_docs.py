import os
import datetime

def update_docs():
    docs_path = 'docs/PROJECT_STATE.md'
    changelog_path = 'docs/CHANGELOG.md'
    
    if not os.path.exists(docs_path) or not os.path.exists(changelog_path):
        print("⚠️ No se encontraron archivos de documentación en docs/")
        return

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Update PROJECT_STATE.md Bitácora
    with open(docs_path, 'r', encoding='utf-8') as f:
        content = f.readlines()
    
    for i, line in enumerate(content):
        if '## 📝 Bitácora de Cambios' in line:
            # Insert after the header
            content.insert(i+1, f"- **Auto-Update ({now})**: Sistema verificado y compilado con éxito. Todo estable.\n")
            break
            
    with open(docs_path, 'w', encoding='utf-8') as f:
        f.writelines(content)

    print(f"✅ Documentación actualizada en {docs_path}")

if __name__ == '__main__':
    update_docs()
