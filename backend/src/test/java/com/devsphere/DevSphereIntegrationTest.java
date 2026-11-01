package com.devsphere;

import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.LoginRequest;
import com.devsphere.dto.request.RegisterRequest;
import com.devsphere.dto.response.AuthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DevSphereIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullApplicationEndToEndFlow() throws Exception {
        // 1. Register a new user
        RegisterRequest registerReq = new RegisterRequest("integrationUser", "integ@devsphere.io", "password123");
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.username").value("integrationUser"))
                .andReturn();

        AuthResponse regAuth = objectMapper.readValue(registerResult.getResponse().getContentAsString(), AuthResponse.class);
        String token = regAuth.getToken();
        assertThat(token).isNotEmpty();

        // 2. Login with credentials
        LoginRequest loginReq = new LoginRequest("integ@devsphere.io", "password123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // 3. Verify /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("integ@devsphere.io"));

        // 4. Create a blog post using JWT
        CreateBlogRequest blogReq = new CreateBlogRequest(
                "Integration Testing with Spring Boot",
                "Web Development",
                "Step-by-step tutorial on building production-ready test suites.",
                "Spring Boot",
                List.of("java", "spring", "testing"),
                false
        );

        mockMvc.perform(post("/api/v1/blogs")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blogReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Testing with Spring Boot"))
                .andExpect(jsonPath("$.author").value("integrationUser"));

        // 5. Query public blogs feed
        mockMvc.perform(get("/api/v1/blogs")
                        .param("search", "Integration Testing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Integration Testing with Spring Boot"));

        // 6. Check platform overview stats
        mockMvc.perform(get("/api/v1/stats/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.developersCount").isNumber())
                .andExpect(jsonPath("$.blogsCount").isNumber())
                .andExpect(jsonPath("$.projectsCount").isNumber());
    }
}
