# DevSphere — Security & Database Readiness Report

**Document Type:** Application Security Audit, PostgreSQL Compatibility & Supabase Migration Readiness  
**Date:** 2026-10-31  
**Project:** DevSphere — Developer Community and Portfolio Platform  
**Target Environment:** Supabase Cloud PostgreSQL 15+ / Spring Boot 3.4.3 / Java 21  
**Audit Classification:** READ-ONLY Verification  

---

## 1. Application Security Assessment

### 1.1 Authentication & Token Lifecycle

| Security Dimension | Current Implementation | Risk Level | Evidence / Details | Recommended Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **JWT Secret Key** | Loaded via `${DEVSphere_JWT_SECRET:...}` with fallback hardcoded in `application.properties`. | **HIGH** | `devsphere.jwt.secret=4c9b1d75f284e60183b9e4a7d6c51829...` in line 29 of `application.properties`. If deployed without setting the environment variable, the secret is publicly known from source code. | Fail startup in production profile if `DEVSphere_JWT_SECRET` is unset or matches the default fallback. |
| **Token Revocation** | Stateless JJWT validation. No server-side blacklist or token version check. | **MODERATE** | Logout only returns a message. If a token is stolen or a user changes passwords, the token remains valid for 24 hours (`86400000 ms`). | Add `token_version` column to `users` table; verify version in `JwtAuthenticationFilter`. |
| **Token Storage** | Stored in browser `localStorage` (`jwt_token`). | **MODERATE** | Standard for single-page applications without server SSR, but vulnerable to XSS token theft if third-party scripts execute. | Protect against XSS; sanitize inputs; consider HTTP-only secure cookies with SameSite policy in production. |
| **Frontend Auth Bypass** | `Login.jsx` catches backend errors and signs user in locally anyway. | **CRITICAL** | `src/pages/Login.jsx` (lines 51–59). Allows arbitrary unauthenticated users into the authenticated client state. | Remove the catch-block fallback. Halt and display error message on non-200 responses. |
| **Password Storage on Failure** | `Signup.jsx` writes plaintext password into `localStorage("users")` on failure. | **HIGH** | `src/pages/Signup.jsx` (lines 64–68). Exposes user passwords to anyone with physical access or local script access. | Remove local password persistence. Never store raw passwords on the client. |
| **Password Hashing** | BCrypt password hashing in backend (`BCryptPasswordEncoder()`). | **VERIFIED / PASS** | Standard 10-round salted BCrypt implemented in `SecurityConfig.java` and `AuthServiceImpl.java`. | Retain existing BCrypt implementation. |

---

### 1.2 Authorization & Resource Ownership

| Endpoint / Operation | Current Authorization Mechanism | Vulnerability / Finding | Severity | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/blogs/{id}` | Public endpoint permitted in `SecurityConfig.java`. | Returns draft blogs to unauthenticated callers if ID is provided. Draft privacy is bypassed. | **HIGH** | In `BlogServiceImpl.getBlogById`, throw `ForbiddenException` if `status == DRAFT` and `currentUserId` is not the author or an admin. |
| `GET /api/v1/blogs/drafts` | Permitted in `SecurityConfig` because `/api/v1/blogs/**` is matched as public GET. | Filter chain allows request without token; only caught by service throwing `UnauthorizedException`. | **LOW** | Explicitly define `.requestMatchers("/api/v1/blogs/drafts").authenticated()` before `permitAll()` rule in `SecurityConfig`. |
| `PUT /api/v1/blogs/{id}` | Enforced in `BlogServiceImpl.verifyOwnershipOrAdmin`. | Validates that current user is the author or `ROLE_ADMIN`. | **VERIFIED / PASS** | Retain verified ownership logic. |
| `DELETE /api/v1/blogs/{id}` | Enforced in `BlogServiceImpl.verifyOwnershipOrAdmin`. | Validates author ownership or `ROLE_ADMIN`. | **VERIFIED / PASS** | Retain verified ownership logic. |
| `POST /api/v1/projects` | Authenticated in `SecurityConfig`. | Requires valid JWT token. Sets author to authenticated user. | **VERIFIED / PASS** | Retain verified logic. |
| `POST /api/v1/projects/{id}/like` | Authenticated in controller and service. | Requires authentication; throws 401 if unauthenticated. | **VERIFIED / PASS** | Retain verified logic. |
| `Developer Profile Updates` | Missing entirely. | No update endpoint exists. | **DEFECT** | Implement `PUT /api/v1/developers/me` with strict ownership enforcement (`developer.getUser().getId().equals(currentUserId)`). |

---

### 1.3 CORS, Injection & Input Validation

- **CORS Configuration:** Fully configured in `SecurityConfig.java` via `CorsConfigurationSource`. Permitted origins default to `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000` and are configurable via `DEVSphere_CORS_ORIGINS`. Preflight `OPTIONS` and credentials supported.
- **CSRF Protection:** Disabled in `SecurityConfig.java`. Because authentication relies on `Authorization: Bearer <token>` in request headers (and does not use ambient session cookies), CSRF attacks are fundamentally mitigated.
- **SQL Injection:** **Zero raw SQL concatenation detected.** All repository queries in `ProjectRepository`, `BlogRepository`, and `DeveloperProfileRepository` use JPQL/HQL parameterized bindings (`:category`, `:query`, `:id`).
- **Input Validation:** Backend uses `jakarta.validation.Valid` on `RegisterRequest`, `LoginRequest`, `CreateBlogRequest`, and `CreateProjectRequest`. Request constraints enforce non-blank strings and character size bounds.
- **Rate Limiting:** **Currently absent.** No rate-limiting filter or bucket algorithm protects `/api/v1/auth/login` (brute-force exposure) or `POST /api/v1/projects/{id}/view` (view counter gaming).

---

## 2. Active Datasource & Flyway Configuration

### 2.1 Configuration Analysis
DevSphere defines two database profiles:
1. **Production Configuration (`application.properties`):**
   - Active URL: `jdbc:postgresql://localhost:5432/devsphere`
   - Driver: `org.postgresql.Driver`
   - Hibernate DDL: `none`
   - Flyway: `spring.flyway.enabled=true`, baseline-on-migrate enabled.
2. **Development Profile (`application-dev.properties`):**
   - Active URL: `jdbc:h2:file:./data/devspheredb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1`
   - Driver: `org.h2.Driver`
   - Hibernate DDL: `spring.jpa.hibernate.ddl-auto=update`
   - Flyway: `spring.flyway.enabled=false`

**Key Finding:** Flyway migrations are currently tested only when running against PostgreSQL or production profiles. In daily dev mode, Hibernate auto-generates/updates the schema against the H2 file database.

---

## 3. Supabase PostgreSQL Compatibility & Schema Readiness

### 3.1 Migration Scripts Comparison
A side-by-side audit of `backend/src/main/resources/db/migration/V1__init_schema.sql` and `database/supabase_migration.sql` was conducted:

| Table / Constraint | Flyway Migration (`V1`) | Supabase Script (`database/`) | Compatibility Assessment |
| :--- | :--- | :--- | :--- |
| `users` | UUID PK, UNIQUE username, UNIQUE email | UUID PK, UNIQUE username, UNIQUE email | **100% MATCH** |
| `developer_profiles` | UUID PK, FK `users(id)` ON DELETE SET NULL | UUID PK, FK `users(id)` ON DELETE SET NULL | **100% MATCH** |
| `developer_skills` | Composite PK `(developer_id, skill)` | Composite PK `(developer_id, skill)` | **100% MATCH** |
| `blogs` | UUID PK, FK `users(id)` ON DELETE SET NULL | UUID PK, FK `users(id)` ON DELETE SET NULL | **100% MATCH** |
| `blog_tags` | Composite PK `(blog_id, tag)` | Composite PK `(blog_id, tag)` | **100% MATCH** |
| `projects` | UUID PK, FK `users(id)` ON DELETE SET NULL | UUID PK, FK `users(id)` ON DELETE SET NULL | **100% MATCH** |
| `project_technologies` | Composite PK `(project_id, technology)` | Composite PK `(project_id, technology)` | **100% MATCH** |
| `project_likes` | UUID PK, Composite UNIQUE `(project_id, user_id)` | UUID PK, Composite UNIQUE `(project_id, user_id)` | **100% MATCH** |
| `developer_connections`| UUID PK, Composite UNIQUE `(developer_id, user_id)` | UUID PK, Composite UNIQUE `(developer_id, user_id)` | **100% MATCH** |

**Conclusion:** The schema DDL in `V1__init_schema.sql` is **100% standard ANSI SQL/PostgreSQL compatible** and runs directly on Supabase PostgreSQL without modification.

---

## 4. Evaluation of Proposed Multi-Schema Design

The product prompt requested an evaluation of a proposed design:
> *One Supabase PostgreSQL database with logically separated schemas:*
> - `core` (users, authentication)
> - `developer` (developer_profiles, developer_skills, developer_connections)
> - `project` (projects, project_technologies, project_likes)
> - `blog` (blogs, blog_tags)

### 4.1 Technical Evaluation of the 4-Schema Proposal

| Dimension | Single Public Schema (`public.*`) | 4 Logical Schemas (`core`, `developer`, `project`, `blog`) | Recommendation |
| :--- | :--- | :--- | :--- |
| **Foreign Key Integrity** | Native foreign keys (`projects.author_id -> users.id`) work transparently. | Cross-schema foreign keys (`project.projects.author_id -> core.users.id`) are supported in PostgreSQL, but require schema-qualified DDL and search_path configuration. | **Public Schema is simpler and safer** |
| **Spring Data JPA & Hibernate** | No entity annotations needed. Standard `default` catalog and schema. | Requires explicit `@Table(name = "projects", schema = "project")` on every entity or dynamic search_path routing. | **Public Schema avoids JPA annotation debt** |
| **Cross-Domain Join Performance** | Single-query joins (`SELECT p, u FROM Project p JOIN p.author u`) optimize effortlessly. | Cross-schema joins require composite permission grants and complex query planning in PgBouncer. | **Public Schema prevents query degradation** |
| **Supabase Dashboard & Studio** | Supabase Studio displays tables in `public` schema automatically out of the box. | Non-public schemas (`core`, `developer`) are hidden by default in Supabase Studio unless explicitly toggled in settings. | **Public Schema is 100% native to Supabase** |
| **Database Transactions** | Single JDBC transaction spans all tables seamlessly. | Distributed or multi-schema boundaries increase complexity without providing distributed scaling benefits. | **Public Schema ensures ACID guarantees** |

### 4.2 Architectural Verdict on Schemas
**NOT RECOMMENDED AT THIS TIME.**  
Introducing 4 logical schemas (`core`, `developer`, `project`, `blog`) in a single Supabase PostgreSQL database adds configuration friction (JPA schema mappings, search paths, Supabase Studio UI visibility) while providing **zero distributed isolation benefits**, since all tables remain in the exact same physical database and connection pool.

**Recommended Approach:**  
Maintain all 9 tables in the standard Supabase `public` schema. Enforce modular domain boundaries in the **Java application package structure** (`com.devsphere.modules.auth`, `developer`, `project`, `blog`) rather than splitting database schemas prematurely.

---

## 5. Safest Phased Supabase PostgreSQL Migration Strategy

To transition DevSphere from local H2/PostgreSQL to Supabase Cloud PostgreSQL with zero data corruption:

### Phase 1: Environment & Connectivity Validation
1. Acquire Supabase connection string:
   ```
   DEVSphere_DB_URL=jdbc:postgresql://<project-ref>.supabase.co:5432/postgres?sslmode=require
   DEVSphere_DB_USERNAME=postgres.<project-ref>
   DEVSphere_DB_PASSWORD=<strong-database-password>
   ```
2. Verify SSL requirements (`sslmode=require`) in JDBC URL.

### Phase 2: Schema Migration via Flyway
1. Set `spring.profiles.active=prod` in production or environment variable `SPRING_PROFILES_ACTIVE=prod`.
2. Enable Flyway: `spring.flyway.enabled=true`.
3. Flyway executes `V1__init_schema.sql`, creating the 9 tables, indexes, and unique constraints.
4. Flyway records the migration hash in `flyway_schema_history`.

### Phase 3: Data Migration & Seed Alignment
1. **Critical Pre-requisite:** Fix seed data mismatch before loading initial records:
   - For every project with initial likes (e.g. 128 likes), generate corresponding rows in `project_likes` or initialize likes counter to match existing like rows.
   - For every seeded developer, link `user_id` to a valid record in `users` so profiles are not orphaned.
2. Execute data loading via `V2__seed_devsphere_data.sql` or Supabase SQL Editor.

### Phase 4: Production Verification Gate
1. Execute `mvn test -Dspring.profiles.active=prod` against a staging Supabase instance.
2. Run `ProjectConcurrencyTest` against Supabase to prove transaction serialization under cloud network latency.
3. Validate Supabase PgBouncer connection pooling limits.

