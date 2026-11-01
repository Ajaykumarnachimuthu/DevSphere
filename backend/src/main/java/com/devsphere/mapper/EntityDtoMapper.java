package com.devsphere.mapper;

import com.devsphere.dto.response.*;
import com.devsphere.entity.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class EntityDtoMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    public DeveloperResponse toDeveloperResponse(DeveloperProfile dev, int projectsCount, int blogsCount, int connectionsCount, boolean isConnected) {
        if (dev == null) return null;
        return new DeveloperResponse(
                dev.getId(),
                dev.getName(),
                dev.getRole(),
                dev.getDescription(),
                dev.getLocation(),
                dev.getAvatar(),
                dev.getSkills(),
                projectsCount,
                blogsCount,
                connectionsCount,
                isConnected
        );
    }

    public BlogResponse toBlogResponse(Blog blog, UUID currentUserId) {
        if (blog == null) return null;
        boolean isOwner = currentUserId != null && blog.getAuthor() != null && currentUserId.equals(blog.getAuthor().getId());
        BlogResponse res = new BlogResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getCategory(),
                blog.getContent(),
                blog.getAuthorName(),
                blog.getReadTime(),
                blog.getTech(),
                blog.getTags(),
                blog.getStatus(),
                blog.getCreatedAt(),
                isOwner
        );
        res.setSubtitle(blog.getSubtitle());
        res.setCoverImage(blog.getCoverImage());
        res.setDifficulty(blog.getDifficulty());
        res.setPrerequisites(blog.getPrerequisites());
        res.setTakeaways(blog.getTakeaways());
        res.setLikes(blog.getLikes());
        res.setBookmarks(blog.getBookmarks());
        return res;
    }

    public ProjectResponse toProjectResponse(Project project, boolean isLiked, boolean isBookmarked, boolean isOwner) {
        if (project == null) return null;
        ProjectResponse res = new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getCategory(),
                project.getDescription(),
                project.getAuthorName(),
                project.getTechnologies(),
                project.getLikes(),
                project.getViews(),
                project.getCreatedAt(),
                isLiked
        );
        res.setTagline(project.getTagline());
        res.setCoverImage(project.getCoverImage());
        res.setStatus(project.getStatus());
        res.setLiveDemoUrl(project.getLiveDemoUrl());
        res.setGithubUrl(project.getGithubUrl());
        res.setDocumentation(project.getDocumentation());
        res.setProblemStatement(project.getProblemStatement());
        res.setProposedSolution(project.getProposedSolution());
        res.setArchitectureSummary(project.getArchitectureSummary());
        res.setBookmarks(project.getBookmarks());
        res.setBookmarked(isBookmarked);
        res.setOwner(isOwner);
        return res;
    }

    public ProjectResponse toProjectResponse(Project project, boolean isLiked) {
        return toProjectResponse(project, isLiked, false, false);
    }
}
