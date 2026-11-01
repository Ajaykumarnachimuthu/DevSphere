package com.devsphere.service.impl;

import com.devsphere.dto.response.GitHubRepoResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.entity.Project;
import com.devsphere.entity.User;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.ProjectRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.service.GitHubImportService;
import com.devsphere.service.GitHubService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitHubImportServiceImpl implements GitHubImportService {

    private static final Logger log = LoggerFactory.getLogger(GitHubImportServiceImpl.class);

    private static final String DEFAULT_OWNER = "Ajaykumarnachimuthu";

    // Verified qualifying software repositories evaluated from user's GitHub
    private static final List<RepoDescriptor> QUALIFYING_REPOSITORIES = List.of(
            new RepoDescriptor("Personal-Finance-Tracker", "Web Development", "Personal budget management, income & expense logging, category spending limits, and real-time financial analytics.", "https://personalfinancetracker-swag.onrender.com"),
            new RepoDescriptor("AI-Based-Vehicle-Telemetry-Alert-Fault-Detection-System", "AI/ML", "Real-time vehicle telemetry monitoring with AI-powered fault detection using rule thresholds and Isolation Forest ML anomaly model.", null),
            new RepoDescriptor("YatraAI", "AI/ML", "Intelligent travel journey recommendation and multi-modal transit network orchestration engine with continuous microeconomic passenger preference modeling.", null),
            new RepoDescriptor("INGRIS-CHATBOT", "AI/ML", "AI-driven conversational agent with RAG pipeline engineered for the Integrated Groundwater Information Retrieval System.", "https://ingris-chatbot.vercel.app"),
            new RepoDescriptor("ViewSimilarImages", "Web Development", "Full-stack visual discovery and e-commerce product search system built with FastAPI, React (TypeScript + Vite), and Supabase PostgreSQL.", null),
            new RepoDescriptor("Smart-Shopping-Mall-Navigator-TSP-App", "Tools", "Intelligent route optimization web application using Traveling Salesman Problem (TSP) algorithms including greedy and dynamic programming heuristics.", null),
            new RepoDescriptor("Indian-Art-Form", "Web Development", "Curatorial digital heritage exhibition and interactive art studio exploring traditional Indian art forms.", null),
            new RepoDescriptor("DevSphere", "Web Development", "Modern developer community platform where engineers share knowledge, publish blogs, showcase projects, and connect across global tech stacks.", "http://localhost:5173")
    );

    public record RepoDescriptor(String repoName, String defaultCategory, String fallbackDescription, String verifiedDemoUrl) {}

    private final GitHubService gitHubService;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;

    public GitHubImportServiceImpl(
            GitHubService gitHubService,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            EntityDtoMapper mapper
    ) {
        this.gitHubService = gitHubService;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public ProjectResponse importRepository(String repoUrlOrName, UUID userId) {
        String cleanUrl = normalizeGithubUrl(repoUrlOrName);
        String repoName = extractRepoName(cleanUrl);

        log.info("Importing verified GitHub repository: {} for user: {}", cleanUrl, userId);

        GitHubRepoResponse repoMeta = gitHubService.getRepoDetails(cleanUrl);
        String readme = gitHubService.getRepoReadme(cleanUrl);

        // Resolve author from database
        User author = resolveAuthor(userId);
        if (author == null) {
            throw new ResourceNotFoundException("No valid registered user found to assign project ownership");
        }

        // Find existing project by canonical GitHub URL for deduplication
        Optional<Project> existingOpt = projectRepository.findByGithubUrl(cleanUrl);
        Project project = existingOpt.orElseGet(() -> {
            Project newP = new Project();
            newP.setLikes(0);
            newP.setViews(0);
            newP.setBookmarks(0);
            return newP;
        });

        // Match descriptor if available
        RepoDescriptor descriptor = QUALIFYING_REPOSITORIES.stream()
                .filter(d -> d.repoName().equalsIgnoreCase(repoName))
                .findFirst()
                .orElse(null);

        // Populate verified project information
        String displayTitle = formatProjectTitle(repoName);
        project.setTitle(displayTitle);
        project.setGithubUrl(cleanUrl);
        project.setAuthor(author);
        project.setAuthorName(author.getUsername());
        project.setStatus("ACTIVE");

        // Category
        String category = descriptor != null ? descriptor.defaultCategory() : determineCategory(repoMeta, readme);
        project.setCategory(category);

        // Description
        String description = (repoMeta != null && repoMeta.getDescription() != null && !repoMeta.getDescription().isBlank())
                ? repoMeta.getDescription()
                : (descriptor != null ? descriptor.fallbackDescription() : extractOverviewFromReadme(readme, displayTitle));
        project.setDescription(description);
        project.setTagline(description.length() > 200 ? description.substring(0, 197) + "..." : description);

        // Verified Live Demo URL
        if (descriptor != null && descriptor.verifiedDemoUrl() != null) {
            project.setLiveDemoUrl(descriptor.verifiedDemoUrl());
        } else {
            String extractedDemo = extractDemoUrlFromReadme(readme);
            project.setLiveDemoUrl(extractedDemo); // Will be null if unavailable
        }

        // Technologies from GitHub metadata + README
        List<String> techList = extractTechnologies(repoMeta, readme, descriptor);
        project.setTechnologies(techList);

        // Structured documentation derived from README
        if (readme != null && !readme.isBlank()) {
            project.setDocumentation(readme);
            project.setProblemStatement(extractSection(readme, "Problem Statement", "Problem", "Overview"));
            project.setProposedSolution(extractSection(readme, "Proposed Solution", "Solution", "Features", "Key Features"));
            project.setArchitectureSummary(extractSection(readme, "Architecture", "System Architecture", "Pipeline Architecture", "Tech Stack"));
        } else {
            project.setDocumentation("Documentation not yet published in repository.");
            project.setProblemStatement(null);
            project.setProposedSolution(null);
            project.setArchitectureSummary(null);
        }

        Project saved = projectRepository.save(project);
        ProjectResponse response = mapper.toProjectResponse(saved, false, false, true);
        response.setGithubMetadata(repoMeta);

        log.info("Successfully persisted imported project: {} (ID: {})", saved.getTitle(), saved.getId());
        return response;
    }

    @Override
    @Transactional
    public List<ProjectResponse> syncAllQualifyingProjects(UUID userId) {
        User author = resolveAuthor(userId);
        if (author == null) {
            log.warn("Cannot sync GitHub projects: no registered user found in database");
            return List.of();
        }

        List<ProjectResponse> imported = new ArrayList<>();
        for (RepoDescriptor descriptor : QUALIFYING_REPOSITORIES) {
            try {
                String repoUrl = "https://github.com/" + DEFAULT_OWNER + "/" + descriptor.repoName();
                ProjectResponse res = importRepository(repoUrl, author.getId());
                imported.add(res);
            } catch (Exception ex) {
                log.error("Failed importing repository {}: {}", descriptor.repoName(), ex.getMessage());
            }
        }
        return imported;
    }

    private User resolveAuthor(UUID userId) {
        if (userId != null) {
            return userRepository.findById(userId).orElse(null);
        }
        // First try primary registered user AJAYKUMAR
        return userRepository.findAll().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase("AJAYKUMAR") || u.getEmail().toLowerCase().contains("ajaykumarnachimuthu37"))
                .findFirst()
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
    }

    private String normalizeGithubUrl(String input) {
        if (input == null || input.isBlank()) {
            return "https://github.com/" + DEFAULT_OWNER + "/DevSphere";
        }
        String trimmed = input.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed.replaceAll("/+$", "").replaceAll("\\.git$", "");
        }
        if (trimmed.contains("/")) {
            return "https://github.com/" + trimmed.replaceAll("/+$", "").replaceAll("\\.git$", "");
        }
        return "https://github.com/" + DEFAULT_OWNER + "/" + trimmed;
    }

    private String extractRepoName(String url) {
        Matcher m = Pattern.compile("https?://github\\.com/[^/]+/([^/]+)").matcher(url);
        if (m.find()) {
            return m.group(1);
        }
        return url;
    }

    private String formatProjectTitle(String repoName) {
        return repoName.replace("-", " ").replace("_", " ").trim();
    }

    private String determineCategory(GitHubRepoResponse meta, String readme) {
        String lang = (meta != null && meta.getLanguage() != null) ? meta.getLanguage().toLowerCase() : "";
        String text = (readme != null ? readme.toLowerCase() : "") + " " + (meta != null ? meta.getName().toLowerCase() : "");

        if (text.contains("telemetry") || text.contains("machine learning") || text.contains("anomaly") || text.contains("rag") || text.contains("travel")) {
            return "AI/ML";
        }
        if (text.contains("tsp") || text.contains("algorithm") || text.contains("utility") || text.contains("tool")) {
            return "Tools";
        }
        if (lang.contains("python") && (text.contains("model") || text.contains("pytorch") || text.contains("scikit"))) {
            return "AI/ML";
        }
        return "Web Development";
    }

    private String extractOverviewFromReadme(String readme, String defaultTitle) {
        if (readme == null || readme.isBlank()) {
            return defaultTitle + " software project hosted on GitHub.";
        }
        for (String line : readme.split("\n")) {
            String clean = line.replaceAll("[#*`>\\[\\]_]", "").trim();
            if (clean.length() > 30 && !clean.startsWith("http") && !clean.contains("badge") && !clean.contains("Table of Contents")) {
                return clean.length() > 250 ? clean.substring(0, 247) + "..." : clean;
            }
        }
        return defaultTitle + " software project hosted on GitHub.";
    }

    private String extractDemoUrlFromReadme(String readme) {
        if (readme == null || readme.isBlank()) return null;
        Matcher m = Pattern.compile("https?://[a-zA-Z0-9-]+\\.(onrender\\.com|vercel\\.app|netlify\\.app)[a-zA-Z0-9/_.-]*").matcher(readme);
        if (m.find()) {
            return m.group(0);
        }
        return null;
    }

    private List<String> extractTechnologies(GitHubRepoResponse meta, String readme, RepoDescriptor descriptor) {
        Set<String> set = new LinkedHashSet<>();

        // From GitHub primary language
        if (meta != null && meta.getLanguage() != null && !meta.getLanguage().isBlank() && !"Various".equalsIgnoreCase(meta.getLanguage())) {
            set.add(meta.getLanguage());
        }

        // From GitHub topics
        if (meta != null && meta.getTopics() != null) {
            for (String t : meta.getTopics()) {
                if (t.length() > 1 && !t.contains("project") && !t.contains("app")) {
                    set.add(Character.toUpperCase(t.charAt(0)) + t.substring(1));
                }
            }
        }

        // Specific verified tech recognition from README
        if (readme != null) {
            String lower = readme.toLowerCase();
            if (lower.contains("fastapi")) set.add("FastAPI");
            if (lower.contains("react")) set.add("React");
            if (lower.contains("typescript")) set.add("TypeScript");
            if (lower.contains("spring boot")) set.add("Spring Boot");
            if (lower.contains("mongodb")) set.add("MongoDB");
            if (lower.contains("postgresql") || lower.contains("postgres")) set.add("PostgreSQL");
            if (lower.contains("supabase")) set.add("Supabase");
            if (lower.contains("tailwind")) set.add("Tailwind CSS");
            if (lower.contains("docker")) set.add("Docker");
            if (lower.contains("tomcat")) set.add("Tomcat");
            if (lower.contains("jsp") || lower.contains("servlets")) set.add("JSP");
            if (lower.contains("scikit-learn") || lower.contains("isolation forest")) set.add("Scikit-Learn");
            if (lower.contains("pytorch")) set.add("PyTorch");
            if (lower.contains("flask")) set.add("Flask");
            if (lower.contains("streamlit")) set.add("Streamlit");
            if (lower.contains("canvas api")) set.add("Canvas API");
        }

        if (set.isEmpty()) {
            set.add("Open Source");
        }
        return new ArrayList<>(set);
    }

    private String extractSection(String readme, String... headers) {
        if (readme == null || readme.isBlank()) return null;
        for (String header : headers) {
            Pattern p = Pattern.compile("(?i)#{1,3}\\s*[^\\n]*" + Pattern.quote(header) + "[^\\n]*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s|$)", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(readme);
            if (m.find()) {
                String section = m.group(1).trim();
                if (section.length() > 30) {
                    return section.length() > 1200 ? section.substring(0, 1197) + "..." : section;
                }
            }
        }
        return null;
    }
}

