package com.devsphere.controller;

import com.devsphere.client.ProjectServiceClient;
import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.request.UpdateProjectRequest;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.GitHubImportService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects Facade", description = "Core API Facade delegating to authoritative Project Microservice (Port 8082)")
public class ProjectController {

    private final ProjectServiceClient projectServiceClient;
    private final GitHubImportService gitHubImportService;

    public ProjectController(ProjectServiceClient projectServiceClient, GitHubImportService gitHubImportService) {
        this.projectServiceClient = projectServiceClient;
        this.gitHubImportService = gitHubImportService;
    }

    @GetMapping
    @Operation(summary = "Get project showcases with category filter, search query, sorting, and pagination (Delegated to Project Service)")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(projectServiceClient.getProjects(category, search, sort, pageable, principal));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID (Delegated to Project Service)")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(projectServiceClient.getProjectById(id, principal));
    }

    @PostMapping
    @Operation(summary = "Submit a new project showcase (Authenticated Facade)")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ProjectResponse response = projectServiceClient.createProject(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing project (Owner or Admin)")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(projectServiceClient.updateProject(id, request, principal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing project (Owner or Admin)")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectServiceClient.deleteProject(id, principal);
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
        return ResponseEntity.ok(projectServiceClient.toggleLike(id, user));
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark/unbookmark on a project (Authenticated)")
    public ResponseEntity<ProjectResponse> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(projectServiceClient.toggleBookmark(id, principal));
    }

    @PostMapping("/{id}/view")
    @Operation(summary = "Increment project view counter (Delegated to Project Service)")
    public ResponseEntity<ProjectResponse> incrementView(@PathVariable UUID id) {
        return ResponseEntity.ok(projectServiceClient.incrementViews(id));
    }

    @GetMapping("/{id}/github")
    @Operation(summary = "Fetch real-time GitHub repository metadata")
    public ResponseEntity<GitHubRepoResponse> getGitHubMetadata(@PathVariable UUID id) {
        GitHubRepoResponse res = projectServiceClient.getGitHubMetadata(id);
        return res != null ? ResponseEntity.ok(res) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a project")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(projectServiceClient.getComments(id, principal));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment on a project (Authenticated)")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectServiceClient.addComment(id, request, principal));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a project comment (Author or Moderator)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectServiceClient.deleteComment(commentId, principal);
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
