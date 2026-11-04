package com.devsphere.controller;

import com.devsphere.client.BlogServiceClient;
import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.KnowledgeTrailResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.exception.ServiceUnavailableException;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blogs")
@Tag(name = "Blogs Facade", description = "Core API Facade delegating to authoritative Blog Microservice with seamless resilient fallback")
public class BlogController {

    private static final Logger log = LoggerFactory.getLogger(BlogController.class);

    private final BlogServiceClient blogServiceClient;
    private final BlogService internalBlogService;

    public BlogController(BlogServiceClient blogServiceClient, BlogService internalBlogService) {
        this.blogServiceClient = blogServiceClient;
        this.internalBlogService = internalBlogService;
    }

    @GetMapping
    @Operation(summary = "Get published blogs")
    public ResponseEntity<PagedResponse<BlogResponse>> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(blogServiceClient.getBlogs(category, search, pageable, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, falling back to direct database service: {}", e.getMessage());
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalBlogService.getBlogs(category, search, pageable, currentUserId));
        }
    }

    @GetMapping("/trails")
    @Operation(summary = "Get all developer knowledge trails")
    public ResponseEntity<List<KnowledgeTrailResponse>> getKnowledgeTrails() {
        try {
            return ResponseEntity.ok(blogServiceClient.getKnowledgeTrails());
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, falling back to direct database knowledge trails");
            return ResponseEntity.ok(internalBlogService.getKnowledgeTrails());
        }
    }

    @GetMapping("/trails/{id}")
    @Operation(summary = "Get a knowledge trail by ID")
    public ResponseEntity<KnowledgeTrailResponse> getKnowledgeTrailById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(blogServiceClient.getKnowledgeTrailById(id));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, falling back to direct database knowledge trail {}", id);
            return ResponseEntity.ok(internalBlogService.getKnowledgeTrailById(id));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blog by ID")
    public ResponseEntity<BlogResponse> getBlogById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(blogServiceClient.getBlogById(id, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, falling back to direct database blog {}", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalBlogService.getBlogById(id, currentUserId));
        }
    }

    @PostMapping
    @Operation(summary = "Create a new blog or save draft")
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody CreateBlogRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            BlogResponse response = blogServiceClient.createBlog(request, principal);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, creating blog directly in database: {}", request.getTitle());
            UUID currentUserId = principal != null ? principal.getId() : null;
            BlogResponse response = internalBlogService.createBlog(request, currentUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
    }

    @GetMapping("/drafts")
    @Operation(summary = "Get drafts created by authenticated user")
    public ResponseEntity<List<BlogResponse>> getDrafts(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(blogServiceClient.getDrafts(principal));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, fetching drafts directly from database");
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalBlogService.getDrafts(currentUserId));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing blog post (Owner or Admin)")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBlogRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(blogServiceClient.updateBlog(id, request, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, updating blog {} directly in database", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalBlogService.updateBlog(id, request, currentUserId));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blog post (Owner or Admin)")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            blogServiceClient.deleteBlog(id, principal);
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, deleting blog {} directly in database", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            internalBlogService.deleteBlog(id, currentUserId);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like/unlike on a blog post (Authenticated)")
    public ResponseEntity<BlogResponse> toggleLike(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            org.springframework.security.core.Authentication authentication
    ) {
        UserPrincipal user = principal;
        if (user == null && authentication != null && authentication.getPrincipal() instanceof UserPrincipal p) {
            user = p;
        }
        try {
            return ResponseEntity.ok(blogServiceClient.toggleLike(id, user));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, toggling like on blog {} directly in database", id);
            UUID currentUserId = user != null ? user.getId() : null;
            return ResponseEntity.ok(internalBlogService.toggleLike(id, currentUserId));
        }
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark/unbookmark on a blog post (Authenticated)")
    public ResponseEntity<BlogResponse> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(blogServiceClient.toggleBookmark(id, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Blog Service microservice unreachable, toggling bookmark on blog {} directly in database", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalBlogService.toggleBookmark(id, currentUserId));
        }
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a blog post")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(blogServiceClient.getComments(id, principal));
        } catch (ServiceUnavailableException e) {
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalBlogService.getComments(id, currentUserId));
        }
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment on a blog post (Authenticated)")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(blogServiceClient.addComment(id, request, principal));
        } catch (ServiceUnavailableException e) {
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.status(HttpStatus.CREATED).body(internalBlogService.addComment(id, request, currentUserId));
        }
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a blog comment (Author or Moderator)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            blogServiceClient.deleteComment(commentId, principal);
        } catch (ServiceUnavailableException e) {
            UUID currentUserId = principal != null ? principal.getId() : null;
            internalBlogService.deleteComment(commentId, currentUserId);
        }
        return ResponseEntity.noContent().build();
    }
}
