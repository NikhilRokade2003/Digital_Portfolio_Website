# Digital Portfolio - README

## 🚀 Quick Start Guide

### For First-Time Setup on New Device:
1. **Run Automated Setup:**
   ```powershell
   .\setup.ps1
   ```
   Or right-click `setup.ps1` → "Run with PowerShell"

2. **Start Application:**
   - Double-click `quick-start.bat`
   - Or run: `.\quick-start.bat`

### Manual Setup:
See detailed instructions in `DEPLOYMENT_GUIDE.md`

---

## 📁 Project Structure

```
DigitalPortfolioBackend+Admin/
├── 📄 quick-start.bat           # One-click application startup
├── 📄 setup.ps1                 # Automated setup script  
├── 📄 DEPLOYMENT_GUIDE.md       # Complete deployment instructions
├── 📄 Program.cs                # Backend entry point
├── 📁 Controllers/              # API endpoints
├── 📁 Frontend/                 # React application
├── 📁 Models/                   # Database entities
├── 📁 Services/                 # Business logic
└── ... (other backend files)
```

---

## 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: https://localhost:7000
- **API Documentation**: https://localhost:7000/swagger

---

## 🔧 Development Commands

### Backend (.NET):
```powershell
dotnet restore          # Restore packages
dotnet build           # Build project
dotnet run             # Run backend
dotnet ef database update  # Update database
```

### Frontend (React):
```powershell
cd Frontend
npm install            # Install dependencies  
npm run dev           # Run development server
npm run build         # Build for production
```

---

## 📋 Prerequisites

- ✅ .NET 9.0 SDK
- ✅ Node.js (v18+) 
- ✅ SQL Server/Express
- ✅ Git (optional)

Download links in `DEPLOYMENT_GUIDE.md`

---

## ❗ Troubleshooting

**Common Issues:**
- **Database errors**: Check connection string in `appsettings.json`
- **npm install fails**: Run `npm cache clean --force`
- **Port conflicts**: Change ports in config files
- **CORS errors**: Verify frontend/backend URLs match

See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

---

## 📞 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review console outputs for error messages
3. Verify all prerequisites are installed
4. Ensure no antivirus/firewall blocking

---

**🎯 Ready to Start?** Run `quick-start.bat` and open http://localhost:5173