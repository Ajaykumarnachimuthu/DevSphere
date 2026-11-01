package com.devsphere.service;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.request.UpdateProjectRequest;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProjectService {

    PagedResponse<ProjectResponse> getProjects(String category, String query, String sort, Pageable pageable, UUID currentUserId);

    ProjectResponse getProjectById(UUID id, UUID currentUserId);

    ProjectResponse createProject(CreateProjectRequest request, UUID currentUserId);

    ProjectResponse updateProject(UUID id, UpdateProjectRequest request, UUID currentUserId);

    void deleteProject(UUID id, UUID currentUserId);

    ProjectResponse toggleLike(UUID projectId, UUID currentUserId);

    ProjectResponse toggleBookmark(UUID projectId, UUID currentUserId);

    ProjectResponse incrementViews(UUID projectId);

    GitHubRepoResponse getGitHubMetadata(UUID projectId);

    List<CommentResponse> getComments(UUID projectId, UUID currentUserId);

    CommentResponse addComment(UUID projectId, CommentRequest request, UUID currentUserId);

    void deleteComment(UUID commentId, UUID currentUserId);
}
