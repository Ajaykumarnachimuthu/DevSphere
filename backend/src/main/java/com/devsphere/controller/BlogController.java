package com.devsphere.controller;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.KnowledgeTrailResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.BlogService;
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
@Tag(name = "Blogs", description = "Endpoints for reading, searching, drafting, publishing, and interacting with blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    @Operation(summary = "Get published blogs with category filter, search query, and pagination")
    public ResponseEntity<PagedResponse<BlogResponse>> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PagedResponse<BlogResponse> response = blogService.getBlogs(category, search, pageable, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trails")
    @Operation(summary = "Get all published developer knowledge trails")
    public ResponseEntity<List<KnowledgeTrailResponse>> getKnowledgeTrails() {
        return ResponseEntity.ok(blogService.getKnowledgeTrails());
    }

    @GetMapping("/trails/{id}")
    @Operation(summary = "Get a knowledge trail with its ordered articles")
    public ResponseEntity<KnowledgeTrailResponse> getKnowledgeTrailById(@PathVariable UUID id) {
        return ResponseEntity.ok(blogService.getKnowledgeTrailById(id));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blog by ID")
    public ResponseEntity<BlogResponse> getBlogById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        BlogResponse response = blogService.getBlogById(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create a new blog or save draft (Authenticated)")
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody CreateBlogRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        BlogResponse response = blogService.createBlog(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/drafts")
    @Operation(summary = "Get drafts created by authenticated user")
    public ResponseEntity<List<BlogResponse>> getDrafts(@AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        List<BlogResponse> drafts = blogService.getDrafts(currentUserId);
        return ResponseEntity.ok(drafts);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing blog post (Owner or Admin)")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBlogRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        BlogResponse response = blogService.updateBlog(id, request, currentUserId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blog post (Owner or Admin)")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        blogService.deleteBlog(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like on a blog post (Authenticated)")
    public ResponseEntity<BlogResponse> toggleLike(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(blogService.toggleLike(id, currentUserId));
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark on a blog post (Authenticated)")
    public ResponseEntity<BlogResponse> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(blogService.toggleBookmark(id, currentUserId));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a blog post")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(blogService.getComments(id, currentUserId));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment on a blog post (Authenticated)")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.addComment(id, request, currentUserId));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a blog comment (Author or Moderator)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        blogService.deleteComment(commentId, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
