# DevSphere Microservices Practical: Developer Service Evidence

## 1. Service Overview & Architecture

- **Service Name:** `developer-service`
- **Application Port:** `8081`
- **Context Path:** `/`
- **Base API Route:** `/api/v1/developers`
- **Database Engine:** In-Memory H2 Database (`jdbc:h2:mem:developerdb`)
- **Technology Stack:** Java 17, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Tomcat 10
- **Architectural Boundary:** Decoupled service responsible for managing developer profiles, tech stack skills, professional locations, bios, and developer aggregate statistics (views, project count, connections).

---

## 2. Entity & Database Schema

### Entity: `DeveloperProfile` (`com.devsphere.developerservice.entity.DeveloperProfile`)
```java
@Entity
@Table(name = "developer_profiles")
public class DeveloperProfile {
    @Id
    private String id; // UUID

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String role;

    private String avatar;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "developer_skills", joinColumns = @JoinColumn(name = "developer_id"))
    @Column(name = "skill")
    private Set<String> skills = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 3. REST API Specification

| HTTP Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/developers` | Retrieve all registered developer profiles | `200 OK` |
| `GET` | `/api/v1/developers/{id}` | Retrieve single developer profile by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/v1/developers` | Register/Create a new developer profile | `201 Created` |
| `GET` | `/api/v1/developers/{id}/stats` | Retrieve metrics (views, projects, connections) | `200 OK` |

---

## 4. Live Verification & API Responses

### Test 1: Fetch Developer Profiles (`GET /api/v1/developers`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers" -Method Get
```
**Response Sample (6 Seeded DevSphere Developers):**
```json
[
  {
    "id": "1",
    "name": "Ajay Kumar",
    "role": "Full Stack Developer",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ajay",
    "location": "India",
    "description": "Full stack engineer passionate about Spring Boot and modern web applications.",
    "skills": ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
    "createdAt": "2026-10-30T23:29:05.106",
    "updatedAt": "2026-10-30T23:29:05.106"
  },
  {
    "id": "2",
    "name": "Arun Kumar",
    "role": "React Developer",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun",
    "location": "India",
    "description": "Frontend enthusiast focusing on responsive UI/UX and state management.",
    "skills": ["JavaScript", "React", "Tailwind CSS", "Redux", "Vite"],
    "createdAt": "2026-10-30T23:29:05.106",
    "updatedAt": "2026-10-30T23:29:05.106"
  }
]
```

### Test 2: Create Developer Profile (`POST /api/v1/developers`)
**Command:**
```powershell
$dev = @{
    name = "Marcus Vance"
    role = "Staff Systems Architect"
    location = "San Francisco, CA"
    description = "Specializing in distributed systems and domain-driven design."
    skills = @("Java", "Spring Cloud", "Kafka", "Kubernetes")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers" -Method Post -Body $dev -ContentType "application/json"
```
**Response:**
```json
{
  "id": "f1372ccf-0183-4607-9156-5fe9a02463f6",
  "name": "Marcus Vance",
  "role": "Staff Systems Architect",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus Vance",
  "location": "San Francisco, CA",
  "description": "Specializing in distributed systems and domain-driven design.",
  "skills": ["Java", "Spring Cloud", "Kafka", "Kubernetes"],
  "createdAt": "2026-10-30T23:29:05.210",
  "updatedAt": "2026-10-30T23:29:05.210"
}
```

### Test 3: Developer Aggregate Stats (`GET /api/v1/developers/{id}/stats`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers/f1372ccf-0183-4607-9156-5fe9a02463f6/stats" -Method Get
```
**Response:**
```json
{
  "developerId": "f1372ccf-0183-4607-9156-5fe9a02463f6",
  "views": 1280,
  "projectsCount": 5,
  "connections": 24
}
```

---

## 5. Automated Unit & Integration Tests

```text
[INFO] Running com.devsphere.developerservice.DeveloperServiceApplicationTests
2026-10-30T23:25:01.312+05:30  INFO [developer-service] : Started DeveloperServiceApplicationTests
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.887 s
[INFO] BUILD SUCCESS
```
Verified Test Cases:
1. `contextLoads()`: Spring application context initialization.
2. `testGetAllDevelopers()`: Verifies pre-seeded DevSphere developers are present.
3. `testCreateDeveloper()`: Validates JPA entity persistence and UUID assignment.
4. `testGetDeveloperStats()`: Confirms statistics aggregation response structure.
