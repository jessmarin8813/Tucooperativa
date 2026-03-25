import subprocess
import os
import sys

def run_step(name, command, cwd=None, allow_fail=False):
    print(f"\n[STEP] {name}...")
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=not allow_fail)
        return True
    except subprocess.CalledProcessError as e:
        if allow_fail:
            return True
        print(f"\n🚨 [CRITICAL ERROR] Step '{name}' failed with code {e.returncode}")
        return False


def main():
    print("========================================")
    print("   TUCOOPERATIVA - SMART BUILD SYSTEM   ")
    print("========================================\n")

    # 1. Prep (Note: We avoid killing python.exe here to prevent script suicide)
    run_step("Preparando Entorno", "taskkill /F /IM php.exe /T 2>nul & taskkill /F /IM node.exe /T 2>nul", allow_fail=True)

    import time

    time.sleep(2)

    # 2. Dependencies
    if not run_step("Instalando Dependencias (Frontend)", "npm install", cwd="client"):
        sys.exit(1)

    # 3. Omni-Guard
    if not run_step("Ejecutando OMNI-GUARD (Audit + Git)", "python omni_guard.py"):
        sys.exit(1)

    # 4. Bot-Python-Medic
    if not run_step("Auditoría del Bot (Bot-Python-Medic)", "python .agent/skills/bot-python-medic/scripts/diagnose_bot.py"):
        sys.exit(1)

    # 5. Integrity Audit
    if not run_step("Guardia de Integridad del Sistema", "C:\\xampp\\php\\php.exe .agent/skills/system-integrity-guard/scripts/integrity_audit.php"):
        sys.exit(1)

    # 6. Documentation Auto-Update
    run_step("Actualizando Memoria del Proyecto (docs/)", "python .agent/skills/stability-protocol/scripts/update_docs.py", allow_fail=True)

    print("\n✅ [SUCCESS] Sistema estable y verificado. Proceso completado con éxito.")
    sys.exit(0)

if __name__ == '__main__':
    main()
