package com.devsphere.repository;

import com.devsphere.entity.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, UUID> {
    List<BlogComment> findByBlogIdOrderByCreatedAtDesc(UUID blogId);

    long countByBlogId(UUID blogId);
}
