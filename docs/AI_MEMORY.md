# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v42.1-AUDIT)
SaaS para gestión de cooperativas de transporte. El sistema opera bajo una arquitectura de **Auditoría Forense, Transparencia Monetaria y UI Reactiva** (v42.1).

## 🏗️ Reglas de Oro (Innegociables)
1.  **Monetary Transparency**: Toda deuda se maneja con "Referencia en USD" sincronizada con la tasa BCV oficial constante.
2.  **Multimoneda Histórica**: Los abonos en Bs se acreditan usando la tasa BCV grabada en el momento del reporte del pago (`tasa_cambio`).
3.  **Resolved_at Logic**: La resolución de fallas de UI depende de `resolved_at` (Timestamp). Se permiten textos vacíos, esto no re-abre la falla.
4.  **UI Triage Filtering**: Vistas como Mantenimiento (oculta listos) y Cobranzas (oculta solventes) funcionan como *To-Do Lists*; siempre filtra por defecto los casos completados.
5.  **Defensive React (Optional Chaining)**: Los payloads de choferes (`choferes.php`) traen la propiedad `vehiculo_placa` (vía `LEFT JOIN`) si están asignados. NUNCA evalúes `c.vehiculo_id` si proviene de ese endpoint. Todo mapeo debe estar protegido (`|| []`).
6.  **PWA Simulator States**: `driver_sim.php` debe hacer _fetch sincrónico_ (`checkCurrentStatus`) antes de consumir datos guardados en caché local (ej. asignar unidad).
7.  **LAN Mobile Access**: Vite corre con flag `--host` (`0.0.0.0`) para tolerar pruebas vía Wi-Fi local sin fallas de React Router (basado en parámetros URL, no BrowserRouter).
8.  **Build Protocol**: NUNCA uses `npm run build`. Al finalizar diseño/código, PROBADO O NO, **SIEMPRE ejecuta `python build_system.py`** (OMNI-GUARD v5.0).

## 🛠️ Arsenal de Skills Premium (.agent/skills/)
El ecosistema de herramientas automatizadas está perfilado a (v42.1):
- **Backend & Seguridad**: `API-Detective-PHP`, `Security-Guard-PHP` (Audit Forense v2.0).
- **Base de Datos**: `Database-Schema-Doctor` (Fix: Path Singleton).
- **Bot-Python-Medic**: Diagnóstico de Telegram OK (`bot.py`).

## 🚀 Hitos de la Versión v42.1-Audit
- **Hito: Cobranza "To-Do"**: Filtado reactivo que oculta solventes en Mapa de Deuda para enfocarse en cuentas por cobrar diarias.
- **Hito: Flota Anti-Crashes**: Detección dinámica de `LEFT JOIN` (placa) previniendo lecturas fantasma.
- **Hito: Simulador Sincronizado**: Fetch dinámico reactivo en la PWA previene asimetrías cuando el dueño asigna unidades web.
- **Hito: Soporte Móvil Wi-Fi**: Vite `--host` permite testing cruzado local.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (OMNI-GUARD Certified).
- **Frontend App**: `client/src/App.jsx` (Ruta `?view=X`).

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en un estado de **Alta Disponibilidad Operativa (v42.1-Audit)**. La priorización es Finanzas (Dashboard). Recuerda: ¡Build_system es la única forma de compilar!

