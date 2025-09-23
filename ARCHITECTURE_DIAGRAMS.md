# 🏗️ Digital Portfolio - Complete Architecture Diagrams

## 📋 Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Database Entity Relationship Diagram](#database-entity-relationship-diagram)
3. [API Architecture Diagram](#api-architecture-diagram)
4. [Frontend Architecture Diagram](#frontend-architecture-diagram)
5. [AI Assistant Architecture](#ai-assistant-architecture)
6. [Authentication & Security Flow](#authentication--security-flow)
7. [Email System Architecture](#email-system-architecture)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[React 18.2.0 Frontend]
        B --> C[Vanta.js + Three.js]
        B --> D[Tailwind CSS]
        B --> E[React Router DOM]
    end
    
    subgraph "API Gateway"
        F[ASP.NET Core 9.0 API]
        G[Authentication Middleware]
        H[CORS Configuration]
    end
    
    subgraph "Business Logic Layer"
        I[Controllers]
        J[Services]
        K[DTOs]
        L[Middleware]
    end
    
    subgraph "Data Access Layer"
        M[Entity Framework Core 9.0]
        N[DbContext]
        O[Repositories]
    end
    
    subgraph "Database Layer"
        P[(MySQL Database)]
        Q[Users Table]
        R[Portfolios Table]
        S[Projects Table]
        T[Skills/Education/Experience Tables]
    end
    
    subgraph "External Services"
        U[OpenAI GPT-3.5-turbo]
        V[SMTP Gmail Server]
        W[File Storage wwwroot]
    end
    
    subgraph "Security & Auth"
        X[BCrypt Password Hashing]
        Y[Cookie Authentication]
        Z[Role-Based Access Control]
    end
    
    A --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> M
    M --> N
    N --> P
    P --> Q
    P --> R
    P --> S
    P --> T
    
    J --> U
    J --> V
    J --> W
    G --> X
    G --> Y
    G --> Z
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style F fill:#e8f5e8
    style P fill:#fff3e0
    style U fill:#fce4ec
    style V fill:#f1f8e9
```

---

## 🗄️ Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int Id PK
        varchar(100) FullName
        varchar(100) Email
        longtext PasswordHash
        varchar(20) Role
    }
    
    PORTFOLIOS {
        int Id PK
        varchar(100) Title
        longtext Description
        longtext ProfileImage
        varchar Email
        varchar Phone
        varchar City
        varchar Country
        boolean IsPublic
        boolean IsProjectsPublic
        boolean IsEducationPublic
        boolean IsExperiencePublic
        boolean IsSkillsPublic
        boolean IsSocialMediaPublic
        datetime CreatedAt
        datetime UpdatedAt
        int UserId FK
    }
    
    PROJECTS {
        int Id PK
        varchar Title
        longtext Description
        longtext ImageUrl
        longtext ProjectUrl
        longtext GitHubUrl
        datetime CreatedAt
        datetime UpdatedAt
        int PortfolioId FK
    }
    
    EDUCATION {
        int Id PK
        varchar Institution
        varchar Degree
        varchar FieldOfStudy
        date StartDate
        date EndDate
        longtext Description
        datetime CreatedAt
        datetime UpdatedAt
        int PortfolioId FK
    }
    
    EXPERIENCE {
        int Id PK
        varchar Company
        varchar Position
        date StartDate
        date EndDate
        longtext Description
        datetime CreatedAt
        datetime UpdatedAt
        int PortfolioId FK
    }
    
    SKILLS {
        int Id PK
        varchar Name
        varchar Category
        int ProficiencyLevel
        datetime CreatedAt
        datetime UpdatedAt
        int PortfolioId FK
    }
    
    SOCIALMEDIALINKS {
        int Id PK
        varchar Platform
        longtext Url
        varchar IconName
        datetime CreatedAt
        datetime UpdatedAt
        int PortfolioId FK
    }
    
    ACCESSREQUESTS {
        int Id PK
        int RequesterUserId FK
        int PortfolioId FK
        varchar Status
        longtext Message
        datetime CreatedAt
    }
    
    NOTIFICATIONS {
        int Id PK
        int UserId FK
        varchar Title
        longtext Message
        varchar Type
        boolean IsRead
        datetime CreatedAt
    }
    
    PORTFOLIOVIEWLOGS {
        int Id PK
        int PortfolioId FK
        int ViewerUserId FK
        datetime ViewedAt
    }
    
    USERS ||--o{ PORTFOLIOS : "owns"
    PORTFOLIOS ||--o{ PROJECTS : "contains"
    PORTFOLIOS ||--o{ EDUCATION : "has"
    PORTFOLIOS ||--o{ EXPERIENCE : "includes"
    PORTFOLIOS ||--o{ SKILLS : "lists"
    PORTFOLIOS ||--o{ SOCIALMEDIALINKS : "links"
    USERS ||--o{ ACCESSREQUESTS : "requests"
    PORTFOLIOS ||--o{ ACCESSREQUESTS : "targets"
    USERS ||--o{ NOTIFICATIONS : "receives"
    PORTFOLIOS ||--o{ PORTFOLIOVIEWLOGS : "tracks"
    USERS ||--o{ PORTFOLIOVIEWLOGS : "views"
```

---

## 🔌 API Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Requests"
        A[React Components]
        B[Axios HTTP Client]
        C[API Service Layer]
    end
    
    subgraph "API Controllers"
        D[AuthController]
        E[PortfolioController]
        F[ProjectController]
        G[EducationController]
        H[ExperienceController]
        I[SkillController]
        J[ChatbotController]
        K[AdminController]
        L[NotificationController]
        M[AccessRequestController]
        N[ImageUploadController]
    end
    
    subgraph "Middleware Pipeline"
        O[Authentication Middleware]
        P[Authorization Middleware]
        Q[CORS Middleware]
        R[Error Handling Middleware]
    end
    
    subgraph "Services"
        S[OpenAI Service]
        T[Email Service]
        U[PDF Generator Service]
        V[Professional PDF Generator]
    end
    
    subgraph "Data Layer"
        W[AppDbContext]
        X[Entity Framework Core]
        Y[(MySQL Database)]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J
    C --> K
    C --> L
    C --> M
    C --> N
    
    D --> O
    E --> O
    F --> O
    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P
    P --> Q
    Q --> R
    
    J --> S
    D --> T
    E --> U
    E --> V
    
    D --> W
    E --> W
    F --> W
    G --> W
    H --> W
    I --> W
    J --> W
    K --> W
    L --> W
    M --> W
    N --> W
    
    W --> X
    X --> Y
    
    style A fill:#e1f5fe
    style D fill:#e8f5e8
    style S fill:#fce4ec
    style W fill:#fff3e0
```

---

## 🎨 Frontend Architecture Diagram

```mermaid
graph TB
    subgraph "Entry Point"
        A[index.html]
        B[main.jsx]
        C[App.jsx]
    end
    
    subgraph "Routing System"
        D[React Router DOM]
        E[Private Routes]
        F[Public Routes]
    end
    
    subgraph "Pages"
        G[Login.jsx]
        H[Register.jsx]
        I[Dashboard.jsx]
        J[PortfolioManager.jsx]
        K[PortfolioCreate.jsx]
        L[Profile.jsx]
        M[ChatbotInterface.jsx]
        N[AdminDashboard.jsx]
        O[NotificationCenter.jsx]
    end
    
    subgraph "Shared Components"
        Q[Navigation.jsx]
        R[PortfolioCard.jsx]
        S[ProjectCard.jsx]
        T[LoadingSpinner.jsx]
        U[Modal.jsx]
    end
    
    subgraph "Context & State"
        V[AuthContext]
        W[React useState]
        X[React useEffect]
        Y[Local Storage]
    end
    
    subgraph "Styling System"
        Z[Tailwind CSS]
        AA[index.css]
        AB[Custom CSS Classes]
        AC[Responsive Design]
    end
    
    subgraph "3D & Animation"
        AD[Vanta.js]
        AE[Three.js r134]
        AF[CSS Animations]
        AG[Glass Morphism]
    end
    
    subgraph "External Libraries"
        AH[Axios]
        AI[html2pdf.js]
        AJ[React Hooks]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    E --> G
    E --> H
    F --> I
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N
    F --> O
    F --> P
    
    G --> Q
    H --> Q
    I --> Q
    J --> Q
    K --> Q
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    I --> R
    J --> S
    G --> T
    H --> U
    
    C --> V
    G --> W
    H --> X
    I --> Y
    
    G --> Z
    H --> AA
    I --> AB
    J --> AC
    
    I --> AD
    J --> AE
    K --> AF
    L --> AG
    
    G --> AH
    H --> AI
    I --> AJ
    
    style A fill:#e1f5fe
    style G fill:#f3e5f5
    style Q fill:#e8f5e8
    style V fill:#fff3e0
    style Z fill:#fce4ec
    style AD fill:#f1f8e9
```

---

## 🤖 AI Assistant Architecture

```mermaid
graph TB
    subgraph "Frontend AI Interface"
        A[ChatbotInterface.jsx]
        B[Message State Management]
        C[Conversation History]
        D[Typing Indicators]
        E[Option Buttons]
    end
    
    subgraph "AI Flow Management"
        F[Intent Detection]
        G[Context Loading]
        H[Flow State Tracking]
        I[Response Processing]
    end
    
    subgraph "Backend AI Controller"
        J[ChatbotController]
        K[Message Endpoint]
        L[Ask with Options]
        M[Analyze Portfolio]
        N[Generate Project Description]
        O[Suggest Skills]
        P[Review Portfolio]
    end
    
    subgraph "OpenAI Service"
        Q[OpenAI Service Class]
        R[HTTP Client Configuration]
        S[Prompt Engineering]
        T[Response Parsing]
        U[Error Handling]
    end
    
    subgraph "AI Capabilities"
        V[Portfolio Analysis]
        W[Project Description Generation]
        X[Skill Recommendations]
        Y[Portfolio Section Review]
        Z[Conversation Management]
    end
    
    subgraph "OpenAI API"
        AA[GPT-3.5-turbo Model]
        AB[Chat Completions Endpoint]
        AC[System Message Configuration]
        AD[Token Management]
    end
    
    subgraph "Data Integration"
        AE[User Portfolio Data]
        AF[Context Enrichment]
        AG[Structured Prompts]
        AH[Response Formatting]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    A --> F
    F --> G
    G --> H
    H --> I
    
    A --> J
    J --> K
    J --> L
    J --> M
    J --> N
    J --> O
    J --> P
    
    K --> Q
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R
    R --> S
    S --> T
    T --> U
    
    Q --> V
    Q --> W
    Q --> X
    Q --> Y
    Q --> Z
    
    Q --> AA
    AA --> AB
    AB --> AC
    AC --> AD
    
    V --> AE
    W --> AF
    X --> AG
    Y --> AH
    
    style A fill:#e1f5fe
    style J fill:#f3e5f5
    style Q fill:#e8f5e8
    style V fill:#fff3e0
    style AA fill:#fce4ec
```

---

## 🔐 Authentication & Security Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Controller
    participant M as Auth Middleware
    participant B as BCrypt
    participant D as Database
    participant S as Session Store
    
    Note over U,S: Registration Flow
    U->>F: Enter registration details
    F->>F: Validate email format
    F->>F: Check password strength
    F->>A: POST /api/auth/register
    A->>D: Check email exists
    A->>B: Hash password
    A->>D: Create user record
    A->>F: Registration success
    F->>U: Redirect to login
    
    Note over U,S: Login Flow
    U->>F: Enter credentials
    F->>A: POST /api/auth/login
    A->>D: Find user by email
    A->>B: Verify password hash
    A->>S: Create session cookie
    A->>F: Login success + cookie
    F->>U: Redirect to dashboard
    
    Note over U,S: Authenticated Request Flow
    U->>F: Access protected resource
    F->>M: Request with session cookie
    M->>S: Validate session
    M->>D: Get user context
    M->>A: Allow access
    A->>F: Return protected data
    F->>U: Display content
    
    Note over U,S: Logout Flow
    U->>F: Click logout
    F->>A: POST /api/auth/logout
    A->>S: Invalidate session
    A->>F: Logout success
    F->>F: Clear local storage
    F->>U: Redirect to home
```

---

## 📧 Email System Architecture

```mermaid
graph TB
    subgraph "Email Triggers"
        A[User Registration]
        B[Password Reset Request]
        C[Access Request Submitted]
        D[Access Request Decision]
    end
    
    subgraph "Email Service"
        E[EmailService Class]
        F[SMTP Settings]
        G[HTML Template Engine]
        H[Async Email Queue]
    end
    
    subgraph "Email Templates"
        I[Registration Confirmation]
        J[Password Reset Contact]
        K[Access Request Notification]
        L[Access Decision Alert]
    end
    
    subgraph "SMTP Configuration"
        M[Gmail SMTP Server]
        N[Port 587 TLS]
        O[App Password Auth]
        P[HTML Email Format]
    end
    
    subgraph "Email Delivery"
        Q[Fire-and-Forget Tasks]
        R[Error Handling]
        S[Delivery Confirmation]
        T[Fallback Mechanisms]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> G
    G --> H
    
    E --> I
    E --> J
    E --> K
    E --> L
    
    E --> M
    M --> N
    N --> O
    O --> P
    
    H --> Q
    Q --> R
    R --> S
    S --> T
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style M fill:#fff3e0
    style Q fill:#fce4ec
```

---

## 📊 Data Flow Diagrams

### Portfolio Creation Data Flow
```mermaid
graph LR
    A[User Input] --> B[Frontend Validation]
    B --> C[Form Data Collection]
    C --> D[API Request]
    D --> E[Authentication Check]
    E --> F[Controller Processing]
    F --> G[Entity Creation]
    G --> H[Database Transaction]
    H --> I[Response Generation]
    I --> J[Frontend Update]
    J --> K[UI Refresh]
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style F fill:#e8f5e8
    style H fill:#fff3e0
    style J fill:#fce4ec
```

### AI Assistant Data Flow
```mermaid
graph LR
    A[User Message] --> B[Intent Detection]
    B --> C[Context Loading]
    C --> D[Prompt Generation]
    D --> E[OpenAI API Call]
    E --> F[Response Processing]
    F --> G[Option Generation]
    G --> H[Frontend Display]
    H --> I[User Interaction]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style H fill:#fce4ec
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        A[Local Development]
        B[VS Code]
        C[dotnet run]
        D[npm run dev]
    end
    
    subgraph "Build Process"
        E[Frontend Build]
        F[Vite Build Tool]
        G[Tailwind CSS Processing]
        H[Asset Optimization]
    end
    
    subgraph "Backend Deployment"
        I[ASP.NET Core Application]
        J[wwwroot Static Files]
        K[appsettings.json]
        L[Connection Strings]
    end
    
    subgraph "Database Deployment"
        M[MySQL Server]
        N[Entity Framework Migrations]
        O[Database Schema]
        P[Initial Data Seeding]
    end
    
    subgraph "External Services"
        Q[OpenAI API Integration]
        R[Gmail SMTP Server]
        S[File Storage System]
        T[CDN for Static Assets]
    end
    
    subgraph "Production Environment"
        U[Web Server]
        V[Domain Configuration]
        W[SSL Certificate]
        X[Load Balancing]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    E --> I
    F --> J
    G --> K
    H --> L
    
    I --> M
    J --> N
    K --> O
    L --> P
    
    I --> Q
    I --> R
    I --> S
    I --> T
    
    M --> U
    N --> V
    O --> W
    P --> X
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style M fill:#fff3e0
    style Q fill:#fce4ec
    style U fill:#f1f8e9
```

---

## 📋 Architecture Summary

### 🏗️ Key Architectural Patterns
- **MVC Pattern**: Controllers handle HTTP requests, Models represent data, Views handled by React
- **Repository Pattern**: Data access abstracted through Entity Framework
- **Service Layer Pattern**: Business logic separated into dedicated services
- **Middleware Pipeline**: Cross-cutting concerns handled via middleware
- **Component-Based Architecture**: Reusable React components
- **State Management**: React hooks and context for state management

### 🔧 Technology Integration Points
- **Frontend ↔ Backend**: REST API with JSON communication via Axios
- **Backend ↔ Database**: Entity Framework Core ORM with MySQL
- **Backend ↔ AI**: HTTP client integration with OpenAI API
- **Backend ↔ Email**: SMTP client for email notifications
- **Frontend ↔ 3D Graphics**: Vanta.js and Three.js for visual effects

### 🛡️ Security Architecture
- **Authentication**: Cookie-based sessions with BCrypt password hashing
- **Authorization**: Role-based access control (User/Admin)
- **Data Protection**: HTTPS enforcement, secure cookies, CORS configuration
- **Input Validation**: Frontend and backend validation layers
- **Error Handling**: Comprehensive error handling and logging

### 📈 Scalability Considerations
- **Database Indexing**: Proper foreign key relationships and indexes
- **Async Operations**: Fire-and-forget email sending, async API calls
- **Caching Strategy**: Authentication cache to reduce database calls
- **Resource Management**: Proper disposal of database contexts and HTTP clients
- **Performance Optimization**: Lazy loading, pagination, optimized queries

This comprehensive architecture documentation provides a complete technical overview of your Digital Portfolio system, covering all layers from frontend user interface to backend data persistence and external service integrations.