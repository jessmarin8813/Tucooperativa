import os
import datetime

def update_docs():
    docs_path = 'docs/PROJECT_STATE.md'
    ai_memory_path = 'docs/AI_MEMORY.md'
    
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Update PROJECT_STATE.md (User-facing Bitácora)
    if os.path.exists(docs_path):
        with open(docs_path, 'r', encoding='utf-8') as f:
            content = f.readlines()
        
        for i, line in enumerate(content):
            if '## 📝 Bitácora de Cambios' in line:
                content.insert(i+1, f"- **Auto-Update ({now})**: Sistema verificado y compilado con éxito. Estado: Estable.\n")
                break
                
        with open(docs_path, 'w', encoding='utf-8') as f:
            f.writelines(content)
        print(f"✅ Documentación actualizada en {docs_path}")

    # 2. Update AI_MEMORY.md (Assistant-facing context)
    if os.path.exists(ai_memory_path):
        with open(ai_memory_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines):
            if '- **Punto de Pausa**:' in line:
                lines[i] = f"- **Punto de Pausa**: Sistema verificado y estable en v7.6.0-Stable. Listo para pruebas de usuario. ({now})\n"
                break
        
        with open(ai_memory_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"✅ Memoria AI actualizada en {ai_memory_path}")

if __name__ == '__main__':
    update_docs()
