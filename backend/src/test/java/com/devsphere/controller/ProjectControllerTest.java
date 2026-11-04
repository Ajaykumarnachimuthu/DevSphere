package com.devsphere.controller;

import com.devsphere.DevSphereApplication;
import com.devsphere.client.ProjectServiceClient;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.exception.ServiceUnavailableException;
import com.devsphere.security.CustomUserDetailsService;
import com.devsphere.security.JwtAuthenticationFilter;
import com.devsphere.security.JwtTokenProvider;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.GitHubImportService;
import com.devsphere.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectController.class)
@ContextConfiguration(classes = DevSphereApplication.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectServiceClient projectServiceClient;

    @MockitoBean
    private ProjectService internalProjectService;

    @MockitoBean
    private GitHubImportService gitHubImportService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getProjects_ReturnsPagedProjects() throws Exception {
        UUID projId = UUID.randomUUID();
        ProjectResponse project = new ProjectResponse(projId, "DevSphere", "Web Development", "Modern developer platform", "Alex", List.of("React"), 50, 500, Instant.now(), false);
        PagedResponse<ProjectResponse> pagedResponse = new PagedResponse<>(List.of(project), 0, 20, 1, 1, true);

        when(projectServiceClient.getProjects(eq("Web Development"), any(), any(), any(Pageable.class), any()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/projects")
                        .param("category", "Web Development"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(projId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("DevSphere"));
    }

    @Test
    void getProjects_WhenProjectServiceDown_Returns503ServiceUnavailable() throws Exception {
        when(projectServiceClient.getProjects(any(), any(), any(), any(Pageable.class), any()))
                .thenThrow(new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable."));

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("Project Service (Port 8082) is currently unreachable."));
    }

    @Test
    void getProjectById_ReturnsProject() throws Exception {
        UUID projId = UUID.randomUUID();
        ProjectResponse project = new ProjectResponse(projId, "DevSphere", "Web Development", "Modern developer platform", "Alex", List.of("React"), 50, 500, Instant.now(), false);

        when(projectServiceClient.getProjectById(eq(projId), any())).thenReturn(project);

        mockMvc.perform(get("/api/v1/projects/{id}", projId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(projId.toString()))
                .andExpect(jsonPath("$.title").value("DevSphere"));
    }

    @Test
    void createProject_ValidInput_ReturnsCreated() throws Exception {
        UUID projId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(userId, "testuser", "test@test.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        CreateProjectRequest request = new CreateProjectRequest("Title", "Web Development", "A valid project description with enough details.", List.of("Java"));
        ProjectResponse response = new ProjectResponse(projId, "Title", "Web Development", "A valid project description with enough details.", "testuser", List.of("Java"), 0, 0, Instant.now(), false);

        when(projectServiceClient.createProject(any(CreateProjectRequest.class), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/projects")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(projId.toString()))
                .andExpect(jsonPath("$.title").value("Title"));
    }
}
