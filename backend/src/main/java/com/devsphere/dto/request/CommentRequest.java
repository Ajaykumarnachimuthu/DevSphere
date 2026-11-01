package com.devsphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CommentRequest {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private UUID parentId;

    public CommentRequest() {
    }

    public CommentRequest(String content, UUID parentId) {
        this.content = content;
        this.parentId = parentId;
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
}
