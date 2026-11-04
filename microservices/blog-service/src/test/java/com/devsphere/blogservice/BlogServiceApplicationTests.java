package com.devsphere.blogservice;

import com.devsphere.blogservice.dto.BlogResponse;
import com.devsphere.blogservice.dto.CreateBlogRequest;
import com.devsphere.blogservice.dto.PagedResponse;
import com.devsphere.blogservice.security.InternalTokenVerifier;
import com.devsphere.blogservice.security.InternalUserPrincipal;
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
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BlogServiceApplicationTests {

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogController blogController;

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
        assertThat(blogService).isNotNull();
        assertThat(blogController).isNotNull();
        assertThat(tokenVerifier).isNotNull();
    }

    @Test
    void testInitialBlogsSeeded() {
        PagedResponse<BlogResponse> response = blogService.getBlogs(null, null, 0, 20, null);
        assertThat(response).isNotNull();
        assertThat(response.getContent()).isNotEmpty();
        assertThat(response.getTotalElements()).isGreaterThanOrEqualTo(4);
    }

    @Test
    void testSearchBlogs() {
        PagedResponse<BlogResponse> results = blogService.getBlogs(null, "JavaScript", 0, 20, null);
        assertThat(results.getContent()).isNotEmpty();
        assertThat(results.getContent().get(0).getTitle()).contains("JavaScript");
    }

    @Test
    void testReadingTimeCalculation() {
        String shortText = "Word ".repeat(50);
        assertThat(blogService.calculateReadTime(shortText)).isEqualTo("1 min read");

        String longText = "Word ".repeat(650);
        assertThat(blogService.calculateReadTime(longText)).isEqualTo("4 min read");
    }

    @Test
    void testCryptographicInternalTokenVerification() {
        UUID testUser = UUID.randomUUID();
        String validToken = createTestToken(testUser, "testarchitect", "ROLE_USER", "blog-service");

        InternalUserPrincipal principal = tokenVerifier.verify(validToken);
        assertThat(principal).isNotNull();
        assertThat(principal.getId()).isEqualTo(testUser);
        assertThat(principal.getUsername()).isEqualTo("testarchitect");

        // Token with wrong audience must be rejected
        String wrongAudToken = createTestToken(testUser, "hacker", "ROLE_USER", "other-service");
        assertThat(tokenVerifier.verify(wrongAudToken)).isNull();

        // Expired or forged token must be rejected
        assertThat(tokenVerifier.verify("invalid.token.signature")).isNull();
    }

    @Test
    void testCreateBlogWithInternalToken() {
        UUID authorId = UUID.randomUUID();
        String token = createTestToken(authorId, "author_ajay", "ROLE_USER", "blog-service");

        CreateBlogRequest req = new CreateBlogRequest();
        req.setTitle("Verified Hybrid Microservice Blog");
        req.setCategory("Architecture");
        req.setContent("This article verifies cryptographically asserted author creation.");
        req.setTags(Set.of("Microservices", "Spring Boot"));

        ResponseEntity<BlogResponse> response = blogController.createBlog(req, token, null);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getAuthorId()).isEqualTo(authorId);
    }

    @Test
    void testToggleLike() {
        PagedResponse<BlogResponse> response = blogService.getBlogs(null, null, 0, 1, null);
        BlogResponse blog = response.getContent().get(0);
        UUID userId = UUID.randomUUID();

        BlogResponse liked = blogService.toggleLike(blog.getId(), userId);
        assertThat(liked.isLiked()).isTrue();

        BlogResponse unliked = blogService.toggleLike(blog.getId(), userId);
        assertThat(unliked.isLiked()).isFalse();
    }
}
