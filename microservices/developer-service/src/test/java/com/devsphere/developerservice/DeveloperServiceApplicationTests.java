package com.devsphere.developerservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DeveloperServiceApplicationTests {

    @Autowired
    private DeveloperService developerService;

    @Autowired
    private DeveloperController developerController;

    @Test
    void contextLoads() {
        assertThat(developerService).isNotNull();
        assertThat(developerController).isNotNull();
    }

    @Test
    void testInitialDevelopersSeeded() {
        List<DeveloperProfile> developers = developerService.getDevelopers(null);
        assertThat(developers).isNotEmpty();
        assertThat(developers.size()).isGreaterThanOrEqualTo(6);
    }

    @Test
    void testSearchDeveloperByName() {
        List<DeveloperProfile> results = developerService.getDevelopers("Priya");
        assertThat(results).isNotEmpty();
        assertThat(results.get(0).getName()).isEqualTo("Priya Sharma");
        assertThat(results.get(0).getSkills()).contains("Python");
    }

    @Test
    void testCreateDeveloper() {
        DeveloperProfile newDev = new DeveloperProfile("Elena Rostova", "Cloud Architect", "Designing resilient distributed systems.", "Germany", "a7", Set.of("Kubernetes", "Go", "AWS"));
        ResponseEntity<DeveloperProfile> response = developerController.createDeveloper(newDev);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Elena Rostova");
    }
}
