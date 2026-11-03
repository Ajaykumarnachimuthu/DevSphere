
-- =============================================================================
-- DEVSphere Platform — Complete Supabase Cloud PostgreSQL Migration & Seed Script
-- Project Reference: rtugpdrmlscbrmbtpqvh
-- Instructions: Open Supabase Dashboard -> SQL Editor -> New Query -> Paste & Click Run
-- =============================================================================

-- =============================================================================
-- PART 1: CORE SCHEMA (9 TABLES, CONSTRAINTS & PERFORMANCE INDEXES)
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    token_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Developer Profiles Table
CREATE TABLE IF NOT EXISTS developer_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    avatar VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dev_name ON developer_profiles(name);

-- 3. Developer Skills Collection Table
CREATE TABLE IF NOT EXISTS developer_skills (
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(50) NOT NULL,
    PRIMARY KEY (developer_id, skill)
);

-- 4. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    read_time VARCHAR(30) NOT NULL DEFAULT '5 min read',
    tech VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- 5. Blog Tags Collection Table
CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (blog_id, tag)
);

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_likes ON projects(likes DESC);
CREATE INDEX IF NOT EXISTS idx_projects_views ON projects(views DESC);

-- 7. Project Technologies Collection Table
CREATE TABLE IF NOT EXISTS project_technologies (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, technology)
);

-- 8. Project Likes Table
CREATE TABLE IF NOT EXISTS project_likes (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_user_like UNIQUE (project_id, user_id)
);

-- 9. Developer Connections Table
CREATE TABLE IF NOT EXISTS developer_connections (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dev_user_connection UNIQUE (developer_id, user_id)
);

-- =============================================================================
-- PART 2: SEED INITIAL DEVSphere PLATFORM DATA
-- =============================================================================

-- Seed Initial Test User
INSERT INTO users (id, username, email, password, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ajaykumar',
    'ajay@devsphere.io',
    '$2a$10$wE4H2h2VlhZt2Bms4h4ZpOnmG5X1O2I4p7oZ3wMvD3oO.x2K2wHkK',
    'ROLE_USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Seed Developers
INSERT INTO developer_profiles (id, user_id, name, role, description, location, avatar, created_at, updated_at)
VALUES 
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ajay Kumar', 'Full Stack Developer', 'Passionate about building web applications and APIs.', 'India', 'a1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000002', NULL, 'Arun Kumar', 'React Developer', 'Building interactive and responsive user interfaces.', 'India', 'a2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000003', NULL, 'Priya Sharma', 'AI/ML Developer', 'Exploring machine learning and AI to build smart solutions.', 'India', 'a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000004', NULL, 'Rohit Verma', 'Backend Developer', 'Love solving problems and building scalable backend systems.', 'India', 'a4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000005', NULL, 'Neha Singh', 'UI/UX Designer', 'Designing beautiful and user-friendly digital experiences.', 'India', 'a5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000006', NULL, 'Sagar Patil', 'DevOps Engineer', 'Automating deployments and managing cloud infrastructure.', 'India', 'a6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Skills
INSERT INTO developer_skills (developer_id, skill) VALUES
('a0000000-0000-0000-0000-000000000001', 'HTML'),
('a0000000-0000-0000-0000-000000000001', 'CSS'),
('a0000000-0000-0000-0000-000000000001', 'JavaScript'),
('a0000000-0000-0000-0000-000000000001', 'Node.js'),
('a0000000-0000-0000-0000-000000000001', 'React'),

('a0000000-0000-0000-0000-000000000002', 'React'),
('a0000000-0000-0000-0000-000000000002', 'JavaScript'),
('a0000000-0000-0000-0000-000000000002', 'CSS'),
('a0000000-0000-0000-0000-000000000002', 'Tailwind'),

('a0000000-0000-0000-0000-000000000003', 'Python'),
('a0000000-0000-0000-0000-000000000003', 'TensorFlow'),
('a0000000-0000-0000-0000-000000000003', 'ML'),
('a0000000-0000-0000-0000-000000000003', 'AI'),

('a0000000-0000-0000-0000-000000000004', 'Node.js'),
('a0000000-0000-0000-0000-000000000004', 'Express'),
('a0000000-0000-0000-0000-000000000004', 'MongoDB'),
('a0000000-0000-0000-0000-000000000004', 'SQL'),

('a0000000-0000-0000-0000-000000000005', 'Figma'),
('a0000000-0000-0000-0000-000000000005', 'UI/UX'),
('a0000000-0000-0000-0000-000000000005', 'Adobe XD'),
('a0000000-0000-0000-0000-000000000005', 'Prototype'),

('a0000000-0000-0000-0000-000000000006', 'AWS'),
('a0000000-0000-0000-0000-000000000006', 'Docker'),
('a0000000-0000-0000-0000-000000000006', 'Kubernetes'),
('a0000000-0000-0000-0000-000000000006', 'Jenkins')
ON CONFLICT (developer_id, skill) DO NOTHING;

-- Seed Blogs
INSERT INTO blogs (id, author_id, author_name, title, category, content, read_time, tech, status, created_at, updated_at)
VALUES
('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ajay Kumar', 'Understanding JavaScript Closures', 'Web Development', 'Learn how closures work and why they are useful in modern JavaScript.', '5 min read', 'JavaScript', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000002', NULL, 'Arun Kumar', 'Getting Started with React Hooks', 'Web Development', 'A simple introduction to useState, useEffect and React Hooks.', '6 min read', 'React', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000003', NULL, 'Ravi Kumar', 'Understanding SQL Joins', 'Web Development', 'Learn the basics of INNER, LEFT and RIGHT joins with examples.', '4 min read', 'Database', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000004', NULL, 'Priya', 'Python for Beginners', 'AI / ML', 'Start your Python journey with variables, functions and data types.', '7 min read', 'Python', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000005', NULL, 'Vishal', 'Introduction to Machine Learning', 'AI / ML', 'Understand the basic concepts behind machine learning.', '8 min read', 'AI', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000006', NULL, 'Rahul', 'Git and GitHub Basics', 'DevOps', 'Learn how developers use Git and GitHub to manage projects.', '5 min read', 'Git', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Projects
INSERT INTO projects (id, author_id, author_name, title, category, description, likes, views, created_at, updated_at)
VALUES
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ajaykumar N', 'Personal Finance Tracker', 'Web Development', 'A full-stack web app to track income, expenses, budgets and financial insights.', 128, 2400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000002', NULL, 'Varnika S', 'Railway Ticket Booking System', 'Web Development', 'A comprehensive railway ticket booking system with seat reservation and secure payments.', 96, 1800, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000003', NULL, 'Vinovasri K', 'AI Vehicle Fault Detection', 'AI/ML', 'Real-time vehicle telemetry monitoring and AI-powered fault detection system.', 142, 3100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000004', NULL, 'Meena R', 'Habit Arena', 'Web Development', 'Gamified habit tracking app to build consistency and compete with friends.', 87, 1200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000005', NULL, 'Hari S', 'MarketMind', 'Web Development', 'AI-powered stock market learning and trading simulator with real-time insights.', 164, 2900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000006', NULL, 'Kevin D', 'TaskFlow Pro', 'Tools', 'A productivity platform to manage tasks, teams and projects efficiently.', 73, 950, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Project Technologies
INSERT INTO project_technologies (project_id, technology) VALUES
('c0000000-0000-0000-0000-000000000001', 'React'),
('c0000000-0000-0000-0000-000000000001', 'Node.js'),
('c0000000-0000-0000-0000-000000000001', 'MongoDB'),
('c0000000-0000-0000-0000-000000000001', 'Tailwind CSS'),

('c0000000-0000-0000-0000-000000000002', 'Java'),
('c0000000-0000-0000-0000-000000000002', 'JSP'),
('c0000000-0000-0000-0000-000000000002', 'MySQL'),
('c0000000-0000-0000-0000-000000000002', 'Bootstrap'),

('c0000000-0000-0000-0000-000000000003', 'Python'),
('c0000000-0000-0000-0000-000000000003', 'FastAPI'),
('c0000000-0000-0000-0000-000000000003', 'TensorFlow'),
('c0000000-0000-0000-0000-000000000003', 'PostgreSQL'),

('c0000000-0000-0000-0000-000000000004', 'React'),
('c0000000-0000-0000-0000-000000000004', 'Supabase'),
('c0000000-0000-0000-0000-000000000004', 'PostgreSQL'),
('c0000000-0000-0000-0000-000000000004', 'Tailwind CSS'),

('c0000000-0000-0000-0000-000000000005', 'React'),
('c0000000-0000-0000-0000-000000000005', 'Node.js'),
('c0000000-0000-0000-0000-000000000005', 'Firebase'),
('c0000000-0000-0000-0000-000000000005', 'Groq AI'),

('c0000000-0000-0000-0000-000000000006', 'Next.js'),
('c0000000-0000-0000-0000-000000000006', 'TypeScript'),
('c0000000-0000-0000-0000-000000000006', 'Prisma'),
('c0000000-0000-0000-0000-000000000006', 'PostgreSQL')
ON CONFLICT (project_id, technology) DO NOTHING;


-- =============================================================================
-- PART 4: V6 UPDATE — UNIFIED AUTHORSHIP (AJAYKUMAR N) & VERIFIED PROJECT BLOGS
-- =============================================================================

ALTER TABLE blogs ALTER COLUMN tech TYPE VARCHAR(150);

-- Update Core User Account & Developer Profile
UPDATE users 
SET username = 'ajaykumar', 
    email = 'ajaykumarnachimuthu37@gmail.com',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'fb6a1933-9f43-4e96-9be2-5ce2c1b747d7';

UPDATE developer_profiles
SET name = 'AJAYKUMAR N',
    role = 'Full-Stack Architect & AI Systems Engineer',
    description = 'Full-stack software architect specializing in distributed microservices, AI-powered systems, real-time telemetry pipelines, and reactive web applications.',
    location = 'India',
    avatar = 'a1',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 'fb6a1933-9f43-4e96-9be2-5ce2c1b747d7';

-- Update all projects to AJAYKUMAR N
UPDATE projects
SET author_name = 'AJAYKUMAR N',
    author_id = 'fb6a1933-9f43-4e96-9be2-5ce2c1b747d7',
    updated_at = CURRENT_TIMESTAMP;

-- Update Project Cover Images
UPDATE projects
SET cover_image = '/images/projects/ingris-groundwater.jpg',
    tagline = 'AI-Driven Groundwater & Hydrogeological Assistant engineered with CGWB report insights and multi-provider RAG pipeline.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%INGRIS%';

UPDATE projects
SET cover_image = '/images/projects/fleetwatch-telemetry.png',
    tagline = 'FleetWatch: Real-time vehicle telemetry monitoring with AI-powered fault detection and live interactive controls.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Vehicle Telemetry%';


-- =============================================================================
-- PART 5: V7 UPDATE — STRUCTURED PROJECT PRESENTATION ATTRIBUTES & BACKFILL
-- =============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_features TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quickstart_cmd VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_demo_url VARCHAR(500);

UPDATE projects
SET problem_statement = 'Hydrogeological data published by the Central Ground Water Board (CGWB) exists across thousands of heterogeneous PDF surveys, static tables, and regional monitoring wells, making it difficult for researchers, farmers, and policymakers to assess local water table depletion in real time.',
    proposed_solution = 'An AI-powered hydrogeological assistant combining Retrieval-Augmented Generation (RAG) with low-latency LLM inference (Groq Llama-3-70B, OpenRouter, and Gemini fallback) to deliver grounded aquifer analytics, seasonal water table depth (m bgl), and statutory extraction compliance metrics.',
    key_features = '• Multi-provider LLM priority fallback matrix (Groq LPU primary, OpenRouter secondary, Gemini multimodal fallback)
• Real-time Central Ground Water Board (CGWB) statutory report synthesis
• Automated District Extraction Stress classification (Safe, Semi-Critical, Critical, Over-Exploited)
• Geospatial water table variance estimation across seasonal pre/post-monsoon telemetry
• Interactive hydrogeological knowledge explorer with citation grounding',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT.git && cd INGRIS-CHATBOT && pip install -r requirements.txt',
    live_demo_url = 'https://ingris-chatbot.vercel.app',
    github_url = 'https://github.com/Ajaykumarnachimuthu/INGRIS-CHATBOT',
    architecture_summary = 'FastAPI asynchronous core routing queries through BGE-small vector embeddings in Supabase pgvector, with table-aware chunking for dense hydrological data and WebSocket streaming responses.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%INGRIS%';

UPDATE projects
SET problem_statement = 'Connected vehicle fleets suffer from catastrophic mechanical breakdowns and safety violations because traditional OBD-II telematics systems rely either on slow post-trip batch processing or simplistic hardcoded alerts that produce high false-alarm rates.',
    proposed_solution = 'A high-velocity streaming telemetry platform that unites deterministic physical boundaries (instant overheat and overspeed safety triggers) with unsupervised Machine Learning (Isolation Forest anomaly score estimation) for sub-50ms fault detection.',
    key_features = '• Sub-50ms CAN-bus sensor packet evaluation over bidirectional WebSockets
• Dual-layer anomaly detection: physical threshold gates + multivariate Isolation Forest scoring
• Interactive simulation control center with live speed, temperature, RPM, battery, and fuel sliders
• Priority incident logging (Critical, High, Medium, Low) with statistical confidence metrics
• Automated automated emergency warning alerts before mechanical engine seizure',
    quickstart_cmd = 'git clone https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System.git && docker-compose up --build',
    github_url = 'https://github.com/Ajaykumarnachimuthu/AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System',
    architecture_summary = 'Event-driven reactive telemetry pipeline built with Python FastAPI, scikit-learn Isolation Forest model, and React dashboard with visual gauge telemetry and state management.',
    updated_at = CURRENT_TIMESTAMP
WHERE title ILIKE '%Vehicle Telemetry%';

-- Synchronize user password for ajaykumar / ajaykumarnachimuthu37@gmail.com
UPDATE users 
SET password = '$2a$10$MSg2FlscHXqhVYH/KlBYeujqT0BePTF4qFxIjht4Su7r5shpZGp7y'
WHERE email = 'ajaykumarnachimuthu37@gmail.com' OR username = 'ajaykumar';
