package com.devsphere.controller;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.request.UpdateProjectRequest;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.GitHubImportService;
import com.devsphere.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects", description = "Endpoints for discovering, submitting, liking, bookmarking, and discussing projects")
public class ProjectController {

    private final ProjectService projectService;
    private final GitHubImportService gitHubImportService;

    public ProjectController(ProjectService projectService, GitHubImportService gitHubImportService) {
        this.projectService = projectService;
        this.gitHubImportService = gitHubImportService;
    }

    @GetMapping
    @Operation(summary = "Get community projects with filtering, search, sorting, and pagination")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "Latest") String sort,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PagedResponse<ProjectResponse> response = projectService.getProjects(category, search, sort, pageable, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        ProjectResponse response = projectService.getProjectById(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Submit a new project (Authenticated)")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        ProjectResponse response = projectService.createProject(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing project (Owner or Admin)")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUserId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing project (Owner or Admin)")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        projectService.deleteProject(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like/unlike on a project (Authenticated)")
    public ResponseEntity<ProjectResponse> toggleLike(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            org.springframework.security.core.Authentication authentication
    ) {
        UserPrincipal user = principal;
        if (user == null && authentication != null && authentication.getPrincipal() instanceof UserPrincipal p) {
            user = p;
        }
        UUID currentUserId = user != null ? user.getId() : null;
        ProjectResponse response = projectService.toggleLike(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark/unbookmark on a project (Authenticated)")
    public ResponseEntity<ProjectResponse> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(projectService.toggleBookmark(id, currentUserId));
    }

    @PostMapping("/{id}/view")
    @Operation(summary = "Increment project view counter")
    public ResponseEntity<ProjectResponse> incrementView(@PathVariable UUID id) {
        ProjectResponse response = projectService.incrementViews(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/github")
    @Operation(summary = "Fetch real-time GitHub repository metadata")
    public ResponseEntity<GitHubRepoResponse> getGitHubMetadata(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getGitHubMetadata(id));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a project")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(projectService.getComments(id, currentUserId));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment on a project (Authenticated)")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addComment(id, request, currentUserId));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a project comment (Author or Moderator)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        projectService.deleteComment(commentId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import-github")
    @Operation(summary = "Import or synchronize project(s) directly from verified GitHub repositories")
    public ResponseEntity<Object> importFromGitHub(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        if (body != null && Boolean.TRUE.equals(body.get("syncAll"))) {
            return ResponseEntity.ok(gitHubImportService.syncAllQualifyingProjects(currentUserId));
        }
        String repo = body != null ? (String) body.get("repo") : null;
        if (repo == null && body != null) {
            repo = (String) body.get("githubUrl");
        }
        if (repo == null || repo.isBlank()) {
            return ResponseEntity.ok(gitHubImportService.syncAllQualifyingProjects(currentUserId));
        }
        return ResponseEntity.ok(gitHubImportService.importRepository(repo, currentUserId));
    }
}
