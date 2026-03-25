import os
import subprocess
import sys

def print_banner():
    print("="*60)
    print("     TUCOOPERATIVA OMNI-GUARD v5.0 - FORENSIC & AUTO-DEPLOY")
    print("="*60)

def run_command(command, cwd=None):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        return result
    except Exception as e:
        print(f"[CRITICAL] Error: {str(e)}")
        return None

def run_step(name, command, cwd=None):
    print(f"[{name}] Ejecutando...")
    result = run_command(command, cwd)
    if not result: return False
    
    logs = (result.stdout + result.stderr).lower()
    # Detección de errores lógicos y de integridad
    if any(err in logs for err in ["sqlstate", "unknown column", "\"error\":", "exception", "fatal error", "undefined index"]):
        print(f"[FAIL] {name} detectó errores de INTEGRIDAD o LÓGICA:")
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

def php_lint():
    print("[PHP LINT] Escaneando sintaxis en /api y root...")
    has_error = False
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or "vendor" in root or ".git" in root: continue
        for file in files:
            if file.endswith(".php"):
                fpath = os.path.join(root, file)
                res = run_command(f"c:\\xampp\\php\\php.exe -l \"{fpath}\"")
                if res and res.returncode != 0:
                    print(f"[FAIL] Error de sintaxis en: {fpath}")
                    print(res.stdout)
                    has_error = True
    return not has_error

def main():
    print_banner()
    
    # 1. PHP Syntax Audit
    if not php_lint():
        print("[CRITICAL] Fallo en auditoría de sintaxis PHP.")
        sys.exit(1)
        
    # 2. Runtime Logic Audit
    if not run_step("RUNTIME AUDIT", "c:\\xampp\\php\\php.exe api\\tests\\runtime_runner.php"):
        sys.exit(1)
        
    # 3. Bot Validation
    print("[BOT AUDIT] Verificando sintaxis Python...")
    has_bot_error = False
    for root, dirs, files in os.walk("bot"):
        for file in files:
            if file.endswith(".py"):
                fpath = os.path.join(root, file)
                res = run_command(f"python -m py_compile \"{fpath}\"")
                if res and res.returncode != 0:
                    print(f"[FAIL] Error en {file}")
                    has_bot_error = True
    if has_bot_error: sys.exit(1)
    print("[PASS] Bot verificado.")

    # 4. Vite Build (ATOMIC DEPLOYMENT)
    print("[VITE BUILD] Iniciando construccion atomica en dist_temp...")
    
    # Limpiar residuo previo de falla si existe
    if os.path.exists("client/dist_temp"):
        subprocess.run("rmdir /s /q client\\dist_temp", shell=True)

    # Construir en carpeta temporal
    build_cmd = "npm run build -- --outDir dist_temp"
    if not run_step("VITE BUILD", build_cmd, cwd="client"):
        print("[CRITICAL] Fallo en la compilacion de Vite. El dist anterior se mantiene intacto.")
        sys.exit(1)

    # 4.1 Integrity Check
    index_path = os.path.join("client", "dist_temp", "index.html")
    if not os.path.exists(index_path) or os.path.getsize(index_path) < 500:
        print("[CRITICAL] Fallo de INTEGRIDAD: index.html no generado correctamente.")
        sys.exit(1)
    
    # 4.2 Atomic Swap
    print("[DEPLOY] Integridada confirmada. Intercambiando carpetas...")
    try:
        if os.path.exists("client/dist"):
            subprocess.run("rmdir /s /q client\\dist", shell=True)
        os.rename("client/dist_temp", "client/dist")
        print("[PASS] Build publicado exitosamente en /dist.")
    except Exception as e:
        print(f"[CRITICAL] Error durante el intercambio de carpetas: {str(e)}")
        sys.exit(1)

    # 5. AUTO-DEPLOY (GIT) - Optional/Robust
    print("\n" + "="*60)
    print("   ¡ESTABILIDAD TOTAL CONFIRMADA! Sincronizando Git...")
    print("="*60)
    
    subprocess.run("git add .", shell=True)
    # Solo commit si hay cambios
    status_res = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
    if status_res.stdout.strip():
        subprocess.run('git commit -m "BUILD STABLE: API Path Fix + Build Automation"', shell=True)
        print("[GIT] Cambios registrados localmente.")
        
        print("[GIT] Intentando Push...")
        push_res = subprocess.run("git push", shell=True)
        if push_res.returncode == 0:
            print("[DEPLOY] Pushed to Git successfully.")
        else:
            print("[WARNING] Push fallido. Revisa tu conexión o credenciales de Git.")
    else:
        print("[GIT] No hay cambios pendientes para commit.")

if __name__ == "__main__":
    main()
