import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { projectsApi } from "../services/api";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { MarkdownRenderer } from "../components/ui/MarkdownRenderer";

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Engagement state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'xray', 'releases', 'discussion'
  const [xraySubTab, setXraySubTab] = useState("flow"); // 'flow', 'schema', 'api', 'tradeoffs'

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Lightbox Modal for Screenshots
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [activeTourIndex, setActiveTourIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProjectDetails();
    fetchComments();
    recordView();
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getById(id);
      setProject(data);
      setIsLiked(data.liked || false);
      setLikesCount(data.likes || 0);
      setIsBookmarked(data.bookmarked || false);
      setViewsCount(data.views || 0);
    } catch (err) {
      setError(err.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      const updated = await projectsApi.incrementView(id);
      if (updated?.views) {
        setViewsCount(updated.views);
      }
    } catch (e) {
      // Non-blocking view tracking
    }
  };

  const fetchComments = async () => {
    try {
      const data = await projectsApi.getComments(id);
      setComments(data || []);
    } catch (e) {
      console.error("Could not load comments", e);
    }
  };

  const handleToggleLike = async () => {
    try {
      const updated = await projectsApi.toggleLike(id);
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
      const updated = await projectsApi.toggleBookmark(id);
      setIsBookmarked(updated.bookmarked);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/login");
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await projectsApi.addComment(id, { content: commentText.trim() });
      setCommentText("");
      fetchComments();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/login");
      } else {
        alert(err.message || "Failed to post review");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to remove this feedback?")) return;
    try {
      await projectsApi.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      alert(err.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
          <div className="btn-spinner" style={{ margin: "0 auto 16px auto", width: "32px", height: "32px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading engineering showcase...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Project Showcase Not Found</h2>
          <p style={{ color: "var(--danger)", margin: "12px 0 24px 0" }}>{error || "The requested project could not be found."}</p>
          <Link to="/projects">
            <Button variant="primary">← Back to Projects Showcase</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Demo walkthrough steps
  const tourSteps = [
    {
      title: "Interactive Architecture & Discovery",
      desc: "Live search, tech stack filtering, and responsive catalog powered by Spring Boot backend.",
      icon: "⚡",
    },
    {
      title: "Stateless Security & JWT Pipeline",
      desc: "Instant cryptographic token verification, BCrypt password hashing, and role-based ACLs.",
      icon: "🔒",
    },
    {
      title: "Deep Engineering Documentation",
      desc: "Real-time GitHub metrics integration, ER schema inspections, and REST payload explorer.",
      icon: "📊",
    },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="project-detail-container">
        {/* Top Back Nav */}
        <div className="project-top-nav">
          <Link to="/projects" className="back-link">
            ← Community Projects
          </Link>
          <span className="project-views-pill">👁️ {viewsCount} Views</span>
        </div>

        {/* Hero Section */}
        <header className="project-hero-header">
          <div className="hero-content">
            <div className="hero-status-row">
              <span className="project-category-badge">{project.category}</span>
              <span className={`project-status-pill status-${(project.status || "active").toLowerCase()}`}>
                ● {project.status || "Production Active"}
              </span>
            </div>

            <h1 className="hero-title">{project.title}</h1>
            <p className="hero-tagline">{project.tagline || project.description}</p>

            <div className="hero-author-row">
              <div className="author-avatar-chip">
                <span>{(project.author || "A").charAt(0).toUpperCase()}</span>
                <span className="author-name">Built by {project.author || "Lead Engineer"}</span>
              </div>
              <span className="created-date">
                Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Recently"}
              </span>
            </div>

            {/* Tech Badges */}
            <div className="hero-tech-badges">
              {project.technologies?.map((tech) => (
                <span key={tech} className="hero-tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="hero-action-buttons">
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  🚀 Launch Live Demo ↗
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: "none" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Repository ↗
                </a>
              )}

              <button
                className={`action-btn-pill ${isLiked ? "active" : ""}`}
                onClick={handleToggleLike}
                title="Like this software"
              >
                <span>{isLiked ? "❤️" : "🤍"}</span>
                <span>{likesCount}</span>
              </button>

              <button
                className={`action-btn-pill ${isBookmarked ? "active" : ""}`}
                onClick={handleToggleBookmark}
                title="Save to bookmarks"
              >
                <span>{isBookmarked ? "🔖" : "📑"}</span>
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>
            </div>
          </div>

          {/* Cover Graphic / Live Preview Card */}
          <div className="hero-visual-card">
            {project.coverImage ? (
              <div style={{ position: "relative", cursor: "zoom-in" }} onClick={() => setSelectedScreenshot(project.coverImage)} title="Click to inspect full resolution screenshot">
                <img src={project.coverImage} alt={project.title} className="hero-img" style={{ display: "block", width: "100%", height: "auto" }} />
                <div style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  🔍 Expand Screenshot
                </div>
              </div>
            ) : (
              <div className="hero-terminal-mockup">
                <div className="terminal-header">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                  <span className="terminal-title">devsphere-runtime ~ production</span>
                </div>
                <div className="terminal-body">
                  <p><span className="t-prompt">$</span> curl -X GET https://devsphere.io/api/v1/projects/{project.id.slice(0, 8)}</p>
                  <p className="t-res"><span className="t-status">200 OK</span> - Content-Type: application/json</p>
                  <p className="t-json">&#123;</p>
                  <p className="t-json-line">  "title": "{project.title}",</p>
                  <p className="t-json-line">  "status": "HEALTHY_VERIFIED",</p>
                  <p className="t-json-line">  "author": "{project.author}",</p>
                  <p className="t-json-line">  "stars": {project.githubMetadata?.stars ?? project.likes ?? 0}</p>
                  <p className="t-json">&#125;</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Verified GitHub Repository Metadata Card */}
        {project.githubMetadata && (
          <section className="verified-github-card">
            <div className="github-card-header">
              <div className="github-title-box">
                <span className="verified-badge">✓ Verified Public Repository</span>
                <h3>{project.githubMetadata.name || "Repository"}</h3>
                <p>{project.githubMetadata.description || "Open source software project hosted on GitHub"}</p>
              </div>
              <a
                href={project.githubMetadata.htmlUrl || project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm"
              >
                View on GitHub ↗
              </a>
            </div>

            <div className="github-metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Stars</span>
                <span className="metric-value">⭐ {project.githubMetadata.stars}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Forks</span>
                <span className="metric-value">🍴 {project.githubMetadata.forks}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Open Issues</span>
                <span className="metric-value">⚠️ {project.githubMetadata.openIssues}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Language</span>
                <span className="metric-value">💻 {project.githubMetadata.language || "Not specified"}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">License</span>
                <span className="metric-value">⚖️ {project.githubMetadata.license || "Open Source"}</span>
              </div>
            </div>

            {/* Quick Clone Snippet */}
            {project.githubMetadata.cloneUrl && (
              <div className="clone-snippet-box">
                <span className="clone-prompt">git clone</span>
                <code className="clone-code">{project.githubMetadata.cloneUrl}</code>
                <button
                  type="button"
                  className="clone-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(`git clone ${project.githubMetadata.cloneUrl}`);
                    alert("Clone URL copied to clipboard!");
                  }}
                >
                  Copy
                </button>
              </div>
            )}
          </section>
        )}

        {/* Quickstart Command Bar */}
        {project.quickstartCmd && (
          <section className="project-quickstart-card" style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                background: "rgba(99, 102, 241, 0.12)",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                ⚡ Quickstart
              </span>
              <code style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "13.5px",
                color: "var(--text-primary)",
                fontWeight: 600,
                wordBreak: "break-all",
                minWidth: 0
              }}>
                $ {project.quickstartCmd}
              </code>
            </div>
            <button
              type="button"
              className="action-btn-pill"
              onClick={() => {
                navigator.clipboard.writeText(project.quickstartCmd);
                alert("Quickstart command copied to clipboard!");
              }}
              style={{ padding: "6px 16px", fontSize: "12px", flexShrink: 0 }}
            >
              📋 Copy Command
            </button>
          </section>
        )}

        {/* Dynamic Navigation Tabs */}
        <nav className="project-tabs-nav" aria-label="Project details sections">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Overview & Narrative</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "architecture" ? "active" : ""}`}
            onClick={() => setActiveTab("architecture")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
              <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
            </svg>
            <span>Architecture & Decisions</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "discussion" ? "active" : ""}`}
            onClick={() => setActiveTab("discussion")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Peer Feedback ({comments.length})</span>
          </button>
        </nav>

        {/* Tab 1: Overview & Narrative */}
        {activeTab === "overview" && (
          <div className="tab-pane-container" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Problem & Solution Cards */}
            {(project.problemStatement || project.proposedSolution) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                {project.problemStatement && (
                  <div className="docs-card" style={{
                    borderLeft: "4px solid #ef4444",
                    background: "var(--bg-surface)",
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    borderLeftWidth: "4px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "16px" }}>⚠️</span>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        The Problem Statement
                      </h3>
                    </div>
                    <MarkdownRenderer content={project.problemStatement} />
                  </div>
                )}

                {project.proposedSolution && (
                  <div className="docs-card" style={{
                    borderLeft: "4px solid #10b981",
                    background: "var(--bg-surface)",
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    borderLeftWidth: "4px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "16px" }}>💡</span>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        The Proposed Solution
                      </h3>
                    </div>
                    <MarkdownRenderer content={project.proposedSolution} />
                  </div>
                )}
              </div>
            )}

            {/* Key Features Grid */}
            {project.keyFeatures && (
              <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                boxShadow: "var(--shadow-sm)"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Key Features & Capabilities
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {project.keyFeatures
                    .split("\n")
                    .map((line) => line.replace(/^[-*•\ufffd\u2022]\s*/, "").trim())
                    .filter(Boolean)
                    .map((feature, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "14px 16px",
                          background: "var(--bg-surface-subtle)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-subtle)"
                        }}
                      >
                        <span style={{
                          color: "#10b981",
                          fontWeight: 800,
                          fontSize: "14px",
                          background: "rgba(16, 185, 129, 0.15)",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          ✓
                        </span>
                        <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "var(--text-primary)", fontWeight: 500 }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Video Walkthrough Embed if present */}
            {project.videoDemoUrl && (
              <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "28px"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700 }}>
                  Video Walkthrough & Interactive Demo
                </h3>
                {project.videoDemoUrl.includes("youtube.com") || project.videoDemoUrl.includes("youtu.be") ? (
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "10px" }}>
                    <iframe
                      src={project.videoDemoUrl.replace("watch?v=", "embed/")}
                      title="Project Video Demonstration"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={project.videoDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: "none", display: "inline-flex" }}
                  >
                    📺 Open Video Demonstration ↗
                  </a>
                )}
              </div>
            )}

            {/* Technical Overview Description */}
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                Technical Overview & System Description
              </h3>
              <MarkdownRenderer content={project.description} />
            </div>
          </div>
        )}

        {/* Tab 2: Architecture & Decisions */}
        {activeTab === "architecture" && (
          <div className="tab-pane-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                System Architecture & Design Decisions
              </h3>
              <MarkdownRenderer content={project.architectureSummary || project.documentation || project.description} />
            </div>

            {/* Active Technology Stack Summary */}
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "24px"
            }}>
              <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Core Technology Stack & Runtime Modules
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {project.technologies?.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      padding: "8px 14px",
                      background: "var(--bg-surface-subtle)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)"
                    }}
                  >
                    🛠️ {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Peer Feedback & Discussions */}
        {activeTab === "discussion" && (
          <section className="tab-pane-container">
            <div className="comments-header">
              <h3>Community Reviews & Engineering Feedback ({comments.length})</h3>
            </div>

            <form onSubmit={handleAddComment} className="comment-input-form">
              <textarea
                rows="3"
                placeholder="Leave feedback on architecture, performance, or codebase quality..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <Button type="submit" variant="primary" size="sm" isLoading={submittingComment}>
                  Submit Feedback →
                </Button>
              </div>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", margin: "20px 0" }}>
                  No feedback posted yet. Share your evaluation with the builder!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-top">
                      <span className="comment-author">{comment.authorName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.canDelete && (
                        <button
                          type="button"
                          className="comment-del-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete feedback"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="comment-body">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Lightbox Modal for High-Resolution Screenshot Inspection */}
        {selectedScreenshot && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "24px"
            }}
            onClick={() => setSelectedScreenshot(null)}
          >
            <div
              style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: 0,
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "28px",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedScreenshot(null)}
              >
                ✕
              </button>
              <img
                src={selectedScreenshot}
                alt="Enlarged screenshot"
                style={{ width: "100%", height: "auto", maxHeight: "85vh", borderRadius: "8px", objectFit: "contain" }}
              />
            </div>
          </div>
        )}

        {/* Tab Content 4: Peer Feedback & Discussions */}
        {activeTab === "discussion" && (
          <section className="tab-pane-container">
            <div className="comments-header">
              <h3>Community Reviews & Engineering Feedback ({comments.length})</h3>
            </div>

            <form onSubmit={handleAddComment} className="comment-input-form">
              <textarea
                rows="3"
                placeholder="Leave feedback on architecture, performance, or codebase quality..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <Button type="submit" variant="primary" size="sm" isLoading={submittingComment}>
                  Submit Feedback →
                </Button>
              </div>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", margin: "20px 0" }}>
                  No feedback posted yet. Share your evaluation with the builder!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-top">
                      <span className="comment-author">{comment.authorName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.canDelete && (
                        <button
                          type="button"
                          className="comment-del-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete feedback"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="comment-body">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
