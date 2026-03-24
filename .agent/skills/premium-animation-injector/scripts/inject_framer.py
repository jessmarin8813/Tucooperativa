import os
import sys
import re

def inject_animations(directory):
    print("========================================")
    print("[ANIMATION] PREMIUM ANIMATION INJECTOR")
    print("========================================\n")
    
    if not os.path.exists(directory):
        print(f"[ERROR] Ruta no encontrada: {directory}")
        return

    print(f"[+] Escaneando {directory} en busca de Componentes Estaticos...\n")
    
    injected_count = 0
    # Buscar el return principal de un componente
    return_regex = re.compile(r'return\s*\(\s*<div([^>]*)>', re.IGNORECASE)
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Si ya tiene framer-motion, lo saltamos
                    if 'framer-motion' in content:
                        continue

                    if 'return (' in content or 'return(' in content:
                        # Reemplazar el primer <div principal por <motion.div
                        new_content = return_regex.sub(
                            r'return (\n    <motion.div\1\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      transition={{ duration: 0.5 }}>',
                            content, count=1
                        )
                        
                        if new_content != content:
                            # Hacer par con el cierre de cierre div correspondiente
                            # Usamos un heuristico simple reemplazando el ultimo </div> por </motion.div>
                            last_div_idx = new_content.rfind('</div>')
                            if last_div_idx != -1:
                                new_content = new_content[:last_div_idx] + '</motion.div>' + new_content[last_div_idx+6:]
                            
                            # Importar motion
                            import_statement = "import { motion } from 'framer-motion';\n"
                            last_import_idx = new_content.rfind('import')
                            if last_import_idx != -1:
                                newline_idx = new_content.find('\n', last_import_idx)
                                new_content = new_content[:newline_idx+1] + import_statement + new_content[newline_idx+1:]
                            else:
                                new_content = import_statement + new_content

                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                                
                            print(f"  [+] Magia Inyectada en: {file}")
                            injected_count += 1
                except Exception as e:
                    pass

    print("\n----------------------------------------")
    print(f"[SUCCESS] Se inyectaron animaciones cinematograficas en {injected_count} vistas.")
    print("\n[IMPORTANTE] Recuerda instalar la libreria si no la tienes:")
    print("npm --prefix client install framer-motion")

if __name__ == "__main__":
    target = "client/src/views"
    if len(sys.argv) > 1:
        target = sys.argv[1]
    
    inject_animations(target)
