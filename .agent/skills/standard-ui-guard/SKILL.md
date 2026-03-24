---
name: standard-ui-guard
description: Audita y asegura el cumplimiento de las reglas de diseño "Premium" (STABILITY.md) en proyectos React/PHP.
---

# Skill: Standard UI Guard

Esta habilidad permite a Antigravity verificar que un proyecto cumple con los estándares de calidad visual y estabilidad definidos en el archivo `STABILITY.md`.

## Reglas que Audita:

### 1. Regla #2: Centralización de Formatos de Dinero
- **Objetivo**: Evitar formateos locales inconsistentes.
- **Acción**: Busca el uso de `toLocaleString` o funciones `formatCurrency` locales en archivos dentro de `src/views` o `src/components`.
- **Corrección**: Reemplazar por importaciones de `DashboardConstants.js` (`formatMoney`).

### 2. Regla #3: Estabilidad de Gráficas (Recharts)
- **Objetivo**: Prevenir errores de dimensiones (-1 width/height) en el navegador.
- **Acción**: Verifica que todo `ResponsiveContainer` esté envuelto en un `div` con una altura fija definida (ej: `h-[300px]`).
- **Corrección**: Envolver el contenedor o añadir una clase de altura explícita al padre inmediato.

## Cómo usar esta Skill:

1. Ejecuta el script de auditoría: `python .agent/skills/standard-ui-guard/scripts/audit_ui.py`.
2. Revisa el reporte de hallazgos.
3. Solicita a Antigravity aplicar las correcciones automáticas.

## Scripts Relacionados:
- `scripts/audit_ui.py`: El motor de escaneo principal.
