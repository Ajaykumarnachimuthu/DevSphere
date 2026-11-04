package com.devsphere.blogservice.repository;

import com.devsphere.blogservice.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

        @Query("SELECT b FROM Blog b WHERE b.status = :status " +
                        "AND (:category IS NULL OR :category = 'All' OR LOWER(b.category) = LOWER(:category)) " +
                        "AND (:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "     OR LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "     OR LOWER(b.authorName) LIKE LOWER(CONCAT('%', :query, '%')))")
        Page<Blog> searchBlogs(
                        @Param("status") String status,
                        @Param("category") String category,
                        @Param("query") String query,
                        Pageable pageable);

        List<Blog> findByAuthorIdAndStatus(UUID authorId, String status);

        @Modifying
        @Query("UPDATE Blog b SET b.likes = (SELECT COUNT(l) FROM BlogLike l WHERE l.blogId = :blogId) WHERE b.id = :blogId")
        void synchronizeLikeCount(@Param("blogId") UUID blogId);

        @Modifying
        @Query("UPDATE Blog b SET b.bookmarks = (SELECT COUNT(bm) FROM BlogBookmark bm WHERE bm.blogId = :blogId) WHERE b.id = :blogId")
        void synchronizeBookmarkCount(@Param("blogId") UUID blogId);
}
