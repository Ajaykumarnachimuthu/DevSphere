package com.devsphere.dto.response;

import java.util.UUID;

public class ConnectionStatusResponse {

    private UUID developerId;
    private boolean connected;
    private int totalConnections;

    public ConnectionStatusResponse() {}

    public ConnectionStatusResponse(UUID developerId, boolean connected, int totalConnections) {
        this.developerId = developerId;
        this.connected = connected;
        this.totalConnections = totalConnections;
    }

    public UUID getDeveloperId() {
        return developerId;
    }

    public void setDeveloperId(UUID developerId) {
        this.developerId = developerId;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public int getTotalConnections() {
        return totalConnections;
    }

    public void setTotalConnections(int totalConnections) {
        this.totalConnections = totalConnections;
    }
}
