---
name: Bot-Python-Medic
description: Diagnóstico y reparación automática de errores en Bots de Telegram (Python).
---

# Skill: Bot Python Medic

Esta habilidad permite a Antigravity auditar y reparar fallos comunes en el Bot de Telegram de TuCooperativa. Está optimizada para detectar errores de `NameError` (importaciones faltantes), problemas de estados en `ConversationHandler` y fallos de comunicación con el Backend.

## Casos de Uso
1. **NameError / ImportError:** Cuando el bot no inicia por falta de una clase de `telegram.ext`.
2. **Handlers Huérfanos:** Cuando un botón no responde porque no está registrado en el `dispatcher`.
3. **Falla de Sync de IP:** Cuando el bot intenta conectar a una IP vieja o inexistente en el `.env`.
4. **Error de Estado:** Cuando el bot se queda "trabado" en una conversación y no limpia el estado.

## Scripts Internos
- `scripts/diagnose_bot.py`: Escanea el código de `bot.py` buscando incoherencias en importaciones y registros.

## Ejecución
Para invocar al médico de bots:
`python .agent/skills/bot-python-medic/scripts/diagnose_bot.py`
