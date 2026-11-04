package com.devsphere.projectservice;

import com.devsphere.projectservice.repository.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProjectDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProjectDataInitializer.class);

    private final ProjectRepository projectRepository;
    private final JdbcTemplate jdbcTemplate;

    public ProjectDataInitializer(ProjectRepository projectRepository, JdbcTemplate jdbcTemplate) {
        this.projectRepository = projectRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // Ensure text columns support large content
        try {
            jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN cover_image SET DATA TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN tagline SET DATA TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN quickstart_cmd SET DATA TYPE TEXT");
            log.info("Ensured projects table columns are TEXT type.");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN cover_image TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN tagline TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN quickstart_cmd TYPE TEXT");
            } catch (Exception ignored) {
                log.debug("Schema adjustment skipped or already applied: {}", ignored.getMessage());
            }
        }

        // Clean up mock projects and mock likes; retain ONLY authentic user 'selva'
        try {
            log.info("Pruning all mock projects and mock likes. Keeping only authentic user 'selva'...");
            jdbcTemplate.execute("DELETE FROM project_likes");
            jdbcTemplate.execute("DELETE FROM project_bookmarks");
            jdbcTemplate.execute("DELETE FROM project_comments");
            jdbcTemplate.execute("DELETE FROM project_technologies WHERE project_id IN (SELECT id FROM projects WHERE LOWER(author_name) NOT IN ('selva'))");
            jdbcTemplate.execute("DELETE FROM projects WHERE LOWER(author_name) NOT IN ('selva')");
            jdbcTemplate.execute("UPDATE projects SET likes = 0");
            log.info("Pruned mock projects successfully. Remaining authentic projects count: {}", projectRepository.count());
        } catch (Exception ex) {
            log.warn("Project cleanup error: {}", ex.getMessage());
        }
    }
}
