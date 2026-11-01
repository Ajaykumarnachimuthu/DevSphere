# DevSphere Microservices: Step-by-Step Screenshot Capture Guide

This guide gives you the exact instructions for capturing every single screenshot required for your college practical submission. Follow them one by one.

---

## 🚀 Pre-requisites: How to Start the Services

Open **separate PowerShell terminal windows**. You can run these commands directly from your project root `c:\Users\N.AJAYKUMAR\Full Stack Proojects`:

- **Terminal 1 (Frontend):**
  ```powershell
  npm run dev
  ```
  *(Running on `http://localhost:5173`)*

- **Terminal 2 (Developer Service - Port 8081):**
  ```powershell
  mvn -f microservices/developer-service/pom.xml spring-boot:run
  ```
  *(Or: `cd microservices\developer-service` then `mvn spring-boot:run`)*

- **Terminal 3 (Project Service - Port 8082):**
  ```powershell
  mvn -f microservices/project-service/pom.xml spring-boot:run
  ```
  *(Or: `cd microservices\project-service` then `mvn spring-boot:run`)*

- **Terminal 4 (Blog Service - Port 8083):**
  ```powershell
  mvn -f microservices/blog-service/pom.xml spring-boot:run
  ```
  *(Or: `cd microservices\blog-service` then `mvn spring-boot:run`)*

> 💡 **Important Note on Maven Error `No plugin found for prefix 'spring-boot'`:**
> If you run `mvn spring-boot:run` directly from the main `Full Stack Proojects` root without specifying the subfolder, Maven cannot find a Spring Boot `pom.xml`. Always either `cd` into the microservice directory first, or use the `-f` flag as shown above!

---

# PART 1: FRONTEND APPLICATION (10 SCREENSHOTS)

### Screenshot 01: Home Page
- **File Name:** `UI_01_Home_Page.png`
- **URL to Open:** `http://localhost:5173/`
- **What to Display:**
  - DevSphere top navigation bar showing **DevSphere logo (`</>`)**, and links: `Home`, `Blogs`, `Developers`, `Projects`, `About`.
  - Hero banner with headline: *"Connect, Collaborate, and Build the Future of Tech"*.
  - Platform statistics badges (Developers, Projects, Blogs).
- **Tip:** Capture the full browser window showing the navigation bar and hero section clearly.

---

### Screenshot 02: Developers Directory
- **File Name:** `UI_02_Developers_Directory.png`
- **URL to Open:** `http://localhost:5173/developers`
- **What to Display:**
  - The Developers community page.
  - The search input bar (*"Search developers by name, role, or skill..."*).
  - Grid of developer cards including **Ajay Kumar** (Full Stack Developer), **Arun Kumar** (React Developer), and **Priya Sharma** (AI/ML Developer) with their tech skill tags.

---

### Screenshot 03: Developer Profile Detail
- **File Name:** `UI_03_Developer_Profile.png`
- **URL to Open:** `http://localhost:5173/developer-profile`
- **What to Display:**
  - Detailed developer profile view.
  - Developer avatar, full bio, role, location badge (*"India"*).
  - List of verified skills and activity chart/stats.

---

### Screenshot 04: Projects Showcase Gallery
- **File Name:** `UI_04_Projects_Showcase.png`
- **URL to Open:** `http://localhost:5173/projects`
- **What to Display:**
  - Projects gallery header: *"Explore Community Projects"*.
  - Category filter buttons (*"All"*, *"Web Development"*, *"AI/ML"*, *"Mobile"*).
  - Project cards showing **Personal Finance Tracker**, **Railway Ticket Booking System**, and **AI Vehicle Fault Detection**.
  - Visible Like counts and View counts on the cards.

---

### Screenshot 05: Project Interaction (Like & Category Filter)
- **File Name:** `UI_05_Project_Filter_Like.png`
- **URL to Open:** `http://localhost:5173/projects`
- **Action to Perform:**
  1. Click on the **"Web Development"** filter tab.
  2. Click the **❤️ Like** button on "Personal Finance Tracker".
- **What to Display:**
  - Active category tab highlighted.
  - The updated like count reflecting the interaction.

---

### Screenshot 06: Technical Blogs Feed
- **File Name:** `UI_06_Blogs_Feed.png`
- **URL to Open:** `http://localhost:5173/blogs`
- **What to Display:**
  - Blogs page banner: *"Community Articles & Tutorials"*.
  - Article cards including:
    - *"Understanding JavaScript Closures"* (Ajay Kumar, 5 min read)
    - *"Getting Started with React Hooks"* (Arun Kumar, 6 min read)
    - *"Understanding SQL Joins"* (Ravi Kumar, 4 min read)
  - Technology tags (JavaScript, React, SQL).

---

### Screenshot 07: Write Blog Publisher
- **File Name:** `UI_07_Write_Blog.png`
- **URL to Open:** `http://localhost:5173/write-blog`
- **What to Display:**
  - The Markdown Blog Editor page.
  - Form fields: Title input, Category dropdown, Estimated read time, and Markdown content textarea.
  - The **"Publish Article"** button.

---

### Screenshot 08: About DevSphere Page
- **File Name:** `UI_08_About_Page.png`
- **URL to Open:** `http://localhost:5173/about`
- **What to Display:**
  - The About page explaining DevSphere's mission for developer networking and project showcasing.
  - Architecture and technology overview section.

---

### Screenshot 09: User Login Page
- **File Name:** `UI_09_Login_Page.png`
- **URL to Open:** `http://localhost:5173/login`
- **What to Display:**
  - The DevSphere Login modal/card.
  - Email address and password input fields.
  - "Log in" button and link to Signup.

---

### Screenshot 10: Developer Registration (Sign Up) Page
- **File Name:** `UI_10_Signup_Page.png`
- **URL to Open:** `http://localhost:5173/signup`
- **What to Display:**
  - DevSphere Registration form.
  - Full Name, Email, Password, Primary Role, and Skills inputs.
  - "Create Account" button.

---

# PART 2: DEVELOPER SERVICE (PORT 8081) - 4 SCREENSHOTS

### Screenshot 11: Developer Service Startup Console
- **File Name:** `MS_01_Developer_Service_Startup.png`
- **Window to Capture:** Terminal where `developer-service` is started.
- **Command Run (from project root):**
  ```powershell
  mvn -f microservices/developer-service/pom.xml spring-boot:run
  ```
  *(Or: `cd microservices\developer-service` and then `mvn spring-boot:run`)*
- **What to Display in Terminal:**
  - Spring Boot ASCII banner.
  - Log lines showing Tomcat initialized on port **8081**.
  - Log line: `Started DeveloperServiceApplication in ... seconds`.
  - Log line: `Seeded 6 initial DevSphere developers into H2 developerdb`.

---

### Screenshot 12: Developer API - Fetch All Profiles (`GET`)
- **File Name:** `MS_02_Developer_API_GetAll.png`
- **Window to Capture:** PowerShell Terminal.
- **Command to Run:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers" -Method Get | Format-Table id, name, role, location
  ```
- **What to Display:**
  - The table showing DevSphere developers: Ajay Kumar, Arun Kumar, Priya Sharma, etc.

---

### Screenshot 13: Developer API - Create New Profile (`POST`)
- **File Name:** `MS_03_Developer_API_PostCreate.png`
- **Window to Capture:** PowerShell Terminal.
- **Command to Run:**
  ```powershell
  $dev = @{
      name = "Marcus Vance"
      role = "Staff Systems Architect"
      location = "San Francisco, CA"
      description = "Specializing in distributed microservices and domain-driven design."
      skills = @("Java", "Spring Cloud", "Kafka", "Docker")
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers" -Method Post -Body $dev -ContentType "application/json"
  ```
- **What to Display:**
  - The JSON response showing the newly created developer with assigned UUID `id`, timestamp, and skills list.

---

### Screenshot 14: Developer H2 Database Console
- **File Name:** `MS_04_Developer_H2_Console.png`
- **Browser URL to Open:** `http://localhost:8081/h2-console`
- **Login Details to Enter:**
  - **JDBC URL:** `jdbc:h2:mem:developerdb`
  - **User Name:** `sa`
  - **Password:** *(leave blank)*
  - Click **Connect**.
- **Action:**
  - In SQL editor, run: `SELECT * FROM DEVELOPER_PROFILES;`
- **What to Display:**
  - The H2 Web Console displaying rows with `ID`, `NAME`, `ROLE`, `LOCATION`, `DESCRIPTION`.

---

# PART 3: PROJECT SERVICE (PORT 8082) - 4 SCREENSHOTS

### Screenshot 15: Project Service Startup Console
- **File Name:** `MS_05_Project_Service_Startup.png`
- **Window to Capture:** Terminal where `project-service` is started.
- **Command Run (from project root):**
  ```powershell
  mvn -f microservices/project-service/pom.xml spring-boot:run
  ```
  *(Or: `cd microservices\project-service` and then `mvn spring-boot:run`)*
- **What to Display in Terminal:**
  - Spring Boot banner.
  - Log showing Tomcat initialized on port **8082**.
  - Log showing `Seeded 6 initial DevSphere projects into H2 projectdb`.

---

### Screenshot 16: Project API - Fetch All Projects (`GET`)
- **File Name:** `MS_06_Project_API_GetAll.png`
- **Window to Capture:** PowerShell Terminal.
- **Command to Run:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects" -Method Get | Format-Table id, title, category, authorName, likes, views
  ```
- **What to Display:**
  - Formatted table showing DevSphere projects (Personal Finance Tracker, Railway Ticket Booking System, etc.).

---

### Screenshot 17: Project API - Like Interaction (`POST`)
- **File Name:** `MS_07_Project_API_LikePost.png`
- **Window to Capture:** PowerShell Terminal.
- **Command to Run (Automatically gets first project's UUID and likes it):**
  ```powershell
  $id = (Invoke-RestMethod "http://localhost:8082/api/v1/projects")[0].id; Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects/$id/like" -Method Post | Format-List
  ```
- **What to Display:**
  - The JSON response showing `likes` incremented (e.g., from `128` to `129`).

---

### Screenshot 18: Project H2 Database Console
- **File Name:** `MS_08_Project_H2_Console.png`
- **Browser URL to Open:** `http://localhost:8082/h2-console`
- **Login Details to Enter:**
  - **JDBC URL:** `jdbc:h2:mem:projectdb`
  - **User Name:** `sa`
  - **Password:** *(leave blank)*
  - Click **Connect**.
- **Action:**
  - Run SQL: `SELECT ID, TITLE, CATEGORY, AUTHOR_NAME, LIKES, VIEWS FROM PROJECTS;`
- **What to Display:**
  - H2 console showing the table rows and verified data.

---

# PART 4: BLOG SERVICE (PORT 8083) - 3 SCREENSHOTS

### Screenshot 19: Blog Service Startup Console
- **File Name:** `MS_09_Blog_Service_Startup.png`
- **Window to Capture:** Terminal where `blog-service` is started.
- **Command Run (from project root):**
  ```powershell
  mvn -f microservices/blog-service/pom.xml spring-boot:run
  ```
  *(Or: `cd microservices\blog-service` and then `mvn spring-boot:run`)*
- **What to Display in Terminal:**
  - Spring Boot banner.
  - Log showing Tomcat started on port **8083**.
  - Log showing `Seeded 6 initial DevSphere blogs into H2 blogdb`.

---

### Screenshot 20: Blog API - Fetch All Articles (`GET`)
- **File Name:** `MS_10_Blog_API_GetAll.png`
- **Window to Capture:** PowerShell Terminal.
- **Command to Run:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8083/api/v1/blogs" -Method Get | Format-Table id, title, category, authorName, readTime
  ```
- **What to Display:**
  - Table of articles (JavaScript Closures, React Hooks, SQL Joins, etc.).

---

### Screenshot 21: Blog API - Publish Article (`POST`)
- **File Name:** `MS_11_Blog_API_PostPublish.png`
- **Window to Capture:** PowerShell Terminal.
- **Command to Run:**
  ```powershell
  $blog = @{
      title = "Building Resilient Microservices with Spring Boot 3"
      content = "Decomposing monoliths into autonomous services with domain boundaries."
      category = "Architecture"
      authorName = "DevSphere Architect"
      readTime = "7 min read"
      tech = "Spring Boot"
      tags = @("Microservices", "Spring Boot", "Java")
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "http://localhost:8083/api/v1/blogs" -Method Post -Body $blog -ContentType "application/json"
  ```
- **What to Display:**
  - The JSON response showing the published blog with assigned UUID `id`, `status: "PUBLISHED"`, and tags.

---

# PART 5: AUTOMATED TESTING & PRODUCTION BUILD (3 SCREENSHOTS)

### Screenshot 22: Microservices Unit Tests (All 13 Passing)
- **File Name:** `TEST_01_Microservices_Tests_Passed.png`
- **Window to Capture:** Terminal.
- **Command to Run:**
  ```powershell
  cd microservices\developer-service; mvn test; cd ..\project-service; mvn test; cd ..\blog-service; mvn test
  ```
- **What to Display:**
  - `[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` (Developer Service)
  - `[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0` (Project Service)
  - `[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` (Blog Service)
  - `[INFO] BUILD SUCCESS`

---

### Screenshot 23: Core DevSphere Backend Regression Tests (26 Passing)
- **File Name:** `TEST_02_Core_Backend_Tests_Passed.png`
- **Window to Capture:** Terminal.
- **Command to Run:**
  ```powershell
  cd backend
  mvn test
  ```
- **What to Display:**
  - `[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0`
  - `[INFO] BUILD SUCCESS`

---

### Screenshot 24: Frontend Vite Production Build
- **File Name:** `TEST_03_Frontend_Build_Success.png`
- **Window to Capture:** Terminal.
- **Command to Run:**
  ```powershell
  npm run build
  ```
- **What to Display:**
  - `vite v5.4.14 building for production...`
  - `✓ 66 modules transformed.`
  - `dist/index.html ...`
  - `dist/assets/index-....css ...`
  - `dist/assets/index-....js ...`
  - `✓ built in 2.49s`
