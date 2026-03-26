import os
import re
import json

def extract_strings(directory):
    extracted_strings = {}
    
    # ExpresiÃ³n regular simplificada para capturar texto dentro de etiquetas JSX
    # ej: <h1>Hola Mundo</h1> -> Hola Mundo
    tag_regex = re.compile(r'>\s*([^<{]+?)\s*<')
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        matches = tag_regex.findall(content)
                        for match in matches:
                            text = match.strip()
                            if len(text) > 2 and not text.isnumeric():
                                key = text.lower().replace(' ', '_').replace('.', '')
                                extracted_strings[key] = text
                except Exception as e:
                    print(f"[ERROR] No se pudo leer {file}: {e}")
                    
    return extracted_strings

if __name__ == "__main__":
    print("========================================")
    print("[GLOBE] GLOBAL i18n EXTRACTOR")
    print("========================================\n")
    
    print("[+] Escaneando client/src...")
    strings = extract_strings("client/src")
    
    output_file = ".agent/skills/global-i18n-extractor/es.json"
    
    # Crear carpeta si no existe (ya deberÃ­a existir)
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(strings, f, indent=4, ensure_ascii=False)
        
    print(f"[SUCCESS] Se extrajeron {len(strings)} cadenas de texto.")
    print(f"[SUCCESS] Guardadas en: {output_file}")
