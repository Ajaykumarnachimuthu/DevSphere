package com.devsphere.projectservice;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getProjects(String category, String search) {
        if ((category != null && !category.equalsIgnoreCase("All") && !category.isBlank()) || (search != null && !search.isBlank())) {
            String cat = (category != null && !category.equalsIgnoreCase("All") && !category.isBlank()) ? category.trim() : null;
            String q = (search != null && !search.isBlank()) ? search.trim() : null;
            return projectRepository.searchProjects(cat, q);
        }
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(UUID id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Optional<Project> toggleLike(UUID id) {
        return projectRepository.findById(id).map(project -> {
            project.setLikes(project.getLikes() + 1);
            return projectRepository.save(project);
        });
    }

    @Transactional
    public Optional<Project> incrementView(UUID id) {
        return projectRepository.findById(id).map(project -> {
            project.setViews(project.getViews() + 1);
            return projectRepository.save(project);
        });
    }
}
