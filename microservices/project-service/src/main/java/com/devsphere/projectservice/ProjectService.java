package com.devsphere.projectservice;

import com.devsphere.projectservice.dto.*;
import com.devsphere.projectservice.entity.*;
import com.devsphere.projectservice.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectLikeRepository projectLikeRepository;
    private final ProjectBookmarkRepository projectBookmarkRepository;
    private final ProjectCommentRepository projectCommentRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectLikeRepository projectLikeRepository,
            ProjectBookmarkRepository projectBookmarkRepository,
            ProjectCommentRepository projectCommentRepository
    ) {
        this.projectRepository = projectRepository;
        this.projectLikeRepository = projectLikeRepository;
        this.projectBookmarkRepository = projectBookmarkRepository;
        this.projectCommentRepository = projectCommentRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getProjects(String category, String query, String sort, int page, int size, UUID currentUserId) {
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null) {
            if ("Most Liked".equalsIgnoreCase(sort) || "likes".equalsIgnoreCase(sort)) {
                sortOrder = Sort.by(Sort.Direction.DESC, "likes");
            } else if ("Most Viewed".equalsIgnoreCase(sort) || "views".equalsIgnoreCase(sort)) {
                sortOrder = Sort.by(Sort.Direction.DESC, "views");
            }
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);
        String cleanCategory = (category != null && !category.equalsIgnoreCase("All") && !category.isBlank()) ? category.trim() : null;
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;

        Page<Project> projectPage = projectRepository.searchProjects(cleanCategory, cleanQuery, pageable);

        List<ProjectResponse> responses = projectPage.getContent().stream()
                .map(p -> mapToResponse(p, currentUserId))
                .toList();

        return new PagedResponse<>(
                responses,
                projectPage.getNumber(),
                projectPage.getSize(),
                projectPage.getTotalElements(),
                projectPage.getTotalPages(),
                projectPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public Optional<ProjectResponse> getProjectById(UUID id, UUID currentUserId) {
        return projectRepository.findById(id).map(p -> mapToResponse(p, currentUserId));
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, UUID authorId, String authorName) {
        if (authorId == null) {
            throw new SecurityException("Authentication required to create a project");
        }

        List<String> techList = request.getTechnologies() != null ? new ArrayList<>(request.getTechnologies()) : new ArrayList<>();

        Project project = new Project(
                request.getTitle().trim(),
                request.getCategory().trim(),
                request.getDescription().trim(),
                authorName != null ? authorName : "Developer",
                techList,
                0,
                0
        );
        project.setAuthorId(authorId);

        if (request.getTagline() != null) project.setTagline(request.getTagline().trim());
        if (request.getStatus() != null) project.setStatus(request.getStatus().trim());
        if (request.getLiveDemoUrl() != null) project.setLiveDemoUrl(request.getLiveDemoUrl().trim());
        if (request.getGithubUrl() != null) project.setGithubUrl(request.getGithubUrl().trim());
        if (request.getCoverImage() != null) project.setCoverImage(request.getCoverImage().trim());
        if (request.getProblemStatement() != null) project.setProblemStatement(request.getProblemStatement().trim());
        if (request.getProposedSolution() != null) project.setProposedSolution(request.getProposedSolution().trim());
        if (request.getArchitectureSummary() != null) project.setArchitectureSummary(request.getArchitectureSummary().trim());
        if (request.getKeyFeatures() != null) project.setKeyFeatures(request.getKeyFeatures().trim());
        if (request.getQuickstartCmd() != null) project.setQuickstartCmd(request.getQuickstartCmd().trim());
        if (request.getVideoDemoUrl() != null) project.setVideoDemoUrl(request.getVideoDemoUrl().trim());

        Project saved = projectRepository.save(project);
        return mapToResponse(saved, authorId);
    }

    @Transactional
    public Optional<ProjectResponse> updateProject(UUID id, UpdateProjectRequest request, UUID currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to update project");
        }

        return projectRepository.findById(id).map(existing -> {
            boolean isAuthor = existing.getAuthorId() != null && existing.getAuthorId().equals(currentUserId);
            if (!isAuthor && !isAdmin) {
                throw new SecurityException("You do not have permission to modify this project");
            }

            existing.setTitle(request.getTitle().trim());
            existing.setCategory(request.getCategory().trim());
            existing.setDescription(request.getDescription().trim());
            if (request.getTagline() != null) existing.setTagline(request.getTagline().trim());
            if (request.getTechnologies() != null) existing.setTechnologies(new ArrayList<>(request.getTechnologies()));
            if (request.getStatus() != null) existing.setStatus(request.getStatus().trim());
            if (request.getCoverImage() != null) existing.setCoverImage(request.getCoverImage().trim());
            if (request.getLiveDemoUrl() != null) existing.setLiveDemoUrl(request.getLiveDemoUrl().trim());
            if (request.getGithubUrl() != null) existing.setGithubUrl(request.getGithubUrl().trim());
            if (request.getDocumentation() != null) existing.setDocumentation(request.getDocumentation().trim());
            if (request.getProblemStatement() != null) existing.setProblemStatement(request.getProblemStatement().trim());
            if (request.getProposedSolution() != null) existing.setProposedSolution(request.getProposedSolution().trim());
            if (request.getArchitectureSummary() != null) existing.setArchitectureSummary(request.getArchitectureSummary().trim());
            if (request.getKeyFeatures() != null) existing.setKeyFeatures(request.getKeyFeatures().trim());
            if (request.getQuickstartCmd() != null) existing.setQuickstartCmd(request.getQuickstartCmd().trim());
            if (request.getVideoDemoUrl() != null) existing.setVideoDemoUrl(request.getVideoDemoUrl().trim());

            Project saved = projectRepository.save(existing);
            return mapToResponse(saved, currentUserId);
        });
    }

    @Transactional
    public boolean deleteProject(UUID id, UUID currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to delete project");
        }

        return projectRepository.findById(id).map(existing -> {
            boolean isAuthor = existing.getAuthorId() != null && existing.getAuthorId().equals(currentUserId);
            if (!isAuthor && !isAdmin) {
                throw new SecurityException("You do not have permission to delete this project");
            }
            projectRepository.delete(existing);
            return true;
        }).orElse(false);
    }

    @Transactional
    public ProjectResponse toggleLike(UUID projectId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to like a project");
        }

        Project project = projectRepository.findByIdWithLock(projectId)
                .or(() -> projectRepository.findById(projectId))
                .orElseThrow(() -> new NoSuchElementException("Project not found with id: " + projectId));

        Optional<ProjectLike> existingLike = projectLikeRepository.findByProjectIdAndUserId(projectId, currentUserId);
        boolean isLiked;
        if (existingLike.isPresent()) {
            projectLikeRepository.delete(existingLike.get());
            projectLikeRepository.flush();
            isLiked = false;
        } else {
            projectLikeRepository.saveAndFlush(new ProjectLike(projectId, currentUserId));
            isLiked = true;
        }

        int count = (int) projectLikeRepository.countByProjectId(projectId);
        project.setLikes(count);
        Project saved = projectRepository.saveAndFlush(project);

        ProjectResponse response = mapToResponse(saved, currentUserId);
        response.setLiked(isLiked);
        response.setLikes(count);
        return response;
    }

    @Transactional
    public ProjectResponse toggleBookmark(UUID projectId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to bookmark a project");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with id: " + projectId));

        Optional<ProjectBookmark> existing = projectBookmarkRepository.findByProjectIdAndUserId(projectId, currentUserId);
        boolean isBookmarked;
        if (existing.isPresent()) {
            projectBookmarkRepository.delete(existing.get());
            projectBookmarkRepository.flush();
            isBookmarked = false;
        } else {
            projectBookmarkRepository.saveAndFlush(new ProjectBookmark(projectId, currentUserId));
            isBookmarked = true;
        }

        int count = (int) projectBookmarkRepository.countByProjectId(projectId);
        project.setBookmarks(count);
        Project saved = projectRepository.saveAndFlush(project);

        ProjectResponse response = mapToResponse(saved, currentUserId);
        response.setBookmarked(isBookmarked);
        response.setBookmarks(count);
        return response;
    }

    @Transactional
    public ProjectResponse incrementViews(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with id: " + projectId));
        project.setViews(project.getViews() + 1);
        Project saved = projectRepository.saveAndFlush(project);
        return mapToResponse(saved, null);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID projectId, UUID currentUserId) {
        return projectCommentRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .map(c -> {
                    CommentResponse r = new CommentResponse();
                    r.setId(c.getId());
                    r.setProjectId(c.getProjectId());
                    r.setUserId(c.getUserId());
                    r.setAuthorName(c.getAuthorName());
                    r.setContent(c.getContent());
                    r.setParentId(c.getParentId());
                    r.setOwner(currentUserId != null && currentUserId.equals(c.getUserId()));
                    r.setCreatedAt(c.getCreatedAt());
                    r.setUpdatedAt(c.getUpdatedAt());
                    return r;
                }).toList();
    }

    @Transactional
    public CommentResponse addComment(UUID projectId, CommentRequest request, UUID currentUserId, String authorName) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to add a comment");
        }
        if (!projectRepository.existsById(projectId)) {
            throw new NoSuchElementException("Project not found with id: " + projectId);
        }

        ProjectComment comment = new ProjectComment(
                projectId,
                currentUserId,
                authorName != null ? authorName : "Developer",
                request.getContent().trim(),
                request.getParentId()
        );
        ProjectComment saved = projectCommentRepository.save(comment);

        CommentResponse r = new CommentResponse();
        r.setId(saved.getId());
        r.setProjectId(saved.getProjectId());
        r.setUserId(saved.getUserId());
        r.setAuthorName(saved.getAuthorName());
        r.setContent(saved.getContent());
        r.setParentId(saved.getParentId());
        r.setOwner(true);
        r.setCreatedAt(saved.getCreatedAt());
        r.setUpdatedAt(saved.getUpdatedAt());
        return r;
    }

    @Transactional
    public boolean deleteComment(UUID commentId, UUID currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to delete comment");
        }
        return projectCommentRepository.findById(commentId).map(c -> {
            boolean isOwner = c.getUserId().equals(currentUserId);
            if (!isOwner && !isAdmin) {
                throw new SecurityException("You do not have permission to delete this comment");
            }
            projectCommentRepository.delete(c);
            return true;
        }).orElse(false);
    }

    public GitHubRepoResponse getGitHubMetadata(UUID projectId) {
        return projectRepository.findById(projectId).map(p -> {
            if (p.getGithubUrl() == null || p.getGithubUrl().isBlank()) {
                return null;
            }
            GitHubRepoResponse r = new GitHubRepoResponse();
            r.setHtmlUrl(p.getGithubUrl());
            r.setName(p.getTitle());
            r.setDescription(p.getDescription());
            r.setPrimaryLanguage(p.getTechnologies().isEmpty() ? "Code" : p.getTechnologies().get(0));
            r.setTopics(p.getTechnologies());
            r.setStars(p.getLikes());
            r.setForks(Math.max(1, p.getLikes() / 4));
            r.setDefaultBranch("main");
            return r;
        }).orElse(null);
    }

    private ProjectResponse mapToResponse(Project p, UUID currentUserId) {
        ProjectResponse r = new ProjectResponse();
        r.setId(p.getId());
        r.setAuthorId(p.getAuthorId());
        r.setAuthorName(p.getAuthorName());
        r.setAuthor(p.getAuthorName());
        r.setTitle(p.getTitle());
        r.setTagline(p.getTagline());
        r.setCoverImage(p.getCoverImage());
        r.setCategory(p.getCategory());
        r.setDescription(p.getDescription());
        r.setStatus(p.getStatus());
        r.setLiveDemoUrl(p.getLiveDemoUrl());
        r.setGithubUrl(p.getGithubUrl());
        r.setDocumentation(p.getDocumentation());
        r.setProblemStatement(p.getProblemStatement());
        r.setProposedSolution(p.getProposedSolution());
        r.setArchitectureSummary(p.getArchitectureSummary());
        r.setKeyFeatures(p.getKeyFeatures());
        r.setQuickstartCmd(p.getQuickstartCmd());
        r.setVideoDemoUrl(p.getVideoDemoUrl());
        r.setLikes(p.getLikes());
        r.setViews(p.getViews());
        r.setBookmarks(p.getBookmarks());
        r.setTechnologies(p.getTechnologies());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());

        if (currentUserId != null) {
            r.setLiked(projectLikeRepository.existsByProjectIdAndUserId(p.getId(), currentUserId));
            r.setBookmarked(projectBookmarkRepository.existsByProjectIdAndUserId(p.getId(), currentUserId));
            r.setOwner(p.getAuthorId() != null && currentUserId.equals(p.getAuthorId()));
        } else {
            r.setLiked(false);
            r.setBookmarked(false);
            r.setOwner(false);
        }
        return r;
    }
}
