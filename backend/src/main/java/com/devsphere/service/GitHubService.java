package com.devsphere.service;

import com.devsphere.dto.response.GitHubRepoResponse;

public interface GitHubService {
    GitHubRepoResponse getRepoDetails(String githubUrl);
    String getRepoReadme(String githubUrl);
}

