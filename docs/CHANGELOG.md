# Changelog - TuCooperativa 📜

Todas las modificaciones críticas se registran aquí para control de versiones y auditoría.

## [v7.0.0] - 2026-03-25
### Added
- Nuevo sistema de construcción: `build_system.py`.
- Skill `Stability-Protocol` para asegurar estándares de codificación.
- Skill `Bot-Python-Medic` para auditoría estructural del bot.
- Carpeta `docs/` con documentación persistente de estado y arquitectura.
- Manejador de errores global en `bot.py` para prevenir crashes de red.

### Fixed
- Error de formateo `NoneType` en el menú del bot (Estado de Cuenta).
- Lógica de `vehiculo_id` hardcoded en el inicio de jornada.
- Problemas de codificación en `build.bat` migrando a sistema Python.

## [v6.8.0] - 2026-03-25
### Added
- Flujo de "Reportar Falla" que bloquea la unidad.
- Notificaciones en tiempo real al dueño vía Telegram con botones interactivos.
- Sistema de exoneración administrativa de deudas.
- Flujo de reactivación de unidades con evidencia fotográfica.

## [v6.0.0] - 2026-03-24
### Added
- Lanzamiento de v6.0 Estable.
- Refactorización de `mi_estado.php` para deudas dinámicas.
- persistencia de rutas mediante .htaccess (QSA Flags).
