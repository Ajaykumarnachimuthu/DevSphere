package com.devsphere.projectservice.repository;

import com.devsphere.projectservice.entity.Project;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

        @Query("SELECT p FROM Project p WHERE " +
                        "(:category IS NULL OR :category = 'All' OR LOWER(p.category) = LOWER(:category)) " +
                        "AND (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "     OR LOWER(p.authorName) LIKE LOWER(CONCAT('%', :query, '%')))")
        Page<Project> searchProjects(
                        @Param("category") String category,
                        @Param("query") String query,
                        Pageable pageable);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT p FROM Project p WHERE p.id = :id")
        Optional<Project> findByIdWithLock(@Param("id") UUID id);

        @Modifying
        @Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")
        void incrementViews(@Param("id") UUID id);

        @Modifying
        @Query("UPDATE Project p SET p.likes = (SELECT COUNT(l) FROM ProjectLike l WHERE l.projectId = :projectId) WHERE p.id = :projectId")
        void synchronizeLikeCount(@Param("projectId") UUID projectId);

        @Modifying
        @Query("UPDATE Project p SET p.bookmarks = (SELECT COUNT(bm) FROM ProjectBookmark bm WHERE bm.projectId = :projectId) WHERE p.id = :projectId")
        void synchronizeBookmarkCount(@Param("projectId") UUID projectId);
}
