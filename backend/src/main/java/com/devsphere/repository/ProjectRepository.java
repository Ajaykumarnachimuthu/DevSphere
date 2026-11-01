package com.devsphere.repository;

import com.devsphere.entity.Project;
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

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.technologies t WHERE " +
           "(:category IS NULL OR :category = '' OR LOWER(:category) = 'all' OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.authorName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Project> searchProjects(
            @Param("category") String category,
            @Param("query") String query,
            Pageable pageable
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")
    int incrementViewsDirect(@Param("id") UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Project p SET p.likes = (SELECT COUNT(pl) FROM ProjectLike pl WHERE pl.project.id = :id) WHERE p.id = :id")
    int synchronizeLikeCount(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdWithLock(@Param("id") UUID id);

    long countByAuthorId(UUID authorId);

    @Query("SELECT p.author.id, COUNT(p) FROM Project p WHERE p.author.id IN :authorIds GROUP BY p.author.id")
    java.util.List<Object[]> countByAuthorIds(@Param("authorIds") java.util.Collection<UUID> authorIds);

    long countByAuthorNameIgnoreCase(String authorName);

    Optional<Project> findByGithubUrl(String githubUrl);

    boolean existsByGithubUrl(String githubUrl);
}
