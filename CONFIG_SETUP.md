# Configuration Setup

## Important: Local Configuration

This project uses multiple configuration files for security:

### Files Overview:
- `appsettings.json` - Template with placeholder values (committed to Git)
- `appsettings.Development.json` - Development environment settings (ignored by Git)
- `appsettings.Local.json` - Your personal settings (ignored by Git)
- `appsettings.Production.json` - Production template (committed to Git)

### Setup Instructions:

1. **For Development**: Copy your actual settings to `appsettings.Local.json`
2. **For Production**: Set environment variables or update `appsettings.Production.json`

### Required Configuration Values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your database connection string"
  },
  "JwtSettings": {
    "SecretKey": "Your JWT secret key (min 32 characters)"
  },
  "Admin": {
    "Pin": "Your admin PIN",
    "Contact": {
      "Name": "Your name",
      "Email": "your-email@example.com",
      "Phone": "Your phone number"
    }
  },
  "Smtp": {
    "Username": "your-email@gmail.com",
    "Password": "your-gmail-app-password",
    "FromEmail": "your-email@gmail.com"
  },
  "OpenAI": {
    "ApiKey": "your-openai-api-key"
  }
}
```

### Security Notes:
- Never commit files containing real passwords or API keys
- Use environment variables in production
- The `appsettings.Local.json` file is already in `.gitignore`