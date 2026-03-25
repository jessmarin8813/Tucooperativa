# TuCooperativa - Arquitectura Técnica 🏗️

## 🤝 Relación de Roles
1. **Dueño (Owner)**: Acceso total al Dashboard, Configuración y Hub Forense. Recibe notificaciones de fallas y tiene poder de EXONERAR deudas.
2. **Chofer (Driver)**: Uso exclusivo mediante Bot de Telegram. Registra jornadas, odómetros, combustible y reporta pagos.

## 🔄 Flujo de Datos Crítico
- **Jornada**: Inicia (Dashboard/Bot) -> Finaliza (Bot) -> Reporta Pago -> Actualiza Deuda en BD.
- **Falla**: Chofer Reporta -> Unidad = `inactiva` -> Notifica Dueño -> Dueño Exonera/Repara -> Unidad = `activa`.

## 📡 Capa de Comunicación
- **Frontend**: API Fetch (REST) + JWT Auth.
- **Bot**: `python-telegram-bot` (v20+) -> `api_client.py` -> Backend PHP.
- **Sincronización de IP**: `ip_sync.py` mantiene el `.env` actualizado con la IP local para pruebas en red.

## 🛡️ Capa de Estabilidad
- **OMNI-GUARD**: Auditoría forense preventiva antes de cada build.
- **Bot-Medic**: Escáner de salud estructural para el bot de Python.
- **System-Integrity**: Auditoría de base de datos y rutas críticas.
