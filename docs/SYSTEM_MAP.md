# System Map: Hub de Gestión Financiera TuCooperativa

Este manual detalla las funcionalidades de cada módulo para administradores y choferes.

---

## 1. Módulos de Administración (Panel Web)
Ubicación: `/client/src/components` (Frontend) y `/api/admin` (Backend)

### 📊 Dashboard Central (`Dashboard.jsx`)
- **Resumen Ejecutivo**: Muestra el total de unidades activas, ingresos brutos del mes y alertas de mantenimiento pendientes.
- **Flota en Tiempo Real**: Lista de vehículos con su estado (En Ruta / Disponible) y último odómetro.
- **Alertas Rápidas**: Notificaciones de **"Brechas"** (saltos de km no reportados) detectadas por el sistema forense.

### 👑 Panel Maestro (`SuperAdminDashboard.jsx`)
- **Modo Dios**: Gestión multi-tenant. Permite crear nuevas cooperativas, ver la recaudación global de la red y supervisar fraudes a gran escala.

### 💰 Centro de Cobranza (`CobranzaView.jsx`)
- **Gestión de Deuda**: Tabla maestra que muestra cuánto debe cada chofer según los días operados y su cuota diaria ($10).
- **Validación de Pagos**: Módulo para aprobar o rechazar abonos reportados por Telegram (Efectivo y Pago Móvil).

### 📈 Inteligencia de Negocios (`BIView.jsx`)
- **Análisis de Rentabilidad**: Calcula la **Utilidad Neta** restando gastos de mantenimiento a los ingresos de cuotas.
- **Eficiencia de Flota**: Gráficos de Ingresos Proyectados vs. Reales.

### 🔧 Centro de Mantenimiento (`MaintenanceCenter.jsx`)
- **Seguimiento Granular**: Control de servicios por ítem (Aceite, Filtros, Cauchos, Frenos).
- **Telemetría de Salud**: Estado de vida útil de consumibles basado en kilometraje real.

### 🛡️ Hub Forense y Auditoría (`ForensicView.jsx`)
- **Log Forense Maestro**: Vista detallada de todas las anomalías filtradas por nivel de riesgo.
- **Detección de Brechas**: Identificación de saltos de odómetro entre rutas ("Dead Mileage").
- **Anomalías de Consumo**: Alertas de bajo rendimiento de combustible (Dipping detection).

---

## 2. Módulos del Chofer (Telegram Bot)
Ubicación: `/bot`

### 🚛 Gestión de Jornada (Zero-Command)
- **Botón INICIAR**: El chofer selecciona su unidad e ingresa el odómetro. El sistema valida automáticamente si hay kilómetros "fantasma".
- **Botón FINALIZAR**: Cierre de ruta con reporte de combustible.

### 💸 Reporte de Pagos
- **Flujo Mixto**: Permite reportar abonos en Bolívares (Efectivo/Pago Móvil). Muestra automáticamente los datos bancarios del dueño.

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
