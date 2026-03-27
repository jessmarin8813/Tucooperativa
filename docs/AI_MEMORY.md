# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v36.2-Stable)
SaaS para gestión de cooperativas de transporte. El sistema ha sido **profundamente reconstruido** para desacoplar choferes de usuarios y perfeccionar la experiencia móvil.

## 🏗️ Reglas de Oro (Innegociables)
1.  **Identidad de Marca**: El logo es el texto **"TuCooperativa"** con estilo `neon-text brand`. NO lo cambies por iconos genéricos. Es el alma visual del sistema.
2.  **Clinical Grid Architecture**: El módulo de flota para PC usa una rejilla matemática de **35% 20% 20% 25%**. Esta alineación es sagrada para evitar el "hacinamiento".
3.  **Zero-Collision Mobile**: La flota en móvil usa tarjetas nativas (`glass`) con jerarquía horizontal premium. NO uses tablas en móvil.
4.  **Driver Decoupling**: Los choferes viven en la tabla `choferes`, NO en `usuarios`. La vinculación en `vehiculos.chofer_id` apunta a la tabla `choferes`.
5.  **Build Protocol**: NUNCA des por terminada una tarea sin ejecutar `python build_system.py`. Si el build falla, la tarea NO está terminada.

## 🚀 Estado Exacto del Desarrollo (Handover v36.2+)
- **Logro (Marzo 2026)**: Desacoplamiento total de choferes. Registro, simulador y pagos ahora operan sobre la tabla `choferes`.
- **Logro (Marzo 2026)**: Reconstrucción total de la Flota (PC/Móvil). Se implementó el unlinking (desvinculación) directo de choferes en la UI con iconos premium (Papelera/X).
- **Logro (Marzo 2026)**: Reparada la sesión de Telegram en `api/includes/middleware.php`. Se aseguró la propagación del `telegram_chat_id` en el objeto de sesión para evitar falsas desvinculaciones en el Dashboard.
- **Logro (Marzo 2026)**: El Dashboard (`Dashboard.jsx`) ahora recibe el prop `user` desde `MainLayout` para reconocer la vinculación del dueño en tiempo real.

## 🛠️ Herramientas Activas
- **Build System**: `python build_system.py` (Vite Build + Integrity Audit + Git Sync).
- **Omni-Guard**: Guardia de integridad (v5.0) integrada en el build system.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está estable y sincronizado. Si haces cambios en la UI, respeta el esquema de colores (Glassmorphism / Neon Primary) y siempre verifica con el build system. No borres `telegram_chat_id` de los usuarios; es la vía de comunicación crítica del dueño.
