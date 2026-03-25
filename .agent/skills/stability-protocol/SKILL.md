---
name: Stability-Protocol
description: Protocolo de estabilidad arquitectónica y reglas de oro para TuCooperativa.
---

# Skill: Stability Protocol

Esta habilidad define los estándares innegociables de estabilidad para el proyecto TuCooperativa. Debe ser consultada al inicio de cada nueva sesión para asegurar la continuidad técnica.

## 🛡️ Reglas de Oro (Anti-Crash)
1. **Validación de NoneType**: Nunca usar f-strings directos sobre respuestas de la API sin guardia (ej. `float(val or 0):.2f`).
2. **Global Error Handler**: El bot siempre debe tener un `add_error_handler` registrado para evitar cierres abruptos por fallos de red.
3. **Async Safety**: Usar `await` correctamente en todas las llamadas de la API cliente.

## 🛠️ Sistema de Construcción (Build)
- **Comando Obligatorio**: `python build_system.py`
- **Qué hace**: Ejecuta pre-limpieza, instalación de dependencias, auditoría de OMNI-GUARD, diagnóstico de Bot-Medic y auditoría de integridad del sistema.
- **Falla**: Si el script devuelve error, el sistema NO se considera estable para producción.

## 📂 Documentación Persistente
- Consultar `docs/PROJECT_STATE.md` para ver el roadmap y estado actual.
- Consultar `docs/ARCHITECTURE.md` para entender el flujo de datos (Dueño/Chofer).

## Ejecución de Diagnóstico
`python .agent/skills/bot-python-medic/scripts/diagnose_bot.py`
