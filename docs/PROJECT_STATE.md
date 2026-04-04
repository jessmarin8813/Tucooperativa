# 🛡️ TuCooperativa - PROJECT STATE (v8.14-DYNAMIC-QUOTA)

## 📊 Resumen Ejecutivo
- **Versión**: 8.14 (Dynamic Quota Migration).
- **Estado**: **ESTABLE & MULTI-TENANT OPTIMADO**.
- **Última Auditoría**: Dynamic Quota & Documentation Cleanup (Passed 2026-04-04 13:58).
- **Hardening Forense**: Sincronización inmediata entre cierre de ruta y tabla de auditoría de pagos.
- **Dynamic Quota**: Eliminación de la "Regla de los $10" por estar huérfana. Ahora cada vehículo usa su propio parámetro `cuota_diaria`.

## 🛠️ Componentes Críticos (v8.14)
- **Dynamic Quota System**: 
    - Removido campo global de cuota en `ConfiguracionView.jsx` y `api/admin/save_config.php`.
    - Todas las métricas de `Cobranza` y `Rentabilidad` consumen el valor directo del vehículo.
- **Forensic Synchronization**: 
    - `api/fleet/rutas.php` ahora inserta automáticamente un registro en `pagos_reportados` al finalizar jornada.
- **Corporate Identity**: Soporte dinámico para branding por cooperativa.

## 📌 Mapa de Ruta Inmediato
1.  **Fase 8: Gestión de Gastos y Mantenimiento**:
    *   Módulo para registro de facturas de repuestos y reparaciones mayores.
2.  **Generación de Documentos**:
    *   Implementar motor de PDFs para estados de cuenta descargables.

## ⚠️ Puntos de Atención
- **Quota Mastery**: NO hardcodear montos. Siempre consultar la tabla `vehiculos`.
- **Multi-tenancy**: Filtrado por `cooperativa_id` obligatorio.

---
*Documento actualizado tras Migración a Cuota Dinámica v8.14 (2026-04-04 13:58:00)*
