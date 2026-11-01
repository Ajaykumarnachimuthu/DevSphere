# DevSphere: Reference-Based Microservices Requirement Mapping & Implementation Plan

**Document Title:** DevSphere Reference-Based Microservices Requirement Mapping & Implementation Plan  
**Target Application:** DevSphere Full-Stack Application (`c:\Users\N.AJAYKUMAR\Full Stack Proojects`)  
**Primary Reference:** `Moving to Microservices.docx` (`D:\Moving to Microservices.docx`)  
**Author:** Senior Java Full-Stack Architect, Spring Boot Microservices Engineer & React Reviewer  
**Date:** October 30, 2026  
**Status:** Approved Architectural Blueprint & Pre-Implementation Plan  

---

## 1. Executive Strategy & Core Principles

### 1.1 Preservation Principle (DevSphere Remains Primary)
DevSphere is an existing, enterprise-grade developer platform with an active React frontend and Spring Boot backend. The core directive of this migration is:
* **Preserve 100% of Existing Functionality:** DevSphere's existing backend (`backend/`, port 8080), PostgreSQL/H2 database, developer profiles, blog platform, project showcase, and existing authentication must remain intact and functional.
* **Co-existence alongside DevSphere:** The reference microservices mandated by `Moving to Microservices.docx` will be implemented as independent, self-contained Spring Boot applications located under `microservices/`:
  * `microservices/course-service` (Port 8081, H2 database `jdbc:h2:mem:coursedb`)
  * `microservices/user-service` (Port 8082, MySQL database `skillhub_users` with H2 dev/test profile)
  * `microservices/enquiry-service` (Port 8083, persistent database `jdbc:h2:mem:enquirydb`)
* **Integrated React Frontend:** DevSphere's React frontend (`src/`) will be enhanced with the reference microservices capabilities:
  * A dedicated **Courses** page (`/courses`) rendering course cards dynamically fetched from Course Service (8081).
  * A dedicated **Contact / Enquiry** page (`/contact`) connected to Enquiry Service (8083).
  * SkillHub microservices registration and login capability connected to User Service (8082), integrated alongside DevSphere's existing auth.
  * Existing DevSphere Navbar, Footer, Home, Developers, Projects, Blogs, and About pages are completely preserved.

---

## 2. Comprehensive Requirement Mapping Table

Every practical requirement extracted from `Moving to Microservices.docx` is mapped below:

| # | Requirement | Reference Document Location | Existing DevSphere Implementation | Required Changes | Status |
| :-: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Course Service Project Setup** | `Docx: L40-L118` | Monolithic `backend/pom.xml` on port 8080 | Scaffold independent Spring Boot Maven project `microservices/course-service` with Java 21, Spring Boot 3.4.3, Spring Web, Data JPA, H2. | **MISSING** |
| **2** | **Course Service Port 8081** | `Docx: L208-L221` | Monolith uses `server.port=8080` | Set `server.port=8081` in `microservices/course-service/src/main/resources/application.properties`. | **MISSING** |
| **3** | **Course Entity** | `Docx: L386-L440` | `Project.java` exists for showcases; no Course entity | Create `Course.java` with `@Entity`, `id: Long` (Identity), `title: String`, `category: String`, `duration: String`. | **MISSING** |
| **4** | **Course Repository** | `Docx: L442-L466` | None | Create `CourseRepository` interface extending `JpaRepository<Course, Long>`. | **MISSING** |
| **5** | **Course Service Layer** | `Docx: L468-L514, L584-L596` | None | Create `CourseService.java` with `getAllCourses()` and `saveCourse(Course)`. | **MISSING** |
| **6** | **Course REST Controller** | `Docx: L518-L555, L775-L822` | None | Create `CourseController.java` with `@RestController`, `@GetMapping("/api/courses")`, `@PostMapping("/api/courses")`. | **MISSING** |
| **7** | **Course CORS Configuration** | `Docx: L987-L1026` | Monolith configures CORS in `SecurityConfig.java` | Add `@CrossOrigin(origins = "http://localhost:5173")` to `CourseController`. | **MISSING** |
| **8** | **Course H2 Database Configuration** | `Docx: L354-L384` | Monolith uses `jdbc:h2:mem:devspheredb` | Configure `jdbc:h2:mem:coursedb`, `driver-class-name=org.h2.Driver`, `ddl-auto=update`, `/h2-console` enabled. | **MISSING** |
| **9** | **Course Startup Seed Data** | `Docx: L598-L666` | `DataInitializer.java` in monolith | Add `@Bean CommandLineRunner loadCourses(CourseService)` in `CourseServiceApplication.java` with 4 sample courses. | **MISSING** |
| **10**| **React Courses Page & Dynamic Cards** | `Docx: L1029-L1185` | `src/pages/Projects.jsx` showcases developer projects | Create `src/pages/Courses.jsx` fetching `http://localhost:8081/api/courses`, loading/error states, and card rendering with "Enquire" button. | **MISSING** |
| **11**| **React Routing for Courses** | `Docx: L1141-L1184` | `src/App.jsx` lacks `/courses` route | Add `<Route path="/courses" element={<Courses />} />` in `src/App.jsx` and link in Navbar. | **MISSING** |
| **12**| **User Service Project Setup** | `Docx: L1277-L1374` | Monolith handles user accounts on 8080 | Scaffold independent Spring Boot Maven project `microservices/user-service` with Java 21, Web, Data JPA, MySQL, Validation. | **MISSING** |
| **13**| **User Service Port 8082** | `Docx: L1401-L1434` | Monolith uses 8080 | Set `server.port=8082` in `microservices/user-service/src/main/resources/application.properties`. | **MISSING** |
| **14**| **User Entity (Reference Schema)** | `Docx: L1439-L1535` | Monolith `User.java` has UUID, username, email, role | Create `com.skillhub.userservice.User` with `Long id`, `name`, `email`, `password`. | **MISSING** |
| **15**| **User Repository with `findByEmail`** | `Docx: L1539-L1580, L2742-L2768` | Monolith has `findByEmail` returning UUID User | Implement `UserRepository extends JpaRepository<User, Long>` with `Optional<User> findByEmail(String email)`. | **MISSING** |
| **16**| **BCrypt Password Hashing Config** | `Docx: L1898-L1987` | Monolith has `BCryptPasswordEncoder` in security | Add `spring-security-crypto` dependency and `PasswordConfig.java` registering `BCryptPasswordEncoder` bean. | **MISSING** |
| **17**| **Password Hashing in UserService** | `Docx: L1990-L2085` | Monolith encodes password via AuthServiceImpl | In `UserService.registerUser`, hash password using `passwordEncoder.encode(user.getPassword())`. | **MISSING** |
| **18**| **UserResponse DTO (Zero Password Leaks)** | `Docx: L2136-L2205` | Monolith has DevSphere `UserResponse` DTO | Create `UserResponse.java` containing `Long id`, `name`, `email`. Omit password and password hash completely. | **MISSING** |
| **19**| **User Registration API (`POST /api/users`)** | `Docx: L2226-L2320` | Monolith has `POST /api/v1/auth/register` | Implement `POST /api/users` in `UserController` returning `UserResponse`. | **MISSING** |
| **20**| **User Retrieval API (`GET /api/users`)** | `Docx: L2264-L2285` | Monolith has `GET /api/v1/auth/me` | Implement `GET /api/users` returning `List<UserResponse>` without password fields. | **MISSING** |
| **21**| **User Login Verification API (`POST /api/users/login`)** | `Docx: L2770-L3054` | Monolith returns JWT token on login | Implement `POST /api/users/login` using `passwordEncoder.matches()`. Return `UserResponse` on success, 401 on bad credentials. | **MISSING** |
| **22**| **User MySQL Database Configuration** | `Docx: L1375-L1434` | Monolith uses PostgreSQL/H2 | Configure `jdbc:mysql://localhost:3306/skillhub_users` with an embedded H2 fallback profile for standalone test runs. | **MISSING** |
| **23**| **User CORS Configuration** | `Docx: L1679-L1685, L2242` | Monolith configures CORS in `SecurityConfig.java` | Add `@CrossOrigin(origins = "http://localhost:5173")` to `UserController`. | **MISSING** |
| **24**| **React User Registration & Login Integration** | `Docx: L2360-L2726, L3140-L3538` | Separate `Login.jsx` & `Signup.jsx` for DevSphere | Add tabbed SkillHub Auth component/page (`/auth` or `/skillhub-auth`) submitting to port 8082 APIs, while preserving existing DevSphere auth. | **MISSING** |
| **25**| **Enquiry Service Project Setup** | Master Prompt Phase 2.3 | None | Scaffold independent Spring Boot Maven project `microservices/enquiry-service` (Port 8083). | **MISSING** |
| **26**| **Enquiry Entity & Repository** | Master Prompt Phase 2.3 | None | Create `Enquiry.java` (`id: Long`, `name`, `email`, `courseTitle`, `message`, `submittedAt`) and `EnquiryRepository`. | **MISSING** |
| **27**| **Enquiry Service Layer & REST Controller** | Master Prompt Phase 2.3 | None | Implement `EnquiryService` and `EnquiryController` exposing `POST /api/enquiries` and `GET /api/enquiries`. | **MISSING** |
| **28**| **Enquiry Database Persistence** | Master Prompt Phase 2.3 | None | Configure H2/MySQL persistent storage `jdbc:h2:mem:enquirydb` on port 8083. | **MISSING** |
| **29**| **React Contact / Enquiry Page Integration** | Master Prompt Phase 3 | None | Create `src/pages/Contact.jsx` submitting enquiries to `http://localhost:8083/api/enquiries`. | **MISSING** |
| **30**| **Practical Documentation & Screenshots** | Master Prompt Phase 5 | None | Create `docs/microservices-practical/` with explanations, code snippets, execution outputs, output tables, and screenshot checklist. | **MISSING** |

---

## 3. Register of DevSphere Features to Preserve

To guarantee zero regression of DevSphere, the following assets are locked and preserved:

1. **DevSphere Monolith Backend (`backend/`):**
   * Stays on `http://localhost:8080`.
   * Preserves `com.devsphere` package hierarchy, Spring Security, JWT provider, and OSIV settings.
   * Retains all 5 REST controllers: `AuthController`, `BlogController`, `DeveloperController`, `ProjectController`, `StatsController`.
   * Retains Flyway migrations `V1__init_schema.sql` and `V2__seed_devsphere_data.sql`.
   * Retains all 26 verified passing automated tests.
2. **DevSphere Frontend Assets (`src/`, `frontend/`):**
   * Preserves all pages: `Home.jsx`, `Developers.jsx`, `DeveloperProfile.jsx`, `Projects.jsx`, `Blogs.jsx`, `WriteBlog.jsx`, `About.jsx`.
   * Preserves existing DevSphere authentication: `Login.jsx`, `Signup.jsx`, `src/services/api.js`.
   * Preserves styling, typography, logo assets, CSS variables, and layout structures.

---

## 4. Architecture Specifications for the 3 Microservices

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DEVSPHERE ENHANCED MICROSERVICES TOPOLOGY                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                      React Frontend (Port 5173)                                        │
│               ┌───────────────────────┬───────────────────────┬────────────────────────┐               │
│               │ /courses              │ /contact              │ /skillhub-auth         │               │
│               └───────────┬───────────┴───────────┬───────────┴────────────┬───────────┘               │
│                           │                       │                        │                           │
│                     HTTP GET/POST           HTTP POST/GET            HTTP POST/GET                     │
│                     /api/courses            /api/enquiries           /api/users[/login]                │
│                           ▼                       ▼                        ▼                           │
│               ┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐               │
│               │    Course Service     │ │  Enquiry Service  │ │      User Service      │               │
│               │      (Port 8081)      │ │    (Port 8083)    │ │      (Port 8082)       │               │
│               ├───────────────────────┤ ├───────────────────┤ ├────────────────────────┤               │
│               │ • CourseController    │ │• EnquiryController│ │ • UserController       │               │
│               │ • CourseService       │ │• EnquiryService   │ │ • UserService (BCrypt) │               │
│               │ • CourseRepository    │ │• EnquiryRepository│ │ • UserRepository       │               │
│               │ • H2 (coursedb)       │ │• H2 (enquirydb)   │ │ • MySQL (skillhub_users│               │
│               └───────────────────────┘ └───────────────────┘ └────────────────────────┘               │
│                                                                                                        │
│                      [PRESERVED] DevSphere Core Monolith (Port 8080)                                    │
│                      • Auth / Developers / Blogs / Projects / Stats / Flyway / PostgreSQL              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Detailed Implementation Blueprint

### 5.1 Course Service (`microservices/course-service`)
* **Base Package:** `com.skillhub.courseservice`
* **Port:** `8081`
* **Dependencies:** `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `h2`
* **Files to Create:**
  1. `pom.xml`: Maven configuration (Java 21, Spring Boot 3.4.3).
  2. `src/main/resources/application.properties`: H2 in-memory URL, ddl-auto, console enabled.
  3. `Course.java`: Entity with `Long id`, `title`, `category`, `duration`.
  4. `CourseRepository.java`: `JpaRepository<Course, Long>`.
  5. `CourseService.java`: Business methods `getAllCourses()` and `saveCourse(Course)`.
  6. `CourseController.java`: Endpoints `GET /api/courses` and `POST /api/courses`, `@CrossOrigin`.
  7. `CourseServiceApplication.java`: Main class with `CommandLineRunner` inserting 4 initial courses.
  8. `CourseServiceTest.java`: Automated JUnit 5 tests.

### 5.2 User Service (`microservices/user-service`)
* **Base Package:** `com.skillhub.userservice`
* **Port:** `8082`
* **Dependencies:** `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `mysql-connector-j`, `spring-security-crypto`, `h2` (for test profile)
* **Files to Create:**
  1. `pom.xml`: Maven configuration.
  2. `src/main/resources/application.properties`: MySQL config (`skillhub_users`) + H2 fallback profile.
  3. `User.java`: Entity with `Long id`, `name`, `email`, `password`.
  4. `UserRepository.java`: `JpaRepository<User, Long>` with `Optional<User> findByEmail(String)`.
  5. `PasswordConfig.java`: Configuration bean for `BCryptPasswordEncoder`.
  6. `UserResponse.java`: DTO with `Long id`, `name`, `email` (no password).
  7. `UserService.java`: `registerUser(User)` (with BCrypt hash), `loginUser(email, password)` (via `passwordEncoder.matches()`), `getAllUsers()`.
  8. `UserController.java`: Endpoints `GET /api/users`, `POST /api/users`, `POST /api/users/login`, `@CrossOrigin`.
  9. `UserServiceApplication.java`: Main entrypoint.
  10. `UserServiceTest.java`: Automated JUnit 5 tests.

### 5.3 Enquiry Service (`microservices/enquiry-service`)
* **Base Package:** `com.skillhub.enquiryservice`
* **Port:** `8083`
* **Dependencies:** `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `h2`
* **Files to Create:**
  1. `pom.xml`: Maven configuration.
  2. `src/main/resources/application.properties`: Port 8083, H2 config (`enquirydb`).
  3. `Enquiry.java`: Entity with `Long id`, `name`, `email`, `courseTitle`, `message`, `submittedAt`.
  4. `EnquiryRepository.java`: `JpaRepository<Enquiry, Long>`.
  5. `EnquiryService.java`: Methods `saveEnquiry(Enquiry)` and `getAllEnquiries()`.
  6. `EnquiryController.java`: Endpoints `POST /api/enquiries`, `GET /api/enquiries`, `@CrossOrigin`.
  7. `EnquiryServiceApplication.java`: Main entrypoint.
  8. `EnquiryServiceTest.java`: Automated JUnit 5 tests.

### 5.4 React Frontend Integrations
* **Files to Add/Modify:**
  1. `src/pages/Courses.jsx`: Dynamic course listing fetching from `http://localhost:8081/api/courses`, loading/error states, and "Enquire" button linking to `/contact?course=...`.
  2. `src/pages/Contact.jsx`: Contact/Enquiry form submitting to `http://localhost:8083/api/enquiries`.
  3. `src/pages/SkillHubAuth.jsx`: Tabbed Login and Registration forms submitting to `http://localhost:8082/api/users` and `/login`, strictly following the reference implementation.
  4. `src/App.jsx`: Register new routes `/courses`, `/contact`, `/skillhub-auth`.
  5. `src/components/layout/Navbar.jsx`: Add "Courses" and "Contact" navigation links alongside existing DevSphere links.

---

## 6. Practical Documentation & Screenshot Evidence Plan

Dedicated folder: `docs/microservices-practical/`
* `01_COURSE_SERVICE_EVIDENCE.md`: Course Service setup, code snippets, startup logs, curl outputs, H2 console records, screenshot checklist.
* `02_USER_SERVICE_EVIDENCE.md`: User Service setup, BCrypt hashing, UserResponse DTO, registration & login outputs, MySQL verification, screenshot checklist.
* `03_ENQUIRY_SERVICE_EVIDENCE.md`: Enquiry Service setup, submission outputs, database records, screenshot checklist.
* `04_FRONTEND_INTEGRATION_EVIDENCE.md`: React integration, Courses page rendering, Form submissions, screenshot checklist.
* `05_MASTER_SCREENSHOT_CHECKLIST.md`: Structured table specifying every single screenshot to take, filename, tool to capture, and placement in the practical document.

---

## 7. Phased Implementation Roadmap

* **Phase 1:** Requirements mapping and pre-implementation blueprint approval (THIS DOCUMENT).
* **Phase 2:** Build Course Service (8081) + automated tests + execution verification.
* **Phase 3:** Build User Service (8082) + BCrypt + UserResponse DTO + automated tests + execution verification.
* **Phase 4:** Build Enquiry Service (8083) + automated tests + execution verification.
* **Phase 5:** Implement React pages (`Courses.jsx`, `Contact.jsx`, `SkillHubAuth.jsx`), navigation links, and end-to-end frontend integration.
* **Phase 6:** Execute full cross-service live verification tests, record actual outputs, and compile practical evidence documentation.
