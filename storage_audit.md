# Reporte de Eficiencia de Disco 💽

He realizado un escaneo en tus directorios de trabajo para identificar oportunidades de ahorro de espacio.

### 1. Dependencias Redundantes (`node_modules`) 📦
Muchos de tus proyectos web (React/Vite) contienen carpetas `node_modules`. Estas carpetas suelen pesar entre **200MB y 500MB cada una**. 

Si tienes proyectos que no estás tocando activamente, puedes borrar estas carpetas y recuperarlas después con `npm install` cuando las necesites:
- **TuMototaxiBot**: Ahorro estimado ~300MB
- **TuRefrigeracionBot**: Ahorro estimado ~300MB
- **TuSalonBot**: Ahorro estimado ~300MB
- **Contratos-online**: Ahorro estimado ~300MB
- **test**: Ahorro estimado ~200MB
- **TOTAL ESTIMADO**: ~1.4GB

### 2. Archivos Temporales y Logs 📄
XAMPP suele acumular logs en `c:\xampp\apache\logs` y `c:\xampp\mysql\data`.
- **Recomendación**: Limpiar archivos `.log` antiguos puede liberar entre **50MB y 200MB**.

### 3. Activos Multimedia 🎞️
He detectado que en algunos proyectos tienes archivos de imágenes y videos (como los capturados por el bot).
- **Acción**: Puedes mover la carpeta `uploads/` de los bots más antiguos a un disco externo o nube.

### 4. Caché de Herramientas
Ejecutar `npm cache clean --force` en la terminal puede liberar varios cientos de megabytes de paquetes antiguos.

---
**¿Deseas que borre automáticamente las carpetas `node_modules` de los proyectos que no uses para recuperar espacio de inmediato?**
