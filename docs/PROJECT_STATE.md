# 🛡️ TuCooperativa - PROJECT STATE (v60.0-SELF-HEALING / STABILIZATION)

## 📊 Resumen Ejecutivo
- **Versión**: 60.0-Self-Healing (Stabilization & UI Harmony).
- **Estado**: **ARQUITECTURA DE AUTORECUPERACIÓN ACTIVA**.
- **Última Auditoría**: OMNI-GUARD v5.0 (Passed 2026-03-31 13:40).
- **BCV Saneado (v7.0)**: Eliminación del error de escala 10x y el valor obsoleto de 470. Tasa saneada a **~36.50 Bs/$**. Sincronización proactiva 100% veraz.
- **Self-Healing Hub**: El sistema ahora es inmune a desconexiones de red local y errores de Windows (`WinError 121`). Recuperación automática sin recarga de página.
- **Armonía Visual**: Paridad total entre el Dashboard y el Módulo de Flotas (mismo layout, sin capas extra).

## 🛠️ Componentes Críticos
- **Hybrid Polling Hook (v2.0)**: 
    - `useRealtime.js` cambia automáticamente a modo Polling (30s) si el Socket falla. Reconexión con retroceso exponencial.
- **Bot/Hub Resiliente (v3.0)**: 
    - `bot.py` captura `OSError 121` y reinicia el Hub silenciosamente. Tiempos de ping optimizados a 30s para mayor tolerancia.
- **UI de Rescate (v1.0)**: 
    - `MainErrorBoundary` de alto contraste con botón de "REINTENTAR AHORA" para colapsos críticos.
- **Null-Safety Guard**: 
    - Blindaje atómico en `FleetList` para evitar TypeErrors por `undefined.length` o `toFixed()` en valores nulos.

## 📌 Mapa de Ruta Inmediato
1.  **Transition to VPS**:
    *   Migrar el `bot.py` a Linux para eliminar definitivamente la latencia de semáforos de Windows.
2.  **Dashboard Finance Final**:
    *   Integrar los gastos de taller (expenses) en el flujo de caja global (Reference USD).

## ⚠️ Puntos de Atención
- El ID de navegación persistente es **`maintenance`**.
- La tasa BCV debe ser vigilada en el dashboard para asegurar paridad con el módulo de flotas.

---
*Documento sellado tras Blindaje Self-Healing y Saneamiento BCV v60.0 (2026-03-31 13:40:00)*

