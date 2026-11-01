package com.devsphere.projectservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByCategoryIgnoreCase(String category);

    @Query("SELECT p FROM Project p WHERE " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Project> searchProjects(@Param("category") String category, @Param("search") String search);
}
