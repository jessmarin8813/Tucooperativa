---
name: Accessibility-UX-Auditor
description: Script que escanea tu UI buscando fallas estáticas de accesibilidad (clases legibles, aria-labels, e imágenes responsivas).
---

# Skill: Accessibility & UX Auditor 👁️

Una aplicación Premium se preocupa por todos los usuarios. Esta herramienta detecta si tus botones no tienen textos descriptivos, si hay textos grises sobre fondos grises (baja legibilidad) o imágenes sin la etiqueta `alt`.

## Casos de Uso
1. **Control de Calidad UI**: Antes del despliegue final, corres el auditor y descubres que 5 inputs no cuentan con un `id` y que 2 iconos (`Lucide React`) están sueltos sin etiqueta `aria-label` para lectores de pantalla.

## Scripts Internos
- `scripts/audit_a11y.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/accessibility-ux-auditor/scripts/audit_a11y.py`
