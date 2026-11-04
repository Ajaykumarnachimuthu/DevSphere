# DevSphere — Master Hybrid Microservices Architecture Diagrams

This document contains comprehensive architectural and sequence diagrams illustrating the DevSphere Hybrid Microservices Architecture.

---

## 1. High-Level System Architecture & Port Registry

The DevSphere platform operates as an integrated **Hybrid Architecture**:
* **DevSphere Core (Modular Monolith)** acts as the **Identity Authority**, **Gateway Facade**, and owner of developer identity, profiles, social connections, and platform aggregation.
* **Blog Service** is an autonomous microservice owning technical blogs, drafts, reading times, tags, bookmarks, and comments.
* **Project Service** is an autonomous microservice owning engineering showcases, atomic likes, atomic views, bookmarks, and comments.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        UI["React Single Page Application<br/>(Vite, TailwindCSS, Lucide)<br/>Port: 5173"]
    end

    subgraph GatewayCore ["DevSphere Core (Modular Monolith) — Port: 8080"]
        direction TB
        SecGateway["Security & Gateway Facade<br/>(JWT Filter, BCrypt, RestClient Dispatcher)"]
        AuthMod["Authentication Module<br/>(Login, Register, Refresh)"]
        DevMod["Developer Profile Module<br/>(Discovery, Skills, Connections)"]
        StatsMod["Platform Stats Module<br/>(Resilient Aggregation)"]
        SecTokenService["InternalTokenService<br/>(HMAC-SHA256 Token Signer)"]
    end

    subgraph BlogDomain ["Blog Microservice — Port: 8081"]
        direction TB
        BlogSec["InternalTokenVerifier<br/>(Audience: blog-service)"]
        BlogLogic["Blog Domain Engine<br/>(Publishing, Reading Time, Drafts)"]
        BlogDB[("Blog Database<br/>(blogs, blog_likes, etc.)")]
        BlogSec --> BlogLogic --> BlogDB
    end

    subgraph ProjectDomain ["Project Microservice — Port: 8082"]
        direction TB
        ProjSec["InternalTokenVerifier<br/>(Audience: project-service)"]
        ProjLogic["Project Showcase Engine<br/>(Pessimistic Lock, Atomic Views)"]
        ProjDB[("Project Database<br/>(projects, project_likes, etc.)")]
        ProjSec --> ProjLogic --> ProjDB
    end

    subgraph CoreStorage ["Core Database Layer"]
        CoreDB[("Core Database<br/>(users, developer_profiles, connections)")]
    end

    %% Client Communication
    UI -->|"1. HTTPS / REST with Bearer JWT"| SecGateway

    %% Core Internal Delegation
    SecGateway --> AuthMod
    SecGateway --> DevMod
    SecGateway --> StatsMod
    AuthMod & DevMod --> CoreDB

    %% Gateway to Downstream Microservices
    SecGateway -->|"2. RestClient (HTTP REST)<br/>Header: X-Internal-Token<br/>Header: X-Correlation-Id"| BlogSec
    SecGateway -->|"2. RestClient (HTTP REST)<br/>Header: X-Internal-Token<br/>Header: X-Correlation-Id"| ProjSec
    StatsMod -.->|"Resilient Fallback Query"| BlogSec
    StatsMod -.->|"Resilient Fallback Query"| ProjSec
```

---

## 2. API Gateway Routing & Delegation Sequence

The React frontend maintains a single base URL pointing to `http://localhost:8080/api/v1`. Core delegates write and read operations to downstream microservices, ensuring single source of truth.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer (Browser)
    participant Core as DevSphere Core (Gateway :8080)
    participant BlogSvc as Blog Service (:8081)
    participant BlogDB as Blog DB

    Dev->>Core: POST /api/v1/blogs (Bearer JWT)
    Note over Core: 1. Validate User JWT & Session<br/>2. Resolve UserPrincipal (UUID, Username, Role)<br/>3. Sign Internal Token (Aud: blog-service, Exp: 10m)
    Core->>BlogSvc: POST /api/v1/blogs<br/>[X-Internal-Token, X-Correlation-Id]
    Note over BlogSvc: 1. Verify HMAC-SHA256 Signature<br/>2. Validate Audience == blog-service<br/>3. Calculate Reading Time: max(1, ceil(words/200))<br/>4. Persist Blog Record with Author UUID
    BlogSvc->>BlogDB: INSERT into blogs VALUES (...)
    BlogDB-->>BlogSvc: Stored Entity
    BlogSvc-->>Core: 201 Created (BlogResponse JSON)
    Core-->>Dev: 201 Created (BlogResponse JSON)
```

---

## 3. Cryptographic Token Propagation & Trust Model

DevSphere employs a zero-trust inter-service security model. Microservices never accept unverified arbitrary headers (such as raw `X-User-Id`). Every internal request carries a cryptographically signed HMAC-SHA256 internal token.

```mermaid
sequenceDiagram
    autonumber
    participant React as React Frontend
    participant Core as DevSphere Core
    participant TokenSvc as InternalTokenService
    participant Downstream as Microservice (Blog / Project)
    participant Verifier as InternalTokenVerifier

    React->>Core: Request with Client JWT
    Core->>TokenSvc: generateInternalToken(principal, targetAudience)
    Note over TokenSvc: Payload:<br/>- sub: User UUID<br/>- username: String<br/>- role: ROLE_USER<br/>- aud: blog-service / project-service<br/>- iss: devsphere-core<br/>- exp: now + 10 mins<br/>- jti: Correlation UUID
    TokenSvc-->>Core: Signed compact JWT
    Core->>Downstream: HTTP Request with X-Internal-Token
    Downstream->>Verifier: verifyAndExtractPrincipal(token)
    alt Valid Signature & Matching Audience
        Verifier-->>Downstream: VerifiedUserContext (UUID, username, role)
        Downstream->>Downstream: Authorize Action & Execute Domain Logic
    else Tampered Token or Wrong Audience
        Verifier-->>Downstream: Throws SecurityException
        Downstream-->>Core: 401 Unauthorized / 403 Forbidden
    end
```

---

## 4. Database Ownership & Schema Boundary Matrix

Each service maintains strict data encapsulation. No cross-service database transactions or foreign keys exist between Core, Blog Service, and Project Service.

```mermaid
erDiagram
    %% Core Domain
    USERS {
        uuid id PK
        varchar email
        varchar username
        varchar password_hash
        varchar role
        int token_version
        timestamp created_at
    }
    USER_PROFILES {
        uuid user_id PK,FK
        varchar bio
        varchar location
        varchar github_url
        varchar avatar_url
    }
    DEVELOPER_CONNECTIONS {
        uuid id PK
        uuid requester_id FK
        uuid target_id FK
        varchar status
    }
    USERS ||--|| USER_PROFILES : owns
    USERS ||--o{ DEVELOPER_CONNECTIONS : initiates

    %% Blog Service Domain
    BLOGS {
        uuid id PK
        varchar title
        varchar slug
        text content
        varchar author_name
        uuid author_id
        varchar read_time
        varchar status
        int likes_count
        timestamp created_at
    }
    BLOG_LIKES {
        uuid id PK
        uuid blog_id FK
        uuid user_id
    }
    BLOG_COMMENTS {
        uuid id PK
        uuid blog_id FK
        uuid user_id
        text comment_text
    }
    BLOGS ||--o{ BLOG_LIKES : has
    BLOGS ||--o{ BLOG_COMMENTS : has

    %% Project Service Domain
    PROJECTS {
        uuid id PK
        varchar title
        text description
        varchar demo_url
        varchar github_repo
        uuid owner_id
        varchar owner_username
        int likes_count
        bigint views_count
        timestamp created_at
    }
    PROJECT_LIKES {
        uuid id PK
        uuid project_id FK
        uuid user_id
    }
    PROJECT_COMMENTS {
        uuid id PK
        uuid project_id FK
        uuid user_id
        text comment_text
    }
    PROJECTS ||--o{ PROJECT_LIKES : has
    PROJECTS ||--o{ PROJECT_COMMENTS : has
```

---

## 5. Fault Isolation & Graceful Degradation Behavior

When a downstream microservice is down or undergoes maintenance, DevSphere Core isolates the failure and returns a structured `503 SERVICE_UNAVAILABLE` for that specific domain, while all other features continue running seamlessly.

```mermaid
stateDiagram-v2
    [*] --> AllServicesHealthy

    state AllServicesHealthy {
        Core_8080 : DevSphere Core Online
        Blog_8081 : Blog Service Online
        Project_8082 : Project Service Online
    }

    AllServicesHealthy --> BlogServiceDown : Blog Service Process Terminates / Network Partition
    
    state BlogServiceDown {
        CoreOnline : DevSphere Core 100% Operational
        AuthWorking : Auth & JWT Issuance Works
        ProfilesWorking : Developer Profiles & Search Works
        ProjectsWorking : Project Showcases & Likes Work (200 OK)
        BlogDegraded : Blog API returns 503 SERVICE_UNAVAILABLE
    }

    BlogServiceDown --> AllServicesHealthy : Blog Service Restarts & Health Check Recovers
```

