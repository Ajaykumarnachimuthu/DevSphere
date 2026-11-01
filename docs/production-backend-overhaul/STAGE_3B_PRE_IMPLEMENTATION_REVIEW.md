# DevSphere Stage 3B: Final Technical Refinement & Implementation Specification

**Project:** DevSphere — Developer Community & Portfolio Platform  
**Document Type:** Final Technical Refinement, Concurrency Architecture, Safety & Verification Specification  
**Author:** Principal Software Architect, Senior Spring Boot Specialist & PostgreSQL Database Architect  
**Date:** 2026-10-31  
**Status:** READY FOR FINAL IMPLEMENTATION APPROVAL — STRICT READ-ONLY MODE (NO BACKEND CODE MODIFIED)  

---

## 1. Scope Confirmation & Architecture Invariants

### 1.1 Architectural Acceptance in Principle
Stage 3B operates under strict, verified architectural boundaries:
1. **Core Backend as Authoritative Source of Truth:** Core Backend (`backend/`, port `8080`) is the sole system of record for developers, projects, blogs, likes, and connections.
2. **Frontend Contract Immutability:** All REST API endpoints, paths, JSON structures, field names, and status codes consumed by the React UI (`src/services/api.js`) remain 100% unchanged.
3. **Database Schema Preservation:** Existing database schemas, column definitions, and Flyway migration scripts (`V1__init_schema.sql`) are preserved intact. No tables are dropped, altered, or recreated.
4. **Microservice Isolation:** Autonomous microservices (`microservices/developer-service`, `microservices/project-service`, `microservices/blog-service`) are **not** modified in Stage 3B.
5. **No Database Replacement:** The existing persistent H2 file database (`./data/devspheredb.mv.db`) in development and PostgreSQL schema in production remain in place.
6. **Authentication & Security Preservation:** Spring Security, JWT token generation, user authentication filters, and password hashing remain completely unmodified.

### 1.2 Exact Scope Inventory

| Component | Target File | Nature of Change |
| :--- | :--- | :--- |
| **Project Repository** | `backend/src/main/java/com/devsphere/repository/ProjectRepository.java` | Add pessimistic lock query, atomic view increment query, and author project count queries. |
| **Blog Repository** | `backend/src/main/java/com/devsphere/repository/BlogRepository.java` | Add author published blog count queries (by user ID and by author name). |
| **Project Service** | `backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java` | Refactor `toggleLike` to use pessimistic write locking and exact count sync; refactor `incrementViews` to use atomic SQL increment. |
| **Developer Service** | `backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java` | Remove all fabricated metrics (`186`, `12`, `24`); compute authentic counts from repositories. |
| **Concurrency Test Suite** | `backend/src/test/java/com/devsphere/service/ProjectConcurrencyTest.java` | New comprehensive integration test covering all 7 concurrency scenarios. |

---

## 2. Database Backup, Integrity & Restoration Strategy

### 2.1 The "Hot Copy" Hazard in H2
H2 operates on an append-only Multi-Version Store (MVStore) engine. Copying `./data/devspheredb.mv.db` using an OS-level file copy while the JVM holds an active file handle risks capturing torn pages, uncommitted chunks, or split block headers, causing irreversible data corruption (`IllegalStateException: File corrupted`).

### 2.2 Clean Offline Backup Procedure

Prior to executing any Stage 3B modifications, the following strict procedure will be executed:

```powershell
# 1. Cleanly stop any running Spring Boot or JVM processes holding devspheredb locks
Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -like "*backend*" -or $_.CommandLine -like "*devsphere-backend*" 
} | Stop-Process -Force

# 2. Verify no active process holds a lock on the database file
Start-Sleep -Seconds 2
$fileStream = [System.IO.File]::Open("C:\Users\N.AJAYKUMAR\Full Stack Proojects\data\devspheredb.mv.db", [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
$fileStream.Close()

# 3. Create dedicated immutable backup directory
New-Item -ItemType Directory -Force -Path "C:\Users\N.AJAYKUMAR\Full Stack Proojects\data\backups"

# 4. Generate timestamped snapshot preserving original database separately
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "C:\Users\N.AJAYKUMAR\Full Stack Proojects\data\backups\devspheredb_pre_stage3b_$timestamp.mv.db"
Copy-Item -Path "C:\Users\N.AJAYKUMAR\Full Stack Proojects\data\devspheredb.mv.db" -Destination $backupFile

# 5. Cryptographic verification using SHA-256
$hashOriginal = (Get-FileHash -Path "C:\Users\N.AJAYKUMAR\Full Stack Proojects\data\devspheredb.mv.db" -Algorithm SHA256).Hash
$hashBackup   = (Get-FileHash -Path $backupFile -Algorithm SHA256).Hash

if ($hashOriginal -ne $hashBackup) {
    throw "BACKUP INTEGRITY FAILURE: SHA-256 mismatch!"
}
Write-Host "Backup verified successfully with SHA-256: $hashBackup"
```

### 2.3 Verification of Backup Restorability
A backup is invalid until its restoration is proven. To verify without altering the active database:
1. Copy the snapshot to a temporary verification path: `./data/backups/verify_restore_test.mv.db`.
2. Connect to the test database using a lightweight H2 verification command or standalone test context:
   `jdbc:h2:file:./data/backups/verify_restore_test;IFEXISTS=TRUE`
3. Execute validation queries across all 8 tables (`SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM projects;`, etc.).
4. Confirm H2 opens cleanly without `DbException` or file format errors.
5. Clean up `./data/backups/verify_restore_test.mv.db`.

### 2.4 Protection of Post-Backup Data & Anti-Overwrite Rollback Rule
> [!IMPORTANT]
> **Anti-Overwrite Rule:** The rollback script will **NEVER** automatically overwrite an active database with an older backup snapshot without first taking a pre-rollback preservation snapshot of the active state.

If a rollback is required after Stage 3B activities:
1. **Delta Preservation Snapshot:** Immediately copy active `./data/devspheredb.mv.db` to `./data/backups/devspheredb_pre_rollback_<timestamp>.mv.db`.
2. **Delta Extraction:** If new production or developer records were created after the initial backup, execute a SQL data export:
   ```sql
   SCRIPT DATA TO './data/backups/delta_records.sql' TABLE projects, project_likes, developer_connections, blogs;
   ```
3. **Explicit Confirmation:** Restoration requires manual confirmation comparing timestamps and SHA-256 hashes to prevent accidental reversion of valid data.
4. **Test Data Protection:** In the automated test suite (`ProjectConcurrencyTest.java`), tests run in controlled transactions with cleanup routines or on an isolated in-memory/test database, preventing pollution of `./data/devspheredb.mv.db`.

---

## 3. Concurrency-Safe Like and Unlike Operations

### 3.1 Failure Mode Analysis of Previous Implementation
The existing `toggleLike` in `ProjectServiceImpl.java` exhibits severe concurrency race conditions:
```java
// EXISTING INSECURE IMPLEMENTATION
Optional<ProjectLike> existingLike = projectLikeRepository.findByProjectIdAndUserId(projectId, currentUserId);
if (existingLike.isPresent()) {
    projectLikeRepository.delete(existingLike.get());
    project.setLikes(Math.max(0, project.getLikes() - 1)); // RACE CONDITION: Lost update & double-decrement
} else {
    ProjectLike like = new ProjectLike(project, user);
    projectLikeRepository.save(like);                      // RACE CONDITION: Violates unique constraint
    project.setLikes(project.getLikes() + 1);              // RACE CONDITION: Overwrites concurrent likes
}
projectRepository.save(project);
```

#### Why Catching `DataIntegrityViolationException` is Insufficient:
1. **Simultaneous Unlikes (Double-Decrement):** When a user has already liked a project and two rapid unlike requests arrive simultaneously, both threads query `findByProjectIdAndUserId` at the same time. Both see `isPresent() == true`. Thread 1 deletes the row; Thread 2 issues a delete on the same ID (which affects 0 rows in SQL without throwing any exception). **Both threads then execute `project.setLikes(project.getLikes() - 1)`**, decrementing the count twice for a single unlike action.
2. **Mixed Interleaved Requests:** If User A unlikes while User B likes simultaneously, both load `project.getLikes() == 10`. User A sets `9`, User B sets `11`. The last writer wins, resulting in an incorrect like count.
3. **Initial State Misread:** Relying on exception catching cannot resolve cases where multiple threads read stale uncommitted state.

### 3.2 Robust Architectural Solution: Pessimistic Row Locking

To eliminate race conditions deterministically at the database level:
1. **Pessimistic Write Lock:** The transaction acquires an exclusive row lock (`SELECT ... FOR UPDATE`) on the `Project` entity before evaluating like status.
2. **Serialized Per-Project Operations:** All like and unlike operations on the same project are strictly serialized across threads.
3. **Exact Database Count Synchronization:** `project.likes` is synchronized directly from `SELECT COUNT(pl) FROM ProjectLike pl WHERE pl.project.id = :id`, guaranteeing that `projects.likes` is 100% mathematically equal to persisted `ProjectLike` records.
4. **Composite Unique Constraint Enforcement:** `CONSTRAINT uq_project_user_like UNIQUE (project_id, user_id)` remains the absolute storage engine defense-in-depth.

```
                              Thread 1 (User U)                   Thread 2 (User U - Simultaneous)
                                     |                                           |
                                     v                                           v
                       BEGIN TRANSACTION                                BEGIN TRANSACTION
                                     |                                           |
                    SELECT * FROM projects WHERE id = :id                        |
                            FOR UPDATE [ACQUIRED]                                |
                                     |                                 SELECT * FROM projects ...
                                     |                                     FOR UPDATE [BLOCKED]
                                     |                                           |
                       Check: findByProjectIdAndUserId                           |
                              --> Returns EMPTY                                  |
                                     |                                           |
                       INSERT INTO project_likes                                 |
                       UPDATE projects SET likes = COUNT(...)                    |
                                     |                                           |
                       COMMIT TRANSACTION [LOCK RELEASED]                        |
                                     |                                           |
                                     |                                 [UNBLOCKED - LOCK ACQUIRED]
                                     |                                           |
                                     |                                 Check: findByProjectIdAndUserId
                                     |                                        --> Returns PRESENT!
                                     |                                           |
                                     |                                 DELETE FROM project_likes
                                     |                                 UPDATE projects SET likes = COUNT(...)
                                     |                                           |
                                     |                                 COMMIT TRANSACTION
```

### 3.3 Concrete Repository & Service Implementation Plan

#### In `ProjectRepository.java`:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Project p WHERE p.id = :id")
Optional<Project> findByIdWithLock(@Param("id") UUID id);

@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")
int incrementViewsDirect(@Param("id") UUID id);

long countByAuthorId(UUID authorId);

long countByAuthorNameIgnoreCase(String authorName);
```

#### In `ProjectServiceImpl.java`:
```java
@Override
@Transactional(isolation = Isolation.READ_COMMITTED)
public ProjectResponse toggleLike(UUID projectId, UUID currentUserId) {
    if (currentUserId == null) {
        throw new UnauthorizedException("You must be logged in to like a project");
    }

    // 1. Acquire pessimistic exclusive row lock on Project
    Project project = projectRepository.findByIdWithLock(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

    User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));

    // 2. Evaluate like existence under row lock
    Optional<ProjectLike> existingLike = projectLikeRepository.findByProjectIdAndUserId(projectId, currentUserId);
    boolean liked;

    if (existingLike.isPresent()) {
        projectLikeRepository.delete(existingLike.get());
        projectLikeRepository.flush();
        liked = false;
    } else {
        ProjectLike like = new ProjectLike(project, user);
        projectLikeRepository.saveAndFlush(like);
        liked = true;
    }

    // 3. Exact count synchronization directly from authoritative join table
    long actualLikes = projectLikeRepository.countByProjectId(projectId);
    project.setLikes((int) actualLikes);
    Project updated = projectRepository.saveAndFlush(project);

    return mapper.toProjectResponse(updated, liked);
}
```

### 3.4 Preservation of API Response Structure
The endpoint `POST /api/v1/projects/{id}/like` continues returning `ProjectResponse`:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Personal Finance Tracker",
  "category": "Web Development",
  "description": "...",
  "authorName": "Ajaykumar N",
  "technologies": ["React", "Node.js"],
  "likes": 129,
  "views": 2400,
  "liked": true,
  "createdAt": "2026-10-31T10:00:00Z",
  "updatedAt": "2026-10-31T10:05:00Z"
}
```
**API Contract Drift: 0%.**

---

## 4. Atomic Project Views Specification

### 4.1 Persistence Context & Atomic Execution
The current `incrementViews` uses an in-memory `project.setViews(project.getViews() + 1)` which loses increments when concurrent requests interleave.

In Stage 3B:
1. `incrementViewsDirect(UUID id)` executes an atomic SQL increment:
   `UPDATE projects SET views = views + 1 WHERE id = :id`
2. `clearAutomatically = true` and `flushAutomatically = true` invalidate the Hibernate 1st-level cache, preventing stale cached entities from overwriting the incremented database value.
3. If `updatedRows == 0`, a `ResourceNotFoundException` is immediately thrown.
4. Subsequent fetch returns the fresh atomically updated entity.

```java
@Override
@Transactional
public ProjectResponse incrementViews(UUID projectId) {
    int updatedRows = projectRepository.incrementViewsDirect(projectId);
    if (updatedRows == 0) {
        throw new ResourceNotFoundException("Project not found with id: " + projectId);
    }

    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

    return mapper.toProjectResponse(project, false);
}
```

---

## 5. Authentic Developer Statistics Calculation

### 5.1 Elimination of Fabricated Data
The current `DeveloperServiceImpl.java` injects hardcoded constants:
- Line 107: `186 + totalConnections`
- Line 118: `186 + countByDeveloperId`
- Line 119: `int projectsCount = 12;`
- Line 120: `int blogsCount = 24;`
- Line 134: `mapper.toDeveloperResponse(dev, 12, 24, totalConnections, connected)`

All fabricated numbers (`186`, `12`, `24`) will be completely eliminated.

### 5.2 Resolution of Author Identity & Unlinked Seeded Profiles
1. **Linked Developer Profiles (`dev.getUser() != null`):**
   - Projects: Counted by author user ID: `projectRepository.countByAuthorId(dev.getUser().getId())`.
   - Blogs: Counted by author user ID and published status: `blogRepository.countByAuthorIdAndStatus(dev.getUser().getId(), BlogStatus.PUBLISHED)`.
2. **Seeded Developer Profiles (`dev.getUser() == null`):**
   - Fallback strictly to author name:
     - `projectRepository.countByAuthorNameIgnoreCase(dev.getName())`
     - `blogRepository.countByAuthorNameIgnoreCaseAndStatus(dev.getName(), BlogStatus.PUBLISHED)`
   - Connections: `connectionRepository.countByDeveloperId(dev.getId())` (starts at authentic `0`).
3. **Blog Status Invariant:** Draft blogs (`BlogStatus.DRAFT`) are strictly excluded from public developer statistics.

### 5.3 Concrete Implementation in `DeveloperServiceImpl.java`
```java
@Override
@Transactional(readOnly = true)
public DeveloperStatsResponse getDeveloperStats(UUID developerId) {
    DeveloperProfile dev = developerRepository.findById(developerId)
            .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + developerId));

    int connectionsCount = (int) connectionRepository.countByDeveloperId(developerId);
    int projectsCount;
    int blogsCount;

    if (dev.getUser() != null) {
        projectsCount = (int) projectRepository.countByAuthorId(dev.getUser().getId());
        blogsCount = (int) blogRepository.countByAuthorIdAndStatus(dev.getUser().getId(), BlogStatus.PUBLISHED);
    } else {
        projectsCount = (int) projectRepository.countByAuthorNameIgnoreCase(dev.getName());
        blogsCount = (int) blogRepository.countByAuthorNameIgnoreCaseAndStatus(dev.getName(), BlogStatus.PUBLISHED);
    }

    List<Integer> activityData = List.of(projectsCount, blogsCount, connectionsCount);
    List<String> activityLabels = List.of("Projects", "Blogs", "Connections");

    return new DeveloperStatsResponse(projectsCount, blogsCount, connectionsCount, activityData, activityLabels);
}
```
The exact same logic is mapped to `toDeveloperResponseWithStats` and `toggleConnection`.

### 5.4 Response DTO Preservation
The existing response DTOs:
- `DeveloperStatsResponse` (`projectsCount`, `blogsCount`, `connectionsCount`, `activityData`, `activityLabels`)
- `DeveloperResponse` (`id`, `name`, `role`, `description`, `location`, `avatar`, `skills`, `projectsCount`, `blogsCount`, `connectionsCount`, `connected`)
- `ConnectionStatusResponse` (`developerId`, `connected`, `totalConnections`)

remain completely identical in field structure and types.

---

## 6. Comprehensive Concurrency Test Suite Specification

A new integration test suite `backend/src/test/java/com/devsphere/service/ProjectConcurrencyTest.java` will be implemented to rigorously validate concurrency safety across all 7 required scenarios.

### 6.1 Test Harness & Synchronization Mechanisms
- **Thread Pool:** `ExecutorService executor = Executors.newFixedThreadPool(threads)`
- **Simultaneous Start Synchronization:** `CountDownLatch readyLatch` + `CountDownLatch startLatch = new CountDownLatch(1)` ensures all threads strike the target endpoint at the exact same millisecond.
- **Completion Tracking:** `CountDownLatch doneLatch = new CountDownLatch(threads)` with `doneLatch.await(30, TimeUnit.SECONDS)`.

### 6.2 Detailed Specifications for the 7 Required Concurrency Scenarios

#### Scenario 1: 100 Simultaneous Project View Increments
- **Setup:** Create a test project with `views = 0`.
- **Execution:** 100 concurrent threads execute `projectService.incrementViews(projectId)`.
- **Assertions:**
  - All 100 calls succeed without exception.
  - Final database state: `projectRepository.findById(projectId).get().getViews() == 100`.
  - Zero lost updates.

#### Scenario 2: Simultaneous Likes from 20 Distinct Users
- **Setup:** Create 1 test project (`likes = 0`) and 20 distinct registered test users.
- **Execution:** 20 concurrent threads simultaneously call `toggleLike(projectId, userId_i)`.
- **Assertions:**
  - All 20 calls complete successfully, returning `liked = true`.
  - Persisted `ProjectLike` records count is exactly 20: `projectLikeRepository.countByProjectId(projectId) == 20`.
  - Final project entity likes count is exactly 20: `projectRepository.findById(projectId).get().getLikes() == 20`.

#### Scenario 3: Simultaneous Duplicate Likes from the Same User
- **Setup:** 1 test project (`likes = 0`) and 1 test user.
- **Execution:** 10 concurrent threads simultaneously call `toggleLike(projectId, userId)`.
- **Assertions:**
  - No thread throws unhandled 500 or uncaught database exception.
  - Final persisted `ProjectLike` count for this user on this project is strictly `<= 1`.
  - `project.getLikes() == projectLikeRepository.countByProjectId(projectId)`.
  - Database unique constraint `uq_project_user_like` is never breached.

#### Scenario 4: Simultaneous Unlike Requests
- **Setup:** 1 test project and 1 user who has already liked the project (`project_likes` has 1 row, `project.likes = 1`).
- **Execution:** 10 concurrent threads simultaneously call `toggleLike(projectId, userId)` attempting to unlike.
- **Assertions:**
  - Final `project.getLikes()` is strictly `0` (never drops below 0, never decrements multiple times).
  - Persisted `ProjectLike` rows count is strictly `0`.
  - Invariant holds: `project.likes == countByProjectId`.

#### Scenario 5: Mixed Like and Unlike Requests
- **Setup:** 1 test project. 10 users already liked the project (`likes = 10`). 10 new users have not liked.
- **Execution:** 20 concurrent threads execute simultaneously: the 10 existing users execute unlike; the 10 new users execute like.
- **Assertions:**
  - Zero deadlocks.
  - Final persisted `ProjectLike` count equals 10 (the 10 new users).
  - Final `project.getLikes()` equals exactly 10.
  - Each specific user has the exact expected `ProjectLike` persistence record.

#### Scenario 6: Final Database Count Consistency Invariant
- **Setup:** 1 test project with 5 distinct users.
- **Execution:** 50 randomized concurrent toggle calls across the 5 users.
- **Assertions:**
  - Regardless of interleaving order, the core relational invariant holds:
    `assertEquals(projectLikeRepository.countByProjectId(projectId), (long) projectRepository.findById(projectId).get().getLikes());`
  - Demonstrates that like counters never drift from persisted records under sustained contention.

#### Scenario 7: Correct Behavior When a Project Does Not Exist
- **Setup:** Generate `UUID nonExistentId = UUID.randomUUID()`.
- **Execution:** 20 concurrent threads attempt `incrementViews(nonExistentId)` and `toggleLike(nonExistentId, userId)`.
- **Assertions:**
  - Every single execution throws `ResourceNotFoundException`.
  - No orphaned records are created in `project_likes`.
  - No database locks remain orphaned or hung.

---

## 7. Comprehensive Rollback & Recovery Strategy

### 7.1 Layered Rollback Procedures

| Layer | Rollback Procedure | Verification Check |
| :--- | :--- | :--- |
| **Java Code** | `git checkout -- backend/src/main/java backend/src/test` | `git status` clean |
| **Database State** | Execute anti-overwrite restore: snapshot active state -> copy verified snapshot -> verify SHA-256 | H2 boots without error; row counts match pre-3B baseline |
| **Configuration** | `git checkout -- backend/src/main/resources/application.properties` | `git diff` clean |
| **Services** | Restart Spring Boot processes cleanly | Health endpoints return HTTP 200 |

### 7.2 Post-Implementation Verification Checklist
Before Stage 3B is declared complete:
- [ ] Clean database backup taken, SHA-256 verified, and restorability proven.
- [ ] All 7 concurrency tests in `ProjectConcurrencyTest.java` pass cleanly.
- [ ] Existing `ProjectServiceTest.java`, `BlogServiceTest.java`, `DeveloperControllerTest.java` pass with 100% success.
- [ ] No hardcoded numbers (`186`, `12`, `24`) exist in the codebase.
- [ ] Full backend build passes: `mvn clean test` exits with code 0.
- [ ] Frontend API contract validation confirms zero breaking changes.

---

## 🛑 STRICT STOP CONDITION MET

The final technical refinement and specification are complete.  
**Zero code or configuration files have been modified.**

Awaiting your explicit approval to begin implementation of Stage 3B.
