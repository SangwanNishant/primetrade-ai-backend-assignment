# ⚡ Primetrade.ai — Task Management API

> A production-ready **REST API** with JWT authentication, role-based access control, full CRUD operations, Swagger documentation, and a React frontend — built for the Primetrade.ai Backend Developer Internship assignment.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)

---

## 🚀 Quick Start (Zero Config)

Uses **SQLite** — no database installation required.

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Defaults work out of the box for local development
```

### 3. Initialize Database

```bash
cd backend
npm run setup   # Runs migrations + seeds admin user
```

### 4. Run

```bash
# Terminal 1 — Backend API (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend UI (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🔑 Test Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@primetrade.ai    | Admin@123!  |
| User  | demo@primetrade.ai     | User@123!   |

---

## 📖 API Documentation

Interactive Swagger UI: **`http://localhost:5000/api/v1/docs`**

### Authentication Endpoints

| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | `/api/v1/auth/register`   | ❌   | Register new user        |
| POST   | `/api/v1/auth/login`      | ❌   | Login & receive JWT      |
| GET    | `/api/v1/auth/me`         | ✅   | Get current user profile |

### Task Endpoints

| Method | Endpoint                  | Auth | Role       | Description                          |
|--------|---------------------------|------|------------|--------------------------------------|
| GET    | `/api/v1/tasks`           | ✅   | user/admin | List tasks (own / all for admin)     |
| POST   | `/api/v1/tasks`           | ✅   | user/admin | Create a new task                    |
| GET    | `/api/v1/tasks/:id`       | ✅   | user/admin | Get task by ID (ownership enforced)  |
| PUT    | `/api/v1/tasks/:id`       | ✅   | user/admin | Update task                          |
| DELETE | `/api/v1/tasks/:id`       | ✅   | user/admin | Delete task                          |

### User Management Endpoints (Admin Only)

| Method | Endpoint                     | Auth | Role  | Description           |
|--------|------------------------------|------|-------|-----------------------|
| GET    | `/api/v1/users`              | ✅   | admin | List all users        |
| GET    | `/api/v1/users/:id`          | ✅   | admin | Get user by ID        |
| PATCH  | `/api/v1/users/:id/role`     | ✅   | admin | Update user role      |
| DELETE | `/api/v1/users/:id`          | ✅   | admin | Delete user           |

### Query Parameters (GET /api/v1/tasks)

| Param      | Type   | Description                                  |
|------------|--------|----------------------------------------------|
| `status`   | string | Filter: `todo` \| `in_progress` \| `done`    |
| `priority` | string | Filter: `low` \| `medium` \| `high`          |
| `search`   | string | Full-text search on title & description      |

---

## 🔐 Security Practices

- **bcrypt** password hashing with 12 salt rounds
- **JWT** tokens signed with HS256, 7-day expiry
- **Helmet.js** sets secure HTTP headers (CSP, HSTS, XSS protection)
- **Rate limiting** — 100 requests per 15-min window per IP
- **Joi** schema validation on all request bodies and query params
- **Parameterized queries** — zero SQL injection surface
- **Ownership checks** — users can only access their own resources
- **CORS** locked to configured frontend origin

---

## 🗄️ Database Schema

### `users`
```sql
id            TEXT  PRIMARY KEY             -- UUID v4
name          TEXT  NOT NULL
email         TEXT  UNIQUE NOT NULL         -- indexed
password_hash TEXT  NOT NULL                -- bcrypt 12 rounds
role          TEXT  DEFAULT 'user'          -- 'user' | 'admin'
created_at    TEXT  DEFAULT (datetime('now'))
updated_at    TEXT  DEFAULT (datetime('now'))
```

### `tasks`
```sql
id            TEXT  PRIMARY KEY             -- UUID v4
user_id       TEXT  NOT NULL REFERENCES users(id) ON DELETE CASCADE
title         TEXT  NOT NULL
description   TEXT  DEFAULT ''
status        TEXT  DEFAULT 'todo'          -- 'todo' | 'in_progress' | 'done'
priority      TEXT  DEFAULT 'medium'        -- 'low' | 'medium' | 'high'
due_date      TEXT                          -- ISO date string or NULL
created_at    TEXT  DEFAULT (datetime('now'))
updated_at    TEXT  DEFAULT (datetime('now'))
```

**Indexes:** `users.email`, `tasks.user_id`, `tasks.status`

---

## 📁 Project Structure

```
primetrade-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # SQLite connection (WAL mode, FK enabled)
│   │   │   └── swagger.js        # Swagger/OpenAPI 3.0 setup
│   │   ├── middleware/
│   │   │   ├── authenticate.js   # JWT verification middleware
│   │   │   ├── authorize.js      # Role-based access guard
│   │   │   ├── validate.js       # Joi validation wrapper
│   │   │   ├── errorHandler.js   # Centralized error handling
│   │   │   └── rateLimiter.js    # express-rate-limit config
│   │   ├── modules/
│   │   │   ├── auth/             # Register, login, profile endpoints
│   │   │   ├── tasks/            # Full CRUD task management
│   │   │   └── users/            # Admin user management
│   │   ├── routes/
│   │   │   └── v1.js             # Versioned API router (/api/v1/*)
│   │   ├── utils/
│   │   │   ├── jwt.js            # Sign/verify helpers
│   │   │   ├── logger.js         # Winston structured logger
│   │   │   └── response.js       # Standardized JSON response helpers
│   │   ├── db/
│   │   │   ├── migrate.js        # Schema creation
│   │   │   └── seed.js           # Admin + demo data
│   │   ├── app.js                # Express app (middleware + routes)
│   │   └── server.js             # HTTP server entry point
│   ├── logs/                     # Winston log files (auto-created)
│   ├── data/                     # SQLite .db file (auto-created)
│   ├── .env.example
│   └── package.json
└── frontend/
    └── src/
        ├── api/                  # Axios client + API modules
        ├── components/           # Navbar, TaskModal, Toast, ProtectedRoute
        ├── context/              # AuthContext (JWT + user state)
        └── pages/                # Login, Register, Dashboard, AdminPanel
```

---

## 📈 Scalability Architecture

### 1. Stateless JWT Authentication
No server-side session storage. Any number of API server instances can be added behind a load balancer (AWS ALB, Nginx) without coordination. JWT payload carries all needed identity data.

### 2. Modular Feature Architecture
Each feature (`auth`, `tasks`, `users`) is a self-contained module (routes → controller → service). Splitting into independent microservices requires extracting a module, adding its own HTTP server, and updating the API gateway config — no cross-module coupling.

### 3. API Versioning (`/api/v1/`)
New versions (`/api/v2/`) run alongside old ones without breaking existing clients. Deprecation can be gradual over release cycles.

### 4. Database Abstraction
SQLite is used for zero-config local development. Swapping to **PostgreSQL** or **MySQL** requires changing one line in `src/config/database.js` — all service logic is identical. Production deployments would use PostgreSQL with connection pooling (PgBouncer).

### 5. Redis Caching (Next Step)
`GET /tasks` responses can be cached with a per-user cache key. TTL of ~30s reduces DB read load by 80%+ in read-heavy scenarios. Cache is invalidated on any task write.

### 6. Observability
Winston structured JSON logs are ready for ingestion by ELK Stack, Datadog, or AWS CloudWatch. Request IDs (via `uuid`) can be added to log context for distributed tracing.

### 7. Docker-Ready
`docker-compose.yml` spins up the full stack with one command for environment parity across dev/staging/prod.

---

## 🐳 Docker (Optional)

```bash
docker-compose up --build
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

*Built with ❤️ for the Primetrade.ai Internship Assignment*
