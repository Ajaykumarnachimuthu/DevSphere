package com.devsphere.projectservice;

import com.devsphere.projectservice.dto.CreateProjectRequest;
import com.devsphere.projectservice.dto.PagedResponse;
import com.devsphere.projectservice.dto.ProjectResponse;
import com.devsphere.projectservice.dto.UpdateProjectRequest;
import com.devsphere.projectservice.security.InternalTokenVerifier;
import com.devsphere.projectservice.security.InternalUserPrincipal;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class ProjectServiceApplicationTests {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectController projectController;

    @Autowired
    private InternalTokenVerifier tokenVerifier;

    @Value("${devsphere.internal.secret:devsphere-hybrid-internal-key-2026}")
    private String internalSecret;

    private String createTestToken(UUID userId, String username, String role, String audience) {
        SecretKey key = Keys.hmacShaKeyFor(internalSecret.getBytes(StandardCharsets.UTF_8));
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer("devsphere-core")
                .subject(userId.toString())
                .audience().add(audience).and()
                .claim("username", username)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(300)))
                .signWith(key)
                .compact();
    }

    @Test
    void contextLoads() {
        assertThat(projectService).isNotNull();
        assertThat(projectController).isNotNull();
        assertThat(tokenVerifier).isNotNull();
    }

    @Test
    void testInitialProjectsSeeded() {
        PagedResponse<ProjectResponse> response = projectService.getProjects(null, null, null, 0, 20, null);
        assertThat(response).isNotNull();
        assertThat(response.getContent()).isNotEmpty();
        assertThat(response.getTotalElements()).isGreaterThanOrEqualTo(6);
    }

    @Test
    void testFilterByCategory() {
        PagedResponse<ProjectResponse> webProjects = projectService.getProjects("Web Development", null, null, 0, 20, null);
        assertThat(webProjects.getContent()).isNotEmpty();
        assertThat(webProjects.getContent()).allMatch(p -> p.getCategory().equalsIgnoreCase("Web Development"));
    }

    @Test
    void testCryptographicInternalTokenVerification() {
        UUID testUser = UUID.randomUUID();
        String validToken = createTestToken(testUser, "project_lead", "ROLE_USER", "project-service");

        InternalUserPrincipal principal = tokenVerifier.verify(validToken);
        assertThat(principal).isNotNull();
        assertThat(principal.getId()).isEqualTo(testUser);
        assertThat(principal.getUsername()).isEqualTo("project_lead");

        // Wrong audience must fail
        String wrongAudToken = createTestToken(testUser, "hacker", "ROLE_USER", "blog-service");
        assertThat(tokenVerifier.verify(wrongAudToken)).isNull();
    }

    @Test
    void testCreateProjectWithInternalToken() {
        UUID authorId = UUID.randomUUID();
        String token = createTestToken(authorId, "lead_dev", "ROLE_USER", "project-service");

        CreateProjectRequest req = new CreateProjectRequest();
        req.setTitle("Distributed Task Queue");
        req.setCategory("DevOps");
        req.setDescription("High throughput distributed priority queue engine.");
        req.setTechnologies(List.of("Go", "gRPC", "Redis"));

        ResponseEntity<ProjectResponse> response = projectController.createProject(req, token, null);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getAuthorId()).isEqualTo(authorId);
    }

    @Test
    void testToggleLike() {
        PagedResponse<ProjectResponse> response = projectService.getProjects(null, null, null, 0, 1, null);
        ProjectResponse project = response.getContent().get(0);
        UUID userId = UUID.randomUUID();

        ProjectResponse liked = projectService.toggleLike(project.getId(), userId);
        assertThat(liked.isLiked()).isTrue();

        ProjectResponse unliked = projectService.toggleLike(project.getId(), userId);
        assertThat(unliked.isLiked()).isFalse();
    }

    @Test
    void testAtomicViewIncrement() {
        PagedResponse<ProjectResponse> response = projectService.getProjects(null, null, null, 0, 1, null);
        ProjectResponse project = response.getContent().get(0);
        int initialViews = project.getViews();

        ProjectResponse afterView = projectService.incrementViews(project.getId());
        assertThat(afterView.getViews()).isEqualTo(initialViews + 1);
    }

    @Test
    void testOwnerPermissionEnforcement() {
        UUID ownerId = UUID.randomUUID();
        CreateProjectRequest req = new CreateProjectRequest();
        req.setTitle("Secure Vault API");
        req.setCategory("Security");
        req.setDescription("Encrypted key management vault.");
        req.setTechnologies(List.of("Rust", "PostgreSQL"));

        ProjectResponse created = projectService.createProject(req, ownerId, "vault_admin");

        UUID otherUser = UUID.randomUUID();
        UpdateProjectRequest updateReq = new UpdateProjectRequest();
        updateReq.setTitle("Hacked Title");
        updateReq.setCategory("Security");
        updateReq.setDescription("Unauthorized modification attempt.");

        assertThrows(SecurityException.class, () -> {
            projectService.updateProject(created.getId(), updateReq, otherUser, false);
        });
    }
}
