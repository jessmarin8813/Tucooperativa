# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v42.0-AUDIT)
SaaS para gestión de cooperativas de transporte. El sistema ha evolucionado a una **Consola de Auditoría Forense y Transparencia Monetaria** (v42.0).

## 🏗️ Reglas de Oro (Innegociables)
1.  **Monetary Transparency**: Toda deuda se maneja con "Referencia en USD" sincronizada con la tasa BCV oficial en el Simulador y el Bot.
2.  **Multimoneda Histórica**: Los abonos en Bs se acreditan usando la tasa BCV grabada en el momento del reporte del pago (`tasa_cambio`).
3.  **Maintenance Priority**: La vista por defecto de Mantenimiento oculta unidades operativas para priorizar Fallas y Vencidos (Triage inteligente).
4.  **Resolved_at Logic**: La resolución de fallas depende exclusivamente del campo `resolved_at` (Timestamp). Se permiten soluciones con texto vacío; esto NO re-abre la falla.
5.  **Workshop IDs**: El ID oficial de la vista de mantenimiento es **`maintenance`**.
6.  **Build Protocol**: NUNCA des por terminada una tarea sin ejecutar `python build_system.py`. (OMNI-GUARD v5.0).
7.  **Defensive UI**: Todo acceso a arreglos en `MaintenanceCenter.jsx` debe usar `?.length` y `|| []`.

## 🛠️ Arsenal de Skills Premium (.agent/skills/)
El sistema cuenta con un ecosistema de herramientas automatizadas corregidas y configuradas para este repositorio (v42.0):
- **Backend & Seguridad**: `API-Detective-PHP`, `Security-Guard-PHP` (Audit Forense v2.0).
- **Base de Datos**: `Database-Schema-Doctor` (Fix: Path Singleton).
- **Bot-Python-Medic**: Diagnóstico de Telegram OK.
- **Integrity-Audit**: Verificación de cálculos multimoneda y estados.

## 🚀 Hitos de la Versión v42.0-Audit (Marzo 2026)
- **Hito: Transparencia Monetaria**. Despliegue de arquitectura Referencia USD y sincronización masiva de deudas chofer-cooperativa.
- **Hito: Auditoría Forense**. Implementación de `resolved_at` y validación de odómetro con tolerancia de 20km.
- **Hito: Consola de Triage**. Rediseño de Mantenimiento con estados "Fallas", "Vencidos" y "Al día" con filtrado excluyente.
- **Hito: Estabilidad Crítica**. Cierre de fugas de memoria en React y crashes por manipulación del DOM.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (OMNI-GUARD Certified).
- **Workshop API**: `api/fleet/workshop.php`.
- **Maintenance API**: `api/fleet/mantenimiento.php`.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en un estado de **Alta Disponibilidad Operativa (v42.0-Audit)**. Lee `docs/PROJECT_STATE.md` para el mapa de ruta y `docs/AI_MEMORY.md` para no romper la lógica de Transparencia Monetaria.

