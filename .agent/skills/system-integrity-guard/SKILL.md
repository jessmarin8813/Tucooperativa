---
name: System-Integrity-Guard
description: Auditoría obligatoria para evitar regresiones en base de datos, enrutamiento y estabilidad de procesos.
---

# Skill: System Integrity Guard 🛡️

Esta es una salvaguarda Crítica. Cada vez que Antigravity termine una tarea compleja que involucre rutas (`.htaccess`), base de datos o procesos críticos, **DEBE** ejecutar esta auditoría para asegurar que no ha roto nada accidentalmente.

## Cuándo usarla
- Después de modificar el enrutamiento (`.htaccess`).
- Después de migraciones de base de datos.
- Cuando el usuario reporte que "algo se rompió solo".

## Scripts de Auditoría
- `scripts/integrity_audit.php`: Verifica la salud del sistema en 4 puntos clave:
  1. **Schema Sync**: Asegura que las columnas críticas de Banco y Forense existen.
  2. **Routing Persistence**: Verifica las banderas `[QSA]` y `RewriteBase`.
  3. **Frontend Sync**: Valida que todas las vistas en `src/views` estén permitidas en `App.jsx`.
  4. **Process Health**: Detecta procesos `php` o `build.bat` huérfanos.

## Instrucciones para Antigravity
1. Antes de enviar tu `walkthrough.md`, ejecuta:
   `C:\xampp\php\php.exe .agent/skills/system-integrity-guard/scripts/integrity_audit.php`
2. Si el script reporta [ERROR], arréglalo antes de notificar al usuario.
