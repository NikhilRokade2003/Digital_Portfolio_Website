@echo off
echo.
echo ====================================
echo   Digital Portfolio - Quick Start
echo ====================================
echo.

REM Check if running from correct directory
if not exist "DigitalPortfolioBackend.csproj" (
    echo ERROR: Please run this script from the DigitalPortfolioBackend+Admin directory
    echo Expected files: DigitalPortfolioBackend.csproj, Frontend folder
    pause
    exit /b 1
)

echo Starting Digital Portfolio Application...
echo.

echo [1/3] Starting Backend API...
start "Digital Portfolio Backend" cmd /c "echo Starting Backend... && dotnet run && echo Backend stopped. Press any key to close. && pause"

echo [2/3] Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

echo [3/3] Starting Frontend...
cd Frontend
if not exist "package.json" (
    echo ERROR: Frontend directory missing package.json
    echo Please ensure Frontend setup is complete
    pause
    exit /b 1
)

start "Digital Portfolio Frontend" cmd /c "echo Starting Frontend... && npm run dev && echo Frontend stopped. Press any key to close. && pause"

cd ..

echo.
echo ==========================================
echo   Digital Portfolio Started Successfully!
echo ==========================================
echo.
echo Access your application:
echo   Frontend:     http://localhost:5173
echo   Backend API:  https://localhost:7000
echo   Swagger UI:   https://localhost:7000/swagger
echo.
echo Both services are running in separate windows.
echo Close those windows to stop the services.
echo.
echo Press any key to exit this startup script...
pause > nul