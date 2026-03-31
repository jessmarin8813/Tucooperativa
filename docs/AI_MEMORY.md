# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v60.0-SELF-HEALING)
SaaS para gestión de cooperativas de transporte. El sistema opera bajo una arquitectura de **Autorecuperación Silenciosa (Self-Healing)** para mitigar fallos de red local y latencia en Windows (v60.0).

## 🏗️ Reglas de Oro (Innegociables)
1.  **Hybrid Polling (v2.0)**: El hook `useRealtime.js` es el corazón de la estabilidad. Si el WebSocket falla, el sistema DEBE pasar a modo polling silencioso. NUNCA recargues la página por un error de red.
2.  **Official BCV Saneado (v7.0)**: La tasa oficial reside en `bcv_helper.php`. Se corrigió el error de escala 10x. La tasa nominal esperada es **~36.50 Bs/$**.
3.  **Null-Safety Guards**: Todos los componentes de lista (FleetList, etc.) deben proteger sus accesos a `.length` y `.toFixed()` con validaciones `Number() / Array.isArray()` para prevenir TypeErrors en desconexiones.
4.  **WinError 121 Mitigation**: En Windows, el bot (`bot.py`) debe capturar el error de "semaphore timeout" y reiniciar el Hub automáticamente.
5.  **Clean Identity**: Los reportes y vistas no muestran IDs numéricos. Se identifica por Nombre y Placa+Modelo.
6.  **Build Protocol**: NUNCA uses `npm run build`. **SIEMPRE ejecuta `python build_system.py`** (OMNI-GUARD v5.0).

## 🚀 Hitos de la Versión v60.0-Self-Healing
- **Hito: Arquitectura Resiliente**: Implementado Polling híbrido en el frontend y reintentos silenciosos en el backend.
- **Hito: Saneamiento Monetario**: Corrección masiva de la tasa BCV y eliminación de multiplicadores erróneos.
- **Hito: Armonía Estética**: Unificación de layouts entre Dashboard e Inicio para una experiencia Premium.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (OMNI-GUARD Certified).
- **Error Rescue**: `MainErrorBoundary` con botón de recuperación manual de alto contraste.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en **v60.0-Self-Healing**. Prioridad: Mantener la estabilidad del WebSocket y la precisión de la tasa BCV saneada. ¡Build_system v5.0 es obligatorio tras cada cambio visual!

