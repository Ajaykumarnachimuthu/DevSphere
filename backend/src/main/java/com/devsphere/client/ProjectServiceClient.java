package com.devsphere.client;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.request.UpdateProjectRequest;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.exception.*;
import com.devsphere.security.InternalTokenService;
import com.devsphere.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Component
public class ProjectServiceClient {

    private static final Logger log = LoggerFactory.getLogger(ProjectServiceClient.class);

    private final RestClient restClient;
    private final InternalTokenService internalTokenService;

    public ProjectServiceClient(
            @Value("${devsphere.services.project.base-url:http://localhost:8082}") String baseUrl,
            @Value("${devsphere.services.project.timeout-ms:5000}") int timeoutMs,
            InternalTokenService internalTokenService) {
        this.internalTokenService = internalTokenService;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        log.info("Initialized ProjectServiceClient connecting to: {}", baseUrl);
    }

    private HttpHeaders buildHeaders(UserPrincipal principal) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", UUID.randomUUID().toString());
        if (principal != null) {
            String token = internalTokenService.generateToken(principal, "project-service");
            if (token != null) {
                headers.set("X-Internal-Token", token);
            }
        }
        return headers;
    }

    public PagedResponse<ProjectResponse> getProjects(String category, String search, String sort, Pageable pageable,
            UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/projects")
                            .queryParam("category", category)
                            .queryParam("search", search)
                            .queryParam("sort", sort)
                            .queryParam("page", pageable.getPageNumber())
                            .queryParam("size", pageable.getPageSize())
                            .build())
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(new ParameterizedTypeReference<PagedResponse<ProjectResponse>>() {
                    });
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException(
                    "Project Service (Port 8082) is currently unreachable. Technical blogs, developer profiles, and authentication remain operational.",
                    e);
        }
    }

    public ProjectResponse getProjectById(UUID id, UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri("/api/v1/projects/{id}", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(ProjectResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public ProjectResponse createProject(CreateProjectRequest request, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/projects")
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(ProjectResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException(
                    "Project Service (Port 8082) is currently unreachable. Project showcase creation aborted.", e);
        }
    }

    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request, UserPrincipal principal) {
        try {
            return restClient.put()
                    .uri("/api/v1/projects/{id}", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(ProjectResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public void deleteProject(UUID id, UserPrincipal principal) {
        try {
            restClient.delete()
                    .uri("/api/v1/projects/{id}", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .toBodilessEntity();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public ProjectResponse toggleLike(UUID id, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/projects/{id}/like", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(ProjectResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public ProjectResponse toggleBookmark(UUID id, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/projects/{id}/bookmark", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(ProjectResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public ProjectResponse incrementViews(UUID id) {
        try {
            return restClient.post()
                    .uri("/api/v1/projects/{id}/view", id)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(ProjectResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public GitHubRepoResponse getGitHubMetadata(UUID id) {
        try {
            return restClient.get()
                    .uri("/api/v1/projects/{id}/github", id)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(GitHubRepoResponse.class);
        } catch (ResourceAccessException e) {
            return null; // Graceful degradation for external metadata
        }
    }

    public List<CommentResponse> getComments(UUID id, UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri("/api/v1/projects/{id}/comments", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(new ParameterizedTypeReference<List<CommentResponse>>() {
                    });
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public CommentResponse addComment(UUID id, CommentRequest request, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/projects/{id}/comments", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(CommentResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    public void deleteComment(UUID commentId, UserPrincipal principal) {
        try {
            restClient.delete()
                    .uri("/api/v1/projects/comments/{commentId}", commentId)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .toBodilessEntity();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Project Service (Port 8082) is currently unreachable.", e);
        }
    }

    private void handleHttpError(HttpStatusCode status) {
        if (status.value() == 404) {
            throw new ResourceNotFoundException("Requested resource was not found on Project Service");
        } else if (status.value() == 401) {
            throw new UnauthorizedException("Authentication assertion was missing or rejected by Project Service");
        } else if (status.value() == 403) {
            throw new ForbiddenException("Operation not permitted on Project Service");
        } else if (status.value() == 400) {
            throw new BadRequestException("Project Service rejected the request parameters");
        } else if (status.is5xxServerError()) {
            throw new ServiceUnavailableException(
                    "Project Service encountered an internal fault (HTTP " + status.value() + ")");
        }
    }
}
