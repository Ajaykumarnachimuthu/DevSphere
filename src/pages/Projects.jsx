import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { ProjectCard } from "../components/cards/ProjectCard";
import { Button } from "../components/ui/Button";
import { ProjectCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ImageUploader } from "../components/ui/ImageUploader";
import { projectsApi } from "../services/api";
import { useDevSphere } from "../context/DevSphereContext";
import { parseReadmeToProject } from "../utils/readmeParser";
import { getLikedProjects, toggleProjectLikedLocal, recordProjectLiked } from "../utils/likesStorage";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Tools",
  "UI/UX",
  "Other",
];

export function Projects() {
  const { isAuthenticated } = useDevSphere();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(() => getLikedProjects());
  const [notice, setNotice] = useState("");
  const [modalError, setModalError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalTab, setModalTab] = useState("basics");
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    category: "Web Development",
    technologies: "",
    githubUrl: "",
    liveDemoUrl: "",
    coverImage: "",
    videoDemoUrl: "",
    problemStatement: "",
    proposedSolution: "",
    keyFeatures: "",
    quickstartCmd: "",
    description: "",
    status: "Active",
  });

  // Smart Auto-Fill from README state
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [importerTab, setImporterTab] = useState("paste"); // "paste" | "upload" | "github"
  const [readmeText, setReadmeText] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [importing, setImporting] = useState(false);

  const applyExtractedProject = (extracted) => {
    if (!extracted) {
      setImportStatus("❌ Could not parse any project details from the README.");
      return;
    }

    let count = 0;
    setForm((prev) => {
      const updated = { ...prev };
      if (extracted.title) { updated.title = extracted.title; count++; }
      if (extracted.tagline) { updated.tagline = extracted.tagline; count++; }
      if (extracted.category) { updated.category = extracted.category; count++; }
      if (extracted.technologies) { updated.technologies = extracted.technologies; count++; }
      if (extracted.githubUrl) { updated.githubUrl = extracted.githubUrl; count++; }
      if (extracted.liveDemoUrl) { updated.liveDemoUrl = extracted.liveDemoUrl; count++; }
      if (extracted.problemStatement) { updated.problemStatement = extracted.problemStatement; count++; }
      if (extracted.proposedSolution) { updated.proposedSolution = extracted.proposedSolution; count++; }
      if (extracted.keyFeatures) { updated.keyFeatures = extracted.keyFeatures; count++; }
      if (extracted.quickstartCmd) { updated.quickstartCmd = extracted.quickstartCmd; count++; }
      if (extracted.description) { updated.description = extracted.description; count++; }
      return updated;
    });

    setImportStatus(`✨ Successfully extracted all fields from README! Check Basics, Media, and Engineering Story tabs.`);
  };

  const handleExtractFromText = () => {
    if (!readmeText.trim()) {
      setImportStatus("⚠️ Please paste README.md markdown content first.");
      return;
    }
    const extracted = parseReadmeToProject(readmeText, githubRepoUrl);
    applyExtractedProject(extracted);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        setReadmeText(content);
        const extracted = parseReadmeToProject(content);
        applyExtractedProject(extracted);
      }
    };
    reader.readAsText(file);
  };

  const handleFetchGitHub = async () => {
    const cleanUrl = githubRepoUrl.trim();
    if (!cleanUrl) {
      setImportStatus("⚠️ Please enter a GitHub repository URL (e.g. https://github.com/owner/repo).");
      return;
    }

    setImporting(true);
    setImportStatus("⏳ Fetching README from GitHub...");

    try {
      const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
      let owner = "";
      let repo = "";
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, "");
      } else if (cleanUrl.includes("/") && !cleanUrl.includes("http")) {
        const parts = cleanUrl.split("/");
        owner = parts[0].trim();
        repo = parts[1].trim();
      }

      if (!owner || !repo) {
        throw new Error("Invalid GitHub URL format. Use https://github.com/owner/repo");
      }

      const branches = ["main", "master"];
      const filenames = ["README.md", "readme.md", "Readme.md"];
      let foundText = "";

      for (const branch of branches) {
        for (const fname of filenames) {
          try {
            const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fname}`);
            if (res.ok) {
              foundText = await res.text();
              break;
            }
          } catch {
            // continue next branch/file
          }
        }
        if (foundText) break;
      }

      if (!foundText) {
        throw new Error(`README file not found on GitHub for ${owner}/${repo}. Please paste markdown directly.`);
      }

      setReadmeText(foundText);
      const extracted = parseReadmeToProject(foundText, `https://github.com/${owner}/${repo}`);
      applyExtractedProject(extracted);
    } catch (err) {
      setImportStatus(`❌ ${err.message || "Failed to fetch README. Please paste markdown directly."}`);
    } finally {
      setImporting(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getAll({
        category: category === "All" ? "" : category,
        search: query,
        sort,
      });
      const list = data?.content || (Array.isArray(data) ? data : null);
      if (list && list.length > 0) {
        const localLiked = getLikedProjects();
        const normalized = list.map((p) => {
          const isLiked = localLiked.includes(String(p.id)) || Boolean(p.liked || p.likedByCurrentUser);
          if (p.liked || p.likedByCurrentUser) recordProjectLiked(p.id, true);
          return {
            ...p,
            likes: p.likes || 0,
            liked: isLiked,
          };
        });
        setItems(normalized);
        setLikedIds(getLikedProjects());
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category, query, sort]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = items.filter((project) => {
      const matchesCategory =
        category === "All" ||
        project.category?.toLowerCase() === category.toLowerCase();
      const techList = Array.isArray(project.technologies) ? project.technologies.join(" ") : "";
      const matchesQuery =
        !normalizedQuery ||
        project.title.toLowerCase().includes(normalizedQuery) ||
        (project.authorName || project.author || "").toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery) ||
        techList.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    if (sort === "Most Liked") {
      return [...result].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    if (sort === "Most Viewed") {
      return [...result].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return result;
  }, [items, category, query, sort]);

  const handleLike = async (idOrTitle) => {
    const targetProject = items.find((p) => p.id === idOrTitle || p.title === idOrTitle);
    if (!targetProject) return;
    const targetKey = targetProject.id || targetProject.title;

    // Toggle in universal storage
    const { isLiked, delta } = toggleProjectLikedLocal(targetKey);
    setLikedIds(getLikedProjects());

    // Optimistic UI update
    setItems((prev) =>
      prev.map((project) =>
        (project.id === targetKey || project.title === targetKey)
          ? { ...project, likes: Math.max(0, (project.likes || 0) + delta) }
          : project
      )
    );

    // Backend synchronization if authenticated
    if (targetProject.id && isAuthenticated) {
      try {
        const updated = await projectsApi.toggleLike(targetProject.id);
        if (updated && typeof updated.likes === "number") {
          setItems((prev) =>
            prev.map((project) =>
              (project.id === targetKey || project.title === targetKey)
                ? { ...project, likes: updated.likes }
                : project
            )
          );
        }
      } catch (err) {
        console.warn("Backend project like sync failed, kept locally:", err);
      }
    }
  };

  const handleNextStep = () => {
    setModalError("");
    if (modalTab === "basics") {
      if (!form.title.trim()) {
        setModalError("Please enter a Project Title before proceeding.");
        return;
      }
      const techStr = typeof form.technologies === "string"
        ? form.technologies.trim()
        : Array.isArray(form.technologies)
        ? form.technologies.join(", ").trim()
        : "";
      if (!techStr) {
        setModalError("Please specify at least one technology (e.g. React, Spring Boot).");
        return;
      }
      setModalTab("media");
    } else if (modalTab === "media") {
      setModalTab("engineering");
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!isAuthenticated) {
      setModalError("Please sign in to publish your project to the DevSphere showcase.");
      return;
    }

    if (!form.title.trim()) {
      setModalTab("basics");
      setModalError("Project title is required.");
      return;
    }

    setSubmitting(true);

    try {
      const techs = Array.isArray(form.technologies)
        ? form.technologies.filter(Boolean)
        : (form.technologies || "").split(",").map((t) => t.trim()).filter(Boolean);

      // Backend requires description not blank. Fallback safely if left empty
      const finalDescription =
        form.description?.trim() ||
        form.proposedSolution?.trim() ||
        form.problemStatement?.trim() ||
        form.tagline?.trim() ||
        form.title.trim();

      const payload = {
        title: form.title.trim(),
        tagline: form.tagline?.trim() || "",
        coverImage: form.coverImage?.trim() || "",
        category: form.category || "Web Development",
        status: form.status || "Active",
        liveDemoUrl: form.liveDemoUrl?.trim() || "",
        githubUrl: form.githubUrl?.trim() || "",
        description: finalDescription,
        technologies: techs,
        problemStatement: form.problemStatement?.trim() || "",
        proposedSolution: form.proposedSolution?.trim() || "",
        architectureSummary: form.description?.trim() || form.proposedSolution?.trim() || "",
        keyFeatures: form.keyFeatures?.trim() || "",
        quickstartCmd: form.quickstartCmd?.trim() || "",
        videoDemoUrl: form.videoDemoUrl?.trim() || "",
      };

      const created = await projectsApi.create(payload);

      setItems((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setModalTab("basics");
      setModalError("");
      setForm({
        title: "",
        tagline: "",
        category: "Web Development",
        technologies: "",
        githubUrl: "",
        liveDemoUrl: "",
        coverImage: "",
        videoDemoUrl: "",
        problemStatement: "",
        proposedSolution: "",
        keyFeatures: "",
        quickstartCmd: "",
        description: "",
        status: "Active",
      });
      setNotice("🎉 Project published successfully to DevSphere!");
    } catch (err) {
      setModalError(err.message || "Failed to submit project. Please verify all required fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="projects-reference-container">
        {/* Top Header Row matching Reference Image */}
        <header className="projects-reference-header">
          <div className="projects-header-left">
            <h1 className="projects-reference-title">Projects</h1>
            <p className="projects-reference-subtitle">
              Explore innovative projects built by our community.
            </p>
          </div>

          <div className="projects-header-controls">
            {/* Search Input with Search Icon */}
            <div className="projects-search-box">
              <svg
                className="projects-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="projects-search-input"
                placeholder="Search projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Select */}
            <select
              className="projects-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile">Mobile</option>
              <option value="AI/ML">AI/ML</option>
              <option value="DevOps">DevOps</option>
              <option value="Tools">Tools</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Other">Other</option>
            </select>

            {/* Sort Select */}
            <select
              className="projects-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort projects"
            >
              <option value="Latest">Latest</option>
              <option value="Most Liked">Most Liked</option>
              <option value="Most Viewed">Most Viewed</option>
            </select>

            {/* Submit Project Desktop Studio Action */}
            <Link
              to="/write-project"
              className="projects-submit-btn btn-primary"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap"
              }}
            >
              + Submit a Project
            </Link>
          </div>
        </header>

        {/* Category Pills Filter Bar */}
        <div className="projects-category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {notice && (
          <div className="alert-banner info" style={{ margin: "16px 0 24px 0" }}>
            <span>{notice}</span>
          </div>
        )}

        {/* Submit Modal Dialog */}
        {isModalOpen && (
          <div
            className="desktop-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="desktop-modal-dialog" role="dialog" aria-modal="true" style={{ maxWidth: "820px" }}>
              <header className="desktop-modal-header">
                <div className="modal-header-titles">
                  <span className="modal-tag-badge">COMMUNITY SHOWCASE</span>
                  <h2>Submit a Project</h2>
                  <p>Share your product, repository, architecture, and live demo.</p>
                </div>
                <button
                  type="button"
                  className="desktop-modal-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </header>

              {/* Auto-Fill from README / GitHub Accordion */}
              <div className="readme-importer-container">
                <div
                  className="readme-importer-header"
                  onClick={() => setIsImporterOpen(!isImporterOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="readme-importer-brand">
                    <div className="readme-importer-badge">⚡</div>
                    <div className="readme-importer-text">
                      <h4>
                        Auto-Fill from README.md / GitHub
                        <span style={{ fontSize: "10px", background: "var(--primary-light)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          TIME SAVER
                        </span>
                      </h4>
                      <p>Paste markdown, upload a .md file, or fetch a GitHub repository to auto-populate all 3 tabs.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="readme-importer-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImporterOpen(!isImporterOpen);
                    }}
                  >
                    {isImporterOpen ? "▲ Hide Importer" : "⚡ Open Auto-Fill"}
                  </button>
                </div>

                {isImporterOpen && (
                  <div className="readme-importer-body">
                    <div className="readme-tabs-nav">
                      <button
                        type="button"
                        className={`readme-tab-btn ${importerTab === "paste" ? "active" : ""}`}
                        onClick={() => setImporterTab("paste")}
                      >
                        📋 Paste Markdown
                      </button>
                      <button
                        type="button"
                        className={`readme-tab-btn ${importerTab === "upload" ? "active" : ""}`}
                        onClick={() => setImporterTab("upload")}
                      >
                        📂 Upload .md File
                      </button>
                      <button
                        type="button"
                        className={`readme-tab-btn ${importerTab === "github" ? "active" : ""}`}
                        onClick={() => setImporterTab("github")}
                      >
                        🐙 GitHub Repo URL
                      </button>
                    </div>

                    {importerTab === "paste" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <textarea
                          className="readme-importer-textarea"
                          placeholder="# My Awesome Project&#10;&#10;> An intelligent full-stack app...&#10;&#10;## Features&#10;- Real-time analytics&#10;- Fast indexing"
                          value={readmeText}
                          onChange={(e) => setReadmeText(e.target.value)}
                        />
                        <div className="readme-importer-actions">
                          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                            Tip: Paste the raw README.md markdown from your repository.
                          </span>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleExtractFromText}
                          >
                            🪄 Extract & Auto-Fill
                          </Button>
                        </div>
                      </div>
                    )}

                    {importerTab === "upload" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label className="readme-upload-dropzone">
                          <input
                            type="file"
                            accept=".md,.markdown,.txt"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                          />
                          <span style={{ fontSize: "28px" }}>📄</span>
                          <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                            Click to select README.md from your computer
                          </strong>
                          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                            Supports .md, .markdown, or .txt files
                          </span>
                        </label>
                      </div>
                    )}

                    {importerTab === "github" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div className="readme-github-input-group">
                          <input
                            type="url"
                            placeholder="https://github.com/facebook/react or username/repository"
                            value={githubRepoUrl}
                            onChange={(e) => setGithubRepoUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleFetchGitHub();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            isLoading={importing}
                            onClick={handleFetchGitHub}
                          >
                            ⬇ Fetch & Auto-Fill
                          </Button>
                        </div>
                        <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                          Fetches markdown directly from GitHub and extracts Title, Tech Stack, Features & Story.
                        </span>
                      </div>
                    )}

                    {importStatus && (
                      <div className="readme-import-success-toast">
                        {importStatus}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wizard Step Tabs */}
              <div className="modal-tab-bar" style={{ display: "flex", borderBottom: "1px solid var(--border-color)", padding: "0 24px", background: "var(--bg-surface-subtle)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setModalTab("basics");
                  }}
                  style={{
                    padding: "12px 18px",
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                    borderBottom: modalTab === "basics" ? "2px solid var(--primary)" : "2px solid transparent",
                    background: "none",
                    color: modalTab === "basics" ? "var(--primary)" : "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  1. Basics & Links
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setModalTab("media");
                  }}
                  style={{
                    padding: "12px 18px",
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                    borderBottom: modalTab === "media" ? "2px solid var(--primary)" : "2px solid transparent",
                    background: "none",
                    color: modalTab === "media" ? "var(--primary)" : "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  2. Visuals & Media
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setModalTab("engineering");
                  }}
                  style={{
                    padding: "12px 18px",
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                    borderBottom: modalTab === "engineering" ? "2px solid var(--primary)" : "2px solid transparent",
                    background: "none",
                    color: modalTab === "engineering" ? "var(--primary)" : "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  3. Engineering Story
                </button>
              </div>

              <form onSubmit={handleSubmitProject} className="desktop-modal-form">
                <div className="desktop-modal-body" style={{ maxHeight: "65vh", overflowY: "auto", padding: "24px" }}>
                  {!isAuthenticated && (
                    <div style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "1px solid var(--primary)",
                      color: "var(--text-primary)",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      fontSize: "13.5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px"
                    }}>
                      <span>🔒 You are browsing as a guest. Please sign in to publish your project.</span>
                      <a href="/login?redirect=/projects" className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", textDecoration: "none" }}>
                        Sign In ↗
                      </a>
                    </div>
                  )}

                  {modalError && (
                    <div style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid var(--danger, #ef4444)",
                      color: "var(--danger, #ef4444)",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>⚠️</span>
                      <span>{modalError}</span>
                    </div>
                  )}

                  {modalTab === "basics" && (
                    <div className="modal-col" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="form-group">
                        <label>Project Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. INGRIS Chatbot or FleetWatch Telemetry"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Tagline / One-Liner</label>
                        <input
                          type="text"
                          placeholder="e.g. AI-Driven Groundwater & Hydrogeological Assistant"
                          value={form.tagline}
                          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label>Category *</label>
                          <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                          >
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile">Mobile</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="DevOps">DevOps</option>
                            <option value="Tools">Tools</option>
                            <option value="UI/UX">UI/UX</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Project Status</label>
                          <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                          >
                            <option value="Active">Active</option>
                            <option value="Production">Production</option>
                            <option value="Beta">Beta</option>
                            <option value="In Development">In Development</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Technologies (Comma separated) *</label>
                        <input
                          type="text"
                          placeholder="React, Spring Boot, PostgreSQL, Docker, TensorFlow"
                          value={form.technologies}
                          onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label>GitHub Repository URL</label>
                          <input
                            type="url"
                            placeholder="https://github.com/username/project"
                            value={form.githubUrl}
                            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Live Demo URL</label>
                          <input
                            type="url"
                            placeholder="https://my-app.vercel.app"
                            value={form.liveDemoUrl}
                            onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {modalTab === "media" && (
                    <div className="modal-col" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="form-group">
                        <ImageUploader
                          label="Cover Image / High-Res Screenshot"
                          hint="Visual snapshot of software UI (Recommended: 1200x630px)"
                          value={form.coverImage}
                          onChange={(url) => setForm({ ...form, coverImage: url })}
                          aspectRatio="16/9"
                        />
                      </div>

                      <div className="form-group">
                        <label>Or Image URL</label>
                        <input
                          type="text"
                          placeholder="/images/projects/my-screenshot.png or https://..."
                          value={form.coverImage}
                          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Video Walkthrough / Demo URL (Optional)</label>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=... or Loom URL"
                          value={form.videoDemoUrl}
                          onChange={(e) => setForm({ ...form, videoDemoUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {modalTab === "engineering" && (
                    <div className="modal-col" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="form-group">
                        <label>The Problem Statement (What friction does this solve?)</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Traditional monitoring relies on manual data collection with high latency, preventing timely hazard forecasting and risk mitigation."
                          value={form.problemStatement}
                          onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Proposed Solution & Architecture</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. An automated early-warning intelligence platform combining real-time IoT/satellite telemetry with machine-learning predictive classification."
                          value={form.proposedSolution}
                          onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Key Features & Capabilities (1 per line)</label>
                        <textarea
                          rows={3}
                          placeholder="• Real-time predictive telemetry & ML risk modeling&#10;• Automated multi-channel emergency alert dispatch&#10;• High-performance async data pipeline with background scheduler&#10;• Modern interactive dashboard with geospatial GIS telemetry"
                          value={form.keyFeatures}
                          onChange={(e) => setForm({ ...form, keyFeatures: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Quickstart Run Command</label>
                        <input
                          type="text"
                          placeholder="e.g. git clone https://github.com/org/repo.git && cd repo && npm install && npm run dev"
                          value={form.quickstartCmd}
                          onChange={(e) => setForm({ ...form, quickstartCmd: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Technical Description / Architecture Notes (Optional)</label>
                        <textarea
                          rows={3}
                          placeholder="Detailed overview of technical architecture, libraries used, and deployment pipeline... (Auto-filled from proposed solution if blank)"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="desktop-modal-footer">
                  <div className="desktop-modal-footer-left">
                    {modalTab !== "basics" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setModalError("");
                          setModalTab(modalTab === "engineering" ? "media" : "basics");
                        }}
                      >
                        ← Back
                      </Button>
                    )}
                  </div>

                  <div className="desktop-modal-step-indicator">
                    {modalTab === "basics" && "Step 1 of 3: Basics & Links"}
                    {modalTab === "media" && "Step 2 of 3: Visuals & Media"}
                    {modalTab === "engineering" && "Step 3 of 3: Engineering Story"}
                  </div>

                  <div className="desktop-modal-footer-right">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setModalError("");
                      }}
                    >
                      ✕ Cancel
                    </Button>
                    {modalTab !== "engineering" ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleNextStep}
                      >
                        Next Step →
                      </Button>
                    ) : (
                      <Button type="submit" variant="primary" isLoading={submitting}>
                        {submitting ? "Publishing..." : "Publish Project 🚀"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3-Column Card Grid matching Reference */}
        <section className="projects-reference-grid">
          {loading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : filtered.length > 0 ? (
            filtered.map((project) => (
              <ProjectCard
                key={project.id || project.title}
                project={project}
                isLiked={likedIds.includes(project.id || project.title)}
                onLike={handleLike}
              />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", padding: "40px 0" }}>
              <EmptyState
                title={query || category !== "All" ? "No projects found" : "No projects have been published yet."}
                description={
                  query
                    ? `No projects matched "${query}" in category "${category}".`
                    : category !== "All"
                    ? `No projects found in category "${category}".`
                    : "Explore projects created by developers, or submit your own repository."
                }
                actionLabel={query || category !== "All" ? "Clear Filters" : undefined}
                onAction={
                  query || category !== "All"
                    ? () => {
                        setQuery("");
                        setCategory("All");
                      }
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* Bottom Pagination matching Reference Image */}
        <nav className="projects-pagination" aria-label="Projects pagination">
          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              className={`pagination-btn ${currentPage === num ? "active" : ""}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
            disabled={currentPage === 4}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>
      </div>
    </Shell>
  );
}
