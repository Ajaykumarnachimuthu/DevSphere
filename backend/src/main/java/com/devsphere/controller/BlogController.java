package com.devsphere.controller;

import com.devsphere.client.BlogServiceClient;
import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.KnowledgeTrailResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@Tag(name = "Blogs Facade", description = "Core API Facade delegating to authoritative Blog Microservice (Port 8081)")
public class BlogController {

    private final BlogServiceClient blogServiceClient;

    public BlogController(BlogServiceClient blogServiceClient) {
        this.blogServiceClient = blogServiceClient;
    }

    @GetMapping
    @Operation(summary = "Get published blogs (Delegated to Blog Service)")
    public ResponseEntity<PagedResponse<BlogResponse>> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(blogServiceClient.getBlogs(category, search, pageable, principal));
    }

    @GetMapping("/trails")
    @Operation(summary = "Get all developer knowledge trails (Delegated to Blog Service)")
    public ResponseEntity<List<KnowledgeTrailResponse>> getKnowledgeTrails() {
        return ResponseEntity.ok(blogServiceClient.getKnowledgeTrails());
    }

    @GetMapping("/trails/{id}")
    @Operation(summary = "Get a knowledge trail by ID (Delegated to Blog Service)")
    public ResponseEntity<KnowledgeTrailResponse> getKnowledgeTrailById(@PathVariable UUID id) {
        return ResponseEntity.ok(blogServiceClient.getKnowledgeTrailById(id));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blog by ID (Delegated to Blog Service)")
    public ResponseEntity<BlogResponse> getBlogById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(blogServiceClient.getBlogById(id, principal));
    }

    @PostMapping
    @Operation(summary = "Create a new blog or save draft (Authenticated Facade)")
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody CreateBlogRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        BlogResponse response = blogServiceClient.createBlog(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/drafts")
    @Operation(summary = "Get drafts created by authenticated user (Delegated to Blog Service)")
    public ResponseEntity<List<BlogResponse>> getDrafts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(blogServiceClient.getDrafts(principal));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing blog post (Owner or Admin)")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBlogRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(blogServiceClient.updateBlog(id, request, principal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blog post (Owner or Admin)")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        blogServiceClient.deleteBlog(id, principal);
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
        return ResponseEntity.ok(blogServiceClient.toggleLike(id, user));
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark/unbookmark on a blog post (Authenticated)")
    public ResponseEntity<BlogResponse> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(blogServiceClient.toggleBookmark(id, principal));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a blog post (Delegated to Blog Service)")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(blogServiceClient.getComments(id, principal));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment on a blog post (Authenticated)")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogServiceClient.addComment(id, request, principal));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a blog comment (Author or Moderator)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        blogServiceClient.deleteComment(commentId, principal);
        return ResponseEntity.noContent().build();
    }
}
