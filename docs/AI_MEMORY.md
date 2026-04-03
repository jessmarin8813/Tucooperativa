# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v61.3-MOBILE-FIRST)
SaaS para gestión de cooperativas de transporte. El sistema opera bajo una arquitectura de **Estabilidad Móvil Premium y Silencio Absoluto**. Optimizado para tablets y teléfonos móviles en redes locales inestables (WiFi).

## 🏗️ Reglas de Oro (Innegociables)
1.  **Mobile Web Dev Premium**: 
    - Breakpoints unificados a **`< 1024px`** para modo móvil.
    - Padding lateral estricto de **22px** (Regla #45).
    - Touch targets mínimos de **58px** en botones principales (Regla #48).
2.  **Silent-First Architecture**: Prohibido el uso de `console.log` en producción. Los errores de red se manejan de forma defensiva sin interrumpir al usuario.
3.  **Hybrid Polling (v3.0)**: Polling de 12s para estabilidad WiFi. NUNCA recargues la página por un error de red; el sistema debe auto-sanarse.
4.  **Official BCV Saneado (v7.0)**: La tasa nominal esperada es **~36.50 Bs/$**. Eliminación total de errores de escala.
5.  **Build Protocol**: NUNCA uses `npm run build` a mano. **SIEMPRE ejecuta `python build_system.py`** (OMNI-GUARD v61.0).
6.  **Z-Index Mastery**: El Sidebar/Drawer tiene aislamiento crítico (`z-index: 1100`) y oculta la barra inferior de navegación al abrirse.

## 🚀 Hitos de la Versión v61.3-Mobile-First
- **Hito: Optimización Móvil Senior**: Interfaz fluida, blindaje lateral y navegación adaptativa profesional.
- **Hito: Silencio de Consola**: Eliminación completa de ruido técnico para el usuario final.
- **Hito: Robustez de Datos**: Encadenamiento opcional y fallbacks en componentes asíncronos.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (Compila, Audita y Sincroniza con Git).
- **Error Rescue**: `MainErrorBoundary` minimalista para recuperación silenciosa.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en **v61.3-Mobile-First**. Mantén el blindaje de 22px de padding y el breakpoint de 1024px. ¡El Build_system es obligatorio para que los cambios se reflejen en Apache/XAMPP!

