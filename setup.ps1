# Digital Portfolio - Quick Setup Script
# This script automates the setup process for new devices

Write-Host "Digital Portfolio - Automated Setup Script" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Warning: Some operations may require administrator privileges" -ForegroundColor Yellow
}

# Step 1: Check Prerequisites
Write-Host "`nStep 1: Checking Prerequisites..." -ForegroundColor Cyan

# Check .NET SDK
try {
    $dotnetVersion = dotnet --version
    Write-Host "[OK] .NET SDK found: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] .NET SDK not found. Please install .NET 9.0 SDK" -ForegroundColor Red
    Write-Host "   Download from: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found. Please install Node.js (includes npm)" -ForegroundColor Red
    exit 1
}

# Step 2: Setup Backend
Write-Host "`nStep 2: Setting up Backend (.NET API)..." -ForegroundColor Cyan

Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to restore NuGet packages" -ForegroundColor Red
    exit 1
}

Write-Host "Installing Entity Framework tools..." -ForegroundColor Yellow
dotnet tool install --global dotnet-ef --skip-existing

Write-Host "Building backend..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build backend" -ForegroundColor Red
    exit 1
}

Write-Host "[SUCCESS] Backend setup completed!" -ForegroundColor Green

# Step 3: Setup Database
Write-Host "`nStep 3: Setting up Database..." -ForegroundColor Cyan

Write-Host "Applying database migrations..." -ForegroundColor Yellow
dotnet ef database update
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Database setup completed!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Database setup had issues. Please check connection string in appsettings.json" -ForegroundColor Yellow
    Write-Host "   Common connection strings:" -ForegroundColor Yellow
    Write-Host "   LocalDB: Server=(localdb)\\MSSQLLocalDB;Database=DigitalPortfolioDb;Trusted_Connection=true" -ForegroundColor Gray
    Write-Host "   SQL Express: Server=.\\SQLEXPRESS;Database=DigitalPortfolioDb;Trusted_Connection=true" -ForegroundColor Gray
}

# Step 4: Setup Frontend
Write-Host "`nStep 4: Setting up Frontend (React)..." -ForegroundColor Cyan

if (Test-Path "Frontend") {
    Set-Location "Frontend"
    
    Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    
    Write-Host "Removing old installations..." -ForegroundColor Yellow
    if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
    if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
    
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    
    Write-Host "Building frontend..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Frontend build had warnings, but may still work" -ForegroundColor Yellow
    } else {
        Write-Host "[SUCCESS] Frontend setup completed!" -ForegroundColor Green
    }
    
    Set-Location ".."
} else {
    Write-Host "[ERROR] Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Step 5: Final Setup
Write-Host "`nStep 5: Final Setup..." -ForegroundColor Cyan

# Create startup scripts
Write-Host "Creating startup scripts..." -ForegroundColor Yellow

# Backend startup script
$backendScript = @"
@echo off
echo Starting Digital Portfolio Backend...
cd /d "%~dp0"
dotnet run
pause
"@
$backendScript | Out-File -FilePath "start-backend.bat" -Encoding ASCII

# Frontend startup script  
$frontendScript = @"
@echo off
echo Starting Digital Portfolio Frontend...
cd /d "%~dp0Frontend"
npm run dev
pause
"@
$frontendScript | Out-File -FilePath "start-frontend.bat" -Encoding ASCII

# Combined startup script
$combinedScript = @"
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
"@
$combinedScript | Out-File -FilePath "start-application.bat" -Encoding ASCII

Write-Host "[SUCCESS] Startup scripts created!" -ForegroundColor Green

# Step 6: Summary
Write-Host "`n[SETUP COMPLETE!]" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Digital Portfolio application is ready to run!" -ForegroundColor White
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "   • start-backend.bat    - Start only the backend API" -ForegroundColor Gray
Write-Host "   • start-frontend.bat   - Start only the frontend" -ForegroundColor Gray  
Write-Host "   • start-application.bat - Start both (recommended)" -ForegroundColor Gray
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "   1. Double-click 'start-application.bat'" -ForegroundColor White
Write-Host "   2. Wait for both services to start" -ForegroundColor White
Write-Host "   3. Open your browser to: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Manual start (alternative):" -ForegroundColor Cyan
Write-Host "   Backend:  dotnet run" -ForegroundColor Gray
Write-Host "   Frontend: cd Frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "For more details, see DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow

Write-Host "`nHappy coding!" -ForegroundColor Magenta