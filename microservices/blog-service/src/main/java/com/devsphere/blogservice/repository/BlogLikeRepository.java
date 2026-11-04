package com.devsphere.blogservice.repository;

import com.devsphere.blogservice.entity.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogLikeRepository extends JpaRepository<BlogLike, UUID> {
    boolean existsByBlogIdAndUserId(UUID blogId, UUID userId);

    Optional<BlogLike> findByBlogIdAndUserId(UUID blogId, UUID userId);

    long countByBlogId(UUID blogId);
}
