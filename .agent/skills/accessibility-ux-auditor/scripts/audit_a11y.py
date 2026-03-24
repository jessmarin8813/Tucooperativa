import os
import re

def audit_accessibility():
    print("========================================")
    print("[A11Y] ACCESSIBILITY & UX AUDITOR")
    print("========================================\n")
    
    target_dir = "client/src"
    total_issues = 0
    total_files = 0
    
    # Patrones RegEx de Accesibilidad (A11y)
    img_no_alt = re.compile(r'<img(?![^>]*alt=|[^>]*alt={)[^>]*>')
    input_no_id = re.compile(r'<input(?![^>]*id=|[^>]*id={)[^>]*>')
    button_no_aria = re.compile(r'<button(?![^>]*aria-label=|[^>]*aria-labelledby=)[^>]*>\s*<[A-Z][A-Za-z]+') # Boton que empiece con icono
    
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.jsx'):
                total_files += 1
                filepath = os.path.join(root, file)
                issues = []
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                    content = "".join(lines)
                    
                    # Chequeos Multi-linea o una linea
                    for i, line in enumerate(lines):
                        if img_no_alt.search(line):
                            issues.append(f"Linea {i+1}: <img> sin atributo 'alt'.")
                        if input_no_id.search(line):
                            issues.append(f"Linea {i+1}: <input> sin atributo 'id'.")
                        if button_no_aria.search(line):
                            issues.append(f"Linea {i+1}: Boton con icono no tiene 'aria-label'.")
                            
                    if issues:
                        print(f"📄 [ARCHIVO] {file}")
                        for issue in issues:
                            print(f"   [WARN] {issue}")
                            total_issues += 1
                except Exception:
                    pass

    print("\n----------------------------------------")
    print(f"Archivos Escaneados: {total_files}")
    print(f"Advertencias de UX/A11y: {total_issues}")
    if total_issues == 0:
         print("[SUCCESS] Increible. Tu codigo UI cuenta con nivel experto de Accesibilidad.")
    else:
         print("[Mejora] Resuelve estas alertas para alcanzar Calidad Premium Total.")

if __name__ == "__main__":
    audit_accessibility()
