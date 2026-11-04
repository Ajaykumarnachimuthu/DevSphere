package com.devsphere.blogservice;

import com.devsphere.blogservice.repository.BlogRepository;
import com.devsphere.blogservice.repository.KnowledgeTrailRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class BlogDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BlogDataInitializer.class);

    private final BlogRepository blogRepository;
    private final KnowledgeTrailRepository trailRepository;
    private final JdbcTemplate jdbcTemplate;

    public BlogDataInitializer(BlogRepository blogRepository, KnowledgeTrailRepository trailRepository, JdbcTemplate jdbcTemplate) {
        this.blogRepository = blogRepository;
        this.trailRepository = trailRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // Ensure text columns support large content
        try {
            jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN cover_image SET DATA TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN subtitle SET DATA TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN tech SET DATA TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN prerequisites SET DATA TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN takeaways SET DATA TYPE TEXT");
            log.info("Ensured blogs table columns are TEXT type.");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN cover_image TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN subtitle TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN tech TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN prerequisites TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE blogs ALTER COLUMN takeaways TYPE TEXT");
            } catch (Exception ignored) {
                log.debug("Blog schema adjustment skipped or already applied: {}", ignored.getMessage());
            }
        }

        // Clean up mock blogs and mock likes; retain ONLY authentic user 'selva'
        try {
            log.info("Pruning all mock blogs and mock likes. Keeping only authentic user 'selva'...");
            jdbcTemplate.execute("DELETE FROM blog_likes");
            jdbcTemplate.execute("DELETE FROM blog_bookmarks");
            jdbcTemplate.execute("DELETE FROM blog_comments");
            jdbcTemplate.execute("DELETE FROM blog_tags WHERE blog_id IN (SELECT id FROM blogs WHERE LOWER(author_name) NOT IN ('selva'))");
            jdbcTemplate.execute("DELETE FROM blogs WHERE LOWER(author_name) NOT IN ('selva')");
            jdbcTemplate.execute("UPDATE blogs SET likes = 0");
            log.info("Pruned mock blogs successfully. Remaining authentic blogs count: {}", blogRepository.count());
        } catch (Exception ex) {
            log.warn("Blog cleanup error: {}", ex.getMessage());
        }
    }
}
