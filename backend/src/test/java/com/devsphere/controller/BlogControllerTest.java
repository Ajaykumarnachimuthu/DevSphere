package com.devsphere.controller;

import com.devsphere.DevSphereApplication;
import com.devsphere.client.BlogServiceClient;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.entity.BlogStatus;
import com.devsphere.exception.ServiceUnavailableException;
import com.devsphere.security.CustomUserDetailsService;
import com.devsphere.security.JwtAuthenticationFilter;
import com.devsphere.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BlogController.class)
@ContextConfiguration(classes = DevSphereApplication.class)
@AutoConfigureMockMvc(addFilters = false)
class BlogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BlogServiceClient blogServiceClient;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getBlogs_ReturnsPagedBlogs() throws Exception {
        UUID blogId = UUID.randomUUID();
        BlogResponse blog = new BlogResponse(blogId, "Understanding Closures", "Web Development", "Content", "Ajay", "5 min read", "JavaScript", Set.of("js"), BlogStatus.PUBLISHED, Instant.now(), false);
        PagedResponse<BlogResponse> pagedResponse = new PagedResponse<>(List.of(blog), 0, 20, 1, 1, true);

        when(blogServiceClient.getBlogs(eq("Web Development"), any(), any(Pageable.class), any()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/blogs")
                        .param("category", "Web Development"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(blogId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Understanding Closures"));
    }

    @Test
    void getBlogs_WhenBlogServiceDown_Returns503ServiceUnavailable() throws Exception {
        when(blogServiceClient.getBlogs(any(), any(), any(Pageable.class), any()))
                .thenThrow(new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable."));

        mockMvc.perform(get("/api/v1/blogs"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("Blog Service (Port 8081) is currently unreachable."));
    }

    @Test
    void getBlogById_ReturnsBlog() throws Exception {
        UUID blogId = UUID.randomUUID();
        BlogResponse blog = new BlogResponse(blogId, "Spring Boot 3", "Backend", "Content", "Alex", "10 min read", "Java", Set.of("java"), BlogStatus.PUBLISHED, Instant.now(), false);

        when(blogServiceClient.getBlogById(eq(blogId), any())).thenReturn(blog);

        mockMvc.perform(get("/api/v1/blogs/{id}", blogId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(blogId.toString()))
                .andExpect(jsonPath("$.title").value("Spring Boot 3"));
    }

    @Test
    void createBlog_ValidInput_ReturnsCreated() throws Exception {
        UUID blogId = UUID.randomUUID();
        CreateBlogRequest request = new CreateBlogRequest("New Title", "Web Development", "This is rich content for the blog post.", "React", List.of("react"), false);
        BlogResponse response = new BlogResponse(blogId, "New Title", "Web Development", "This is rich content for the blog post.", "CurrentUser", "2 min read", "React", Set.of("react"), BlogStatus.PUBLISHED, Instant.now(), false);

        when(blogServiceClient.createBlog(any(CreateBlogRequest.class), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/blogs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(blogId.toString()))
                .andExpect(jsonPath("$.title").value("New Title"));
    }
}
