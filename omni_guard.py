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

    # 4. Vite Build
    if not run_step("VITE BUILD", "npm run build", cwd="client"):
        sys.exit(1)

    # 5. AUTO-DEPLOY (GIT)
    print("\n" + "="*60)
    print("   ¡ESTABILIDAD TOTAL CONFIRMADA! Iniciando Auto-Git...")
    print("="*60)
    
    run_command("git add .")
    commit_res = run_command("git commit -m \"BUILD STABLE: v5.0 Master Restoration + Layout Fixes\"")
    print(commit_res.stdout)
    
    push_res = run_command("git push")
    if push_res and push_res.returncode == 0:
        print("[DEPLOY] Pushed to Git successfully.")
    else:
        print("[WARNING] Build estable pero fallo al hacer push (Configuración de Git?).")
        print(push_res.stderr if push_res else "No response from Git.")

if __name__ == "__main__":
    main()
