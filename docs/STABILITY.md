# Estándar de Desarrollo: TuCooperativa "AI-Proof"

Este documento define el estilo arquitectónico obligatorio para este proyecto, diseñado para maximizar la estabilidad, la mantenibilidad y la precisión del asistente de IA.

## 1. Frontend (React / Vite)
- **Modularidad Total**: Prohibido el uso de "God Components". `App.jsx` solo debe manejar el enrutamiento y el estado global inicial.
- **Componentes de Vista**: Cada pantalla principal debe residir en `client/src/components/` (ej: `LoginView.jsx`, `Dashboard.jsx`).
- **Hook useApi**: Todas las peticiones al backend deben pasar por el hook centralizado `useApi.js`. No usar `fetch()` directo en los componentes de vista.
- **Micro-Animaciones**: Utilizar `framer-motion` para transiciones suaves (fade-in, slide) en cambios de estado o navegación.
- **Glassmorphism**: Mantener fondos translúcidos, bordes neon sutiles y tipografía moderna (`Inter` u `Outfit`).

## 2. Backend (PHP)
- **Middleware Obligatorio**: Todo archivo API debe incluir `includes/middleware.php`.
- **Respuestas JSON**: Prohibido imprimir HTML. Usar siempre `sendResponse($data, $code)`.
- **Escudo de Errores**: El middleware debe capturar excepciones y errores fatales para devolver un JSON de error 500 estructurado.
- **Aislamiento Multi-tenant**: Todas las consultas SQL deben incluir `cooperativa_id` en el `WHERE` para garantizar la privacidad entre cooperativas.

## 3. Calidad y Verificación
- **El Oráculo (build.bat)**: Ante cualquier cambio crítico, es obligatorio ejecutar `build.bat` en la raíz. El proyecto no se considera listo si el resultado no es 100% verde (PHP Syntax, React Build/Lint, Python Flake8).

## 4. Estilo de IA
- **No Hallucinations**: Si una ruta o tabla no existe, preguntar antes de implementarla.
- **Incrementalidad**: No reescribir archivos completos a menos que sea necesario para el refactor modular. Usar `replace_file_content` o `multi_replace_file_content` para ediciones quirúrgicas.
