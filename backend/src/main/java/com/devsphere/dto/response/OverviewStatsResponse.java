package com.devsphere.dto.response;

public class OverviewStatsResponse {

    private long developersCount;
    private long blogsCount;
    private long projectsCount;
    private long countriesCount;

    public OverviewStatsResponse() {}

    public OverviewStatsResponse(long developersCount, long blogsCount, long projectsCount, long countriesCount) {
        this.developersCount = developersCount;
        this.blogsCount = blogsCount;
        this.projectsCount = projectsCount;
        this.countriesCount = countriesCount;
    }

    public long getDevelopersCount() {
        return developersCount;
    }

    public void setDevelopersCount(long developersCount) {
        this.developersCount = developersCount;
    }

    public long getBlogsCount() {
        return blogsCount;
    }

    public void setBlogsCount(long blogsCount) {
        this.blogsCount = blogsCount;
    }

    public long getProjectsCount() {
        return projectsCount;
    }

    public void setProjectsCount(long projectsCount) {
        this.projectsCount = projectsCount;
    }

    public long getCountriesCount() {
        return countriesCount;
    }

    public void setCountriesCount(long countriesCount) {
        this.countriesCount = countriesCount;
    }
}
