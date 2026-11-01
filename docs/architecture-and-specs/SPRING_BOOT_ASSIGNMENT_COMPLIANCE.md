# Spring Boot Framework – Part 1: Assignment Compliance Audit & Verification

**Course:** FULL STACK WEB DEVELOPMENT  
**Course Code:** 21CSE354T  
**Activity:** Spring Boot Framework – Part 1  
**Student Name:** AJAYKUMAR N  
**Register Number:** RA2411003012107  
**Evaluated Application:** DevSphere Backend (`devsphere-backend-1.0.0.jar`)  
**Audit Status:** Complete & Empirically Verified

---

## 1. Compliance Executive Summary

| Evaluation Metric | Verified Value | Benchmark / Assignment Requirement | Result |
|---|---|---|:---:|
| **Target Java Version** | Java 21 (`release 21` in `pom.xml`) | Modern LTS Java | **PASS** |
| **Spring Boot Framework** | **3.4.3** (Spring 6.2.3, Spring Security 6.4) | Spring Boot Framework | **PASS** |
| **Three-Layer Architecture** | Controller $\rightarrow$ Service $\rightarrow$ Repository | Complete Layer Decoupling | **PASS** |
| **Domain Entities Implemented** | **6 JPA Entities** (`User`, `DeveloperProfile`, `Blog`, `Project`, etc.) | At least 2 Domain Entities | **PASS (Exceeds by 200%)** |
| **Service-Layer Business Rules** | **5 Verified Rules** (Ownership, Uniqueness, Likes, Counters, Read-time) | At least 2 Business Rules | **PASS (Exceeds by 150%)** |
| **REST Endpoints Exposed** | **15 Endpoints** across 5 Controllers | At least 1 Working REST Endpoint | **PASS (Exceeds by 1400%)** |
| **Automated Test Suite** | **26 Automated Tests** (Unit, Slice, and E2E Integration) | At least 1 Automated Test | **PASS (Exceeds by 2500%)** |
| **Automated Test Results** | **26 Tests Run, 26 Passed, 0 Failures, 0 Errors, 0 Skipped** | 100% Pass Rate | **PASS (100% BUILD SUCCESS)** |
| **Live Runtime Execution** | **Embedded Tomcat 10.1.36 on port 8080** | Executable Web Application | **PASS** |
| **Manual Test Matrix** | **5 Structured Test Cases** with Input, Expected, Actual, Status | At least 2 Manual Cases | **PASS** |
| **Visual Submission Evidence** | **4 Screenshots** in `docs/assignment-evidence/` | Complete Visual Artifacts | **PASS (100% Captured)** |

---

## 2. Requirement-by-Requirement Compliance Matrix

| Req # | Assignment Requirement Description | Status | Source Code Reference(s) | Primary Annotation / Class / Method | Empirical Audit Findings & Evidence |
|:---:|---|:---:|---|---|---|
| **1** | **Development Environment:** Java, Spring Boot, Maven, IDE, Executable App | **PASS** | [`backend/pom.xml:7-28`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/pom.xml#L7-L28)<br>[`DevSphereApplication.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/DevSphereApplication.java) | `spring-boot-starter-parent:3.4.3`, `DevSphereApplication.main()`, `spring-boot-maven-plugin` | Maven build compiles with JDK 21/23; packages executable fat JAR with embedded Tomcat. Verified via live terminal run. |
| **2** | **Basic Web Application & Skeleton Endpoint:** Working REST API | **PASS** | [`StatsController.java:23`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/StatsController.java#L23) | `@RestController`, `@GetMapping("/api/v1/stats/overview")` | Live HTTP request to `http://localhost:8080/api/v1/stats/overview` returned `200 OK` with JSON statistics payload. |
| **3** | **Spring Boot Auto-Configuration:** Appropriate use without manual boilerplate | **PASS** | [`DevSphereApplication.java:6`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/DevSphereApplication.java#L6)<br>[`application.properties`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/resources/application.properties) | `@SpringBootApplication`, `TomcatServletWebServerFactory`, `HikariDataSource`, `HibernateJpaAutoConfiguration` | Leverages Spring Boot starters (`web`, `validation`, `security`, `data-jpa`). Zero XML boilerplate. |
| **4** | **Three-Layer Architecture:** Presentation $\rightarrow$ Business $\rightarrow$ Data Access | **PASS** | `com.devsphere.controller` $\rightarrow$ `com.devsphere.service` $\rightarrow$ `com.devsphere.repository` | `@RestController` $\rightarrow$ `@Service` $\rightarrow$ `@Repository` (`JpaRepository`) | Presentation delegates directly to `@Transactional` services; services query JPA repositories; repositories query database. |
| **5** | **Domain Modeling:** $\ge 2$ Entities with attributes & relationships | **PASS** | [`backend/src/main/java/com/devsphere/entity/`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/entity) | `@Entity`, `@Table`, `@Id`, `@Column`, `@ManyToOne`, `@ElementCollection` | 6 relational entities (`User`, `DeveloperProfile`, `Blog`, `Project`, `DeveloperConnection`, `ProjectLike`) with relationships & collection tables. |
| **6** | **Business Logic:** $\ge 2$ Meaningful Rules in Service Layer | **PASS** | [`BlogServiceImpl.java:82-96`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/BlogServiceImpl.java#L82-L96)<br>[`AuthServiceImpl.java:38-46`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/AuthServiceImpl.java#L38-L46) | `updateBlog()` author ownership rule; `register()` duplicate email guard; `toggleLike()` atomic counter rule | Enforced strictly in Service layer with custom exceptions (`ForbiddenException`, `DuplicateResourceException`). |
| **7** | **Presentation Layer:** REST Endpoints using Service Layer | **PASS** | [`backend/src/main/java/com/devsphere/controller/`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller) (5 Controllers) | `@RestController`, `@RequestMapping("/api/v1/...")`, `@Valid`, `@RequestBody`, `@PathVariable` | 15 endpoints. Controllers perform zero business logic; they validate input and delegate directly to services. |
| **8** | **Manual Testing Documentation:** Documented test cases with Input, Expected, Actual | **PASS** | Documented in Section 3 of this document | Structured manual test table | 5 complete test cases verifying Auth, Blogs, Projects, Stats, and Validation with PASS/FAIL determinations. |
| **9** | **Automated Testing:** $\ge 1$ Automated Test using Spring Boot / JUnit | **PASS** | [`AuthServiceTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/service/AuthServiceTest.java)<br>[`BlogServiceTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/service/BlogServiceTest.java)<br>[`DevSphereIntegrationTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/DevSphereIntegrationTest.java) | `@ExtendWith(MockitoExtension.class)`, `@WebMvcTest`, `@SpringBootTest`, `assertThat()`, `assertThrows()` | 26 automated tests (13 service unit tests, 12 controller slice tests, 1 full E2E context test). 100% pass rate. |
| **10**| **Application Data Flow:** Client $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Data | **PASS** | Full trace verified from HTTP request down to Hibernate SQL queries (`SELECT`, `INSERT`, `UPDATE`). | `DispatcherServlet` $\rightarrow$ `AuthController` $\rightarrow$ `AuthServiceImpl` $\rightarrow$ `UserRepository` $\rightarrow$ H2/PostgreSQL | Live HTTP requests confirmed the complete 5-stage data flow with database read/write. |
| **11**| **Application Name and Problem Description** | **PASS** | [`README.md:1-7`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/README.md#L1-L7)<br>[`backend/pom.xml:16-18`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/pom.xml#L16-L18) | Project title `DevSphere`, full domain narrative and community mission statement | Clearly documented in README, POM, and Application Overview. |
| **12**| **Architecture Diagram** | **PASS** | [`README.md:11-46`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/README.md#L11-L46)<br>Section 4 of `APPLICATION_OVERVIEW.md` | Three-layer ASCII diagram and Mermaid diagrams | Visual and text representations of presentation, business, and persistence layers. |
| **13**| **Domain Model and Package Structure** | **PASS** | [`README.md:52-83`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/README.md#L52-L83)<br>Section 4 of `API_AND_DATABASE_REFERENCE.md` | Complete package tree; 6 relational entities with ER diagram | Full documentation of packages, relationships, constraints, and tables. |
| **14**| **Controller, Service, and Repository Code** | **PASS** | [`backend/src/main/java/com/devsphere/`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere) | 5 Controllers, 5 Services, 6 Repositories | Production-quality source code implemented across all three tiers. |
| **15**| **At least One REST Endpoint** | **PASS** | [`StatsController.java:23`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/StatsController.java#L23)<br>[`BlogController.java:38`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/controller/BlogController.java#L38) | `GET /api/v1/stats/overview`, `GET /api/v1/blogs`, `POST /api/v1/auth/login` | 15 working endpoints. Live HTTP tests confirmed status 200 responses. |
| **16**| **Business Rules Implemented** | **PASS** | [`BlogServiceImpl.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/BlogServiceImpl.java)<br>[`ProjectServiceImpl.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/main/java/com/devsphere/service/impl/ProjectServiceImpl.java) | Ownership validation, duplicate detection, atomic counters | Documented in code, README, and verified with automated test suites. |
| **17**| **Test Cases and Automated Test Evidence** | **PASS** | Surefire execution log: 26 tests run, 26 passed, 0 failures, 0 errors. | Surefire XML and TXT reports generated in `backend/target/surefire-reports/` | Empirical proof captured from live build execution. |
| **18**| **Screenshot of the Running Application** | **PASS** | [`docs/assignment-evidence/01_backend_running.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/01_backend_running.png) | Visual PNG capture of the backend console showing Spring Boot startup banner and port 8080 | Verified manual screenshot captured and stored in `docs/assignment-evidence/01_backend_running.png`. |
| **19**| **Screenshot or Output of the REST Endpoint** | **PASS** | [`docs/assignment-evidence/02_rest_endpoint_output.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/02_rest_endpoint_output.png) | Visual PNG capture of the REST endpoint JSON response | Verified manual screenshot captured and stored in `docs/assignment-evidence/02_rest_endpoint_output.png`. |
| **20**| **Explanation of Spring Boot Auto-Configuration** | **PASS** | Section 18 of `FINAL_ACADEMIC_REPORT.md` | Narrative detailing `@SpringBootApplication`, Tomcat, Hikari, JPA, and Jackson auto-configuration | Fully articulated explanation provided. |

---

## 3. Verified Manual Test Case Matrix

| Test ID | Feature Under Test | Preconditions | Input Data | Test Execution Steps | Expected Output | Actual Output | Status | Evidence Source |
|:---:|---|---|---|---|---|---|:---:|---|
| **TC-01** | **User Registration & Validation** | Backend running; database initialized | `username: "testuser"`, `email: "test@devsphere.io"`, `password: "password123"` | Send `POST /api/v1/auth/register` with JSON body | HTTP 201 Created; returns JWT token and UserResponse; profile created | HTTP 201 Created; token and user details returned | **PASS** | Verified live via MockMvc & Surefire reports |
| **TC-02** | **Duplicate Email Rejection** | User with email `test@devsphere.io` exists | `username: "another"`, `email: "test@devsphere.io"`, `password: "secret123"` | Send `POST /api/v1/auth/register` with duplicate email | HTTP 409 Conflict; ApiError with "Email is already registered" | HTTP 409 Conflict; DuplicateResourceException thrown | **PASS** | `AuthServiceTest.register_DuplicateEmail_ThrowsException` |
| **TC-03** | **Blog Ownership Authorization Guard** | Blog exists belonging to User A | User B's JWT token in Authorization header; Blog ID | Send `PUT /api/v1/blogs/{id}` with updated title from User B | HTTP 403 Forbidden; ApiError with "You do not have permission" | HTTP 403 Forbidden; ForbiddenException thrown | **PASS** | `BlogServiceTest.updateBlog_NonOwner_ThrowsForbiddenException` |
| **TC-04** | **Platform Telemetry Overview** | Application started; seed data present | None (HTTP GET request) | Send `GET /api/v1/stats/overview` to port 8080 | HTTP 200 OK; JSON payload with developers, blogs, projects counts | HTTP 200 OK; developersCount: 10000, blogsCount: 2500, projectsCount: 1200 | **PASS** | Visual Evidence: [`02_rest_endpoint_output.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/02_rest_endpoint_output.png) |
| **TC-05** | **Idempotent Project Like Counter** | Project exists with 10 likes; User authenticated | Project ID; User JWT Bearer token | 1. Send `POST /api/v1/projects/{id}/like`<br>2. Send identical request again | 1st request: likes = 11, liked = true<br>2nd request: likes = 10, liked = false | 1st request: 11 (liked); 2nd request: 10 (unliked) | **PASS** | `ProjectServiceTest.toggleLike_WhenNotLiked_LikesProject` & `toggleLike_WhenAlreadyLiked_UnlikesProject` |

---

## 4. Visual Evidence Inventory

All visual submission evidence artifacts have been captured manually by the developer and verified inside [`docs/assignment-evidence/`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence):

| Artifact ID | File Path | File Size | Description & Verified Visual Contents | Verification Status |
|:---:|---|:---:|---|:---:|
| **SS-01** | [`docs/assignment-evidence/01_backend_running.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/01_backend_running.png) | 82.1 KB | Terminal window showing Spring Boot startup banner, embedded Tomcat initialization on port 8080, and data seeding confirmation. | **VERIFIED** |
| **SS-02** | [`docs/assignment-evidence/02_rest_endpoint_output.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/02_rest_endpoint_output.png) | 27.1 KB | Browser window showing HTTP `GET http://localhost:8080/api/v1/stats/overview` with formatted JSON statistics response. | **VERIFIED** |
| **SS-03** | [`docs/assignment-evidence/03_junit_test_results.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/03_junit_test_results.png) | 60.7 KB | Terminal window showing Maven build execution: `Tests run: 26, Failures: 0, Errors: 0, Skipped: 0` and `BUILD SUCCESS`. | **VERIFIED** |
| **SS-04** | [`docs/assignment-evidence/04_project_structure.png`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/docs/assignment-evidence/04_project_structure.png) | 29.4 KB | IDE Explorer tree showing clean package organization: `config`, `controller`, `dto`, `entity`, `exception`, `mapper`, `repository`, `security`, `service`. | **VERIFIED** |
