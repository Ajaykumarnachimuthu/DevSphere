-- =============================================================================
-- V3: Database Alignment, Token Versioning & Authoritative Engagement Sync
-- =============================================================================

-- 1. Add token_version to users for server-side token invalidation upon logout
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;

-- 2. Associate primary seed developer profile with initial seed user
UPDATE developer_profiles 
SET user_id = '00000000-0000-0000-0000-000000000001' 
WHERE id = 'a0000000-0000-0000-0000-000000000001' AND user_id IS NULL;

-- 3. Associate primary seed project with initial seed user
UPDATE projects 
SET author_id = '00000000-0000-0000-0000-000000000001' 
WHERE id = 'c0000000-0000-0000-0000-000000000001' AND author_id IS NULL;

-- 4. Associate primary seed blog with initial seed user
UPDATE blogs 
SET author_id = '00000000-0000-0000-0000-000000000001' 
WHERE id = 'b0000000-0000-0000-0000-000000000001' AND author_id IS NULL;

-- 5. Reconcile unbacked project likes with authoritative project_likes records
-- Unbacked cosmetic seed counts are synchronized with actual stored likes
UPDATE projects p 
SET likes = (SELECT COUNT(pl.id) FROM project_likes pl WHERE pl.project_id = p.id);

