# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v36.5.31-MAINTENANCE)
SaaS para gestión de cooperativas de transporte. El sistema ha evolucionado de un listado pasivo a una **Consola de Mantenimiento Activa** basada en el principio de Gestión por Excepción.

## 🏗️ Reglas de Oro (Innegociables)
1.  **Maintenance Priority**: La vista por defecto de Mantenimiento oculta unidades operativas para priorizar Fallas y Vencidos.
2.  **Branding Neón**: El logo es el texto **"TuCooperativa"** con estilo `neon-text brand`.
3.  **Terminology**: Las unidades saludables se etiquetan profesionalmente como **"Al día"**.
4.  **Workshop IDs**: El ID oficial de la vista de mantenimiento es **`maintenance`**. Sub-vistas persistentes (`?history=1`).
5.  **Exclusive Filtering**: Los filtros del dashboard (Fallas, Vencidos, Al día) son estrictamente excluyentes (Lógica de Mantenimiento por Excepción).
6.  **Build Protocol**: NUNCA des por terminada una tarea sin ejecutar `python build_system.py`. (OMNI-GUARD v5.0).
7.  **Defensive UI**: Todo acceso a arreglos en `MaintenanceCenter.jsx` debe usar `?.length` y `|| []`.

## 🛠️ Arsenal de Skills Premium (.agent/skills/)
El sistema cuenta con un ecosistema de herramientas automatizadas corregidas y configuradas para este repositorio (v36.5.31):
- **Backend & Seguridad**: `API-Detective-PHP`, `Security-Guard-PHP` (Audit Forense v2.0).
- **Base de Datos**: `Database-Schema-Doctor` (Fix: Path Singleton).
- **Frontend & UI**: `standard-ui-guard` (Cumplimiento de Reglas Pro).
- **Bots**: `Bot-Python-Medic` (Diagnóstico de Telegram OK).

## 🚀 Hitos de la Versión v36.5.31 (Cierre de Marzo 2026)
- **Hito: Consola de Mantenimiento**. Rediseño Mobile-First con contadores neonatales y filtros por excepción (Previamente denominado Triage).
- **Hito: Catálogo Global**. Estandarización de servicios de mantenimiento para evitar duplicados.
- **Hito: Odómetro Forense**. Validación obligatoria de odómetros en cierre de rutas y salida de taller (Tolerancia 20-25km).
- **Hito: Estabilidad Crítica**. Corrección de errores de renderizado en React y "removeChild" crashes mediante defensiva total.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (OMNI-GUARD Certified).
- **Workshop API**: `api/fleet/workshop.php`.
- **Maintenance API**: `api/fleet/mantenimiento.php`.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en un estado de **Alta Disponibilidad Operativa (v36.5.31)**. Lee `docs/PROJECT_STATE.md` para el mapa de ruta y `docs/AI_MEMORY.md` para no romper la lógica de Mantenimiento.

