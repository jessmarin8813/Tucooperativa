# 🚀 Prompt para Siguiente Sesión (v8.11-ASCII-Safe)

Copia y pega este prompt al inicio de tu próxima sesión:

---
Lee **docs/PROJECT_STATE.md** para entender el estado **v8.11-Infrastructure (High-Performance & ASCII-Safe)**. 

### Infraestructura Actual:
1.  **Hubs Unificados**: TuCooperativa corre en el Puerto 8000 (Bot + Realtime Server) y TuTienda en el Puerto 8001 (SaaS Engine).
2.  **Blindaje Windows**: El código es 100% ASCII-Safe; no usar emojis o tildes en registros de consola (print/logging) para evitar fallos de `charmap` (CP1252).
3.  **Networking v8.11**: Conexiones persistentes vía `httpx.AsyncClient` y polling instantáneo de Telegram para latencia cero en notificaciones móviles.
4.  **Auto-Discovery**: IP local sincronizada automáticamente (`sync_env_ip`) para acceso multidispositivo sin configuración manual.

CRÍTICO: No tocar la estructura de `bot.py` sin verificar el bloque `if __name__ == "__main__":` y la definición de variables globales (TOKEN/BACKEND_URL). Mantener el estándar visual de **Iconos 48px** y **Botones 70px** para accesibilidad móvil premium.
---
