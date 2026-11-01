# DevSphere Microservices Practical: Master Screenshot Checklist

This checklist provides the exact screenshot requirements for submitting the **DevSphere Microservices Architecture Practical Report**. 

> **Important Rule:** Do NOT include any SkillHub, Course, or Enquiry screenshots. All evidence must showcase authentic **DevSphere** modules.

---

## Part 1: DevSphere Frontend Application (Vite Dev Server: Port 5173)

| # | Screenshot Identifier | Description & What to Display | Route / View |
| :---: | :--- | :--- | :--- |
| **01** | `UI_01_HOME_PAGE` | DevSphere Landing page showcasing hero banner, community stats, platform overview, and navigation bar. | `http://localhost:5173/` |
| **02** | `UI_02_DEVELOPERS_DIRECTORY` | Developers directory displaying developer cards, roles (e.g. Ajay Kumar, Arun Kumar, Priya Sharma), skills, and search filters. | `http://localhost:5173/developers` |
| **03** | `UI_03_DEVELOPER_PROFILE` | Detailed single developer profile showing avatar, bio, skill badges, and social links. | `http://localhost:5173/developers/1` |
| **04** | `UI_04_PROJECTS_SHOWCASE` | Projects showcase page displaying project cards (Personal Finance Tracker, Railway Booking, AI Vehicle Fault Detection), likes, and views. | `http://localhost:5173/projects` |
| **05** | `UI_05_PROJECT_FILTER_AND_LIKE` | Interactive project card showing filtered category and updated like count. | `http://localhost:5173/projects` |
| **06** | `UI_06_BLOGS_FEED` | Technical blogs feed with category tags, reading times, and author information. | `http://localhost:5173/blogs` |
| **07** | `UI_07_WRITE_BLOG` | Markdown blog creator interface with title, tags, and content editor. | `http://localhost:5173/write-blog` |
| **08** | `UI_08_ABOUT_PAGE` | DevSphere platform about page with mission statement and architectural overview. | `http://localhost:5173/about` |
| **09** | `UI_09_LOGIN_PAGE` | User login form with email, password, and JWT session handling. | `http://localhost:5173/login` |
| **10** | `UI_10_SIGNUP_PAGE` | Developer registration form with name, email, role, and password. | `http://localhost:5173/signup` |

---

## Part 2: Developer Service (Port 8081)

| # | Screenshot Identifier | Description & What to Display | Terminal / Tool |
| :---: | :--- | :--- | :--- |
| **11** | `MS_01_DEV_SERVICE_STARTUP` | Spring Boot console banner showing `developer-service` starting on Tomcat port `8081` with H2 datasource. | Terminal 1 (`mvn spring-boot:run`) |
| **12** | `MS_02_DEV_API_GET_ALL` | PowerShell/curl executing `GET http://localhost:8081/api/v1/developers` showing JSON array of 6 DevSphere developers. | PowerShell CLI |
| **13** | `MS_03_DEV_API_POST_CREATE` | HTTP POST creating developer `Marcus Vance` returning HTTP 201 Created and assigned UUID. | Postman / PowerShell |
| **14** | `MS_04_DEV_H2_CONSOLE` | H2 Web Console (`http://localhost:8081/h2-console`) showing `DEVELOPER_PROFILES` table records. | Browser |

---

## Part 3: Project Service (Port 8082)

| # | Screenshot Identifier | Description & What to Display | Terminal / Tool |
| :---: | :--- | :--- | :--- |
| **15** | `MS_05_PROJ_SERVICE_STARTUP` | Spring Boot console banner showing `project-service` starting on Tomcat port `8082`. | Terminal 2 (`mvn spring-boot:run`) |
| **16** | `MS_06_PROJ_API_GET_ALL` | HTTP GET `/api/v1/projects` displaying JSON array of projects (Personal Finance Tracker, etc.). | PowerShell CLI |
| **17** | `MS_07_PROJ_API_LIKE_POST` | HTTP POST `/api/v1/projects/{id}/like` demonstrating atomic like count incrementation. | Postman / PowerShell |
| **18** | `MS_08_PROJ_H2_CONSOLE` | H2 Web Console (`http://localhost:8082/h2-console`) showing `PROJECTS` and `PROJECT_TECHNOLOGIES` tables. | Browser |

---

## Part 4: Blog Service (Port 8083)

| # | Screenshot Identifier | Description & What to Display | Terminal / Tool |
| :---: | :--- | :--- | :--- |
| **19** | `MS_09_BLOG_SERVICE_STARTUP` | Spring Boot console banner showing `blog-service` starting on Tomcat port `8083`. | Terminal 3 (`mvn spring-boot:run`) |
| **20** | `MS_10_BLOG_API_GET_ALL` | HTTP GET `/api/v1/blogs` displaying list of seeded technical articles and reading times. | PowerShell CLI |
| **21** | `MS_11_BLOG_API_POST_CREATE` | HTTP POST `/api/v1/blogs` publishing new article with tags returning HTTP 201 Created. | Postman / PowerShell |

---

## Part 5: Testing, Builds & Architecture Validation

| # | Screenshot Identifier | Description & What to Display | Terminal / Tool |
| :---: | :--- | :--- | :--- |
| **22** | `TEST_01_MICROSERVICES_UNIT_TESTS` | Maven test output showing all 13 unit tests passing across Developer, Project, and Blog services. | Terminal (`mvn test`) |
| **23** | `TEST_02_CORE_BACKEND_REGRESSION` | Maven test output in `backend/` showing 26/26 regression tests passing (JWT, Auth, Security). | Terminal (`mvn test`) |
| **24** | `TEST_03_FRONTEND_BUILD_SUCCESS` | Vite build output (`npm run build`) showing `✓ 66 modules transformed` and clean bundle creation. | Terminal (`npm run build`) |
