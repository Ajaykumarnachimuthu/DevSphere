package com.devsphere.repository;

import com.devsphere.entity.DeveloperProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeveloperProfileRepository extends JpaRepository<DeveloperProfile, UUID> {

    Optional<DeveloperProfile> findByNameIgnoreCase(String name);

    Optional<DeveloperProfile> findByUserId(UUID userId);

    @Query("SELECT DISTINCT d FROM DeveloperProfile d LEFT JOIN d.skills s WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.role) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<DeveloperProfile> searchDevelopers(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT d.location) FROM DeveloperProfile d WHERE d.location IS NOT NULL AND TRIM(d.location) != ''")
    long countDistinctLocations();
}
