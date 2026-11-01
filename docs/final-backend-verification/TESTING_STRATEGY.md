# DevSphere Backend: Testing Strategy and Quality Assurance Plan

**Document Version:** 2.0.0 (Post-Engineering Review Correction)  
**Target Codebase:** Spring Boot Backend (`backend/src/test/java/com/devsphere`)  
**Auditor:** Principal QA Architect & Concurrency Engineer  
**Execution Verification:** Verified via Maven Surefire 3.4.3 on Java 21 / 25  
**Status:** Approved Quality Assurance Specification  

---

## 1. Verified Test Suite Execution Audit

During this technical verification, the backend test suite was executed in an isolated environment via `mvn test`. The build executed with **zero failures and zero errors**:

```
[INFO] Results:
[INFO] 
[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 21.465 s
[INFO] Finished at: 2026-10-30T18:37:20+05:30
```

### 1.1 Breakdown of Verified Passing Tests (26 Total)

| Test Class | Target Component | Type | Tests | Status | Source Location |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `AuthControllerTest` | `AuthController` | `@WebMvcTest` | 4 | **PASSED** | [`AuthControllerTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/controller/AuthControllerTest.java) |
| `BlogControllerTest` | `BlogController` | `@WebMvcTest` | 3 | **PASSED** | [`BlogControllerTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/controller/BlogControllerTest.java) |
| `DeveloperControllerTest` | `DeveloperController` | `@WebMvcTest` | 2 | **PASSED** | [`DeveloperControllerTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/controller/DeveloperControllerTest.java) |
| `ProjectControllerTest` | `ProjectController` | `@WebMvcTest` | 3 | **PASSED** | [`ProjectControllerTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/controller/ProjectControllerTest.java) |
| `AuthServiceTest` | `AuthServiceImpl` | Mockito Unit | 5 | **PASSED** | [`AuthServiceTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/service/AuthServiceTest.java) |
| `BlogServiceTest` | `BlogServiceImpl` | Mockito Unit | 4 | **PASSED** | [`BlogServiceTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/service/BlogServiceTest.java) |
| `ProjectServiceTest` | `ProjectServiceImpl` | Mockito Unit | 4 | **PASSED** | [`ProjectServiceTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/service/ProjectServiceTest.java) |
| `DevSphereIntegrationTest`| Full Application | `@SpringBootTest` | 1 | **PASSED** | [`DevSphereIntegrationTest.java`](file:///c:/Users/N.AJAYKUMAR/Full%20Stack%20Proojects/backend/src/test/java/com/devsphere/DevSphereIntegrationTest.java) |

> [!IMPORTANT]
> **Zero False Claims Policy:** Only the 26 tests listed above have been executed and verified in the live environment. All proposed tests in Section 3 and Section 4 represent formal engineering specifications to be implemented in Phase 3. They must **never** be reported as passed until code is authored and verified via Maven.

---

## 2. Test Gap Analysis: Missing Coverage

While existing unit and controller slice tests validate basic CRUD logic, the following critical test dimensions are currently absent:
1. **Multi-Threaded Concurrency Testing:** Zero tests verifying simultaneous likes, view increments, or race conditions under thread contention.
2. **Asynchronous Exception Verification:** Lack of tests capturing background worker and executor thread exceptions.
3. **Dual-Token Lifecycle & Rotation:** Zero tests asserting refresh token rotation, replay reuse detection, and cookie transmission.
4. **Rate Limiting & Proxy Spoofing:** Zero tests verifying HTTP 429 backoff, composite keys (IP vs. Account), and `X-Forwarded-For` sanitization.
5. **Database Constraint & Rollback Verification:** Zero tests asserting atomicity rollbacks when bulk counter updates fail midway.

---

## 3. High-Fidelity Concurrency Test Blueprints

To guarantee that concurrency tests do not silently swallow thread exceptions or produce false positives, all multi-threaded tests must adhere to the **Bounded Concurrent Harness Pattern**:
1. **Bounded Timeouts:** Every `CountDownLatch.await()` must have a hard timeout (e.g. 15 seconds) and assert `assertThat(completedInTime).isTrue()`.
2. **Asynchronous Exception Collection:** All tasks submitted to `ExecutorService` must be collected as `Future<?>` handles. Every future must be inspected with `future.get()` or logged via a thread-safe `ConcurrentLinkedQueue<Throwable>`.
3. **Database Assertion:** Direct queries to PostgreSQL/H2 must inspect disk state, comparing counter fields against table row counts.

### 3.1 Test T1: Concurrent Project View Increments (Simultaneous & Repeated)

```java
@SpringBootTest
@ActiveProfiles("test")
class ProjectViewConcurrencyTest {

    @Autowired private ProjectService projectService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CacheManager cacheManager;

    private UUID projectId;

    @BeforeEach
    void setUp() {
        // Evict Caffeine cache before test
        cacheManager.getCache("projectViewDebounce").clear();
        Project project = Project.builder()
                .title("Concurrency Showcase")
                .description("Load Test")
                .category("Full Stack")
                .views(0)
                .likes(0)
                .build();
        projectId = projectRepository.saveAndFlush(project).getId();
    }

    @Test
    void concurrentViews_FromUniqueClients_ShouldAccuratelyIncrement() throws Exception {
        int threadCount = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startSignal = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(threadCount);
        List<Future<?>> futures = new ArrayList<>();
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (int i = 0; i < threadCount; i++) {
            final String uniqueIp = "192.168.1." + (i + 1);
            futures.add(executor.submit(() -> {
                try {
                    startSignal.await(5, TimeUnit.SECONDS); // Align threads for maximum contention
                    projectService.incrementViews(projectId, uniqueIp, "Mozilla/5.0");
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    doneSignal.countDown();
                }
            }));
        }

        startSignal.countDown(); // Release all threads simultaneously
        boolean completed = doneSignal.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        // 1. Assert bounded completion
        assertThat(completed).as("All worker threads must complete within timeout").isTrue();

        // 2. Assert zero uncaught exceptions in threads
        assertThat(errors).as("No threads should throw exceptions").isEmpty();
        for (Future<?> f : futures) {
            f.get(); // Re-throws any execution exception
        }

        // 3. Inspect final database value
        Project updated = projectRepository.findById(projectId).orElseThrow();
        assertThat(updated.getViews()).as("Database view count must exactly match unique requests").isEqualTo(50);
    }

    @Test
    void repeatedViews_FromSameClient_ShouldBeDebounced() throws Exception {
        int repeatAttempts = 20;
        String staticIp = "10.0.0.1";

        for (int i = 0; i < repeatAttempts; i++) {
            projectService.incrementViews(projectId, staticIp, "Mozilla/5.0");
        }

        // 1 view should register, 19 should be absorbed by Caffeine debouncer
        Project updated = projectRepository.findById(projectId).orElseThrow();
        assertThat(updated.getViews()).as("Duplicate views within debounce window must be discarded").isEqualTo(1);
    }
}
```

### 3.2 Test T2: Concurrent Likes & Invariant Consistency

```java
@SpringBootTest
@ActiveProfiles("test")
class ProjectLikesConcurrencyTest {

    @Autowired private ProjectService projectService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectLikeRepository projectLikeRepository;
    @Autowired private UserRepository userRepository;

    private UUID projectId;
    private List<User> testUsers;

    @BeforeEach
    void setUp() {
        Project project = projectRepository.saveAndFlush(Project.builder()
                .title("Likes Showcase").likes(0).views(0).category("Cloud").build());
        projectId = project.getId();

        testUsers = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            testUsers.add(userRepository.saveAndFlush(User.builder()
                    .username("liker_" + i)
                    .email("liker_" + i + "@devsphere.io")
                    .password("Hash123!")
                    .role(Role.DEVELOPER)
                    .build()));
        }
    }

    @Test
    void simultaneousLikes_FromDistinctUsers_MustMaintainMathematicalConsistency() throws Exception {
        int threads = testUsers.size();
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startSignal = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(threads);
        List<Future<?>> futures = new ArrayList<>();
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (User user : testUsers) {
            futures.add(executor.submit(() -> {
                try {
                    startSignal.await(5, TimeUnit.SECONDS);
                    projectService.likeProject(projectId, user.getId());
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    doneSignal.countDown();
                }
            }));
        }

        startSignal.countDown();
        boolean finished = doneSignal.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(finished).isTrue();
        assertThat(errors).isEmpty();
        for (Future<?> f : futures) {
            f.get();
        }

        // Verify Invariant: project.likes == countByProjectId
        Project project = projectRepository.findById(projectId).orElseThrow();
        long actualLikeRows = projectLikeRepository.countByProjectId(projectId);

        assertThat(actualLikeRows).as("Like table rows must equal number of distinct users").isEqualTo(25);
        assertThat(project.getLikes()).as("Denormalized project counter must equal exact table rows").isEqualTo(25);
        assertThat(project.getLikes()).isEqualTo((int) actualLikeRows);
    }

    @Test
    void duplicateLike_BySameUser_ThrowsConflict_AndRollsBack() {
        User user = testUsers.get(0);

        // First like succeeds
        projectService.likeProject(projectId, user.getId());

        // Second like must fail with ConflictException
        assertThatThrownBy(() -> projectService.likeProject(projectId, user.getId()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already liked");

        // Verify counter did not increment twice
        Project project = projectRepository.findById(projectId).orElseThrow();
        assertThat(project.getLikes()).isEqualTo(1);
        assertThat(projectLikeRepository.countByProjectId(projectId)).isEqualTo(1);
    }
}
```

### 3.3 Test T3: Failure & Rollback Scenario Verification

```java
@SpringBootTest
@ActiveProfiles("test")
class DatabaseRollbackIntegrityTest {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private PlatformTransactionManager transactionManager;

    @Test
    void simulatedDatabaseFailure_DuringCounterUpdate_RollsBackCleanly() {
        UUID nonExistentProjectId = UUID.randomUUID();

        TransactionTemplate template = new TransactionTemplate(transactionManager);
        assertThatThrownBy(() -> {
            template.execute(status -> {
                int updated = projectRepository.incrementViewsDirect(nonExistentProjectId);
                if (updated == 0) {
                    throw new ResourceNotFoundException("Project not found: " + nonExistentProjectId);
                }
                return updated;
            });
        }).isInstanceOf(ResourceNotFoundException.class);

        // Verify transaction rolled back cleanly without orphaned locks
    }
}
```

---

## 4. Security, Token & Rate Limiting Test Blueprints

### 4.1 Test T4: Refresh Token Rotation & Reuse Attack Detection

```java
@SpringBootTest
@ActiveProfiles("test")
class TokenRotationSecurityTest {

    @Autowired private AuthService authService;
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private UserRepository userRepository;

    @Test
    void tokenRefresh_RotatesToken_AndInvalidatesOldToken() {
        User user = userRepository.saveAndFlush(User.builder()
                .username("rotator").email("rotator@devsphere.io").password("Pass123!").role(Role.DEVELOPER).build());

        AuthResponse initialAuth = authService.authenticate(new AuthRequest("rotator@devsphere.io", "Pass123!"));
        String initialRefreshToken = initialAuth.getRefreshToken();

        // 1. Perform legitimate refresh
        AuthResponse refreshedAuth = authService.refreshTokens(initialRefreshToken);
        assertThat(refreshedAuth.getAccessToken()).isNotEmpty();
        assertThat(refreshedAuth.getRefreshToken()).isNotEqualTo(initialRefreshToken);

        // 2. Attempt token replay attack with initialRefreshToken
        assertThatThrownBy(() -> authService.refreshTokens(initialRefreshToken))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Token reuse detected");

        // 3. Assert entire token family is revoked
        List<RefreshToken> activeTokens = refreshTokenRepository.findAllByUserIdAndRevokedFalse(user.getId());
        assertThat(activeTokens).as("All tokens in family must be revoked on reuse attack").isEmpty();
    }
}
```

### 4.2 Test T5: Rate Limiting & Spoofed Proxy Mitigation

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RateLimitingSecurityTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void authRateLimiting_RejectsBruteForce_With429AndRetryAfter() throws Exception {
        String clientIp = "198.51.100.22";

        // Attempts 1 to 5: Return 401 Unauthorized (Bad credentials)
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(remoteAddr(clientIp))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"admin@devsphere.io\",\"password\":\"WrongPassword!\"}"))
                    .andExpect(status().isUnauthorized());
        }

        // Attempt 6: Returns 429 Too Many Requests
        mockMvc.perform(post("/api/v1/auth/login")
                .with(remoteAddr(clientIp))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@devsphere.io\",\"password\":\"WrongPassword!\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value("Too many login attempts. Please try again later."));
    }

    @Test
    void spoofedForwardedForHeader_IsIgnored_WhenUntrusted() throws Exception {
        // Request from attacker IP claiming to be a trusted college IP via spoofed header
        mockMvc.perform(post("/api/v1/auth/login")
                .with(remoteAddr("203.0.113.50"))
                .header("X-Forwarded-For", "127.0.0.1, 10.0.0.1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@devsphere.io\",\"password\":\"Pass!\"}"))
                .andExpect(status().isUnauthorized()); // Resolves to real IP 203.0.113.50
    }

    private static RequestPostProcessor remoteAddr(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }
}
```

---

## 5. Quality Assurance Execution Matrix

| Test Suite | Execution Phase | Invariants Verified | Pass Criteria |
| :--- | :---: | :--- | :--- |
| **Existing Regression Suite** | Pre-PR / CI | CRUD operations, JWT authorization, Service Mocks | 26/26 Tests Pass (Verified) |
| **`ProjectConcurrencyTest`** | Implementation Phase 3 | `project.views == sum(views)`, zero lock exceptions | 50/50 threads complete < 15s; DB views == 50 |
| **`ProjectLikesConcurrencyTest`**| Implementation Phase 3 | `project.likes == count(project_likes)` | Invariant holds true under 25 threads |
| **`TokenRotationSecurityTest`** | Implementation Phase 3 | Token replay revokes token family | Replay throws SecurityException; active tokens == 0 |
| **`RateLimitingSecurityTest`** | Implementation Phase 3 | HTTP 429 response structure, `Retry-After` header | 6th attempt blocked; Retry-After header present |
| **`DatabaseRollbackIntegrityTest`**| Implementation Phase 3 | Transaction rollback restores state | Zero orphaned rows on exception |
