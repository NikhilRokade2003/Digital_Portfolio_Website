# Digital Portfolio Backend

A comprehensive backend API for managing digital portfolios, featuring user authentication, portfolio management, project showcases, education history, work experience, skills, and social media links.

##  Project Overview

The Digital Portfolio Backend provides a robust API for users to create and manage digital portfolios. It allows professionals to showcase their skills, projects, education, and work experience in a structured and visually appealing manner.

### Key Features

- **User Authentication** — Secure registration and login system
- **Portfolio Management** — Create, view, update, and delete portfolios
- **Project Showcases** — Add and manage projects with descriptions and images
- **Education History** — Track and display educational qualifications
- **Work Experience** — Document professional experience
- **Skills Management** — List and categorize technical and professional skills
- **Social Media Integration** — Link professional social media profiles
- **Image Uploads** — Support for profile and project images
- **PDF Generation** — Export portfolios as PDF documents
- **Visibility Controls** — Set visibility options for different portfolio sections

##  Tech Stack

- **ASP.NET Core 9.0** — Modern web API framework
- **Entity Framework Core** — ORM for database operations
- **MySQL Database** — Data storage (via Pomelo.EntityFrameworkCore.MySql)
- **BCrypt** — Secure password hashing
- **Cookie-based Authentication** — Session management with secure HTTP cookies
- **React + Vite** — Frontend framework (in the Frontend directory)
- **Tailwind CSS** — Utility-first CSS framework for the frontend

##  Project Structure

```
DigitalPortfolioBackend/
├── Controllers/           # API Controllers
├── Data/                  # Database context
├── DTOs/                  # Data Transfer Objects
├── Frontend/              # React frontend application
├── Middleware/            # Custom middleware components
├── Migrations/            # Database migrations
├── Models/                # Database entity models
├── Services/              # Business logic services
└── wwwroot/               # Static files and uploads
```

##  Installation & Setup

### Prerequisites

- .NET 9.0 SDK
- MySQL Server
- Node.js and npm (for frontend)

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/DigitalPortfolioBackend.git
   cd DigitalPortfolioBackend
   ```

2. Update the connection string in `appsettings.json` with your MySQL server details:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "server=localhost;port=3306;database=digitalportfolio;user=youruser;password=yourpassword"
   }
   ```

3. Configure session settings in `appsettings.json`:
   ```json
   "Session": {
     "Cookie": {
       "Name": "DigitalPortfolio.Session",
       "HttpOnly": true,
       "SecurePolicy": "Always",
       "SameSite": "Strict"
     },
     "IdleTimeout": "1:00:00"
   }
   ```

4. Apply the database migrations:
   ```
   dotnet ef database update
   ```

5. Run the backend:
   ```
   dotnet run
   ```

### Frontend Setup

1. Navigate to the Frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the API base URL in `services/api.js` if needed

4. Start the development server:
   ```
   npm run dev
   ```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check if user is authenticated

### Portfolios
- `GET /api/portfolios` - Get all portfolios for current user
- `GET /api/portfolios/{id}` - Get portfolio by ID
- `POST /api/portfolios` - Create a new portfolio
- `PUT /api/portfolios/{id}` - Update a portfolio
- `DELETE /api/portfolios/{id}` - Delete a portfolio

### Projects
- `GET /api/projects/portfolio/{portfolioId}` - Get all projects for a portfolio
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project

### Education
- `GET /api/education/portfolio/{portfolioId}` - Get all education entries for a portfolio
- `POST /api/education` - Add education entry
- `PUT /api/education/{id}` - Update education entry
- `DELETE /api/education/{id}` - Delete education entry

### Experience
- `GET /api/experience/portfolio/{portfolioId}` - Get all experience entries for a portfolio
- `POST /api/experience` - Add experience entry
- `PUT /api/experience/{id}` - Update experience entry
- `DELETE /api/experience/{id}` - Delete experience entry

### Skills
- `GET /api/skills/portfolio/{portfolioId}` - Get all skills for a portfolio
- `POST /api/skills` - Add skill
- `PUT /api/skills/{id}` - Update skill
- `DELETE /api/skills/{id}` - Delete skill

### Image Upload
- `POST /api/upload/profile` - Upload profile image
- `POST /api/upload/project` - Upload project image

## ✅ Future Enhancements

- Add support for multiple themes
- Implement real-time collaboration features
- Add analytics to track portfolio views
- Develop mobile application integration
- Implement AI-based content suggestions