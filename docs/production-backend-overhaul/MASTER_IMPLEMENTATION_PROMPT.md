# DevSphere — Master Implementation Prompt

**Prompt Reference:** DevSphere Production Backend & Frontend Overhaul  
**Target Execution:** To be executed ONLY upon Product Owner approval  
**Architecture Baseline:** Spring Boot 3.4.3 / Java 21 / React 18 / Supabase PostgreSQL  
**Document Location:** `docs/production-backend-overhaul/MASTER_IMPLEMENTATION_PROMPT.md`  

---

```markdown
# TASK INSTRUCTION FOR DEVSphere ENGINEERING AGENT

You are tasked with executing the production overhaul of the DevSphere application based on the verified findings in the Stage 1–3 audits and Master Verification reports.

This is a brownfield remediation task. You must preserve DevSphere's existing product identity as a Developer Community and Portfolio Platform. Do not introduce unrelated LMS, recruitment, or generic social clone features.

All backend endpoints must remain 100% backward-compatible with existing API contracts.

---

## 1. VERIFIED BASELINE ARCHITECTURE

1. **Authoritative Backend (`backend/`):**
   - Runtime: Spring Boot 3.4.3, Java 21, Spring Security 6, JJWT (0.12.6), PostgreSQL / Flyway.
   - Operating Port: `8080`.
   - Test Baseline: 31 passing tests (including `ProjectConcurrencyTest` with pessimistic locking).
2. **Authoritative Frontend (`src/`):**
   - Runtime: React 18.3.1, Vite 6.0.1, React Router DOM 6.28.0.
   - API Client: `src/services/api.js` (pointing to `http://localhost:8080`).
3. **Database:**
   - Supabase PostgreSQL (Managed PostgreSQL 15+).
   - Single standard schema: `public`.

---

## 2. EXACT FILES AND MODULES REQUIRING REMEDIATION

### Module A: Frontend Security & Auth Hardening (MANDATORY)
1. **`src/pages/Login.jsx`**
   - Lines 51–59: Remove the catch-block that automatically invokes `login(emailValue)` on authentication errors.
   - Requirement: On API failure, display an honest error banner: `"Invalid email or password. Please try again."` or network error notice. Do not set authenticated context state without a verified JWT.
2. **`src/pages/Signup.jsx`**
   - Lines 55–72: Remove the fallback that writes raw `{ username, email, password }` into browser `localStorage("users")`.
   - Requirement: If registration fails, display the backend validation message without saving unhashed passwords to the client browser.
3. **`src/context/DevSphereContext.jsx`**
   - Lines 61: Ensure `isAuthenticated` requires both a valid `jwt_token` and `currentUser`, rather than checking only the presence of a string in `localStorage("loggedInUser")`.

### Module B: Backend Security & Privacy Hardening (MANDATORY)
1. **`backend/src/main/java/com/devsphere/service/impl/BlogServiceImpl.java`**
   - In `getBlogById(UUID id, UUID currentUserId)`: Check if `blog.getStatus() == BlogStatus.DRAFT`. If draft and `currentUserId` is not the author (and not `ROLE_ADMIN`), throw `ForbiddenException("Draft blogs are private to the author")`.
2. **`backend/src/main/java/com/devsphere/config/SecurityConfig.java`**
   - In `filterChain`: Explicitly specify `.requestMatchers(HttpMethod.GET, "/api/v1/blogs/drafts").authenticated()` before the general `.requestMatchers(HttpMethod.GET, "/api/v1/blogs/**").permitAll()` matcher.
3. **`backend/src/main/resources/application.properties`**
   - Replace the weak default JWT secret fallback with a configuration check or require `DEVSphere_JWT_SECRET` in production.

### Module C: Frontend-to-Backend Full Stack Wiring (MANDATORY)
1. **`src/pages/Developers.jsx`**
   - Replace static `import { developers } from "../data/developers"` with `developersApi.getAll({ query })`.
   - Add loading and error states while preserving the existing card grid and styling.
2. **`src/pages/DeveloperProfile.jsx`**
   - Wire profile view to fetch the selected developer via `developersApi.getById(id)` or `developersApi.getByName(name)` rather than reading strictly from localStorage.
   - Connect the "+ Connect" button to `developersApi.toggleConnect(developerId)`.
3. **`src/islands/ProfileChart.jsx`**
   - Fix the API call in line 32: pass `dev.id` (UUID) instead of `dev.name` to `developersApi.getStats(id)`.
4. **`src/pages/Blogs.jsx`**
   - Wire to `blogsApi.getAll({ category, search: query })` instead of reading solely from `localStorage` and `blogs.js`.
5. **`src/pages/WriteBlog.jsx`**
   - In `handlePublish`: Invoke `await blogsApi.create({ title, category, content, tech, tags, draft: false })`.
   - In `handleSaveDraft`: Invoke `await blogsApi.create({ title, category, content, tech, tags, draft: true })`.
   - Add error handling; only navigate upon successful HTTP 201 response.
6. **`src/components/layout/Navbar.jsx`**
   - Make the username `<span>` a clickable `<NavLink to="/developer-profile">`.
7. **`src/pages/Home.jsx`**
   - Fix line 74: Change `navigate("/blogs")` on "Start writing" to `navigate("/write-blog")`.

### Module D: Missing Core Capabilities (REQUIRES PO APPROVAL)
1. **Developer Profile Editing:**
   - Backend: Create DTO `UpdateDeveloperRequest.java`. Add `PUT /api/v1/developers/me` in `DeveloperController.java` with service method in `DeveloperServiceImpl.java` validating ownership.
   - Frontend: Add "Edit Profile" modal in `DeveloperProfile.jsx` allowing users to edit bio, location, role, and technical skills.
2. **Project Submission Modal:**
   - Frontend: Build a modal in `src/pages/Projects.jsx` linked to the "+ Submit project" button. Collect `title`, `category`, `description`, and `technologies`. Call `projectsApi.create(...)`.

### Module E: Ethical UX & Performance Optimization (OPTIONAL / PO APPROVAL)
1. **`backend/src/main/java/com/devsphere/service/impl/StatsServiceImpl.java`**
   - Remove fake base increments (`+9994` devs, `+2494` blogs, `+1194` projects). Return real database counts:
     ```java
     long developersCount = developerRepository.count();
     long blogsCount = blogRepository.countByStatus(BlogStatus.PUBLISHED);
     long projectsCount = projectRepository.count();
     long countriesCount = developerRepository.countDistinctLocations();
     ```
2. **`src/pages/About.jsx`**
   - Remove fake target numbers (`[12500, 3400, 1850, 48]`). Display real live counts or neutral founding metrics.
3. **`DeveloperServiceImpl.java`**
   - Optimize `getDevelopers` to eliminate N+1 queries by using an aggregated projection or single join query for counts.

---

## 3. DATABASE MIGRATION REQUIREMENTS

1. **Supabase Schema Target:**
   - Execute in standard `public` schema. Do not partition into 4 sub-schemas.
2. **Migration Script Alignment (`V3__align_seed_data.sql`):**
   - Generate initial rows in `project_likes` for seeded project like counts so that subsequent likes do not collapse the counter to 1.
   - Update seeded `developer_profiles` to set `user_id` referencing existing user records.

---

## 4. TEST AND VERIFICATION REQUIREMENTS

1. **Unit & Integration Tests:**
   - Add test in `AuthControllerTest.java` verifying invalid login returns 401 and does not issue JWT.
   - Add test in `BlogControllerTest.java` verifying that requesting a draft blog by ID as an unauthenticated or non-author user returns 403 Forbidden.
   - Add test in `DeveloperControllerTest.java` verifying `PUT /api/v1/developers/me`.
2. **Execution Gate:**
   - `mvn clean test -f backend/pom.xml` must pass 100% (minimum 34 passing tests).
   - `npm run build` must succeed with zero errors.

---

## 5. ROLLBACK REQUIREMENTS

1. If any database migration fails:
   - Roll back to the pre-migration database snapshot.
   - Flyway migration scripts must be versioned sequentially (`V3__...`) to allow clean rollback.
2. If frontend changes break API connectivity:
   - Retain cached API fallbacks in an isolated service wrapper without compromising authentication boundaries.

---

## 6. MEASURABLE ACCEPTANCE CRITERIA

- [ ] Entering an incorrect password on `/login` displays an error and does NOT navigate to `/` or log in.
- [ ] Users can write a blog on `/write-blog` and see it appear immediately in `/blogs` via `GET /api/v1/blogs`.
- [ ] Draft blogs cannot be read via `GET /api/v1/blogs/{id}` by unauthenticated users.
- [ ] Registered users can update their profile bio and technical skills.
- [ ] Clicking "+ Submit project" opens a form that persists a new project to the database.
- [ ] Platform statistics reflect genuine database records without artificial inflation.
- [ ] 100% of backend tests pass (`mvn test`).
```

