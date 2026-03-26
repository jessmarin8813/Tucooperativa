---
name: CI-CD-Pipeline-Builder
description: Auto-generador de flujos de Continuous Integration para GitHub Actions (Compilación y Pruebas en la Nube).
---

# Skill: CI/CD Pipeline Builder ☁️

Cuando escalas comercialmente, no puedes permitir que un desarrollador suba código roto a Producción. Esta herramienta configura un Pipeline (Tubería) en GitHub. Cada vez que hagas `git push`, un servidor gratuito de Microsoft descargará tu código, correrá los linters, auditará la UI, compilará Vite y, **SOLO SI TODO PASA**, lo aprobará.

## Casos de Uso
1. **Blindaje de Producción**: Imagina que alguien daña el `App.jsx` e intenta subirlo. El Pipeline detectará el fallo en la nube y bloqueará el despliegue a tu servidor, salvando "SaludApp" de una caída nacional.

## Scripts Internos
- `scripts/generate_pipeline.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/ci-cd-pipeline-builder/scripts/generate_pipeline.py`
Se creará un archivo `.github/workflows/main.yml`. La próxima vez que uses Git, la magia ocurrirá sola en la pestaña "Actions" de tu repositorio.
