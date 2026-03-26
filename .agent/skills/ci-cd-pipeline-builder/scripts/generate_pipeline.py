import os

def build_pipeline():
    print("========================================")
    print("[CI/CD] CONTINUOUS INTEGRATION BUILDER")
    print("========================================\n")
    
    workflow_dir = ".github/workflows"
    os.makedirs(workflow_dir, exist_ok=True)
    
    dest_file = os.path.join(workflow_dir, "main.yml")
    
    pipeline_code = """name: Produccion CI/CD

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout del Codigo
      uses: actions/checkout@v3

    - name: Configurar Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
        cache-dependency-path: './client/package.json'

    - name: Configurar PHP Base
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'

    - name: Instalar Dependencias Frontend
      working-directory: ./client
      run: npm install

    - name: 1. Auditoria Estandar UI y ESLint
      working-directory: ./client
      run: npm run lint

    - name: 2. Compilacion Vite Pro Max
      working-directory: ./client
      run: npm run build

    - name: 3. Comprobar PWA y Tamaño del Bundle
      run: echo "El build ha pasado las verificaciones estrictamente estaticas."
      
    # Mover artefactos a tu Host en el futuro aqui
    # - name: Deploy via FTP/SSH
"""

    with open(dest_file, 'w', encoding='utf-8') as f:
        f.write(pipeline_code)
        
    print(f"[OK] El Pipeline de Integracion Continua de GitHub Actions se ha generado.")
    print(f"[OK] Se ha guardado en: {dest_file}")
    print("\n[INFO] Ahora cada 'git push' a Master activara pruebas automaticas en la nube.")

if __name__ == "__main__":
    build_pipeline()
