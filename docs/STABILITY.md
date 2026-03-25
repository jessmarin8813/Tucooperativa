# Stability & Development Rules: TuCooperativa Hub

Este documento contiene las "Reglas de Oro" que deben seguirse para cualquier desarrollo futuro en este sistema. El incumplimiento de estas reglas romperá la integridad de la plataforma.

## 🛡️ La Regla #1: Omni-Guard
**NUNCA** consideres un cambio como terminado si no pasa el `build.bat`.
- El build audita: Sintaxis PHP, Sintaxis Python (Bot), Integridad de DB, y Sincronización de Variables.
- Si el build falla, el sistema NO es apto para producción.

## 🎨 Estética Premium (UI/UX)
- Mantener el estilo **Glassmorphism**: Fondos radiales oscuros (`#1e1b4b` a `#0a0b12`), bordes neon (`--accent`) y efectos de desenfoque (`backdrop-filter: blur`).
- No usar colores genéricos. Seguir la paleta del `index.css`.
- Todas las vistas deben ser responsivas (Desktop first, pero Mobile friendly).

## 📊 Lógica de Negocio (Core)
1. **Cuota Diaria ($10)**: La deuda se calcula siempre como `(Días operados * 10) - Pagos aprobados`.
2. **Sistema Forense**: Cualquier reporte de odómetro debe compararse con el cierre anterior en `api/rutas.php`. Los saltos de kilometraje ("Gaps") disparan una alerta de nivel "Crítico".
3. **Cobranza en Bs**: Los pagos reportados por choferes deben admitir modelo mixto (Efectivo + Pago Móvil) en Bolívares.
4. **Multi-tenant**: Todo debe estar filtrado por `cooperativa_id` para permitir múltiples líneas de transporte.

## 🔒 Seguridad y Bots
- **Zero-Command**: El bot de Telegram no debe usar comandos escritos. Todo debe ser a través de Inline Keyboards (botones) para facilitar el uso a choferes.
- **Gatekeeper**: Antes de procesar cualquier acción en el bot, verificar que el usuario y su vehículo estén activos en la base de datos.
- **Login**: La autenticación administrativa es por **Nombre de Usuario** (no email).

## 🛠️ Procedimiento de Troubleshooting
1. Ejecutar `.\build.bat`.
2. Revisar `error_log` en el servidor PHP si hay fallos 500.
3. Usar `c:\xampp\php\php.exe debug_login.php` si hay problemas de acceso.
