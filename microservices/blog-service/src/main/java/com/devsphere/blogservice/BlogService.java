package com.devsphere.blogservice;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BlogService {

    private final BlogRepository blogRepository;

    public BlogService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    public List<Blog> getBlogs(String category, String search) {
        if ((category != null && !category.equalsIgnoreCase("All") && !category.isBlank()) || (search != null && !search.isBlank())) {
            String cat = (category != null && !category.equalsIgnoreCase("All") && !category.isBlank()) ? category.trim() : null;
            String q = (search != null && !search.isBlank()) ? search.trim() : null;
            return blogRepository.searchBlogs(cat, q);
        }
        return blogRepository.searchBlogs(null, null);
    }

    public Optional<Blog> getBlogById(UUID id) {
        return blogRepository.findById(id);
    }

    public List<Blog> getDraftsByAuthorId(UUID authorId) {
        return blogRepository.findByAuthorIdAndStatus(authorId, "DRAFT");
    }

    @Transactional
    public Blog createBlog(Blog blog) {
        if (blog.getStatus() == null || blog.getStatus().isBlank()) {
            blog.setStatus("PUBLISHED");
        }
        if (blog.getReadTime() == null || blog.getReadTime().isBlank()) {
            blog.setReadTime(calculateReadTime(blog.getContent()));
        }
        if (blog.getTech() == null || blog.getTech().isBlank()) {
            blog.setTech(blog.getCategory());
        }
        return blogRepository.save(blog);
    }

    @Transactional
    public Optional<Blog> updateBlog(UUID id, Blog updated) {
        return blogRepository.findById(id).map(existing -> {
            if (updated.getTitle() != null && !updated.getTitle().isBlank()) existing.setTitle(updated.getTitle().trim());
            if (updated.getCategory() != null && !updated.getCategory().isBlank()) existing.setCategory(updated.getCategory().trim());
            if (updated.getContent() != null && !updated.getContent().isBlank()) {
                existing.setContent(updated.getContent().trim());
                existing.setReadTime(calculateReadTime(updated.getContent()));
            }
            if (updated.getTech() != null) existing.setTech(updated.getTech().trim());
            if (updated.getStatus() != null && !updated.getStatus().isBlank()) existing.setStatus(updated.getStatus().trim());
            if (updated.getTags() != null) existing.setTags(updated.getTags());
            return blogRepository.save(existing);
        });
    }

    @Transactional
    public boolean deleteBlog(UUID id) {
        if (blogRepository.existsById(id)) {
            blogRepository.deleteById(id);
            return true;
        }
        return false;
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
