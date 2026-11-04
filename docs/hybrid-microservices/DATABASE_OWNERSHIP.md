# DevSphere — Database Ownership & Data Architecture

This document defines the persistent data architecture, schema boundaries, identity linkage, and migration strategies implemented in the **DevSphere Hybrid Microservices Architecture**.

---

## 1. Architectural Principle: Database-per-Service Pattern

In strict adherence to microservice architecture best practices, **each service independently owns its domain data**. No service may execute direct SQL queries, joins, or table modifications against tables owned by another service.

```
+-----------------------------------------------------------------------------------------+
|                                    DEVSPhere DATA LAYER                                 |
+----------------------------+----------------------------+-------------------------------+
|      Core Database         |    Blog Service Database   |   Project Service Database    |
|   (Identity & Profiles)    |      (Technical Blogs)     |      (Engineering Showcases)  |
+----------------------------+----------------------------+-------------------------------+
| * users                    | * blogs                    | * projects                    |
| * user_skills              | * blog_tags                | * project_tags                |
| * user_profiles            | * blog_likes               | * project_likes               |
| * developer_connections    | * blog_bookmarks           | * project_bookmarks           |
| * refresh_tokens           | * blog_comments            | * project_comments            |
|                            | * knowledge_trails         |                               |
+----------------------------+----------------------------+-------------------------------+
           |                                |                                 |
           v                                v                                 v
   Owned Exclusively by             Owned Exclusively by             Owned Exclusively by
      DevSphere Core                    Blog Service                     Project Service
        (Port 8080)                      (Port 8081)                      (Port 8082)
```

---

## 2. Logical Schemas & Table Definitions

### 2.1 DevSphere Core Schema (`core_db`)

DevSphere Core manages user authentication credentials, developer profiles, and social graph connections:

* **`users`**:
  * `id (UUID, PK)`: Globally unique immutable user identifier.
  * `username (VARCHAR)`: Unique developer handle.
  * `email (VARCHAR)`: Unique login email.
  * `password_hash (VARCHAR)`: BCrypt salted password hash.
  * `role (VARCHAR)`: Security authority (`ROLE_USER`, `ROLE_ADMIN`).
  * `token_version (INTEGER)`: Monotonically increasing counter for instant token revocation.
  * `created_at (TIMESTAMP)`: Account registration timestamp.

* **`user_profiles`**:
  * `user_id (UUID, PK, FK -> users.id)`: One-to-one developer profile metadata.
  * `bio (TEXT)`, `headline (VARCHAR)`, `location (VARCHAR)`, `github_url (VARCHAR)`, `avatar_url (VARCHAR)`.

* **`user_skills`**:
  * `user_id (UUID, FK -> users.id)`, `skill_name (VARCHAR)`.

* **`developer_connections`**:
  * `id (UUID, PK)`: Connection relationship identifier.
  * `requester_id (UUID, FK -> users.id)`: Initiating developer.
  * `target_id (UUID, FK -> users.id)`: Targeted developer.
  * `status (VARCHAR)`: Status (`PENDING`, `ACCEPTED`, `REJECTED`).

---

### 2.2 Blog Microservice Schema (`blog_db`)

The Blog microservice owns all technical writing, publishing states, drafts, and article interactions:

* **`blogs`**:
  * `id (UUID, PK)`: Unique blog article identifier.
  * `title (VARCHAR)`: Article title.
  * `subtitle (VARCHAR)`: Explanatory subtitle.
  * `category (VARCHAR)`: Primary technical category.
  * `content (TEXT)`: Full Markdown/HTML article body.
  * `author_name (VARCHAR)`: Denormalized display name of author at creation.
  * `author_id (UUID)`: Cryptographic User ID linking to Core identity authority.
  * `read_time (VARCHAR)`: Computed reading duration (`"3 min read"`).
  * `tech (VARCHAR)`: Primary technology topic.
  * `difficulty (VARCHAR)`: Technical depth (`Beginner`, `Intermediate`, `Advanced`).
  * `status (VARCHAR)`: Publishing lifecycle (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
  * `likes_count (INTEGER)`: Denormalized like counter.
  * `bookmarks_count (INTEGER)`: Denormalized bookmark counter.
  * `views_count (BIGINT)`: Read engagement views.
  * `created_at (TIMESTAMP)`, `updated_at (TIMESTAMP)`.

* **`blog_tags`**:
  * `blog_id (UUID, FK -> blogs.id)`, `tag_name (VARCHAR)`.

* **`blog_likes`**:
  * `id (UUID, PK)`, `blog_id (UUID, FK -> blogs.id)`, `user_id (UUID)`.
  * *Constraint*: Unique index on `(blog_id, user_id)` preventing duplicate likes.

* **`blog_bookmarks`**:
  * `id (UUID, PK)`, `blog_id (UUID, FK -> blogs.id)`, `user_id (UUID)`.
  * *Constraint*: Unique index on `(blog_id, user_id)`.

* **`blog_comments`**:
  * `id (UUID, PK)`, `blog_id (UUID, FK -> blogs.id)`, `user_id (UUID)`, `author_name (VARCHAR)`, `content (TEXT)`.

* **`knowledge_trails`**:
  * `id (UUID, PK)`, `title (VARCHAR)`, `description (TEXT)`, `category (VARCHAR)`, `tags (VARCHAR)`.

---

### 2.3 Project Microservice Schema (`project_db`)

The Project microservice owns engineering project showcases, V7 structured fields, atomic like counters, and engagement metrics:

* **`projects`**:
  * `id (UUID, PK)`: Unique project showcase identifier.
  * `title (VARCHAR)`: Showcase title.
  * `description (TEXT)`: Comprehensive architecture and project overview.
  * `category (VARCHAR)`: Engineering category.
  * `tech_stack (VARCHAR)`: Comma-delimited list of technologies.
  * `demo_url (VARCHAR)`: Live deployment link.
  * `github_repo (VARCHAR)`: GitHub source repository link.
  * `owner_id (UUID)`: Cryptographic User ID linking to Core identity authority.
  * `owner_username (VARCHAR)`: Denormalized display name of project creator.
  * `likes_count (INTEGER)`: Atomic concurrency-controlled like counter.
  * `views_count (BIGINT)`: Atomic concurrency-controlled view counter.
  * `bookmarks_count (INTEGER)`: Denormalized bookmark counter.
  * **V7 Structured Engineering Fields**:
    * `problem_statement (TEXT)`: Real-world engineering challenge solved.
    * `proposed_solution (TEXT)`: Technical design approach.
    * `key_features (TEXT)`: Semicolon-delimited core capabilities.
    * `architecture_summary (TEXT)`: System architecture overview.
    * `quickstart_cmd (TEXT)`: CLI command to clone and run.
    * `video_demo_url (TEXT)`: Video demonstration link.
  * `created_at (TIMESTAMP)`, `updated_at (TIMESTAMP)`.

* **`project_tags`**:
  * `project_id (UUID, FK -> projects.id)`, `tag_name (VARCHAR)`.

* **`project_likes`**:
  * `id (UUID, PK)`, `project_id (UUID, FK -> projects.id)`, `user_id (UUID)`.
  * *Constraint*: Unique index on `(project_id, user_id)` preventing duplicate likes.

* **`project_bookmarks`**:
  * `id (UUID, PK)`, `project_id (UUID, FK -> projects.id)`, `user_id (UUID)`.
  * *Constraint*: Unique index on `(project_id, user_id)`.

* **`project_comments`**:
  * `id (UUID, PK)`, `project_id (UUID, FK -> projects.id)`, `user_id (UUID)`, `author_name (VARCHAR)`, `content (TEXT)`.

---

## 3. Absence of Cross-Database Foreign Keys & UUID Linkage

In monolithic architectures, developers frequently declare foreign keys across boundaries (e.g. `CONSTRAINT fk_blogs_users FOREIGN KEY (author_id) REFERENCES users(id)`).

In this microservice architecture:
1. **No Distributed Foreign Keys**: Foreign keys to `users.id` are strictly prohibited in `blog_db` and `project_db`.
2. **Immutable UUID References**: `author_id` in Blog Service and `owner_id` in Project Service store standard RFC 4122 UUIDs.
3. **Identity Verification**: When an operation arrives, the internal token assertion proves that the requester controls that UUID. The microservice compares `authenticatedPrincipal.getUserId()` directly against `blog.getAuthorId()` or `project.getOwnerId()` in memory.
4. **Denormalized Display Metadata**: `author_name` and `owner_username` are captured at entity creation time, eliminating synchronous identity lookups during high-frequency feed reading.

---

## 4. Local Execution vs Cloud Production Strategy

### Local Development (Zero-Setup File Databases)
For local testing and academic demonstration without requiring local PostgreSQL Docker daemons:
* **Blog Service**: Runs on embedded H2 file database at `./data/blogdb` (or in-memory for unit tests).
* **Project Service**: Runs on embedded H2 file database at `./data/projectdb` (or in-memory for unit tests).
* **Core**: Runs on embedded H2 file database at `./data/devspheredb` (or in-memory for unit tests).

Data persists between runs on developer workstations without port conflicts.

### Cloud Production Strategy (Supabase / Managed PostgreSQL)
In a single cloud database instance (e.g., Supabase / AWS RDS PostgreSQL):
Each service is allocated its own distinct schema and database credentials to enforce permission boundaries:

```sql
-- Production Schema Isolation
CREATE SCHEMA devsphere_core;
CREATE SCHEMA devsphere_blog;
CREATE SCHEMA devsphere_project;

-- Dedicated Service Roles
CREATE ROLE core_user WITH LOGIN PASSWORD 'core_secret';
CREATE ROLE blog_user WITH LOGIN PASSWORD 'blog_secret';
CREATE ROLE project_user WITH LOGIN PASSWORD 'project_secret';

-- Restrict Permissions: No Cross-Schema Access
GRANT ALL ON SCHEMA devsphere_core TO core_user;
GRANT ALL ON SCHEMA devsphere_blog TO blog_user;
GRANT ALL ON SCHEMA devsphere_project TO project_user;

REVOKE ALL ON SCHEMA devsphere_core FROM blog_user, project_user;
REVOKE ALL ON SCHEMA devsphere_blog FROM core_user, project_user;
REVOKE ALL ON SCHEMA devsphere_project FROM core_user, blog_user;
```

This guarantees physical multi-tenant isolation even when sharing a single PostgreSQL server.

