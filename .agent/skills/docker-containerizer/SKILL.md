---
name: Docker-Containerizer
description: Generador instantáneo de configuración Docker y Docker Compose para migrar de XAMPP a Contenedores o la Nube.
---

# Skill: Docker Containerizer 🐳

Esta habilidad genera instantáneamente los archivos `Dockerfile` y `docker-compose.yml` necesarios para ejecutar el stack actual (React SPA + PHP API + MySQL) sin depender de entornos locales pesados como XAMPP.

## Casos de Uso
1. **Despliegue a la Nube**: Preparar tu proyecto para ser subido a AWS ECS, DigitalOcean App Platform o Railway.
2. **Colaboradores Externos**: Cuando contratas a otro programador, en vez de decirle "Descarga XAMPP y configura MySQL", solo le dices: "Corre `docker-compose up`".

## Scripts Internos
- `scripts/generate_docker.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/docker-containerizer/scripts/generate_docker.py`

Esto creará los archivos de Docker en la raíz del proyecto. **No dañan tu XAMPP**, simplemente son archivos extra de configuración.
