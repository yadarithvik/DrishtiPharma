@echo off
title Drishti-Pharma - Inclusive Assistive Healthcare Vision System
cd /d "%~dp0"
cls
echo ===============================================================================
echo   DRISHTI-PHARMA (दृष्टि फार्मा) - INCLUSIVE ASSISTIVE HEALTHCARE VISION SYSTEM
echo   PySustain-2026 ^| BACSE101 Problem Solving using Python ^| SENSE VIT Vellore
echo   Faculty Mentor: Dr. R. Elakkiya ^| Team: Yada Rithvik, Anirudh Dodia, NeelKorak Jana
echo ===============================================================================
echo.

:: 1. Detect Python executable
set PYTHON_CMD=python
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=py
    ) else (
        echo [ERROR] Python not found in system PATH.
        echo Please ensure Python 3.10+ is installed and available.
        pause
        exit /b 1
    )
)

:: 2. Launch Drishti-Pharma via main.py
echo [*] Starting Drishti-Pharma Application Server on Port 8080...
echo [*] Browser interface will open automatically at: http://localhost:8080/index.html
echo [*] Keep this terminal window open while using the application.
echo [*] Press Ctrl+C in this terminal to shut down the server.
echo ===============================================================================
echo.

%PYTHON_CMD% main.py --port 8080

if errorlevel 1 (
    echo.
    echo [ERROR] Drishti-Pharma server exited unexpectedly.
    pause
)
