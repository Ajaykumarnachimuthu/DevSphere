package com.devsphere.dto.response;

import com.devsphere.entity.BlogStatus;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class BlogResponse {

    private UUID id;
    private String title;
    private String subtitle;
    private String coverImage;
    private String category;
    private String description;
    private String content;
    private String author;
    private String authorName;
    private UUID authorId;
    private String readTime;
    private String tech;
    private String difficulty;
    private String prerequisites;
    private String takeaways;
    private int likes;
    private int bookmarks;
    private Set<String> tags;
    private BlogStatus status;
    private Instant createdAt;
    private boolean owner;
    private boolean liked;
    private boolean bookmarked;

    public BlogResponse() {}

    public BlogResponse(UUID id, String title, String category, String content, String author, String readTime, String tech, Set<String> tags, BlogStatus status, Instant createdAt, boolean owner) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.content = content;
        this.description = content;
        this.author = author;
        this.readTime = readTime;
        this.tech = tech;
        this.tags = tags;
        this.status = status;
        this.createdAt = createdAt;
        this.owner = owner;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description != null ? description : content;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
        this.description = content;
    }

    public String getAuthor() {
        return author != null ? author : (authorName != null ? authorName : "AJAYKUMAR N");
    }

    public void setAuthor(String author) {
        this.author = author;
        if (this.authorName == null) this.authorName = author;
    }

    public String getAuthorName() {
        return authorName != null ? authorName : (author != null ? author : "AJAYKUMAR N");
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
        if (this.author == null) this.author = authorName;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getReadTime() {
        return readTime;
    }

    public void setReadTime(String readTime) {
        this.readTime = readTime;
    }

    public String getTech() {
        return tech;
    }

    public void setTech(String tech) {
        this.tech = tech;
    }

    public String getDifficulty() {
        return difficulty != null ? difficulty : "Intermediate";
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

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public int getBookmarks() {
        return bookmarks;
    }

    public void setBookmarks(int bookmarks) {
        this.bookmarks = bookmarks;
    }

    public Set<String> getTags() {
        return tags;
    }

    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    public BlogStatus getStatus() {
        return status;
    }

    public void setStatus(BlogStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isOwner() {
        return owner;
    }

    public void setOwner(boolean owner) {
        this.owner = owner;
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
}
