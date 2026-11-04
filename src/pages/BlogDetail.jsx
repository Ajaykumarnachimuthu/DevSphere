import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { blogsApi } from "../services/api";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";

// Helper to parse inline markdown (bold, italic, code, links)
function parseInlineMarkdown(text) {
  if (!text) return "";
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="sample-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="sample-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="sample-link"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

// Tokenize and syntax highlight code lines
function highlightCodeTokens(code) {
  if (!code) return "";
  const lines = code.split("\n");
  return lines.map((line, lIdx) => {
    const commentIdx = line.indexOf("//");
    let codePart = commentIdx >= 0 ? line.substring(0, commentIdx) : line;
    let commentPart = commentIdx >= 0 ? line.substring(commentIdx) : null;

    const tokens = codePart.split(/(\b(?:function|return|let|const|var|if|else|import|from|export|default|class|new|async|await)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\b)/g);

    return (
      <div key={lIdx} className="code-line">
        {tokens.map((token, tIdx) => {
          if (!token) return null;
          if (/^(?:function|return|let|const|var|if|else|import|from|export|default|class|new|async|await)$/.test(token)) {
            return <span key={tIdx} className="hl-kw">{token}</span>;
          }
          if (/^(".*?"|'.*?'|`.*?`)$/.test(token)) {
            return <span key={tIdx} className="hl-str">{token}</span>;
          }
          if (/^\d+$/.test(token)) {
            return <span key={tIdx} className="hl-num">{token}</span>;
          }
          return token;
        })}
        {commentPart && <span className="hl-com">{commentPart}</span>}
      </div>
    );
  });
}

export function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table of Contents & Related Posts
  const [headings, setHeadings] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState("");

  // Engagement state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Media Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);

  // Reading progress scroll
  const [scrollProgress, setScrollProgress] = useState(0);

  const articleRef = useRef(null);
  const discussionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogData();
    fetchComments();
  }, [id]);

  // Track scroll progress and active heading
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }

      // Detect active heading
      if (headings.length > 0) {
        const scrollPos = window.scrollY + 120;
        for (let i = headings.length - 1; i >= 0; i--) {
          const el = document.getElementById(headings[i].id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveHeadingId(headings[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const parseHeadings = (markdown) => {
    if (!markdown) return [];
    const lines = markdown.split("\n");
    const found = [];
    lines.forEach((line) => {
      if (line.startsWith("# ") || line.startsWith("## ")) {
        const title = line.replace(/^#+\s+/, "").trim();
        const hid = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        found.push({ level: 2, title, id: hid });
      } else if (line.startsWith("### ")) {
        const title = line.replace("### ", "").trim();
        const hid = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        found.push({ level: 3, title, id: hid });
      }
    });

    return found;
  };

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogsApi.getById(id);
      if (!data) {
        setError("The requested article could not be found.");
        setBlog(null);
        return;
      }

      const finalBlog = {
        ...data,
        title: data.title,
        category: data.category || "General",
        author: data.author || data.authorName || "DevSphere Author",
        readTime: data.readTime || "5 min read",
        content: data.content || data.description || "",
      };

      setBlog(finalBlog);
      setIsLiked(finalBlog.liked || false);
      setLikesCount(finalBlog.likes ?? 0);
      setIsBookmarked(finalBlog.bookmarked || false);

      const foundHeadings = parseHeadings(finalBlog.content);
      setHeadings(foundHeadings);

      try {
        const res = await blogsApi.getAll({
          category: finalBlog.category === "All" ? "" : finalBlog.category,
          size: 5,
        });
        const list = res?.content || (Array.isArray(res) ? res : []);
        const filtered = list.filter((b) => String(b.id) !== String(id)).slice(0, 3);
        setRelatedPosts(filtered);
      } catch {
        setRelatedPosts([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load the article");
      setBlog(null);
      setHeadings([]);
      setRelatedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await blogsApi.getComments(id);
      setComments(data || []);
    } catch (e) {
      console.warn("Could not load comments", e);
    }
  };

  const handleToggleLike = async () => {
    try {
      const updated = await blogsApi.toggleLike(id);
      setIsLiked(updated.liked);
      setLikesCount(updated.likes);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/login");
      }
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const updated = await blogsApi.toggleBookmark(id);
      setIsBookmarked(updated.bookmarked);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/login");
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleShareSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || "Check out this article on DevSphere!");
    let shareUrl = "";

    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await blogsApi.addComment(id, {
        content: commentText.trim(),
        parentId: replyParentId,
      });
      setCommentText("");
      setReplyParentId(null);
      fetchComments();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/login");
      } else {
        alert(err.message || "Failed to post comment");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await blogsApi.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      alert(err.message || "Failed to delete comment");
    }
  };

  // Render markdown with syntax code blocks, headings, inline formatting, and images
  const renderRichContent = (content) => {
    if (!content) return null;

    const sections = [];
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer = [];

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace("```", "").trim() || "text";
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          sections.push(
            <SampleCodeBlock
              key={`code-${index}`}
              code={codeBuffer.join("\n")}
              language={codeLanguage}
            />
          );
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith("# ") || line.startsWith("## ")) {
        const title = line.replace(/^#+\s+/, "").trim();
        const hid = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        sections.push(
          <h2 key={`h2-${index}`} id={hid} className="sample-article-h2">
            {parseInlineMarkdown(title)}
          </h2>
        );
        return;
      }

      if (line.startsWith("### ")) {
        const title = line.replace("### ", "").trim();
        const hid = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        sections.push(
          <h3 key={`h3-${index}`} id={hid} className="sample-article-h3">
            {parseInlineMarkdown(title)}
          </h3>
        );
        return;
      }

      // Compact Inline Images ![caption](url)
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        sections.push(
          <figure key={`img-${index}`} className="sample-inline-figure">
            <div
              className="sample-figure-frame"
              onClick={() => setLightboxImage({ url: imgMatch[2], alt: imgMatch[1] })}
              title="Click to view full image"
            >
              <img
                src={imgMatch[2]}
                alt={imgMatch[1] || "Article illustration"}
                className="sample-inline-img"
              />
              <span className="figure-zoom-hint">🔍 Click to zoom</span>
            </div>
            {imgMatch[1] && (
              <figcaption className="sample-figcaption">
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Callouts
      if (
        line.startsWith("> [!NOTE]") ||
        line.startsWith("> [!TIP]") ||
        line.startsWith("> [!IMPORTANT]") ||
        line.startsWith("> [!WARNING]")
      ) {
        const match = line.match(/> \[!([A-Z]+)\]/);
        const type = match ? match[1] : "NOTE";
        const text = line.replace(/> \[![A-Z]+\]\s*/, "");
        sections.push(
          <div
            key={`callout-${index}`}
            className={`sample-callout callout-${type.toLowerCase()}`}
          >
            <strong>{type}: </strong> {parseInlineMarkdown(text)}
          </div>
        );
        return;
      }

      if (line.startsWith("> ")) {
        sections.push(
          <blockquote key={`quote-${index}`} className="sample-quote">
            {parseInlineMarkdown(line.replace("> ", ""))}
          </blockquote>
        );
        return;
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        sections.push(
          <li key={`li-${index}`} className="sample-list-item">
            {parseInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
          </li>
        );
        return;
      }

      if (line.trim().length > 0) {
        sections.push(
          <p key={`p-${index}`} className="sample-article-p">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    });

    return sections;
  };

  if (loading) {
    return (
      <div className="sample-blog-page-wrapper">
        <Navbar />
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          <div
            className="btn-spinner"
            style={{ margin: "0 auto 16px auto", width: "36px", height: "36px" }}
          />
          <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Loading article...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="sample-blog-page-wrapper">
        <Navbar />
        <main style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Article Not Found</h2>
          <p style={{ color: "var(--danger)", margin: "12px 0 24px 0" }}>
            {error || "The requested blog post could not be loaded."}
          </p>
          <Link to="/blogs">
            <Button variant="primary">← Back to blogs</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = blog?.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently published";



  return (
    <div className="sample-blog-page-wrapper">
      {/* Editorial Reading Progress Bar at very top */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <Navbar />

      <main className="sample-blog-detail-container">
        {/* Top Back Link */}
        <div className="sample-back-nav">
          <Link to="/blogs" className="sample-back-link">
            ← Back to blogs
          </Link>
        </div>

        {/* 2-Column Desktop Grid Layout (70% Left Stream / 30% Right Sidebar) */}
        <div className="sample-blog-content-layout">
          {/* Left Column: Title, Author, Photo Carousel, Content Stream */}
          <article ref={articleRef} className="sample-article-main-stream">
            {/* Header: Title, Category Badge, Subtitle */}
            <header className="sample-article-header">
              <div className="sample-title-badge-row">
                <h1 className="sample-article-title">{blog.title}</h1>
                {blog.category && (
                  <span className="sample-category-badge">
                    {blog.category}
                  </span>
                )}
              </div>

              {blog.subtitle && (
                <p className="sample-article-subtitle">{blog.subtitle}</p>
              )}

              {/* Author Byline Row: Avatar • Name • Date • Read time • Like & Bookmark */}
              <div className="sample-author-row">
                <div className="sample-author-meta">
                  <div className="sample-author-avatar">
                    {(blog.author || "A").charAt(0).toUpperCase()}
                  </div>
                  <span className="sample-author-name">
                    {blog.author || blog.authorName || "DevSphere Author"}
                  </span>
                  <span className="sample-meta-bullet">•</span>
                  <span className="sample-meta-date">{formattedDate}</span>
                  <span className="sample-meta-bullet">•</span>
                  <span className="sample-meta-readtime">
                    {blog.readTime || "8 min read"}
                  </span>
                </div>

                <div className="sample-author-actions">
                  <button
                    type="button"
                    className={`sample-action-btn ${isLiked ? "liked" : ""}`}
                    onClick={handleToggleLike}
                    title="Like article"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "currentColor"} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{likesCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`sample-action-btn ${isBookmarked ? "bookmarked" : ""}`}
                    onClick={handleToggleBookmark}
                    title="Bookmark article"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "#6366f1" : "none"} stroke={isBookmarked ? "#6366f1" : "currentColor"} strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {/* Media Banner Frame matching Reference Image 4 */}
            {blog.coverImage ? (
              <div className="sample-cover-frame sample-clean-cover">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="sample-cover-img"
                  onClick={() => setLightboxImage({ url: blog.coverImage, alt: blog.title })}
                  style={{ cursor: "pointer" }}
                  title="Click to view full image"
                />
              </div>
            ) : (
              <div className="sample-cover-frame sample-code-cover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "30px 40px", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)" }}>
                <div>
                  <span className="sample-cover-lang-pill" style={{ marginBottom: "12px", display: "inline-block" }}>
                    {blog.category?.toUpperCase() || "ARTICLE"}
                  </span>
                  <h3 style={{ color: "#fff", fontSize: "1.4rem", margin: "8px 0", fontWeight: 700 }}>{blog.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>DevSphere Knowledge Base</p>
                </div>
              </div>
            )}

            {/* Rich Markdown & Sections */}
            <div className="sample-rendered-markdown">
              {renderRichContent(blog.content || blog.description)}
            </div>

            {/* Tags Cloud */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="sample-tags-row">
                {blog.tags.map((t) => (
                  <span key={t} className="sample-tag-pill">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Author Spotlight Box */}
            <div className="sample-author-spotlight">
              <div className="spotlight-avatar">
                {(blog.author || "A").charAt(0).toUpperCase()}
              </div>
              <div className="spotlight-details">
                <h4>Written by {blog.author || "DevSphere Author"}</h4>
                <p>
                  Engineering author on DevSphere sharing software architectures, JavaScript performance, and full-stack patterns.
                </p>
              </div>
            </div>

            {/* Engineering Discussions Section */}
            <section ref={discussionRef} className="sample-discussions-section">
              <div className="discussions-header">
                <h3>Engineering Discussions ({comments.length})</h3>
              </div>

              <form onSubmit={handleAddComment} className="discussions-form">
                {replyParentId && (
                  <div className="reply-notice-bar">
                    <span>Replying to peer comment</span>
                    <button type="button" onClick={() => setReplyParentId(null)}>
                      Cancel
                    </button>
                  </div>
                )}
                <textarea
                  rows="3"
                  placeholder="Share constructive feedback, architecture insights, or questions..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submittingComment}
                  >
                    Post Comment →
                  </Button>
                </div>
              </form>

              <div className="comments-stream-list">
                {comments.length === 0 ? (
                  <div className="comments-empty-box">
                    <span>💬 No discussions yet. Be the first to share your engineering feedback!</span>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="comment-bubble-header">
                        <div className="comment-bubble-user">
                          <span className="user-avatar-tiny">
                            {(comment.authorName || "U").charAt(0).toUpperCase()}
                          </span>
                          <span className="user-name-text">
                            {comment.authorName}
                          </span>
                        </div>
                        <span className="comment-timestamp">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {comment.canDelete && (
                          <button
                            type="button"
                            className="comment-delete-link"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete comment"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="comment-bubble-text">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>

          {/* Right Sidebar: On this page, Share this blog, Related posts */}
          <aside className="sample-sidebar-column">
            {/* Card 1: On this page (Numbered TOC) */}
            <div className="sample-sidebar-card">
              <h4 className="sidebar-card-title">On this page</h4>
              <ul className="sample-toc-numbered-list">
                {headings.map((h, i) => (
                  <li
                    key={h.id || i}
                    className={`sample-toc-item ${activeHeadingId === h.id ? "active" : ""}`}
                  >
                    <span className="toc-number">{i + 1}.</span>
                    <a
                      href={`#${h.id}`}
                      className="toc-link"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(h.id);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                    >
                      {h.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Share this blog (Social Buttons) */}
            <div className="sample-sidebar-card">
              <h4 className="sidebar-card-title">Share this blog</h4>
              <div className="sample-social-share-row">
                <button
                  type="button"
                  className="social-share-circle twitter"
                  onClick={() => handleShareSocial("twitter")}
                  title="Share on Twitter / X"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="social-share-circle linkedin"
                  onClick={() => handleShareSocial("linkedin")}
                  title="Share on LinkedIn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="social-share-circle facebook"
                  onClick={() => handleShareSocial("facebook")}
                  title="Share on Facebook"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54v-2.203c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.988c4.782-.75 8.438-4.887 8.438-9.879z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="social-share-circle link-copy"
                  onClick={handleCopyLink}
                  title="Copy link to clipboard"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
              </div>
              {copiedToast && (
                <span className="copied-hint-toast">✓ Link copied to clipboard!</span>
              )}
            </div>

            {/* Card 3: Related posts */}
            <div className="sample-sidebar-card">
              <h4 className="sidebar-card-title">Related posts</h4>
              <div className="sample-related-posts-list">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((post, idx) => {
                    const badgeIcon =
                      post.icon ||
                      (post.category?.toLowerCase().includes("script") || post.tech?.toLowerCase().includes("script")
                        ? "JS"
                        : post.category?.toLowerCase().includes("web")
                        ? "{ }"
                        : "</>");

                    const badgeClass =
                      post.badgeClass ||
                      (badgeIcon === "JS"
                        ? "badge-js"
                        : badgeIcon === "{ }"
                        ? "badge-code"
                        : "badge-green");

                    const postDate = post.date || (post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently published");

                    return (
                      <Link
                        key={post.id || idx}
                        to={`/blogs/${post.id}`}
                        className="sample-related-post-item"
                      >
                        <div className={`related-icon-badge ${badgeClass}`}>
                          {badgeIcon}
                        </div>
                        <div className="related-post-info">
                          <span className="related-post-title">
                            {post.title}
                          </span>
                          <span className="related-post-date">{postDate}</span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "8px 0" }}>
                    No related articles found in this category.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Lightbox Modal for High-Resolution Image Inspection */}
      {lightboxImage && (
        <div
          className="blog-lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
          title="Click anywhere to close"
        >
          <div
            className="blog-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="blog-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close image lightbox"
            >
              ×
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt || "Enlarged view"}
              className="blog-lightbox-img"
            />
            {lightboxImage.alt && (
              <p className="blog-lightbox-caption">{lightboxImage.alt}</p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}



// Clean Syntax Code Block matching Sample with [ Copy ] Button
function SampleCodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sample-code-container">
      <button
        type="button"
        className="sample-code-copy-btn"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre className="sample-code-pre">
        <code>{highlightCodeTokens(code)}</code>
      </pre>
    </div>
  );
}
