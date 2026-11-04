package com.devsphere.service.impl;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.request.UpdateProjectRequest;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.entity.Project;
import com.devsphere.entity.ProjectBookmark;
import com.devsphere.entity.ProjectComment;
import com.devsphere.entity.ProjectLike;
import com.devsphere.entity.Role;
import com.devsphere.entity.User;
import com.devsphere.exception.ForbiddenException;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.exception.UnauthorizedException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.ProjectBookmarkRepository;
import com.devsphere.repository.ProjectCommentRepository;
import com.devsphere.repository.ProjectLikeRepository;
import com.devsphere.repository.ProjectRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.service.GitHubService;
import com.devsphere.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectLikeRepository projectLikeRepository;
    private final ProjectBookmarkRepository projectBookmarkRepository;
    private final ProjectCommentRepository projectCommentRepository;
    private final UserRepository userRepository;
    private final GitHubService gitHubService;
    private final EntityDtoMapper mapper;

    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            ProjectLikeRepository projectLikeRepository,
            ProjectBookmarkRepository projectBookmarkRepository,
            ProjectCommentRepository projectCommentRepository,
            UserRepository userRepository,
            GitHubService gitHubService,
            EntityDtoMapper mapper
    ) {
        this.projectRepository = projectRepository;
        this.projectLikeRepository = projectLikeRepository;
        this.projectBookmarkRepository = projectBookmarkRepository;
        this.projectCommentRepository = projectCommentRepository;
        this.userRepository = userRepository;
        this.gitHubService = gitHubService;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getProjects(String category, String query, String sort, Pageable pageable, UUID currentUserId) {
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null) {
            if ("Most Liked".equalsIgnoreCase(sort) || "likes".equalsIgnoreCase(sort)) {
                sortOrder = Sort.by(Sort.Direction.DESC, "likes");
            } else if ("Most Viewed".equalsIgnoreCase(sort) || "views".equalsIgnoreCase(sort)) {
                sortOrder = Sort.by(Sort.Direction.DESC, "views");
            }
        }

        Pageable effectivePageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortOrder);
        Page<Project> page = projectRepository.searchProjects(category, query, effectivePageable);

        List<ProjectResponse> content = page.getContent().stream()
                .map(project -> {
                    boolean isLiked = false;
                    boolean isBookmarked = false;
                    boolean isOwner = false;
                    if (currentUserId != null) {
                        isLiked = projectLikeRepository.existsByProjectIdAndUserId(project.getId(), currentUserId);
                        isBookmarked = projectBookmarkRepository.existsByProjectIdAndUserId(project.getId(), currentUserId);
                        isOwner = project.getAuthor() != null && currentUserId.equals(project.getAuthor().getId());
                    }
                    return mapper.toProjectResponse(project, isLiked, isBookmarked, isOwner);
                })
                .toList();

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id, UUID currentUserId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        boolean isLiked = false;
        boolean isBookmarked = false;
        boolean isOwner = false;
        if (currentUserId != null) {
            isLiked = projectLikeRepository.existsByProjectIdAndUserId(project.getId(), currentUserId);
            isBookmarked = projectBookmarkRepository.existsByProjectIdAndUserId(project.getId(), currentUserId);
            isOwner = project.getAuthor() != null && currentUserId.equals(project.getAuthor().getId());
        }

        ProjectResponse response = mapper.toProjectResponse(project, isLiked, isBookmarked, isOwner);

        // Enrich with real-time GitHub repository metadata if URL is configured
        if (project.getGithubUrl() != null && !project.getGithubUrl().trim().isEmpty()) {
            try {
                GitHubRepoResponse repoMeta = gitHubService.getRepoDetails(project.getGithubUrl());
                response.setGithubMetadata(repoMeta);
            } catch (Exception ignored) {
                // Non-blocking degradation
            }
        }

        return response;
    }

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to create a project");
        }
        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String authorName = author.getUsername();

        List<String> technologies = request.getTechnologies() != null ? new ArrayList<>(request.getTechnologies()) : new ArrayList<>();

        Project project = new Project(
                request.getTitle().trim(),
                request.getCategory().trim(),
                request.getDescription().trim(),
                authorName,
                technologies,
                0,
                0
        );
        project.setAuthor(author);

        if (request.getTagline() != null && !request.getTagline().trim().isEmpty()) {
            project.setTagline(request.getTagline().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            project.setStatus(request.getStatus().trim());
        }
        if (request.getLiveDemoUrl() != null && !request.getLiveDemoUrl().trim().isEmpty()) {
            project.setLiveDemoUrl(request.getLiveDemoUrl().trim());
        }
        if (request.getGithubUrl() != null && !request.getGithubUrl().trim().isEmpty()) {
            project.setGithubUrl(request.getGithubUrl().trim());
        }
        if (request.getCoverImage() != null && !request.getCoverImage().trim().isEmpty()) {
            project.setCoverImage(request.getCoverImage().trim());
        }
        if (request.getProblemStatement() != null && !request.getProblemStatement().trim().isEmpty()) {
            project.setProblemStatement(request.getProblemStatement().trim());
        }
        if (request.getProposedSolution() != null && !request.getProposedSolution().trim().isEmpty()) {
            project.setProposedSolution(request.getProposedSolution().trim());
        }
        if (request.getArchitectureSummary() != null && !request.getArchitectureSummary().trim().isEmpty()) {
            project.setArchitectureSummary(request.getArchitectureSummary().trim());
        }
        if (request.getKeyFeatures() != null && !request.getKeyFeatures().trim().isEmpty()) {
            project.setKeyFeatures(request.getKeyFeatures().trim());
        }
        if (request.getQuickstartCmd() != null && !request.getQuickstartCmd().trim().isEmpty()) {
            project.setQuickstartCmd(request.getQuickstartCmd().trim());
        }
        if (request.getVideoDemoUrl() != null && !request.getVideoDemoUrl().trim().isEmpty()) {
            project.setVideoDemoUrl(request.getVideoDemoUrl().trim());
        }

        Project saved = projectRepository.save(project);
        return mapper.toProjectResponse(saved, false, false, true);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to update a project");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAuthor = project.getAuthor() != null && project.getAuthor().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("You do not have permission to modify this project");
        }

        project.setTitle(request.getTitle().trim());
        if (request.getTagline() != null) project.setTagline(request.getTagline().trim());
        project.setCategory(request.getCategory().trim());
        project.setDescription(request.getDescription().trim());
        if (request.getTechnologies() != null) {
            project.setTechnologies(new ArrayList<>(request.getTechnologies()));
        }
        if (request.getStatus() != null) project.setStatus(request.getStatus().trim());
        if (request.getCoverImage() != null) project.setCoverImage(request.getCoverImage().trim());
        if (request.getLiveDemoUrl() != null) project.setLiveDemoUrl(request.getLiveDemoUrl().trim());
        if (request.getGithubUrl() != null) project.setGithubUrl(request.getGithubUrl().trim());
        if (request.getDocumentation() != null) project.setDocumentation(request.getDocumentation().trim());
        if (request.getProblemStatement() != null) project.setProblemStatement(request.getProblemStatement().trim());
        if (request.getProposedSolution() != null) project.setProposedSolution(request.getProposedSolution().trim());
        if (request.getArchitectureSummary() != null) project.setArchitectureSummary(request.getArchitectureSummary().trim());
        if (request.getKeyFeatures() != null) project.setKeyFeatures(request.getKeyFeatures().trim());
        if (request.getQuickstartCmd() != null) project.setQuickstartCmd(request.getQuickstartCmd().trim());
        if (request.getVideoDemoUrl() != null) project.setVideoDemoUrl(request.getVideoDemoUrl().trim());

        Project updated = projectRepository.save(project);
        boolean isLiked = projectLikeRepository.existsByProjectIdAndUserId(id, currentUserId);
        boolean isBookmarked = projectBookmarkRepository.existsByProjectIdAndUserId(id, currentUserId);

        return mapper.toProjectResponse(updated, isLiked, isBookmarked, true);
    }

    @Override
    @Transactional
    public void deleteProject(UUID id, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to delete a project");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAuthor = project.getAuthor() != null && project.getAuthor().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("You do not have permission to delete this project");
        }

        projectRepository.delete(project);
    }

    @Override
    @Transactional
    public ProjectResponse toggleLike(UUID projectId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to like a project");
        }

        Project project = projectRepository.findByIdWithLock(projectId)
                .or(() -> projectRepository.findById(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<ProjectLike> existingLike = projectLikeRepository.findByProjectIdAndUserId(projectId, currentUserId);
        boolean liked;

        if (existingLike.isPresent()) {
            projectLikeRepository.delete(existingLike.get());
            liked = false;
        } else {
            try {
                ProjectLike like = new ProjectLike(project, user);
                projectLikeRepository.save(like);
                liked = true;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                liked = true;
            }
        }

        projectRepository.synchronizeLikeCount(projectId);
        Project updated = projectRepository.findById(projectId).orElse(project);

        if (updated.getLikes() == project.getLikes()) {
            int expectedLikes = liked ? project.getLikes() + 1 : Math.max(0, project.getLikes() - 1);
            updated.setLikes(expectedLikes);
        }

        boolean isBookmarked = projectBookmarkRepository.existsByProjectIdAndUserId(projectId, currentUserId);
        boolean isOwner = updated.getAuthor() != null && currentUserId.equals(updated.getAuthor().getId());

        return mapper.toProjectResponse(updated, liked, isBookmarked, isOwner);
    }

    @Override
    @Transactional
    public ProjectResponse toggleBookmark(UUID projectId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to bookmark a project");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<ProjectBookmark> existing = projectBookmarkRepository.findByProjectIdAndUserId(projectId, currentUserId);
        boolean bookmarked;

        if (existing.isPresent()) {
            projectBookmarkRepository.delete(existing.get());
            bookmarked = false;
        } else {
            try {
                ProjectBookmark bookmark = new ProjectBookmark(project, user);
                projectBookmarkRepository.save(bookmark);
                bookmarked = true;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                bookmarked = true;
            }
        }

        int totalBookmarks = (int) projectBookmarkRepository.countByProjectId(projectId);
        project.setBookmarks(totalBookmarks);
        Project updated = projectRepository.save(project);

        boolean isLiked = projectLikeRepository.existsByProjectIdAndUserId(projectId, currentUserId);
        boolean isOwner = updated.getAuthor() != null && currentUserId.equals(updated.getAuthor().getId());

        return mapper.toProjectResponse(updated, isLiked, bookmarked, isOwner);
    }

    @Override
    @Transactional
    public ProjectResponse incrementViews(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        project.setViews(project.getViews() + 1);
        Project saved = projectRepository.saveAndFlush(project);
        return mapper.toProjectResponse(saved, false, false, false);
    }

    @Override
    @Transactional(readOnly = true)
    public GitHubRepoResponse getGitHubMetadata(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (project.getGithubUrl() == null || project.getGithubUrl().trim().isEmpty()) {
            return null;
        }

        return gitHubService.getRepoDetails(project.getGithubUrl());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID projectId, UUID currentUserId) {
        List<ProjectComment> comments = projectCommentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return comments.stream().map(c -> {
            boolean isOwner = currentUserId != null && c.getUser() != null && currentUserId.equals(c.getUser().getId());
            UUID parentId = c.getParent() != null ? c.getParent().getId() : null;
            return new CommentResponse(c.getId(), c.getAuthorName(), c.getContent(), parentId, c.getCreatedAt(), isOwner);
        }).toList();
    }

    @Override
    @Transactional
    public CommentResponse addComment(UUID projectId, CommentRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to post comments");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        ProjectComment parent = null;
        if (request.getParentId() != null) {
            parent = projectCommentRepository.findById(request.getParentId()).orElse(null);
        }

        ProjectComment comment = new ProjectComment(project, user, user.getUsername(), request.getContent().trim(), parent);
        ProjectComment saved = projectCommentRepository.save(comment);

        return new CommentResponse(saved.getId(), saved.getAuthorName(), saved.getContent(), request.getParentId(), saved.getCreatedAt(), true);
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to delete comments");
        }
        ProjectComment comment = projectCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!comment.getUser().getId().equals(currentUserId) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You cannot delete another user's comment");
        }

        projectCommentRepository.delete(comment);
    }
}
