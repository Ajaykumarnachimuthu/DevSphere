package com.devsphere.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class KnowledgeTrailResponse {

    private UUID id;
    private String title;
    private String description;
    private String category;
    private String authorName;
    private String coverImage;
    private int estimatedHours;
    private String difficulty;
    private int articlesCount;
    private List<BlogResponse> articles;
    private Instant createdAt;

    public KnowledgeTrailResponse() {}

    public KnowledgeTrailResponse(UUID id, String title, String description, String category, String authorName, String coverImage, int estimatedHours, String difficulty, int articlesCount, List<BlogResponse> articles, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.authorName = authorName;
        this.coverImage = coverImage;
        this.estimatedHours = estimatedHours;
        this.difficulty = difficulty;
        this.articlesCount = articlesCount;
        this.articles = articles;
        this.createdAt = createdAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public int getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(int estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public int getArticlesCount() {
        return articlesCount;
    }

    public void setArticlesCount(int articlesCount) {
        this.articlesCount = articlesCount;
    }

    public List<BlogResponse> getArticles() {
        return articles;
    }

    public void setArticles(List<BlogResponse> articles) {
        this.articles = articles;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

