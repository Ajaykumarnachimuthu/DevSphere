# DevSphere — Complete Change Audit & Database Configuration Verification

**Audit Scope:** Git Change History, Database Configurations, Maven Dependencies, DevSphere Preservation, Security Review & Microservices Integration  
**Audit Mode:** Strict Read-Only Deep Technical Audit  
**Workspace:** `C:\Users\N.AJAYKUMAR\Full Stack Proojects`  
**Execution Timestamp:** 2026-10-30T21:51:30+05:30  
**Auditor:** Principal Software Auditor, Senior Spring Boot Architect, Database Specialist & QA Reviewer  

---

## 1. Executive Summary

This independent audit evaluated every modification, newly created file, deleted artifact, database configuration, dependency update, and architectural boundary across the DevSphere workspace.

### Core Audit Verdicts:
1. **Git Change Integrity:** The Git commit history reveals that the repository originated as a React frontend MPA. Spring Boot backend (`backend/`), microservices (`microservices/`), and documentation suites (`docs/`) were introduced in subsequent engineering phases.
2. **Original DevSphere Preservation:** **UNCOMPROMISED.** DevSphere's core backend suite runs **26 automated tests with 0 failures and 0 errors** (`BUILD SUCCESS` in 30.7s). All 9 original React routes (`/`, `/developers`, `/developer-profile`, `/projects`, `/about`, `/blogs`, `/write-blog`, `/login`, `/signup`) remain mounted and fully operational.
3. **Database Configurations & Reality:**
   - **DevSphere Core (Port 8080):** Configured for PostgreSQL on port 5432 with Flyway migrations. **Port 5432 is currently OFFLINE / unreachable** on localhost (`TcpTestSucceeded : False`). DevSphere automatically and seamlessly utilizes its embedded file-based PostgreSQL-mode H2 database (`./data/devspheredb`) via its active `dev` profile.
   - **Course Service (Port 8081):** Active on H2 in-memory (`jdbc:h2:mem:coursedb`), successfully seeding 4 courses on startup.
   - **User Service (Port 8082):** Configured for MySQL with an automated in-memory H2 fallback in MySQL compatibility mode (`MODE=MySQL`). **MySQL is actively running on port 3306** (`TcpTestSucceeded : True`), but by default without environment variables, the service uses the H2 fallback to ensure zero-downtime execution.
   - **Enquiry Service (Port 8083):** Active on H2 in-memory (`jdbc:h2:mem:enquirydb`). **It provides runtime-only persistence; data does NOT survive JVM restarts.**
4. **Unexpected Artifacts:** Three orphan prototyping directories (`course-service/`, `user-service/`, `enquiry-service/` at the workspace root) were created during intermediate prototyping and left uncleaned when the final implementation was consolidated into `microservices/`.

---

## 2. Git Change History Audit

### Repository Commit Baseline
* **Latest Commit:** `399c594 fix(deployment): configure vercel.json and vite dist flattener for Vercel MPA hosting`
* **Preceding Commits:**
  - `4a3af2a` feat: complete Vite MPA progressive enhancement with React islands, reports, and documentation
  - `2162652` added java script
  - `7b9a5fd` added blog pages and blog wrting page
  - `cab71b5` added blog page
  - `9f532a0` added login and signup page
  - `1e0c25c` completed landing page

### Git Working Tree Status (`git status --short`)
```
 M .vscode/settings.json
 D DevSphere_JavaScript_Report.txt
 D DevSphere_React_Migration_Source.txt
 D DevSphere_React_Page_Component_Analysis.txt
 D DevSphere_Technology_Report.md
 M README.md
 M frontend/Projects.css
 M index.html
 M src/App.jsx
 M src/components/cards/BlogCard.jsx
 M src/components/cards/DeveloperCard.jsx
 M src/components/cards/ProjectCard.jsx
 M src/components/layout/Footer.jsx
 M src/components/layout/Navbar.jsx
 M src/context/DevSphereContext.jsx
 M src/islands/... (8 island files)
 M src/pages/About.jsx
 M src/pages/Home.jsx
 M src/pages/Login.jsx
 M src/pages/Projects.jsx
 M src/pages/Signup.jsx
 M src/styles.css
 M vite.config.js
?? .env.example
?? backend/
?? course-service/
?? database/
?? docs/
?? microservices/
?? scripts/
?? src/pages/Contact.jsx
?? src/pages/Courses.jsx
?? src/pages/SkillHubAuth.jsx
?? src/services/
?? user-service/
```

---

## 3. Comprehensive File Change Classification

| File / Directory Path | Change Type | Original Purpose | Current Purpose | Reason for Change | Expected / Unexpected |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/App.jsx` | **MODIFIED** | Central React router for 9 DevSphere routes | Router registering 9 DevSphere + 3 Microservice routes | Mount `/courses`, `/contact`, `/skillhub-auth` | **EXPECTED** |
| `src/components/layout/Navbar.jsx` | **MODIFIED** | Main DevSphere navigation header | Navigation header with Courses & Contact tabs | Expose new services to users | **EXPECTED** |
| `src/pages/Courses.jsx` | **NEW FILE (UNTRACKED)** | Did not exist | Course discovery page fetching from port 8081 | Microservices requirement | **EXPECTED** |
| `src/pages/Contact.jsx` | **NEW FILE (UNTRACKED)** | Did not exist | Enquiry form submitting to port 8083 | Microservices requirement | **EXPECTED** |
| `src/pages/SkillHubAuth.jsx` | **NEW FILE (UNTRACKED)** | Did not exist | Tabbed BCrypt authentication UI (Port 8082) | Microservices requirement | **EXPECTED** |
| `microservices/course-service/` | **NEW DIR (UNTRACKED)** | Did not exist | Independent Spring Boot Course app (Port 8081) | Course Service requirement | **EXPECTED** |
| `microservices/user-service/` | **NEW DIR (UNTRACKED)** | Did not exist | Independent Spring Boot User app (Port 8082) | User Service requirement | **EXPECTED** |
| `microservices/enquiry-service/`| **NEW DIR (UNTRACKED)** | Did not exist | Independent Spring Boot Enquiry app (Port 8083) | Enquiry Service requirement | **EXPECTED** |
| `docs/microservices-practical/` | **NEW DIR (UNTRACKED)** | Did not exist | Dedicated practical evidence & audit records | Documentation requirement | **EXPECTED** |
| `scripts/verify_microservices.ps1`| **NEW FILE (UNTRACKED)**| Did not exist | Automated test runner for 3 microservices | Verification automation | **EXPECTED** |
| `backend/` | **UNTRACKED DIR** | Core DevSphere Backend (added post-git commit) | Full DevSphere Spring Boot Backend (Port 8080) | Established backend baseline | **EXPECTED (BASELINE)** |
| `database/` | **UNTRACKED DIR** | Supabase migration SQL (created Oct 27) | Reference SQL schemas & database README | Pre-existing baseline | **EXPECTED (BASELINE)** |
| `course-service/` (root) | **UNTRACKED DIR** | Intermediate scratch directory | Leftover orphan classes (no root pom.xml) | Incomplete cleanup from prototyping | **UNEXPECTED (ORPHAN)** |
| `user-service/` (root) | **UNTRACKED DIR** | Intermediate scratch directory | Leftover orphan classes (no root pom.xml) | Incomplete cleanup from prototyping | **UNEXPECTED (ORPHAN)** |
| `enquiry-service/` (root) | **UNTRACKED DIR** | Intermediate scratch directory | Leftover empty directory | Incomplete cleanup from prototyping | **UNEXPECTED (ORPHAN)** |
| `src/pages/Home.jsx`, `About.jsx`, etc. | **MODIFIED** | Early HTML-style pages | Enhanced UI styling & islands integration | Pre-existing frontend work | **EXPECTED (PRE-EXISTING)** |
| `DevSphere_*_Report.txt` (4 files) | **DELETED** | Early assignment documentation | Removed during documentation cleanup | Pre-existing documentation audit | **EXPECTED (PRE-EXISTING)** |

---

## 4. Unexpected Changes & Orphan Artifacts

### Finding 1: Root Duplicate Microservice Directories
* **Affected Paths:**
  - `course-service/` (Created: 30-10-2026 19:30:45)
  - `user-service/` (Created: 30-10-2026 19:33:11)
  - `enquiry-service/` (Created: 30-10-2026 19:36:03)
* **Analysis:** These three directories were initialized at the root level during initial prototyping before the implementation was properly consolidated into the dedicated `microservices/` directory at 19:38. They do not contain root `pom.xml` files and are not referenced by any build script or frontend component.
* **Impact:** Non-breaking, but creates duplicate clutter at the project root.
* **Recommendation:** Safe to delete once the user approves, but left untouched per strict read-only audit rules.

---

## 5. Database Configuration Audit

### A. DevSphere Core (Port 8080)
* **Configuration Source:** `backend/src/main/resources/application.properties` and `application-dev.properties`
* **Configured Production URL:** `jdbc:postgresql://localhost:5432/devsphere`
* **Driver:** `org.postgresql.Driver`
* **Live Port 5432 Test Result:** **FAILED (OFFLINE).** `Test-NetConnection -Port 5432` failed to establish a TCP connection.
* **Active Runtime Fallback:** Because the `dev` profile is active by default (`spring.profiles.active=dev`), the application seamlessly connects to:
  `jdbc:h2:file:./data/devspheredb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1`
* **JPA/Hibernate DDL:** `update` (in dev), `none` (in prod).
* **Flyway Migrations:** Enabled for PostgreSQL (`V1__init_schema.sql`, `V2__seed_devsphere_data.sql`). Disabled in H2 file dev mode to avoid dialect clashes.

### B. Course Service (Port 8081)
* **Configuration Source:** `microservices/course-service/src/main/resources/application.properties`
* **Configured URL:** `jdbc:h2:mem:coursedb`
* **Driver:** `org.h2.Driver`
* **Active Database:** H2 In-Memory.
* **Persistence Type:** In-Memory (Volatile). Resets completely upon JVM restart.
* **Console:** Enabled at `http://localhost:8081/h2-console`.

### C. User Service (Port 8082)
* **Configuration Source:** `microservices/user-service/src/main/resources/application.properties`
* **Configured Datasource:**
  `spring.datasource.url=${MYSQL_URL:jdbc:h2:mem:skillhub_users;MODE=MySQL;DB_CLOSE_DELAY=-1}`
  `spring.datasource.driver-class-name=${MYSQL_DRIVER:org.h2.Driver}`
* **Live Port 3306 Test Result:** **SUCCESS (LISTENING).** MySQL daemon is running on port 3306 (`TcpTestSucceeded : True`).
* **Active Database:** **In-memory H2 with MySQL compatibility mode (`MODE=MySQL`)** by default, because `MYSQL_URL` is not set in the process environment.
* **Connecting to Live MySQL:** Setting `MYSQL_URL=jdbc:mysql://localhost:3306/skillhub_users` and `MYSQL_DRIVER=com.mysql.cj.jdbc.Driver` switches the service to live MySQL immediately using the bundled `mysql-connector-j` driver.
* **Credentials:** No hardcoded passwords in repository. Uses parameterized defaults (`sa` / empty password for H2).

### D. Enquiry Service (Port 8083)
* **Configuration Source:** `microservices/enquiry-service/src/main/resources/application.properties`
* **Configured URL:** `jdbc:h2:mem:enquirydb`
* **Driver:** `org.h2.Driver`
* **Active Database:** H2 In-Memory.
* **Persistence Type:** In-Memory (Volatile). Records persist during JVM runtime, but **do not survive application restarts**.
* **Console:** Enabled at `http://localhost:8083/h2-console`.

---

## 6. Complete Database Architecture Summary

| Service | Port | Configured Database | Driver Class | Active Database | Active JDBC URL | Persistence Type |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **DevSphere Core** | 8080 | PostgreSQL (Primary) / H2 File (Dev) | `org.h2.Driver` (active dev) | Embedded H2 (PostgreSQL Mode) | `jdbc:h2:file:./data/devspheredb` | **Persistent Disk File** |
| **Course Service** | 8081 | H2 In-Memory | `org.h2.Driver` | H2 In-Memory | `jdbc:h2:mem:coursedb` | **In-Memory (Volatile)** |
| **User Service** | 8082 | MySQL (Primary) / H2 In-Memory (Fallback)| `org.h2.Driver` (fallback) | H2 In-Memory (MySQL Mode) | `jdbc:h2:mem:skillhub_users` | **In-Memory (Volatile)** |
| **Enquiry Service** | 8083 | H2 In-Memory | `org.h2.Driver` | H2 In-Memory | `jdbc:h2:mem:enquirydb` | **In-Memory (Volatile)** |

---

## 7. Maven Dependency Audit

| Dependency Artifact | Target Project | Original Status | Current Status | Purpose | Necessity Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `spring-boot-starter-web` | `course-service` | Not Present | **NEW** | REST API endpoints | **Necessary** |
| `spring-boot-starter-data-jpa` | `course-service` | Not Present | **NEW** | JPA entity persistence | **Necessary** |
| `com.h2database:h2` | `course-service` | Not Present | **NEW** | In-memory relational storage | **Necessary** |
| `spring-boot-starter-test` | `course-service` | Not Present | **NEW** | JUnit 5 & Mockito test suite | **Necessary** |
| `spring-security-crypto` | `user-service` | Not Present | **NEW** | BCrypt password hashing | **Necessary (Mandatory)** |
| `com.mysql:mysql-connector-j` | `user-service` | Not Present | **NEW** | Production MySQL database driver | **Necessary (Mandatory)** |
| `com.h2database:h2` | `user-service` | Not Present | **NEW** | Zero-downtime test/dev fallback | **Necessary** |
| `spring-boot-starter-data-jpa` | `enquiry-service` | Not Present | **NEW** | Enquiry entity persistence | **Necessary** |
| `com.h2database:h2` | `enquiry-service` | Not Present | **NEW** | In-memory relational storage | **Necessary** |
| `org.postgresql:postgresql` | `backend/` | Baseline | **UNMODIFIED** | DevSphere Core PostgreSQL driver | **Necessary** |
| `flyway-core`, `flyway-database-postgresql` | `backend/` | Baseline | **UNMODIFIED** | DevSphere Core migrations | **Necessary** |
| `jjwt-api`, `jjwt-impl`, `jjwt-jackson` | `backend/` | Baseline | **UNMODIFIED** | DevSphere Core JWT security | **Necessary** |

*Note: No duplicate, unapproved, or conflicting dependencies exist. Spring Boot versions are 3.4.3 for `backend/` (Java 21) and 3.2.2 for the microservices (Java 17).*

---

## 8. Original DevSphere Functionality Preservation

| DevSphere Component | Location | Test / Audit Status | Findings |
| :--- | :--- | :--- | :--- |
| **DevSphere Spring Boot App** | `backend/src/main/` | **26 Tests PASS (0 Failures)** | All core controllers, services, repositories intact |
| **PostgreSQL Schema & Migrations** | `backend/.../db/migration/` | **VERIFIED** | `V1__init_schema.sql` & `V2__seed_devsphere_data.sql` untouched |
| **JWT Authentication** | `com.devsphere.security` | **VERIFIED** | Session/token issuance untouched; separated from microservices |
| **Projects Module** | `backend/` & `src/pages/Projects.jsx`| **VERIFIED** | `ProjectServiceTest` (4 passed), frontend project cards intact |
| **Blogs Module** | `backend/` & `src/pages/Blogs.jsx` | **VERIFIED** | `BlogServiceTest` (4 passed), markdown reader intact |
| **Developers Directory** | `src/pages/Developers.jsx` | **VERIFIED** | Profiles, tech tags, and filters intact |
| **DevSphere Navbar** | `src/components/layout/Navbar.jsx` | **VERIFIED** | All original links preserved; Courses and Contact added smoothly |
| **React Router** | `src/App.jsx` | **VERIFIED** | All 9 original routes preserved; 3 new routes added |

---

## 9. Security Audit Findings

| Category | Component / Property | Audit Finding | Severity | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Hardcoded Secrets** | `backend/application.properties` | Fallback JWT secret present for offline dev if env var absent | Low (Dev Only) | Set `DEVSphere_JWT_SECRET` in production |
| **Database Passwords** | All services | Parameterized with environment variable fallbacks | Clean | No sensitive credentials exposed in repo |
| **Password Hashing** | `user-service/UserService.java` | Passwords hashed using `BCryptPasswordEncoder` prior to DB save | Clean | Properly implemented |
| **Credential Sanitization**| `user-service/UserResponse.java` | DTO contains only `id`, `name`, `email`; excludes passwords | Clean | No password or hash exposed in REST responses |
| **CORS Policy** | Microservice Controllers | `@CrossOrigin(origins = "http://localhost:5173")` | Clean | Restricted strictly to the local React dev server |

---

## 10. Build and Test Execution Results

| Test Target | Command | Result | Metrics | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Course Service** | `mvn test` in `microservices/course-service` | `Tests: 3, Failures: 0, Errors: 0` | 12.59s | **PASS** |
| **User Service** | `mvn test` in `microservices/user-service` | `Tests: 4, Failures: 0, Errors: 0` | 16.25s | **PASS** |
| **Enquiry Service** | `mvn test` in `microservices/enquiry-service` | `Tests: 3, Failures: 0, Errors: 0` | 17.38s | **PASS** |
| **DevSphere Core** | `mvn test` in `backend` | `Tests: 26, Failures: 0, Errors: 0` | 30.70s | **PASS** |
| **React Frontend** | `npm run build` in root | `✓ 69 modules transformed` | 5.45s | **PASS** |
| **Live Microservices** | `scripts/verify_microservices.ps1` | `All 8 live tests passed` | Exit 0 | **PASS** |

---

## 11. Unverified Items

1. **Physical Screenshot Images:** 0 of the 22 screenshot image files are present in the repository (instructions and checklist are fully documented).
2. **PostgreSQL 5432 Live Connectivity:** PostgreSQL daemon on port 5432 is offline, so live connections against a running PostgreSQL server could not be tested; the backend relied on its verified file-based H2 PostgreSQL-mode fallback.

---

## 12. Final Verdict: **ACCEPTABLE**

### Justification:
* **All functional and architectural requirements are met.**
* **Zero regressions occurred in the existing DevSphere application** (all 26 backend unit tests pass, and React build succeeds with 0 errors).
* **Database architectures are clearly segregated:** DevSphere on port 8080 uses file-based H2 in PostgreSQL mode (with PostgreSQL configuration ready for production), while microservices run on independent ports 8081, 8082, and 8083 without collisions.
* **The orphan directories (`course-service/`, `user-service/`, `enquiry-service/` at the root)** do not impact the build or execution and can be safely deleted at user discretion.
