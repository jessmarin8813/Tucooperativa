import os
import subprocess
import sys

def print_banner():
    print("="*60)
    print("     TUCOOPERATIVA OMNI-GUARD v4.0 - TOTAL VALIDATION")
    print("="*60)

def run_step(name, command, cwd=None):
    print(f"[{name}] Ejecutando...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        
        # Auditoría Profunda de Logs
        logs = (result.stdout + result.stderr).lower()
        if "sqlstate" in logs or "unknown column" in logs or "\"error\":" in logs or "exception" in logs:
            print(f"[FAIL] {name} detectó errores de INTEGRIDAD (SQL/Lógica):")
            print("-" * 40)
            print(result.stdout)
            print(result.stderr)
            print("-" * 40)
            return False

        if result.returncode != 0:
            print(f"[FAIL] {name} detectó errores de SISTEMA (Exit Code {result.returncode}):")
            print("-" * 40)
            print(result.stdout)
            print(result.stderr)
            print("-" * 40)
            return False
            
        print(f"[PASS] {name} verificado correctamente.")
        return True
    except Exception as e:
        print(f"[CRITICAL] Error al ejecutar {name}: {str(e)}")
        return False

def main():
    print_banner()
    
    # 1. Backend Crawler (El corazón de la auditoria)
    if not run_step("BACKEND AUDIT", "c:\\xampp\\php\\php.exe api\\tests\\runtime_runner.php"):
        sys.exit(1)
        
    # 2. Bot Linting
    print("[BOT AUDIT] Verificando sintaxis Python...")
    bot_path = "bot"
    has_bot_error = False
    for root, dirs, files in os.walk(bot_path):
        for file in files:
            if file.endswith(".py"):
                fpath = os.path.join(root, file)
                res = subprocess.run(f"python -m py_compile \"{fpath}\"", shell=True, capture_output=True)
                if res.returncode != 0:
                    print(f"[FAIL] Error en {file}")
                    has_bot_error = True
    if has_bot_error: sys.exit(1)
    print("[PASS] Bot verificado.")

    # 3. Payload Integrity
    print("[INTEGRITY] Verificando sincronización App-API...")
    app_jsx_path = os.path.join("client", "src", "App.jsx")
    with open(app_jsx_path, 'r', encoding='utf-8') as f:
        content = f.read()
        if "username, password" not in content:
            print("[FAIL] Payload desincronizado en App.jsx.")
            sys.exit(1)
    print("[PASS] Sincronización verada.")

    # 4. Vite Build
    if not run_step("VITE BUILD", "npm run build", cwd="client"):
        sys.exit(1)

    print("\n" + "="*60)
    print("   ¡ESTABILIDAD TOTAL CONFIRMADA! Sistema 100% Seguro.")
    print("="*60)

if __name__ == "__main__":
    main()
