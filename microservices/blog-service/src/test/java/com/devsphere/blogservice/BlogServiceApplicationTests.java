package com.devsphere.blogservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BlogServiceApplicationTests {

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogController blogController;

    @Test
    void contextLoads() {
        assertThat(blogService).isNotNull();
        assertThat(blogController).isNotNull();
    }

    @Test
    void testInitialBlogsSeeded() {
        List<Blog> blogs = blogService.getBlogs(null, null);
        assertThat(blogs).isNotEmpty();
        assertThat(blogs.size()).isGreaterThanOrEqualTo(6);
    }

    @Test
    void testSearchBlogs() {
        List<Blog> results = blogService.getBlogs(null, "JavaScript");
        assertThat(results).isNotEmpty();
        assertThat(results.get(0).getTitle()).contains("JavaScript");
    }

    @Test
    void testCreateBlog() {
        Blog newBlog = new Blog("Microservices with Spring Boot 3", "Architecture", "Complete guide to decomposing monoliths into microservices.", "Marcus Vance", "Java", "7 min read", "PUBLISHED");
        ResponseEntity<Blog> response = blogController.createBlog(newBlog);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Microservices with Spring Boot 3");
    }
}
