# DevSphere — Business Logic & API Verification

**Document Type:** Feature-by-Feature Business Logic, API Flow & Data Integrity Analysis  
**Date:** 2026-10-31  
**Project:** DevSphere — Developer Community and Portfolio Platform  
**Target Environment:** Spring Boot 3.4.3 / Java 21 / PostgreSQL / React 18  
**Audit Classification:** READ-ONLY Verification  

---

## 1. Complete Frontend-to-Backend Flow Tracing

We traced every core user journey across the full stack:
$$\text{React Component} \longrightarrow \text{API Client} \longrightarrow \text{HTTP REST} \longrightarrow \text{Spring Controller} \longrightarrow \text{Service Layer} \longrightarrow \text{JPA Repository} \longrightarrow \text{Database} \longrightarrow \text{DTO Mapper} \longrightarrow \text{React State} \longrightarrow \text{UI}$$

---

### Flow 1: New User Registration & Auto-Provisioning

```
[Signup.jsx] Form submit (username, email, password)
   |
   v
[api.js] authApi.register(username, email, password)
   |
   v
[POST /api/v1/auth/register] JSON Body: RegisterRequest
   |
   v
[AuthController.java] register(@Valid @RequestBody RegisterRequest)
   |
   v
[AuthServiceImpl.java] register(request)
   |-- 1. Check duplicate email: userRepository.existsByEmail(email)
   |-- 2. Check duplicate username: userRepository.existsByUsername(username)
   |-- 3. Hash password: passwordEncoder.encode(rawPassword) (BCrypt)
   |-- 4. Save User: userRepository.save(user) -> INSERT INTO users
   |-- 5. Auto-provision DeveloperProfile:
   |      new DeveloperProfile(username, "Developer", bio, location, avatar, skills)
   |      profile.setUser(savedUser)
   |      developerProfileRepository.save(profile) -> INSERT INTO developer_profiles
   |-- 6. Issue JWT: tokenProvider.generateToken(UserPrincipal.create(savedUser))
   v
[AuthResponse.java] (token, UserResponse)
   |
   v
[api.js] Stores jwt_token in localStorage; returns response
   |
   v
[Signup.jsx] State updated: Displays success message. Form cleared.
```

**Verification Assessment:**
- **Backend Flow:** **VERIFIED / FUNCTIONAL**. The user and associated developer profile are transactionally persisted, and a valid JJWT is issued.
- **Frontend Defect:** If the network request fails or duplicate email error is returned, `Signup.jsx` catch-block writes `{ username, email, password }` into browser `localStorage("users")` in plaintext and presents a fake local success message.

---

### Flow 2: User Authentication & JWT Handling

```
[Login.jsx] Form submit (email, password)
   |
   v
[api.js] authApi.login(email, password)
   |
   v
[POST /api/v1/auth/login] JSON Body: LoginRequest
   |
   v
[AuthController.java] login(@Valid @RequestBody LoginRequest)
   |
   v
[AuthServiceImpl.java] login(request)
   |-- 1. authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password))
   |-- 2. DaoAuthenticationProvider verifies BCrypt hash against users table
   |-- 3. CustomUserDetailsService loads UserPrincipal
   |-- 4. tokenProvider.generateToken(principal)
   v
[AuthResponse.java] (token, UserResponse)
   |
   v
[api.js] Stores jwt_token in localStorage
   |
   v
[Login.jsx] Context login(email); navigates to "/"
```

**Verification Assessment:**
- **Backend Flow:** **VERIFIED / SECURE**. Correctly validates credentials, rejects invalid passwords with 401 Unauthorized via `BadCredentialsException`.
- **Frontend Critical Defect:** `Login.jsx` wraps this call in a `try...catch` that calls `login(emailValue)` on error, bypassing authentication completely and logging the user into the client app even if the backend rejected the credentials.

---

### Flow 3: Community Projects Discovery & Filtering

```
[Projects.jsx] useEffect on [category, query, sort]
   |
   v
[api.js] projectsApi.getAll({ category, search: query, sort, page: 0, size: 20 })
   |
   v
[GET /api/v1/projects?category=...&search=...&sort=...&page=0&size=20]
   |
   v
[ProjectController.java] getProjects(category, search, sort, pageable, principal)
   |
   v
[ProjectServiceImpl.java] getProjects(...)
   |-- 1. Evaluates sort order (Latest, Most Liked, Most Viewed)
   |-- 2. projectRepository.searchProjects(category, query, pageable)
   |-- 3. For each project: checks if current user liked it:
   |      projectLikeRepository.existsByProjectIdAndUserId(projectId, currentUserId)
   |-- 4. mapper.toProjectResponse(project, isLiked)
   v
[PagedResponse<ProjectResponse>]
   |
   v
[Projects.jsx] State updated: setItems(list), setLikedTitles(backendLiked)
   |
   v
[UI] Renders list of ProjectCard components with live counters and like states
```

**Verification Assessment:**
- **Full Path:** **VERIFIED / OPERATIONAL**. The filtering, searching, sorting, and user like recognition work cleanly end-to-end between React and Spring Boot.

---

### Flow 4: Project Like Concurrency & Toggle

```
[ProjectCard.jsx] Click "Like" button
   |
   v
[Projects.jsx] handleLike(project) -> Optimistic counter increment
   |
   v
[api.js] projectsApi.toggleLike(project.id)
   |
   v
[POST /api/v1/projects/{id}/like] (Header: Authorization: Bearer <token>)
   |
   v
[ProjectController.java] toggleLike(id, principal)
   |
   v
[ProjectServiceImpl.java] toggleLike(projectId, currentUserId)
   |-- 1. Checks currentUserId != null (throws 401 if unauthenticated)
   |-- 2. projectRepository.findByIdWithLock(projectId) [PESSIMISTIC_WRITE lock]
   |-- 3. projectLikeRepository.findByProjectIdAndUserId(projectId, currentUserId)
   |-- 4. If present: delete(like), liked = false
   |      If absent: try save(like), catch DataIntegrityViolationException, liked = true
   |-- 5. projectRepository.synchronizeLikeCount(projectId) ->
   |      UPDATE projects SET likes = (SELECT COUNT(*) FROM project_likes WHERE project_id = :id)
   |-- 6. mapper.toProjectResponse(updated, liked)
   v
[ProjectResponse.java] (id, title, likes, views, likedByCurrentUser)
   |
   v
[Projects.jsx] Synchronizes state with authoritative backend response
```

**Verification Assessment:**
- **Full Path:** **VERIFIED / CONCURRENCY PROTECTED**. Verified through 20-thread and duplicate-submit concurrency tests in `ProjectConcurrencyTest.java`.
- **Data Gap:** Seeded projects in `V2` migration have hardcoded initial likes (e.g. 128) but zero rows in `project_likes`. The first like toggle triggers `synchronizeLikeCount`, collapsing the counter to 1.

---

### Flow 5: Blog Authoring, Drafting, and Publishing

```
[WriteBlog.jsx] Form input (title, category, content, tags)
   |
   v
[handlePublish()] / [handleSaveDraft()]
   |
   X  BREAK IN PATH: Does NOT invoke blogsApi.create()!
   v
[localStorage.setItem("publishedBlogs" / "drafts")]
   |
   v
[Navigate to /blogs]
```

**Verification Assessment:**
- **Authoritative Backend Flow:** `POST /api/v1/blogs` in `BlogController.java` is fully implemented and tested. It enforces authentication, maps author identity, computes word-count reading time (`calculateReadTime`), sets `BlogStatus.DRAFT` or `PUBLISHED`, and persists tags into `blog_tags`.
- **Frontend Disconnect:** `src/pages/WriteBlog.jsx` never calls `blogsApi.create()`. It writes exclusively to browser `localStorage`. Content authored by users never reaches the database or other community members.

---

## 2. Comprehensive Feature-by-Feature Matrix

| Feature | Intended Purpose | User Expectation | Actual Implementation | Failure Scenarios & Edge Cases | Security & Consistency Impact | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Registration** | Onboard new developers with credentials and profile. | Secure creation of account with immediate session. | Creates `User` and `DeveloperProfile` in DB. Falls back to plaintext password in localStorage. | Duplicate username or email throws 409 Conflict. | HIGH: Plaintext password exposure in browser storage. | Remove local fallback in `Signup.jsx`. Display backend validation errors cleanly. |
| **User Login** | Authenticate registered user with credentials. | Rejects bad passwords; grants access on valid credentials. | Authenticates via Spring Boot. On error, signs user in locally anyway. | Server down or bad password logs user in locally with zero API capabilities. | CRITICAL: Complete client-side auth bypass. | Remove silent catch-block in `Login.jsx`. Require verified JWT before granting authenticated session. |
| **Developer Profile Edit** | Allow developers to showcase skills and bio. | Developers can edit their own role, bio, location, and skills. | **MISSING**. No edit UI, no backend `PUT /api/v1/developers` endpoint. | Users cannot update default placeholder bio. | MODERATE: Destroys core platform utility as a developer portfolio. | Add `PUT /api/v1/developers/me` in `DeveloperController` and build profile edit modal in React. |
| **Developer Discovery** | Browse and search community engineers. | Real-time database search of community developers. | `Developers.jsx` searches static mock array `developers.js`. | Database developers created after seed are invisible. | HIGH: Community disconnection; dynamic users hidden. | Wire `Developers.jsx` to `developersApi.getAll({ query })`. |
| **Developer Connections** | Build a developer professional network. | One connection per developer-user pair. Toggleable. | Backend enforces composite unique key `uq_dev_user_connection`. `DeveloperProfile.jsx` uses local state. | Clicking connect in `DeveloperProfile.jsx` does not update DB. | MODERATE: Connections are not synchronized or stored in DB. | Connect `DeveloperProfile.jsx` to `developersApi.toggleConnect(id)`. |
| **Developer Statistics** | Display dynamic developer metrics (projects, blogs, connections). | Real counts based on authored projects and published blogs. | Backend queries real counts (`countByAuthorId`, `countByDeveloperId`). UI passes developer name instead of UUID. | Calling `/stats` with name fails with HTTP 400 Type Mismatch. | MODERATE: API contract mismatch crashes chart stats fetch. | Fix `ProfileChart.jsx` to pass `selectedDeveloper.id` (UUID) to `getStats(id)`. |
| **Project Submission** | Enable developers to showcase their software. | Submitting form creates project with technologies list. | Backend `POST /api/v1/projects` is ready. Frontend button shows placeholder message. | Users cannot publish projects via the UI. | HIGH: Core portfolio capability blocked for end users. | Build project submission modal in `Projects.jsx` wired to `projectsApi.create()`. |
| **Project Like Toggle** | Community feedback on projects. | 1 like per user; consistent counter. | Protected with pessimistic write lock and database unique constraint. | Seeded projects with initial like counts collapse to 1 upon like toggle. | MODERATE: Data inconsistency between seed data and live count sync. | Backfill seed data in `project_likes` table for initial project likes. |
| **Project View Counting** | Track project interest. | Increments once per project visit. | Atomic SQL update `views = views + 1`. Triggered on card view. | Repeated rapid requests increment view counter without rate limit. | LOW: View counter manipulation possible without rate limiting. | Implement IP/User session rate limiting on `POST /api/v1/projects/{id}/view`. |
| **Blog Drafting & Publishing** | Author articles and save draft work. | Drafts remain private; published articles visible publicly. | Backend supports `DRAFT` vs `PUBLISHED`. Frontend only saves to localStorage. `getBlogById` leaks drafts. | Accessing `/api/v1/blogs/{id}` directly returns draft to non-author. | HIGH: Privacy violation; unpublished drafts accessible by UUID. | Enforce ownership check in `BlogServiceImpl.getBlogById`. Wire `WriteBlog.jsx` to `blogsApi.create()`. |
| **Blog Draft Privacy** | Prevent public viewing of draft articles. | Only author can view or publish drafts. | `/api/v1/blogs/drafts` requires auth. But `GET /{id}` has no draft check. | An attacker guessing or enumerating UUIDs reads drafts. | HIGH: Confidentiality breach of pre-release technical articles. | Update `getBlogById` to return 403/404 if status is DRAFT and user is not author or admin. |

---

## 3. Concurrency & Data Consistency Audit

### 3.1 Project Likes Race Conditions
- **Previous Vulnerability:** `project.setLikes(project.getLikes() + 1)` and `projectRepository.save(project)` allowed concurrent read-modify-write lost updates.
- **Stage 3B Verification:** In `ProjectServiceImpl.java`, the method acquires `findByIdWithLock(projectId)` (Pessimistic Write lock), checks existing likes, handles duplicate-submit collisions via `DataIntegrityViolationException`, and executes atomic SQL synchronization:
  ```sql
  UPDATE projects SET likes = (SELECT COUNT(*) FROM project_likes WHERE project_id = :id) WHERE id = :id;
  ```
- **Remaining Gap:** No multi-threaded test currently verifies mixed concurrent likes and unlikes executed simultaneously on the same target.

### 3.2 Developer Statistics N+1 Query Problem
In `DeveloperServiceImpl.java`:
```java
public PagedResponse<DeveloperResponse> getDevelopers(String query, Pageable pageable, UUID currentUserId) {
    Page<DeveloperProfile> page = developerRepository.searchDevelopers(query, pageable);
    List<DeveloperResponse> content = page.getContent().stream()
            .map(dev -> toDeveloperResponseWithStats(dev, currentUserId))
            .toList();
    ...
```
For each developer profile, `toDeveloperResponseWithStats` executes:
1. `connectionRepository.existsByDeveloperIdAndUserId(...)`
2. `connectionRepository.countByDeveloperId(...)`
3. `projectRepository.countByAuthorId(...)`
4. `blogRepository.countByAuthorIdAndStatus(...)`

**Impact:** A single page request of 20 developers issues **81 sequential SQL queries** against the database. Under concurrent user traffic, this will saturate database connection pools.  
**Production Fix:** Implement a single aggregated projection query using SQL `GROUP BY` and `LEFT JOIN` or subqueries.

