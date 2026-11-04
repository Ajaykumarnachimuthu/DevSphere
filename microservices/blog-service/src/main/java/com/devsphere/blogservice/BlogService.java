package com.devsphere.blogservice;

import com.devsphere.blogservice.dto.*;
import com.devsphere.blogservice.entity.*;
import com.devsphere.blogservice.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class BlogService {

    private final BlogRepository blogRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final BlogBookmarkRepository blogBookmarkRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final KnowledgeTrailRepository knowledgeTrailRepository;

    public BlogService(
            BlogRepository blogRepository,
            BlogLikeRepository blogLikeRepository,
            BlogBookmarkRepository blogBookmarkRepository,
            BlogCommentRepository blogCommentRepository,
            KnowledgeTrailRepository knowledgeTrailRepository
    ) {
        this.blogRepository = blogRepository;
        this.blogLikeRepository = blogLikeRepository;
        this.blogBookmarkRepository = blogBookmarkRepository;
        this.blogCommentRepository = blogCommentRepository;
        this.knowledgeTrailRepository = knowledgeTrailRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<BlogResponse> getBlogs(String category, String query, int page, int size, UUID currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String cleanCategory = (category != null && !category.equalsIgnoreCase("All") && !category.isBlank()) ? category.trim() : null;
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;

        Page<Blog> blogPage = blogRepository.searchBlogs("PUBLISHED", cleanCategory, cleanQuery, pageable);

        List<BlogResponse> responses = blogPage.getContent().stream()
                .map(b -> mapToResponse(b, currentUserId))
                .toList();

        return new PagedResponse<>(
                responses,
                blogPage.getNumber(),
                blogPage.getSize(),
                blogPage.getTotalElements(),
                blogPage.getTotalPages(),
                blogPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public Optional<BlogResponse> getBlogById(UUID id, UUID currentUserId, boolean isAdmin) {
        return blogRepository.findById(id).map(blog -> {
            if ("DRAFT".equalsIgnoreCase(blog.getStatus())) {
                boolean isAuthor = currentUserId != null && blog.getAuthorId() != null && currentUserId.equals(blog.getAuthorId());
                if (!isAuthor && !isAdmin) {
                    throw new SecurityException("Draft blogs are private to author");
                }
            }
            return mapToResponse(blog, currentUserId);
        });
    }

    @Transactional(readOnly = true)
    public List<BlogResponse> getDrafts(UUID currentUserId) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to view drafts");
        }
        return blogRepository.findByAuthorIdAndStatus(currentUserId, "DRAFT").stream()
                .map(b -> mapToResponse(b, currentUserId))
                .toList();
    }

    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, UUID authorId, String authorName) {
        if (authorId == null) {
            throw new SecurityException("Authentication required to create a blog");
        }

        String readTime = calculateReadTime(request.getContent());
        String status = request.isDraft() ? "DRAFT" : "PUBLISHED";
        String tech = request.getTech() != null && !request.getTech().isBlank() ? request.getTech().trim() : request.getCategory();

        Blog blog = new Blog(
                request.getTitle().trim(),
                request.getCategory().trim(),
                request.getContent().trim(),
                authorName != null ? authorName : "Developer",
                tech,
                readTime,
                status
        );
        blog.setAuthorId(authorId);

        if (request.getSubtitle() != null) blog.setSubtitle(request.getSubtitle().trim());
        if (request.getCoverImage() != null) blog.setCoverImage(request.getCoverImage().trim());
        if (request.getDifficulty() != null) blog.setDifficulty(request.getDifficulty().trim());
        if (request.getPrerequisites() != null) blog.setPrerequisites(request.getPrerequisites().trim());
        if (request.getTakeaways() != null) blog.setTakeaways(request.getTakeaways().trim());

        if (request.getTags() != null) {
            Set<String> cleanTags = new HashSet<>();
            for (String tag : request.getTags()) {
                if (tag != null && !tag.isBlank()) cleanTags.add(tag.trim());
            }
            blog.setTags(cleanTags);
        }

        Blog saved = blogRepository.save(blog);
        return mapToResponse(saved, authorId);
    }

    @Transactional
    public Optional<BlogResponse> updateBlog(UUID id, UpdateBlogRequest request, UUID currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to update blog");
        }

        return blogRepository.findById(id).map(existing -> {
            boolean isAuthor = existing.getAuthorId() != null && existing.getAuthorId().equals(currentUserId);
            if (!isAuthor && !isAdmin) {
                throw new SecurityException("You do not have permission to modify this blog post");
            }

            existing.setTitle(request.getTitle().trim());
            existing.setCategory(request.getCategory().trim());
            existing.setContent(request.getContent().trim());
            existing.setReadTime(calculateReadTime(request.getContent()));
            if (request.getTech() != null) existing.setTech(request.getTech().trim());
            if (request.getSubtitle() != null) existing.setSubtitle(request.getSubtitle().trim());
            if (request.getCoverImage() != null) existing.setCoverImage(request.getCoverImage().trim());
            if (request.getDifficulty() != null) existing.setDifficulty(request.getDifficulty().trim());
            if (request.getPrerequisites() != null) existing.setPrerequisites(request.getPrerequisites().trim());
            if (request.getTakeaways() != null) existing.setTakeaways(request.getTakeaways().trim());
            if (request.getStatus() != null) existing.setStatus(request.getStatus().trim());

            if (request.getTags() != null) {
                Set<String> cleanTags = new HashSet<>();
                for (String tag : request.getTags()) {
                    if (tag != null && !tag.isBlank()) cleanTags.add(tag.trim());
                }
                existing.setTags(cleanTags);
            }

            Blog saved = blogRepository.save(existing);
            return mapToResponse(saved, currentUserId);
        });
    }

    @Transactional
    public boolean deleteBlog(UUID id, UUID currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to delete blog");
        }

        return blogRepository.findById(id).map(existing -> {
            boolean isAuthor = existing.getAuthorId() != null && existing.getAuthorId().equals(currentUserId);
            if (!isAuthor && !isAdmin) {
                throw new SecurityException("You do not have permission to delete this blog post");
            }
            blogRepository.delete(existing);
            return true;
        }).orElse(false);
    }

    @Transactional
    public BlogResponse toggleLike(UUID blogId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to like a blog");
        }

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new NoSuchElementException("Blog not found with id: " + blogId));

        Optional<BlogLike> existingLike = blogLikeRepository.findByBlogIdAndUserId(blogId, currentUserId);
        boolean isLiked;
        if (existingLike.isPresent()) {
            blogLikeRepository.delete(existingLike.get());
            blogLikeRepository.flush();
            isLiked = false;
        } else {
            blogLikeRepository.saveAndFlush(new BlogLike(blogId, currentUserId));
            isLiked = true;
        }

        int count = (int) blogLikeRepository.countByBlogId(blogId);
        blog.setLikes(count);
        Blog saved = blogRepository.saveAndFlush(blog);

        BlogResponse response = mapToResponse(saved, currentUserId);
        response.setLiked(isLiked);
        response.setLikes(count);
        return response;
    }

    @Transactional
    public BlogResponse toggleBookmark(UUID blogId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to bookmark a blog");
        }

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new NoSuchElementException("Blog not found with id: " + blogId));

        Optional<BlogBookmark> existing = blogBookmarkRepository.findByBlogIdAndUserId(blogId, currentUserId);
        boolean isBookmarked;
        if (existing.isPresent()) {
            blogBookmarkRepository.delete(existing.get());
            blogBookmarkRepository.flush();
            isBookmarked = false;
        } else {
            blogBookmarkRepository.saveAndFlush(new BlogBookmark(blogId, currentUserId));
            isBookmarked = true;
        }

        int count = (int) blogBookmarkRepository.countByBlogId(blogId);
        blog.setBookmarks(count);
        Blog saved = blogRepository.saveAndFlush(blog);

        BlogResponse response = mapToResponse(saved, currentUserId);
        response.setBookmarked(isBookmarked);
        response.setBookmarks(count);
        return response;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID blogId, UUID currentUserId) {
        return blogCommentRepository.findByBlogIdOrderByCreatedAtAsc(blogId).stream()
                .map(c -> {
                    CommentResponse r = new CommentResponse();
                    r.setId(c.getId());
                    r.setBlogId(c.getBlogId());
                    r.setUserId(c.getUserId());
                    r.setAuthorName(c.getAuthorName());
                    r.setContent(c.getContent());
                    r.setParentId(c.getParentId());
                    r.setOwner(currentUserId != null && currentUserId.equals(c.getUserId()));
                    r.setCreatedAt(c.getCreatedAt());
                    r.setUpdatedAt(c.getUpdatedAt());
                    return r;
                }).toList();
    }

    @Transactional
    public CommentResponse addComment(UUID blogId, CommentRequest request, UUID currentUserId, String authorName) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to add a comment");
        }
        if (!blogRepository.existsById(blogId)) {
            throw new NoSuchElementException("Blog not found with id: " + blogId);
        }

        BlogComment comment = new BlogComment(
                blogId,
                currentUserId,
                authorName != null ? authorName : "Developer",
                request.getContent().trim(),
                request.getParentId()
        );
        BlogComment saved = blogCommentRepository.save(comment);

        CommentResponse r = new CommentResponse();
        r.setId(saved.getId());
        r.setBlogId(saved.getBlogId());
        r.setUserId(saved.getUserId());
        r.setAuthorName(saved.getAuthorName());
        r.setContent(saved.getContent());
        r.setParentId(saved.getParentId());
        r.setOwner(true);
        r.setCreatedAt(saved.getCreatedAt());
        r.setUpdatedAt(saved.getUpdatedAt());
        return r;
    }

    @Transactional
    public boolean deleteComment(UUID commentId, UUID currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new SecurityException("Authentication required to delete comment");
        }
        return blogCommentRepository.findById(commentId).map(c -> {
            boolean isOwner = c.getUserId().equals(currentUserId);
            if (!isOwner && !isAdmin) {
                throw new SecurityException("You do not have permission to delete this comment");
            }
            blogCommentRepository.delete(c);
            return true;
        }).orElse(false);
    }

    @Transactional(readOnly = true)
    public List<KnowledgeTrailResponse> getKnowledgeTrails() {
        return knowledgeTrailRepository.findAll().stream().map(this::mapTrailToResponse).toList();
    }

    @Transactional(readOnly = true)
    public KnowledgeTrailResponse getKnowledgeTrailById(UUID id) {
        return knowledgeTrailRepository.findById(id).map(this::mapTrailToResponse)
                .orElseThrow(() -> new NoSuchElementException("Knowledge trail not found with id: " + id));
    }

    public String calculateReadTime(String content) {
        if (content == null || content.isBlank()) {
            return "1 min read";
        }
        int words = content.trim().split("\\s+").length;
        int minutes = (int) Math.ceil((double) words / 200.0);
        return Math.max(1, minutes) + " min read";
    }

    private BlogResponse mapToResponse(Blog blog, UUID currentUserId) {
        BlogResponse r = new BlogResponse();
        r.setId(blog.getId());
        r.setAuthorId(blog.getAuthorId());
        r.setAuthorName(blog.getAuthorName());
        r.setAuthor(blog.getAuthorName());
        r.setTitle(blog.getTitle());
        r.setSubtitle(blog.getSubtitle());
        r.setCoverImage(blog.getCoverImage());
        r.setCategory(blog.getCategory());
        r.setContent(blog.getContent());
        r.setReadTime(blog.getReadTime());
        r.setTech(blog.getTech());
        r.setDifficulty(blog.getDifficulty());
        r.setPrerequisites(blog.getPrerequisites());
        r.setTakeaways(blog.getTakeaways());
        r.setLikes(blog.getLikes());
        r.setBookmarks(blog.getBookmarks());
        r.setTags(blog.getTags());
        r.setStatus(blog.getStatus());
        r.setCreatedAt(blog.getCreatedAt());
        r.setUpdatedAt(blog.getUpdatedAt());

        if (currentUserId != null) {
            r.setLiked(blogLikeRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId));
            r.setBookmarked(blogBookmarkRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId));
        } else {
            r.setLiked(false);
            r.setBookmarked(false);
        }
        return r;
    }

    private KnowledgeTrailResponse mapTrailToResponse(KnowledgeTrail t) {
        KnowledgeTrailResponse r = new KnowledgeTrailResponse();
        r.setId(t.getId());
        r.setAuthorId(t.getAuthorId());
        r.setAuthorName(t.getAuthorName());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setCategory(t.getCategory());
        r.setCoverImage(t.getCoverImage());
        r.setEstimatedHours(t.getEstimatedHours());
        r.setDifficulty(t.getDifficulty());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
