-- =============================================================================
-- V4: DevSphere Master Blog & Project Experience Enhancements
-- Adds structured technical publication metadata, knowledge trails,
-- project showcase details, GitHub metadata, project X-ray, documentation,
-- releases, contributors, and independent comments & engagement.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Blog Enhancements
-- -----------------------------------------------------------------------------
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS difficulty VARCHAR(30) DEFAULT 'Intermediate';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS prerequisites TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS takeaways TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS likes INT NOT NULL DEFAULT 0;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS bookmarks INT NOT NULL DEFAULT 0;

-- Blog Likes Table
CREATE TABLE IF NOT EXISTS blog_likes (
    id UUID PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_blog_user_like UNIQUE (blog_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_likes_blog ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON blog_likes(user_id);

-- Blog Bookmarks Table
CREATE TABLE IF NOT EXISTS blog_bookmarks (
    id UUID PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_blog_user_bookmark UNIQUE (blog_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_blog ON blog_bookmarks(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_user ON blog_bookmarks(user_id);

-- Blog Comments Table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_blog ON blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created ON blog_comments(created_at DESC);

-- Knowledge Trails (Structured Developer Learning Journeys)
CREATE TABLE IF NOT EXISTS knowledge_trails (
    id UUID PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    cover_image VARCHAR(500),
    estimated_hours INT NOT NULL DEFAULT 5,
    difficulty VARCHAR(30) DEFAULT 'Intermediate',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trail_articles (
    trail_id UUID NOT NULL REFERENCES knowledge_trails(id) ON DELETE CASCADE,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL DEFAULT 1,
    PRIMARY KEY (trail_id, blog_id)
);

CREATE INDEX IF NOT EXISTS idx_trail_articles_trail ON trail_articles(trail_id);

-- -----------------------------------------------------------------------------
-- 2. Project Enhancements
-- -----------------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS live_demo_url VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS documentation TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem_statement TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposed_solution TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture_summary TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS bookmarks INT NOT NULL DEFAULT 0;

-- Project Bookmarks Table
CREATE TABLE IF NOT EXISTS project_bookmarks (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_user_bookmark UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_bookmarks_project ON project_bookmarks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bookmarks_user ON project_bookmarks(user_id);

-- Project Screenshots Gallery
CREATE TABLE IF NOT EXISTS project_screenshots (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_screenshots_proj ON project_screenshots(project_id);

-- Project Walkthrough Steps (Interactive Tour)
CREATE TABLE IF NOT EXISTS project_walkthrough_steps (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_number INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_walkthrough_proj ON project_walkthrough_steps(project_id);

-- Project Releases / Changelog
CREATE TABLE IF NOT EXISTS project_releases (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    release_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_releases_proj ON project_releases(project_id);

-- Project Contributors
CREATE TABLE IF NOT EXISTS project_contributors (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES developer_profiles(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    github_username VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_contributors_proj ON project_contributors(project_id);

-- Project Comments
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_comments_proj ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created ON project_comments(created_at DESC);

