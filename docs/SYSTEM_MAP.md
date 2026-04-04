# System Map: Hub de Gestión Financiera TuCooperativa

Este manual detalla las funcionalidades de cada módulo para administradores y choferes.

---

## 1. Módulos de Administración (Panel Web)
Ubicación: `/client/src/components` (Frontend) y `/api/admin` (Backend)

### 📊 Dashboard Central (`Dashboard.jsx`)
- **Resumen Táctico**: Muestra exclusivamente el total de unidades activas, ingresos brutos y alertas críticas.
- **Centro de Mando**: Sincronización en tiempo real con vinculación directa de Telegram para Dueños.
- **Alertas Rápidas**: Notificaciones de **"Brechas"** (saltos de km no reportados) y salud financiera.

### 👑 Panel Maestro (`SuperAdminDashboard.jsx`)
- **Modo Dios**: Gestión multi-tenant. Permite crear nuevas cooperativas, ver la recaudación global de la red y supervisar fraudes a gran escala.

### 💰 Centro de Cobranza (`CobranzaView.jsx`)
- **Gestión de Deuda**: Tabla maestra que muestra cuánto debe cada chofer según los días operados y su cuota diaria configurada por unidad.
- **Validación de Pagos**: Módulo para aprobar o rechazar abonos reportados por Telegram (Efectivo y Pago Móvil).

### 📈 Inteligencia de Negocios (`BIView.jsx`)
- **Análisis de Rentabilidad**: Calcula la **Utilidad Neta** restando gastos de mantenimiento a los ingresos de cuotas.
- **Eficiencia de Flota**: Gráficos de Ingresos Proyectados vs. Reales.

### 🔧 Centro de Mantenimiento (`MaintenanceCenter.jsx`)
- **Seguimiento Granular**: Control de servicios por ítem (Aceite, Filtros, Cauchos, Frenos).
- **Telemetría de Salud**: Estado de vida útil de consumibles basado en kilometraje real.

### 🛡️ Hub Forense y Auditoría (`ForensicView.jsx`)
- **Log Forense Maestro**: Vista detallada de todas las anomalías filtradas por nivel de riesgo.
- **Sincronización Total (v8.13)**: Los cierres de jornada ahora se vinculan automáticamente a la tabla de pagos para eliminar falsos positivos de "Cierre Sin Conciliar".
- **Detección de Brechas**: Identificación de saltos de odómetro entre rutas ("Dead Mileage").

### ⚙️ Configuración y Branding (`ConfiguracionView.jsx`)
- **Identidad Corporativa**: Gestión de Nombre Corporativo, RIF, Lema y Logo.
- **Sincronización de Marca**: Los cambios aplicados aquí se reflejan instantáneamente en el saludo del Bot de Telegram.
- **Parámetros Globales**: Control de Cuota Diaria ($10) y datos de Pago Móvil para los choferes.

---

## 2. Módulos del Chofer (Telegram Bot)
Ubicación: `/bot`

### 🚛 Gestión de Jornada (Zero-Command)
- **Botón INICIAR**: El chofer selecciona su unidad e ingresa el odómetro.
- **Botón FINALIZAR**: Cierre de ruta con reporte de combustible y **conciliación automática de pago**.

### 💸 Reporte de Pagos
- **Flujo Mixto**: Permite reportar abonos en Bolívares. El sistema vincula el pago a la última ruta finalizada si existe una brecha de conciliación.
- **Branding Dinámico**: El bot saluda con el nombre y slogan oficial de la cooperativa.

---

## 3. Aseguramiento de Calidad (Omni-Guard)
El archivo **`omni_guard.py`** en la raíz realiza auditorías automáticas de:
- **Base de Datos**: Existencia de tablas y conexión.
- **Backend**: Errores de sintaxis PHP y lógica de variables.
- **Bot**: Errores de sintaxis/indentación Python.
- **Frontend**: Compilación total de React/Vite.
- **Sincronización**: Valida que App.jsx y api/login.php usen los mismos campos (Username).

---

## 4. Guía de Estabilidad
Consulta **`docs/STABILITY.md`** para las reglas de desarrollo y mantenimiento de la interfaz premium.
