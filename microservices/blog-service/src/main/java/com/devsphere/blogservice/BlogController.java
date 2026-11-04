package com.devsphere.blogservice;

import com.devsphere.blogservice.dto.*;
import com.devsphere.blogservice.security.InternalTokenVerifier;
import com.devsphere.blogservice.security.InternalUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080"})
@RestController
@RequestMapping("/api/v1/blogs")
public class BlogController {

    private final BlogService blogService;
    private final InternalTokenVerifier tokenVerifier;

    public BlogController(BlogService blogService, InternalTokenVerifier tokenVerifier) {
        this.blogService = blogService;
        this.tokenVerifier = tokenVerifier;
    }

    private InternalUserPrincipal resolvePrincipal(String internalToken, String authHeader) {
        String token = (internalToken != null && !internalToken.isBlank()) ? internalToken : authHeader;
        return tokenVerifier.verify(token);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<BlogResponse>> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(blogService.getBlogs(category, search, page, size, currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        UUID currentUserId = principal != null ? principal.getId() : null;
        boolean isAdmin = principal != null && principal.isAdmin();

        try {
            return blogService.getBlogById(id, currentUserId, isAdmin)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody CreateBlogRequest request,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        BlogResponse created = blogService.createBlog(request, principal.getId(), principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/drafts")
    public ResponseEntity<List<BlogResponse>> getDrafts(
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(blogService.getDrafts(principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBlogRequest request,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            return blogService.updateBlog(id, request, principal.getId(), principal.isAdmin())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            boolean deleted = blogService.deleteBlog(id, principal.getId(), principal.isAdmin());
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<BlogResponse> toggleLike(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(blogService.toggleLike(id, principal.getId()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<BlogResponse> toggleBookmark(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(blogService.toggleBookmark(id, principal.getId()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(blogService.getComments(id, currentUserId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            CommentResponse response = blogService.addComment(id, request, principal.getId(), principal.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            boolean deleted = blogService.deleteComment(commentId, principal.getId(), principal.isAdmin());
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/trails")
    public ResponseEntity<List<KnowledgeTrailResponse>> getKnowledgeTrails() {
        return ResponseEntity.ok(blogService.getKnowledgeTrails());
    }

    @GetMapping("/trails/{id}")
    public ResponseEntity<KnowledgeTrailResponse> getKnowledgeTrailById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(blogService.getKnowledgeTrailById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
