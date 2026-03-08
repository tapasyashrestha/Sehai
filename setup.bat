@echo off
title SEHAI - First Time Setup
color 0B
echo.
echo  ============================================
echo       SEHAI - Smart Electronic Health AI
echo          First Time Setup Script
echo  ============================================
echo.

:: -----------------------------------------------
:: 1. Check Prerequisites
:: -----------------------------------------------
echo [1/6] Checking prerequisites...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org/
    echo  Recommended: Node.js v18 or higher
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  [OK] Node.js found: %NODE_VER%

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: npm is not installed!
    echo  It should come with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo  [OK] npm found: v%NPM_VER%

where python >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Python is not installed!
    echo  Please install Python from https://www.python.org/
    echo  Recommended: Python 3.10 or higher
    echo  IMPORTANT: Check "Add Python to PATH" during installation!
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PY_VER=%%i
echo  [OK] %PY_VER% found
echo.

:: -----------------------------------------------
:: 2. Install Frontend Dependencies
:: -----------------------------------------------
echo [2/6] Installing frontend dependencies...
echo.
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Failed to install frontend dependencies!
    echo  Please check the error above and try again.
    pause
    exit /b 1
)
echo.
echo  [OK] Frontend dependencies installed
echo.

:: -----------------------------------------------
:: 3. Create Python Virtual Environment
:: -----------------------------------------------
echo [3/6] Setting up Python virtual environment...
echo.
cd /d "%~dp0backend"
if not exist "venv" (
    python -m venv venv
    if %errorlevel% neq 0 (
        color 0C
        echo  ERROR: Failed to create Python virtual environment!
        pause
        exit /b 1
    )
    echo  [OK] Virtual environment created
) else (
    echo  [OK] Virtual environment already exists
)
echo.

:: -----------------------------------------------
:: 4. Install Backend Dependencies
:: -----------------------------------------------
echo [4/6] Installing backend dependencies...
echo.
call "%~dp0backend\venv\Scripts\activate.bat"
pip install -r "%~dp0backend\requirements.txt"
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Failed to install backend dependencies!
    echo  Please check the error above and try again.
    pause
    exit /b 1
)
echo.
echo  [OK] Backend dependencies installed
echo.

:: -----------------------------------------------
:: 5. Check Environment File
:: -----------------------------------------------
echo [5/6] Checking environment configuration...
echo.
cd /d "%~dp0frontend"
if not exist ".env" (
    echo  Creating .env file from template...
    (
        echo VITE_SUPABASE_URL=https://vjsfwhvnnpxwuflcttuy.supabase.co
        echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqc2Z3aHZubnB4d3VmbGN0dHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NDAzODMsImV4cCI6MjA4ODUxNjM4M30.KY5o6MozAUHwaVBNW5JFaABc4qOQkqj9dhIMA_QH60A
        echo VITE_HF_API_URL=http://localhost:7860
    ) > .env
    echo  [OK] .env file created
) else (
    echo  [OK] .env file already exists
)
echo.

:: -----------------------------------------------
:: 6. Done!
:: -----------------------------------------------
echo [6/6] Setup complete!
echo.
color 0A
echo  ============================================
echo       SEHAI Setup Complete!
echo  ============================================
echo.
echo  To start the application, run:
echo.
echo      start.bat
echo.
echo  This will launch both the backend API
echo  and the frontend dev server.
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:7860
echo  ============================================
echo.
pause
