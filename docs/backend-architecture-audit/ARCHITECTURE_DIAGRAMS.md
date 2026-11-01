# DevSphere Backend Architecture Audit: Technical Architecture Diagrams

**Document Version:** 1.0.0  
**Audit Target:** DevSphere Spring Boot Backend (`com.devsphere`)  
**Auditor:** Senior Java Backend & Microservices Architect  
**Classification:** Academic & Enterprise Architecture Audit  
**Date:** October 2026  

---

## 1. Diagram 1: High-Level Backend Architecture

This diagram visualizes the overall system architecture, showing the communication boundaries between the client tier, security filtering, Spring Web presentation, business services, data access, and persistence infrastructure.

```mermaid
graph TB
    subgraph ClientTier ["CLIENT TIER (React & Static Web)"]
        UI_React["React Islands & Pages<br/>(SignupForm, LoginForm, BlogIsland, ProjectsIsland)"]
        UI_API["Centralized API Client<br/>(src/services/api.js)"]
        UI_React --> UI_API
    end

    subgraph SecurityBoundary ["SECURITY & FILTER PIPELINE"]
        HTTP_REQ["HTTP / HTTPS Request"]
        CORS_FILTER["CorsFilter<br/>(Allowed: localhost:5173, 3000)"]
        JWT_FILTER["JwtAuthenticationFilter<br/>(OncePerRequestFilter)"]
        AUTH_MGR["AuthenticationManager /<br/>DaoAuthenticationProvider"]
        USER_DETAILS["CustomUserDetailsService"]
        BCRYPT["BCryptPasswordEncoder"]
        
        HTTP_REQ --> CORS_FILTER
        CORS_FILTER --> JWT_FILTER
        JWT_FILTER -.-> USER_DETAILS
        AUTH_MGR --> BCRYPT
        AUTH_MGR --> USER_DETAILS
    end

    subgraph PresentationLayer ["PRESENTATION & REST API BOUNDARY (/api/v1/*)"]
        CTRL_AUTH["AuthController"]
        CTRL_BLOG["BlogController"]
        CTRL_DEV["DeveloperController"]
        CTRL_PROJ["ProjectController"]
        CTRL_STAT["StatsController"]
        
        GLOBAL_EX["GlobalExceptionHandler<br/>(@RestControllerAdvice)"]
        SWAGGER["SpringDoc OpenAPI UI<br/>(/swagger-ui.html)"]
    end

    subgraph BusinessLayer ["BUSINESS LOGIC & SERVICE LAYER (com.devsphere.service)"]
        SVC_AUTH["AuthService / AuthServiceImpl"]
        SVC_BLOG["BlogService / BlogServiceImpl"]
        SVC_DEV["DeveloperService / DeveloperServiceImpl"]
        SVC_PROJ["ProjectService / ProjectServiceImpl"]
        SVC_STAT["StatsService / StatsServiceImpl"]
        
        MAPPER["EntityDtoMapper<br/>(@Component)"]
    end

    subgraph DataAccessLayer ["DATA ACCESS & PERSISTENCE (com.devsphere.repository)"]
        REPO_USER["UserRepository"]
        REPO_DEV["DeveloperProfileRepository"]
        REPO_CONN["DeveloperConnectionRepository"]
        REPO_BLOG["BlogRepository"]
        REPO_PROJ["ProjectRepository"]
        REPO_LIKE["ProjectLikeRepository"]
    end

    subgraph DomainEntities ["DOMAIN ENTITY LAYER (com.devsphere.entity)"]
        ENT_USER["User (@Entity)"]
        ENT_DEV["DeveloperProfile (@Entity)"]
        ENT_CONN["DeveloperConnection (@Entity)"]
        ENT_BLOG["Blog (@Entity)"]
        ENT_PROJ["Project (@Entity)"]
        ENT_LIKE["ProjectLike (@Entity)"]
    end

    subgraph DatabaseTier ["DATABASE ENGINE (Configurable Profiles)"]
        POSTGRES["Production: PostgreSQL 16<br/>(jdbc:postgresql://localhost:5432/devsphere)"]
        H2_DB["Dev / Test: H2 Database<br/>(MODE=PostgreSQL file/mem)"]
        FLYWAY["Flyway Migrations<br/>(V1__init_schema.sql, V2__seed_data.sql)"]
    end

    UI_API --> HTTP_REQ
    JWT_FILTER --> CTRL_AUTH
    JWT_FILTER --> CTRL_BLOG
    JWT_FILTER --> CTRL_DEV
    JWT_FILTER --> CTRL_PROJ
    JWT_FILTER --> CTRL_STAT

    CTRL_AUTH --> SVC_AUTH
    CTRL_BLOG --> SVC_BLOG
    CTRL_DEV --> SVC_DEV
    CTRL_PROJ --> SVC_PROJ
    CTRL_STAT --> SVC_STAT

    SVC_AUTH --> MAPPER
    SVC_BLOG --> MAPPER
    SVC_DEV --> MAPPER
    SVC_PROJ --> MAPPER

    SVC_AUTH --> REPO_USER
    SVC_AUTH --> REPO_DEV
    SVC_BLOG --> REPO_BLOG
    SVC_BLOG --> REPO_USER
    SVC_DEV --> REPO_DEV
    SVC_DEV --> REPO_CONN
    SVC_DEV --> REPO_USER
    SVC_PROJ --> REPO_PROJ
    SVC_PROJ --> REPO_LIKE
    SVC_PROJ --> REPO_USER
    SVC_STAT --> REPO_DEV
    SVC_STAT --> REPO_BLOG
    SVC_STAT --> REPO_PROJ

    REPO_USER --> ENT_USER
    REPO_DEV --> ENT_DEV
    REPO_CONN --> ENT_CONN
    REPO_BLOG --> ENT_BLOG
    REPO_PROJ --> ENT_PROJ
    REPO_LIKE --> ENT_LIKE

    ENT_USER --> POSTGRES
    ENT_DEV --> POSTGRES
    ENT_CONN --> POSTGRES
    ENT_BLOG --> POSTGRES
    ENT_PROJ --> POSTGRES
    ENT_LIKE --> POSTGRES

    FLYWAY -.-> POSTGRES
    FLYWAY -.-> H2_DB
```

---

## 2. Diagram 2: Spring Boot Layered Architecture & Component Matrix

This diagram depicts the strict unidirectional dependency flow across layers, validating the absence of cyclic references and anti-corruption boundaries.

```mermaid
graph TD
    subgraph Layer1 ["1. CONTROLLER LAYER (Thin Dispatchers)"]
        direction TB
        C1["AuthController<br/>• /register<br/>• /login<br/>• /me"]
        C2["BlogController<br/>• GET /blogs<br/>• POST /blogs<br/>• PUT /blogs/{id}<br/>• DELETE /blogs/{id}"]
        C3["DeveloperController<br/>• GET /developers<br/>• GET /by-name<br/>• POST /{id}/connect"]
        C4["ProjectController<br/>• GET /projects<br/>• POST /projects<br/>• POST /{id}/like"]
        C5["StatsController<br/>• GET /overview"]
    end

    subgraph Contracts ["DTO & VALIDATION BOUNDARY"]
        direction TB
        REQ["Request DTOs (@Valid)<br/>• RegisterRequest<br/>• LoginRequest<br/>• CreateBlogRequest<br/>• CreateProjectRequest"]
        RESP["Response DTOs<br/>• AuthResponse<br/>• UserResponse<br/>• BlogResponse<br/>• ProjectResponse<br/>• PagedResponse<T>"]
    end

    subgraph Layer2 ["2. SERVICE LAYER (Business Rules & Transactions)"]
        direction TB
        S1["AuthServiceImpl<br/>(@Transactional)"]
        S2["BlogServiceImpl<br/>(@Transactional)"]
        S3["DeveloperServiceImpl<br/>(@Transactional)"]
        S4["ProjectServiceImpl<br/>(@Transactional)"]
        S5["StatsServiceImpl<br/>(@Transactional(readOnly=true))"]
        M1["EntityDtoMapper<br/>(@Component)"]
    end

    subgraph Layer3 ["3. REPOSITORY LAYER (Spring Data JPA Abstraction)"]
        direction TB
        R1["UserRepository<br/>(JpaRepository<User, UUID>)"]
        R2["BlogRepository<br/>(JpaRepository<Blog, UUID>)"]
        R3["DeveloperProfileRepository<br/>(JpaRepository<DeveloperProfile, UUID>)"]
        R4["DeveloperConnectionRepository<br/>(JpaRepository<DeveloperConnection, UUID>)"]
        R5["ProjectRepository<br/>(JpaRepository<Project, UUID>)"]
        R6["ProjectLikeRepository<br/>(JpaRepository<ProjectLike, UUID>)"]
    end

    subgraph Layer4 ["4. DOMAIN / ENTITY LAYER (JPA & Hibernate)"]
        direction TB
        E1["User (@Table 'users')"]
        E2["Blog (@Table 'blogs')"]
        E3["DeveloperProfile (@Table 'developer_profiles')"]
        E4["DeveloperConnection (@Table 'developer_connections')"]
        E5["Project (@Table 'projects')"]
        E6["ProjectLike (@Table 'project_likes')"]
    end

    C1 --> REQ
    C2 --> REQ
    C4 --> REQ

    C1 --> S1
    C2 --> S2
    C3 --> S3
    C4 --> S4
    C5 --> S5

    S1 --> M1
    S2 --> M1
    S3 --> M1
    S4 --> M1

    M1 --> RESP
    RESP --> C1
    RESP --> C2
    RESP --> C3
    RESP --> C4
    RESP --> C5

    S1 --> R1
    S1 --> R3
    S2 --> R2
    S2 --> R1
    S3 --> R3
    S3 --> R4
    S3 --> R1
    S4 --> R5
    S4 --> R6
    S4 --> R1
    S5 --> R3
    S5 --> R2
    S5 --> R5

    R1 --> E1
    R2 --> E2
    R3 --> E3
    R4 --> E4
    R5 --> E5
    R6 --> E6
```

---

## 3. Diagram 3: Authentication and Security Flow

This diagram illustrates the stateless JWT security lifecycle from login through protected resource dispatch.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Browser
    participant API as api.js
    participant SecFilter as SecurityFilterChain
    participant JwtFilter as JwtAuthenticationFilter
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthServiceImpl
    participant AuthMgr as AuthenticationManager
    participant UserRepo as UserRepository
    participant JwtProv as JwtTokenProvider
    participant BlogCtrl as BlogController

    Note over User, AuthCtrl: 1. Authentication & Token Generation Phase
    User->>API: Enter credentials (email, password)
    API->>SecFilter: POST /api/v1/auth/login
    SecFilter->>AuthCtrl: PermitAll matched -> dispatch
    AuthCtrl->>AuthSvc: login(LoginRequest)
    AuthSvc->>AuthMgr: authenticate(UsernamePasswordToken)
    AuthMgr->>UserRepo: findByEmail(email)
    UserRepo-->>AuthMgr: Return User entity
    AuthMgr-->>AuthSvc: Authentication successful
    AuthSvc->>JwtProv: generateToken(UserPrincipal)
    JwtProv-->>AuthSvc: Signed JWT (HMAC-SHA256)
    AuthSvc-->>AuthCtrl: AuthResponse(token, userResponse)
    AuthCtrl-->>API: 200 OK + JWT Token
    API->>User: Store token in localStorage("jwt_token")

    Note over User, BlogCtrl: 2. Authenticated API Call Phase
    User->>API: Publish Blog
    API->>SecFilter: POST /api/v1/blogs (Header: "Authorization: Bearer <jwt>")
    SecFilter->>JwtFilter: Intercept request in doFilterInternal()
    JwtFilter->>JwtProv: validateToken(jwt)
    JwtProv-->>JwtFilter: Signature valid
    JwtFilter->>JwtProv: getUserIdFromToken(jwt)
    JwtProv-->>JwtFilter: Returns UUID
    JwtFilter->>UserRepo: loadUserById(UUID)
    UserRepo-->>JwtFilter: Returns UserDetails
    JwtFilter->>JwtFilter: Set SecurityContextHolder(authentication)
    SecFilter->>BlogCtrl: Dispatched with @AuthenticationPrincipal
    BlogCtrl-->>User: 201 CREATED (Blog Response)
```

---

## 4. Diagram 4: Database Interaction and Migration Flow

This diagram maps how entities, schema migrations, and database engines interact across environments.

```mermaid
graph LR
    subgraph SourceFiles ["SOURCE CONFIGURATION"]
        APP_PROP["application.properties<br/>(PostgreSQL Prod Config)"]
        DEV_PROP["application-dev.properties<br/>(H2 File Config)"]
        TEST_PROP["application-test.properties<br/>(H2 In-Memory Config)"]
    end

    subgraph Migrations ["FLYWAY MIGRATIONS (src/main/resources/db/migration)"]
        V1["V1__init_schema.sql<br/>• users, blogs, projects<br/>• developer_profiles<br/>• join tables & indexes"]
        V2["V2__seed_devsphere_data.sql<br/>• baseline developers<br/>• baseline blogs<br/>• baseline projects"]
    end

    subgraph StartupBoot ["STARTUP BOOTSTRAP"]
        DATA_INIT["DataInitializer.java<br/>(CommandLineRunner)<br/>• BCrypt Password Encoding<br/>• Demo Admin Account<br/>• Profiles fallback"]
    end

    subgraph DatabaseEngines ["TARGET DATABASES"]
        PROD_DB[("PostgreSQL Database<br/>localhost:5432/devsphere<br/>Flyway Managed Schema")]
        H2_DEV[("H2 File Database<br/>./data/devspheredb<br/>PostgreSQL Dialect Mode")]
        H2_MEM[("H2 In-Memory Database<br/>testdb<br/>create-drop isolated")]
    end

    APP_PROP --> V1
    APP_PROP --> V2
    V1 --> PROD_DB
    V2 --> PROD_DB

    DEV_PROP --> H2_DEV
    TEST_PROP --> H2_MEM

    DATA_INIT -.-> PROD_DB
    DATA_INIT -.-> H2_DEV
    DATA_INIT -.-> H2_MEM
```
