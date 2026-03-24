---
name: Security-Guard-PHP
description: Auditoría automatizada de vulnerabilidades (SQL Injection, CORS expuesto, JWT débil) en el backend PHP.
---

# Skill: Security Guard PHP 🛡️

Esta habilidad le permite a Antigravity escanear preventivamente tu código backend PHP en busca de malas prácticas de seguridad comunes antes de subir a producción.

## Vulnerabilidades Detectadas
1. **SQL Injection**: Detecta si estás inyectando variables directamente (`$id`) o usando `$_POST`/`$_GET` sin sentencias preparadas (PDO params).
2. **CORS Abierto**: Vigila que los headers de origen no sean `*` en entornos productivos.
3. **Exposición de PDO**: Revisa que las consultas usen un manejo de errores robusto.

## Scripts Internos
- `scripts/audit_security.py`: Motor de Python que lee recursivamente todos los archivos `.php` y ejecuta un análisis estático de expresiones regulares (RegEx).

## Instrucciones para Antigravity
Antes de dar por terminado cualquier módulo del backend, debes siempre ejecutar:
`python .agent/skills/security-guard-php/scripts/audit_security.py ../../../api`
(O adaptando el target al directorio que contenga los scripts PHP).
