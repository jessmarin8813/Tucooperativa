# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v17.6-Stable)
SaaS para gestión de cooperativas de transporte. El sistema está en una fase de **Refinamiento de Alta Gama**.

## 🏗️ Reglas de Oro (Innegociables)
1.  **Identidad de Marca**: El logo es el texto **"TuCooperativa"** con estilo `neon-text brand`. NO lo cambies por iconos genéricos. Es el alma visual del sistema.
2.  **Clinical Grid Architecture**: El módulo de flota para PC usa una rejilla matemática de **35% 20% 20% 25%**. Esta alineación es sagrada para evitar el "hacinamiento".
3.  **Zero-Collision Mobile**: Las tarjetas móviles deben ser independientes (0% tabla). No uses filas de tabla en móvil; usa el sistema de tarjetas `p-fleet-row` definido en `index.css`.
4.  **Tactical Dashboard**: El dashboard es un resumen para métricas. NO debe mostrar listados de gestión completos. Usa el prop `minimal={true}` si necesitas mostrar resúmenes de flota.
5.  **Build Protocol**: NUNCA des por terminada una tarea sin ejecutar `python build_system.py`. Si el build falla, la tarea NO está terminada.

## 🚀 Estado Exacto del Desarrollo (Handover 2026-03-26)
- **Logro v17.5**: Restauración de la arquitectura global de `index.css` (813 líneas). Se recuperó el login y el glassmorphism premium.
- **Logro v17.6**: Limpieza total del Dashboard. Ahora es 100% táctico.
- **Próximo Paso Inmediato**: **Fase 7 - Gestión de Datos Corporativos VIP**. Implementar la vista para que el dueño cambie su RIF, Slogan y Logo dinámicamente.

## 🛠️ Herramientas Pendientes
- **Audit Skill**: Se incorporó `Integrity-Audit` en `.agent/skills/`. Úsala siempre.
- **Omni-Guard**: La guardia de integridad (v5.0) está activa y funcional.

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> Mantén la disciplina arquitectónica. No improvises con el layout. Usa las clases de `index.css` existentes para mantener la coherencia. Si el usuario pide cambios en el Dashboard, recuerda: **TÁCTICO > OPERATIVO**.
