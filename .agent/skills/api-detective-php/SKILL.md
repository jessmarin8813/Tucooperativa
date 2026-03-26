---
name: API-Detective-PHP
description: Diagnóstico automatizado del Backend PHP en entornos XAMPP.
---

# Skill: API Detective PHP

Esta habilidad permite a Antigravity auditar la salud del servidor backend en `htdocs`. Está diseñada para resolver rápidamente problemas de rutas, errores HTTP 401/403, sesiones trabadas y fallos de conexión a la base de datos MySQL de XAMPP.

## Casos de Uso
1. **Error de Guardado Silencioso:** Cuando el frontend reporta que se guardó pero la BD local está vacía.
2. **Error JWT / Sessión 401/403:** Para diagnosticar colisiones de permisos entre sesiones superadmin y admin.
3. **Mapeo de Endpoints:** Verificar si un nuevo endpoint PHP responde formato JSON correctamente sin volcar errores fatales de PHP.

## Scripts Internos
- `scripts/doctor.py`: Hace ping a una lista de endpoints críticos (ej. `test_db.php`, `system_health_check.php`) para levantar reporte de salud.

## Ejecución
Para invocar al doctor:
`python .agent/skills/api-detective-php/scripts/doctor.py`
