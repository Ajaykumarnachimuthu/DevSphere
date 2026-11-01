# DevSphere Backend: Engineering Implementation Plan (Corrected & Production-Grade)

**Document Version:** 2.0.0  
**Target Codebase:** Spring Boot Backend (`backend/src/main/java/com/devsphere`) & React Frontend (`src/`)  
**Scope:** Actionable implementation specifications for confirmed architectural and security findings  
**Status:** Approved for Implementation (Read-Only Planning Phase)  
**Date:** October 2026  

---

## 1. Architectural Guardrails & Concurrency Rules

This implementation plan conforms to the following core principles:
1. **Preserve Layered Monolith Architecture:** No microservices or external infrastructure brokers (Kafka, Redis).
2. **Persistence Context Isolation:** Ensure `@Modifying` bulk updates, `@DynamicUpdate`, and entity lifecycle dirty-checking never overwrite one another.
3. **Bounded In-Memory Resources:** Never use unbounded `ConcurrentHashMap` instances in production; all caches and token buckets must enforce memory caps and TTL eviction via Caffeine.
4. **Explicit Full-Stack Coordination:** Clearly delineate backend-only changes from full-stack client-server contracts.

---

## 2. Detailed Technical Implementation Plans

### Plan F1: Atomic Database Updates, `@DynamicUpdate`, and Concurrency Control
* **Verification Status:** Confirmed (High Severity)
* **Target Files:**
  1. [`backend/src/main/java/com/devsphere/repository/ProjectRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/ProjectRepository.java)
  2. [`backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java)
  3. [`backend/src/main/java/com/devsphere/entity/Project.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/entity/Project.java)

#### 1. Technical Analysis of Persistence Context Interaction
* **The Problem:** When executing `@Modifying @Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")`, Hibernate sends the SQL directly to the database engine.
  * This **bypasses the JPA EntityManager L1 cache**.
  * If a `Project` entity was already loaded in memory during the transaction, its in-memory view count remains stale.
  * If the service then calls `projectRepository.save(project)` (for example, to update the title or description), Hibernate emits a full-column `UPDATE projects SET ..., views=?, ...` that overwrites the direct atomic increment!
* **The Solution:**
  1. Add `@DynamicUpdate` and `@Version private Long version;` to `Project.java`. This guarantees that entity-level updates only emit SQL for columns that actually changed, preventing stale counter overwrites.
  2. Configure `@Modifying(clearAutomatically = true, flushAutomatically = true)` on repository queries. This flushes pending changes, executes the SQL increment, and detaches existing entity instances so subsequent queries load fresh state.
  3. Decouple counter increments completely from entity `save()` calls:
     ```java
     // ProjectRepository.java
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
  4. In `ProjectServiceImpl.toggleLike`, execute operations atomically:
     ```java
     @Override
     @Transactional
     public ProjectResponse toggleLike(UUID projectId, UUID currentUserId) {
         if (currentUserId == null) {
             throw new UnauthorizedException("Authentication required to like a project");
         }

         Optional<ProjectLike> existingLike = projectLikeRepository.findByProjectIdAndUserId(projectId, currentUserId);
         boolean liked;

         if (existingLike.isPresent()) {
             projectLikeRepository.delete(existingLike.get());
             projectRepository.decrementLikesDirect(projectId);
             liked = false;
         } else {
             Project projectRef = projectRepository.getReferenceById(projectId);
             User userRef = userRepository.getReferenceById(currentUserId);
             projectLikeRepository.save(new ProjectLike(projectRef, userRef));
             projectRepository.incrementLikesDirect(projectId);
             liked = true;
         }

         Project project = projectRepository.findById(projectId)
                 .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
         return mapper.toProjectResponse(project, liked);
     }
     ```

* **Dependencies Required:** None (Built into Spring Data JPA / Hibernate).
* **Database Migration Requirements:** Add `version BIGINT NOT NULL DEFAULT 0` column to `projects` table in Flyway V3.
* **Frontend Compatibility:** 100% backward compatible (Backend-only change).

---

### Plan F2: Production JWT Secret Fail-Fast Configuration
* **Verification Status:** Confirmed / Corrected (High Severity)
* **Target Files:**
  1. [`backend/src/main/resources/application.properties`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/resources/application.properties)
  2. [`backend/src/main/resources/application-dev.properties`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/resources/application-dev.properties)

#### 1. Proposed Code Changes
In `application.properties`:
```properties
# Production JWT Secret - Must be injected via environment variable
devsphere.jwt.secret=${DEVSphere_JWT_SECRET}
```
In `application-dev.properties`:
```properties
# Development fallback secret for zero-config local development
devsphere.jwt.secret=${DEVSphere_JWT_SECRET:4c9b1d75f284e60183b9e4a7d6c518293f0b4d7e1c8a5f3962b0e8c71d4a6f95}
```
* **Frontend Compatibility:** 100% backward compatible (Backend-only change).

---

### Plan F3: Authentic Relational Statistics & Metric Clean-up
* **Verification Status:** Confirmed (Medium Severity)
* **Target Files:**
  1. [`backend/src/main/java/com/devsphere/service/impl/StatsServiceImpl.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/StatsServiceImpl.java)
  2. [`backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java)
  3. [`backend/src/main/java/com/devsphere/repository/ProjectRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/ProjectRepository.java)

#### 1. Proposed Code Changes
In `ProjectRepository.java`:
```java
long countByAuthorId(UUID authorId);
```
In `DeveloperServiceImpl.java`:
```java
@Override
@Transactional(readOnly = true)
public DeveloperStatsResponse getDeveloperStats(UUID developerId) {
    DeveloperProfile dev = developerRepository.findById(developerId)
            .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + developerId));

    int connectionsCount = (int) connectionRepository.countByDeveloperId(developerId);
    int projectsCount = dev.getUser() != null ? (int) projectRepository.countByAuthorId(dev.getUser().getId()) : 0;
    int blogsCount = dev.getUser() != null ? (int) blogRepository.countByAuthorIdAndStatus(dev.getUser().getId(), BlogStatus.PUBLISHED) : 0;

    List<Integer> activityData = List.of(projectsCount, blogsCount, connectionsCount);
    List<String> activityLabels = List.of("Projects", "Blogs", "Connections");

    return new DeveloperStatsResponse(projectsCount, blogsCount, connectionsCount, activityData, activityLabels);
}
```
In `StatsServiceImpl.java`:
Return genuine database aggregations directly without synthetic mathematical offsets:
```java
long developersCount = developerRepository.count();
long blogsCount = blogRepository.countByStatus(BlogStatus.PUBLISHED);
long projectsCount = projectRepository.count();
long countriesCount = 50L; // Or distinct locations query
return new OverviewStatsResponse(developersCount, blogsCount, projectsCount, countriesCount);
```
* **Frontend Compatibility:** 100% backward compatible (Backend-only change).

---

### Plan F4: Dual-Token Session Architecture, Refresh Tokens & HttpOnly Cookies
* **Verification Status:** Confirmed / Expanded (Medium Severity)
* **Target Files:**
  1. `backend/src/main/java/com/devsphere/entity/RefreshToken.java` (New Entity)
  2. `backend/src/main/java/com/devsphere/repository/RefreshTokenRepository.java` (New Repository)
  3. [`backend/src/main/java/com/devsphere/entity/User.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/entity/User.java)
  4. [`backend/src/main/java/com/devsphere/security/JwtTokenProvider.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/security/JwtTokenProvider.java)
  5. [`backend/src/main/java/com/devsphere/controller/AuthController.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/AuthController.java)
  6. [`src/services/api.js`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js) (Frontend modification)

#### 1. Database-Backed `RefreshToken` Entity & Repository
```java
@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_tokens_user_id", columnList = "user_id"),
    @Index(name = "idx_refresh_tokens_token_hash", columnList = "token_hash")
})
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash; // SHA-256 hash of opaque token

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "replaced_by_token", length = 64)
    private String replacedByToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    // Getters and setters
}
```

#### 2. Rotation, Reuse Detection & Cookie Delivery
1. **Opaque Token Generation & Hashing:**
   Generate a cryptographically secure 256-bit random string via `SecureRandom`. Store its **SHA-256 hash** in the database; send the raw token to the client.
2. **Cookie Transmission:**
   Deliver the refresh token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`__Host-devsphere-refresh`) with `path=/api/v1/auth/refresh`. This protects against XSS token exfiltration.
3. **Rotation & Reuse Detection Pipeline:**
   When `/api/v1/auth/refresh` is called:
   * Hash the raw cookie token and search `refresh_tokens`.
   * **If token is already revoked:** This indicates **Token Theft / Replay Attack**! Immediately revoke **all** refresh tokens belonging to that `user_id` and return 401 Unauthorized.
   * **If token is valid and active:** Mark current token as revoked (`revoked = true`, `replaced_by_token = newHash`), issue a new raw refresh token, and return a new short-lived JWT access token (15-minute validity).
4. **CSRF Protection on Refresh Endpoint:**
   Because the refresh endpoint uses cookies, configure `SameSite=Strict` and enforce a custom header verification (`X-Requested-With: XMLHttpRequest` or custom bearer check) in `SecurityConfig.java`.

* **Database Migration Requirements:** Add `refresh_tokens` table in Flyway V3.
* **Frontend Compatibility Impact:** **FULL-STACK COORDINATION REQUIRED.**
  * [`src/services/api.js`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js) must configure `credentials: 'include'` on fetch requests.
  * Implement an automatic 401 response interceptor in `api.js` that calls `/api/v1/auth/refresh` to obtain a fresh access token before retrying failed requests.

---

### Plan F5: Bounded Two-Tier Rate Limiting (Caffeine + Bucket4j)
* **Verification Status:** Confirmed / Corrected (Medium Severity)
* **Target Files:**
  1. [`backend/pom.xml`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/pom.xml)
  2. `backend/src/main/java/com/devsphere/security/RateLimitingFilter.java` (New Filter)
  3. [`backend/src/main/java/com/devsphere/config/SecurityConfig.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/config/SecurityConfig.java)

#### 1. Technical Correction of In-Memory Bucket Storage
* **The Problem:** Storing token buckets in an unbounded `ConcurrentHashMap<String, Bucket>` allows an attacker to exhaust heap memory by spoofing millions of random IP addresses or user keys.
* **The Solution:** Use **Caffeine Cache** with a bounded size and access TTL:
  ```java
  @Component
  public class RateLimitingFilter extends OncePerRequestFilter {

      private final Cache<String, Bucket> ipBuckets = Caffeine.newBuilder()
              .maximumSize(10_000)
              .expireAfterAccess(Duration.ofMinutes(15))
              .build();

      private final Cache<String, Bucket> accountBuckets = Caffeine.newBuilder()
              .maximumSize(20_000)
              .expireAfterAccess(Duration.ofMinutes(15))
              .build();

      @Override
      protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
              throws ServletException, IOException {
          String path = request.getRequestURI();
          if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
              String clientIp = resolveClientIp(request);
              
              // Tier 1: Volumetric IP Defense (60 req/min burst)
              Bucket ipBucket = ipBuckets.get(clientIp, k -> createIpBucket());
              if (!ipBucket.tryConsume(1)) {
                  sendRateLimitError(response, 60, "Too many requests from this network. Please wait 1 minute.");
                  return;
              }
          }
          filterChain.doFilter(request, response);
      }

      private Bucket createIpBucket() {
          return Bucket.builder()
                  .addLimit(Bandwidth.classic(60, Refill.intervally(60, Duration.ofMinutes(1))))
                  .build();
      }

      private void sendRateLimitError(HttpServletResponse response, int retryAfterSec, String message) throws IOException {
          response.setStatus(429);
          response.setContentType("application/json");
          response.setHeader("Retry-After", String.valueOf(retryAfterSec));
          response.getWriter().write(String.format(
                  "{\"status\":429,\"error\":\"TOO_MANY_REQUESTS\",\"message\":\"%s\",\"details\":{\"retryAfter\":%d}}",
                  message, retryAfterSec));
      }

      private String resolveClientIp(HttpServletRequest request) {
          // Trusted proxy resolution: use standard getRemoteAddr() when behind configured reverse proxy
          return request.getRemoteAddr();
      }
  }
  ```
* **Reverse Proxy Header Spoofing:** To prevent client spoofing of `X-Forwarded-For`, configure Spring Boot's native proxy parser in `application.properties`:
  ```properties
  server.forward-headers-strategy=framework
  ```
* **Frontend Compatibility:** Error body matches standard `ApiError` schema; frontend error banner displays the message cleanly.

---

### Plan A1: Bounded Sliding-Window View Deduplication
* **Verification Status:** Confirmed / Corrected (Medium-High Severity)
* **Target Files:**
  1. [`backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java)
  2. [`backend/src/main/java/com/devsphere/controller/ProjectController.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/ProjectController.java)

#### 1. Proposed Implementation
```java
// ProjectServiceImpl.java
private final Cache<String, Instant> viewCache = Caffeine.newBuilder()
        .maximumSize(50_000)
        .expireAfterWrite(Duration.ofHours(1))
        .build();

@Override
@Transactional
public ProjectResponse incrementViews(UUID projectId, String clientIp) {
    String cacheKey = projectId.toString() + ":" + clientIp;
    
    // Atomic test-and-set in bounded cache
    boolean isNewVisit = (viewCache.asMap().putIfAbsent(cacheKey, Instant.now()) == null);
    
    if (isNewVisit) {
        try {
            projectRepository.incrementViewsDirect(projectId);
        } catch (Exception ex) {
            // If database fails, evict key so retry is not blocked
            viewCache.invalidate(cacheKey);
            throw ex;
        }
    }
    
    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
    return mapper.toProjectResponse(project, false);
}
```
* **Frontend Compatibility:** 100% backward compatible (Backend-only change).

---

### Plan A3: Flyway V3 Schema Migration for `developer_profiles(user_id)`
* **Verification Status:** Confirmed (Medium Severity)
* **Target File:** `backend/src/main/resources/db/migration/V3__security_concurrency_and_sessions.sql`
```sql
ALTER TABLE developer_profiles 
ADD CONSTRAINT uq_developer_profiles_user_id UNIQUE (user_id);

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;

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
* **Frontend Compatibility:** 100% backward compatible.
