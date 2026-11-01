package com.devsphere.repository;

import com.devsphere.entity.Blog;
import com.devsphere.entity.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    Page<Blog> findByStatus(BlogStatus status, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Blog b LEFT JOIN b.tags t WHERE b.status = :status AND " +
           "(:category IS NULL OR :category = '' OR LOWER(:category) = 'all' OR LOWER(b.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.authorName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.tech) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Blog> searchBlogs(
            @Param("status") BlogStatus status,
            @Param("category") String category,
            @Param("query") String query,
            Pageable pageable
    );

    List<Blog> findByAuthorIdAndStatus(UUID authorId, BlogStatus status);

    long countByStatus(BlogStatus status);

    long countByAuthorIdAndStatus(UUID authorId, BlogStatus status);

    @Query("SELECT b.author.id, COUNT(b) FROM Blog b WHERE b.author.id IN :authorIds AND b.status = :status GROUP BY b.author.id")
    List<Object[]> countByAuthorIdsAndStatus(@Param("authorIds") java.util.Collection<UUID> authorIds, @Param("status") BlogStatus status);

    long countByAuthorNameIgnoreCaseAndStatus(String authorName, BlogStatus status);
}
