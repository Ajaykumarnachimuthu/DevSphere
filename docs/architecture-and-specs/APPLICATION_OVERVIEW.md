# DevSphere — Full-Stack Application Overview & System Architecture

**Course:** FULL STACK WEB DEVELOPMENT  
**Course Code:** 21CSE354T  
**Activity:** Spring Boot Framework – Part 1  
**Student Name:** AJAYKUMAR N  
**Register Number:** RA2411003012107  
**Project Name:** DevSphere (Developer Community & Showcase Platform)  
**Repository Location:** `C:\Users\N.AJAYKUMAR\Full Stack Proojects`

---

## 1. Executive Summary & Purpose

**DevSphere** is a modern, enterprise-grade full-stack web application designed to empower developers across the globe to connect, collaborate, showcase technical projects, and publish in-depth technical blogs. 

In traditional developer platforms, portfolios, engineering blogs, and professional networking are fragmented across disparate websites (e.g., GitHub, Medium, LinkedIn). DevSphere unifies these workflows into a single cohesive, high-performance web platform featuring:
1. **Interactive Developer Directory:** Searchable profiles detailing developer skillsets, experience, and real-time activity metrics.
2. **Project Showcase Portal:** A community repository of web, AI/ML, mobile, and cloud engineering projects with real-time like counters and view analytics.
3. **Knowledge Publishing Platform:** A technical blogging system supporting multi-category publishing, tag filtering, word-count and read-time calculations, and persistent draft management.
4. **Platform-Wide Intelligence & Metrics:** High-speed analytical aggregates reflecting active developer counts, published articles, open-source repositories, and global reach.

---

## 2. Problem Statement & Academic Objectives

### Problem Statement
Software developers frequently encounter three structural hurdles when building their technical presence:
- **Scattered Digital Footprint:** Source code repositories exist in one location, written technical articles in another, and networking connections in yet another.
- **Architectural Complexity in Modern Web Stacks:** Balancing semantic search-engine optimization (SEO), fast initial page loads, and dynamic client-side interactivity often results in bloated Single-Page Applications (SPAs) that sacrifice document semantics.
- **Rigorous Enterprise Decoupling:** Educational full-stack systems often mix business rules into controller endpoints or rely on insecure client-side validation without server-side constraints.

### Educational & Technical Objectives
Under **Course Code 21CSE354T (Activity: Spring Boot Framework – Part 1)**, DevSphere is engineered to satisfy strict software engineering standards:
1. **Three-Layer Architecture:** Strict physical and logical separation between the **Presentation Tier** (`@RestController`), **Business Logic Tier** (`@Service`), and **Data Access Tier** (`@Repository`).
2. **Robust Spring Boot Auto-Configuration:** Leveraging Spring Boot 3.4.3 starter packages (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`) to eliminate legacy XML boilerplate.
3. **Stateless Enterprise Security:** Implementing JSON Web Tokens (JJWT 0.12.6) with HMAC-SHA512 cryptographic signing, BCrypt salted password hashing, and custom Spring Security filter chains.
4. **Relational Domain Modeling:** Implementing a normalized relational database schema with 6 JPA domain entities, foreign keys, and collection mappings.
5. **Progressive Web Enhancement:** Supporting both a **Semantic Multi-Page Application (MPA)** with isolated **React Islands** for high interactivity and an equivalent **React Single Page Application (SPA)** with client-side routing.
6. **Empirically Verified Automated Testing:** Providing comprehensive JUnit 5 and Mockito test coverage (Unit, Slice, and Integration tests) confirming 100% build success.

---

## 3. Technology Stack

The DevSphere codebase leverages an enterprise polyglot stack optimized for resilience, type safety, and clean separation of concerns.

### 3.1 Frontend Architecture
| Layer / Tool | Technology | Version | Purpose in DevSphere |
|---|---|---|---|
| **Core Structure** | Semantic HTML5 | W3C Standard | Page landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) |
| **Design System** | Custom CSS3 | Native CSS | CSS custom properties, grid layouts, fluid typography, dark-mode surfaces |
| **Component Framework** | React | `18.3.1` | Declarative UI components, state management, controlled form inputs |
| **Virtual DOM Driver** | React DOM | `18.3.1` | Concurrent root mounting (`createRoot`) into semantic island targets |
| **Client-Side Router** | React Router DOM | `6.28.0` | Client-side routing across 9 application routes in SPA mode |
| **Data Visualization** | Chart.js | `4.4.8` | Dynamic canvas rendering for developer activity radar/bar charts |
| **Build Tool & Bundler** | Vite | `6.0.1` | High-speed ESM development server, HMR, and production rollups |
| **API Client** | Native Fetch API | ES2022 | Centralized HTTP service layer (`src/services/api.js`) with JWT bearer injection |

### 3.2 Backend Architecture
| Layer / Tool | Technology | Version | Purpose in DevSphere |
|---|---|---|---|
| **Programming Language** | Java (JDK) | OpenJDK 21 / 23 | Modern Java features (records, text blocks, pattern matching, sealed interfaces) |
| **Application Framework** | Spring Boot | `3.4.3` | Standalone executable web framework with embedded Apache Tomcat 10.1.36 |
| **Persistence Engine** | Spring Data JPA / Hibernate | Hibernate `6.6.8.Final` | Object-Relational Mapping (ORM), JPQL queries, automatic schema generation |
| **Security Framework** | Spring Security | `6.4.x` | Stateless SecurityFilterChain, CORS filter, BCrypt password encoder |
| **Token Authentication** | JJWT (Java JWT) | `0.12.6` | Generation, parsing, and cryptographic verification of Bearer JWT tokens |
| **Validation Engine** | Jakarta Validation (Hibernate Validator) | `3.0.2` | Declarative request payload validation (`@NotBlank`, `@Email`, `@Size`) |
| **API Documentation** | SpringDoc OpenAPI | `2.8.5` | Automated OpenAPI 3.0 specification and Swagger UI interactive explorer |
| **Database Migrations** | Flyway | `10.x` | Version-controlled relational database migrations for production environments |
| **Build Automation** | Apache Maven | `3.9.6` | Dependency resolution, test lifecycle execution, fat JAR artifact packaging |

### 3.3 Databases & Infrastructure
| Environment | Engine | Configuration | Connection Mode |
|---|---|---|---|
| **Development (Default)** | H2 Database Engine | `2.3.232` | File-backed embedded database (`jdbc:h2:file:./data/devspheredb`) in PostgreSQL emulation mode |
| **Automated Testing** | H2 Database Engine | `2.3.232` | In-memory isolated database (`jdbc:h2:mem:testdb`) with auto-drop schema per test run |
| **Production Target** | PostgreSQL | `14+` | Fully relational enterprise database managed via Flyway versioned migrations |

---

## 4. Overall System Architecture

DevSphere adheres strictly to the **Three-Layer Architecture** pattern. Components in each layer have isolated responsibilities and never violate layer boundaries:

```
+-------------------------------------------------------------------------+
|                          CLIENT APPLICATION                             |
|  +-----------------------------------+  +----------------------------+  |
|  |     Semantic HTML5 / CSS3         |  |   React SPA / Islands      |  |
|  |  (frontend/*.html + frontend/*.js)|  |   (src/pages + src/islands)|  |
|  +-----------------------------------+  +----------------------------+  |
|                                    |                                    |
|                      src/services/api.js (Fetch)                        |
+------------------------------------+------------------------------------+
                                     |  HTTP REST / JSON (Port 8080)
                                     v
+-------------------------------------------------------------------------+
|                  BACKEND: PRESENTATION TIER (REST API)                  |
|  AuthController | BlogController | DeveloperController |               |
|  ProjectController | StatsController                                    |
|  - Validates DTOs (@Valid)                                              |
|  - Maps HTTP requests, query params, headers, and paths                 |
|  - Enforces stateless JWT authentication via JwtAuthenticationFilter    |
+------------------------------------+------------------------------------+
                                     |  DTOs & Domain Arguments
                                     v
+-------------------------------------------------------------------------+
|                  BACKEND: BUSINESS LOGIC TIER (SERVICES)                |
|  AuthServiceImpl | BlogServiceImpl | DeveloperServiceImpl |             |
|  ProjectServiceImpl | StatsServiceImpl                                 |
|  - Executes business rules (ownership, duplicate email guards, likes)   |
|  - Transaction boundaries (@Transactional)                             |
|  - Throws domain exceptions (Unauthorized, Forbidden, DuplicateResource)|
+------------------------------------+------------------------------------+
                                     |  Entities & Query Predicates
                                     v
+-------------------------------------------------------------------------+
|                 BACKEND: DATA ACCESS TIER (REPOSITORIES)                |
|  UserRepository | DeveloperProfileRepository | BlogRepository |        |
|  ProjectRepository | ProjectLikeRepository | DeveloperConnectionRepo    |
|  - Spring Data JpaRepository<T, UUID> interfaces                        |
|  - Derived query methods & custom JPQL search queries                   |
+------------------------------------+------------------------------------+
                                     |  Hibernate SQL (JDBC)
                                     v
+-------------------------------------------------------------------------+
|                         DATABASE STORAGE TIER                           |
|  PostgreSQL 14+ (Production)  /  H2 Engine (Development & Tests)        |
|  Tables: users, developer_profiles, blogs, projects, project_likes,     |
|          developer_connections, developer_skills, project_technologies   |
+-------------------------------------------------------------------------+
```

---

## 5. Major Application Modules

DevSphere is organized into five tightly integrated functional modules:

### 1. Authentication & Identity Management
- **Registration (`POST /api/v1/auth/register`):** Creates user credentials with unique email and username verification. Automatically seeds an initial `DeveloperProfile` for the new user.
- **Login (`POST /api/v1/auth/login`):** Validates password using BCrypt and returns an HMAC-SHA512 signed JWT Bearer token.
- **Identity Profile (`GET /api/v1/auth/me`):** Retrieves the current authenticated user's ID, username, email, and authority level (`ROLE_USER` or `ROLE_ADMIN`).
- **Session Termination (`POST /api/v1/auth/logout`):** Clears the JWT token from client storage and invalidates the client session.

### 2. Developer Directory & Social Networking
- **Directory Discovery (`GET /api/v1/developers`):** Supports paginated exploration of developer profiles with real-time substring search across names, bios, roles, and skills.
- **Detailed Profiles (`GET /api/v1/developers/{id}` and `/by-name`):** Fetches specific developer information including skills, bio, location, and avatar identifier.
- **Peer Connections (`POST /api/v1/developers/{id}/connect`):** A toggle connection feature that allows authenticated users to build a professional peer network with persistent database state.
- **Activity Visualization (`GET /api/v1/developers/{id}/stats`):** Generates numerical breakdowns for Projects, Blogs, and Connections rendered dynamically via Chart.js canvas elements.

### 3. Engineering Blogs & Knowledge Base
- **Article Catalog (`GET /api/v1/blogs`):** Filterable by category ("Web Development", "AI / ML", "DevOps", etc.) and searchable by title, author, and content keywords.
- **Story Creation & Draft Engine (`POST /api/v1/blogs`):** Allows authors to save unfinished works as private drafts or immediately publish them to the community.
- **Draft Inspection (`GET /api/v1/blogs/drafts`):** Dedicated endpoint returning only draft articles authored by the currently authenticated user.
- **Ownership Guards (`PUT /api/v1/blogs/{id}` & `DELETE /api/v1/blogs/{id}`):** Enforces strict authorization ensuring only the original author (or a platform administrator) can modify or delete a blog.

### 4. Community Projects Showcase
- **Project Discovery (`GET /api/v1/projects`):** Displays community repositories with category filtering and multiple sort strategies ("Latest", "Most Liked", "Most Viewed").
- **Project Submission (`POST /api/v1/projects`):** Enables authenticated users to submit projects complete with title, description, category, and technology tags.
- **Idempotent Like Engine (`POST /api/v1/projects/{id}/like`):** Tracks individual user likes in a dedicated relational join table (`project_likes`), preventing duplicate likes while atomically adjusting like totals.
- **View Analytics (`POST /api/v1/projects/{id}/view`):** Increments view counters when a user inspects project details.

### 5. Platform Intelligence & Metrics
- **Overview Telemetry (`GET /api/v1/stats/overview`):** High-speed aggregation endpoint returning live community counters for total developers, published blogs, submitted projects, and represented countries.

---

## 6. User Roles and Security Permissions

| Role | Description | Permissions & Privileges |
|---|---|---|
| **Anonymous Guest** | Unauthenticated site visitor | - Browse public landing page (`/`), About page (`/about`).<br>- Search and read published blogs (`GET /api/v1/blogs`).<br>- Explore projects and increment view counts (`GET /api/v1/projects`).<br>- Discover developer profiles (`GET /api/v1/developers`).<br>- Register and log in. |
| **Authenticated User (`ROLE_USER`)** | Registered community member with valid JWT | - All Anonymous Guest permissions.<br>- Create new blog posts and manage personal drafts (`POST /api/v1/blogs`, `GET /api/v1/blogs/drafts`).<br>- Edit and delete **only their own** blog posts.<br>- Submit new community projects (`POST /api/v1/projects`).<br>- Like / unlike community projects (`POST /api/v1/projects/{id}/like`).<br>- Connect / disconnect with other developers (`POST /api/v1/developers/{id}/connect`). |
| **Administrator (`ROLE_ADMIN`)** | Platform operations manager | - All Authenticated User permissions.<br>- Modify or delete any blog post or project regardless of authorship.<br>- Access administrative metrics and database inspection consoles. |

---

## 7. Artifact Verification Reference

All implementation details documented in this report are backed by verified visual and execution artifacts located in the repository:

- **SS-01 (Backend Execution):** [`docs/assignment-evidence/01_backend_running.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/01_backend_running.png)
- **SS-02 (REST Endpoint Output):** [`docs/assignment-evidence/02_rest_endpoint_output.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/02_rest_endpoint_output.png)
- **SS-03 (Automated Test Suite):** [`docs/assignment-evidence/03_junit_test_results.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/03_junit_test_results.png)
- **SS-04 (Project Architecture):** [`docs/assignment-evidence/04_project_structure.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/04_project_structure.png)
- **Page Visual Reference Cards:** [`docs/react_page_tables/`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables) (`page1_home.png` through `page9_about.png`).
