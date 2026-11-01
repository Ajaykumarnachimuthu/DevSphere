-- =============================================================================
-- V5: Purge Mock & Fabricated Demonstration Data across DevSphere
-- Eliminates hardcoded demo accounts, artificial engagement, fake blogs,
-- fake developer profiles, and fake project records.
-- Preserves genuine user accounts, authenticated profiles, user-created
-- blogs, and verified project records.
-- =============================================================================

-- 1. Remove demonstration project dependencies and records
DELETE FROM project_likes WHERE project_id IN (
    SELECT id FROM projects WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM project_bookmarks WHERE project_id IN (
    SELECT id FROM projects WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM project_comments WHERE project_id IN (
    SELECT id FROM projects WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM project_technologies WHERE project_id IN (
    SELECT id FROM projects WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM projects WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001';

-- 2. Remove demonstration blog dependencies and records
DELETE FROM blog_likes WHERE blog_id IN (
    SELECT id FROM blogs WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM blog_bookmarks WHERE blog_id IN (
    SELECT id FROM blogs WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM blog_comments WHERE blog_id IN (
    SELECT id FROM blogs WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM trail_articles WHERE blog_id IN (
    SELECT id FROM blogs WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM blog_tags WHERE blog_id IN (
    SELECT id FROM blogs WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM blogs WHERE author_id IS NULL OR author_id = '00000000-0000-0000-0000-000000000001';

-- 3. Remove demonstration developer profiles and dependencies
DELETE FROM developer_skills WHERE developer_id IN (
    SELECT id FROM developer_profiles WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM developer_connections WHERE developer_id IN (
    SELECT id FROM developer_profiles WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM developer_profiles WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000001';

-- 4. Remove demonstration admin user
DELETE FROM users WHERE email = 'ajay@devsphere.io' OR id = '00000000-0000-0000-0000-000000000001';

