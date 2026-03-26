---
name: E2E-Web-Tester
description: Instalador inteligente de Cypress para realizar Pruebas End-to-End simulando comportamiento humano en el navegador.
---

# Skill: End-to-End Navigation Tester 🤖

La Joya de la Corona del Testing. En lugar de probar a mano haciendo clic en botones, esta Skill inyecta *Cypress* en tu proyecto. Escribes un guion ("Abre la web, escribe 'admin', presiona Enter") y el Bot abrirá Google Chrome solo, a velocidad luz, para comprobar que el Login realmente funcione tras una actualización.

## Casos de Uso
1. **Regresión Automática**: Refactorizaste 10 vistas. ¿Explotó el Login? En vez de abrir la web, corres el probador E2E y el robot te dirá "Pude loguearme correctamente en 1.5 segundos".

## Scripts Internos
- `scripts/setup_cypress.py`

## Instrucciones de Uso
Ejecutar:
`python .agent/skills/e2e-web-tester/scripts/setup_cypress.py`

*(Nota: Te generará la configuración Cypress en React y un test de muestra).*
