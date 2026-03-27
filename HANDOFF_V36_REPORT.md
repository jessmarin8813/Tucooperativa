# Informe de Traspaso Arquitectónico: TuCooperativa v35.1-FINAL

Este documento resume el estado actual del sistema para que el siguiente Agente de IA pueda continuar el desarrollo sin pérdida de contexto ni regresiones.

## 1. Contexto del Proyecto
**TuCooperativa** es una plataforma SaaS de gestión de flotas con una arquitectura híbrida (React + PHP + MySQL). Se ha priorizado una interfaz de usuario "Premium" con Glassmorphism y una estabilidad industrial (Zero-Crash).

## 2. Logros del Ciclo Actual (v35.1)
- **UI Unificada**: Decoplamiento quirúrgico de vistas PC y Móvil. Se ha logrado simetría total y funcionalidad de filtros táctiles.
- **Flujo de Invitación Real**: Sistema de tokens de seguridad de 32 caracteres generados dinámicamente en DB.
- **Simulador de Chofer Blindado**: Soporta IDs numéricos de Telegram, extracción automática de tokens desde URLs y manejo de errores verboso.
- **Estabilidad Core**: Refactorización de Modales (`Modal.jsx`) para eliminar errores de reconciliación de React (`removeChild`) y guards defensivos para evitar errores de `.length`.

## 3. Arquitectura Técnica
- **Frontend**: Vite + React. Ubicación: `/client`.
- **Backend API**: PHP 8.x. Ubicación: `/api`.
- **Base de Datos**: MySQL (XAMPP). Schema: `/database/schema.sql`.
- **Simulador**: `driver_sim.php` en la raíz para emular el Bot de Telegram.

## 4. Tarea Pendiente CRÍTICA: Separación Chofer/Usuario
**Requisito del Usuario**: No registrar a los choferes en la tabla `usuarios` (reservada para Dueños/Admin con login email/pass).
**Plan Sugerido**:
1.  **Crear tabla `choferes`**: (id, cooperativa_id, nombre, cedula, telegram_id BIGINT, etc.).
2.  **Refactorizar `api/auth/registrar.php`**: Insertar en esta nueva tabla.
3.  **Actualizar referencias**: En `vehiculos.php`, `rutas.php` y `pagos_diarios.php` para apuntar a la nueva tabla.
4.  **Eliminar los "Dummy Emails"**: Introducidos temporalmente en v34.5 en la tabla `usuarios`.

## 5. Herramientas y Skills Disponibles
Usar los scripts en `.agent/skills/`:
- `stability-protocol`: Reglas de oro para no romper la UI.
- `api-detective-php`: Para diagnosticar el backend.
- `database-schema-doctor`: Para validar los cambios en las tablas.
- `standard-ui-guard`: Asegura el cumplimiento de los estándares premium.
- Puedes utilizar todas las que están en esa carpeta si lo necesitas.

## 6. Archivos Clave para la próxima sesión
- `client/src/views/VehiculosView.jsx` (Gestión de invitaciones).
- `api/auth/registrar.php` (Lógica de vinculación).
- `driver_sim.php` (Punto de prueba).
- `database/schema.sql` (Punto de partida para el refactor).

---
*Estado: Producción Estable (v35.1). Listo para Refactorización de Tablas.*
