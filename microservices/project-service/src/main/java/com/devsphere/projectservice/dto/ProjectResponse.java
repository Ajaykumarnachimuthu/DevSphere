package com.devsphere.projectservice.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ProjectResponse {

    private UUID id;
    private UUID authorId;
    private String authorName;
    private String title;
    private String tagline;
    private String coverImage;
    private String category;
    private String description;
    private String status;
    private String liveDemoUrl;
    private String githubUrl;
    private String documentation;
    private String problemStatement;
    private String proposedSolution;
    private String architectureSummary;
    private String keyFeatures;
    private String quickstartCmd;
    private String videoDemoUrl;
    private int likes;
    private int views;
    private int bookmarks;
    private List<String> technologies;
    private boolean isLiked;
    private boolean isBookmarked;
    private boolean isOwner;
    private GitHubRepoResponse githubMetadata;
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName != null ? authorName : "AJAYKUMAR N";
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthor() {
        return authorName != null ? authorName : "AJAYKUMAR N";
    }

    public void setAuthor(String author) {
        this.authorName = author;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLiveDemoUrl() {
        return liveDemoUrl;
    }

    public void setLiveDemoUrl(String liveDemoUrl) {
        this.liveDemoUrl = liveDemoUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getDocumentation() {
        return documentation;
    }

    public void setDocumentation(String documentation) {
        this.documentation = documentation;
    }

    public String getProblemStatement() {
        return problemStatement;
    }

    public void setProblemStatement(String problemStatement) {
        this.problemStatement = problemStatement;
    }

    public String getProposedSolution() {
        return proposedSolution;
    }

    public void setProposedSolution(String proposedSolution) {
        this.proposedSolution = proposedSolution;
    }

    public String getArchitectureSummary() {
        return architectureSummary;
    }

    public void setArchitectureSummary(String architectureSummary) {
        this.architectureSummary = architectureSummary;
    }

    public String getKeyFeatures() {
        return keyFeatures;
    }

    public void setKeyFeatures(String keyFeatures) {
        this.keyFeatures = keyFeatures;
    }

    public String getQuickstartCmd() {
        return quickstartCmd;
    }

    public void setQuickstartCmd(String quickstartCmd) {
        this.quickstartCmd = quickstartCmd;
    }

    public String getVideoDemoUrl() {
        return videoDemoUrl;
    }

    public void setVideoDemoUrl(String videoDemoUrl) {
        this.videoDemoUrl = videoDemoUrl;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }

    public int getBookmarks() {
        return bookmarks;
    }

    public void setBookmarks(int bookmarks) {
        this.bookmarks = bookmarks;
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }

    public boolean isBookmarked() {
        return isBookmarked;
    }

    public void setBookmarked(boolean bookmarked) {
        isBookmarked = bookmarked;
    }

    public boolean isOwner() {
        return isOwner;
    }

    public void setOwner(boolean owner) {
        isOwner = owner;
    }

    public GitHubRepoResponse getGithubMetadata() {
        return githubMetadata;
    }

    public void setGithubMetadata(GitHubRepoResponse githubMetadata) {
        this.githubMetadata = githubMetadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
