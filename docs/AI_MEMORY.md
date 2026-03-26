# 🧠 TuCooperativa - AI MEMORY (LEER PRIMERO)

Este archivo es la "Memoria de Trabajo" para el asistente de IA. Define reglas críticas, deudas técnicas y el estado exacto de la lógica de negocio.

## 📌 Contexto de la Misión
Estamos construyendo una plataforma SaaS para cooperativas de transporte. El foco actual es la **Estabilización de Operaciones** (v7.5.0+).

## 🏗️ Reglas Arquitectónicas Innegociables
1. **Frontend Premium**: Siempre usar Glassmorphism, DarkMode y Framer Motion. Consultar la skill `standard-ui-guard`.
2. **Backend Blindado**: No hay endpoints "abiertos". Todos usan `checkAuth()` y validación estricta de roles.
3. **Bot Anti-Crash**: El bot de Python DEBE tener manejadores de error globales y guardias de `NoneType` en cada formateo de API.
4. **Build System**: El único comando válido para desplegar/verificar es `python build_system.py`. Los archivos `.bat` están deprecados por inestabilidad de encoding.

## ⚠️ Deuda Técnica y "Pendientes"
- **Sincronización de IP**: El archivo `ip_sync.py` es vital para pruebas locales, pero debe desactivarse o cambiar a dominio real en producción.
- **Validación de Combustible**: Actualmente acepta cualquier número; falta una auditoría de "Consumo Excesivo" basada en KM.
- **Alertas de Dueño**: Las notificaciones de falla vía Telegram son 1:1; a futuro se necesitará un sistema de "broadcast" para múltiples admins.

## 🚀 Estado de la Sesión Actual
- **Último Hito**: Implementación de la Auditoría del Bot integrada en el Build.
- **Punto de Pausa**: Sistema verificado y estable en v7.6.0-Stable. Listo para pruebas de usuario. (2026-03-26 08:01:58)
- **Hacia donde vamos**: Optimización del reporte de deudas y Dashboard de analítica.

---
> [!IMPORTANT]
> **INSTRUCCIÓN PARA EL ASISTENTE**:
> Al iniciar, lee este archivo y la skill `Stability-Protocol`. No preguntes al usuario sobre el historial si está documentado aquí. Actualiza la sección "Punto de Pausa" al final de cada tarea importante.
