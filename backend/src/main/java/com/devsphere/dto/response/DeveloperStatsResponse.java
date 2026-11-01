package com.devsphere.dto.response;

import java.util.List;

public class DeveloperStatsResponse {

    private int projectsCount;
    private int blogsCount;
    private int connectionsCount;
    private List<Integer> activityData;
    private List<String> activityLabels;

    public DeveloperStatsResponse() {}

    public DeveloperStatsResponse(int projectsCount, int blogsCount, int connectionsCount, List<Integer> activityData, List<String> activityLabels) {
        this.projectsCount = projectsCount;
        this.blogsCount = blogsCount;
        this.connectionsCount = connectionsCount;
        this.activityData = activityData;
        this.activityLabels = activityLabels;
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

    public List<Integer> getActivityData() {
        return activityData;
    }

    public void setActivityData(List<Integer> activityData) {
        this.activityData = activityData;
    }

    public List<String> getActivityLabels() {
        return activityLabels;
    }

    public void setActivityLabels(List<String> activityLabels) {
        this.activityLabels = activityLabels;
    }
}
