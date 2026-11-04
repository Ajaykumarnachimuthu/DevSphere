-- =============================================================================
-- V8: Convert cover_image, tagline, quickstart_cmd, and blog text columns to TEXT
-- Enables direct support for large Base64 data URLs, comprehensive taglines, and chained scripts
-- =============================================================================

ALTER TABLE projects ALTER COLUMN cover_image TYPE TEXT;
ALTER TABLE projects ALTER COLUMN tagline TYPE TEXT;
ALTER TABLE projects ALTER COLUMN quickstart_cmd TYPE TEXT;

ALTER TABLE blogs ALTER COLUMN cover_image TYPE TEXT;
ALTER TABLE blogs ALTER COLUMN subtitle TYPE TEXT;
ALTER TABLE blogs ALTER COLUMN tech TYPE TEXT;
ALTER TABLE blogs ALTER COLUMN prerequisites TYPE TEXT;
ALTER TABLE blogs ALTER COLUMN takeaways TYPE TEXT;
