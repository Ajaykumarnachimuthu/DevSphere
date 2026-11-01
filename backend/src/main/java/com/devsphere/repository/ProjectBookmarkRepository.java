package com.devsphere.repository;

import com.devsphere.entity.ProjectBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectBookmarkRepository extends JpaRepository<ProjectBookmark, UUID> {
    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    Optional<ProjectBookmark> findByProjectIdAndUserId(UUID projectId, UUID userId);

    long countByProjectId(UUID projectId);
}
