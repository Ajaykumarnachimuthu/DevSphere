# DevSphere — Page-by-Page Functional Documentation

**Course:** FULL STACK WEB DEVELOPMENT (21CSE354T)  
**Activity:** Spring Boot Framework – Part 1  
**Student Name:** AJAYKUMAR N (Reg. No: RA2411003012107)  
**System Architecture:** Vite Multi-Page Application (MPA) with React Islands & React SPA System  
**Verified Page Inventory:** 9 Implemented Pages

---

## Page Inventory Summary

| # | Page Name | MPA Entry Point | SPA Route | Primary Frontend Component | Connected Backend Endpoint(s) | Primary Purpose |
|:---:|---|---|---|---|---|---|
| **1** | **Home** | `frontend/index.html` | `/` | `<HomeIsland />` & `<Home />` | `GET /api/v1/auth/me` (optional session sync) | Community landing portal & welcome hero |
| **2** | **Login** | `frontend/login.html` | `/login` | `<LoginForm />` & `<Login />` | `POST /api/v1/auth/login` | Secure JWT authentication & credential verification |
| **3** | **Signup** | `frontend/signup.html` | `/signup` | `<SignupForm />` & `<Signup />` | `POST /api/v1/auth/register` | User onboarding & automated developer profile creation |
| **4** | **Blogs** | `frontend/BlogPage.html` | `/blogs` | `<BlogIsland />` & `<Blogs />` | `GET /api/v1/blogs` | Searchable & category-filtered technical article feed |
| **5** | **Write Blog** | `frontend/writeBlog.html` | `/write-blog` | `<WriteBlogIsland />` & `<WriteBlog />` | `POST /api/v1/blogs`, `GET /api/v1/blogs/drafts` | Story composition, character counting, draft saving, publishing |
| **6** | **Developers** | `frontend/Developers.html` | `/developers` | `<DevelopersIsland />` & `<Developers />` | `GET /api/v1/developers` | Directory search, skill tag filtering, and member profiles |
| **7** | **Developer Profile**| `frontend/DeveloperProfile.html` | `/developer-profile` | `<ProfileChart />` & `<DeveloperProfile />` | `GET /api/v1/developers/{id}/stats`, `POST /api/v1/developers/{id}/connect` | Individual developer portfolio, Chart.js activity visualizer, peer networking |
| **8** | **Projects** | `frontend/Projects.html` | `/projects` | `<ProjectsIsland />` & `<Projects />` | `GET /api/v1/projects`, `POST /api/v1/projects/{id}/like` | Community showcase, multi-criteria sorting, atomic like toggling |
| **9** | **About** | `frontend/About.html` | `/about` | `<AboutStats />` & `<About />` | `GET /api/v1/stats/overview` | Platform mission, architectural vision, live animated metrics |

---

## Detailed Page Breakdowns

---

### PAGE 1: Home (Landing Portal)
- **ROUTE:** `/` (SPA) & `frontend/index.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page1_home.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page1_home.png)

#### 1. Purpose
The Home page acts as the primary public entry point for DevSphere. It articulates the platform mission, introduces community capabilities (Blogs, Projects, Developers), and renders an interactive personalized greeting for returning authenticated developers.

#### 2. User Interface
- **Global Navigation Bar (`<Navbar />`):** Contains the DevSphere brand logo, navigation links (`Home`, `Blogs`, `Developers`, `Projects`, `About`), and dynamic action buttons ("Sign In" / "Register" when guest; "My Profile" / "Logout" when authenticated).
- **Hero Landmark Section:** High-impact heading, platform tagline, and call-to-action buttons ("Explore Projects", "Read Blogs", "Join Community").
- **`<HomeIsland />` Region (`#home-island-root`):** A reactive banner displaying `👋 Welcome back to DevSphere, {currentUser}!` when an authenticated session is active.
- **Platform Capability Grid:** Three feature cards highlighting technical blogging, project repositories, and developer networking.
- **Footer Landmark (`<Footer />`):** Copyright notices, terms, and community links.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Join Community** | Click button | Mouse click | `navigate('/signup')` | None (Client Route) | N/A | Navigates to `/signup` |
| **Explore Projects** | Click button | Mouse click | `navigate('/projects')` | None (Client Route) | N/A | Navigates to `/projects` |
| **Read Blogs** | Click button | Mouse click | `navigate('/blogs')` | None (Client Route) | N/A | Navigates to `/blogs` |
| **Cross-Tab Auth Sync** | User logs in/out in another tab | `storage` window event | `handleStorage` in `HomeIsland.jsx` | `GET /api/v1/auth/me` (optional) | GET | Banner reactively displays or unmounts |

#### 4. Step-by-Step Workflow
1. User navigates to `http://localhost:5173/` or opens `frontend/index.html`.
2. The browser loads the semantic HTML markup and Vite scripts.
3. React concurrently mounts `<HomeIsland />` into `<div id="home-island-root">`.
4. `HomeIsland` reads `localStorage.getItem("loggedInUser")`.
5. If a session token exists, the island renders the styled welcome badge.
6. A window event listener (`storage`) is registered to keep the banner in sync across multiple browser tabs.

#### 5. Success & Failure Scenarios
- **Success:** If logged in, welcome banner appears cleanly without page flicker. CTA links smoothly transition routes.
- **Failure:** If unauthenticated, the island returns `null`, leaving the static hero section clean and unobstructed.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/Home.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/Home.jsx), [`src/islands/HomeIsland.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/HomeIsland.jsx), [`frontend/index.html`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/frontend/index.html).
- **Backend Files:** Optional session verification via [`AuthController.java:44`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/AuthController.java#L44) (`/api/v1/auth/me`).

---

### PAGE 2: Login (Authentication Portal)
- **ROUTE:** `/login` (SPA) & `frontend/login.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page2_login.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page2_login.png)

#### 1. Purpose
Provides secure authentication for returning developers. Verifies credentials against server-side BCrypt password hashes, issues a signed JWT Bearer token, and initializes client state.

#### 2. User Interface
- **Authentication Card (`<AuthCard />`):** Centered card layout with DevSphere branding.
- **Email Input Field:** Controlled text input with HTML5 email validation and autofocus error recovery.
- **Password Input Group:** Controlled password input with a "Show / Hide" toggle button.
- **Status / Error Message Banner:** Contextual green or crimson notification alert.
- **Submit Button ("Sign In"):** Transitions to "Signing in..." with a disabled state during network latency.
- **Navigation Footer:** Link directing new users to the Signup page.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Email Input** | Type characters | User email string | `setEmail(e.target.value)` | None | N/A | State updated reactively |
| **Password Input** | Type characters | Password string | `setPassword(e.target.value)` | None | N/A | State updated reactively |
| **Show/Hide Password** | Click toggle | Mouse click | `setShowPassword(!showPassword)` | None | N/A | Input type toggles between `password` and `text` |
| **Sign In Submit** | Click / Enter | Credentials payload | `handleSubmit(e)` | `/api/v1/auth/login` | `POST` | Authenticates user, saves JWT, redirects to Home |

#### 4. Step-by-Step Workflow
1. User enters email and password into controlled inputs and clicks "Sign In".
2. `handleSubmit(e)` executes client-side validation:
   - Verifies email is not blank and matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
   - Verifies password length $\ge 6$ characters.
3. If invalid, focuses `emailInputRef` and displays error banner in crimson.
4. If valid, sets `loading=true` and calls `authApi.login(emailVal, password)`.
5. Request is dispatched over HTTP as JSON:
   ```json
   { "email": "ajay@devsphere.io", "password": "password123" }
   ```
6. **Backend Processing:**
   - `AuthController.login()` receives `LoginRequest` with `@Valid` constraints.
   - Delegates to `AuthServiceImpl.login()`.
   - `AuthenticationManager` authenticates against `CustomUserDetailsService` using BCrypt.
   - `JwtTokenProvider.generateToken()` generates an HMAC-SHA512 signed token.
   - Server returns `200 OK` with `AuthResponse` containing `token` and `UserResponse`.
7. **Frontend Handling:**
   - `localStorage.setItem('jwt_token', res.token)` and `localStorage.setItem('loggedInUser', res.user.email)`.
   - Updates `useAuth()` context.
   - Displays green alert: *"Login successful. Redirecting…"*.
   - Navigates user to Home (`./index.html` or `/`).

#### 5. Failure Scenarios
- **Invalid Email Format:** Client halts request immediately, displays *"Enter a valid email address."*, and focuses the input.
- **Short Password (< 6 chars):** Client halts request, displays *"Password must be at least 6 characters."*.
- **Wrong Password / Unregistered User:** Server returns `401 Unauthorized` (`ApiError` with `"Invalid email or password"`). Frontend displays error in crimson.
- **Offline / Fallback Resilience:** If the backend is temporarily offline, a fallback mechanism authenticates against previously stored local accounts.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/Login.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/Login.jsx), [`src/islands/LoginForm.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/LoginForm.jsx), [`src/services/api.js:73`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L73).
- **Backend Files:** [`AuthController.java:37`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/AuthController.java#L37), [`AuthServiceImpl.java:97`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/AuthServiceImpl.java#L97), [`LoginRequest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/dto/request/LoginRequest.java).
- **Automated Tests:** Verified by `AuthControllerTest.login_ValidCredentials_Returns200()` and `AuthServiceTest.login_Success()`.

---

### PAGE 3: Signup (User Onboarding)
- **ROUTE:** `/signup` (SPA) & `frontend/signup.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page3_signup.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page3_signup.png)

#### 1. Purpose
Allows new developers to create an account, enforce password strength guidelines, prevent duplicate registrations, and automatically provision a developer profile.

#### 2. User Interface
- **Form Card:** Clean layout featuring Username, Email, Password, and Confirm Password fields.
- **Dynamic Password Strength Indicator:** Real-time badge computing password complexity on every keystroke (`Weak` in crimson, `Medium` in orange, `Strong` in green).
- **Submit Button ("Register"):** Disabled during active network calls.
- **Navigation Footer:** Link directing registered users to the Login screen.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Username Input** | Type characters | Text string | `setForm({...form, username})` | None | N/A | State updated |
| **Email Input** | Type characters | Email string | `setForm({...form, email})` | None | N/A | State updated |
| **Password Input** | Type characters | Secret string | `setForm({...form, password})` | None | N/A | Updates state & dynamically re-evaluates strength meter |
| **Confirm Password** | Type characters | Secret string | `setForm({...form, confirmPassword})`| None | N/A | State updated |
| **Register Button** | Click / Enter | Registration payload | `handleSubmit(e)` | `/api/v1/auth/register` | `POST` | Registers account, auto-provisions profile, returns JWT |

#### 4. Step-by-Step Workflow
1. User completes form fields. As the user types their password, `strength` is calculated as a derived state value ($<6$ Weak, $<10$ Medium, $\ge 10$ Strong).
2. User clicks "Register".
3. `handleSubmit(e)` validates:
   - Username length $\ge 3$ characters.
   - Valid email syntax.
   - Password length $\ge 6$ characters.
   - Password matching: `form.password === form.confirmPassword`.
4. Client dispatches `POST /api/v1/auth/register`:
   ```json
   { "username": "newdev", "email": "newdev@devsphere.io", "password": "password123" }
   ```
5. **Backend Processing:**
   - `AuthController.register()` validates `RegisterRequest` (`@NotBlank`, `@Size(min=3)`, `@Email`).
   - `AuthServiceImpl.register()` checks `userRepository.existsByEmail()` and `existsByUsername()`.
   - Encodes password via `PasswordEncoder.encode()`.
   - Persists new `User` with `Role.ROLE_USER`.
   - **Business Rule Execution:** Automatically provisions a linked `DeveloperProfile` entity in `developer_profiles` table.
   - Issues a JWT Bearer token and returns `201 Created`.
6. Frontend clears form fields and displays: *"Account created. You can now log in."*.

#### 5. Failure Scenarios
- **Duplicate Email / Username:** Backend throws `DuplicateResourceException` (`409 Conflict`). Frontend intercepts response and alerts: *"Email or username is already registered."*.
- **Password Mismatch:** Handled client-side before any network traffic; alerts *"Passwords do not match."*.
- **Malformed Email:** Jakarta validation fails on the server (`400 Bad Request`); handled gracefully by `GlobalExceptionHandler`.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/Signup.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/Signup.jsx), [`src/islands/SignupForm.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/SignupForm.jsx), [`src/services/api.js:61`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L61).
- **Backend Files:** [`AuthController.java:30`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/AuthController.java#L30), [`AuthServiceImpl.java:57`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/AuthServiceImpl.java#L57), [`RegisterRequest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/dto/request/RegisterRequest.java).
- **Automated Tests:** Verified by `AuthControllerTest.register_ValidRequest_Returns201()`, `AuthControllerTest.register_InvalidEmail_Returns400()`, and `AuthServiceTest.register_DuplicateEmail_ThrowsException()`.

---

### PAGE 4: Blogs (Knowledge Sharing Feed)
- **ROUTE:** `/blogs` (SPA) & `frontend/BlogPage.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page4_blogs.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page4_blogs.png)

#### 1. Purpose
Presents a searchable, category-filtered catalog of technical articles published by developers. Articles include technology tags, estimated read time, author attribution, and creation dates.

#### 2. User Interface
- **Action Header:** Search bar with instantaneous live querying and a "Write a Blog" button.
- **Category Filter Pills:** Horizontally scrollable buttons: `All`, `Web Development`, `Mobile`, `AI / ML`, `DevOps`, `Technology`, `Programming`.
- **Blog Cards Grid (`<section className="blogGrid">`):** Responsive card layout displaying technology badge, article title, excerpt, author name, and read time.
- **Empty State Display:** Informative message rendered when no articles match current filter criteria.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Search Bar** | Type query | Search string | `setQuery(e.target.value)` | `/api/v1/blogs?search=...` | `GET` | Live feed filters as user types |
| **Category Pill** | Click category | Selected category | `setCategory(cat)` | `/api/v1/blogs?category=...` | `GET` | Feed filters by category |
| **Write a Blog** | Click button | Mouse click | `window.location.href = './writeBlog.html'` | None (Navigation) | N/A | Navigates to `/write-blog` |

#### 4. Step-by-Step Workflow
1. User opens `/blogs` or `frontend/BlogPage.html`.
2. `useEffect` in `<BlogIsland />` triggers whenever `category` or `query` changes.
3. Calls `blogsApi.getAll({ category, search: query })`.
4. Client dispatches HTTP request:
   ```http
   GET /api/v1/blogs?category=Web%20Development&search=Closures HTTP/1.1
   ```
5. **Backend Processing:**
   - `BlogController.getBlogs()` handles parameters with `@PageableDefault`.
   - Delegates to `BlogServiceImpl.getBlogs()`.
   - Executes JPQL query `blogRepository.searchBlogs(BlogStatus.PUBLISHED, category, query, pageable)`.
   - Transforms results to `PagedResponse<BlogResponse>`.
   - Returns `200 OK`.
6. Frontend updates `apiBlogs` state and renders articles in the grid.

#### 5. Failure Scenarios
- **Backend Offline:** Caught by `.catch()`; gracefully falls back to local curated dataset so the user experience is uninterrupted.
- **No Matching Results:** Renders `<p className="empty-state">No blogs found matching "{query}".</p>`.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/Blogs.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/Blogs.jsx), [`src/islands/BlogIsland.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/BlogIsland.jsx), [`src/services/api.js:130`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L130).
- **Backend Files:** [`BlogController.java:34`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/BlogController.java#L34), [`BlogServiceImpl.java:47`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/BlogServiceImpl.java#L47), [`BlogRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/BlogRepository.java).
- **Automated Tests:** Verified by `BlogControllerTest.getBlogs_ReturnsPagedBlogs()` and `BlogServiceTest.getBlogs_Success()`.

---

### PAGE 5: Write Blog (Content Creation Studio)
- **ROUTE:** `/write-blog` (SPA) & `frontend/writeBlog.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page5_write_blog.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page5_write_blog.png)

#### 1. Purpose
Provides a rich authoring environment for drafting, previewing, and publishing technical articles with tag management, word counting, and automated read-time calculation.

#### 2. User Interface
- **Editor Card:** Form layout containing Title, Category selector, Author display, Content textarea, and Tags input.
- **Character / Word Counter:** Live indicator showing `Characters: {content.length} / 5000`.
- **Action Buttons:**
  - `Save Draft`: Persists article with `status=DRAFT` without making it public.
  - `Preview / Hide Preview`: Toggles live markdown-style formatted reading preview.
  - `Publish Blog`: Submits article with `status=PUBLISHED`.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Title Input** | Type text | Blog title | `setTitle(e.target.value)` | None | N/A | State updated |
| **Category Select** | Select option | Category dropdown | `setCategory(e.target.value)` | None | N/A | State updated |
| **Story Textarea** | Type text | Story body ($\le 5000$ chars) | `handleContentChange(e)` | None | N/A | Updates content and character counter |
| **Tags Input** | Type comma-separated tags | String | `setTags(e.target.value)` | None | N/A | State updated |
| **Save Draft** | Click button | Form data | `handleSaveDraft()` | `/api/v1/blogs` (`draft=true`) | `POST` | Saves draft to backend and local storage |
| **Preview** | Click button | Mouse click | `setPreview(!preview)` | None | N/A | Toggles live preview section |
| **Publish Blog** | Click submit | Form data | `handlePublish(e)` | `/api/v1/blogs` (`draft=false`) | `POST` | Publishes article, redirects to `/blogs` |

#### 4. Step-by-Step Workflow
1. Author inputs title, selects category ("Technology", "Programming", etc.), and writes content.
2. Clicking "Preview" toggles `<section className="blog-preview">`, rendering the title, author metadata, and formatted paragraphs.
3. User clicks "Publish Blog".
4. `validate()` ensures Title, Category, and Content are present.
5. Invokes `blogsApi.create()` with Bearer JWT token in headers:
   ```json
   {
     "title": "Mastering Spring Data JPA",
     "category": "Technology",
     "content": "Deep dive into query derivation and entity relationships...",
     "tags": ["java", "spring", "jpa"],
     "draft": false
   }
   ```
6. **Backend Processing:**
   - `BlogController.createBlog()` intercepts authenticated user via `@AuthenticationPrincipal UserPrincipal`.
   - `BlogServiceImpl.createBlog()` computes read time using words-per-minute formula: $\max(1, \lceil \text{words} / 200 \rceil)$.
   - Associates blog with authenticated `User` entity.
   - Saves `Blog` in database (`blogRepository.save()`).
   - Returns `201 Created` with `BlogResponse`.
7. Frontend displays green confirmation *"Blog published successfully."* and redirects to `/blogs`.

#### 5. Failure Scenarios
- **Blank Title or Content:** Validation fails (`400 Bad Request`); returns `"Title, category and content are required."`.
- **Unauthenticated Write:** Server returns `401 Unauthorized`. Frontend preserves work in browser localStorage (`drafts`) so no user text is lost.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/WriteBlog.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/WriteBlog.jsx), [`src/islands/WriteBlogIsland.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/WriteBlogIsland.jsx), [`src/services/api.js:143`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L143).
- **Backend Files:** [`BlogController.java:58`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/BlogController.java#L58), [`BlogServiceImpl.java:72`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/BlogServiceImpl.java#L72), [`CreateBlogRequest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/dto/request/CreateBlogRequest.java).
- **Automated Tests:** Verified by `BlogControllerTest.createBlog_ValidRequest_Returns201()` and `BlogServiceTest.createBlog_Success()`.

---

### PAGE 6: Developers (Community Directory)
- **ROUTE:** `/developers` (SPA) & `frontend/Developers.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page6_developers.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page6_developers.png)

#### 1. Purpose
Provides a discovery portal to explore community developers, view their technical roles, inspect core skills (e.g. React, Java, Docker, Python), and navigate to detailed profile pages.

#### 2. User Interface
- **Directory Header:** Headline with active search input supporting instant multi-field keyword searching.
- **Developers Grid (`<section className="grid">`):** Card grid rendering developer initials avatar, full name, professional role, bio summary, skill tags, and a "View Profile" link.
- **Empty State Display:** Rendered when a search query yields zero matches.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Search Developers** | Type keyword | Search query | `setQuery(e.target.value)` | `/api/v1/developers?query=...` | `GET` | Live filtering of developers across name, role, bio, and skills |
| **View Profile** | Click link | Mouse click | `handleSelectDeveloper(dev)` | None (Prepares state) | N/A | Stores selected developer in localStorage and navigates to Profile |

#### 4. Step-by-Step Workflow
1. User opens `/developers` or `frontend/Developers.html`.
2. `useEffect` in `<DevelopersIsland />` dispatches `developersApi.getAll()`.
3. Dispatches HTTP `GET /api/v1/developers`.
4. **Backend Processing:**
   - `DeveloperController.getDevelopers()` queries `DeveloperServiceImpl.getDevelopers()`.
   - `DeveloperProfileRepository.searchDevelopers()` executes JPQL search across `name`, `role`, `bio`, and `skills`.
   - Computes live connection counts (`countByDeveloperId()`).
   - Returns `200 OK` with `PagedResponse<DeveloperResponse>`.
5. Frontend renders cards with dynamically colored avatars (`a1` through `a6`).
6. Clicking "View Profile" saves the developer object into `localStorage.setItem("selectedDeveloper", ...)` and navigates to `DeveloperProfile.html`.

#### 5. Failure Scenarios
- **Backend Offline:** Gracefully falls back to local `fallbackDevelopers` dataset.
- **No Search Match:** Displays *"No developers found matching '{query}'."*.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/Developers.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/Developers.jsx), [`src/islands/DevelopersIsland.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/DevelopersIsland.jsx), [`src/services/api.js:98`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L98).
- **Backend Files:** [`DeveloperController.java:30`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/DeveloperController.java#L30), [`DeveloperServiceImpl.java:48`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java#L48), [`DeveloperProfileRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/DeveloperProfileRepository.java).
- **Automated Tests:** Verified by `DeveloperControllerTest.getDevelopers_ReturnsPagedDevelopers()`.

---

### PAGE 7: Developer Profile (Portfolio & Interactive Activity Visualizer)
- **ROUTE:** `/developer-profile` (SPA) & `frontend/DeveloperProfile.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page7_developer_profile.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page7_developer_profile.png)

#### 1. Purpose
Showcases an individual developer's bio, location, skill tags, and activity metrics. Features an interactive Chart.js bar chart and a live peer-connection toggle button.

#### 2. User Interface
- **Profile Header Card:** Developer avatar, name, current role, location badge, and bio.
- **Action Toolbar:**
  - `+ Connect` / `✓ Connected` toggle button with dynamic styling.
  - `Message` button with feedback modal.
- **Chart.js Activity Visualizer (`<canvas ref={canvasRef} />`):** Canvas rendering a stylized bar chart comparing **Projects**, **Blogs**, and **Connections**.
- **Lifecycle Cleanup:** Guarantees that Chart.js canvas instances are destroyed upon unmount to eliminate memory leaks.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Connect / Disconnect**| Click button | Mouse click | `handleConnect()` | `/api/v1/developers/{id}/connect` | `POST` | Toggles connection in database, updates counter & chart |
| **Message** | Click button | Mouse click | Click handler | None (Informational) | N/A | Displays feedback message |
| **Chart Visualizer** | Automatic / Reactive | Activity numbers | `useEffect` with Chart.js | `/api/v1/developers/{id}/stats` | `GET` | Renders dynamic bar chart |

#### 4. Step-by-Step Workflow
1. User lands on `/developer-profile` (retrieves `selectedDeveloper` from storage).
2. `<ProfileChart />` dispatches `developersApi.getStats(dev.name)`.
3. Dispatches HTTP `GET /api/v1/developers/{id}/stats`.
4. **Backend Processing:**
   - `DeveloperController.getDeveloperStats()` calls `DeveloperServiceImpl.getDeveloperStats()`.
   - Counts total connections for developer in `developer_connections` table.
   - Returns `200 OK` with `DeveloperStatsResponse` (`projectsCount: 12`, `blogsCount: 24`, `connectionsCount: 186+`).
5. Frontend mounts Chart.js on `<canvas ref={canvasRef}>`.
6. User clicks `+ Connect`:
   - Optimistically updates UI to `✓ Connected`.
   - Dispatches `POST /api/v1/developers/{id}/connect` with JWT Bearer token.
   - `DeveloperServiceImpl.toggleConnection()` checks if record exists in `developer_connections`.
   - If present $\rightarrow$ deletes connection; if absent $\rightarrow$ inserts new `DeveloperConnection`.
   - Returns updated connection count.
   - Frontend updates `stats.connections` and re-renders the Chart.js canvas.

#### 5. Failure Scenarios
- **Unauthenticated Connect Attempt:** Server returns `401 Unauthorized`. Frontend preserves local client toggle state so interaction remains responsive.
- **Developer Not Found:** Server returns `404 Not Found` with `ApiError` envelope.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/DeveloperProfile.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/DeveloperProfile.jsx), [`src/islands/ProfileChart.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/ProfileChart.jsx), [`src/services/api.js:115`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L115).
- **Backend Files:** [`DeveloperController.java:64-79`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/DeveloperController.java#L64-L79), [`DeveloperServiceImpl.java:82-126`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/DeveloperServiceImpl.java#L82-L126), [`DeveloperConnectionRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/DeveloperConnectionRepository.java).
- **Automated Tests:** Verified by `DeveloperControllerTest.getDeveloperStats_ReturnsStats()`.

---

### PAGE 8: Projects (Community Repository Showcase)
- **ROUTE:** `/projects` (SPA) & `frontend/Projects.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page8_projects.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page8_projects.png)

#### 1. Purpose
Displays open-source engineering projects created by community developers. Supports category filtering, multi-field search, sorting by popularity, and atomic liking.

#### 2. User Interface
- **Header Toolbar:** Search input, category dropdown, sort selector (`Latest`, `Most Liked`, `Most Viewed`), and a `+ Submit Project` button.
- **Category Filter Pills:** Quick filters (`All`, `Web Development`, `Mobile`, `AI/ML`, `DevOps`, `Tools`, `UI/UX`).
- **Projects Grid (`<section className="grid">`):** Cards featuring styled thumbnail badges, category tag, title, description, technology stack tags, author name, like counter button, and view counter.
- **Empty State Display:** Rendered when no projects match search or filter queries.

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Search Projects** | Type query | Text string | `setQuery(e.target.value)` | `/api/v1/projects?search=...` | `GET` | Filters projects dynamically |
| **Category Select** | Change category | Dropdown / Pill click | `setCategory(...)` | `/api/v1/projects?category=...` | `GET` | Filters projects by domain |
| **Sort Select** | Select sort option | Sort criteria | `setSort(e.target.value)` | `/api/v1/projects?sort=...` | `GET` | Reorders projects (Latest, Most Liked, Most Viewed) |
| **Like Button (♥ / ♡)**| Click like icon | Project ID | `handleLike(projectTitle)` | `/api/v1/projects/{id}/like` | `POST` | Toggles like state, increments/decrements counter in database |
| **Submit Project** | Click button | Mouse click | Click handler | `/api/v1/projects` (modal) | `POST` | Initiates project creation flow |

#### 4. Step-by-Step Workflow
1. User navigates to `/projects` or `frontend/Projects.html`.
2. `useEffect` in `<ProjectsIsland />` queries `projectsApi.getAll({ category, search: query, sort })`.
3. Client dispatches `GET /api/v1/projects?category=Web%20Development&sort=Most%20Liked`.
4. **Backend Processing:**
   - `ProjectController.getProjects()` delegates to `ProjectServiceImpl.getProjects()`.
   - Constructs dynamic `Sort` predicate based on request parameter:
     - `Most Liked` $\rightarrow$ `Sort.by(Direction.DESC, "likes")`
     - `Most Viewed` $\rightarrow$ `Sort.by(Direction.DESC, "views")`
     - Default $\rightarrow$ `Sort.by(Direction.DESC, "createdAt")`
   - Checks `projectLikeRepository.existsByProjectIdAndUserId()` to identify if the current user has liked each project.
   - Returns `PagedResponse<ProjectResponse>`.
5. Frontend renders projects and reflects active like states.
6. User clicks the like button (`handleLike`):
   - **Optimistic UI:** Immediately increments `project.likes` and colors the heart red.
   - Dispatches `POST /api/v1/projects/{id}/like` with JWT Bearer token.
   - `ProjectServiceImpl.toggleLike()` queries `project_likes` join table.
   - If present: deletes like and decrements count. If absent: saves `ProjectLike` and increments count.
   - Returns updated `ProjectResponse`.

#### 5. Failure Scenarios
- **Unauthenticated Like Attempt:** Server responds with `401 Unauthorized`. Frontend preserves optimistic state locally so UI does not freeze.
- **Backend Offline:** Falls back to initial static project catalog.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/Projects.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/Projects.jsx), [`src/islands/ProjectsIsland.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/ProjectsIsland.jsx), [`src/services/api.js:171`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L171).
- **Backend Files:** [`ProjectController.java:32-81`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/ProjectController.java#L32-L81), [`ProjectServiceImpl.java:49-155`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java#L49-L155), [`ProjectRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/ProjectRepository.java), [`ProjectLikeRepository.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/repository/ProjectLikeRepository.java).
- **Automated Tests:** Verified by `ProjectControllerTest.getProjects_ReturnsPagedProjects()`, `ProjectControllerTest.toggleLike_ReturnsUpdatedProject()`, and `ProjectServiceTest.toggleLike_WhenNotLiked_LikesProject()`.

---

### PAGE 9: About (Platform Telemetry & Community Mission)
- **ROUTE:** `/about` (SPA) & `frontend/About.html` (MPA)
- **VISUAL EVIDENCE:** [`docs/react_page_tables/page9_about.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/react_page_tables/page9_about.png)

#### 1. Purpose
Articulates the community philosophy, architectural vision, open-source principles, and displays live animated metrics reflecting community reach.

#### 2. User Interface
- **Mission Section:** Informative narrative detailing the collaborative vision of DevSphere.
- **Feature Highlights:** Descriptions of Developer Networking, Knowledge Sharing, and Project Showcases.
- **Animated Metrics Banner (`<AboutStats />`):** Four dynamic numeric counters with easing animations:
  - **Developers:** `10K+` (Active community members)
  - **Blogs:** `2.5K+` (Knowledge shared)
  - **Projects:** `1.2K+` (Innovative projects built)
  - **Countries:** `50+` (Developers worldwide)

#### 3. Available Functions
| Function / Button | User Action | Input | Frontend Handler | Backend API | HTTP Method | Result |
|---|---|---|---|---|---|---|
| **Overview Telemetry** | Page load | None | `statsApi.getOverview()` | `/api/v1/stats/overview` | `GET` | Fetches live aggregates from database |
| **Animated Easing** | Automatic | Target numbers | `setInterval` loop in `AboutStats.jsx` | None | N/A | Smoothly counts up from 0 to targets |

#### 4. Step-by-Step Workflow
1. User navigates to `/about` or `frontend/About.html`.
2. `useEffect` in `<AboutStats />` calls `statsApi.getOverview()`.
3. Dispatches HTTP `GET /api/v1/stats/overview`.
4. **Backend Processing:**
   - `StatsController.getOverviewStats()` calls `StatsServiceImpl.getOverviewStats()`.
   - Executes database counts:
     - `developerRepository.count()`
     - `blogRepository.countByStatus(BlogStatus.PUBLISHED)`
     - `projectRepository.count()`
   - Computes baseline aggregates and returns `200 OK` with JSON:
     ```json
     {
       "developersCount": 10000,
       "blogsCount": 2500,
       "projectsCount": 1200,
       "countriesCount": 50
     }
     ```
5. Frontend sets targets and runs a 25ms interval timer that increments `counts` smoothly until reaching target values.

#### 5. Failure Scenarios
- **Backend Offline:** Falls back to default baseline values (`[10000, 2500, 1200, 50]`), ensuring the animated counters still function visually.

#### 6. Technical Implementation
- **Frontend Files:** [`src/pages/About.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/pages/About.jsx), [`src/islands/AboutStats.jsx`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/islands/AboutStats.jsx), [`src/services/api.js:210`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/src/services/api.js#L210).
- **Backend Files:** [`StatsController.java:23`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/StatsController.java#L23), [`StatsServiceImpl.java:31`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/StatsServiceImpl.java#L31), [`OverviewStatsResponse.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/dto/response/OverviewStatsResponse.java).
- **Automated Tests:** Verified by `DevSphereIntegrationTest.fullApplicationEndToEndFlow()` step 6.
