-- V1: Initial DEVSphere Schema

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

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

CREATE TABLE IF NOT EXISTS developer_skills (
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(50) NOT NULL,
    PRIMARY KEY (developer_id, skill)
);

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

CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (blog_id, tag)
);

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

CREATE TABLE IF NOT EXISTS project_technologies (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, technology)
);

CREATE TABLE IF NOT EXISTS project_likes (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_user_like UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS developer_connections (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dev_user_connection UNIQUE (developer_id, user_id)
);
