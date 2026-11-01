import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { projectsApi } from "../services/api";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";

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
              <img src={project.coverImage} alt={project.title} className="hero-img" />
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

        {/* Interactive Application Tour / Feature Walkthrough */}
        <section className="project-tour-section">
          <div className="section-title-row">
            <h2>Interactive Application Tour</h2>
            <p>Step through key engineering features and architectural capabilities.</p>
          </div>

          <div className="tour-stepper-container">
            <div className="tour-steps-nav">
              {tourSteps.map((step, idx) => (
                <button
                  key={idx}
                  className={`tour-step-tab ${activeTourIndex === idx ? "active" : ""}`}
                  onClick={() => setActiveTourIndex(idx)}
                >
                  <span className="step-icon">{step.icon}</span>
                  <div className="step-text">
                    <strong>Step {idx + 1}: {step.title}</strong>
                    <span>{step.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="tour-stage-preview">
              <div className="stage-card">
                <div className="stage-badge">Feature Inspection ~ Step {activeTourIndex + 1}</div>
                <h3>{tourSteps[activeTourIndex].title}</h3>
                <p>{tourSteps[activeTourIndex].desc}</p>
                <div className="stage-wireframe">
                  <div className="wireframe-row header-row" />
                  <div className="wireframe-grid">
                    <div className="wireframe-col" />
                    <div className="wireframe-col active" />
                    <div className="wireframe-col" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs for Deep Technical Inspection */}
        <nav className="project-tabs-nav" aria-label="Project details sections">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📋 Technical Documentation
          </button>
          <button
            className={`tab-btn ${activeTab === "xray" ? "active" : ""}`}
            onClick={() => setActiveTab("xray")}
          >
            🔬 Project X-Ray & Architecture
          </button>
          <button
            className={`tab-btn ${activeTab === "releases" ? "active" : ""}`}
            onClick={() => setActiveTab("releases")}
          >
            🏷️ Releases & Changelog
          </button>
          <button
            className={`tab-btn ${activeTab === "discussion" ? "active" : ""}`}
            onClick={() => setActiveTab("discussion")}
          >
            💬 Peer Feedback ({comments.length})
          </button>
        </nav>

        {/* Tab Content 1: Technical Documentation */}
        {activeTab === "overview" && (
          <section className="tab-pane-container">
            <div className="docs-grid">
              <div className="docs-card">
                <h3>Problem Statement</h3>
                <p>{project.problemStatement || "Modern developers need a dedicated ecosystem to showcase real engineering systems, verify repository activity, and exchange architecture feedback without algorithmic noise."}</p>
              </div>

              <div className="docs-card">
                <h3>Proposed Solution & Implementation</h3>
                <p>{project.proposedSolution || "A modular monolith core backed by Spring Boot 3 with high-concurrency connection pooling, JWT security, and a responsive React client island structure for rapid developer discovery."}</p>
              </div>
            </div>

            <div className="docs-card full-width" style={{ marginTop: "24px" }}>
              <h3>Architecture Summary & Production Patterns</h3>
              <p>{project.architectureSummary || project.documentation || "The software applies domain-driven layering: REST Controllers receive validated DTOs, service layer handles transactions and optimistic concurrency locking, and Spring Data JPA executes index-optimized SQL queries."}</p>
            </div>
          </section>
        )}

        {/* Tab Content 2: Project X-Ray (Unique Showcase Feature) */}
        {activeTab === "xray" && (
          <section className="tab-pane-container xray-container">
            <div className="xray-subnav">
              <button
                className={`xray-subtab-btn ${xraySubTab === "flow" ? "active" : ""}`}
                onClick={() => setXraySubTab("flow")}
              >
                End-to-End Request Flow
              </button>
              <button
                className={`xray-subtab-btn ${xraySubTab === "schema" ? "active" : ""}`}
                onClick={() => setXraySubTab("schema")}
              >
                Database Schema Explorer
              </button>
              <button
                className={`xray-subtab-btn ${xraySubTab === "api" ? "active" : ""}`}
                onClick={() => setXraySubTab("api")}
              >
                REST API Explorer
              </button>
              <button
                className={`xray-subtab-btn ${xraySubTab === "tradeoffs" ? "active" : ""}`}
                onClick={() => setXraySubTab("tradeoffs")}
              >
                Decisions & Tradeoffs
              </button>
            </div>

            {/* Subtab: Request Flow */}
            {xraySubTab === "flow" && (
              <div className="xray-flow-box">
                <h4>Interactive End-to-End Request Pipeline</h4>
                <div className="flow-steps-diagram">
                  <div className="flow-step">
                    <span className="step-num">1</span>
                    <strong>React SPA Client</strong>
                    <p>Issues HTTP POST with Bearer token & JSON payload</p>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <span className="step-num">2</span>
                    <strong>Security Filter Chain</strong>
                    <p>Validates JWT HMAC-SHA512 & loads UserPrincipal</p>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <span className="step-num">3</span>
                    <strong>ProjectController</strong>
                    <p>Performs JSR-380 bean validation & extracts claims</p>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <span className="step-num">4</span>
                    <strong>Transactional Service</strong>
                    <p>Executes business logic with atomic lock protection</p>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <span className="step-num">5</span>
                    <strong>PostgreSQL / H2</strong>
                    <p>Persists entity with foreign key & cascade consistency</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subtab: Database Schema */}
            {xraySubTab === "schema" && (
              <div className="xray-schema-box">
                <h4>Relational Schema & Constraints</h4>
                <div className="schema-table-mock">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Constraints</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>id</code></td>
                        <td>UUID</td>
                        <td>PRIMARY KEY</td>
                        <td>Globally unique identifier generated via UUIDv4</td>
                      </tr>
                      <tr>
                        <td><code>title</code></td>
                        <td>VARCHAR(255)</td>
                        <td>NOT NULL</td>
                        <td>Canonical name of the project</td>
                      </tr>
                      <tr>
                        <td><code>category</code></td>
                        <td>VARCHAR(100)</td>
                        <td>NOT NULL, INDEXED</td>
                        <td>Domain category (Web, Mobile, Cloud, AI)</td>
                      </tr>
                      <tr>
                        <td><code>likes</code></td>
                        <td>INTEGER</td>
                        <td>DEFAULT 0</td>
                        <td>Synchronized atomic counter</td>
                      </tr>
                      <tr>
                        <td><code>author_id</code></td>
                        <td>UUID</td>
                        <td>FOREIGN KEY → users(id)</td>
                        <td>Owner reference with cascade protection</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Subtab: API Explorer */}
            {xraySubTab === "api" && (
              <div className="xray-api-box">
                <h4>Interactive Endpoint Definitions</h4>
                <div className="api-endpoint-card">
                  <div className="endpoint-header">
                    <span className="method get">GET</span>
                    <code>/api/v1/projects/{project.id}</code>
                  </div>
                  <p>Fetches full project details, verified GitHub status, and user-specific like/bookmark states.</p>
                  <pre className="endpoint-json">
{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "${project.id}",
  "title": "${project.title}",
  "category": "${project.category}",
  "likes": ${project.likes},
  "views": ${viewsCount},
  "isOwner": ${project.owner ? "true" : "false"}
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Subtab: Tradeoffs */}
            {xraySubTab === "tradeoffs" && (
              <div className="xray-tradeoffs-box">
                <h4>Architectural Decisions & Tradeoffs</h4>
                <div className="tradeoff-card">
                  <h5>Modular Monolith Core vs. Microservices</h5>
                  <p>
                    <strong>Decision:</strong> We consolidated core portfolio, blog, and developer entities inside a single Spring Boot application while keeping isolated microservices for external notification and feed ingestion.
                  </p>
                  <p>
                    <strong>Tradeoff:</strong> Maximizes transaction guarantees and eliminates distributed RPC latency while keeping code organized into clean domain packages.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tab Content 3: Releases & Changelog */}
        {activeTab === "releases" && (
          <section className="tab-pane-container">
            <div className="releases-list">
              <div className="release-card">
                <div className="release-header">
                  <span className="release-tag">v1.1.0</span>
                  <span className="release-date">Current Production Build</span>
                </div>
                <h4>Enhanced Project Experience & Verified GitHub Telemetry</h4>
                <ul>
                  <li>Integrated verified GitHub repository statistics with 15-minute resilient cache.</li>
                  <li>Added Project X-Ray architecture explorer and interactive request tracer.</li>
                  <li>Implemented one-click bookmarks and peer review discussions.</li>
                </ul>
              </div>

              <div className="release-card" style={{ opacity: 0.75, marginTop: "16px" }}>
                <div className="release-header">
                  <span className="release-tag">v1.0.0</span>
                  <span className="release-date">Initial Launch</span>
                </div>
                <h4>Core Discovery & Portfolio Showcase</h4>
                <ul>
                  <li>Initial release with technology filtering and responsive UI.</li>
                  <li>Spring Boot JPA data persistence.</li>
                </ul>
              </div>
            </div>
          </section>
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
