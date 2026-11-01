package com.devsphere.service.impl;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.KnowledgeTrailResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.entity.*;
import com.devsphere.exception.ForbiddenException;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.exception.UnauthorizedException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.*;
import com.devsphere.service.BlogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final BlogBookmarkRepository blogBookmarkRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final KnowledgeTrailRepository knowledgeTrailRepository;
    private final EntityDtoMapper mapper;

    public BlogServiceImpl(
            BlogRepository blogRepository,
            UserRepository userRepository,
            BlogLikeRepository blogLikeRepository,
            BlogBookmarkRepository blogBookmarkRepository,
            BlogCommentRepository blogCommentRepository,
            KnowledgeTrailRepository knowledgeTrailRepository,
            EntityDtoMapper mapper
    ) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
        this.blogLikeRepository = blogLikeRepository;
        this.blogBookmarkRepository = blogBookmarkRepository;
        this.blogCommentRepository = blogCommentRepository;
        this.knowledgeTrailRepository = knowledgeTrailRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BlogResponse> getBlogs(String category, String query, Pageable pageable, UUID currentUserId) {
        Page<Blog> page = blogRepository.searchBlogs(BlogStatus.PUBLISHED, category, query, pageable);
        List<BlogResponse> content = page.getContent().stream()
                .map(blog -> {
                    BlogResponse res = mapper.toBlogResponse(blog, currentUserId);
                    if (currentUserId != null) {
                        res.setLiked(blogLikeRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId));
                        res.setBookmarked(blogBookmarkRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId));
                    }
                    return res;
                })
                .toList();

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public BlogResponse getBlogById(UUID id, UUID currentUserId) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));

        if (blog.getStatus() == BlogStatus.DRAFT) {
            if (currentUserId == null) {
                throw new UnauthorizedException("Authentication required to view draft blogs");
            }
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));
            boolean isAuthor = blog.getAuthor() != null && blog.getAuthor().getId().equals(currentUserId);
            boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
            if (!isAuthor && !isAdmin) {
                throw new ForbiddenException("Draft blogs are private to the author");
            }
        }

        BlogResponse res = mapper.toBlogResponse(blog, currentUserId);
        if (currentUserId != null) {
            res.setLiked(blogLikeRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId));
            res.setBookmarked(blogBookmarkRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId));
        }
        return res;
    }

    @Override
    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to create a blog");
        }
        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        String authorName = author.getUsername();

        BlogStatus status = request.isDraft() ? BlogStatus.DRAFT : BlogStatus.PUBLISHED;
        String readTime = calculateReadTime(request.getContent());
        String tech = request.getTech() != null && !request.getTech().isBlank() ? request.getTech() : request.getCategory();

        Blog blog = new Blog(
                request.getTitle().trim(),
                request.getCategory().trim(),
                request.getContent().trim(),
                authorName,
                tech,
                readTime,
                status
        );
        blog.setAuthor(author);

        if (request.getCoverImage() != null && !request.getCoverImage().trim().isEmpty()) {
            blog.setCoverImage(request.getCoverImage().trim());
        }
        if (request.getSubtitle() != null && !request.getSubtitle().trim().isEmpty()) {
            blog.setSubtitle(request.getSubtitle().trim());
        }
        if (request.getDifficulty() != null && !request.getDifficulty().trim().isEmpty()) {
            blog.setDifficulty(request.getDifficulty().trim());
        }
        if (request.getPrerequisites() != null && !request.getPrerequisites().trim().isEmpty()) {
            blog.setPrerequisites(request.getPrerequisites().trim());
        }
        if (request.getTakeaways() != null && !request.getTakeaways().trim().isEmpty()) {
            blog.setTakeaways(request.getTakeaways().trim());
        }

        if (request.getTags() != null) {
            Set<String> cleanTags = new HashSet<>();
            for (String tag : request.getTags()) {
                if (tag != null && !tag.trim().isEmpty()) {
                    cleanTags.add(tag.trim());
                }
            }
            blog.setTags(cleanTags);
        }

        Blog saved = blogRepository.save(blog);
        return mapper.toBlogResponse(saved, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getDrafts(UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to view drafts");
        }

        List<Blog> drafts = blogRepository.findByAuthorIdAndStatus(currentUserId, BlogStatus.DRAFT);
        return drafts.stream()
                .map(blog -> mapper.toBlogResponse(blog, currentUserId))
                .toList();
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to update blog");
        }

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));

        verifyOwnershipOrAdmin(blog, currentUserId);

        blog.setTitle(request.getTitle().trim());
        blog.setCategory(request.getCategory().trim());
        blog.setContent(request.getContent().trim());
        blog.setReadTime(calculateReadTime(request.getContent()));
        if (request.getTech() != null) {
            blog.setTech(request.getTech().trim());
        }
        if (request.getStatus() != null) {
            blog.setStatus(request.getStatus());
        }
        if (request.getTags() != null) {
            Set<String> cleanTags = new HashSet<>();
            for (String tag : request.getTags()) {
                if (tag != null && !tag.trim().isEmpty()) {
                    cleanTags.add(tag.trim());
                }
            }
            blog.setTags(cleanTags);
        }

        Blog updated = blogRepository.save(blog);
        return mapper.toBlogResponse(updated, currentUserId);
    }

    @Override
    @Transactional
    public void deleteBlog(UUID id, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to delete blog");
        }

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));

        verifyOwnershipOrAdmin(blog, currentUserId);
        blogRepository.delete(blog);
    }

    @Override
    @Transactional
    public BlogResponse toggleLike(UUID id, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to like a blog");
        }
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Optional<BlogLike> existing = blogLikeRepository.findByBlogIdAndUserId(id, currentUserId);
        boolean likedNow;
        if (existing.isPresent()) {
            blogLikeRepository.delete(existing.get());
            blog.setLikes(Math.max(0, blog.getLikes() - 1));
            likedNow = false;
        } else {
            blogLikeRepository.save(new BlogLike(blog, user));
            blog.setLikes(blog.getLikes() + 1);
            likedNow = true;
        }

        Blog saved = blogRepository.save(blog);
        BlogResponse res = mapper.toBlogResponse(saved, currentUserId);
        res.setLiked(likedNow);
        res.setBookmarked(blogBookmarkRepository.existsByBlogIdAndUserId(id, currentUserId));
        return res;
    }

    @Override
    @Transactional
    public BlogResponse toggleBookmark(UUID id, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to bookmark a blog");
        }
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Optional<BlogBookmark> existing = blogBookmarkRepository.findByBlogIdAndUserId(id, currentUserId);
        boolean bookmarkedNow;
        if (existing.isPresent()) {
            blogBookmarkRepository.delete(existing.get());
            blog.setBookmarks(Math.max(0, blog.getBookmarks() - 1));
            bookmarkedNow = false;
        } else {
            blogBookmarkRepository.save(new BlogBookmark(blog, user));
            blog.setBookmarks(blog.getBookmarks() + 1);
            bookmarkedNow = true;
        }

        Blog saved = blogRepository.save(blog);
        BlogResponse res = mapper.toBlogResponse(saved, currentUserId);
        res.setBookmarked(bookmarkedNow);
        res.setLiked(blogLikeRepository.existsByBlogIdAndUserId(id, currentUserId));
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID blogId, UUID currentUserId) {
        List<BlogComment> comments = blogCommentRepository.findByBlogIdOrderByCreatedAtDesc(blogId);
        return comments.stream().map(c -> {
            boolean isOwner = currentUserId != null && c.getUser() != null && currentUserId.equals(c.getUser().getId());
            UUID parentId = c.getParent() != null ? c.getParent().getId() : null;
            return new CommentResponse(c.getId(), c.getAuthorName(), c.getContent(), parentId, c.getCreatedAt(), isOwner);
        }).toList();
    }

    @Override
    @Transactional
    public CommentResponse addComment(UUID blogId, CommentRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to post comments");
        }
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + blogId));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        BlogComment parent = null;
        if (request.getParentId() != null) {
            parent = blogCommentRepository.findById(request.getParentId()).orElse(null);
        }

        BlogComment comment = new BlogComment(blog, user, user.getUsername(), request.getContent().trim(), parent);
        BlogComment saved = blogCommentRepository.save(comment);

        return new CommentResponse(saved.getId(), saved.getAuthorName(), saved.getContent(), request.getParentId(), saved.getCreatedAt(), true);
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to delete comments");
        }
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!comment.getUser().getId().equals(currentUserId) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You cannot delete another user's comment");
        }

        blogCommentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<KnowledgeTrailResponse> getKnowledgeTrails() {
        return knowledgeTrailRepository.findAll().stream().map(trail -> {
            List<BlogResponse> articles = trail.getArticles().stream()
                    .map(b -> mapper.toBlogResponse(b, null))
                    .toList();
            return new KnowledgeTrailResponse(
                    trail.getId(),
                    trail.getTitle(),
                    trail.getDescription(),
                    trail.getCategory(),
                    trail.getAuthorName(),
                    trail.getCoverImage(),
                    trail.getEstimatedHours(),
                    trail.getDifficulty(),
                    articles.size(),
                    articles,
                    trail.getCreatedAt()
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeTrailResponse getKnowledgeTrailById(UUID trailId) {
        KnowledgeTrail trail = knowledgeTrailRepository.findById(trailId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge trail not found with id: " + trailId));

        List<BlogResponse> articles = trail.getArticles().stream()
                .map(b -> mapper.toBlogResponse(b, null))
                .toList();

        return new KnowledgeTrailResponse(
                trail.getId(),
                trail.getTitle(),
                trail.getDescription(),
                trail.getCategory(),
                trail.getAuthorName(),
                trail.getCoverImage(),
                trail.getEstimatedHours(),
                trail.getDifficulty(),
                articles.size(),
                articles,
                trail.getCreatedAt()
        );
    }

    private void verifyOwnershipOrAdmin(Blog blog, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return;
        }

        if (blog.getAuthor() == null || !blog.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to modify or delete this blog post");
        }
    }

    private String calculateReadTime(String content) {
        if (content == null || content.isBlank()) {
            return "1 min read";
        }
        int words = content.trim().split("\\s+").length;
        int minutes = Math.max(1, (int) Math.ceil(words / 200.0));
        return minutes + " min read";
    }
}
