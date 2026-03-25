@echo off
echo ========================================
echo   TUCOOPERATIVA - SMART BUILD PIPELINE
echo ========================================

echo [1/3] Preparando entorno de construccion...
REM El borrado de dist ahora lo gestiona omni_guard.py de forma atomica

echo [2/3] Instalando dependencias (si es necesario)...
cd client && call npm install && cd ..

echo [3/3] Ejecutando OMNI-GUARD v5.0 (Auditoria + Build + Git)...
python omni_guard.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El Build o la Auditoria han fallado.
    echo Por favor, revisa los logs arriba antes de intentar de nuevo.
    pause
    exit /b %errorlevel%
)

echo.
echo [SUCCESS] Proceso completado. Sistema estable y actualizado en Git.
pause
