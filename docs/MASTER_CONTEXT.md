# TuCooperativa Master Context Prompt

**Objetivo:** Este prompt proporciona el contexto completo para continuar el desarrollo del Hub Financiero **TuCooperativa**, asegurando que el nuevo asistente mantenga la coherencia arquitectónica y no cree módulos redundantes.

---

## 🚀 Resumen del Proyecto
**TuCooperativa** es una plataforma SaaS de gestión financiera para flotas de transporte, diseñada bajo el modelo de negocio venezolano de **Cuotas Diarias ($10)** y cobranza remota.

### 🏗️ Arquitectura Técnica
- **Backend:** PHP 8+ (APIs RESTful centralizadas en `/api`).
- **Frontend:** React + Vite + Vanilla CSS (Estética Premium/Glassmorphism).
- **Bot de Telegram:** Python (`python-telegram-bot`), ubicado en `/bot`.
- **Validación:** Sistema **`omni_guard.py`** que audita sintaxis PHP/Python, seguridad y estabilidad antes de cada compilación/commit.
- **Estado de Build:** Ultra-Estable (Resolución completa de bucles `useEffect` e integridad de `client/dist`).

---

## 💎 Lógica de Negocio Crítica (NO REPETIR)
1. **Modelo de Cuota Dinámica:** Cada día operado genera una deuda automática según la pactada en `vehiculos.cuota_diaria`. La deuda se salda con abonos aprobados por el dueño.
2. **Sistema Forense:** Al iniciar jornada, el bot detecta "Brechas" (saltos de km no reportados) comparando el cierre anterior. Genera alertas automáticas al dueño.
3. **Cobranza Mixta (Bs):** Los pagos se reportan en Bolívares (Efectivo/Pago Móvil). El bot es **Zero-Command** (100% basado en botones).
4. **Hub de Rentabilidad:** Calcula Utilidad Neta (Ingresos - Gastos de Mantenimiento) y emite alertas de salud financiera (Unidades que gastan más de lo que generan).

---

## 🛠️ Archivos Maestros de Referencia
- **`docs/SYSTEM_MAP.md`**: El mapa detallado de todos los archivos y su propósito.
- **`STABILITY.md` (si existe)**: Reglas de oro para mantener el código limpio.
- **`api/includes/middleware.php`**: Control de sesión y multi-tenant.
- **`bot/bot.py`**: Motor del bot basado en estados dinámicos.

---

## ⚠️ Reglas para el Asistente
- **Cero Redundancias:** NO crees archivos en `/api` si ya existe su equivalente en `/api/admin` o `/api/chofer`. Revisa siempre `SYSTEM_MAP.md`.
- **Fricción Cero:** El chofer NO debe escribir comandos en Telegram. Todo es por botones.
- **Auditoría Forense:** Cualquier sensor de movimiento/kilometraje debe pasar por el filtro de brechas.
- **Estilo Visual:** Mantener el look premium (bordes redondeados, sombras suaves, fuentes modernas).

---

## ✅ Estado Actual
El sistema está en **Versión v36.2-Stable (Fleet Mastery Edition)**. Se ha completado el **Desacoplamiento Total de Choferes** (Tabla `choferes`), la reconstrucción de la Flota (PC/Móvil) con unlinking directo, y la estabilización del Middleware para Telegram. El sistema es 100% responsivo y posee una auditoría de integridad activa (`omni_guard.py`).
