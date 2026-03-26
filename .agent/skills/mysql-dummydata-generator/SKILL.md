---
name: MySQL-DummyData-Generator
description: Script generador de comandos SQL masivos para prueba de estrés visual.
---

# Skill: MySQL Dummy Data Generator 📊

Esta habilidad crea miles de registros realistas en cuestión de segundos para que puedas probar la paginación, los filtros avanzados y las gráficas del Dashboard bajo condiciones extremas de un entorno de producción.

## Casos de Uso
1. **Prueba de Paginación**: Ver si la tabla de Contratos revienta con 500 registros.
2. **Prueba de Gráficas**: Alimentar el Chart.js con datos variados de varios meses para ver curvas y tendencias.

## Scripts Internos
- `scripts/generate_sql.py`: Crea un archivo `stress_test.sql` con comandos `INSERT IGNORE` usando nombres estructurados.

## Instrucciones de Uso
1. Ve a la terminal.
2. Ejecuta: `python .agent/skills/mysql-dummydata-generator/scripts/generate_sql.py`
3. Se creará `stress_test.sql`. Importa ese archivo en tu phpMyAdmin o en DB Doctor CLI.
