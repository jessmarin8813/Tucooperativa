@echo off
echo ========================================
echo   TUCOOPERATIVA - SMART BUILD PIPELINE
echo ========================================

echo [1/4] Preparando entorno de construccion...
taskkill /F /IM php.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul

echo [2/4] Instalando dependencias (si es necesario)...
cd client && call npm install && cd ..

echo [3/4] Ejecutando OMNI-GUARD v5.0 (Auditoria + Build + Git)...
python omni_guard.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El Build o la Auditoria han fallado.
    exit /b %errorlevel%
)

echo [4/4] Auditoría del Bot (Bot-Python-Medic)...
python .agent/skills/bot-python-medic/scripts/diagnose_bot.py

if %errorlevel% neq 0 (
    echo [CRITICAL ERROR] El bot ha fallado la auditoria estructural.
    exit /b 1
)

echo.
echo [SUCCESS] Proceso completado. Sistema estable y actualizado en Git.

echo [FINAL AUDIT] Ejecutando Guardia de Integridad del Sistema...
C:\xampp\php\php.exe .agent/skills/system-integrity-guard/scripts/integrity_audit.php

if %ERRORLEVEL% NEQ 0 (
    echo [CRITICAL ERROR] El sistema ha fallado la auditoria de integridad.
    exit /b 1
)
echo [PASS] Auditoria exitosa. El sistema es seguro.
