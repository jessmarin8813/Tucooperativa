---
name: dev-efficiency
description: Herramientas para ahorro de tokens y aceleración del desarrollo premium.
---

# Skill: Dev Efficiency

Esta habilidad optimiza la interacción entre el Humano y Antigravity, reduciendo el consumo de tokens y acelerando la creación de interfaces consistentes.

## Herramientas Incluidas:

### 1. Context Minifier (`scripts/minify_context.py`)
- **Propósito**: Generar un resumen estructural de un archivo de código.
- **Acción**: Identifica `imports`, `props`, `state` principal y `exports`.
- **Beneficio**: Permite a Antigravity entender un archivo de 1000 líneas leyendo solo 20. Esto ahorra hasta un 90% de tokens de entrada.

### 2. Premium Templates (`templates/`)
- **Propósito**: Snippets pre-validados con el diseño "Premium" (Glassmorphism + Dark Mode).
- **Contenido**: 
    - `PremiumCard.jsx`: Estructura base con bordes blur y gradientes.
    - `PremiumInput.jsx`: Estilo robusto con focus ring y validación visual.
- **Beneficio**: Evita re-inventar el diseño en cada componente.

## Cómo usar el Minificador:
`python .agent/skills/dev-efficiency/scripts/minify_context.py <ruta_del_archivo>`
