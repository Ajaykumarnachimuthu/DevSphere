# SkillHub Microservices Migration: Comprehensive Application Audit & Requirement Verification Report

**Document Title:** SkillHub Microservices Architecture Audit & Requirement Compliance Report  
**Target Applications:**  
* **Existing Workspace:** DevSphere Full Stack Platform (`c:\Users\N.AJAYKUMAR\Full Stack Proojects`)  
* **Reference Practical Guide:** `Moving to Microservices.docx` (`D:\Moving to Microservices.docx`)  
* **Target Services:** Course Service (Port 8081), User Service (Port 8082), Enquiry Service (Port 8083), React Frontend (Port 5173)  
**Auditor:** Senior Java Full-Stack Architect, Spring Boot Microservices Engineer, React Developer & Security Specialist  
**Audit Date:** October 30, 2026  
**Audit Mode:** **STRICT READ-ONLY AUDIT & VERIFICATION** (No source files modified)  

---

## 1. Executive Summary

This audit report evaluates the existing repository against the mandatory practical specifications defined in the curriculum reference document **`Moving to Microservices.docx`**.

### 1.1 Key Architectural Findings:
1. **Repository Disconnect (Monolith vs. Microservices):**  
   The current workspace (`c:\Users\N.AJAYKUMAR\Full Stack Proojects`) contains **DevSphere**, an integrated single-process **monolithic Spring Boot application** (`backend/`, port 8080) paired with a specialized developer community React frontend (`src/`).
2. **Missing Reference Microservices:**  
   The three independent microservices explicitly mandated by `Moving to Microservices.docx`—**Course Service (8081)**, **User Service (8082)**, and **Enquiry Service (8083)**—**do not currently exist** in the workspace.
3. **Frontend Contract Misalignment:**  
   The existing React frontend currently routes to `/blogs`, `/developers`, and `/projects` targeting the monolithic API at `http://localhost:8080/api/v1/*`. It lacks the dedicated `/courses` catalog page and the specific unified `/login` / `/register` auth tabs communicating with independent microservice ports 8081, 8082, and 8083.
4. **Actionable Roadmap:**  
   To fulfill the mandatory practical requirements without destroying existing DevSphere assets, the architecture must establish independent, clean Spring Boot microservices under a modular multi-module or dedicated sibling structure, while updating and aligning the React frontend to communicate seamlessly with each microservice.

---

## 2. Requirement Verification Matrix

Every requirement from `Moving to Microservices.docx` is cross-examined against the active codebase:

* **Statuses:** `IMPLEMENTED`, `PARTIALLY IMPLEMENTED`, `MISSING`, `INCORRECT IMPLEMENTATION`, `NOT APPLICABLE`

| # | Requirement Name | Reference Document Section | Existing Implementation File | Verification Status | Missing / Misaligned Functionality | Recommended Correction |
| :-: | :--- | :--- | :--- | :---: | :--- | :--- |
| **R1** | **Course Service Independent Project** | `Moving to Microservices.docx:L40-L118` | None | **MISSING** | No standalone Spring Boot project with artifact `course-service` exists. | Scaffold standalone Maven project `course-service` with Spring Web, JPA, H2 on port 8081. |
| **R2** | **Course Entity** | `Moving to Microservices.docx:L386-L440` | None | **MISSING** | No `Course` entity with fields (`id`, `title`, `category`, `duration`). | Create JPA `Course` entity in `com.skillhub.courseservice`. |
| **R3** | **Course Repository** | `Moving to Microservices.docx:L442-L466` | None | **MISSING** | No `CourseRepository` extending `JpaRepository<Course, Long>`. | Implement `CourseRepository` interface. |
| **R4** | **Course Service Layer** | `Moving to Microservices.docx:L468-L514, L584-L596` | None | **MISSING** | No `CourseService` with `getAllCourses()` and `saveCourse()`. | Implement `CourseService` injecting `CourseRepository`. |
| **R5** | **Course REST Controller** | `Moving to Microservices.docx:L518-L555, L775-L822` | None | **MISSING** | No controller exposing `GET /api/courses` and `POST /api/courses`. | Implement `CourseController` with `@CrossOrigin(origins = "http://localhost:5173")`. |
| **R6** | **Course H2 Persistence & Console** | `Moving to Microservices.docx:L354-L384, L1189-L1238` | Monolithic `backend/src/main/resources/application.properties` | **INCORRECT IMPLEMENTATION** | Existing H2 is bound to monolithic `devsphere-backend` on port 8080 (`jdbc:h2:mem:devspheredb`). | Configure `jdbc:h2:mem:coursedb`, port 8081, and enable `/h2-console` in `course-service`. |
| **R7** | **React Courses Integration** | `Moving to Microservices.docx:L1029-L1185` | `src/pages/Projects.jsx`, `src/App.jsx` | **MISSING** | Current React app has `/projects` (developer showcase), but no `/courses` catalog page calling port 8081. | Add `/courses` route and `Courses` component in React calling `http://localhost:8081/api/courses`. |
| **R8** | **User Service Independent Project** | `Moving to Microservices.docx:L1277-L1374` | None | **MISSING** | No standalone Spring Boot project with artifact `user-service` exists. | Scaffold standalone Maven project `user-service` with Web, JPA, MySQL, Validation on port 8082. |
| **R9** | **User Entity (Long ID, Name, Email, Password)** | `Moving to Microservices.docx:L1439-L1535` | `backend/.../entity/User.java` | **INCORRECT IMPLEMENTATION** | Existing entity uses `UUID id`, `username`, `email`, `role`, and is coupled to DevSphere monolithic DB. | Create dedicated `User` entity (`Long id`, `name`, `email`, `password`) in `com.skillhub.userservice`. |
| **R10**| **User Repository with findByEmail** | `Moving to Microservices.docx:L1539-L1580, L2742-L2768` | `backend/.../repository/UserRepository.java` | **PARTIALLY IMPLEMENTED** | Existing repo queries UUID users in DevSphere; lacks SkillHub schema. | Implement `UserRepository` with `Optional<User> findByEmail(String email)` in `user-service`. |
| **R11**| **BCrypt Password Hashing (`spring-security-crypto`)** | `Moving to Microservices.docx:L1898-L2085` | `backend/.../config/SecurityConfig.java` | **PARTIALLY IMPLEMENTED** | Monolith uses full Spring Security filter chain with JWT; reference requires lightweight `PasswordConfig` with `BCryptPasswordEncoder`. | Implement `PasswordConfig` and use `passwordEncoder.encode()` in `UserService`. |
| **R12**| **UserResponse DTO (Password-Free API)** | `Moving to Microservices.docx:L2136-L2205` | `backend/.../dto/response/UserResponse.java` | **PARTIALLY IMPLEMENTED** | Existing DTO is for DevSphere (`id: UUID`, `username`, `role`); reference specifies (`id: Long`, `name`, `email`). | Implement `UserResponse` DTO strictly excluding password fields. |
| **R13**| **User Registration API (`POST /api/users`)** | `Moving to Microservices.docx:L2226-L2320` | `backend/.../controller/AuthController.java` | **INCORRECT IMPLEMENTATION** | Existing endpoint is `POST /api/v1/auth/register` returning JWT tokens on port 8080. | Implement `POST /api/users` on port 8082 returning `UserResponse`. |
| **R14**| **User Login API (`POST /api/users/login`)** | `Moving to Microservices.docx:L2890-L3054` | `backend/.../controller/AuthController.java` | **INCORRECT IMPLEMENTATION** | Existing login is `POST /api/v1/auth/login` returning JWT; reference requires credential verification returning `UserResponse` or 401. | Implement `POST /api/users/login` using `passwordEncoder.matches()` on port 8082. |
| **R15**| **User MySQL Persistence (`skillhub_users`)** | `Moving to Microservices.docx:L1375-L1434` | `backend/.../application.properties` (PostgreSQL) | **MISSING** | Codebase uses PostgreSQL/H2; does not configure MySQL database `skillhub_users`. | Configure `spring.datasource.url=jdbc:mysql://localhost:3306/skillhub_users` (with embedded/H2 fallback for testing). |
| **R16**| **React Registration & Login Integration** | `Moving to Microservices.docx:L2360-L2726, L3140-L3538` | `src/pages/Login.jsx`, `src/pages/Signup.jsx` | **PARTIALLY IMPLEMENTED** | Existing pages submit to monolithic port 8080; reference specifies unified tabbed auth form submitting to port 8082. | Connect React auth forms to `http://localhost:8082/api/users` and `http://localhost:8082/api/users/login`. |
| **R17**| **Enquiry Service Independent Project** | `Prompt Requirement Phase 2.3` | None | **MISSING** | No Enquiry microservice exists on port 8083. | Implement standalone `enquiry-service` on port 8083. |
| **R18**| **Enquiry Entity & Repository** | `Prompt Requirement Phase 2.3` | None | **MISSING** | No `Enquiry` entity (`id`, `name`, `email`, `courseId`/`courseName`, `message`, `submittedAt`). | Create `Enquiry` entity and `EnquiryRepository` in `com.skillhub.enquiryservice`. |
| **R19**| **Enquiry Service & REST Controller** | `Prompt Requirement Phase 2.3` | None | **MISSING** | No endpoint `POST /api/enquiries` or `GET /api/enquiries`. | Implement `EnquiryService` and `EnquiryController` with `@CrossOrigin(origins = "http://localhost:5173")`. |
| **R20**| **React Contact/Enquiry Form Integration** | `Prompt Requirement Phase 3` | None | **MISSING** | Frontend lacks active Contact / Enquiry page connecting to port 8083. | Implement/connect Contact page in React submitting to `http://localhost:8083/api/enquiries`. |

---

## 3. Deep Dive: Existing Application Architecture vs. Target Microservices

### 3.1 Existing Repository Audit (DevSphere Monolith)
* **Backend:** Single Spring Boot 3.4.3 app located in `backend/` running on `http://localhost:8080`.
* **Database:** Configured for PostgreSQL in production and H2 (`devspheredb`) in development. Managed via Flyway migrations (`V1__init_schema.sql`, `V2__seed_devsphere_data.sql`).
* **Authentication:** Stateful-to-stateless JWT architecture using `jjwt 0.12.6`, generating HMAC-SHA256 tokens on login/register.
* **Domain Model:** Centers around developer profiles (`developer_profiles`), technical blogs (`blogs`), and open-source project showcases (`projects`).
* **Frontend:** React 18 + Vite running on port 5173, utilizing custom CSS and React Router with routes `/`, `/login`, `/signup`, `/blogs`, `/developers`, `/projects`, `/about`.

### 3.2 Target Microservices Architecture (SkillHub Specification)

```
                                      ┌─────────────────────────────────────────────────────────┐
                                      │              React Frontend (Vite / Port 5173)          │
                                      │  - Courses Page (/courses)                              │
                                      │  - Auth Page (/login, /register)                        │
                                      │  - Contact / Enquiry Page (/contact)                    │
                                      └───────┬───────────────────┬───────────────────┬─────────┘
                                              │                   │                   │
                            HTTP GET/POST     │     HTTP POST     │     HTTP POST     │
                            /api/courses      │     /api/users    │     /api/enquiries│
                                              │     /api/users/login                  │
                                              ▼                   ▼                   ▼
┌──────────────────────────────────────────────────┐ ┌─────────────────────────────────────────┐ ┌─────────────────────────────────────────┐
│        Course Service (Spring Boot 8081)         │ │         User Service (Spring Boot 8082) │ │      Enquiry Service (Spring Boot 8083) │
├──────────────────────────────────────────────────┤ ├─────────────────────────────────────────┤ ├─────────────────────────────────────────┤
│ • CourseController (@CrossOrigin 5173)           │ │ • UserController (@CrossOrigin 5173)    │ │ • EnquiryController (@CrossOrigin 5173)│
│ • CourseService                                  │ │ • UserService (BCrypt verify)           │ │ • EnquiryService                        │
│ • CourseRepository                               │ │ • UserRepository (findByEmail)          │ │ • EnquiryRepository                     │
│ • Course Entity (id, title, category, duration)  │ │ • User Entity (id, name, email, pass)   │ │ • Enquiry Entity (id, name, email, msg) │
│ • H2 Database (jdbc:h2:mem:coursedb)             │ │ • MySQL Database (skillhub_users)       │ │ • H2 / MySQL Database (enquirydb)       │
└──────────────────────────────────────────────────┘ └─────────────────────────────────────────┘ └─────────────────────────────────────────┘
```

---

## 4. Security & Quality Gap Analysis

### 4.1 Sensitive Data Exposure in User Service:
* In `Moving to Microservices.docx:L1752, L2136-L2320`, the document warns that initial naive implementations return plain-text passwords or hashes in `GET /api/users` and `POST /api/users`.
* **Mandatory Requirement:** The final `UserController` must strictly use `UserResponse` (`id`, `name`, `email`) for all return values. Under no circumstances may passwords, BCrypt hashes, or sensitive tokens be exposed in JSON responses.

### 4.2 Credential Verification vs. Session Authentication:
* `Moving to Microservices.docx:L3538` explicitly states:  
  *"The Login API currently verifies credentials and returns user details; it does not establish a session or issue an authentication token. The success message confirms credential verification, not a persistent authenticated session."*
* **Compliance Requirement:** We must faithfully implement the reference practical's credential verification endpoint `POST /api/users/login` using `passwordEncoder.matches()` without falsely claiming it is a stateful session.

### 4.3 Database Independence:
* Each microservice must maintain its own independent database schema.
* Course Service: In-memory H2 (`jdbc:h2:mem:coursedb`).
* User Service: MySQL database (`skillhub_users`) with configuration options for development testing.
* Enquiry Service: Dedicated database schema (`jdbc:h2:mem:enquirydb` or MySQL).

---

## 5. Prioritized Migration Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     FOUR-PHASE MICROSERVICES MIGRATION PLAN                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: SCAFFOLD INDEPENDENT BACKEND MICROSERVICES                             │
│ ───────────────────────────────────────────────────                             │
│ 1. Create `course-service/` on Port 8081 (H2, Course entity, CRUD APIs).        │
│ 2. Create `user-service/` on Port 8082 (MySQL/H2, BCrypt, UserResponse DTO).    │
│ 3. Create `enquiry-service/` on Port 8083 (Enquiry entity, persistence, APIs).  │
│                                                                                 │
│ PHASE 2: FRONTEND ROUTE & PAGE ALIGNMENT                                        │
│ ────────────────────────────────────────                                        │
│ 1. Implement `/courses` page in React fetching from `http://localhost:8081`.    │
│ 2. Connect unified Login & Register forms to `http://localhost:8082`.           │
│ 3. Implement Contact/Enquiry form submitting to `http://localhost:8083`.        │
│ 4. Preserve all existing DevSphere navigation, styling, and community pages.    │
│                                                                                 │
│ PHASE 3: VERIFICATION, TESTING & LOGGING                                        │
│ ────────────────────────────────────────                                        │
│ 1. Execute live HTTP curl/PowerShell tests for each independent service.        │
│ 2. Verify CORS communication across ports 5173, 8081, 8082, and 8083.          │
│ 3. Validate BCrypt hashing and confirm zero password leaks in API payloads.     │
│                                                                                 │
│ PHASE 4: DOCUMENTATION & SUBMISSION ARTIFACTS                                   │
│ ─────────────────────────────────────────────                                   │
│ 1. Produce Final Architecture Diagram and Compliance Matrix.                    │
│ 2. Document API Endpoints and Database Schemas.                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Audit Conclusion & Next Steps

* **Current State:** The repository currently houses the monolithic DevSphere application. None of the three SkillHub microservices (`course-service`, `user-service`, `enquiry-service`) exist in the codebase.
* **Execution Guardrail:** This audit has been conducted under strict read-only inspection. Zero source files have been modified.
* **Recommendation:** Proceed to Phase 1 implementation by creating the three independent Spring Boot microservice projects, followed by connecting the React frontend as specified in `Moving to Microservices.docx`.
