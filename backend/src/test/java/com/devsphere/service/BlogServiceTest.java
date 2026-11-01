package com.devsphere.service;

import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.entity.Blog;
import com.devsphere.entity.BlogStatus;
import com.devsphere.entity.Role;
import com.devsphere.entity.User;
import com.devsphere.exception.ForbiddenException;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.BlogBookmarkRepository;
import com.devsphere.repository.BlogCommentRepository;
import com.devsphere.repository.BlogLikeRepository;
import com.devsphere.repository.BlogRepository;
import com.devsphere.repository.KnowledgeTrailRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.service.impl.BlogServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogServiceTest {

    @Mock
    private BlogRepository blogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BlogLikeRepository blogLikeRepository;

    @Mock
    private BlogBookmarkRepository blogBookmarkRepository;

    @Mock
    private BlogCommentRepository blogCommentRepository;

    @Mock
    private KnowledgeTrailRepository knowledgeTrailRepository;

    private EntityDtoMapper mapper;
    private BlogService blogService;

    @BeforeEach
    void setUp() {
        mapper = new EntityDtoMapper();
        blogService = new BlogServiceImpl(
                blogRepository,
                userRepository,
                blogLikeRepository,
                blogBookmarkRepository,
                blogCommentRepository,
                knowledgeTrailRepository,
                mapper
        );
    }

    @Test
    void getBlogs_Success() {
        Blog blog = new Blog("React Hooks", "Web Development", "Content here", "Ajay", "React", "5 min read", BlogStatus.PUBLISHED);
        blog.setId(UUID.randomUUID());
        blog.setCreatedAt(Instant.now());

        Page<Blog> page = new PageImpl<>(List.of(blog), PageRequest.of(0, 10), 1);
        when(blogRepository.searchBlogs(eq(BlogStatus.PUBLISHED), eq("Web Development"), eq("React"), any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<BlogResponse> response = blogService.getBlogs("Web Development", "React", PageRequest.of(0, 10), null);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getTitle()).isEqualTo("React Hooks");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    void createBlog_Success() {
        UUID userId = UUID.randomUUID();
        User author = new User("ajay", "ajay@devsphere.io", "pass", Role.ROLE_USER);
        author.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));

        CreateBlogRequest request = new CreateBlogRequest("Mastering SQL", "Database", "Learn joins and indexes", "SQL", List.of("sql", "db"), false);

        when(blogRepository.save(any(Blog.class))).thenAnswer(invocation -> {
            Blog b = invocation.getArgument(0);
            b.setId(UUID.randomUUID());
            b.setCreatedAt(Instant.now());
            return b;
        });

        BlogResponse response = blogService.createBlog(request, userId);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Mastering SQL");
        assertThat(response.getAuthor()).isEqualTo("ajay");
        assertThat(response.getStatus()).isEqualTo(BlogStatus.PUBLISHED);
    }

    @Test
    void updateBlog_NonOwner_ThrowsForbiddenException() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID blogId = UUID.randomUUID();

        User owner = new User("owner", "owner@devsphere.io", "pass", Role.ROLE_USER);
        owner.setId(ownerId);

        User otherUser = new User("other", "other@devsphere.io", "pass", Role.ROLE_USER);
        otherUser.setId(otherUserId);

        Blog blog = new Blog("Original Title", "Tech", "Content", "owner", "Tech", "3 min read", BlogStatus.PUBLISHED);
        blog.setId(blogId);
        blog.setAuthor(owner);

        when(blogRepository.findById(blogId)).thenReturn(Optional.of(blog));
        when(userRepository.findById(otherUserId)).thenReturn(Optional.of(otherUser));

        UpdateBlogRequest request = new UpdateBlogRequest();
        request.setTitle("Hacked Title");
        request.setCategory("Tech");
        request.setContent("Hacked content");

        assertThatThrownBy(() -> blogService.updateBlog(blogId, request, otherUserId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("You do not have permission");
    }

    @Test
    void deleteBlog_NotFound_ThrowsResourceNotFoundException() {
        UUID blogId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(blogRepository.findById(blogId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> blogService.deleteBlog(blogId, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Blog not found");
    }
}
