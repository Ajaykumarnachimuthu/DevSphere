package com.devsphere.service.impl;

import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.service.GitHubService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitHubServiceImpl implements GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubServiceImpl.class);
    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile("https?://github\\.com/([\\w.-]+)/([\\w.-]+)/?");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(GitHubRepoResponse data, Instant expiresAt) {}

    public GitHubServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
    }

    @Override
    public GitHubRepoResponse getRepoDetails(String githubUrl) {
        if (githubUrl == null || githubUrl.isBlank()) {
            return null;
        }

        Matcher matcher = GITHUB_URL_PATTERN.matcher(githubUrl.trim());
        if (!matcher.find()) {
            return null;
        }

        String owner = matcher.group(1);
        String repo = matcher.group(2).replaceAll("\\.git$", "");
        String key = (owner + "/" + repo).toLowerCase();

        // Check cache (TTL 15 minutes)
        CacheEntry entry = cache.get(key);
        if (entry != null && Instant.now().isBefore(entry.expiresAt())) {
            return entry.data();
        }

        try {
            String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Accept", "application/vnd.github.v3+json")
                    .header("User-Agent", "DEVSphere-Platform")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());

                String name = root.path("name").asText(repo);
                String fullName = root.path("full_name").asText(owner + "/" + repo);
                String htmlUrl = root.path("html_url").asText("https://github.com/" + owner + "/" + repo);
                String description = root.path("description").asText("");
                int stars = root.path("stargazers_count").asInt(0);
                int forks = root.path("forks_count").asInt(0);
                int openIssues = root.path("open_issues_count").asInt(0);
                String language = root.path("language").asText("Various");
                String defaultBranch = root.path("default_branch").asText("main");
                String lastUpdated = root.path("updated_at").asText("");

                String license = "None";
                JsonNode licenseNode = root.path("license");
                if (licenseNode.isObject()) {
                    license = licenseNode.path("spdx_id").asText(licenseNode.path("name").asText("Open Source"));
                }

                List<String> topics = new ArrayList<>();
                JsonNode topicsNode = root.path("topics");
                if (topicsNode.isArray()) {
                    for (JsonNode t : topicsNode) {
                        topics.add(t.asText());
                    }
                }

                GitHubRepoResponse data = new GitHubRepoResponse(
                        name, fullName, htmlUrl, description, stars, forks, openIssues,
                        language, license, defaultBranch, lastUpdated, topics, true
                );

                cache.put(key, new CacheEntry(data, Instant.now().plus(Duration.ofMinutes(15))));
                return data;
            } else {
                log.info("GitHub API returned status {} for {}", response.statusCode(), key);
            }
        } catch (Exception ex) {
            log.warn("Could not fetch GitHub metadata for {}: {}", key, ex.getMessage());
        }

        // Return fallback unverified response rather than failing
        return new GitHubRepoResponse(repo, owner + "/" + repo, "https://github.com/" + owner + "/" + repo, "", 0, 0, 0, "Code", "Repository", "main", "", List.of(), false);
    }

    @Override
    public String getRepoReadme(String githubUrl) {
        if (githubUrl == null || githubUrl.isBlank()) {
            return null;
        }

        Matcher matcher = GITHUB_URL_PATTERN.matcher(githubUrl.trim());
        if (!matcher.find()) {
            return null;
        }

        String owner = matcher.group(1);
        String repo = matcher.group(2).replaceAll("\\.git$", "");

        try {
            String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo + "/readme";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Accept", "application/vnd.github.v3+json")
                    .header("User-Agent", "DEVSphere-Platform")
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String content = root.path("content").asText("");
                String encoding = root.path("encoding").asText("base64");

                if ("base64".equalsIgnoreCase(encoding) && !content.isBlank()) {
                    byte[] decoded = Base64.getMimeDecoder().decode(content);
                    return new String(decoded, StandardCharsets.UTF_8);
                }
                return content;
            }
        } catch (Exception ex) {
            log.warn("Could not fetch README for {}/{}: {}", owner, repo, ex.getMessage());
        }
        return null;
    }
}

