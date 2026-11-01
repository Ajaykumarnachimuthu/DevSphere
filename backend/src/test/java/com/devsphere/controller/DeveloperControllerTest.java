package com.devsphere.controller;

import com.devsphere.dto.request.UpdateDeveloperProfileRequest;
import com.devsphere.dto.response.DeveloperResponse;
import com.devsphere.dto.response.DeveloperStatsResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.security.CustomUserDetailsService;
import com.devsphere.security.JwtAuthenticationFilter;
import com.devsphere.security.JwtTokenProvider;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.DeveloperService;
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

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeveloperController.class)
@AutoConfigureMockMvc(addFilters = false)
class DeveloperControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DeveloperService developerService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getDevelopers_ReturnsPagedDevelopers() throws Exception {
        UUID devId = UUID.randomUUID();
        DeveloperResponse dev = new DeveloperResponse(devId, "Ajay Kumar", "Full Stack Developer", "Bio", "India", "a1", Set.of("React"), 12, 24, 186, false);
        PagedResponse<DeveloperResponse> pagedResponse = new PagedResponse<>(List.of(dev), 0, 20, 1, 1, true);

        when(developerService.getDevelopers(eq("Ajay"), any(Pageable.class), any())).thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/developers").param("query", "Ajay"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Ajay Kumar"))
                .andExpect(jsonPath("$.content[0].role").value("Full Stack Developer"));
    }

    @Test
    void getDeveloperStats_ReturnsStats() throws Exception {
        UUID devId = UUID.randomUUID();
        DeveloperStatsResponse stats = new DeveloperStatsResponse(12, 24, 186, List.of(12, 24, 186), List.of("Projects", "Blogs", "Connections"));

        when(developerService.getDeveloperStats(devId)).thenReturn(stats);

        mockMvc.perform(get("/api/v1/developers/{id}/stats", devId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectsCount").value(12))
                .andExpect(jsonPath("$.blogsCount").value(24))
                .andExpect(jsonPath("$.connectionsCount").value(186));
    }

    @Test
    void getMyProfile_Authenticated_ReturnsProfile() throws Exception {
        UUID devId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(devId, "testuser", "test@devsphere.io", "pass", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        DeveloperResponse dev = new DeveloperResponse(devId, "Test User", "Engineer", "My bio", "India", "avatar", Set.of("Java"), 5, 2, 10, false);

        when(developerService.getMyProfile(devId)).thenReturn(dev);

        mockMvc.perform(get("/api/v1/developers/me")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("Engineer"));
    }

    @Test
    void updateMyProfile_ValidRequest_ReturnsUpdatedProfile() throws Exception {
        UUID devId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(devId, "testuser", "test@devsphere.io", "pass", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        UpdateDeveloperProfileRequest request = new UpdateDeveloperProfileRequest(
                "Updated Name", "Senior Architect", "Updated bio", "Bengaluru, India", "avatar2", Set.of("Java", "Spring")
        );
        DeveloperResponse updatedDev = new DeveloperResponse(devId, "Updated Name", "Senior Architect", "Updated bio", "Bengaluru, India", "avatar2", Set.of("Java", "Spring"), 5, 2, 10, false);

        when(developerService.updateMyProfile(eq(devId), any(UpdateDeveloperProfileRequest.class))).thenReturn(updatedDev);

        mockMvc.perform(put("/api/v1/developers/me")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.role").value("Senior Architect"));
    }
}
