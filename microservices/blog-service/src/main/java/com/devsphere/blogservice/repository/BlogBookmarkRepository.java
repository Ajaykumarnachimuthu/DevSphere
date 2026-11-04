package com.devsphere.blogservice.repository;

import com.devsphere.blogservice.entity.BlogBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogBookmarkRepository extends JpaRepository<BlogBookmark, UUID> {
    boolean existsByBlogIdAndUserId(UUID blogId, UUID userId);

    Optional<BlogBookmark> findByBlogIdAndUserId(UUID blogId, UUID userId);

    long countByBlogId(UUID blogId);
}
