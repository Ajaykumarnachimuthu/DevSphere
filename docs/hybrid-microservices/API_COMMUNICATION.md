# DevSphere — Inter-Service API Communication & Gateway Contracts

This document specifies the inter-service synchronous REST communication architecture, internal headers, security contracts, timeout configurations, and error translation protocols between **DevSphere Core (Port 8080)**, **Blog Service (Port 8081)**, and **Project Service (Port 8082)**.

---

## 1. Gateway Client Architecture

DevSphere Core communicates with downstream microservices using modern Spring Framework 6.2 **`RestClient`** instances configured with non-blocking, fail-safe connection properties.

### 1.1 Connection & Timeout Configuration

Each downstream client (`BlogServiceClient`, `ProjectServiceClient`) utilizes a dedicated `SimpleClientHttpRequestFactory`:

```java
SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
factory.setConnectTimeout(Duration.ofMillis(5000)); // 5 second TCP connect timeout
factory.setReadTimeout(Duration.ofMillis(5000));    // 5 second socket read timeout

this.restClient = RestClient.builder()
        .baseUrl(baseUrl)
        .requestFactory(factory)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
```

### 1.2 Configuration Properties (`application.properties`)

Downstream URLs, timeouts, and shared cryptographic secrets are fully configurable through standard Spring Boot environment properties:

| Property | Default Value | Description |
| :--- | :--- | :--- |
| `devsphere.services.blog.base-url` | `http://localhost:8081` | Blog Service base URL |
| `devsphere.services.blog.timeout-ms` | `5000` | Blog Service timeout in milliseconds |
| `devsphere.services.project.base-url` | `http://localhost:8082` | Project Service base URL |
| `devsphere.services.project.timeout-ms` | `5000` | Project Service timeout in milliseconds |
| `devsphere.internal.secret` | *(HMAC Secret Key)* | 256-bit secret used for internal token signing |

---

## 2. HTTP Headers & Distributed Tracing

Every request dispatched from DevSphere Core to a downstream microservice includes strict contextual headers:

| Header Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `X-Correlation-Id` | UUID String | Unique transaction identifier generated per request for distributed log correlation | `d4b8e21a-7b3f-4e9a-bf31-8935c179c3d4` |
| `X-Internal-Token` | JWT Compact String | HMAC-SHA256 signed internal assertion carrying caller identity, role, and audience restriction | `eyJhbGciOiJIUzI1NiJ9...` |
| `Content-Type` | MIME String | Standard JSON content type | `application/json` |

> [!IMPORTANT]
> **No Direct `X-User-Id` Trust**: Downstream microservices reject unverified headers. Identity is strictly extracted after verifying the digital signature and audience claims inside `X-Internal-Token`.

---

## 3. Cryptographic Assertion Protocol (`InternalTokenService`)

When an authenticated user invokes a blog or project endpoint through Core:
1. Core retrieves the validated `UserPrincipal` from the Spring Security `SecurityContextHolder`.
2. Core invokes `InternalTokenService.generateInternalToken(principal, targetAudience)`.
3. The token payload contains:
   - `sub`: User ID (UUID)
   - `username`: Developer username
   - `role`: Granted authority (e.g. `ROLE_USER`, `ROLE_ADMIN`)
   - `aud`: Specific target microservice (`blog-service` or `project-service`)
   - `iss`: `devsphere-core`
   - `iat`: Timestamp of issuance
   - `exp`: Short expiration window (10 minutes)
   - `jti`: Unique correlation identifier matching `X-Correlation-Id`
4. The downstream microservice verifies:
   - Valid HMAC-SHA256 signature against the shared secret.
   - The token has not expired.
   - The token's audience matches its own identity (e.g., `blog-service` rejects tokens meant for `project-service`).

---

## 4. API Endpoints Catalogue & Routing Matrix

The React frontend communicates solely through the **Port 8080** gateway. Core delegates the operations transparently:

### 4.1 Blog Domain Routing

| Frontend External Route (Port 8080) | HTTP Method | Target Downstream Route (Port 8081) | Auth Required | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/blogs` | `GET` | `/api/v1/blogs` | No | List published blogs with pagination, category filter & search |
| `/api/v1/blogs/{id}` | `GET` | `/api/v1/blogs/{id}` | Optional | Retrieve single blog post details and view counts |
| `/api/v1/blogs` | `POST` | `/api/v1/blogs` | **Yes** | Author a new blog post or draft |
| `/api/v1/blogs/{id}` | `PUT` | `/api/v1/blogs/{id}` | **Yes** | Update blog post (enforces author ownership) |
| `/api/v1/blogs/{id}` | `DELETE` | `/api/v1/blogs/{id}` | **Yes** | Delete blog post (enforces author ownership) |
| `/api/v1/blogs/drafts` | `GET` | `/api/v1/blogs/drafts` | **Yes** | Retrieve private drafts authored by authenticated user |
| `/api/v1/blogs/{id}/like` | `POST` | `/api/v1/blogs/{id}/like` | **Yes** | Toggle like on blog post |
| `/api/v1/blogs/{id}/bookmark` | `POST` | `/api/v1/blogs/{id}/bookmark` | **Yes** | Toggle bookmark on blog post |
| `/api/v1/blogs/{id}/comments` | `GET` | `/api/v1/blogs/{id}/comments` | No | Fetch comments for a blog post |
| `/api/v1/blogs/{id}/comments` | `POST` | `/api/v1/blogs/{id}/comments` | **Yes** | Post comment on blog post |
| `/api/v1/blogs/tags/popular` | `GET` | `/api/v1/blogs/tags/popular` | No | Fetch popular blog tags |
| `/api/v1/blogs/knowledge-trails` | `GET` | `/api/v1/blogs/knowledge-trails` | No | Fetch curated engineering knowledge trails |

### 4.2 Project Domain Routing

| Frontend External Route (Port 8080) | HTTP Method | Target Downstream Route (Port 8082) | Auth Required | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/projects` | `GET` | `/api/v1/projects` | No | List public project showcases with pagination & filters |
| `/api/v1/projects/{id}` | `GET` | `/api/v1/projects/{id}` | Optional | Retrieve full project documentation & engineering details |
| `/api/v1/projects` | `POST` | `/api/v1/projects` | **Yes** | Publish new project showcase |
| `/api/v1/projects/{id}` | `PUT` | `/api/v1/projects/{id}` | **Yes** | Update project (enforces creator ownership) |
| `/api/v1/projects/{id}` | `DELETE` | `/api/v1/projects/{id}` | **Yes** | Delete project (enforces creator ownership) |
| `/api/v1/projects/{id}/like` | `POST` | `/api/v1/projects/{id}/like` | **Yes** | Atomic like toggle (concurrency-safe) |
| `/api/v1/projects/{id}/view` | `POST` | `/api/v1/projects/{id}/view` | No | Atomic view counter increment |
| `/api/v1/projects/{id}/bookmark` | `POST` | `/api/v1/projects/{id}/bookmark` | **Yes** | Toggle project bookmark |
| `/api/v1/projects/{id}/comments` | `GET` | `/api/v1/projects/{id}/comments` | No | Fetch project discussion comments |
| `/api/v1/projects/{id}/comments` | `POST` | `/api/v1/projects/{id}/comments` | **Yes** | Add comment to project discussion |
| `/api/v1/projects/categories` | `GET` | `/api/v1/projects/categories` | No | Retrieve list of project categories |

---

## 5. Error Handling & HTTP Status Code Mapping

When an error occurs downstream or a network failure intervenes, the Core Gateway translates the response into uniform RFC 7807-compliant JSON:

| Downstream Condition | Gateway Handling | HTTP Status Returned to Browser | Error Response Payload |
| :--- | :--- | :--- | :--- |
| Downstream service process stopped or unreachable | Catches `ResourceAccessException` | **503 SERVICE_UNAVAILABLE** | `{"status": 503, "error": "SERVICE_UNAVAILABLE", "message": "Blog Service (Port 8081) is currently unreachable. Project discovery, developer profiles, and authentication remain operational."}` |
| Downstream entity not found | Translates downstream 404 | **404 NOT_FOUND** | `{"status": 404, "error": "NOT_FOUND", "message": "Blog post not found with id: ..."}` |
| Caller tries to edit another user's post | Translates downstream 403 | **403 FORBIDDEN** | `{"status": 403, "error": "FORBIDDEN", "message": "You are not authorized to modify this resource."}` |
| Invalid payload / Bean validation failure | Translates downstream 400 | **400 BAD_REQUEST** | `{"status": 400, "error": "BAD_REQUEST", "message": "Title is required"}` |
| Internal token missing or forged | Downstream rejects | **401 UNAUTHORIZED** | `{"status": 401, "error": "UNAUTHORIZED", "message": "Invalid or missing internal cryptographic assertion."}` |

---

## 6. Sample Request & Response Payloads

### 6.1 Create Project Request (`POST /api/v1/projects`)

```json
{
  "title": "FleetWatch Telemetry Engine",
  "category": "Cloud & Distributed Systems",
  "techStack": "Java, Spring Boot, Kafka, TimescaleDB",
  "description": "High-throughput real-time telemetry processing engine handling 50k+ sensor events/sec.",
  "demoUrl": "https://fleetwatch.devsphere.io",
  "githubRepo": "https://github.com/ajaykumar/fleetwatch-telemetry",
  "tags": ["iot", "kafka", "distributed-systems", "spring-boot"],
  "problemStatement": "Large fleet telematics generated 50k unbatched telemetry pings per second causing severe database lock contention.",
  "proposedSolution": "Architected partitioned Kafka event streams paired with TimescaleDB hypertables and sliding-window Redis aggregations.",
  "keyFeatures": [
    "50,000 events/sec ingestion rate",
    "Sub-100ms anomaly detection alerts",
    "Automated geo-fencing breach triggers"
  ],
  "architectureSummary": "React Dashboards -> Envoy Gateway -> Spring Boot Ingestion -> Apache Kafka -> TimescaleDB Hypertables.",
  "quickstartCmd": "git clone https://github.com/ajaykumar/fleetwatch-telemetry && cd fleetwatch-telemetry && docker compose up -d"
}
```

### 6.2 Blog Creation Response (`201 CREATED`)

```json
{
  "id": "d1000000-0000-0000-0000-000000000001",
  "title": "Architecting Real-Time Telemetry with Kafka and Spring Boot",
  "subtitle": "Handling 50,000 events/sec with fault-tolerant sliding windows",
  "category": "Cloud & Distributed Systems",
  "author": "AJAYKUMAR N",
  "readTime": "3 min read",
  "tech": "Spring Boot 3, Kafka, Docker",
  "difficulty": "Advanced",
  "likes": 42,
  "bookmarks": 18,
  "status": "PUBLISHED",
  "tags": ["spring-boot", "kafka", "distributed-systems"],
  "owner": true,
  "createdAt": "2026-11-03T18:00:00Z"
}
```

