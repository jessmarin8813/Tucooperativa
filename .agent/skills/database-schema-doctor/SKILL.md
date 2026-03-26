---
name: Database-Schema-Doctor
description: Extracción, auditoría y validación automática del esquema de Base de Datos MySQL.
---

# Skill: Database Schema Doctor 🗄️

Esta habilidad le permite a Antigravity leer la estructura real de tu base de datos XAMPP, compararla con lo que el código frontend/backend espera, y diagnosticar si faltan columnas o tablas.

## Casos de Uso
1. **Migraciones incompletas**: Cuando pasas de *Contratos* a *SaludApp* y olvidas ejecutar un `source db.sql`.
2. **Campos invisibles**: Cuando el frontend no muestra un dato porque la columna en la BD se llama diferente.
3. **Mapeo Rápido**: Para que el agente (Antigravity) pueda leer tu BD en 1 segundo y sepa exactamente qué campos existen sin tener que preguntarte.

## Scripts Internos
- `scripts/schema_doctor.php`: Se conecta a la BD local y exporta la estructura completa (tablas, columnas, tipos) en formato JSON estructurado.

## Instrucciones para Antigravity
Si el usuario dice "hay un error con los campos" o "verifica la base de datos":
1. Ejecuta este comando: `php .agent/skills/database-schema-doctor/scripts/schema_doctor.php`
2. Lee el archivo `schema_report.json` resultante para analizar el problema.
