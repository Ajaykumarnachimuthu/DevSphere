package com.devsphere.client;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.KnowledgeTrailResponse;
import com.devsphere.dto.response.PagedResponse;
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
public class BlogServiceClient {

    private static final Logger log = LoggerFactory.getLogger(BlogServiceClient.class);

    private final RestClient restClient;
    private final InternalTokenService internalTokenService;

    public BlogServiceClient(
            @Value("${devsphere.services.blog.base-url:http://localhost:8081}") String baseUrl,
            @Value("${devsphere.services.blog.timeout-ms:5000}") int timeoutMs,
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

        log.info("Initialized BlogServiceClient connecting to: {}", baseUrl);
    }

    private HttpHeaders buildHeaders(UserPrincipal principal) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", UUID.randomUUID().toString());
        if (principal != null) {
            String token = internalTokenService.generateToken(principal, "blog-service");
            if (token != null) {
                headers.set("X-Internal-Token", token);
            }
        }
        return headers;
    }

    public PagedResponse<BlogResponse> getBlogs(String category, String search, Pageable pageable,
            UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/blogs")
                            .queryParam("category", category)
                            .queryParam("search", search)
                            .queryParam("page", pageable.getPageNumber())
                            .queryParam("size", pageable.getPageSize())
                            .build())
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(new ParameterizedTypeReference<PagedResponse<BlogResponse>>() {
                    });
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException(
                    "Blog Service (Port 8081) is currently unreachable. Project discovery, developer profiles, and authentication remain operational.",
                    e);
        }
    }

    public BlogResponse getBlogById(UUID id, UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri("/api/v1/blogs/{id}", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(BlogResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public BlogResponse createBlog(CreateBlogRequest request, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/blogs")
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(BlogResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException(
                    "Blog Service (Port 8081) is currently unreachable. Draft/article creation aborted.", e);
        }
    }

    public List<BlogResponse> getDrafts(UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri("/api/v1/blogs/drafts")
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(new ParameterizedTypeReference<List<BlogResponse>>() {
                    });
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UserPrincipal principal) {
        try {
            return restClient.put()
                    .uri("/api/v1/blogs/{id}", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(BlogResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public void deleteBlog(UUID id, UserPrincipal principal) {
        try {
            restClient.delete()
                    .uri("/api/v1/blogs/{id}", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .toBodilessEntity();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public BlogResponse toggleLike(UUID id, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/blogs/{id}/like", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(BlogResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public BlogResponse toggleBookmark(UUID id, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/blogs/{id}/bookmark", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(BlogResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public List<CommentResponse> getComments(UUID id, UserPrincipal principal) {
        try {
            return restClient.get()
                    .uri("/api/v1/blogs/{id}/comments", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(new ParameterizedTypeReference<List<CommentResponse>>() {
                    });
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public CommentResponse addComment(UUID id, CommentRequest request, UserPrincipal principal) {
        try {
            return restClient.post()
                    .uri("/api/v1/blogs/{id}/comments", id)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(CommentResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public void deleteComment(UUID commentId, UserPrincipal principal) {
        try {
            restClient.delete()
                    .uri("/api/v1/blogs/comments/{commentId}", commentId)
                    .headers(h -> h.addAll(buildHeaders(principal)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .toBodilessEntity();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public List<KnowledgeTrailResponse> getKnowledgeTrails() {
        try {
            return restClient.get()
                    .uri("/api/v1/blogs/trails")
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(new ParameterizedTypeReference<List<KnowledgeTrailResponse>>() {
                    });
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    public KnowledgeTrailResponse getKnowledgeTrailById(UUID id) {
        try {
            return restClient.get()
                    .uri("/api/v1/blogs/trails/{id}", id)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode()))
                    .body(KnowledgeTrailResponse.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("Blog Service (Port 8081) is currently unreachable.", e);
        }
    }

    private void handleHttpError(HttpStatusCode status) {
        if (status.value() == 404) {
            throw new ResourceNotFoundException("Requested resource was not found on Blog Service");
        } else if (status.value() == 401) {
            throw new UnauthorizedException("Authentication assertion was missing or rejected by Blog Service");
        } else if (status.value() == 403) {
            throw new ForbiddenException("Operation not permitted on Blog Service");
        } else if (status.value() == 400) {
            throw new BadRequestException("Blog Service rejected the request parameters");
        } else if (status.is5xxServerError()) {
            throw new ServiceUnavailableException(
                    "Blog Service encountered an internal fault (HTTP " + status.value() + ")");
        }
    }
}
