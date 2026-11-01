package com.devsphere.dto.response;

import java.util.Set;
import java.util.UUID;

public class DeveloperResponse {

    private UUID id;
    private String name;
    private String role;
    private String description;
    private String location;
    private String avatar;
    private Set<String> skills;
    private int projectsCount;
    private int blogsCount;
    private int connectionsCount;
    private boolean connected;

    public DeveloperResponse() {}

    public DeveloperResponse(UUID id, String name, String role, String description, String location, String avatar, Set<String> skills, int projectsCount, int blogsCount, int connectionsCount, boolean connected) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.description = description;
        this.location = location;
        this.avatar = avatar;
        this.skills = skills;
        this.projectsCount = projectsCount;
        this.blogsCount = blogsCount;
        this.connectionsCount = connectionsCount;
        this.connected = connected;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public void setSkills(Set<String> skills) {
        this.skills = skills;
    }

    public int getProjectsCount() {
        return projectsCount;
    }

    public void setProjectsCount(int projectsCount) {
        this.projectsCount = projectsCount;
    }

    public int getBlogsCount() {
        return blogsCount;
    }

    public void setBlogsCount(int blogsCount) {
        this.blogsCount = blogsCount;
    }

    public int getConnectionsCount() {
        return connectionsCount;
    }

    public void setConnectionsCount(int connectionsCount) {
        this.connectionsCount = connectionsCount;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }
}
