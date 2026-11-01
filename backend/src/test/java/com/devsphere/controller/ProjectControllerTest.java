package com.devsphere.controller;

import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

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
        UUID projectId = UUID.randomUUID();
        ProjectResponse project = new ProjectResponse(projectId, "Personal Finance Tracker", "Web Development", "Budget tool", "Ajay", List.of("React"), 128, 2400, Instant.now(), false);
        PagedResponse<ProjectResponse> pagedResponse = new PagedResponse<>(List.of(project), 0, 20, 1, 1, true);

        when(projectService.getProjects(eq("Web Development"), eq("Finance"), eq("Most Liked"), any(Pageable.class), any()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/projects")
                        .param("category", "Web Development")
                        .param("search", "Finance")
                        .param("sort", "Most Liked"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Personal Finance Tracker"))
                .andExpect(jsonPath("$.content[0].likes").value(128));
    }

    @Test
    void createProject_ValidRequest_Returns201() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest("Habit Arena", "Web Development", "Gamified habit tracker", List.of("React", "Tailwind"));
        UUID projectId = UUID.randomUUID();
        ProjectResponse response = new ProjectResponse(projectId, "Habit Arena", "Web Development", "Gamified habit tracker", "Meena", List.of("React", "Tailwind"), 0, 0, Instant.now(), false);

        when(projectService.createProject(any(CreateProjectRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(projectId.toString()))
                .andExpect(jsonPath("$.title").value("Habit Arena"));
    }

    @Test
    void toggleLike_ReturnsUpdatedProject() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(userId, "user", "user@devsphere.io", "pass", List.of(new SimpleGrantedAuthority("ROLE_USER")));

        ProjectResponse response = new ProjectResponse(projectId, "Habit Arena", "Web", "Desc", "Author", List.of(), 88, 1200, Instant.now(), true);
        when(projectService.toggleLike(eq(projectId), eq(userId))).thenReturn(response);

        mockMvc.perform(post("/api/v1/projects/{id}/like", projectId)
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likes").value(88));
    }
}
