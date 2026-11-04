package com.devsphere.projectservice.security;

import java.util.UUID;

public class InternalUserPrincipal {

    private final UUID id;
    private final String username;
    private final String role;

    public InternalUserPrincipal(UUID id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role != null ? role : "ROLE_USER";
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return "ROLE_ADMIN".equalsIgnoreCase(role);
    }
}
