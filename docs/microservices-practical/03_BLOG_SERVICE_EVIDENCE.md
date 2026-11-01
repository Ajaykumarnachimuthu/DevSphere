# DevSphere Microservices Practical: Blog Service Evidence

## 1. Service Overview & Architecture

- **Service Name:** `blog-service`
- **Application Port:** `8083`
- **Context Path:** `/`
- **Base API Route:** `/api/v1/blogs`
- **Database Engine:** In-Memory H2 Database (`jdbc:h2:mem:blogdb`)
- **Technology Stack:** Java 17, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Tomcat 10
- **Architectural Boundary:** Autonomous content domain service managing technical blogs, markdown articles, reading time estimates, categories, tech tag filters, and publication lifecycle (`PUBLISHED` / `DRAFT`).

---

## 2. Entity & Database Schema

### Entity: `Blog` (`com.devsphere.blogservice.entity.Blog`)
```java
@Entity
@Table(name = "blogs")
public class Blog {
    @Id
    private String id; // UUID

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String category;
    private String authorName;
    private String readTime;
    private String tech;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "blog_tags", joinColumns = @JoinColumn(name = "blog_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    private String status = "PUBLISHED";

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 3. REST API Specification

| HTTP Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/blogs` | Retrieve all published technical blogs | `200 OK` |
| `GET` | `/api/v1/blogs/{id}` | Retrieve full blog content and metadata by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/v1/blogs` | Publish a new technical blog post | `201 Created` |

---

## 4. Live Verification & API Responses

### Test 1: Fetch Technical Blogs (`GET /api/v1/blogs`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/v1/blogs" -Method Get
```
**Response Sample (6 Seeded DevSphere Articles):**
```json
[
  {
    "id": "1",
    "title": "Understanding JavaScript Closures",
    "content": "Closures are a fundamental concept in JavaScript where an inner function has access to outer variables...",
    "category": "Web Development",
    "authorName": "Ajay Kumar",
    "readTime": "5 min read",
    "tech": "JavaScript",
    "tags": ["JavaScript", "Web Development", "Frontend"],
    "status": "PUBLISHED",
    "createdAt": "2026-10-30T23:29:05.863",
    "updatedAt": "2026-10-30T23:29:05.863"
  },
  {
    "id": "2",
    "title": "Getting Started with React Hooks",
    "content": "React Hooks revolutionized how we write stateful logic in functional components...",
    "category": "Web Development",
    "authorName": "Arun Kumar",
    "readTime": "6 min read",
    "tech": "React",
    "tags": ["React", "JavaScript", "Frontend"],
    "status": "PUBLISHED",
    "createdAt": "2026-10-30T23:29:05.863",
    "updatedAt": "2026-10-30T23:29:05.863"
  }
]
```

### Test 2: Publish Blog Post (`POST /api/v1/blogs`)
**Command:**
```powershell
$blog = @{
    title = "Building Resilient Microservices with Spring Boot 3"
    content = "Microservices decoupling requires independent data models, circuit breakers, and lightweight REST contracts."
    category = "Architecture"
    authorName = "DevSphere Architect"
    readTime = "7 min read"
    tech = "Spring Boot"
    tags = @("Microservices", "Spring Boot", "Java", "Architecture")
    status = "PUBLISHED"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/v1/blogs" -Method Post -Body $blog -ContentType "application/json"
```
**Response:**
```json
{
  "id": "a7d972e1-2ff5-4240-80b1-79e78236aa54",
  "title": "Building Resilient Microservices with Spring Boot 3",
  "content": "Microservices decoupling requires independent data models, circuit breakers, and lightweight REST contracts.",
  "category": "Architecture",
  "authorName": "DevSphere Architect",
  "readTime": "7 min read",
  "tech": "Spring Boot",
  "tags": ["Microservices", "Spring Boot", "Java", "Architecture"],
  "status": "PUBLISHED",
  "createdAt": "2026-10-30T23:29:05.950",
  "updatedAt": "2026-10-30T23:29:05.950"
}
```

---

## 5. Automated Unit & Integration Tests

```text
[INFO] Running com.devsphere.blogservice.BlogServiceApplicationTests
2026-10-30T23:25:48.115+05:30  INFO [blog-service] : Started BlogServiceApplicationTests
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.102 s
[INFO] BUILD SUCCESS
```
Verified Test Cases:
1. `contextLoads()`: Verifies Spring context startup.
2. `testGetAllBlogs()`: Confirms pre-seeded blogs are returned.
3. `testCreateBlog()`: Confirms article creation and tag association.
4. `testGetBlogById()`: Validates single article retrieval.
