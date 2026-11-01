package com.devsphere.controller;

import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.entity.BlogStatus;
import com.devsphere.security.CustomUserDetailsService;
import com.devsphere.security.JwtAuthenticationFilter;
import com.devsphere.security.JwtTokenProvider;
import com.devsphere.service.BlogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
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
@AutoConfigureMockMvc(addFilters = false)
class BlogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BlogService blogService;

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

        when(blogService.getBlogs(eq("Web Development"), eq("Closures"), any(Pageable.class), any()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/blogs")
                        .param("category", "Web Development")
                        .param("search", "Closures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Understanding Closures"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void createBlog_ValidRequest_Returns201() throws Exception {
        CreateBlogRequest request = new CreateBlogRequest("New Post", "DevOps", "Long article content here", "Docker", List.of("docker"), false);
        UUID blogId = UUID.randomUUID();
        BlogResponse response = new BlogResponse(blogId, "New Post", "DevOps", "Long article content here", "author", "2 min read", "Docker", Set.of("docker"), BlogStatus.PUBLISHED, Instant.now(), true);

        when(blogService.createBlog(any(CreateBlogRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/blogs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(blogId.toString()))
                .andExpect(jsonPath("$.title").value("New Post"));
    }

    @Test
    void createBlog_BlankTitle_Returns400() throws Exception {
        CreateBlogRequest request = new CreateBlogRequest("", "DevOps", "Content", "Docker", List.of(), false);

        mockMvc.perform(post("/api/v1/blogs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details.title").exists());
    }

    @Test
    void getBlogById_DraftNotAuthor_Returns403() throws Exception {
        UUID blogId = UUID.randomUUID();
        when(blogService.getBlogById(eq(blogId), any())).thenThrow(new org.springframework.security.access.AccessDeniedException("You do not have permission to view this draft"));

        mockMvc.perform(get("/api/v1/blogs/{id}", blogId))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }
}
