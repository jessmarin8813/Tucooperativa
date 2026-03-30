# 🛡️ TuCooperativa - PROJECT STATE (v42.1-AUDIT / MONETARY & FLEET HARDENING)

## 📊 Resumen Ejecutivo
- **Versión**: 42.1-Audit (Monetary Transparency & Fleet Hardening).
- **Estado**: **ESTABILIDAD FINANCIERA Y RENDERIZADO DE FLOTA**.
- **Última Auditoría**: OMNI-GUARD v5.0 (Passed 2026-03-30 18:15).
- **Referencia Monetaria**: Arquitectura de "Referencia en USD" para la deuda, sincronizada con el Simulador (driver_sim.php) y Bot de Telegram vía BCV oficial.
- **Branding**: Consola de Triage Inteligente (Fallas / Vencidos / Al día) y Mapa de Solvencia Dinámico.

## 🛠️ Componentes Críticos
- **Consola de Mantenimiento (v4.0)**: 
    - Gestión por Excepción: Triage inteligente (Fallas, Vencidos, Al día).
    - Lógica de Resolución: Dependencia exclusiva del campo `resolved_at` (Timestamp), permitiendo soluciones con texto vacío sin re-abrir la falla.
- **Módulo de Cobranza (To-Do List Mode)**: 
    - El Mapa de Solvencia oculta por defecto a los choferes solventes (`estado_solvencia !== 'solvente'`) para enfocar la deuda diaria, con toggle reactivo de visibilidad visual.
- **Cálculo Multimoneda**: 
    - Integrado en `mi_estado.php` y `cobranza.php` para acreditar abonos en Bs según la tasa histórica del reporte.
- **Asignación de Flota (React Hardening)**: 
    - Los listados detectan choferes libres evaluando `!c.vehiculo_placa` producto de un `LEFT JOIN` nativo, previniendo crashes por lectura de `undefined` (`c.vehiculo_id` no existe en la payload).
- **Simulador PWA (`driver_sim.php`)**:
    - Sincronización en tiempo real (`await checkCurrentStatus()`) al pulsar "MI UNIDAD" para descargar la placa actual asignada por Admin sin recargar sesión.
- **Entorno LAN (Móvil)**:
    - Vite expuesto permanentemente en `0.0.0.0` mediante flag `--host`.

## 📌 Mapa de Ruta Inmediato
1.  **Dashboard Finance Final**:
    *   Integrar los gastos de taller (expenses) en el flujo de caja global (Reference USD).
2.  **Mobile Maintenance UX**:
    *   Refinar gestos táctiles (swipe) para archivar mantenimientos rápidos.

## ⚠️ Puntos de Atención
- El ID de navegación persistente es **`maintenance`**.
- La lógica de 'resolved_at' es crítica para el flujo de auditoría forense.

---
*Documento sellado tras Integración de Flota y Cobranzas v42.1-Audit (2026-03-30 18:15:00)*

