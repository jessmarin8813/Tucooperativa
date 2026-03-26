---
name: API-Swagger-Generator
description: Generador interactivo de documentación OpenAPI leyendo el código fuente PHP.
---

# Skill: API Swagger Generator 📖

Esta habilidad escanea tus archivos `.php` y genera un archivo `openapi.json` estándar. Así no tienes que mantener archivos de texto desactualizados sobre cómo funciona tu API.

## Casos de Uso
1. **Compartir la API**: Le entregas el `openapi.json` a un desarrollador móvil para que sepa exactamente qué parámetros enviar a `login.php` o `items.php`.
2. **Postman**: Importas el archivo JSON directo a Postman y tienes tus rutas listas.

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/api-swagger-generator/scripts/generate_swagger.py`
Se creará un `swagger.json` en la raíz de la API, ideal para ser leído por una UI de Swagger.
