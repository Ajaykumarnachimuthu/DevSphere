# DevSphere Microservices Practical: Project Service Evidence

## 1. Service Overview & Architecture

- **Service Name:** `project-service`
- **Application Port:** `8082`
- **Context Path:** `/`
- **Base API Route:** `/api/v1/projects`
- **Database Engine:** In-Memory H2 Database (`jdbc:h2:mem:projectdb`)
- **Technology Stack:** Java 17, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Tomcat 10
- **Architectural Boundary:** Autonomous domain service managing the community project showcase, category filtering, technology stack tags, view counter incrementation, and like/unlike interaction state.

---

## 2. Entity & Database Schema

### Entity: `Project` (`com.devsphere.projectservice.entity.Project`)
```java
@Entity
@Table(name = "projects")
public class Project {
    @Id
    private String id; // UUID

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private String authorName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_technologies", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "technology")
    private Set<String> technologies = new HashSet<>();

    private int likes = 0;
    private int views = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 3. REST API Specification

| HTTP Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | List all DevSphere project showcases (optional query: `?category=...`) | `200 OK` |
| `GET` | `/api/v1/projects/{id}` | Retrieve single project details | `200 OK` / `404 Not Found` |
| `POST` | `/api/v1/projects` | Submit a new project to showcase | `201 Created` |
| `POST` | `/api/v1/projects/{id}/like` | Increment like count for a project | `200 OK` |
| `POST` | `/api/v1/projects/{id}/view` | Increment view counter for a project | `200 OK` |

---

## 4. Live Verification & API Responses

### Test 1: Fetch Projects (`GET /api/v1/projects`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects" -Method Get
```
**Response Sample (6 Seeded DevSphere Projects):**
```json
[
  {
    "id": "1",
    "title": "Personal Finance Tracker",
    "description": "Full-stack personal finance and wealth tracker with interactive analytics and budgets.",
    "category": "Web Development",
    "authorName": "Ajaykumar N",
    "technologies": ["Spring Boot", "React", "PostgreSQL", "Tailwind CSS"],
    "likes": 128,
    "views": 2400,
    "createdAt": "2026-10-30T23:29:05.514",
    "updatedAt": "2026-10-30T23:29:05.514"
  },
  {
    "id": "2",
    "title": "Railway Ticket Booking System",
    "description": "High-concurrency ticket reservation engine with real-time seat availability.",
    "category": "Web Development",
    "authorName": "Varnika S",
    "technologies": ["Java", "Spring Boot", "MySQL", "React"],
    "likes": 96,
    "views": 1800,
    "createdAt": "2026-10-30T23:29:05.514",
    "updatedAt": "2026-10-30T23:29:05.514"
  }
]
```

### Test 2: Create Project Showcase (`POST /api/v1/projects`)
**Command:**
```powershell
$proj = @{
    title = "CodePulse Telemetry Engine"
    description = "Distributed microservices latency and health telemetry collector."
    category = "DevOps"
    authorName = "DevSphere Team"
    technologies = @("Go", "Spring Boot", "Prometheus", "Grafana")
    likes = 12
    views = 250
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects" -Method Post -Body $proj -ContentType "application/json"
```
**Response:**
```json
{
  "id": "fb0ec083-58bc-4575-81b5-85d76499c366",
  "title": "CodePulse Telemetry Engine",
  "description": "Distributed microservices latency and health telemetry collector.",
  "category": "DevOps",
  "authorName": "DevSphere Team",
  "technologies": ["Go", "Spring Boot", "Prometheus", "Grafana"],
  "likes": 12,
  "views": 250,
  "createdAt": "2026-10-30T23:29:05.620",
  "updatedAt": "2026-10-30T23:29:05.620"
}
```

### Test 3: Like Project (`POST /api/v1/projects/{id}/like`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects/fb0ec083-58bc-4575-81b5-85d76499c366/like" -Method Post
```
**Response:**
```json
{
  "id": "fb0ec083-58bc-4575-81b5-85d76499c366",
  "title": "CodePulse Telemetry Engine",
  "likes": 13,
  "views": 250,
  "updatedAt": "2026-10-30T23:29:05.710"
}
```

---

## 5. Automated Unit & Integration Tests

```text
[INFO] Running com.devsphere.projectservice.ProjectServiceApplicationTests
2026-10-30T23:25:22.411+05:30  INFO [project-service] : Started ProjectServiceApplicationTests
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.231 s
[INFO] BUILD SUCCESS
```
Verified Test Cases:
1. `contextLoads()`: Verifies Spring context bootstrap.
2. `testGetAllProjects()`: Confirms pre-seeded projects load successfully.
3. `testCreateProject()`: Validates creation of project and tech collection.
4. `testToggleLike()`: Confirms atomic like incrementation.
5. `testIncrementView()`: Confirms atomic view counter update.
