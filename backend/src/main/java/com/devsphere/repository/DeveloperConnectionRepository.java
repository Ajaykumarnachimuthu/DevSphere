package com.devsphere.repository;

import com.devsphere.entity.DeveloperConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeveloperConnectionRepository extends JpaRepository<DeveloperConnection, UUID> {

    Optional<DeveloperConnection> findByDeveloperIdAndUserId(UUID developerId, UUID userId);

    boolean existsByDeveloperIdAndUserId(UUID developerId, UUID userId);

    void deleteByDeveloperIdAndUserId(UUID developerId, UUID userId);

    long countByDeveloperId(UUID developerId);

    @org.springframework.data.jpa.repository.Query("SELECT c.developer.id, COUNT(c) FROM DeveloperConnection c WHERE c.developer.id IN :developerIds GROUP BY c.developer.id")
    java.util.List<Object[]> countByDeveloperIds(@org.springframework.data.repository.query.Param("developerIds") java.util.Collection<UUID> developerIds);

    @org.springframework.data.jpa.repository.Query("SELECT c.developer.id FROM DeveloperConnection c WHERE c.developer.id IN :developerIds AND c.user.id = :userId")
    java.util.List<UUID> findConnectedDeveloperIds(@org.springframework.data.repository.query.Param("developerIds") java.util.Collection<UUID> developerIds, @org.springframework.data.repository.query.Param("userId") UUID userId);
}
