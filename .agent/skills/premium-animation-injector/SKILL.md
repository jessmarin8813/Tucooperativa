---
name: Premium-Animation-Injector
description: Script que escanea componentes de React y los envuelve en etiquetas de framer-motion para brindar transiciones cinematográficas.
---

# Skill: Premium Animation Injector [ANIMATION]

El secreto de las startups como Vercel o Stripe es la micro-interacción. Esta herramienta analiza tus Vistas (`src/views`) y transforma divs planos en `motion.div`, orquestando entradas elegantes (Fade In / Slide Up) en milisegundos.

## Casos de Uso
1. **Pivote Gráfico**: Tienes 40 componentes estáticos y quieres animarlos todos sin tener que entrar a editar archivo por archivo.

## Scripts Internos
- `scripts/inject_framer.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/premium-animation-injector/scripts/inject_framer.py path/al/componente.jsx`

*(Nota: Requiere que `framer-motion` esté instalado en tu proyecto `npm install framer-motion`)*.
