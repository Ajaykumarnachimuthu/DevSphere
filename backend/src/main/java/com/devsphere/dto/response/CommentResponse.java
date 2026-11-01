package com.devsphere.dto.response;

import java.time.Instant;
import java.util.UUID;

public class CommentResponse {

    private UUID id;
    private String authorName;
    private String content;
    private UUID parentId;
    private Instant createdAt;
    private boolean owner;

    public CommentResponse() {
    }

    public CommentResponse(UUID id, String authorName, String content, UUID parentId, Instant createdAt,
            boolean owner) {
        this.id = id;
        this.authorName = authorName;
        this.content = content;
        this.parentId = parentId;
        this.createdAt = createdAt;
        this.owner = owner;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public UUID getParentId() {
        return parentId;
    }

    public void setParentId(UUID parentId) {
        this.parentId = parentId;
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
}
