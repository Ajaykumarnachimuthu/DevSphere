package com.devsphere.service;

import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.response.DeveloperStatsResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.entity.DeveloperProfile;
import com.devsphere.entity.Role;
import com.devsphere.entity.User;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.repository.DeveloperProfileRepository;
import com.devsphere.repository.ProjectLikeRepository;
import com.devsphere.repository.ProjectRepository;
import com.devsphere.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = com.devsphere.DevSphereApplication.class)
@ActiveProfiles("test")
class ProjectConcurrencyTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private DeveloperService developerService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectLikeRepository projectLikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeveloperProfileRepository developerProfileRepository;

    private UUID createTestAuthor() {
        User author = new User("author_" + UUID.randomUUID().toString().substring(0, 8),
                "author_" + UUID.randomUUID().toString().substring(0, 8) + "@devsphere.io",
                "secret",
                Role.ROLE_USER);
        return userRepository.save(author).getId();
    }

    @Test
    @DisplayName("Concurrency: 100 simultaneous view increments must not lose updates")
    void testConcurrentViewIncrements_100Threads() throws InterruptedException {
        // 1. Create a fresh project with 0 views
        CreateProjectRequest req = new CreateProjectRequest(
                "High Concurrency Telemetry",
                "DevOps",
                "Testing atomic view counter under multithreaded load",
                List.of("Go", "Kafka")
        );
        ProjectResponse created = projectService.createProject(req, createTestAuthor());
        UUID projectId = created.getId();

        assertThat(created.getViews()).isZero();

        // 2. Launch 100 concurrent threads
        int threadCount = 100;
        ExecutorService executor = Executors.newFixedThreadPool(20);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    projectService.incrementViews(projectId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // Log error if any
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        // Fire all threads simultaneously
        startLatch.countDown();
        boolean completed = finishLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();
        assertThat(successCount.get()).isEqualTo(threadCount);

        // 3. Verify database persisted views count matches exactly 100
        ProjectResponse finalProject = projectService.getProjectById(projectId, null);
        assertThat(finalProject.getViews()).isEqualTo(100);
    }

    @Test
    @DisplayName("Concurrency: 20 distinct users liking simultaneously must record exactly 20 likes")
    void testConcurrentLikes_DistinctUsers() throws InterruptedException {
        // 1. Create project
        CreateProjectRequest req = new CreateProjectRequest(
                "Distributed Cache Engine",
                "Architecture",
                "Testing distinct user concurrent likes",
                List.of("Java", "Redis")
        );
        ProjectResponse project = projectService.createProject(req, createTestAuthor());
        UUID projectId = project.getId();

        // 2. Create 20 distinct users
        int userCount = 20;
        List<UUID> userIds = new ArrayList<>();
        for (int i = 0; i < userCount; i++) {
            User user = new User("likeUser_" + i + "_" + UUID.randomUUID().toString().substring(0, 6),
                    "like_" + i + "_" + UUID.randomUUID().toString().substring(0, 6) + "@devsphere.io",
                    "secret",
                    Role.ROLE_USER);
            user = userRepository.save(user);
            userIds.add(user.getId());
        }

        // 3. 20 concurrent threads liking the project
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(userCount);

        for (UUID userId : userIds) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    projectService.toggleLike(projectId, userId);
                } catch (Exception ignored) {
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = finishLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();

        // 4. Verify likes count and projectLikeRepository count both equal 20
        long actualLikeRows = projectLikeRepository.countByProjectId(projectId);
        ProjectResponse updatedProject = projectService.getProjectById(projectId, null);

        assertThat(actualLikeRows).isEqualTo(20);
        assertThat(updatedProject.getLikes()).isEqualTo(20);
    }

    @Test
    @DisplayName("Concurrency: Simultaneous duplicate like requests from the same user must not create duplicate records")
    void testConcurrentLikes_SameUserDoubleSubmit() throws InterruptedException {
        CreateProjectRequest req = new CreateProjectRequest(
                "Idempotent Payment Gateway",
                "FinTech",
                "Testing duplicate submission concurrency safety",
                List.of("Spring Boot", "PostgreSQL")
        );
        ProjectResponse project = projectService.createProject(req, createTestAuthor());
        UUID projectId = project.getId();

        User user = new User("duplicateTester_" + UUID.randomUUID().toString().substring(0, 6),
                "dupe_" + UUID.randomUUID().toString().substring(0, 6) + "@devsphere.io",
                "secret",
                Role.ROLE_USER);
        user = userRepository.save(user);
        UUID userId = user.getId();

        // 10 concurrent requests from the exact same user
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(5);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    projectService.toggleLike(projectId, userId);
                } catch (Exception ignored) {
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = finishLatch.await(20, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();

        // Total project likes count must be consistent with total rows in project_likes (never duplicates)
        long totalLikeRows = projectLikeRepository.countByProjectId(projectId);
        ProjectResponse finalProject = projectService.getProjectById(projectId, null);
        assertThat(totalLikeRows).isLessThanOrEqualTo(1L);
        assertThat(finalProject.getLikes()).isEqualTo((int) totalLikeRows);
    }

    @Test
    @DisplayName("Concurrency: Simultaneous mixed likes and unlikes maintain exact count consistency")
    void testConcurrentMixedLikesAndUnlikes() throws InterruptedException {
        CreateProjectRequest req = new CreateProjectRequest(
                "Mixed Concurrency Engine",
                "Systems",
                "Testing mixed concurrent like and unlike toggles",
                List.of("Rust", "PostgreSQL")
        );
        ProjectResponse project = projectService.createProject(req, createTestAuthor());
        UUID projectId = project.getId();

        // Seed 10 existing likes
        int userCount = 10;
        List<UUID> userIds = new ArrayList<>();
        for (int i = 0; i < userCount; i++) {
            User user = new User("mixedUser_" + i + "_" + UUID.randomUUID().toString().substring(0, 6),
                    "mixed_" + i + "_" + UUID.randomUUID().toString().substring(0, 6) + "@devsphere.io",
                    "secret",
                    Role.ROLE_USER);
            user = userRepository.save(user);
            userIds.add(user.getId());
            projectService.toggleLike(projectId, user.getId());
        }

        long initialRows = projectLikeRepository.countByProjectId(projectId);
        assertThat(initialRows).isEqualTo(10L);

        // Concurrently toggle all 10 users twice (unlike then like back)
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(userCount);

        for (UUID userId : userIds) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    projectService.toggleLike(projectId, userId);
                    projectService.toggleLike(projectId, userId);
                } catch (Exception ignored) {
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = finishLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();

        long finalLikeRows = projectLikeRepository.countByProjectId(projectId);
        ProjectResponse finalProject = projectService.getProjectById(projectId, null);

        // Project likes count and actual table row count must remain 100% synchronized
        assertThat(finalProject.getLikes()).isEqualTo((int) finalLikeRows);
    }

    @Test
    @DisplayName("Error Handling: Incrementing views on nonexistent project must throw ResourceNotFoundException")
    void testIncrementViews_NonexistentProject_ThrowsException() {
        UUID nonexistentId = UUID.randomUUID();
        assertThrows(ResourceNotFoundException.class, () -> projectService.incrementViews(nonexistentId));
    }

    @Test
    @DisplayName("Developer Statistics: Metrics must be derived from actual database records, not hardcoded constants")
    void testDeveloperStats_DerivedFromActualDatabaseRecords() {
        // 1. Create a user and associated developer profile
        User devUser = new User("statsDev_" + UUID.randomUUID().toString().substring(0, 6),
                "stats_" + UUID.randomUUID().toString().substring(0, 6) + "@devsphere.io",
                "pass",
                Role.ROLE_USER);
        devUser = userRepository.save(devUser);

        DeveloperProfile profile = new DeveloperProfile(
                "Stats Architect",
                "Systems Engineer",
                "Bio",
                "Worldwide",
                "a1",
                Set.of("Java", "PostgreSQL")
        );
        profile.setUser(devUser);
        profile = developerProfileRepository.save(profile);

        // 2. Initially author has 0 projects, 0 blogs, 0 connections
        DeveloperStatsResponse initialStats = developerService.getDeveloperStats(profile.getId());
        assertThat(initialStats.getProjectsCount()).isZero();
        assertThat(initialStats.getBlogsCount()).isZero();
        assertThat(initialStats.getConnectionsCount()).isZero();

        // 3. Create 2 projects for this user
        projectService.createProject(new CreateProjectRequest("Project Alpha", "Web", "Desc", List.of("Java")), devUser.getId());
        projectService.createProject(new CreateProjectRequest("Project Beta", "Web", "Desc", List.of("Spring")), devUser.getId());

        // 4. Query stats again - must reflect exactly 2 projects
        DeveloperStatsResponse updatedStats = developerService.getDeveloperStats(profile.getId());
        assertThat(updatedStats.getProjectsCount()).isEqualTo(2);
        assertThat(updatedStats.getBlogsCount()).isZero();
        assertThat(updatedStats.getConnectionsCount()).isZero();
    }
}
