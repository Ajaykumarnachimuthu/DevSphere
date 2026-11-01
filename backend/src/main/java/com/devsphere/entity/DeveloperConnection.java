package com.devsphere.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "developer_connections", uniqueConstraints = {
    @UniqueConstraint(name = "uq_dev_user_connection", columnNames = {"developer_id", "user_id"})
})
public class DeveloperConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "developer_id", nullable = false)
    private DeveloperProfile developer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public DeveloperConnection() {}

    public DeveloperConnection(DeveloperProfile developer, User user) {
        this.developer = developer;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public DeveloperProfile getDeveloper() {
        return developer;
    }

    public void setDeveloper(DeveloperProfile developer) {
        this.developer = developer;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
