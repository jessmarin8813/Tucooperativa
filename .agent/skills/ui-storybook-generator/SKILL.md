---
name: UI-Storybook-Generator
description: Genera automáticamente una vista de Catálogo (Showroom) que lista y renderiza todos tus componentes UI personalizados.
---

# Skill: UI Storybook Generator 📚

Mantener la consistencia visual ("Premium") es difícil cuando olvidas cómo lucía la tarjeta o el botón que diseñaste hace 3 semanas. Esta herramienta escanea tu carpeta `src/components` y pre-construye una Vista llamada `Showroom.jsx`.

## Casos de Uso
1. **Librería Centralizada**: Tienes un `<PremiumCard>`, un `<SearchableSelect>` y un `<GlassModal>`. El Storybook los apilará todos en una grilla hermosa para que tú (o tus desarrolladores) copien y peguen el código de uso rápidamente.

## Scripts Internos
- `scripts/build_showroom.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/ui-storybook-generator/scripts/build_showroom.py`
Se inyectará un archivo en `src/views/Showroom.jsx`. Solo agrégalo a tu `App.jsx` para visitarlo.
