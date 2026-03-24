---
name: PWA-Offline-Simulator
description: Script de auditoría de Service Worker y políticas de caché (Pruebas Offline).
---

# Skill: PWA Offline Simulator 🚀

Esta habilidad se encarga de auditar cómo la aplicación (PWA) de React manejará los escenarios donde tus usuarios (como los inspectores de campo de SaludApp o Contratos) se quedan sin señal de internet.

## Casos de Uso
1. **Validación de Caché**: Asegurarse de que `sw.js` y `manifest.webmanifest` estén bien configurados para caché de red-first o cache-first.
2. **Crash Prevention**: Evitar la infame pantalla del dinosaurio si fallan las peticiones en el campo.

## Script 
- `scripts/simulate_offline.py`

## Instrucciones de Uso
Ejecuta: `python .agent/skills/pwa-offline-simulator/scripts/simulate_offline.py`
El diagnóstico indicará qué archivos estáticos fallarán si se cae la red.
