# DevSphere — Master Source Code & Architecture Audit

**Document Type:** Comprehensive Repository, Codebase & Architectural Audit  
**Date:** 2026-10-31  
**Project:** DevSphere — Developer Community and Portfolio Platform  
**Target Environment:** Spring Boot 3.4.3 / Java 21 / React 18 / Supabase PostgreSQL  
**Audit Classification:** READ-ONLY Verification  

---

## 1. Executive Architectural Summary

DevSphere was designed as a developer-oriented community and portfolio platform allowing software engineers to publish technical profiles, showcase projects, read and author blogs, and interact via likes and connections.

Following an exhaustive inspection of the actual source code across the entire workspace, DevSphere currently exists in a **tripartite fragmented state**:

1. **The Authoritative Monolith (`backend/`):**
   - Built on **Spring Boot 3.4.3** and **Java 21**.
   - Operating on port `8080`.
   - Contains a complete Spring Security 6 filter chain with JJWT (0.12.6), BCrypt password encryption, Flyway migration scripts, JPA/Hibernate repositories, structured DTOs, and 31 passing automated tests (including pessimistic locking concurrency tests).
   - Serves all active frontend endpoints under `/api/v1/`.

2. **The Autonomous Demo Microservices (`microservices/`):**
   - Three independent Spring Boot 3.2.2 applications:
     - `developer-service` (Port `8081`)
     - `project-service` (Port `8082`)
     - `blog-service` (Port `8083`)
   - All three run isolated in-memory H2 databases (`jdbc:h2:mem:*`).
   - None of them implement Spring Security, JWT authentication, or validation filters.
   - None of them communicate with each other, nor does `backend/` route to them.
   - **Zero frontend traffic reaches these microservices.** They currently function as disconnected prototypes.

3. **Dual Frontend Layers (`frontend/` vs `src/`):**
   - `frontend/`: Legacy static HTML/CSS/JS files (`index.html`, `Developers.html`, `Projects.html`, `BlogPage.html`, `writeBlog.html`, `About.html`). These use React DOM "islands" mounted into specific DOM nodes.
   - `src/`: Modern **React 18 + Vite + React Router DOM 6** Single Page Application (SPA).
   - **Critical Architectural Gap:** While `src/services/api.js` provides centralized HTTP methods targeting `http://localhost:8080`, several SPA page components in `src/pages/` bypass `api.js` and fall back to local `mock data` or browser `localStorage`.

---

## 2. Complete Repository Inventory

| Directory | Primary Technology | Architectural Role | Status |
| :--- | :--- | :--- | :--- |
| `backend/` | Spring Boot 3.4.3, Java 21, JPA, Flyway, JJWT | **Authoritative Core Backend** (Port 8080). Handles Auth, Developers, Projects, Blogs, Stats. | **VERIFIED / OPERATIONAL** |
| `src/` | React 18.3.1, Vite 6.0.1, React Router 6.28.0 | **Primary SPA Frontend**. Contains pages, components, hooks, islands, and API client. | **VERIFIED / PARTIALLY INTEGRATED** |
| `frontend/` | Vanilla HTML5, CSS3, ES Modules | Legacy static prototype pages that mount React islands. | **PARTIALLY VERIFIED / REDUNDANT** |
| `microservices/developer-service` | Spring Boot 3.2.2, H2 In-Memory | Autonomous Developer Profile service (Port 8081). | **PROTOTYPE / UNCONNECTED** |
| `microservices/project-service` | Spring Boot 3.2.2, H2 In-Memory | Autonomous Project Showcase service (Port 8082). | **PROTOTYPE / UNCONNECTED** |
| `microservices/blog-service` | Spring Boot 3.2.2, H2 In-Memory | Autonomous Technical Blog service (Port 8083). | **PROTOTYPE / UNCONNECTED** |
| `database/` | PostgreSQL SQL scripts | Supabase Cloud migration (`supabase_migration.sql`) and setup README. | **VERIFIED / STANDALONE** |
| `docs/production-backend-overhaul/` | Markdown Documentation | Audit findings, database reviews, concurrency logs, and transition plans. | **VERIFIED / ACTIVE** |

---

## 3. Service Dependency and Implementation Map

### 3.1 Service Inventory Matrix

| Attribute | DevSphere Core Monolith | Developer Service | Project Service | Blog Service |
| :--- | :--- | :--- | :--- | :--- |
| **Directory** | `backend/` | `microservices/developer-service` | `microservices/project-service` | `microservices/blog-service` |
| **Port** | `8080` | `8081` | `8082` | `8083` |
| **Runtime** | Java 21, Spring Boot 3.4.3 | Java 17+, Spring Boot 3.2.2 | Java 17+, Spring Boot 3.2.2 | Java 17+, Spring Boot 3.2.2 |
| **Active Datasource** | Dev: H2 file (`./data/devspheredb`)<br>Prod: PostgreSQL 15+ | H2 In-Memory (`jdbc:h2:mem:developerdb`) | H2 In-Memory (`jdbc:h2:mem:projectdb`) | H2 In-Memory (`jdbc:h2:mem:blogdb`) |
| **Schema Tool** | Flyway (`V1`, `V2`) in Prod; Hibernate update in Dev | Hibernate `ddl-auto=update` | Hibernate `ddl-auto=update` | Hibernate `ddl-auto=update` |
| **Authentication** | Spring Security 6 stateless filter + JJWT | None (Permit all open endpoints) | None (Permit all open endpoints) | None (Permit all open endpoints) |
| **Controllers** | `AuthController`<br>`DeveloperController`<br>`ProjectController`<br>`BlogController`<br>`StatsController` | `DeveloperController` | `ProjectController` | `BlogController` |
| **Entities** | `User`, `Role`, `DeveloperProfile`, `DeveloperConnection`, `Project`, `ProjectLike`, `Blog`, `BlogStatus` | `DeveloperProfile` | `Project` | `Blog` |
| **API Consumer** | `src/services/api.js` (React Frontend) | None | None | None |
| **Production Ready** | **PARTIALLY VERIFIED** (Core logic solid; fixes needed) | **NO** (Academic prototype) | **NO** (Academic prototype) | **NO** (Academic prototype) |

---

## 4. End-to-End API Consumption Analysis

The following table traces every backend endpoint in `backend/` against its actual usage in the frontend:

| HTTP Method & Endpoint | Backend Controller | Frontend Caller in `src/services/api.js` | UI Component Integration | Status | Findings & Anomalies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/register` | `AuthController.register` | `authApi.register()` | `src/pages/Signup.jsx`<br>`src/islands/SignupForm.jsx` | **VERIFIED** | Registration works; auto-creates DeveloperProfile. On backend error, frontend falls back to saving plaintext password in localStorage. |
| `POST /api/v1/auth/login` | `AuthController.login` | `authApi.login()` | `src/pages/Login.jsx`<br>`src/islands/LoginForm.jsx` | **DEFECT** | Login succeeds with valid credentials; however, `Login.jsx` catches backend errors and signs the user in anyway via local state. |
| `GET /api/v1/auth/me` | `AuthController.getCurrentUser` | `authApi.getCurrentUser()` | `src/context/DevSphereContext.jsx` | **VERIFIED** | Populates authenticated user context on boot if `jwt_token` is present in localStorage. |
| `POST /api/v1/auth/logout` | `AuthController.logout` | `authApi.logout()` | `src/components/layout/Navbar.jsx` | **PARTIALLY VERIFIED** | Controller returns success message; client removes token. Backend does not invalidate or blacklist token. |
| `GET /api/v1/developers` | `DeveloperController.getDevelopers` | `developersApi.getAll()` | `src/islands/DevelopersIsland.jsx` (Used only in HTML) | **DEFECT** | `src/pages/Developers.jsx` does NOT call `developersApi.getAll()`. It renders static `developers.js`. |
| `GET /api/v1/developers/{id}` | `DeveloperController.getDeveloperById` | `developersApi.getById()` | **UNUSED** | **DEFECT** | `src/pages/DeveloperProfile.jsx` does not call this endpoint; it reads from `localStorage("selectedDeveloper")`. |
| `GET /api/v1/developers/by-name` | `DeveloperController.getDeveloperByName` | `developersApi.getByName()` | **UNUSED** | **UNUSED** | Built in backend but never invoked by the React SPA. |
| `POST /api/v1/developers/{id}/connect` | `DeveloperController.toggleConnection` | `developersApi.toggleConnect()` | `src/islands/ProfileChart.jsx` | **PARTIALLY VERIFIED** | Invoked in `ProfileChart.jsx` island; completely bypassed in `src/pages/DeveloperProfile.jsx`. |
| `GET /api/v1/developers/{id}/stats` | `DeveloperController.getDeveloperStats` | `developersApi.getStats()` | `src/islands/ProfileChart.jsx` | **DEFECT** | `ProfileChart.jsx` passes developer name instead of UUID, causing Spring Boot `MethodArgumentTypeMismatchException` (HTTP 400). |
| `POST /api/v1/developers` | **MISSING IN CORE** | **MISSING** | **MISSING** | **DEFECT** | Developers cannot edit their profile bio, role, or skills anywhere in the application. |
| `GET /api/v1/projects` | `ProjectController.getProjects` | `projectsApi.getAll()` | `src/pages/Projects.jsx`<br>`src/islands/ProjectsIsland.jsx` | **VERIFIED** | Successfully queries paginated projects with category and search filtering. |
| `GET /api/v1/projects/{id}` | `ProjectController.getProjectById` | `projectsApi.getById()` | **UNUSED** | **UNUSED** | No dedicated project details view exists on the frontend. |
| `POST /api/v1/projects` | `ProjectController.createProject` | `projectsApi.create()` | **UNUSED** | **DEFECT** | Backend endpoint is operational and authenticated. But "+ Submit project" button in `Projects.jsx` only shows a placeholder notice. |
| `POST /api/v1/projects/{id}/like` | `ProjectController.toggleLike` | `projectsApi.toggleLike()` | `src/pages/Projects.jsx`<br>`src/islands/ProjectsIsland.jsx` | **VERIFIED** | Pessimistic locking protects concurrent likes in backend. UI applies optimistic updates. |
| `POST /api/v1/projects/{id}/view` | `ProjectController.incrementView` | `projectsApi.incrementView()` | `src/components/cards/ProjectCard.jsx` | **VERIFIED** | Increments view counter via direct atomic SQL update. |
| `GET /api/v1/blogs` | `BlogController.getBlogs` | `blogsApi.getAll()` | `src/islands/BlogIsland.jsx` (Used only in HTML) | **DEFECT** | `src/pages/Blogs.jsx` does NOT call `blogsApi.getAll()`. It renders static `blogs.js` + localStorage. |
| `GET /api/v1/blogs/{id}` | `BlogController.getBlogById` | `blogsApi.getById()` | **UNUSED** | **DEFECT / RISK** | Backend endpoint returns blog without checking if it is a DRAFT, leaking unpublished drafts. |
| `POST /api/v1/blogs` | `BlogController.createBlog` | `blogsApi.create()` | `src/islands/WriteBlogIsland.jsx` (Only in HTML) | **DEFECT** | `src/pages/WriteBlog.jsx` does NOT call `blogsApi.create()`. It saves strictly to browser localStorage. |
| `GET /api/v1/blogs/drafts` | `BlogController.getDrafts` | `blogsApi.getDrafts()` | **UNUSED** | **DEFECT** | Frontend never calls this endpoint to display saved server drafts to authors. |
| `PUT /api/v1/blogs/{id}` | `BlogController.updateBlog` | `blogsApi.update()` | **UNUSED** | **UNUSED** | Author ownership verification is coded in backend, but no edit UI exists in frontend. |
| `DELETE /api/v1/blogs/{id}` | `BlogController.deleteBlog` | `blogsApi.delete()` | **UNUSED** | **UNUSED** | Deletion is verified in backend with ownership check, but no delete button exists in frontend. |
| `GET /api/v1/stats/overview` | `StatsController.getOverviewStats` | `statsApi.getOverview()` | `src/pages/About.jsx`<br>`src/islands/AboutStats.jsx` | **VERIFIED (ETHICAL GAP)** | Live stats return fabricated base counts (`+9994` devs, `+2494` blogs, `+1194` projects). |

---

## 5. Architectural Inconsistencies & Deficiencies

### 5.1 The Microservices Fallacy
The three microservices in `microservices/` are completely detached:
1. **No Gateway Routing:** Port `8080` has no reverse proxy (such as Spring Cloud Gateway) to dispatch requests to ports `8081`, `8082`, or `8083`.
2. **Duplicated Entities and Tables:** `DeveloperProfile`, `Project`, and `Blog` exist in both `backend/` and `microservices/`, but they use incompatible schemas. The microservices do not track authors as users (`author_id` is missing in `Project` and `Blog` entities of microservices).
3. **No Security:** Microservices lack Spring Security dependencies and accept unauthenticated mutations.
4. **Conclusion:** Running four JVM instances for this application introduces operational latency, memory waste, and distributed state corruption without providing any decoupling benefits. DevSphere Core (`backend/`) already possesses the entire domain logic and entity model.

### 5.2 Frontend Dual-Architecture Split
The project retains an older vanilla HTML architecture alongside modern React:
- `src/pages/` contains the React Router views.
- `src/islands/` contains standalone components built to mount into `frontend/*.html` files via `document.getElementById(...)`.
- Because development was split between these two paradigms, features wired into `src/islands/` (such as `blogsApi.create()` in `WriteBlogIsland.jsx`) were never connected to the actual React page component (`src/pages/WriteBlog.jsx`).

### 5.3 Entity and DTO Exposure
- In `backend/`, strict separation between JPA entities and response DTOs (`DeveloperResponse`, `ProjectResponse`, `BlogResponse`, `UserResponse`) is maintained using `EntityDtoMapper.java`.
- In `microservices/`, JPA entities are serialized directly to JSON, leaking database structure, persistence proxies, and internal IDs.

---

## 6. Recommendations for Architecture Remediation

1. **Adopt a Pragmatic Modular Monolith:** Standardize all development on `backend/` (Port 8080). Package domain modules into clean packages (`com.devsphere.modules.auth`, `developer`, `project`, `blog`, `stats`) within a single JVM.
2. **Deprecate or Re-purpose `microservices/`:** Archive the prototype microservices to eliminate false assumptions about distributed deployment.
3. **Connect React SPA to Authoritative Backend:** Refactor `src/pages/Developers.jsx`, `DeveloperProfile.jsx`, `Blogs.jsx`, and `WriteBlog.jsx` to call `src/services/api.js` directly and eliminate mock fallbacks.
4. **Implement Missing Developer Profile Mutation:** Add `PUT /api/v1/developers/me` to allow authenticated users to update their bio, role, location, and technical skills.

