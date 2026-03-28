# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v36.5.17-Stable)
SaaS para gestión de cooperativas de transporte. El sistema ha sido **profundamente reconstruido** para incluir un **Pipeline de Taller Profesional** y sincronizar la experiencia de administración global.

## 🏗️ Reglas de Oro (Innegociables)
1.  **Identidad de Marca**: El logo es el texto **"TuCooperativa"** con estilo `neon-text brand`. NO lo cambies por iconos genéricos. Es el alma visual del sistema.
# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v36.5.17-Stable)
SaaS para gestión de cooperativas de transporte. El sistema ha sido **profundamente reconstruido** para incluir un **Pipeline de Taller Profesional** y sincronizar la experiencia de administración global.

## 🏗️ Reglas de Oro (Innegociables)
1.  **Identidad de Marca**: El logo es el texto **"TuCooperativa"** con estilo `neon-text brand`. NO lo cambies por iconos genéricos. Es el alma visual del sistema.
2.  **Clinical Grid Architecture**: El módulo de flota para PC usa una rejilla matemática de **35% 20% 20% 25%**. 
3.  **Workshop Logic**: El ID oficial de la vista de mantenimiento es **`maintenance`**. Al navegar, usa `setActiveView('maintenance')`. 
4.  **Zero-Collision UI**: En `MaintenanceCenter.jsx`, los botones de Taller y Tareas están integrados con flexbox para evitar solapamientos. NUNCA uses `position: absolute` en las cabeceras de las fichas.
5.  **Build Protocol**: NUNCA des por terminada una tarea sin ejecutar `python build_system.py`. Si el build falla, la tarea NO está terminada.
6.  **Advanced Skill Usage**: Antes de cualquier cambio estructural o debug profundo, consulta las **Skills Premium** en `.agent/skills/` (ej: `Database-Schema-Doctor`, `API-Detective-PHP`). Úsalas para auditar el estado real antes de proponer cambios.

## 🛠️ Arsenal de Skills Premium (.agent/skills/)
El sistema cuenta con un ecosistema de herramientas automatizadas que el asistente DEBE usar proactivamente:
- **Backend & Seguridad**: `API-Detective-PHP`, `Security-Guard-PHP`, `API-Swagger-Generator`.
- **Base de Datos**: `Database-Schema-Doctor`, `Database-Timeline-Migrator` (Migraciones), `MySQL-DummyData-Generator`.
- **Frontend & UI**: `standard-ui-guard` (Auditoría visual), `Premium-Animation-Injector`, `React-Scaffolder-Premium`.
- **Optimización & Eficiencia**: `dev-efficiency`, `Performance-Profiler`.
- **Testing & DevOps**: `E2E-Web-Tester` (Cypress), `Docker-Containerizer`, `CI-CD-Pipeline-Builder`.
- **Bots**: `Bot-Python-Medic` (Diagnóstico de Telegram).

## 🚀 Estado Exacto del Desarrollo (Handover v36.5.17+)
- **Hito (Marzo 2026)**: **Pipeline de Taller Completo**. El sistema gestiona desde el reporte del chofer hasta el diagnóstico, gastos de repuestos vinculados y la reactivación con notificación automática por Telegram.
- **Hito (Marzo 2026)**: **Persistencia de Navegación**. Se implementó un whitelist en `App.jsx` que permite que el sistema mantenga la vista actual (incluyendo mantenimiento) tras pulsar F5.
- **Hito (Marzo 2026)**: **Robustez Frontend**. Todas las vistas principales están protegidas contra datos nulos (`?.`) y validación de arrays (`Array.isArray`).

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (Vite Build + Integrity Audit + Master Sync).
- **Workshop API**: `api/fleet/workshop.php` centraliza la lógica de reparaciones.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en un estado de alta estabilidad. Si vas a trabajar en finanzas, ten en cuenta que los gastos ahora pueden estar vinculados a `incidencia_id` si provienen del taller. No rompas la persistencia de la URL en `App.jsx`.
