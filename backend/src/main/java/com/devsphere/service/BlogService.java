package com.devsphere.service;

import com.devsphere.dto.request.CommentRequest;
import com.devsphere.dto.request.CreateBlogRequest;
import com.devsphere.dto.request.UpdateBlogRequest;
import com.devsphere.dto.response.BlogResponse;
import com.devsphere.dto.response.CommentResponse;
import com.devsphere.dto.response.KnowledgeTrailResponse;
import com.devsphere.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BlogService {

    PagedResponse<BlogResponse> getBlogs(String category, String query, Pageable pageable, UUID currentUserId);

    BlogResponse getBlogById(UUID id, UUID currentUserId);

    BlogResponse createBlog(CreateBlogRequest request, UUID currentUserId);

    List<BlogResponse> getDrafts(UUID currentUserId);

    BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UUID currentUserId);

    void deleteBlog(UUID id, UUID currentUserId);

    BlogResponse toggleLike(UUID id, UUID currentUserId);

    BlogResponse toggleBookmark(UUID id, UUID currentUserId);

    List<CommentResponse> getComments(UUID blogId, UUID currentUserId);

    CommentResponse addComment(UUID blogId, CommentRequest request, UUID currentUserId);

    void deleteComment(UUID commentId, UUID currentUserId);

    List<KnowledgeTrailResponse> getKnowledgeTrails();

    KnowledgeTrailResponse getKnowledgeTrailById(UUID trailId);
}
