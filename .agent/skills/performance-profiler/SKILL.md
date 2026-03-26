---
name: Performance-Profiler
description: Analiza el peso de los assets compilados y sugiere mejoras de rendimiento (Lazy Loading, Tree Shaking).
---

# Skill: Performance Profiler 🚀

Garantiza que la aplicación "vuela" en dispositivos de baja gama. 

## Casos de Uso
1. **Lentitud Inicial**: Si el Dashboard tarda 5 segundos en abrir en 4G, este profiler te dice exactamente si importaste toda la librería `chart.js` o `lucide-react` sin hacer code-splitting.

## Scripts Internos
- `scripts/profile.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/performance-profiler/scripts/profile.py`
Revisa el reporte de estado de `dist/assets/`.
