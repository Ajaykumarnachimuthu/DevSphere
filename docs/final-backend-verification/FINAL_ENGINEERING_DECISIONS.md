# DevSphere Backend: Final Engineering Decisions & Architectural Consensus

**Document Version:** 1.0.0  
**Project:** DevSphere (Developer Community & Showcase Platform)  
**Target Codebase:** Spring Boot Backend (`backend/src/main/java/com/devsphere`) & React Frontend (`src/`)  
**Auditor:** Principal Java Architect, Spring Security Engineer, Database Reliability Specialist & Full-Stack Reviewer  
**Status:** Canonical Architectural Baseline  
**Date:** October 2026  

---

## 1. Executive Summary

This document establishes the **authoritative architectural decisions** for the DevSphere platform following three successive audit and verification cycles. It synthesizes confirmed technical realities, rectifies previous audit inaccuracies, explicitly categorizes backend-only vs. full-stack changes, and establishes the definitive implementation order.

The governing principle of this plan is **architectural pragmatism**: maintain DevSphere's clean **layered-monolith architecture** while achieving production-grade security, concurrency safety, and data integrity—without introducing unnecessary distributed infrastructure (such as Redis clusters, Kafka, or microservices).

---

## 2. Decision Matrix: Accepted, Corrected, and Rejected Proposals

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ARCHITECTURAL DECISION MATRIX                                      │
├────┬─────────────────────────────┬───────────────────────────┬──────────────┬────────────────────┤
│ ID │ Feature / Finding           │ Original Audit Proposal   │ Final Status │ Final Resolution   │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D1 │ Project Likes & Views Race  │ @Modifying on full entity │ CORRECTED    │ @Modifying SQL +   │
│    │ Conditions                  │ without dynamic update    │              │ @DynamicUpdate     │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D2 │ JWT Secret Configuration    │ Fail-fast in production   │ ACCEPTED     │ Fail-fast in prod; │
│    │                             │                           │              │ dev/test fallback  │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D3 │ Statistics Baseline Offsets │ Replace with DB counts    │ ACCEPTED     │ True DB counts; UI │
│    │                             │                           │              │ handles badges     │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D4 │ JWT Refresh & Revocation    │ token_version alone       │ CORRECTED    │ Refresh Tokens in  │
│    │                             │                           │              │ HttpOnly Cookies + │
│    │                             │                           │              │ Rotation & Family  │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D5 │ Authentication Rate Limit   │ Unbounded Map with IP     │ CORRECTED    │ Bounded Caffeine + │
│    │                             │                           │              │ Composite Bucket   │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D6 │ Public View Inflation       │ Unbounded ConcurrentMap   │ CORRECTED    │ Bounded LRU Cache  │
│    │                             │                           │              │ with atomic put    │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D7 │ Duplicate Developer Names   │ UNIQUE on display name    │ REJECTED     │ Route by UUID /    │
│    │                             │                           │              │ unique username    │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D8 │ Unique user_id on Profile   │ Flyway UNIQUE constraint  │ ACCEPTED     │ Flyway V3 migration│
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D9 │ JWT Byte Parsing            │ Generic Byte Decoder      │ CORRECTED    │ Explicit UTF-8/Hex │
│    │                             │                           │              │ key length check   │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D10│ Demo Admin Role             │ ROLE_ADMIN in Dev         │ ACCEPTED     │ Update Initializer │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D11│ Microservices Split         │ Separate Services         │ REJECTED     │ Retain Monolith    │
├────┼─────────────────────────────┼───────────────────────────┼──────────────┼────────────────────┤
│ D12│ Redis Cluster               │ External Cache Server     │ REJECTED     │ In-Memory Caffeine │
└────┴─────────────────────────────┴───────────────────────────┴──────────────┴────────────────────┘
```

---

## 3. Deep Architectural Corrections

### Decision D1: JPA Concurrency, `@Modifying`, and Optimistic Locking Interaction
* **The Technical Challenge:**
  A naive application of `@Modifying` queries or `@Version` introduces subtle data loss risks:
  1. A JPQL `@Modifying UPDATE` executes directly in the database, **bypassing the Hibernate Persistence Context (L1 cache)**.
  2. Bulk updates do **not** automatically increment entity `@Version` columns unless explicitly coded into the JPQL string.
  3. If an entity is already loaded in the persistence context, it retains stale in-memory state unless `@Modifying(clearAutomatically = true, flushAutomatically = true)` is applied.
  4. If a user edits a project's title while another user likes it, a standard Hibernate update would emit a full-column `UPDATE projects SET ...` and overwrite the freshly incremented like count.
* **Canonical Architecture Decision:**
  1. Apply `@DynamicUpdate` to [`Project.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/entity/Project.java). This ensures Hibernate generates SQL containing *only* modified columns (e.g. `UPDATE projects SET title=?, updated_at=? WHERE id=? AND version=?`), completely isolating title edits from counter columns.
  2. Implement atomic direct database increments in `ProjectRepository`:
     ```java
     @Modifying(clearAutomatically = true, flushAutomatically = true)
     @Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")
     int incrementViewsDirect(@Param("id") UUID id);

     @Modifying(clearAutomatically = true, flushAutomatically = true)
     @Query("UPDATE Project p SET p.likes = p.likes + 1 WHERE p.id = :id")
     int incrementLikesDirect(@Param("id") UUID id);

     @Modifying(clearAutomatically = true, flushAutomatically = true)
     @Query("UPDATE Project p SET p.likes = CASE WHEN p.likes > 0 THEN p.likes - 1 ELSE 0 END WHERE p.id = :id")
     int decrementLikesDirect(@Param("id") UUID id);
     ```
  3. In `ProjectServiceImpl.toggleLike`, maintain strict transaction boundaries:
     * Check user like existence in `ProjectLikeRepository`.
     * Insert/Delete join record.
     * Execute direct atomic increment/decrement.
     * Avoid invoking `projectRepository.save(project)` during counter mutations.

---

### Decision D4: Comprehensive Session Architecture (Access vs. Refresh vs. Versioning)
* **The Technical Challenge:**
  Relying solely on `token_version` on the `User` entity provides only a **global logout** mechanism. If a user logs out on their phone, their laptop session is also terminated. It cannot support individual session revocation or silent session renewal without re-entering credentials.
* **Canonical Architecture Decision:**
  Implement a dual-token session architecture:
  1. **Short-Lived Access Token:** 15-minute lifespan, stored in JavaScript memory (or client request header).
  2. **Database-Backed Refresh Token:** 7-day lifespan, persisted in a dedicated `refresh_tokens` table.
  3. **HttpOnly Secure Cookie Delivery:** The refresh token is transmitted strictly via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`__Host-devsphere-refresh`) scoped to `/api/v1/auth/refresh`. This completely eliminates XSS exfiltration risks.
  4. **Refresh Token Rotation & Reuse Detection:**
     * Every refresh request issues a *new* refresh token and invalidates the previous one.
     * If an already-revoked refresh token is presented, the system detects a **token replay/theft attack** and immediately revokes all active refresh tokens for that entire user family.
  5. **Global Revocation Hook:** Retain `token_version` on `User` as a global override for password resets.

---

### Decision D5: Production-Grade Rate Limiting & Proxy Protection
* **The Technical Challenge:**
  1. Unbounded `ConcurrentHashMap<String, Bucket>` is a memory exhaustion DoS vulnerability.
  2. Pure IP-based throttling locks out multiple legitimate students sharing a university or hostel NAT gateway.
  3. Unsanitized `X-Forwarded-For` headers can be spoofed by attackers to bypass IP checks.
* **Canonical Architecture Decision:**
  1. Use **Caffeine Cache** to establish a bounded, self-expiring store:
     ```java
     Cache<String, Bucket> buckets = Caffeine.newBuilder()
             .maximumSize(20_000)
             .expireAfterAccess(Duration.ofMinutes(10))
             .build();
     ```
  2. Implement **Two-Tier Composite Throttling**:
     * **Tier 1 (Volumetric IP Defense):** Generous burst threshold (60 requests/minute per client IP) to block automated brute-force scripts without harming NAT-shared users.
     * **Tier 2 (Credential Attack Defense):** Tight threshold (5 failed attempts per 5 minutes per `IP + username/email` pair).
  3. **Trusted Proxy Integration:** Do not trust raw client headers. Use Spring Boot's standard remote IP resolution with trusted proxy whitelisting (`server.forward-headers-strategy=framework`).

---

### Decision D6: Bounded In-Memory Public View Deduplication
* **The Technical Challenge:**
  Spamming `POST /api/v1/projects/{id}/view` can artificially inflate platform counters. An unbounded in-memory cache leaks memory over time.
* **Canonical Architecture Decision:**
  1. Maintain an in-memory, bounded Caffeine cache (`maximumSize = 50,000`, `expireAfterWrite = 1 hour`).
  2. Key format: `projectId + ":" + clientIpHash`.
  3. Atomic operation:
     ```java
     boolean isNewView = (viewCache.asMap().putIfAbsent(key, Instant.now()) == null);
     if (isNewView) {
         projectRepository.incrementViewsDirect(projectId);
     }
     ```
  4. If the database update fails, evict the key from the cache to permit subsequent retry.

---

## 4. Scope Classification: Backend-Only vs. Full-Stack Changes

To ensure clear coordination between backend and frontend engineering, all changes are categorized explicitly:

### 4.1 Backend-Only Changes (Zero Frontend Modifications Required)
These changes preserve all existing REST endpoint paths, request bodies, and JSON response envelopes:
1. **Atomic Likes and View Counters (D1):** Frontend receives identical `ProjectResponse` DTOs.
2. **Production JWT Secret Enforcement (D2):** Internal configuration guard.
3. **Real Database Statistics (D3):** Returns identical `DeveloperStatsResponse` and `OverviewStatsResponse` JSON structures.
4. **Flyway V3 Unique Constraint Migration (D8):** Schema-level constraint on `developer_profiles(user_id)`.
5. **DataInitializer Admin Role (D10):** Development database bootstrapping.
6. **Public View Debouncing (D6):** Transparent to public consumers.

### 4.2 Full-Stack Changes (Coordinated Client-Server Modifications)
These enhancements improve security posture but require corresponding client updates:

| Feature | Backend Responsibility | Frontend Responsibility |
| :--- | :--- | :--- |
| **HttpOnly Refresh Tokens (D4)** | Issue `__Host-devsphere-refresh` cookie on `/login`; create `POST /api/v1/auth/refresh` endpoint. | Update `src/services/api.js` to set `credentials: 'include'`; add silent 401 token refresh interceptor. |
| **Authentication Rate Limiting (D5)** | Return HTTP 429 with `Retry-After` header and `ApiError` payload. | In `LoginForm.jsx` and `SignupForm.jsx`, catch status 429 and render a user-friendly cooldown timer. |
| **Logout Synchronization (D4)** | Invalidate refresh token cookie and database session on `/logout`. | `authApi.logout()` dispatches POST request before clearing in-memory access token. |

---

## 5. Database Migration Plan (Flyway V3)

File: `backend/src/main/resources/db/migration/V3__security_concurrency_and_sessions.sql`

```sql
-- V3: Database Reliability, Concurrency & Session Hardening

-- 1. Ensure 1:1 integrity between User and DeveloperProfile (permitting multiple NULLs)
ALTER TABLE developer_profiles 
ADD CONSTRAINT uq_developer_profiles_user_id UNIQUE (user_id);

-- 2. Add optimistic locking version column to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- 3. Add token_version to users for global session invalidation
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;

-- 4. Create refresh_tokens table for individual session management
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_by_token VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

## 6. Authoritative Implementation Roadmap

```
PHASE 1: CRITICAL SECURITY & CONCURRENCY (Sprint 1)
├── 1. Remove fallback secret in application.properties (Fail-fast in production).
├── 2. Implement @Modifying atomic SQL increments for project likes & views.
├── 3. Add @DynamicUpdate and @Version to Project.java.
├── 4. Add sliding-window bounded Caffeine view deduplication.
└── 5. Implement two-tier bounded rate limiting on /api/v1/auth/* endpoints.

PHASE 2: SESSION MANAGEMENT & DATA ACCURACY (Sprint 2)
├── 1. Apply Flyway V3 migration (uq_dev_user_id, version, refresh_tokens table).
├── 2. Implement RefreshToken entity, rotation, and HttpOnly cookie pipeline.
├── 3. Update src/services/api.js with credentials: 'include' and 401 retry interceptor.
├── 4. Replace hardcoded statistics in StatsServiceImpl and DeveloperServiceImpl with real queries.
└── 5. Assign Role.ROLE_ADMIN to demoUser in DataInitializer.

PHASE 3: PERFORMANCE & LIFECYCLE REFINEMENTS (Sprint 3)
├── 1. Enable Spring Cache (@EnableCaching + Caffeine) on /api/v1/stats/overview.
├── 2. Optimize @ElementCollection mappings from EAGER to LAZY with repository JOIN FETCH.
└── 3. Implement Hibernate soft delete (@SQLDelete) for Blog entity.
```

---

## 7. Risks and Rollback Strategy

| Mitigation Action | Potential Operational Risk | Rollback Procedure |
| :--- | :--- | :--- |
| **Enforce Production JWT Secret** | Application fails to start if environment variable is omitted during deployment. | Inject `DEVSphere_JWT_SECRET` in environment or container configuration; zero code rollback needed. |
| **Flyway V3 Migration** | Migration failure if existing duplicate `user_id` values exist in `developer_profiles`. | Verified: All 6 seeded developers have `user_id = NULL`. In PostgreSQL, unique constraints permit multiple NULLs. If rollback is required, drop constraint via Flyway undo or target script. |
| **HttpOnly Cookies** | Cross-origin cookie blockage if frontend and backend domains mismatch without proper CORS. | Ensure `Access-Control-Allow-Credentials: true` and explicit origin matching in `SecurityConfig.java`. Access token header flow remains functional as secondary fallback. |
| **Rate Limiter Throttling** | False-positive 429 errors for heavily clustered student labs. | Adjust burst capacity from 10 to 20 requests/minute in `application.properties` via externalized configuration. |
