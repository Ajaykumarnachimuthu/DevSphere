package com.devsphere.blogservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    List<Blog> findByCategoryIgnoreCase(String category);

    @Query("SELECT b FROM Blog b WHERE b.status = 'PUBLISHED' AND " +
           "(:category IS NULL OR :category = '' OR LOWER(:category) = 'all' OR LOWER(b.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Blog> searchBlogs(@Param("category") String category, @Param("search") String search);

    List<Blog> findByAuthorIdAndStatus(UUID authorId, String status);

    long countByStatus(String status);
}
