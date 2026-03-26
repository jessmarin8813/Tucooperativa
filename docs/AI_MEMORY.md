# TuCooperativa - AI MEMORY (v17.1-Stable)

## 📌 Contexto Actual
El sistema es una plataforma SaaS multi-tenant para cooperativas de transporte, con bot de Telegram integrado y panel web.

### 🎭 Estructura de Roles (RBAC)
1. **`superadmin`** (Encargado): Gestión técnica global. Pestaña: `SuperAdminDashboard.jsx`.
2. **`dueno`** (Dueño de Cooperativa): Gestión de flota, choferes y finanzas de SU cooperativa. Pestaña: `Dashboard.jsx`.
3. **`chofer`** (Chofer): Operativa vía Telegram Bot.

### 🔑 Cuentas Críticas (Pruebas)
- **ID 9**: `username: superadmin`, `rol: superadmin`.
- **ID 10**: `username: admin`, `rol: dueno` (Cuenta principal del usuario para pruebas de negocio).
- **Password**: `admin123` (En desarrollo).

### 🛠️ Protocolo de Operación
- **Verificación**: Siempre usar `python build_system.py` después de cambios en Frontend o API. Este script audita el bot, hace linting de PHP y compila el bundle de producción.
- **Bot**: Localizado en `bot/bot.py`. Usa `api_client.py` para hablar con el backend.
- **Realtime**: `bot/realtime_server.py` maneja WebSockets para el dashboard.
- **Skills**: Ubicadas en `.agent/skills/` para auditoría y automatización.

### 🚩 Estado del Proyecto
- **Estabilidad**: v17.1-Stable (Armonización Quirúrgica de Roles Completada).
- **Próximos Pasos**: Desarrollo de módulos exclusivos para `superadmin`.
