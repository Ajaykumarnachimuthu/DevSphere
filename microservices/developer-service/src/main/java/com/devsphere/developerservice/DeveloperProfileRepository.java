package com.devsphere.developerservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeveloperProfileRepository extends JpaRepository<DeveloperProfile, UUID> {

    Optional<DeveloperProfile> findByNameIgnoreCase(String name);

    @Query("SELECT d FROM DeveloperProfile d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.role) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.location) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<DeveloperProfile> searchDevelopers(@Param("query") String query);
}
