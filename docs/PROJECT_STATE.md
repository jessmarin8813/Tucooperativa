# 🛡️ TuCooperativa - PROJECT STATE (v42.0-AUDIT / MONETARY TRANSPARENCY)

## 📊 Resumen Ejecutivo
- **Versión**: 42.0-Audit (Monetary Transparency).
- **Estado**: **ESTABILIDAD FINANCIERA Y MANTENIMIENTO AUDITABLE**.
- **Última Auditoría**: OMNI-GUARD v5.0 (Passed 2026-03-30 07:25).
- **Referencia Monetaria**: Arquitectura de "Referencia en USD" para la deuda, sincronizada con el Simulador (driver_sim.php) y Bot de Telegram vía BCV oficial.
- **Branding**: Consola de Triage Inteligente (Fallas / Vencidos / Al día).

## 🛠️ Componentes Críticos
- **Consola de Mantenimiento (v4.0)**: 
    - Gestión por Excepción: Triage inteligente (Fallas, Vencidos, Al día).
    - Lógica de Resolución: Dependencia exclusiva del campo `resolved_at` (Timestamp), permitiendo soluciones con texto vacío sin re-abrir la falla.
- **Cálculo Multimoneda**: 
    - Integrado en `mi_estado.php` y `cobranza.php` para acreditar abonos en Bs según la tasa histórica del reporte.
- **Catálogo Global (`mantenimiento_catalogo`)**: 
    - Estandarización de servicios compartida por toda la flota.
- **Auditoría Forense de Odómetros**: 
    - Bloqueo de rutas y desbloqueo de taller validados contra odómetro físico (Tolerancia 20km).
- **API Mantenimiento & Workshop**: 
    - Repositorio centralizado en `mantenimiento.php` y `fleet/workshop.php`.

## 📌 Mapa de Ruta Inmediato
1.  **Dashboard Finance**:
    *   Integrar los gastos de taller (expenses) en el flujo de caja global (Reference USD).
2.  **Mobile Maintenance UX**:
    *   Refinar gestos táctiles (swipe) para archivar mantenimientos rápidos.

## ⚠️ Puntos de Atención
- El ID de navegación persistente es **`maintenance`**.
- La lógica de 'resolved_at' es crítica para el flujo de auditoría forense.

---
*Documento sellado tras Integración de Auditoría Monetaria v42.0-Audit (2026-03-30 07:27:00)*

