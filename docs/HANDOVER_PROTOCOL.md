# TuCooperativa - HANDOVER PROTOCOL (READ BEFORE STARTING)

Has recibido el mando de un sistema de alta gama en estado **v17.6-Stable**. He preparado este documento para que no cometas los mismos errores de interpretación que causaron fricción.

## 1. Reglas Técnicas de Oro
- **SKILLS PRIMERO**: Lee y usa las skills en `.agent/skills/`. Son tu defensa contra regresiones.
- **OMNI-GUARD**: Ejecuta `python build_system.py` después de CADA CAMBIO importante. Si el dashboard o el login se rompen, es que borraste líneas de `index.css` accidentalmente.
- **CSS INTEGITY**: No toques las primeras 600 líneas de `index.css` a menos que sea estrictamente necesario. Ahí está el motor de Glassmorphism.

## 2. Visión del Usuario
- El usuario exige **Perfección Matemática** y **Branding Real**. 
- El logo es el texto **TuCooperativa**. NO pongas iconos genéricos.
- El Dashboard es **Táctico**. El usuario odia la redundancia. No metas tablas de gestión donde solo debe haber métricas.

## 3. Estado de la Flota (v6.9)
- PC: Grid 35/20/20/25%. Si se ve "apretado", ajusta los paddings de `.p-fleet-row`, no el grid.
- Móvil: Tarjetas independientes. Nada de tablas.

## 4. Roadmap
- Vas directo a la **Fase 7: Gestión de Datos Corporativos**. El usuario quiere poder editar su nombre, rif y logo desde el sistema.

¡Buena suerte, mantén el nivel Senior!
