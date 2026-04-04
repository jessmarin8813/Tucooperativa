# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v8.13-BRANDED & FORENSIC-FIX)
SaaS para gestión de cooperativas de transporte. El sistema opera bajo una arquitectura de **Multi-tenancy Isolada**, Estabilidad Móvil Premium y Silencio Absoluto.

## 🏗️ Reglas de Oro (Innegociables)
1.  **Mobile Web Dev Premium**: 
    - Breakpoints unificados a **`< 1024px`** para modo móvil.
    - Padding lateral estricto de **22px** (Regla #45).
    - Touch targets mínimos de **58px** en botones principales (Regla #48).
2.  **Silent-First Architecture**: Prohibido el uso de `console.log` en producción.
3.  **Aislamiento Multi-tenant (v8.13)**: Toda consulta SQL debe filtrar por `cooperativa_id`. El cruce de datos entre cooperativas es un fallo de seguridad crítico.
4.  **Cero Redundancia (SSOT)**: Antes de crear un endpoint, verifica si ya existe uno (ej. `save_config.php` centraliza la configuración corporativa, mientras que la gestión de cuotas es estrictamente por vehículo).
5.  **Official BCV Saneado (v7.0)**: Tasa dinámica sincronizada.
6.  **Build Protocol**: **SIEMPRE ejecuta `python build_system.py`** (OMNI-GUARD). NUNCA uses `npm run build` manualmente.
7.  **Quota Mastery (v8.14)**: La cuota es DINÁMICA y se define en cada vehículo. Prohibido hardcodear montos.
8.  **Z-Index Mastery**: El Sidebar tiene aislamiento en `z-index: 1100`.

## 🚀 Hitos de la Versión v8.13-BRANDED
- **Hito: Identidad Corporativa**: Soporte para Nombre, RIF, Lema y Logo dinámico por cooperativa.
- **Hito: Sincronización Forense**: Eliminación de falsos positivos en el Hub Forense vinculando pagos automáticamente al cierre de jornada.
- **Hito: Bot Branding**: El Telegram Bot se identifica con la marca real de la cooperativa del usuario.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (Compila, Audita y Sincroniza con Git).
- **Error Rescue**: `MainErrorBoundary` silencioso.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en **v8.13-BRANDED**. ¡No crees archivos duplicados para configuración! Usa `save_config.php`. El multi-tenancy es la prioridad #1.

