# DevTimer – Full-Stack Consultant TimeTracker

A modular, production-ready full-stack time tracking application built for independent consultants, agencies, and contract developers.

---

## Folder Structure

```
devtimer/
├── docker-compose.yml              # PostgreSQL, Redis, .NET Web API, Python Worker, React Client
├── .env.example                    # Sample environment variables
├── README.md                       # Complete documentation & commands
├── db/
│   └── init.sql                    # UUID relational schema, foreign keys & test seeds
├── backend/                        # C# .NET 8 Web API
│   ├── Dockerfile
│   ├── DevTimer.Api.csproj         # EF Core, Npgsql, Redis, BCrypt, JWT Bearer
│   ├── Program.cs                  # DI, CORS, Redis connection & Auth pipeline
│   ├── appsettings.json
│   ├── Data/
│   │   └── DevTimerDbContext.cs    # EF Core DbContext mapping
│   ├── Models/
│   │   └── Entities.cs             # User, Client, Project, TimeEntry, Invoice entities
│   ├── Services/
│   │   └── RedisTimerService.cs    # Redis cache for active running timer state
│   └── Controllers/
│       ├── AuthController.cs       # JWT authentication & BCrypt register/login
│       ├── TimerController.cs      # Live Redis timer start/stop endpoints
│       ├── ClientsController.cs    # Client CRUD & rate definitions
│       ├── ProjectsController.cs   # Project management & color tags
│       └── TimeEntriesController.cs # Manual entry & filtering
├── worker/                         # Python Invoice Engine & Background Processor
│   ├── Dockerfile
│   ├── requirements.txt            # psycopg2, SQLAlchemy, ReportLab, OpenAI
│   ├── invoice_engine.py           # Auto invoice generator, PDF renderer & AI summaries
│   └── invoices/                   # Destination for compiled PDF deliverables
└── frontend/                       # React 18 + TypeScript + Vite + Tailwind CSS
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx                # React entry point
        ├── index.css               # Tailwind & custom scrollbar styles
        ├── types/
        │   └── index.ts            # TypeScript interfaces (Client, Project, TimeEntry, User)
        ├── api/
        │   └── client.ts           # REST API client with JWT bearer handling
        ├── components/
        │   ├── Navbar.tsx          # Top navigation bar with active route highlighting
        │   ├── TrackerCard.tsx     # Live timer bar with client/project/billable inputs
        │   ├── RecentPills.tsx     # Quick-start preset pills
        │   └── DailyLog.tsx        # Activity log grouped with AI summaries & actions
        ├── views/
        │   ├── TrackView.tsx       # Live tracking & daily log management
        │   ├── TimesheetView.tsx   # Matrix calendar grid (Mon-Sun) with hour totals
        │   ├── ReportsView.tsx     # Analytics KPIs, bar chart & CSV/invoice export
        │   ├── ClientsProjectsView.tsx # Full CRUD for clients & projects
        │   └── LoginView.tsx       # Authentication login & register modal
        └── App.tsx                 # Core app state, storage hydration & tab router
```

---

## Quick Start (Docker)

To run the entire ecosystem with a single command:

```bash
docker-compose up --build
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend Swagger API**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **PostgreSQL**: `localhost:5432` (User: `devtimer_user`, DB: `devtimer_db`)
- **Redis**: `localhost:6379`

### Default Demo Credentials
- **Email**: `alex@devtimer.io`
- **Password**: `password123`

---

## Running Locally Without Docker

### 1. Database & Cache
Ensure PostgreSQL 16 and Redis 7 are running locally. Initialize database tables:
```bash
psql -U devtimer_user -d devtimer_db -f db/init.sql
```

### 2. Backend (.NET 8 Web API)
```bash
cd backend
dotnet restore
dotnet run
```
API runs on `http://localhost:5000`.

### 3. Python Invoice Engine
```bash
cd worker
pip install -r requirements.txt
python invoice_engine.py --all
```

### 4. Frontend (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
Vite dev server runs on `http://localhost:3000`.
