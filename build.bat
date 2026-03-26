@echo off
SETLOCAL EnableDelayedExpansion
cls
echo ============================================================
echo   TUCOOPERATIVA - SISTEMA DE VALIDACIÓN INTEGRAL (BUILD)
echo ============================================================
echo.

set FAIL=0

:: 1. Backend PHP Syntax Check
echo [1/3] Revisando sintaxis PHP...
for /R api %%f in (*.php) do (
    C:\xampp\php\php.exe -l "%%f" >nul 2>&1
    if !errorlevel! neq 0 (
        echo [ERROR] Sintaxis invalida en: %%f
        set FAIL=1
    )
)
if %FAIL% equ 0 (echo - PHP: Todo Correcto.) else (echo - PHP: Fallo Detectado.)
echo.

:: 2. Frontend React Build & Lint
echo [2/3] Validando Frontend (React + Vite)...
cd client
call npm run lint >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Fallo en ESLint. Revisa el codigo client/src.
    set FAIL=1
) else (
    echo - Lint: OK.
)
call npm run build >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Fallo en Compilacion React.
    set FAIL=1
) else (
    echo - Build: OK.
)
cd ..
echo.

:: 3. Telegram Bot (Python/Flake8)
echo [3/3] Revisando Bot de Telegram (Python)...
flake8 ../TuCooperativaBot --count --select=E9,F63,F7,F82 --show-source --statistics >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Fallas criticas de Python detectadas.
    set FAIL=1
) else (
    echo - Python: Todo Correcto.
)
echo.

echo ============================================================
if %FAIL% equ 0 (
    echo    RESULTADO: [EXITO] - El sistema es estable para entrega.
) else (
    echo    RESULTADO: [FALLO] - Corrige los errores antes de continuar.
    exit /b 1
)
echo ============================================================
pause
