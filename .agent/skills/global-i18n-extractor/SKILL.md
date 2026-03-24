---
name: Global-i18n-Extractor
description: Escaneo y extracción de literales en español de React para internacionalización.
---

# Skill: Global i18n Extractor 🌐

Esta habilidad lee recursivamente tus componentes de React (`src/views` y `src/components`) en busca de cadenas de texto harcodes (literales en español) y los consolida en un diccionario JSON gigante listo para que lo traduzcas a inglés, francés o estandarices términos.

## Casos de Uso
1. **Pivote SaaS**: Cuando decides que "TuMototaxiBot" ahora se debe ofrecer también en inglés.
2. **Corrección de estilo**: Cuando notas que en 5 vistas dices "Añadir" y en otras "Agregar". Esta Skill te dará el mapa de dónde están esos textos en segundos.

## Script 
- `scripts/extract_i18n.py`

## Instrucciones de Uso
Ejecuta: `python .agent/skills/global-i18n-extractor/scripts/extract_i18n.py`
Revisa el archivo `es.json` generado en la misma carpeta.
