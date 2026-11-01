package com.devsphere.service;

import com.devsphere.dto.request.CreateProjectRequest;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.dto.response.ProjectResponse;
import com.devsphere.entity.Project;
import com.devsphere.entity.ProjectLike;
import com.devsphere.entity.Role;
import com.devsphere.entity.User;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.ProjectBookmarkRepository;
import com.devsphere.repository.ProjectCommentRepository;
import com.devsphere.repository.ProjectLikeRepository;
import com.devsphere.repository.ProjectRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.service.GitHubService;
import com.devsphere.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectLikeRepository projectLikeRepository;

    @Mock
    private ProjectBookmarkRepository projectBookmarkRepository;

    @Mock
    private ProjectCommentRepository projectCommentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GitHubService gitHubService;

    private EntityDtoMapper mapper;
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        mapper = new EntityDtoMapper();
        projectService = new ProjectServiceImpl(
                projectRepository,
                projectLikeRepository,
                projectBookmarkRepository,
                projectCommentRepository,
                userRepository,
                gitHubService,
                mapper
        );
    }

    @Test
    void getProjects_Success() {
        Project project = new Project("Finance Tracker", "Web Development", "Budget tool", "Ajay", List.of("React"), 10, 50);
        project.setId(UUID.randomUUID());
        project.setCreatedAt(Instant.now());

        Page<Project> page = new PageImpl<>(List.of(project));
        when(projectRepository.searchProjects(eq("Web Development"), eq("Finance"), any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<ProjectResponse> response = projectService.getProjects("Web Development", "Finance", "Latest", Pageable.ofSize(10), null);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getTitle()).isEqualTo("Finance Tracker");
    }

    @Test
    void createProject_Success() {
        UUID userId = UUID.randomUUID();
        User author = new User("ajay", "ajay@devsphere.io", "pass", Role.ROLE_USER);
        author.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(author));

        CreateProjectRequest request = new CreateProjectRequest("AI Bot", "AI/ML", "Smart assistant", List.of("Python", "FastAPI"));

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            p.setCreatedAt(Instant.now());
            return p;
        });

        ProjectResponse response = projectService.createProject(request, userId);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("AI Bot");
        assertThat(response.getAuthor()).isEqualTo("ajay");
        assertThat(response.getTechnologies()).contains("Python", "FastAPI");
    }

    @Test
    void toggleLike_WhenNotLiked_LikesProject() {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Project project = new Project("Portfolio", "Web", "Desc", "Author", List.of(), 5, 20);
        project.setId(projectId);
        User user = new User("user", "user@devsphere.io", "pass", Role.ROLE_USER);
        user.setId(userId);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(projectLikeRepository.findByProjectIdAndUserId(projectId, userId)).thenReturn(Optional.empty());

        ProjectResponse response = projectService.toggleLike(projectId, userId);

        assertThat(response.isLiked()).isTrue();
        assertThat(response.getLikes()).isEqualTo(6);
        verify(projectLikeRepository).save(any(ProjectLike.class));
    }

    @Test
    void toggleLike_WhenAlreadyLiked_UnlikesProject() {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Project project = new Project("Portfolio", "Web", "Desc", "Author", List.of(), 5, 20);
        project.setId(projectId);
        User user = new User("user", "user@devsphere.io", "pass", Role.ROLE_USER);
        user.setId(userId);

        ProjectLike existingLike = new ProjectLike(project, user);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(projectLikeRepository.findByProjectIdAndUserId(projectId, userId)).thenReturn(Optional.of(existingLike));

        ProjectResponse response = projectService.toggleLike(projectId, userId);

        assertThat(response.isLiked()).isFalse();
        assertThat(response.getLikes()).isEqualTo(4);
        verify(projectLikeRepository).delete(existingLike);
    }
}
