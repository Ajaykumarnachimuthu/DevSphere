import React from "react";
import { Link } from "react-router-dom";

export function BlogCard({ blog }) {
  const blogId = blog.id;
  const authorName = blog.author || blog.authorName || "DevSphere Author";
  const authorInitial = authorName.charAt(0).toUpperCase();
  const readTime = blog.readTime || "5 min read";
  const categoryName = blog.category || "Web Development";
  const likesCount = blog.likes ?? 0;

  // Visual cover banner generator if no custom cover image
  const renderBanner = () => {
    if (blog.coverImage) {
      return (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="sample-card-cover-img"
        />
      );
    }

    const isJS = categoryName.toLowerCase().includes("script") || blog.tech?.toLowerCase().includes("script");
    const isDevOps = categoryName.toLowerCase().includes("devops");
    const isAI = categoryName.toLowerCase().includes("ai");

    const bgGradient = isJS
      ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
      : isDevOps
      ? "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)"
      : isAI
      ? "linear-gradient(135deg, #064e3b 0%, #022c22 100%)"
      : "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";

    return (
      <div className="sample-card-placeholder-banner" style={{ background: bgGradient }}>
        <div className="placeholder-banner-content">
          <span className="placeholder-banner-badge">{isJS ? "JS" : categoryName.slice(0, 3).toUpperCase()}</span>
          <span className="placeholder-banner-code">{blog.tech || categoryName}</span>
        </div>
      </div>
    );
  };

  return (
    <article className="sample-blog-card">
      <Link to={blogId ? `/blogs/${blogId}` : "#"} className="sample-card-banner-link">
        {renderBanner()}
      </Link>

      <div className="sample-card-content">
        <div className="sample-card-badge-row">
          <span className="sample-card-cat-badge">{categoryName}</span>
        </div>

        <h3 className="sample-card-title">
          <Link to={blogId ? `/blogs/${blogId}` : "#"}>
            {blog.title}
          </Link>
        </h3>

        <p className="sample-card-description">
          {blog.description || blog.content}
        </p>

        <div className="sample-card-tags-row">
          {blog.tags && blog.tags.length > 0 ? (
            blog.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="sample-card-tech-tag">
                {tag}
              </span>
            ))
          ) : blog.tech ? (
            <span className="sample-card-tech-tag">{blog.tech}</span>
          ) : null}
        </div>

        <div className="sample-card-footer">
          <div className="sample-card-author-info">
            <div className="sample-card-author-avatar">
              {authorInitial}
            </div>
            <span className="sample-card-author-name">{authorName}</span>
          </div>

          <div className="sample-card-metrics">
            <span className="sample-card-likes" title="Likes" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likesCount}</span>
            </span>
            <span className="sample-card-reads" title="Read time" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{readTime}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
