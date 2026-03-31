# 🧠 TuCooperativa - AI MEMORY (PRO SENIOR HANDOVER)

Este archivo es el **Cerebro Central** del proyecto. El siguiente agente DEBE leer esto antes de tocar una sola línea de código.

## 📌 Contexto de la Misión (v50.0-FORENSE)
SaaS para gestión de cooperativas de transporte. El sistema opera bajo una arquitectura de **Auditoría Forense, Inteligencia de Negocio (BI) y Sincronización Oficial del BCV** (v50.0).

## 🏗️ Reglas de Oro (Innegociables)
1.  **Official BCV Sync (v6.7)**: Ya no se usan APIs de terceros (inestables). Toda tasa USD/Bs debe venir vía **Direct Scraping de `bcv.org.ve`**. El helper auto-corrige errores de escala 10x.
2.  **Clean Identity**: Los reportes y vistas (BI, SuperAdmin) NO muestran IDs numéricos. Se identifica por Nombre (Coop) y Placa+Modelo (Vehículo).
3.  **Monetary Transparency**: Toda deuda se maneja con "Referencia en USD". Los abonos se acreditan usando la tasa grabada en el momento (`tasa_cambio`).
4.  **Resolved_at Logic**: La resolución de fallas depende de `resolved_at` (Timestamp). Texto vacío NO re-abre la falla.
5.  **Defensive React**: Los payloads de choferes traen `vehiculo_placa`. No asumas `vehiculo_id` en mapeos.
6.  **Pydantic v2.0**: El bot de Telegram usa `.model_dump()` para broadcast. No uses `.dict()`.
7.  **Build Protocol**: NUNCA uses `npm run build`. **SIEMPRE ejecuta `python build_system.py`** (OMNI-GUARD v5.0).

## 🛠️ Arsenal de Skills Premium (.agent/skills/)
El ecosistema de herramientas automatizadas está perfilado a (v42.1):
- **Backend & Seguridad**: `API-Detective-PHP`, `Security-Guard-PHP` (Audit Forense v2.0).
- **Base de Datos**: `Database-Schema-Doctor` (Fix: Path Singleton).
- **Bot-Python-Medic**: Diagnóstico de Telegram OK (`bot.py`).

## 🚀 Hitos de la Versión v50.0-Forense
- **Hito: Blindaje BCV Oficial**: Implementado scraping directo del Banco Central. Adiós a las caídas de APIs gratuitas.
- **Hito: BI Visual Premium**: Eliminación de IDs en UI. Dashboard enfocado en nombres y marcas comerciales.
- **Hito: Identidad Forense**: Mapeo inteligente en Hub Forense vinculando Placa + Modelo en cada alerta.

## 🛠️ Herramientas de Ejecución
- **Build System**: `python build_system.py` (OMNI-GUARD Certified).
- **Frontend App**: `client/src/App.jsx` (Ruta `?view=X`).

---
> [!IMPORTANT]
> **ORDEN PARA EL SIGUIENTE AGENTE**:
> El sistema está en **v50.0-Forense**. Prioridad: Mantener la pureza de la tasa BCV (scraping) y la identidad libre de IDs numéricos. ¡Build_system v5.0 es obligatorio!

