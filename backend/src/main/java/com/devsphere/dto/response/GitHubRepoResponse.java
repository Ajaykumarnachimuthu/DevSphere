package com.devsphere.dto.response;

import java.util.List;

public class GitHubRepoResponse {

    private String name;
    private String fullName;
    private String htmlUrl;
    private String description;
    private int stars;
    private int forks;
    private int openIssues;
    private String language;
    private String license;
    private String defaultBranch;
    private String lastUpdated;
    private List<String> topics;
    private boolean verified;

    public GitHubRepoResponse() {
    }

    public GitHubRepoResponse(String name, String fullName, String htmlUrl, String description, int stars, int forks,
            int openIssues, String language, String license, String defaultBranch, String lastUpdated,
            List<String> topics, boolean verified) {
        this.name = name;
        this.fullName = fullName;
        this.htmlUrl = htmlUrl;
        this.description = description;
        this.stars = stars;
        this.forks = forks;
        this.openIssues = openIssues;
        this.language = language;
        this.license = license;
        this.defaultBranch = defaultBranch;
        this.lastUpdated = lastUpdated;
        this.topics = topics;
        this.verified = verified;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public int getForks() {
        return forks;
    }

    public void setForks(int forks) {
        this.forks = forks;
    }

    public int getOpenIssues() {
        return openIssues;
    }

    public void setOpenIssues(int openIssues) {
        this.openIssues = openIssues;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }
}
