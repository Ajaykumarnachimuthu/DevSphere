package com.devsphere.service;

import com.devsphere.DevSphereApplication;
import com.devsphere.client.BlogServiceClient;
import com.devsphere.client.ProjectServiceClient;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.exception.ServiceUnavailableException;
import com.devsphere.security.InternalTokenService;
import com.devsphere.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = DevSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FaultIsolationAndGatewayTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InternalTokenService internalTokenService;

    @Value("${devsphere.internal.secret:devsphere-hybrid-internal-key-2026}")
    private String internalSecret;

    @MockitoBean
    private BlogServiceClient blogServiceClient;

    @MockitoBean
    private ProjectServiceClient projectServiceClient;

    @Test
    @DisplayName("Verify Internal Cryptographic Token Issuance with Audience Restriction")
    void testInternalTokenIssuance() {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(
                userId,
                "architect_ajay",
                "ajay@devsphere.io",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        String blogToken = internalTokenService.generateToken(principal, "blog-service");
        assertThat(blogToken).isNotNull();

        SecretKey key = Keys.hmacShaKeyFor(internalSecret.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(blogToken)
                .getPayload();

        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.getAudience()).contains("blog-service");
        assertThat(claims.getIssuer()).isEqualTo("devsphere-core");
        assertThat(claims.get("username")).isEqualTo("architect_ajay");
        assertThat(claims.get("role")).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Fault Isolation: When Blog Service is down, Project discovery and Auth remain operational")
    void testFaultIsolation_BlogDown_ProjectUp() throws Exception {
        // 1. Simulate Blog Service outage (Port 8081 failure)
        when(blogServiceClient.getBlogs(any(), any(), any(Pageable.class), any()))
                .thenThrow(new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable."));

        // 2. Simulate Project Service running healthy (Port 8082 operational)
        UUID projId = UUID.randomUUID();
        ProjectResponse healthyProject = new ProjectResponse(projId, "FleetWatch Telemetry", "AI/ML", "CAN-bus streaming", "AJAYKUMAR N", List.of("FastAPI"), 100, 2000, Instant.now(), false);
        when(projectServiceClient.getProjects(any(), any(), any(), any(Pageable.class), any()))
                .thenReturn(new PagedResponse<>(List.of(healthyProject), 0, 20, 1, 1, true));

        // Blog route MUST return 503 with graceful error
        mockMvc.perform(get("/api/v1/blogs"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("Blog Service (Port 8081) is currently unreachable."));

        // BUT Project discovery MUST continue operating seamlessly (HTTP 200 OK)
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(projId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("FleetWatch Telemetry"));

        // AND Core platform developer directory MUST continue operating seamlessly
        mockMvc.perform(get("/api/v1/developers"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Fault Isolation: When Project Service is down, Blog reading remains operational")
    void testFaultIsolation_ProjectDown_BlogUp() throws Exception {
        // 1. Simulate Project Service outage (Port 8082 failure)
        when(projectServiceClient.getProjects(any(), any(), any(), any(Pageable.class), any()))
                .thenThrow(new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable."));

        // 2. Simulate Blog Service healthy
        UUID blogId = UUID.randomUUID();
        var healthyBlog = new com.devsphere.dto.response.BlogResponse();
        healthyBlog.setId(blogId);
        healthyBlog.setTitle("INGRIS Chatbot Architecture");
        when(blogServiceClient.getBlogs(any(), any(), any(Pageable.class), any()))
                .thenReturn(new PagedResponse<>(List.of(healthyBlog), 0, 20, 1, 1, true));

        // Project route MUST return 503
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("SERVICE_UNAVAILABLE"));

        // BUT Blog discovery MUST return 200 OK
        mockMvc.perform(get("/api/v1/blogs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("INGRIS Chatbot Architecture"));
    }
}
