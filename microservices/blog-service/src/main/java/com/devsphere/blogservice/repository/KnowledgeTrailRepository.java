package com.devsphere.blogservice.repository;

import com.devsphere.blogservice.entity.KnowledgeTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface KnowledgeTrailRepository extends JpaRepository<KnowledgeTrail, UUID> {
}
