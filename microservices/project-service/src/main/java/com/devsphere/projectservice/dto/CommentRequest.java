package com.devsphere.projectservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CommentRequest {

    @NotBlank(message = "Comment content cannot be blank")
    private String content;

    private UUID parentId;

    public CommentRequest() {
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
