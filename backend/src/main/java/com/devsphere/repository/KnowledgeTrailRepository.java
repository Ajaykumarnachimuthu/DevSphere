package com.devsphere.repository;

import com.devsphere.entity.KnowledgeTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeTrailRepository extends JpaRepository<KnowledgeTrail, UUID> {
    List<KnowledgeTrail> findByCategoryIgnoreCase(String category);
}
