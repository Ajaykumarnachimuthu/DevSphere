# DEVSphere — Developer Community Full-Stack Platform

> **"Share. Build Together. Grow Forever."**

DEVSphere is a full-stack developer community platform engineered with a **clean, layered Spring Boot backend** and a **progressive multi-page frontend** (HTML5, CSS3, Vanilla JavaScript, and React Islands).

---

## 🌟 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND TIER (Vite)                             │
│                                                                             │
│  9 Semantic MPA Entry Points (frontend/*.html + frontend/*.css)             │
│  Phase 2 Vanilla JS Coexistence Handlers (frontend/*.js)                    │
│  Phase 3 React Progressive Islands (src/islands/*.jsx)                      │
│                                                                             │
│                        Centralized API Client (src/services/api.js)         │
│                        • JWT Bearer Auto-Injection                          │
│                        • Dual-mode LocalStorage Synchronization             │
│                        • Resilient Offline Fallback                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (JSON)
                                       │ Bearer Token in Authorization Header
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND TIER (Spring Boot)                           │
│                                                                             │
│  Security Filter Chain (JwtAuthenticationFilter -> UsernamePasswordAuth)    │
│  REST Controllers (@RestController, Spring Validation @Valid)               │
│       ↓                                                                     │
│  Service Layer (@Service, @Transactional, Business Logic, Ownership Checks) │
│       ↓                                                                     │
│  Repository Layer (Spring Data JPA, Derived & Paginated Queries)            │
│       ↓                                                                     │
│  Flyway Versioned Migrations (V1__init_schema.sql, V2__seed_data.sql)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ JDBC
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE TIER (PostgreSQL / H2)                    │
│                                                                             │
│  users • developer_profiles • blogs • projects • project_likes • connections│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
Full Stack Proojects/
├── backend/                                  # Spring Boot Application
│   ├── pom.xml                               # Maven Project Descriptor (Java 25, Spring Boot 3.4+)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/devsphere/
│   │   │   │   ├── config/                   # SecurityConfig, OpenApiConfig, DataInitializer
│   │   │   │   ├── controller/               # Auth, Developer, Blog, Project, Stats REST Controllers
│   │   │   │   ├── dto/                      # Request & Response DTOs
│   │   │   │   │   ├── request/              # RegisterRequest, LoginRequest, CreateBlogRequest...
│   │   │   │   │   └── response/             # AuthResponse, DeveloperResponse, BlogResponse...
│   │   │   │   ├── entity/                   # JPA Entities: User, DeveloperProfile, Blog, Project...
│   │   │   │   ├── exception/                # GlobalExceptionHandler, ResourceNotFoundException...
│   │   │   │   ├── mapper/                   # EntityDtoMapper
│   │   │   │   ├── repository/               # Spring Data JPA Repositories
│   │   │   │   ├── security/                 # JwtTokenProvider, JwtFilter, UserPrincipal
│   │   │   │   ├── service/                  # Service interfaces & @Service @Transactional implementations
│   │   │   │   └── DevSphereApplication.java # Spring Boot Main Class
│   │   │   └── resources/
│   │   │       ├── application.properties    # PostgreSQL Production Configuration
│   │   │       ├── application-dev.properties# Local Dev Config with H2 Fallback
│   │   │       ├── application-test.properties# Fast In-Memory Test DB
│   │   │       └── db/migration/             # Flyway Schema Migrations
│   │   │           ├── V1__init_schema.sql
│   │   │           └── V2__seed_devsphere_data.sql
│   │   └── test/                             # 26 Unit, Slice & SpringBootTest Integration Tests
│   │       └── java/com/devsphere/
│   │           ├── controller/               # WebMvcTest Controller Tests
│   │           ├── service/                  # Mockito Unit Tests for Business Logic
│   │           └── DevSphereIntegrationTest.java # Full E2E Spring Context Integration Test
│   │
├── frontend/                                 # Semantic HTML5, CSS3, & Vanilla JS Entry Points
│   ├── index.html                            # Home Page
│   ├── login.html                            # Authentication Login
│   ├── signup.html                           # Authentication Registration
│   ├── BlogPage.html                         # Community Blogs Directory
│   ├── writeBlog.html                        # Blog Authoring & Markdown Drafts
│   ├── Developers.html                       # Developer Directory
│   ├── DeveloperProfile.html                 # Developer Profile & Chart.js Activity
│   ├── Projects.html                         # Showcase Projects
│   ├── About.html                            # Mission & Animated Community Statistics
│   ├── *.css                                 # Design System Stylesheets
│   └── *.js                                  # Phase 2 Vanilla JS with Coexistence Guards
│
├── src/                                      # Modern React 18 & Vite Frontend
│   ├── components/                           # Reusable Cards & Layouts
│   ├── context/                              # DevSphereContext (Session State)
│   ├── data/                                 # Offline Fallback Datasets
│   ├── hooks/                                # Custom Hooks (useLocalStorage, useAuth)
│   ├── islands/                              # Mountable React Islands
│   └── services/
│       └── api.js                            # Centralized REST API Service Client
│
├── database/                                 # Cloud & Local Database Migrations
│   ├── supabase_migration.sql                # Complete Supabase Cloud DDL Schema & Data Seeding
│   └── README.md                             # Database Execution Instructions
│
├── docs/                                     # Isolated Documentation & Reports Center
│   ├── academic-reports/                     # Official Project Reports (.docx, .pdf, .md) & Viva Q&A
│   ├── architecture-and-specs/               # Comprehensive Architecture Guides & Compliance Audits
│   ├── analysis-dossiers/                    # Component & JavaScript Analysis Dossiers (.txt)
│   ├── assignment-evidence/                  # Verification Evidence Screenshots (.png)
│   └── react_page_tables/                    # High-Resolution Rendered Visual Architecture Tables
│
├── scripts/                                  # Build, Report Generation & Visual Renders
│   ├── generate_reports.py                   # Automated Word (.docx) & PDF Generator
│   └── generate_table_images.js              # Headless Chrome Table Screenshot Generator
│
├── .env.example                              # Environment Variable Template
├── package.json                              # Vite Frontend Scripts & Dependencies
├── vite.config.js                            # Multi-Page Vite Configuration
└── README.md
```

---

## 🛠 Prerequisites & Requirements

- **Java Development Kit (JDK):** Java 21 or Java 25 (`C:\Program Files\Java\jdk-25.0.4.1`)
- **Maven:** Version 3.9+ (`tools/apache-maven-3.9.6`)
- **Node.js:** Node.js 18+ and npm 9+
- **Database:** PostgreSQL 14+ (or embedded H2 for dev/testing)

---

## ⚙️ Environment Variables

Copy `.env.example` to configure your environment:

| Variable | Description | Default / Example |
|---|---|---|
| `DEVSphere_DB_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/devsphere` |
| `DEVSphere_DB_USERNAME` | PostgreSQL username | `postgres` |
| `DEVSphere_DB_PASSWORD` | PostgreSQL password | `your_secure_password_here` |
| `DEVSphere_JWT_SECRET` | 256-bit secret key for HMAC-SHA256 | `devsphere_super_secret_jwt_key_that_is_long_enough_for_hmac_sha256_32bytes` |
| `DEVSphere_CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_BASE_URL` | Frontend API client base URL | `http://localhost:8080/api/v1` |

---

## 🚀 Running the Application

### 1. Running the Backend

#### Development Mode (with automatic in-memory H2 fallback):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Production Mode (with PostgreSQL):
Ensure PostgreSQL is running and database `devsphere` exists, then:
```bash
cd backend
set DEVSphere_DB_URL=jdbc:postgresql://localhost:5432/devsphere
set DEVSphere_DB_USERNAME=postgres
set DEVSphere_DB_PASSWORD=secret
mvn spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

### 2. Running the Frontend
From the root workspace directory:
```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Building for Production
```bash
# Frontend build
npm run build

# Backend package
cd backend
mvn clean package -DskipTests
```

---

## 🧪 Running Backend Tests

The backend includes a comprehensive test suite covering **unit tests**, **controller slice tests**, and **E2E Spring integration tests**:

```bash
cd backend
mvn test
```

### Test Suite Summary:
- **`AuthServiceTest`** (5 tests): Register success, duplicate email conflict, login success, invalid password, get current user.
- **`BlogServiceTest`** (4 tests): Create blog, update blog, unauthorized edit prevention, delete blog.
- **`ProjectServiceTest`** (4 tests): Create project, toggle like, filter by category and search, view count increment.
- **`AuthControllerTest`** (4 tests): POST `/auth/register` validation & status codes, POST `/auth/login` token issue, GET `/auth/me` with principal.
- **`BlogControllerTest`** (3 tests): GET `/blogs` pagination, POST `/blogs` validation, GET `/blogs/{id}` not found.
- **`DeveloperControllerTest`** (2 tests): GET `/developers` listing, POST `/developers/{id}/connect` toggle.
- **`ProjectControllerTest`** (3 tests): GET `/projects`, POST `/projects/{id}/like`.
- **`DevSphereIntegrationTest`** (1 test): Full Spring context bootstrap, database initialization, and mock endpoint verification.
- **Total:** **26 tests run, 0 failures, 0 errors, 100% BUILD SUCCESS**.

---

## 📚 REST API Overview

All API endpoints are prefixed with `/api/v1`.

### Authentication & Users
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT access token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & details | Bearer Token |

### Developers & Profiles
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/developers` | List/search developers (supports `query`, pagination) | Public |
| `GET` | `/api/v1/developers/{id}` | Get developer profile by ID | Public |
| `GET` | `/api/v1/developers/by-name/{name}` | Get developer profile by name | Public |
| `GET` | `/api/v1/developers/by-name/{name}/stats` | Get developer metrics (projects, blogs, connections) | Public / Bearer |
| `POST` | `/api/v1/developers/{id}/connect` | Toggle connect/disconnect with developer | Bearer Token |

### Blogs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/blogs` | List blogs (filtered by `category`, `search`, `status`, pagination) | Public |
| `GET` | `/api/v1/blogs/{id}` | Get blog details by ID (increments views) | Public |
| `POST` | `/api/v1/blogs` | Create a new blog post or draft | Bearer Token |
| `PUT` | `/api/v1/blogs/{id}` | Update existing blog (enforces author ownership) | Bearer Token |
| `DELETE` | `/api/v1/blogs/{id}` | Delete blog (enforces author ownership) | Bearer Token |

### Projects
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/projects` | List projects (filtered by `category`, `search`, `sort`, pagination) | Public |
| `GET` | `/api/v1/projects/{id}` | Get project details (increments views) | Public |
| `POST` | `/api/v1/projects` | Submit new project | Bearer Token |
| `POST` | `/api/v1/projects/{id}/like` | Toggle project like / unlike | Bearer Token |

### Overview & Platform Statistics
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/stats/overview` | Platform metrics (total developers, blogs, projects, countries) | Public |

---

## 📖 OpenAPI / Swagger Documentation

When the backend is running, interactive Swagger UI and raw OpenAPI 3.0 specs are available at:
- **Interactive UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON Spec:** `http://localhost:8080/v3/api-docs`

---

## 🔒 Security & Authorization Architecture

1. **Stateless Authentication:** Stateless JWT architecture using JJWT 0.12.x.
2. **Password Protection:** BCrypt hashing (`BCryptPasswordEncoder` with strength 12).
3. **Ownership Enforced on Backend:**
   - Blog edits and deletions verify that the authenticated user is the true author (`ResourceOwnershipException` -> HTTP 403 Forbidden).
   - Private operations validate `UserPrincipal` identity from the Spring Security context.
4. **Input Validation:** Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`).
5. **CORS:** Configured via `SecurityConfig` to restrict allowed origins to Vite development and authorized production origins.
6. **Centralized Exception Handling:** `@RestControllerAdvice` returns uniform RFC-compliant `ApiError` payloads without leaking database stack traces.

---

## 🔄 Frontend-Backend Integration

The frontend uses a centralized API client (`src/services/api.js`) that:
- Automatically attaches the `Authorization: Bearer <token>` header if a token exists in `localStorage`.
- Synchronizes with existing Vanilla JS `localStorage` keys (`loggedInUser`, `users`, `publishedBlogs`, `drafts`, `connection:*`) so the legacy MPA pages continue functioning smoothly.
- Provides graceful offline fallback so the UI never breaks if the backend server is temporarily paused.

---

## 📄 License
Educational Open-Source Project — Built for demonstrating modern full-stack web evolution.
