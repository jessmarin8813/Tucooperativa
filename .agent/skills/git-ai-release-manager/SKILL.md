---
name: Git-AI-Release-Manager
description: Generador de Notas de Versión (Changelog) profesional basado en el historial de commits.
---

# Skill: Git AI Release Manager 📜

Esta habilidad te permite generar reportes hermosos y estructurados de todo lo que has programado desde tu último lanzamiento, ideal para mandárselo a clientes o jefes de proyecto.

## Casos de Uso
1. **Entregas de Proyecto**: Acabaste la Fase 1. En lugar de escribir un PDF a mano explicando qué hiciste, esta skill lee todos tus commits (`"fix: bug de login"`, `"feat: modulo citas"`) y los agrupa en un archivo Markdown.
2. **Documentación Histórica**: Mantiene el archivo `CHANGELOG.md` central actualizado con fechas y versiones.

## Scripts Internos
- `scripts/generate_changelog.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/git-ai-release-manager/scripts/generate_changelog.py`
Revisa el root para ver el nuevo `CHANGELOG_PREVIEW.md`.
