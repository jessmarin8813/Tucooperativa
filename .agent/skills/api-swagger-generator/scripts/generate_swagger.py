import os
import re
import json

def build_swagger():
    print("========================================")
    print("[DOCUMENTATION] API SWAGGER / OPENAPI GENERATOR")
    print("========================================\n")
    
    api_dir = "api"
    
    swagger_doc = {
        "openapi": "3.0.0",
        "info": {
            "title": "Contratistas API",
            "version": "1.0.0",
            "description": "API generada automaticamente."
        },
        "servers": [{"url": "http://localhost/Contratos/api"}],
        "paths": {}
    }
    
    if not os.path.exists(api_dir):
        print(f"[ERROR] Directorio {api_dir} no encontrado.")
        return

    print("[+] Analizando endpoints en /api...")
    for file in os.listdir(api_dir):
        if file.endswith('.php') and not file in ['db.php', 'middleware.php', 'config.php']:
            path_name = f"/{file}"
            swagger_doc["paths"][path_name] = {
                "post": {
                    "summary": f"Endpoint para {file}",
                    "description": "Este endpoint fue mapeado automaticamente.",
                    "responses": {
                        "200": {
                            "description": "Respuesta JSON exitosa"
                        }
                    }
                }
            }
            
            filepath = os.path.join(api_dir, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    params = re.findall(r"(?:\$_POST|\$data|\$input)\['(.*?)'\]", content)
                    
                    if params:
                        unique_params = list(set(params))
                        properties = {}
                        for p in unique_params:
                            properties[p] = {"type": "string"}
                            
                        swagger_doc["paths"][path_name]["post"]["requestBody"] = {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": properties
                                    }
                                }
                            }
                        }
            except Exception as e:
                pass

    output_file = "api/swagger.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(swagger_doc, f, indent=4)
        
    print(f"\n[OK] Escaneo completo")
    print(f"[OK] Se mapearon {len(swagger_doc['paths'])} endpoints exitosamente.")
    print(f"[OK] Archivo generado en: {output_file}")

if __name__ == "__main__":
    build_swagger()
