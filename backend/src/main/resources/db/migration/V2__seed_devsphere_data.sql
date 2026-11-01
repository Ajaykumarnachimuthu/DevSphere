-- V2: Seed initial DEVSphere data matching frontend baseline

-- Developers
INSERT INTO developer_profiles (id, user_id, name, role, description, location, avatar, created_at, updated_at)
VALUES 
('a0000000-0000-0000-0000-000000000001', NULL, 'Ajay Kumar', 'Full Stack Developer', 'Passionate about building web applications and APIs.', 'India', 'a1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000002', NULL, 'Arun Kumar', 'React Developer', 'Building interactive and responsive user interfaces.', 'India', 'a2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000003', NULL, 'Priya Sharma', 'AI/ML Developer', 'Exploring machine learning and AI to build smart solutions.', 'India', 'a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000004', NULL, 'Rohit Verma', 'Backend Developer', 'Love solving problems and building scalable backend systems.', 'India', 'a4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000005', NULL, 'Neha Singh', 'UI/UX Designer', 'Designing beautiful and user-friendly digital experiences.', 'India', 'a5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000006', NULL, 'Sagar Patil', 'DevOps Engineer', 'Automating deployments and managing cloud infrastructure.', 'India', 'a6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Skills
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

-- Blogs
INSERT INTO blogs (id, author_id, author_name, title, category, content, read_time, tech, status, created_at, updated_at)
VALUES
('b0000000-0000-0000-0000-000000000001', NULL, 'Ajay Kumar', 'Understanding JavaScript Closures', 'Web Development', 'Learn how closures work and why they are useful in modern JavaScript.', '5 min read', 'JavaScript', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000002', NULL, 'Arun Kumar', 'Getting Started with React Hooks', 'Web Development', 'A simple introduction to useState, useEffect and React Hooks.', '6 min read', 'React', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000003', NULL, 'Ravi Kumar', 'Understanding SQL Joins', 'Web Development', 'Learn the basics of INNER, LEFT and RIGHT joins with examples.', '4 min read', 'Database', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000004', NULL, 'Priya', 'Python for Beginners', 'AI / ML', 'Start your Python journey with variables, functions and data types.', '7 min read', 'Python', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000005', NULL, 'Vishal', 'Introduction to Machine Learning', 'AI / ML', 'Understand the basic concepts behind machine learning.', '8 min read', 'AI', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000006', NULL, 'Rahul', 'Git and GitHub Basics', 'DevOps', 'Learn how developers use Git and GitHub to manage projects.', '5 min read', 'Git', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, author_id, author_name, title, category, description, likes, views, created_at, updated_at)
VALUES
('c0000000-0000-0000-0000-000000000001', NULL, 'Ajaykumar N', 'Personal Finance Tracker', 'Web Development', 'A full-stack web app to track income, expenses, budgets and financial insights.', 128, 2400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000002', NULL, 'Varnika S', 'Railway Ticket Booking System', 'Web Development', 'A comprehensive railway ticket booking system with seat reservation and secure payments.', 96, 1800, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000003', NULL, 'Vinovasri K', 'AI Vehicle Fault Detection', 'AI/ML', 'Real-time vehicle telemetry monitoring and AI-powered fault detection system.', 142, 3100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000004', NULL, 'Meena R', 'Habit Arena', 'Web Development', 'Gamified habit tracking app to build consistency and compete with friends.', 87, 1200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000005', NULL, 'Hari S', 'MarketMind', 'Web Development', 'AI-powered stock market learning and trading simulator with real-time insights.', 164, 2900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000006', NULL, 'Kevin D', 'TaskFlow Pro', 'Tools', 'A productivity platform to manage tasks, teams and projects efficiently.', 73, 950, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Project Technologies
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
