# DevSphere — Local Execution & Multi-Terminal Deployment Guide

This guide provides exact, copy-pasteable instructions for running the complete **DevSphere Hybrid Microservices Architecture** locally across independent terminals.

---

## 1. System Topology & Port Registry

Before launching, ensure the following default ports are available on your system:

| Service / Component | Directory | Port | Protocol | Technological Stack |
| :--- | :--- | :--- | :--- | :--- |
| **Blog Service** | `microservices/blog-service` | **8081** | HTTP REST | Spring Boot 3.2, JPA, JJWT, H2/PostgreSQL |
| **Project Service** | `microservices/project-service` | **8082** | HTTP REST | Spring Boot 3.2, JPA, JJWT, H2/PostgreSQL |
| **DevSphere Core** | `backend/` | **8080** | HTTP REST | Spring Boot 3.4, Spring Security, RestClient Facade |
| **React Frontend** | `./` (root) | **5173** | HTTP UI | React 18, Vite, TailwindCSS, Lucide |
| *Developer Service (Coursework)* | `microservices/developer-service` | *8084* | HTTP REST | Spring Boot Coursework Reference (non-conflicting) |

---

## 2. Recommended Startup Order

To allow DevSphere Core's gateway clients and health checks to initialize against active downstream services, start in the following order:

```
[Terminal 1: Blog Service (8081)]    [Terminal 2: Project Service (8082)]
               \                                   /
                \                                 /
                 v                               v
             [Terminal 3: DevSphere Core (8080)]
                             |
                             v
             [Terminal 4: React Frontend (5173)]
```

---

## 3. Terminal-by-Terminal Execution Commands

Open separate Windows PowerShell (or Command Prompt) windows and execute the commands below:

### Terminal 1 — Blog Microservice (Port 8081)

```powershell
# Set Java Home if required
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:Path = "C:\Program Files\Java\jdk-23\bin;" + $env:Path

# Navigate and start Blog Service
cd "C:\Users\N.AJAYKUMAR\Full Stack Proojects\microservices\blog-service"
mvn spring-boot:run
```
*Expected Log output:*
`Tomcat started on port 8081 (http) with context path ''`
`Blog Service seeded with 4 authentic articles.`

---

### Terminal 2 — Project Microservice (Port 8082)

```powershell
# Set Java Home if required
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:Path = "C:\Program Files\Java\jdk-23\bin;" + $env:Path

# Navigate and start Project Service
cd "C:\Users\N.AJAYKUMAR\Full Stack Proojects\microservices\project-service"
mvn spring-boot:run
```
*Expected Log output:*
`Tomcat started on port 8082 (http) with context path ''`
`Project Service seeded with 6 authentic engineering showcases.`

---

### Terminal 3 — DevSphere Core (Port 8080)

```powershell
# Set Java Home if required
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:Path = "C:\Program Files\Java\jdk-23\bin;" + $env:Path

# Navigate and start DevSphere Core API Gateway
cd "C:\Users\N.AJAYKUMAR\Full Stack Proojects\backend"
mvn spring-boot:run
```
*Expected Log output:*
`Initialized BlogServiceClient connecting to: http://localhost:8081`
`Initialized ProjectServiceClient connecting to: http://localhost:8082`
`Tomcat started on port 8080 (http) with context path ''`

---

### Terminal 4 — React Frontend (Port 5173)

```powershell
cd "C:\Users\N.AJAYKUMAR\Full Stack Proojects"
npm run dev
```
*Expected output:*
`VITE v6.4.3  ready in 320 ms`
`➜  Local:   http://localhost:5173/`

---

## 4. Single-Command All-in-One Launcher

A PowerShell automation script is included in the project root: `scripts/start-all-services.ps1`.
To start all services automatically in dedicated windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-all-services.ps1
```

To stop all background services, run:
```powershell
Get-Process -Name java, node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 5. Instant Health & Verification Commands

Once all terminals are running, open a terminal and test connectivity:

### 1. Check Platform Stats Overview (Gateway aggregation)
```powershell
curl.exe -s http://localhost:8080/api/v1/stats/overview
```
*Expected output: JSON containing counts of developers, blogs (4), and projects (6).*

### 2. Check Blog Service directly
```powershell
curl.exe -s http://localhost:8081/api/v1/blogs
```

### 3. Check Project Service directly
```powershell
curl.exe -s http://localhost:8082/api/v1/projects
```

### 4. Test Fault Isolation (Demonstrating Unit V Requirements)
Stop Terminal 1 (Blog Service) by pressing `Ctrl + C`:
* Querying `http://localhost:8080/api/v1/projects` returns **200 OK** (projects continue functioning normally).
* Querying `http://localhost:8080/api/v1/developers` returns **200 OK** (developer profiles continue functioning).
* Querying `http://localhost:8080/api/v1/blogs` returns **503 SERVICE_UNAVAILABLE** with an informative resilience message.

