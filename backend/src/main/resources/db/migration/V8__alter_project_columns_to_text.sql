-- =============================================================================
-- V8: Convert cover_image, tagline, and quickstart_cmd to TEXT
-- Enables direct support for large Base64 data URLs, comprehensive taglines, and chained scripts
-- =============================================================================

ALTER TABLE projects ALTER COLUMN cover_image TYPE TEXT;
ALTER TABLE projects ALTER COLUMN tagline TYPE TEXT;
ALTER TABLE projects ALTER COLUMN quickstart_cmd TYPE TEXT;
