package com.devsphere.service;

import com.devsphere.dto.response.ProjectResponse;

import java.util.List;
import java.util.UUID;

public interface GitHubImportService {
    ProjectResponse importRepository(String repoUrlOrName, UUID userId);
    List<ProjectResponse> syncAllQualifyingProjects(UUID userId);
}

