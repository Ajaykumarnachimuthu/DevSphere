package com.devsphere.projectservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ProjectServiceApplicationTests {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectController projectController;

    @Test
    void contextLoads() {
        assertThat(projectService).isNotNull();
        assertThat(projectController).isNotNull();
    }

    @Test
    void testInitialProjectsSeeded() {
        List<Project> projects = projectService.getProjects(null, null);
        assertThat(projects).isNotEmpty();
        assertThat(projects.size()).isGreaterThanOrEqualTo(6);
    }

    @Test
    void testFilterByCategory() {
        List<Project> webProjects = projectService.getProjects("Web Development", null);
        assertThat(webProjects).isNotEmpty();
        assertThat(webProjects).allMatch(p -> p.getCategory().equalsIgnoreCase("Web Development"));
    }

    @Test
    void testToggleLike() {
        List<Project> projects = projectService.getProjects(null, null);
        Project target = projects.get(0);
        int initialLikes = target.getLikes();

        ResponseEntity<Project> response = projectController.toggleLike(target.getId());
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getLikes()).isEqualTo(initialLikes + 1);
    }

    @Test
    void testCreateProject() {
        Project newProject = new Project("NeuroFlow AI", "AI/ML", "Decentralized neural network simulator.", "Alex R", List.of("PyTorch", "Rust", "WebAssembly"), 45, 600);
        ResponseEntity<Project> response = projectController.createProject(newProject);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("NeuroFlow AI");
    }
}
