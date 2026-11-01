package com.devsphere.blogservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/blogs")
public class BlogController {

    private final BlogService blogService;
    private final String internalSecret;

    public BlogController(
            BlogService blogService,
            @Value("${devsphere.internal.secret:devsphere-hybrid-internal-key-2026}") String internalSecret
    ) {
        this.blogService = blogService;
        this.internalSecret = internalSecret;
    }

    @GetMapping
    public List<Blog> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return blogService.getBlogs(category, search);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String authUserId,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String authUserRole
    ) {
        return blogService.getBlogById(id).map(blog -> {
            if ("DRAFT".equalsIgnoreCase(blog.getStatus())) {
                boolean isAuthor = authUserId != null && blog.getAuthorId() != null && authUserId.equals(blog.getAuthorId().toString());
                boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUserRole);
                if (!isAuthor && !isAdmin) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Blog>build();
                }
            }
            return ResponseEntity.ok(blog);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/drafts")
    public ResponseEntity<List<Blog>> getDrafts(
            @RequestHeader(value = "X-Auth-User-Id", required = false) String authUserId
    ) {
        if (authUserId == null || authUserId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            UUID authorUuid = UUID.fromString(authUserId);
            List<Blog> drafts = blogService.getDraftsByAuthorId(authorUuid);
            return ResponseEntity.ok(drafts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Blog> createBlog(
            @RequestBody Blog blog,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String authUserId,
            @RequestHeader(value = "X-Auth-User-Name", required = false) String authUserName
    ) {
        if (authUserId != null && !authUserId.isBlank()) {
            try {
                blog.setAuthorId(UUID.fromString(authUserId));
            } catch (IllegalArgumentException ignored) {}
        }
        if (authUserName != null && !authUserName.isBlank()) {
            blog.setAuthorName(authUserName);
        }
        if (blog.getAuthorName() == null || blog.getAuthorName().isBlank()) {
            blog.setAuthorName("Community Member");
        }

        Blog saved = blogService.createBlog(blog);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    public ResponseEntity<Blog> createBlog(Blog blog) {
        return createBlog(blog, null, null);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Blog> updateBlog(
            @PathVariable UUID id,
            @RequestBody Blog blog,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String authUserId,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String authUserRole
    ) {
        return blogService.getBlogById(id).map(existing -> {
            boolean isAuthor = authUserId != null && existing.getAuthorId() != null && authUserId.equals(existing.getAuthorId().toString());
            boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUserRole);
            if (!isAuthor && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<Blog>build();
            }
            Blog updated = blogService.updateBlog(id, blog).orElse(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String authUserId,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String authUserRole
    ) {
        return blogService.getBlogById(id).map(existing -> {
            boolean isAuthor = authUserId != null && existing.getAuthorId() != null && authUserId.equals(existing.getAuthorId().toString());
            boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUserRole);
            if (!isAuthor && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
            }
            blogService.deleteBlog(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
