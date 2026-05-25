@echo off
echo Starting SEHAI...

:: Start backend in a new window
start "SEHAI Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"

:: Start frontend in a new window
start "SEHAI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Both servers are starting...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
