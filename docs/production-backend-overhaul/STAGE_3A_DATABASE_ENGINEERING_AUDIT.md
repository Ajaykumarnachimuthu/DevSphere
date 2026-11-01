# DevSphere Stage 3A: Database Engineering, Schema Ownership, Persistence & Migration Audit

**Project:** DevSphere — Developer Community & Portfolio Platform  
**Document Type:** Database Engineering & Migration Audit Report (Read-Only Investigation)  
**Author:** Principal Software Architect, Senior Spring Boot Specialist & PostgreSQL Database Architect  
**Date:** 2026-10-31  
**Status:** AUDIT COMPLETED — PENDING STAGE 3B APPROVAL  

---

## 1. Executive Summary

As part of the **DevSphere Production Backend Overhaul**, this Stage 3A Audit investigated the database engineering, data ownership, schema persistence, transaction boundaries, and migration integrity of the DevSphere application.

### Key Audit Findings:
1. **Disjointed Persistence Topologies:**
   - **DevSphere Core (`backend/`):** Configured for PostgreSQL (`jdbc:postgresql://localhost:5432/devsphere`) with Flyway migrations (`V1__init_schema.sql`, `V2__seed_devsphere_data.sql`). When running locally without an active PostgreSQL daemon, it falls back to an embedded file-based persistent H2 database in PostgreSQL mode (`./data/devspheredb.mv.db`), preserving records across restarts.
   - **Microservices (`developer-service`, `project-service`, `blog-service`):** Configured with ephemeral in-memory H2 databases (`jdbc:h2:mem:*`). All user-created data in these microservices is discarded upon process restart.
2. **Data Ownership & Boundary Mismatch:**
   - The Core backend currently owns and manages **all 8 relational tables** (`users`, `developer_profiles`, `developer_skills`, `developer_connections`, `projects`, `project_technologies`, `project_likes`, `blogs`, `blog_tags`).
   - The autonomous microservices duplicate three of these domains (`developer_profiles`, `projects`, `blogs`) using simplified schemas that omit foreign keys (`user_id`, `author_id`), omit interaction tracking tables (`project_likes`, `developer_connections`), and lack database constraints.
3. **Severe Concurrency Flaws in Views and Likes:**
   - Both Core and Microservices utilize unsafe Java-level read-modify-write patterns (`entity.setViews(entity.getViews() + 1); repository.save(entity);`), resulting in lost updates under concurrent traffic.
   - In `project-service` (microservice), like counts are incremented without recording user IDs, permitting unrestricted duplicate likes from single users.
4. **Hard-Coded Developer Metrics:**
   - `DeveloperServiceImpl` computes developer profile activity metrics using hardcoded numbers (`projectsCount = 12; blogsCount = 24; displayConnections = 186 + ...`), completely ignoring actual persisted database records.

---

## 2. Verified Current Database Architecture & Active Datasources

| Component | Port | Configured URL | Active Engine (Verified) | Persistence Guarantee | Flyway Managed |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **DevSphere Core** | `8080` | `jdbc:postgresql://localhost:5432/devsphere`<br>*(Fallback: `jdbc:h2:file:./data/devspheredb`)* | **H2 File-Based (`devspheredb.mv.db`)** *(PostgreSQL port 5432 not listening on host)* | **Persistent** (Saved to disk at `./data/devspheredb.mv.db`, 68 KB) | Yes (`classpath:db/migration`) |
| **Developer Service** | `8081` | `jdbc:h2:mem:developerdb;DB_CLOSE_DELAY=-1` | **H2 In-Memory** | **Volatile** (Destroyed on JVM exit) | No (`ddl-auto=update`) |
| **Project Service** | `8082` | `jdbc:h2:mem:projectdb;DB_CLOSE_DELAY=-1` | **H2 In-Memory** | **Volatile** (Destroyed on JVM exit) | No (`ddl-auto=update`) |
| **Blog Service** | `8083` | `jdbc:h2:mem:blogdb;DB_CLOSE_DELAY=-1` | **H2 In-Memory** | **Volatile** (Destroyed on JVM exit) | No (`ddl-auto=update`) |

---

## 3. Complete Database and Table Inventory

The authoritative relational schema is defined in [V1__init_schema.sql](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/resources/db/migration/V1__init_schema.sql):

```
                               +---------------+
                               |     users     |
                               | (PK: id UUID) |
                               +-------+-------+
                                       |
          +----------------------------+----------------------------+
          | 1:N                        | 1:N                        | 1:N
          v                            v                            v
+--------------------+       +--------------------+       +--------------------+
| developer_profiles |       |      projects      |       |       blogs        |
| (PK: id UUID)      |       | (PK: id UUID)      |       | (PK: id UUID)      |
| FK: user_id        |       | FK: author_id      |       | FK: author_id      |
+---------+----------+       +---------+----------+       +---------+----------+
          | 1:N                        | 1:N                        | 1:N
          +--> developer_skills        +--> project_technologies    +--> blog_tags
          |                            |
          +--> developer_connections   +--> project_likes
               (FK: user_id)                (FK: user_id)
```

### Table Specification & Constraint Matrix

| Table Name | Primary Key | Foreign Keys | Unique Constraints | Indexes | Owning Entity (`backend/`) | Owning Entity (`microservices/`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | `id UUID` | *None* | `username`, `email` | `idx_users_email`, `idx_users_username` | `com.devsphere.entity.User` | *None* |
| `developer_profiles` | `id UUID` | `user_id -> users(id)` | *None* | `idx_dev_name` | `com.devsphere.entity.DeveloperProfile` | `com.devsphere.developerservice.DeveloperProfile` |
| `developer_skills` | `(developer_id, skill)` | `developer_id -> developer_profiles(id)` | Composite PK | Composite PK | `@ElementCollection` in `DeveloperProfile` | `@ElementCollection` in `DeveloperProfile` |
| `developer_connections` | `id UUID` | `developer_id -> developer_profiles(id)`<br>`user_id -> users(id)` | `(developer_id, user_id)` | Composite Unique | `com.devsphere.entity.DeveloperConnection` | *Not implemented in microservice* |
| `projects` | `id UUID` | `author_id -> users(id)` | *None* | `idx_projects_category`, `idx_projects_likes`, `idx_projects_views` | `com.devsphere.entity.Project` | `com.devsphere.projectservice.Project` |
| `project_technologies` | `(project_id, technology)` | `project_id -> projects(id)` | Composite PK | Composite PK | `@ElementCollection` in `Project` | `@ElementCollection` in `Project` |
| `project_likes` | `id UUID` | `project_id -> projects(id)`<br>`user_id -> users(id)` | `(project_id, user_id)` | Composite Unique | `com.devsphere.entity.ProjectLike` | *Not implemented in microservice* |
| `blogs` | `id UUID` | `author_id -> users(id)` | *None* | `idx_blogs_category`, `idx_blogs_status`, `idx_blogs_created_at` | `com.devsphere.entity.Blog` | `com.devsphere.blogservice.Blog` |
| `blog_tags` | `(blog_id, tag)` | `blog_id -> blogs(id)` | Composite PK | Composite PK | `@ElementCollection` in `Blog` | `@ElementCollection` in `Blog` |

---

## 4. Entity-to-Table Mapping & Service Data Ownership Analysis

### Proposed vs Actual Ownership Comparison

```
+------------------------------------+--------------------------+-------------------------------------+
| Table                              | Proposed Ownership       | Actual Verified Implementation      |
+------------------------------------+--------------------------+-------------------------------------+
| users                              | Core Backend (8080)      | Core Backend (8080) only            |
| developer_profiles                 | Developer Service (8081) | Core Backend (8080) & MS (8081)     |
| developer_skills                   | Developer Service (8081) | Core Backend (8080) & MS (8081)     |
| developer_connections              | Developer Service (8081) | Core Backend (8080) only            |
| projects                           | Project Service (8082)   | Core Backend (8080) & MS (8082)     |
| project_technologies               | Project Service (8082)   | Core Backend (8080) & MS (8082)     |
| project_likes                      | Project Service (8082)   | Core Backend (8080) only            |
| blogs                              | Blog Service (8083)      | Core Backend (8080) & MS (8083)     |
| blog_tags                          | Blog Service (8083)      | Core Backend (8080) & MS (8083)     |
+------------------------------------+--------------------------+-------------------------------------+
```

### Critical Architectural Observation:
- **Core Backend already contains the full, production-grade schema and relational data model.**
- The independent microservices (`developer-service`, `project-service`, `blog-service`) currently possess an **incomplete subset** of the domain models:
  - `project-service` lacks the `ProjectLike` table and entity, meaning it has zero awareness of which user liked a project.
  - `developer-service` lacks the `DeveloperConnection` table and entity, preventing real connection tracking between users and developers.
  - Both services lack the `user_id` / `author_id` association, severing ownership and foreign key integrity.

---

## 5. Database Architecture Evaluation

We evaluated three potential architectural models for DevSphere's persistent storage:

| Criteria | Option A: Shared PostgreSQL Database (`devsphere`) | Option B: Separate PostgreSQL Databases per Service | Option C: Shared PostgreSQL Server with Separate Schemas |
| :--- | :--- | :--- | :--- |
| **Topology** | 1 Database (`devsphere`), all tables in `public` schema | 4 Databases (`devsphere_core`, `devsphere_dev`, `devsphere_proj`, `devsphere_blog`) | 1 Database (`devsphere`), 4 schemas (`core`, `developer`, `project`, `blog`) |
| **Referential Integrity** | **Strongest:** Native PostgreSQL foreign keys enforce cascades (`ON DELETE CASCADE`, `SET NULL`). | **None:** Foreign keys cannot cross database boundaries; requires distributed sagas/APIs. | **Moderate:** Cross-schema foreign keys are possible within PostgreSQL, but violate strict schema decoupling. |
| **Operational Overhead** | **Lowest:** 1 connection pool, 1 backup file, 1 Flyway baseline. | **Highest:** 4 database instances/connections, 4 backup routines, 4 connection pools. | **Moderate:** Single database instance, isolated search paths per service credentials. |
| **Concurrency & ACID** | **ACID-Compliant:** Native transactions cover likes, connections, and user creation. | **Eventual Consistency:** Distributed transactions (2PC or Outbox pattern) required. | **ACID-Compliant:** Transactions can be bounded within individual schemas. |
| **Current Project Fit** | **EXCELLENT:** Matches existing DevSphere Flyway baseline, frontend contracts, and Docker setup. | **POOR:** Massive overhead, introduces distributed transaction complexity prematurely. | **VIABLE LONG-TERM:** Good stepping stone if independent service deployment is strictly mandated. |

### Architectural Recommendation:
**Option A (Shared PostgreSQL Database with Domain-Driven Table Ownership)** is recommended for the current production overhaul.
- **Rationale:** 
  1. The DevSphere React application currently queries `http://localhost:8080` where all 8 tables are seamlessly integrated and protected by Spring Security.
  2. Preserves relational integrity: when a user is deleted, their associated profile, project likes, and developer connections cascade cleanly without leaving orphaned records.
  3. Eliminates the risk of dual sources of truth or distributed data inconsistencies.
  4. Services interact with their respective entity domains while honoring centralized security.

---

## 6. Concurrency and Data Integrity Audit Findings

### Finding 1: Project Views — Read-Modify-Write Race Condition
- **Affected File:** [ProjectServiceImpl.java](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java#L158-L165) and [microservices/project-service/ProjectService.java](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/microservices/project-service/src/main/java/com/devsphere/projectservice/ProjectService.java)
- **Observed Code:**
  ```java
  public ProjectResponse incrementViews(UUID projectId) {
      Project project = projectRepository.findById(projectId)...
      project.setViews(project.getViews() + 1); // UNSAFE READ-MODIFY-WRITE
      Project updated = projectRepository.save(project);
      return mapper.toProjectResponse(updated, false);
  }
  ```
- **Risk:** High concurrency traffic leads to lost updates (thread collision).
- **Recommended Correction:**
  In `ProjectRepository.java`:
  ```java
  @Modifying
  @Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")
  int incrementViewsDirect(@Param("id") UUID id);
  ```

### Finding 2: Project Likes — Like Count Desynchronization
- **Affected File:** [ProjectServiceImpl.java](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java#L127-L154)
- **Observed Behavior:**
  While `Core` uses `ProjectLikeRepository.findByProjectIdAndUserId(...)` with the `(project_id, user_id)` constraint, it manually updates `project.setLikes(project.getLikes() + 1)`. If two like requests arrive in parallel for different users, both read the same base like count, resulting in `likes` falling out of sync with `COUNT(project_likes)`.
- **Recommended Correction:**
  Synchronize likes directly from the authoritative relational record:
  ```java
  @Modifying
  @Query("UPDATE Project p SET p.likes = (SELECT COUNT(pl) FROM ProjectLike pl WHERE pl.project.id = :id) WHERE p.id = :id")
  int recalculateLikes(@Param("id") UUID id);
  ```

### Finding 3: Hard-Coded Developer Metrics
- **Affected File:** [DeveloperServiceImpl.java](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java#L118-L124)
- **Observed Code:**
  ```java
  int connectionsCount = 186 + (int) connectionRepository.countByDeveloperId(developerId);
  int projectsCount = 12; // HARD-CODED DUMMY VALUE
  int blogsCount = 24;    // HARD-CODED DUMMY VALUE
  ```
- **Risk:** Falsified metrics; profile activity graphs do not reflect user contributions.
- **Recommended Correction:**
  Query real database statistics:
  - Query projects authored by developer: `projectRepository.countByAuthorId(userId)`
  - Query blogs published by developer: `blogRepository.countByAuthorIdAndStatus(userId, BlogStatus.PUBLISHED)`
  - Query real connections: `connectionRepository.countByDeveloperId(developerId)`

### Finding 4: Orphan Records & Foreign Key Constraints
- In `V1__init_schema.sql`:
  - `projects.author_id` is defined as `REFERENCES users(id) ON DELETE SET NULL`. (Verified: safe, preserves projects if user account is deleted).
  - `developer_profiles.user_id` is defined as `REFERENCES users(id) ON DELETE SET NULL`.
  - `project_likes` defines `CONSTRAINT uq_project_user_like UNIQUE (project_id, user_id)`. (Verified: duplicate likes prevented by DB constraint).
  - `developer_connections` defines `CONSTRAINT uq_dev_user_connection UNIQUE (developer_id, user_id)`. (Verified: duplicate connections prevented by DB constraint).

---

## 7. Flyway Migration Analysis

### Current Migration Scripts:
1. **`V1__init_schema.sql` (3,634 bytes):**
   - Creates `users`, `developer_profiles`, `developer_skills`, `blogs`, `blog_tags`, `projects`, `project_technologies`, `project_likes`, `developer_connections`.
   - Includes 8 performance indexes (`idx_users_email`, `idx_users_username`, `idx_dev_name`, `idx_blogs_category`, `idx_blogs_status`, `idx_blogs_created_at`, `idx_projects_category`, `idx_projects_likes`, `idx_projects_views`).
   - Clean, syntax-valid SQL for PostgreSQL and H2 (PostgreSQL compatibility mode).
2. **`V2__seed_devsphere_data.sql` (7,434 bytes):**
   - Seeds 6 real DevSphere developers (Ajay Kumar, Arun Kumar, Priya Sharma, Rohit Verma, Neha Singh, Sagar Patil).
   - Seeds developer skills (Java, Spring Boot, React, Tailwind, Python, TensorFlow, etc.).
   - Seeds 6 real technical blogs (JavaScript Closures, React Hooks, SQL Joins, etc.).
   - Seeds 6 real projects (Personal Finance Tracker, Railway Ticket Booking, AI Vehicle Fault Detection, etc.).
   - Uses `ON CONFLICT DO NOTHING` for idempotency.

### Compatibility Analysis:
- Both scripts execute cleanly on PostgreSQL and on H2 in PostgreSQL mode (`MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`).
- Migration checksums are preserved in `flyway_schema_history`.

---

## 8. Security and Database Configuration Findings

1. **Credentials Management:**
   - [application.properties](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/resources/application.properties) properly extracts credentials from environment variables with sensible local defaults:
     ```properties
     spring.datasource.url=${DEVSphere_DB_URL:jdbc:postgresql://localhost:5432/devsphere}
     spring.datasource.username=${DEVSphere_DB_USERNAME:postgres}
     spring.datasource.password=${DEVSphere_DB_PASSWORD:postgres}
     ```
   - **Recommendation:** Ensure production deployments supply `DEVSphere_DB_PASSWORD` via system environment variables or container secrets.
2. **Connection Pooling:**
   - HikariCP is active by default in Spring Boot 3.4.3. Default pool size is 10 connections.
3. **SQL Injection Exposure:**
   - All repositories use parameterized JPQL queries (`:category`, `:query`, `:id`) or Spring Data derived queries. Zero dynamic string concatenation detected in SQL.

---

## 9. Proposed Stage 3B Migration & Implementation Plan

### Step-by-Step Execution Sequence (Non-Destructive):

```
+--------------------------------------------------------------------------------+
| STEP 1: Full Database Snapshot & Backup                                        |
|         - Backup ./data/devspheredb.mv.db to ./data/backups/devspheredb_pre_3b.bak |
+--------------------------------------------------------------------------------+
                                       |
                                       v
+--------------------------------------------------------------------------------+
| STEP 2: Atomic Repository Queries Implementation                               |
|         - Add @Modifying atomic increment/decrement queries in                 |
|           ProjectRepository and ProjectLikeRepository                          |
+--------------------------------------------------------------------------------+
                                       |
                                       v
+--------------------------------------------------------------------------------+
| STEP 3: Concurrency Hardening in ProjectServiceImpl                            |
|         - Replace read-modify-write in incrementViews with atomic query       |
|         - Ensure toggleLike locks transaction and updates count atomically     |
+--------------------------------------------------------------------------------+
                                       |
                                       v
+--------------------------------------------------------------------------------+
| STEP 4: Real Persisted Developer Statistics                                    |
|         - Replace hardcoded 12/24 in DeveloperServiceImpl with dynamic queries |
|           counting real projects, blogs, and connections                       |
+--------------------------------------------------------------------------------+
                                       |
                                       v
+--------------------------------------------------------------------------------+
| STEP 5: Automated Concurrency & Regression Verification                        |
|         - Run multithreaded test suite validating 100 concurrent likes/views   |
|         - Verify all 26 backend tests pass with 0 regressions                  |
+--------------------------------------------------------------------------------+
```

### Affected Files in Stage 3B:
1. `backend/src/main/java/com/devsphere/repository/ProjectRepository.java` (Adding atomic query methods)
2. `backend/src/main/java/com/devsphere/repository/BlogRepository.java` (Adding author count queries)
3. `backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java` (Applying atomic operations)
4. `backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java` (Replacing hardcoded counts with database queries)
5. `backend/src/test/java/com/devsphere/service/ProjectConcurrencyTest.java` (New automated concurrency test)

### Rollback Strategy:
If any unexpected behavior or test regression occurs during Stage 3B:
1. Git revert the specific service/repository files.
2. Restore the `./data/backups/devspheredb_pre_3b.bak` snapshot file.
3. Run `mvn test` to confirm return to baseline state.

---

## 10. Conclusion & Final Approval Gate

Stage 3A audit is complete. **Zero code, schema, or configuration files have been modified.**

All findings, risks, and safe remediation steps are documented and ready.
