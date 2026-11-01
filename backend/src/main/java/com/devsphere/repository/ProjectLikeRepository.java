package com.devsphere.repository;

import com.devsphere.entity.ProjectLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectLikeRepository extends JpaRepository<ProjectLike, UUID> {

    Optional<ProjectLike> findByProjectIdAndUserId(UUID projectId, UUID userId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    void deleteByProjectIdAndUserId(UUID projectId, UUID userId);

    long countByProjectId(UUID projectId);
}
