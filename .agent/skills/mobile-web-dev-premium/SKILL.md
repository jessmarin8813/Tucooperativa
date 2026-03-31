---
name: mobile-web-dev-premium
description: Guía y normas de diseño "Air-First" para asegurar interfaces móviles legibles, sin colisiones y con márgenes de seguridad.
---

# Skill: Mobile Web Dev Premium

Esta habilidad permite a Antigravity (y otros agentes) construir y auditar interfaces móviles que cumplan con los estándares de **TuCooperativa**. El objetivo es evitar interfaces "apretadas", recortes de texto y colisiones de botones en pantallas pequeñas.

## Reglas de Blindaje de Interfaz:

### 1. Aire Lateral "Global" (Regla #45)
- **Objetivo**: Evitar que el contenido toque los bordes físicos del dispositivo o los bordes de estado (verde/rojo).
- **Acción**: El contenedor principal (`view-container`) debe tener un padding horizontal mínimo de **`22px`** en móviles.
- **En CSS**: `.view-container { padding: 24px 22px !important; }`

### 2. Diseño Anti-Colisión (Regla #46)
- **Objetivo**: Impedir que los botones de acción se solapen con el texto informativo (ej: "KM").
- **Acción**: En filas con texto a la izquierda y botones a la derecha, **NUNCA** usar `flexbox` sin restricciones. Usar **`CSS Grid`** con dos columnas estrictas: `grid-template-columns: 1fr auto`.
- **En JSX**: `<div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>`

### 3. Tipografía Fluida (Regla #47)
- **Objetivo**: Evitar que números grandes (odómetros, montos en Bs) se salgan de su contenedor.
- **Acción**: Utilizar la variable `isMobile` para reducir el `fontSize` de valores numéricos grandes (ej: de `1.35rem` a `1.1rem`).
- **En JSX**: `<span style={{ fontSize: isMobile ? '1.1rem' : '1.35rem' }}>`

### 4. Touch Targets Elevados (Regla #48)
- **Objetivo**: Facilitar la interacción en contextos de movimiento (choferes) y para usuarios senior.
- **Acción**: Los botones principales deben tener una altura mínima de **`52px`** y un `fontWeight` de **`800-900`**.
- **Acción**: Si el botón tiene mucho texto (ej: "AGREGAR RECORDATORIO"), reducir el `fontSize` a **`0.82rem`** para que quepa en una sola línea de forma elegante.

## Cómo auditar con esta Skill:

1. **Escaneo de Padding**: Busca contenedores con padding menor a `20px` en móviles.
2. **Escaneo de Botones**: Identifica botones con la clase `btn-secondary` en móviles que no tengan un tamaño fijo, ya que el CSS global los obligará a ocupar el 100% de ancho.
3. **Escaneo de Grillas**: Asegura que las filas de datos usen `grid` en lugar de `flex` para evitar colisiones entre texto y botones de acción.
