@echo off
:: Redirect everything to the Python Unified Validator
python omni_guard.py
if %errorlevel% neq 0 (
    exit /b 1
)
