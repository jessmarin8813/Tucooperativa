# Stability & Development Rules: TuCooperativa Hub

Este documento contiene las "Reglas de Oro" que deben seguirse para cualquier desarrollo futuro en este sistema. El incumplimiento de estas reglas romperá la integridad de la plataforma.

## 🛡️ La Regla #1: Omni-Guard
**NUNCA** consideres un cambio como terminado si no pasa el `build.bat`.
- El build audita: Sintaxis PHP, Sintaxis Python (Bot), Integridad de DB, y Sincronización de Variables.
5.  **Build Protocol**: NUNCA des por terminada una tarea sin ejecutar `python build_system.py`. Si el build falla, la tarea NO está terminada.
6.  **Skill-First Approach**: Para diagnósticos de Base de Datos, Backend o UI, consulta SIEMPRE las instrucciones en `.agent/skills/`. Usa herramientas como `Database-Schema-Doctor` antes de proponer cambios estructurales.

## 🎨 Estética Premium (UI/UX)
- Mantener el estilo **Glassmorphism**: Fondos radiales oscuros (`#1e1b4b` a `#0a0b12`), bordes neon (`--accent`) y efectos de desenfoque (`backdrop-filter: blur`).
- No usar colores genéricos. Seguir la paleta del `index.css`.
- Todas las vistas deben ser responsivas (Desktop first, pero Mobile friendly).

## 📊 Lógica de Negocio (Core)
17. **Cuota Diaria Dinámica**: La deuda se calcula siempre como `(Días operados * v.cuota_diaria) - Pagos aprobados`. Prohibido usar montos fijos (ej. $10) en la lógica del sistema.
2. **Sistema Forense**: Cualquier reporte de odómetro debe compararse con el cierre anterior en `api/rutas.php`. Los saltos de kilometraje ("Brechas") disparan una alerta de nivel "Crítico".
3. **Cobranza en Bs**: Los pagos reportados por choferes deben admitir modelo mixto (Efectivo + Pago Móvil) en Bolívares.
4. **Multi-tenant**: Todo debe estar filtrado por `cooperativa_id` para permitir múltiples líneas de transporte.

## 🔒 Seguridad y Bots
- **Zero-Command**: El bot de Telegram no debe usar comandos escritos. Todo debe ser a través de Inline Keyboards (botones) para facilitar el uso a choferes.
- **Gatekeeper**: Antes de procesar cualquier acción en el bot, verificar que el usuario y su vehículo estén activos en la base de datos.
- **Login**: La autenticación administrativa es por **Nombre de Usuario** (no email).

## 🛠️ Procedimiento de Troubleshooting
1. Usar proactivamente las **Skills Premium** en `.agent/skills` (ej: `Database-Schema-Doctor`, `API-Detective-PHP`, `Security-Guard-PHP`).
2. Ejecutar `python build_system.py`.
3. Revisar `error_log` en el servidor PHP si hay fallos 500.
4. Usar `c:\xampp\php\php.exe debug_login.php` si hay problemas de acceso.
