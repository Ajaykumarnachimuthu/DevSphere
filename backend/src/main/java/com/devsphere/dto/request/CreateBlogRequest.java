package com.devsphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CreateBlogRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String subtitle;

    private String coverImage;

    private String difficulty;

    private String prerequisites;

    private String takeaways;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content cannot exceed 5000 characters")
    private String content;

    private String tech;
    private List<String> tags;
    private boolean draft = false;

    public CreateBlogRequest() {}

    public CreateBlogRequest(String title, String category, String content, String tech, List<String> tags, boolean draft) {
        this.title = title;
        this.category = category;
        this.content = content;
        this.tech = tech;
        this.tags = tags;
        this.draft = draft;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }

    public String getTakeaways() {
        return takeaways;
    }

    public void setTakeaways(String takeaways) {
        this.takeaways = takeaways;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTech() {
        return tech;
    }

    public void setTech(String tech) {
        this.tech = tech;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public boolean isDraft() {
        return draft;
    }

    public void setDraft(boolean draft) {
        this.draft = draft;
    }
}
