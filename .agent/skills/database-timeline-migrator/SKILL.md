---
name: Database-Timeline-Migrator
description: Sistema de Control de Versiones robusto para esquemas MySQL usando migraciones.
---

# Skill: Database Timeline Migrator ⏳

En un entorno SaaS (como SaludApp o Contratos), no puedes alterar las bases de datos a capricho editando SQLs sueltos en phpMyAdmin porque podrías borrar datos por error. Esta herramienta crea "Archivos de Migración" (Versiones) para tu Base de Datos.

## Casos de Uso
1. **Añadir Columna "Role"**: Para escalar permisos, creas una migración que añade la columna y luego corres `migrate up`.
2. **Rollback**: Si el cambio tira la aplicación abajo, ejecutas `migrate down` y la columna desaparece de forma segura, volviendo al estado anterior conocido.

## Scripts Internos
- `scripts/create_migration.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/database-timeline-migrator/scripts/create_migration.py add_role_column`

Generará una nueva carpeta `database/migrations/2026_03_XX_add_role_column.sql` con una plantilla estructurada de subir y bajar.
