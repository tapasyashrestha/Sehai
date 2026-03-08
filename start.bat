@echo off
title SEHAI - Application Launcher
color 0B
echo.
echo  ============================================
echo       SEHAI - Smart Electronic Health AI
echo            Starting Application...
echo  ============================================
echo.

:: -----------------------------------------------
:: Quick checks
:: -----------------------------------------------
if not exist "%~dp0frontend\node_modules" (
    color 0C
    echo  ERROR: Frontend dependencies not installed!
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0backend\venv" (
    color 0C
    echo  ERROR: Backend virtual environment not found!
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\.env" (
    color 0C
    echo  ERROR: Frontend .env file not found!
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

:: -----------------------------------------------
:: Start Backend (in a new window)
:: -----------------------------------------------
echo  Starting Backend API server (port 7860)...
start "SEHAI Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 7860"

:: Give backend a moment to initialize
timeout /t 3 /nobreak >nul

:: -----------------------------------------------
:: Start Frontend (in a new window)
:: -----------------------------------------------
echo  Starting Frontend dev server (port 5173)...
start "SEHAI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: -----------------------------------------------
:: Done
:: -----------------------------------------------
timeout /t 3 /nobreak >nul
echo.
color 0A
echo  ============================================
echo       SEHAI is running!
echo  ============================================
echo.
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:7860
echo  API Docs:  http://localhost:7860/docs
echo.
echo  Two separate windows have been opened:
echo    - "SEHAI Backend"  (Python/FastAPI)
echo    - "SEHAI Frontend" (Vite/React)
echo.
echo  Close those windows to stop the servers.
echo  ============================================
echo.

:: Open the browser automatically
start http://localhost:5173

pause
