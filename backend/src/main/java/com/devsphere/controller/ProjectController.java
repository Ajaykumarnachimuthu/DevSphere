package com.devsphere.controller;

import com.devsphere.client.ProjectServiceClient;
import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.request.UpdateProjectRequest;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.exception.ServiceUnavailableException;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.GitHubImportService;
import com.devsphere.service.ProjectService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects Facade", description = "Core API Facade delegating to authoritative Project Microservice with seamless resilient fallback")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectServiceClient projectServiceClient;
    private final ProjectService internalProjectService;
    private final GitHubImportService gitHubImportService;

    public ProjectController(
            ProjectServiceClient projectServiceClient,
            ProjectService internalProjectService,
            GitHubImportService gitHubImportService
    ) {
        this.projectServiceClient = projectServiceClient;
        this.internalProjectService = internalProjectService;
        this.gitHubImportService = gitHubImportService;
    }

    @GetMapping
    @Operation(summary = "Get project showcases with category filter, search query, sorting, and pagination")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(projectServiceClient.getProjects(category, search, sort, pageable, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, falling back to direct database service: {}", e.getMessage());
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalProjectService.getProjects(category, search, sort, pageable, currentUserId));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(projectServiceClient.getProjectById(id, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, falling back to direct database service for project {}", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalProjectService.getProjectById(id, currentUserId));
        }
    }

    @PostMapping
    @Operation(summary = "Submit a new project showcase")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            ProjectResponse response = projectServiceClient.createProject(request, principal);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, creating project directly in database: {}", request.getTitle());
            UUID currentUserId = principal != null ? principal.getId() : null;
            ProjectResponse response = internalProjectService.createProject(request, currentUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing project (Owner or Admin)")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(projectServiceClient.updateProject(id, request, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, updating project {} directly in database", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalProjectService.updateProject(id, request, currentUserId));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing project (Owner or Admin)")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            projectServiceClient.deleteProject(id, principal);
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, deleting project {} directly in database", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            internalProjectService.deleteProject(id, currentUserId);
        }
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
        try {
            return ResponseEntity.ok(projectServiceClient.toggleLike(id, user));
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, toggling like on project {} directly in database", id);
            UUID currentUserId = user != null ? user.getId() : null;
            return ResponseEntity.ok(internalProjectService.toggleLike(id, currentUserId));
        }
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark/unbookmark on a project (Authenticated)")
    public ResponseEntity<ProjectResponse> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(projectServiceClient.toggleBookmark(id, principal));
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, toggling bookmark on project {} directly in database", id);
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalProjectService.toggleBookmark(id, currentUserId));
        }
    }

    @PostMapping("/{id}/view")
    @Operation(summary = "Increment project view counter")
    public ResponseEntity<ProjectResponse> incrementView(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(projectServiceClient.incrementViews(id));
        } catch (ServiceUnavailableException e) {
            log.info("Project Service microservice unreachable, incrementing view on project {} directly in database", id);
            return ResponseEntity.ok(internalProjectService.incrementViews(id));
        }
    }

    @GetMapping("/{id}/github")
    @Operation(summary = "Fetch real-time GitHub repository metadata")
    public ResponseEntity<GitHubRepoResponse> getGitHubMetadata(@PathVariable UUID id) {
        try {
            GitHubRepoResponse res = projectServiceClient.getGitHubMetadata(id);
            return res != null ? ResponseEntity.ok(res) : ResponseEntity.notFound().build();
        } catch (ServiceUnavailableException e) {
            GitHubRepoResponse res = internalProjectService.getGitHubMetadata(id);
            return res != null ? ResponseEntity.ok(res) : ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a project")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(projectServiceClient.getComments(id, principal));
        } catch (ServiceUnavailableException e) {
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.ok(internalProjectService.getComments(id, currentUserId));
        }
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment on a project (Authenticated)")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(projectServiceClient.addComment(id, request, principal));
        } catch (ServiceUnavailableException e) {
            UUID currentUserId = principal != null ? principal.getId() : null;
            return ResponseEntity.status(HttpStatus.CREATED).body(internalProjectService.addComment(id, request, currentUserId));
        }
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a project comment (Author or Moderator)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            projectServiceClient.deleteComment(commentId, principal);
        } catch (ServiceUnavailableException e) {
            UUID currentUserId = principal != null ? principal.getId() : null;
            internalProjectService.deleteComment(commentId, currentUserId);
        }
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
