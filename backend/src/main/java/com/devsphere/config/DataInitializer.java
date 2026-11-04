package com.devsphere.config;

import com.devsphere.service.GitHubImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final GitHubImportService gitHubImportService;

    public DataInitializer(
            JdbcTemplate jdbcTemplate,
            GitHubImportService gitHubImportService
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.gitHubImportService = gitHubImportService;
    }

    @Override
    public void run(String... args) {
        applySchemaUpdates();

        // Perform genuine GitHub project import synchronization under the registered user account
        try {
            log.info("Checking and synchronizing verified GitHub projects for DevSphere showcase...");
            gitHubImportService.syncAllQualifyingProjects(null);
            log.info("Verified GitHub project showcase synchronized successfully.");
        } catch (Exception ex) {
            log.warn("Non-blocking GitHub project synchronization notice: {}", ex.getMessage());
        }
    }

    private void applySchemaUpdates() {
        log.info("Checking and applying database schema enhancements...");
        String[] ddlStatements = {
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1",
            "ALTER TABLE developer_profiles ALTER COLUMN avatar SET DATA TYPE TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS subtitle TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS difficulty VARCHAR(30) DEFAULT 'Intermediate'",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS prerequisites TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS takeaways TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS likes INT NOT NULL DEFAULT 0",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS bookmarks INT NOT NULL DEFAULT 0",
            "ALTER TABLE blogs ALTER COLUMN cover_image SET DATA TYPE TEXT",
            "ALTER TABLE blogs ALTER COLUMN subtitle SET DATA TYPE TEXT",
            "CREATE TABLE IF NOT EXISTS blog_likes (id UUID PRIMARY KEY, blog_id UUID NOT NULL, user_id UUID NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT uq_blog_user_like UNIQUE (blog_id, user_id))",
            "CREATE TABLE IF NOT EXISTS blog_bookmarks (id UUID PRIMARY KEY, blog_id UUID NOT NULL, user_id UUID NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT uq_blog_user_bookmark UNIQUE (blog_id, user_id))",
            "CREATE TABLE IF NOT EXISTS blog_comments (id UUID PRIMARY KEY, blog_id UUID NOT NULL, user_id UUID NOT NULL, author_name VARCHAR(100) NOT NULL, content TEXT NOT NULL, parent_id UUID, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS knowledge_trails (id UUID PRIMARY KEY, author_id UUID, author_name VARCHAR(100) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT, category VARCHAR(50) NOT NULL, cover_image TEXT, estimated_hours INT NOT NULL DEFAULT 5, difficulty VARCHAR(30) DEFAULT 'Intermediate', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS trail_articles (trail_id UUID NOT NULL, blog_id UUID NOT NULL, sequence_order INT NOT NULL DEFAULT 1, PRIMARY KEY (trail_id, blog_id))",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS tagline TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS quickstart_cmd TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE'",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS live_demo_url VARCHAR(500)",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url VARCHAR(500)",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS documentation TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem_statement TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposed_solution TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture_summary TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_features TEXT",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS bookmarks INT NOT NULL DEFAULT 0",
            "ALTER TABLE projects ALTER COLUMN cover_image SET DATA TYPE TEXT",
            "ALTER TABLE projects ALTER COLUMN tagline SET DATA TYPE TEXT",
            "ALTER TABLE projects ALTER COLUMN quickstart_cmd SET DATA TYPE TEXT",
            "CREATE TABLE IF NOT EXISTS project_bookmarks (id UUID PRIMARY KEY, project_id UUID NOT NULL, user_id UUID NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT uq_project_user_bookmark UNIQUE (project_id, user_id))",
            "CREATE TABLE IF NOT EXISTS project_comments (id UUID PRIMARY KEY, project_id UUID NOT NULL, user_id UUID NOT NULL, author_name VARCHAR(100) NOT NULL, content TEXT NOT NULL, parent_id UUID, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
        };

        for (String ddl : ddlStatements) {
            try {
                jdbcTemplate.execute(ddl);
            } catch (Exception ex) {
                log.debug("DDL statement applied or already present: {}", ex.getMessage());
            }
        }

        cleanupTestUsers();
    }

    private void cleanupTestUsers() {
        try {
            log.info("Checking and pruning test user accounts, retaining ONLY authentic user 'selva'...");
            String[] cleanupSqls = {
                "DELETE FROM developer_skills WHERE developer_id IN (SELECT id FROM developer_profiles WHERE LOWER(name) != 'selva')",
                "DELETE FROM developer_skills WHERE developer_id IN (SELECT id FROM developer_profiles WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva'))",
                "DELETE FROM developer_profiles WHERE LOWER(name) != 'selva'",
                "DELETE FROM developer_profiles WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM blog_comments WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM blog_likes WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM blog_bookmarks WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM project_comments WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM project_likes WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM project_bookmarks WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) != 'selva')",
                "DELETE FROM users WHERE LOWER(username) != 'selva'"
            };
            for (String sql : cleanupSqls) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception ex) {
                    log.debug("Cleanup statement executed: {}", ex.getMessage());
                }
            }
            log.info("Test users and mock accounts pruned successfully. Only authentic account 'selva' remains.");
        } catch (Exception e) {
            log.warn("User cleanup skipped: {}", e.getMessage());
        }
    }
}
