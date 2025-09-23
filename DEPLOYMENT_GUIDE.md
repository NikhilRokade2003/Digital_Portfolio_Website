# Digital Portfolio Project - Deployment Guide

## 📋 Complete Setup Instructions for New Devices

This guide will help you run the Digital Portfolio project on any new device from scratch.

---

## 🔧 Prerequisites

### Required Software
1. **.NET 9.0 SDK** - [Download from Microsoft](https://dotnet.microsoft.com/download/dotnet/9.0)
2. **Node.js (v18+ recommended)** - [Download from nodejs.org](https://nodejs.org/)
3. **SQL Server** or **SQL Server Express** - [Download SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads)
4. **Git** (optional, for cloning) - [Download from git-scm.com](https://git-scm.com/)

### Optional but Recommended
- **Visual Studio Code** - [Download](https://code.visualstudio.com/)
- **SQL Server Management Studio (SSMS)** - [Download](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)

---

## 📁 Step 1: Get the Project Files

### Option A: Copy Project Folder
1. Copy the entire `DigitalPortfolioBackend+Admin` folder to your new device
2. Place it in a convenient location (e.g., `C:\Projects\` or `~/Projects/`)

### Option B: Clone from Repository (if using Git)
```bash
git clone [your-repository-url]
cd DigitalPortfolioBackend+Admin
```

---

## 🗃️ Step 2: Database Setup

### 1. Install SQL Server
- Download and install SQL Server Express (free)
- During installation, note the server instance name (usually `(localdb)\MSSQLLocalDB` or `.\SQLEXPRESS`)

### 2. Update Connection String
Open `appsettings.json` and update the connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=DigitalPortfolioDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

**Common Connection String Examples:**
- Local DB: `Server=(localdb)\\MSSQLLocalDB;Database=DigitalPortfolioDb;Trusted_Connection=true;MultipleActiveResultSets=true`
- SQL Express: `Server=.\\SQLEXPRESS;Database=DigitalPortfolioDb;Trusted_Connection=true;MultipleActiveResultSets=true`
- Remote Server: `Server=YOUR_SERVER;Database=DigitalPortfolioDb;User Id=username;Password=password;`

---

## 🔨 Step 3: Backend Setup (.NET API)

### 1. Navigate to Project Root
```powershell
cd C:\Path\To\DigitalPortfolioBackend+Admin
```

### 2. Restore NuGet Packages
```powershell
dotnet restore
```

### 3. Install EF Core Tools (if not already installed)
```powershell
dotnet tool install --global dotnet-ef
```

### 4. Create and Apply Database Migrations
```powershell
# Create the database and apply migrations
dotnet ef database update

# If migrations don't exist, create them first:
# dotnet ef migrations add InitialCreate
```

### 5. Build the Backend
```powershell
dotnet build
```

### 6. Test Backend (Optional)
```powershell
dotnet run
```
- The API should start on `https://localhost:7000` or `http://localhost:5000`
- You can test it by visiting `https://localhost:7000/swagger` in your browser

---

## ⚛️ Step 4: Frontend Setup (React)

### 1. Navigate to Frontend Directory
```powershell
cd Frontend
```

### 2. Clean Install Dependencies
```powershell
# Clear npm cache (if having issues)
npm cache clean --force

# Remove old installations
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Build Frontend
```powershell
# For production build
npm run build

# For development mode
npm run dev
```

---

## 🚀 Step 5: Running the Complete Application

### Method 1: Development Mode (Recommended for Testing)

**Terminal 1 - Backend:**
```powershell
cd C:\Path\To\DigitalPortfolioBackend+Admin
dotnet run
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Path\To\DigitalPortfolioBackend+Admin\Frontend
npm run dev
```

### Method 2: Production Mode

**Build and Run Backend:**
```powershell
cd C:\Path\To\DigitalPortfolioBackend+Admin
dotnet build --configuration Release
dotnet run --configuration Release
```

**Build Frontend:**
```powershell
cd Frontend
npm run build
```

The frontend build will be served by the backend automatically from the `dist` folder.

---

## 🌐 Step 6: Access the Application

1. **Development Mode:**
   - Frontend: `http://localhost:5173`
   - Backend API: `https://localhost:7000` or `http://localhost:5000`
   - Swagger UI: `https://localhost:7000/swagger`

2. **Production Mode:**
   - Application: `https://localhost:7000` or `http://localhost:5000`
   - API endpoints: `https://localhost:7000/api/...`

---

## 🔧 Step 7: Configuration (If Needed)

### Environment Variables
Create a `.env` file in the Frontend directory if needed:
```env
VITE_API_BASE_URL=https://localhost:7000
VITE_APP_TITLE=Digital Portfolio
```

### Backend Configuration
Update `appsettings.json` for your environment:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your_Connection_String_Here"
  },
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

---

## ❗ Troubleshooting Common Issues

### Issue 1: Database Connection Failed
**Solution:**
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure Windows Authentication is enabled
- Try running: `dotnet ef database update --verbose`

### Issue 2: npm install fails with integrity errors
**Solution:**
```powershell
npm cache clean --force
Remove-Item -Path "node_modules", "package-lock.json" -Recurse -Force
npm install --legacy-peer-deps
```

### Issue 3: CORS errors in browser
**Solution:**
- Check that frontend is accessing the correct backend URL
- Verify CORS policy in backend `Program.cs`

### Issue 4: Port conflicts
**Solution:**
- Check `Properties/launchSettings.json` for backend ports
- Check `vite.config.js` for frontend port settings
- Kill any processes using those ports:
```powershell
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

### Issue 5: Missing migrations
**Solution:**
```powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 📦 Step 8: Creating a Deployment Package

### For Distribution to Other Devices:

1. **Publish Backend:**
```powershell
dotnet publish -c Release -o ./publish
```

2. **Build Frontend:**
```powershell
cd Frontend
npm run build
```

3. **Create Deployment Package:**
```powershell
# Create a deployment folder
mkdir DigitalPortfolio-Deployment
# Copy published backend
Copy-Item -Path "./publish/*" -Destination "./DigitalPortfolio-Deployment/" -Recurse
# Copy frontend build
Copy-Item -Path "./Frontend/dist/*" -Destination "./DigitalPortfolio-Deployment/wwwroot/" -Recurse -Force
```

---

## 🔒 Step 9: Security Considerations

### For Production Deployment:
1. **Change default passwords and keys**
2. **Use HTTPS certificates**
3. **Configure proper CORS policies**
4. **Set up proper database security**
5. **Use environment variables for sensitive data**

---

## ✅ Verification Checklist

- [ ] .NET 9.0 SDK installed
- [ ] Node.js and npm installed  
- [ ] SQL Server running
- [ ] Database created and migrations applied
- [ ] Backend builds and runs successfully
- [ ] Frontend builds and runs successfully
- [ ] Can access application in browser
- [ ] API endpoints responding correctly
- [ ] Database operations working

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check terminal outputs for specific error messages
4. Ensure all ports are available and not blocked by firewall

---

**📝 Note:** This guide assumes Windows environment. For Linux/Mac, use equivalent commands (e.g., `rm -rf` instead of `Remove-Item`).