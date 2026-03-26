---
name: React-Scaffolder-Premium
description: Generador automático de módulos (Vistas, Componentes, Constantes) con estilo Glassmorphism y DarkMode.
---

# Skill: React Scaffolder Premium 🏗️

Esta habilidad le permite a Antigravity construir pantallas completas desde cero en segundos. Usando plantillas base, el sistema crea la Vista Principal, los Componentes Hijos (Tablas o Tarjetas) y el archivo de Constantes, siguiendo estrictamente todas las normas del proyecto (`STABILITY.md`).

## Casos de Uso
1. **Nuevo Módulo "Facturas"**: En lugar de copiar y pegar el código de "Reportes", el Scaffolder genera una estructura limpia, con importaciones correctas y lista para enchufar en el backend.

## Scripts Internos
- `scripts/generate_module.py`: El script de línea de comandos.

## Cómo Usarlo
`python .agent/skills/react-scaffolder-premium/scripts/generate_module.py <NombreModulo>`
Ejemplo: `python generate_module.py Facturas`

Esto generará automáticamente:
1. `src/views/Facturas.jsx`
2. `src/components/facturas/FacturasTable.jsx`
3. `src/components/facturas/FacturasConstants.js`
