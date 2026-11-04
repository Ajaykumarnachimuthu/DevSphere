package com.devsphere.projectservice.repository;

import com.devsphere.projectservice.entity.ProjectLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectLikeRepository extends JpaRepository<ProjectLike, UUID> {
    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    Optional<ProjectLike> findByProjectIdAndUserId(UUID projectId, UUID userId);

    long countByProjectId(UUID projectId);
}
