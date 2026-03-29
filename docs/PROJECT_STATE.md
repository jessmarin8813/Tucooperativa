# 🛡️ TuCooperativa - PROJECT STATE (v36.5.31-TRIAGE / EXCEPTION-HUB)

## 📊 Resumen Ejecutivo
- **Versión**: 36.5.31-Triage (Exception-Based Fleet Management).
- **Estado**: **CONSOLA DE TRIAGE OPERATIVA**.
- **Última Auditoría**: OMNI-GUARD v5.0 (Passed 2026-03-29 11:15).
- **Branding**: Triage Dashboard + Telemetría Neón (Al día / Vencidos / Fallas).

## 🛠️ Componentes Críticos
- **Consola de Triage (v3.0)**: 
    - Gestión por Excepción: Oculta unidades "Al día" por defecto para priorizar urgencias.
    - Filtros Exclusivos: Fallas (Incidencias/Taller) y Vencidos (Preventivos).
    - Terminología: Unidades operativas marcadas como **"Al día"**.
- **Catálogo Global (`mantenimiento_catalogo`)**: 
    - Estandarización de nombres de servicios compartida por toda la flota.
- **Auditoría Forense de Odómetros**: 
    - Bloqueo de rutas y desbloqueo de taller validados contra odómetro físico (Tolerancia 20-25km).
- **API Mantenimiento & Workshop**: 
    - Repositorio centralizado en `mantenimiento.php` y `fleet/workshop.php`.

## 📌 Mapa de Ruta Inmediato
1.  **Dashboard Finance**:
    *   Integrar los gastos de taller (expenses) en el flujo de caja global.
2.  **Mobile Triage UX**:
    *   Añadir gestos táctiles (swipe) para archivar mantenimientos rápidos.

## ⚠️ Puntos de Atención
- El ID de vista para el centro de mantenimiento es **`maintenance`**.
- La carpeta `.gemini/antigravity` tiene un respaldo en Documents por seguridad de sistema.

---
*Documento sellado tras Integración de Triage Inteligente v36.5.31-Triage (2026-03-29 11:28:00)*
