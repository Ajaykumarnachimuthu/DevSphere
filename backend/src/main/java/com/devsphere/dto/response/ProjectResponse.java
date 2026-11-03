package com.devsphere.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ProjectResponse {

    private UUID id;
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
    private String author;
    private List<String> technologies;
    private int likes;
    private int views;
    private int bookmarks;
    private Instant createdAt;
    private boolean liked;
    private boolean bookmarked;
    private boolean owner;
    private GitHubRepoResponse githubMetadata;

    public ProjectResponse() {}

    public ProjectResponse(UUID id, String title, String category, String description, String author, List<String> technologies, int likes, int views, Instant createdAt, boolean liked) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.author = author;
        this.technologies = technologies;
        this.likes = likes;
        this.views = views;
        this.createdAt = createdAt;
        this.liked = liked;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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
        return status != null ? status : "ACTIVE";
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

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isLiked() {
        return liked;
    }

    public void setLiked(boolean liked) {
        this.liked = liked;
    }

    public boolean isBookmarked() {
        return bookmarked;
    }

    public void setBookmarked(boolean bookmarked) {
        this.bookmarked = bookmarked;
    }

    public boolean isOwner() {
        return owner;
    }

    public void setOwner(boolean owner) {
        this.owner = owner;
    }

    public GitHubRepoResponse getGithubMetadata() {
        return githubMetadata;
    }

    public void setGithubMetadata(GitHubRepoResponse githubMetadata) {
        this.githubMetadata = githubMetadata;
    }
}
