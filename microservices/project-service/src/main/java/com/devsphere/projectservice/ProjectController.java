package com.devsphere.projectservice;

import com.devsphere.projectservice.dto.*;
import com.devsphere.projectservice.security.InternalTokenVerifier;
import com.devsphere.projectservice.security.InternalUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080"})
@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final InternalTokenVerifier tokenVerifier;

    public ProjectController(ProjectService projectService, InternalTokenVerifier tokenVerifier) {
        this.projectService = projectService;
        this.tokenVerifier = tokenVerifier;
    }

    private InternalUserPrincipal resolvePrincipal(String internalToken, String authHeader) {
        String token = (internalToken != null && !internalToken.isBlank()) ? internalToken : authHeader;
        return tokenVerifier.verify(token);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(projectService.getProjects(category, search, sort, page, size, currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        UUID currentUserId = principal != null ? principal.getId() : null;
        return projectService.getProjectById(id, currentUserId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ProjectResponse created = projectService.createProject(request, principal.getId(), principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            return projectService.updateProject(id, request, principal.getId(), principal.isAdmin())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            boolean deleted = projectService.deleteProject(id, principal.getId(), principal.isAdmin());
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ProjectResponse> toggleLike(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(projectService.toggleLike(id, principal.getId()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ProjectResponse> toggleBookmark(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(projectService.toggleBookmark(id, principal.getId()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ProjectResponse> incrementView(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(projectService.incrementViews(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/github")
    public ResponseEntity<GitHubRepoResponse> getGitHubMetadata(@PathVariable UUID id) {
        GitHubRepoResponse res = projectService.getGitHubMetadata(id);
        return res != null ? ResponseEntity.ok(res) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        InternalUserPrincipal principal = resolvePrincipal(internalToken, authHeader);
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(projectService.getComments(id, currentUserId));
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
            CommentResponse response = projectService.addComment(id, request, principal.getId(), principal.getUsername());
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
            boolean deleted = projectService.deleteComment(commentId, principal.getId(), principal.isAdmin());
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
