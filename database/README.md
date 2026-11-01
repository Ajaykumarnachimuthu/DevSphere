# DEVSphere Database Migrations & Cloud Setup

This directory houses the consolidated database schemas, migrations, and seed scripts for the **DEVSphere** platform.

---

## Files in this Directory

| File | Purpose | Target Engine |
| :--- | :--- | :--- |
| [`supabase_migration.sql`](./supabase_migration.sql) | Complete DDL schema (9 tables, 6 indexes, foreign keys, cascade rules) + baseline seed data | Supabase Cloud PostgreSQL / Local PostgreSQL |

---

## 1. Running on Supabase Cloud

1. Open your project in the **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select **SQL Editor** from the left-hand navigation panel.
3. Click **"New Query"**.
4. Copy and paste the entire contents of [`supabase_migration.sql`](./supabase_migration.sql).
5. Click **"Run"** (or press `Ctrl + Enter`).
6. All 9 tables will appear immediately in the **Table Editor**:
   - `users`
   - `developer_profiles`
   - `developer_skills`
   - `blogs`
   - `blog_tags`
   - `projects`
   - `project_technologies`
   - `project_likes`
   - `developer_connections`

---

## 2. Running on Local PostgreSQL (via CLI)

```bash
psql -h localhost -U postgres -d devsphere -f database/supabase_migration.sql
```

---

## 3. Spring Boot Automatic Migration

When running Spring Boot with the `prod` profile, Flyway automatically discovers and applies migrations located under `backend/src/main/resources/db/migration/`:
- `V1__init_schema.sql`: Core schema creation
- `V2__seed_devsphere_data.sql`: Seed data matching frontend mock baseline
