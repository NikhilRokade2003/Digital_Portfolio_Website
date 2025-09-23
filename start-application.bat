@echo off
echo Starting Digital Portfolio (Full Stack)...
cd /d "%~dp0"

echo Starting Backend...
start "Backend" cmd /c "dotnet run"

timeout /t 5 /nobreak > nul

echo Starting Frontend...
cd Frontend
start "Frontend" cmd /c "npm run dev"

echo.
echo Digital Portfolio is starting...
echo Backend: https://localhost:7000 (or http://localhost:5000)
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
