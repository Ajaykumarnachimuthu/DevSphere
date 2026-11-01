package com.devsphere.dto.request;

import jakarta.validation.constraints.Size;
import java.util.Set;

public class UpdateDeveloperProfileRequest {

    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 100, message = "Role cannot exceed 100 characters")
    private String role;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @Size(max = 50, message = "Avatar cannot exceed 50 characters")
    private String avatar;

    private Set<String> skills;

    public UpdateDeveloperProfileRequest() {}

    public UpdateDeveloperProfileRequest(String name, String role, String description, String location, String avatar, Set<String> skills) {
        this.name = name;
        this.role = role;
        this.description = description;
        this.location = location;
        this.avatar = avatar;
        this.skills = skills;
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
}

