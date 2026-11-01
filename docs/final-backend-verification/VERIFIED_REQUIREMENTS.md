# DevSphere Backend: Verified Requirements Specification

**Document Version:** 1.0.0 (Pre-Implementation Baseline)  
**Target Codebase:** DevSphere Full Stack Platform  
**Auditor:** Principal Software Architect & QA Specialist  
**Status:** Formally Verified Against Active Source Code & Test Execution  
**Date:** October 2026  

---

## 1. Executive Summary

This document enumerates the architectural requirements, security configurations, and database constraints that have been **empirically verified in the active DevSphere codebase**. 

Unlike proposed future specifications, every item in this document has been proven present through source code inspection, configuration file audit, and automated test execution.

---

## 2. Verified Architectural & Framework Standards

### 2.1 Layered Monolith Design Pattern
* **Verified Location:** `backend/src/main/java/com/devsphere/`
* **Verification Finding:** The application strictly follows a clean 4-tier layered monolith architecture:
  * **API Layer:** `controller/` (`AuthController`, `BlogController`, `DeveloperController`, `ProjectController`, `StatsController`)
  * **Service Layer:** `service/` & `service/impl/` (`AuthServiceImpl`, `BlogServiceImpl`, etc.)
  * **Data Access Layer:** `repository/` (Spring Data JPA interfaces extending `JpaRepository`)
  * **Domain Layer:** `entity/` (`User`, `DeveloperProfile`, `Blog`, `Project`, etc.)
* **Status:** **`VERIFIED`**

### 2.2 Primary Key Strategy & Entity Identification
* **Verified Location:** `BaseEntity.java:L20-L24`, `V1__init_schema.sql`
* **Verification Finding:** All primary keys utilize standard RFC-4122 `UUID` identifiers generated via `@GeneratedValue(strategy = GenerationType.UUID)`:
  ```java
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  ```
  This eliminates sequential integer enumeration vulnerabilities and prevents ID collision during testing.
* **Status:** **`VERIFIED`**

### 2.3 Open-Session-In-View (OSIV) Disabled
* **Verified Location:** `backend/src/main/resources/application.properties:L21`
* **Verification Finding:**
  ```properties
  spring.jpa.open-in-view=false
  ```
  The persistence context is strictly terminated at the service layer boundary. Lazy-loading exceptions are prevented because all entity-to-DTO mappings (`EntityDtoMapper`) are executed inside `@Transactional` service methods before reaching web controllers.
* **Status:** **`VERIFIED`**

---

## 3. Verified Security & Authentication Infrastructure

### 3.1 Backend CORS Credentials Configuration
* **Verified Location:** `SecurityConfig.java:L70-L81`
* **Verification Finding:**
  ```java
  configuration.setAllowedOrigins(allowedOrigins); // http://localhost:5173
  configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
  configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
  configuration.setAllowCredentials(true);
  configuration.setMaxAge(3600L);
  ```
  The Spring Boot backend is **already configured to accept cross-origin credentials (`Access-Control-Allow-Credentials: true`)**. This confirms that once the React client adds `credentials: 'include'`, cookies will be processed without CORS configuration errors.
* **Status:** **`VERIFIED`**

### 3.2 Stateless Session Management & BCrypt Password Hashing
* **Verified Location:** `SecurityConfig.java:L53, L88`
* **Verification Finding:**
  * Password encoder bean: `new BCryptPasswordEncoder()` (standard 10-round salt).
  * Session creation policy: `SessionCreationPolicy.STATELESS` (prevents in-memory HTTP session accumulation).
  * CSRF disabled for stateless REST endpoints (`csrf(AbstractHttpConfigurer::disable)`).
* **Status:** **`VERIFIED`**

### 3.3 Authenticated User Resolution on Every Request
* **Verified Location:** `JwtAuthenticationFilter.java:L42-L48`, `CustomUserDetailsService.java:L33-L38`
* **Verification Finding:**
  ```java
  UUID userId = tokenProvider.getUserIdFromToken(jwt);
  UserDetails userDetails = userDetailsService.loadUserById(userId);
  ```
  `userDetailsService.loadUserById(userId)` calls `userRepository.findById(userId)` on every authenticated request.
  **Architectural Implication:** Validating `token_version` requires **zero additional database round-trips**, as the `User` entity is already loaded into memory.
* **Status:** **`VERIFIED`**

---

## 4. Verified Database Constraints & Schema Invariants

### 4.1 Unique Like Constraint (`uq_project_user_like`)
* **Verified Location:** `backend/src/main/resources/db/migration/V1__init_schema.sql:L88`
* **Verification Finding:**
  ```sql
  CREATE TABLE IF NOT EXISTS project_likes (
      id UUID PRIMARY KEY,
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_project_user_like UNIQUE (project_id, user_id)
  );
  ```
  The database physically prevents duplicate likes from the same user for the same project. Any attempt to insert a duplicate throws `DataIntegrityViolationException`.
* **Status:** **`VERIFIED`**

### 4.2 Unique Developer Connection Constraint (`uq_dev_user_connection`)
* **Verified Location:** `backend/src/main/resources/db/migration/V1__init_schema.sql:L96`
* **Verification Finding:**
  ```sql
  CONSTRAINT uq_dev_user_connection UNIQUE (developer_id, user_id)
  ```
  Duplicate connections between a developer profile and user account are rejected at the database engine level.
* **Status:** **`VERIFIED`**

### 4.3 Unique User Credentials
* **Verified Location:** `backend/src/main/resources/db/migration/V1__init_schema.sql:L5-L6`
* **Verification Finding:**
  * `users.username` has a `UNIQUE` constraint.
  * `users.email` has a `UNIQUE` constraint.
  * B-tree indexes `idx_users_email` and `idx_users_username` are explicitly declared.
* **Status:** **`VERIFIED`**

---

## 5. Verified Test Suite Execution (26 Passed)

* **Execution Harness:** Maven Surefire 3.4.3 via `mvn test`
* **Test Environment:** Java 21 / 25, H2 PostgreSQL-compatible mode
* **Execution Timestamp:** 2026-10-30T18:37:20+05:30
* **Execution Duration:** 21.465 seconds
* **Results:** **Tests run: 26, Failures: 0, Errors: 0, Skipped: 0 (BUILD SUCCESS)**

### Verified Passing Test Inventory:
1. `AuthControllerTest.register_Success` - HTTP 201 Created on valid registration
2. `AuthControllerTest.register_DuplicateEmail_Conflict` - HTTP 409 on existing email
3. `AuthControllerTest.login_Success` - HTTP 200 with JWT response on valid credentials
4. `AuthControllerTest.login_BadCredentials` - HTTP 401 on invalid password
5. `BlogControllerTest.getBlogs_Success` - HTTP 200 with paginated blogs
6. `BlogControllerTest.getBlogById_Success` - HTTP 200 for existing blog UUID
7. `BlogControllerTest.getBlogById_NotFound` - HTTP 404 for missing blog UUID
8. `DeveloperControllerTest.getDevelopers_Success` - HTTP 200 with paginated profiles
9. `DeveloperControllerTest.getDeveloperById_Success` - HTTP 200 for existing profile
10. `ProjectControllerTest.getProjects_Success` - HTTP 200 with paginated projects
11. `ProjectControllerTest.getProjectById_Success` - HTTP 200 for existing project
12. `ProjectControllerTest.incrementView_Success` - HTTP 200 on view increment call
13. `AuthServiceTest.register_CreatesUser` - Service layer registration logic
14. `AuthServiceTest.register_ThrowsOnDuplicateEmail` - Service exception propagation
15. `AuthServiceTest.login_ReturnsToken` - Authentication token generation
16. `AuthServiceTest.login_ThrowsOnBadCredentials` - BadCredentialsException handling
17. `AuthServiceTest.getCurrentUser_ReturnsUserResponse` - Principal extraction
18. `BlogServiceTest.getBlogs_ReturnsPagedResponse` - Blog search and pagination
19. `BlogServiceTest.getBlogById_ReturnsBlogResponse` - Single blog fetch
20. `BlogServiceTest.createBlog_PersistsBlog` - Blog persistence
21. `BlogServiceTest.deleteBlog_RemovesBlog` - Blog deletion
22. `ProjectServiceTest.getProjects_ReturnsPagedResponse` - Project search and pagination
23. `ProjectServiceTest.getProjectById_ReturnsProjectResponse` - Single project fetch
24. `ProjectServiceTest.toggleLike_LikesAndUnlikes` - Toggle like business logic
25. `ProjectServiceTest.incrementViews_IncrementsCount` - Single-threaded view increment
26. `DevSphereIntegrationTest.contextLoads` - Full Spring application context bootstrap

* **Status:** **`VERIFIED`**

---

## 6. Verification Summary Table

| Requirement / Component | Verification Mechanism | Source File Reference | Audit Verdict |
| :--- | :--- | :--- | :---: |
| **Layered Monolith Architecture** | Codebase structure inspection | `com.devsphere.*` | **VERIFIED** |
| **UUID Primary Keys** | JPA annotations & DDL inspection | `BaseEntity.java:L20` | **VERIFIED** |
| **OSIV Disabled** | Properties audit | `application.properties:L21` | **VERIFIED** |
| **CORS Credentials Enabled** | Security configuration audit | `SecurityConfig.java:L75` | **VERIFIED** |
| **Stateless Authentication** | Security filter chain audit | `SecurityConfig.java:L88` | **VERIFIED** |
| **Per-Request User Lookup** | Security filter audit | `JwtAuthenticationFilter.java:L44` | **VERIFIED** |
| **Unique Like Constraint** | Flyway V1 schema audit | `V1__init_schema.sql:L88` | **VERIFIED** |
| **Unique Connection Constraint** | Flyway V1 schema audit | `V1__init_schema.sql:L96` | **VERIFIED** |
| **Unit & Integration Regression** | Maven test execution (`mvn test`) | 8 Test Classes (26 Tests) | **VERIFIED (26/26)** |
