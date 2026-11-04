import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Button } from "../components/ui/Button";
import { ImageUploader } from "../components/ui/ImageUploader";
import { MarkdownRenderer } from "../components/ui/MarkdownRenderer";
import { useDevSphere } from "../context/DevSphereContext";
import { projectsApi } from "../services/api";
import { parseReadmeToProject } from "../utils/readmeParser";
import { MermaidDiagram } from "../components/ui/MermaidDiagram";

const CATEGORIES = [
  "Web Development",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Tools",
  "UI/UX",
  "Other",
];

export function WriteProject() {
  const navigate = useNavigate();
  const { isAuthenticated } = useDevSphere();

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
    architectureDiagram: "",
    keyFeatures: "",
    quickstartCmd: "",
    description: "",
    status: "Active",
  });

  const [editorMode, setEditorMode] = useState("write"); // 'write' | 'preview' | 'split'
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Smart README Importer Drawer State
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [importerTab, setImporterTab] = useState("paste"); // "paste" | "upload" | "github"
  const [readmeText, setReadmeText] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [importing, setImporting] = useState(false);

  const contentRef = useRef(null);

  // Helper to insert markdown formatting into description editor
  const insertFormatting = (prefix, suffix = "", defaultPlaceholder = "text") => {
    const el = contentRef.current;
    if (!el) return;

    const start = el.selectionStart ?? form.description.length;
    const end = el.selectionEnd ?? form.description.length;
    const selected = form.description.substring(start, end);

    const isBlock =
      prefix.startsWith("#") ||
      prefix.startsWith(">") ||
      prefix.startsWith("-") ||
      prefix.startsWith("1.") ||
      prefix.trim().startsWith("|") ||
      prefix.trim().startsWith("```") ||
      prefix.trim().startsWith("$$");

    // Don't nest markers if user selected an unedited placeholder or another markdown tag
    const isPlaceholder =
      !selected ||
      /^(text|bold text|italic text|code|Main Heading|Subheading|Subsection Heading|List item|Ordered item|Link text|Start typing paragraph\.\.\.|https:\/\/[^\s]+)$/i.test(selected.trim()) ||
      /^[*#`>|\[]/.test(selected.trim());

    const textToInsert = isPlaceholder ? defaultPlaceholder : selected;

    let lead = "";
    let trail = "";

    if (isBlock) {
      if (start > 0) {
        if (form.description[start - 1] === "\n") {
          if (start > 1 && form.description[start - 2] !== "\n") {
            lead = "\n";
          }
        } else {
          lead = "\n\n";
        }
      }
      if (end < form.description.length && form.description[end] !== "\n") {
        trail = "\n\n";
      }
    }

    const cleanPrefix = prefix.replace(/^\n+/, "");
    const cleanSuffix = suffix.replace(/\n+$/, "");

    const replacement = `${lead}${cleanPrefix}${textToInsert}${cleanSuffix}${trail}`;
    const newContent =
      form.description.substring(0, start) +
      replacement +
      form.description.substring(end);

    setForm((prev) => ({ ...prev, description: newContent }));

    setTimeout(() => {
      if (!contentRef.current) return;
      contentRef.current.focus();
      const selStart = start + lead.length + cleanPrefix.length;
      const selEnd = selStart + textToInsert.length;
      contentRef.current.setSelectionRange(selStart, selEnd);
    }, 20);
  };

  const handleFormatHeading = (headingLevel) => {
    if (headingLevel === "h1") insertFormatting("# ", "", "Main Heading");
    else if (headingLevel === "h2") insertFormatting("## ", "", "Section Heading");
    else if (headingLevel === "h3") insertFormatting("### ", "", "Subsection Heading");
    else if (headingLevel === "p") insertFormatting("\n\n", "", "Start typing paragraph...");
  };

  // README Extractor logic
  const applyExtractedProject = (extracted) => {
    if (!extracted) {
      setImportStatus("❌ Could not parse any project details from the README.");
      return;
    }

    setForm((prev) => {
      const updated = { ...prev };
      if (extracted.title) updated.title = extracted.title;
      if (extracted.tagline) updated.tagline = extracted.tagline;
      if (extracted.category) updated.category = extracted.category;
      if (extracted.technologies) updated.technologies = extracted.technologies;
      if (extracted.githubUrl) updated.githubUrl = extracted.githubUrl;
      if (extracted.liveDemoUrl) updated.liveDemoUrl = extracted.liveDemoUrl;
      updated.problemStatement = extracted.problemStatement || "";
      updated.proposedSolution = extracted.proposedSolution || "";
      if (extracted.architectureDiagram) updated.architectureDiagram = extracted.architectureDiagram;
      if (extracted.keyFeatures) updated.keyFeatures = extracted.keyFeatures;
      if (extracted.quickstartCmd) updated.quickstartCmd = extracted.quickstartCmd;
      if (extracted.description) updated.description = extracted.description;
      return updated;
    });

    if (!extracted.problemStatement || !extracted.proposedSolution) {
      setImportStatus("ℹ️ README imported! No dedicated Problem Statement or Solution detected — please enter them manually in the fields below.");
    } else {
      setImportStatus("✨ Successfully extracted all sections from README into the desktop editor!");
    }
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
            // continue fallback
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!isAuthenticated) {
      setMessage("Please sign in to publish your project showcase.");
      setIsSuccess(false);
      return;
    }

    if (!form.title.trim()) {
      setMessage("Project Title is required.");
      setIsSuccess(false);
      return;
    }

    const techString = typeof form.technologies === "string"
      ? form.technologies.trim()
      : Array.isArray(form.technologies)
      ? form.technologies.join(", ").trim()
      : "";

    if (!techString) {
      setMessage("Please specify at least one technology (e.g. React, Spring Boot).");
      setIsSuccess(false);
      return;
    }

    setSubmitting(true);

    try {
      const techs = Array.isArray(form.technologies)
        ? form.technologies.filter(Boolean)
        : techString.split(",").map((t) => t.trim()).filter(Boolean);

      let finalDescription =
        form.description?.trim() ||
        form.proposedSolution?.trim() ||
        form.problemStatement?.trim() ||
        form.tagline?.trim() ||
        form.title.trim();

      if (form.architectureDiagram?.trim() && !finalDescription.includes(form.architectureDiagram.trim())) {
        finalDescription = `${finalDescription}\n\n### System Architecture\n\`\`\`mermaid\n${form.architectureDiagram.trim()}\n\`\`\``;
      }

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
        architectureDiagram: form.architectureDiagram?.trim() || "",
        architectureSummary: form.architectureDiagram?.trim()
          ? `\`\`\`mermaid\n${form.architectureDiagram.trim()}\n\`\`\`\n\n${form.description?.trim() || ""}`
          : form.description?.trim() || form.proposedSolution?.trim() || "",
        keyFeatures: form.keyFeatures?.trim() || "",
        quickstartCmd: form.quickstartCmd?.trim() || "",
        videoDemoUrl: form.videoDemoUrl?.trim() || "",
      };

      const created = await projectsApi.create(payload);
      setIsSuccess(true);
      setMessage("🎉 Project published successfully to the DevSphere community!");

      setTimeout(() => {
        navigate(`/projects/${created.id || ""}`);
      }, 1200);
    } catch (err) {
      setMessage(err.message || "Failed to submit project. Please verify required fields.");
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.description?.trim()
    ? form.description.trim().split(/\s+/).length
    : 0;

  // Split technology string into tags array
  const techPills = form.technologies
    ? form.technologies.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <Shell>
      <div className="write-blog-reference-container" style={{ padding: "28px 24px 80px" }}>
        {/* Top Back Navigation */}
        <div className="write-blog-back-nav">
          <Link to="/projects" className="write-blog-back-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Projects</span>
          </Link>
        </div>

        {/* Page Header */}
        <header className="write-blog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="write-blog-page-title">Submit & Showcase a Project</h1>
            <p className="write-blog-page-subtitle">
              Full desktop studio to write your software architecture story, technical decisions, and live demo.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/projects")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={submitting}
              onClick={handleSubmit}
            >
              Publish Project 🚀
            </Button>
          </div>
        </header>

        {/* Guest Warning */}
        {!isAuthenticated && (
          <div style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid var(--primary-border, rgba(99, 102, 241, 0.3))",
            color: "var(--text-primary)",
            padding: "14px 20px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🔒</span>
              <span>You are viewing as a guest. Please sign in to publish your project showcase.</span>
            </div>
            <Link to="/login?redirect=/write-project" className="btn-primary" style={{ padding: "6px 16px", fontSize: "13px", textDecoration: "none" }}>
              Sign In ↗
            </Link>
          </div>
        )}

        {/* Submission Result Banner */}
        {message && (
          <div style={{
            padding: "14px 20px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: 500,
            background: isSuccess ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${isSuccess ? "#10b981" : "#ef4444"}`,
            color: isSuccess ? "#059669" : "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>{isSuccess ? "✅" : "⚠️"}</span>
            <span>{message}</span>
          </div>
        )}

        {/* Top Feature: ⚡ Auto-Fill from README / GitHub Accordion */}
        <div className="readme-importer-container" style={{ margin: "0 0 28px 0" }}>
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
                    ONE-CLICK IMPORT
                  </span>
                </h4>
                <p>Paste your README markdown, upload a .md file, or enter a GitHub URL to auto-populate all sections instantly.</p>
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
                    placeholder="# My Project Name&#10;&#10;> An intelligent developer platform...&#10;&#10;## Problem Statement&#10;Developers lacked a centralized place...&#10;&#10;## Features&#10;- Fast real-time analytics"
                    value={readmeText}
                    onChange={(e) => setReadmeText(e.target.value)}
                  />
                  <div className="readme-importer-actions">
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Tip: Paste raw README.md markdown from your repository.
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleExtractFromText}
                    >
                      🪄 Extract & Auto-Fill All Sections
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
                    <span style={{ fontSize: "32px" }}>📄</span>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                      Click to select README.md from your computer
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
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
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Fetches raw markdown directly from GitHub and populates Problem, Solution, Tech Stack & Quickstart.
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

        {/* 2-Column Desktop Magazine Layout matching WriteBlog */}
        <div className="write-blog-layout-grid">
          {/* Main Left Column: Big Writing Canvas */}
          <main className="write-blog-main-form">
            {/* Project Title */}
            <div className="write-field-group">
              <label className="write-field-label">Project Title *</label>
              <input
                type="text"
                className="write-text-input"
                style={{ fontSize: "20px", fontWeight: 700, padding: "14px 18px" }}
                placeholder="e.g. INGRIS - AI-Driven Groundwater Assistant"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Tagline / Subtitle */}
            <div className="write-field-group">
              <label className="write-field-label">Tagline / One-Liner</label>
              <input
                type="text"
                className="write-text-input"
                placeholder="e.g. Access real-time Central Ground Water Board reports with multi-provider AI reasoning."
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>

            {/* Big Section 1: The Problem Statement */}
            <div className="write-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="write-field-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚠️</span>
                  <span>The Problem Statement (What friction does this project solve?)</span>
                </label>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Markdown enabled</span>
              </div>
              {!form.problemStatement && (
                <div style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#dc2626",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>⚠️</span>
                  <span>No problem statement detected in README. Please enter your project's problem statement manually.</span>
                </div>
              )}
              <textarea
                className="write-text-input"
                style={{
                  minHeight: "110px",
                  lineHeight: "1.6",
                  fontFamily: "var(--font-sans)",
                  resize: "vertical"
                }}
                placeholder="Describe the real-world friction, inefficiencies, or missing developer capabilities that motivated you to build this software..."
                value={form.problemStatement}
                onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
              />
            </div>

            {/* Big Section 2: Proposed Solution & System Architecture */}
            <div className="write-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="write-field-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>💡</span>
                  <span>Proposed Solution & Narrative</span>
                </label>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Markdown enabled</span>
              </div>
              {!form.proposedSolution && (
                <div style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  color: "#d97706",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>ℹ️</span>
                  <span>No proposed solution detected in README. Please describe how your project solves the problem manually.</span>
                </div>
              )}
              <textarea
                className="write-text-input"
                style={{
                  minHeight: "130px",
                  lineHeight: "1.6",
                  fontFamily: "var(--font-sans)",
                  resize: "vertical"
                }}
                placeholder="Detail the technical approach: system layers, AI/ML models, data pipelines, caching, and state synchronization..."
                value={form.proposedSolution}
                onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
              />
            </div>

            {/* Big Section 2b: System Architecture Diagram (Mermaid.js Flowchart) */}
            <div className="write-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="write-field-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🗺️</span>
                  <span>System Architecture Flowchart (Mermaid.js)</span>
                </label>
                <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>Interactive Flowchart Preview</span>
              </div>
              <textarea
                className="write-text-input"
                style={{
                  minHeight: "120px",
                  lineHeight: "1.5",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  resize: "vertical"
                }}
                placeholder="graph TD;&#10;  Client[Frontend: React/Vite] --> |REST API| API[Spring Boot Gateway]&#10;  API --> Service[Project & Blog Microservices]&#10;  Service --> DB[(PostgreSQL Database)]"
                value={form.architectureDiagram}
                onChange={(e) => setForm({ ...form, architectureDiagram: e.target.value })}
              />
              {form.architectureDiagram && (
                <div style={{ marginTop: "12px" }}>
                  <MermaidDiagram chart={form.architectureDiagram} title="Live Architecture Flowchart Preview" />
                </div>
              )}
            </div>

            {/* Big Section 3: Key Features & Capabilities */}
            <div className="write-field-group">
              <label className="write-field-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✨</span>
                <span>Key Features & Capabilities (1 bullet per line)</span>
              </label>
              <textarea
                className="write-text-input"
                style={{
                  minHeight: "130px",
                  lineHeight: "1.6",
                  fontFamily: "var(--font-sans)",
                  resize: "vertical"
                }}
                placeholder="• Real-time predictive telemetry & ML risk modeling&#10;• Automated multi-channel emergency alert dispatch&#10;• High-performance async data pipeline with background scheduler&#10;• Modern interactive dashboard with geospatial GIS telemetry"
                value={form.keyFeatures}
                onChange={(e) => setForm({ ...form, keyFeatures: e.target.value })}
              />
            </div>

            {/* Big Section 4: Quickstart Run Command */}
            <div className="write-field-group">
              <label className="write-field-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚡</span>
                <span>Quickstart CLI Command</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                <span style={{ position: "absolute", left: "14px", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 700 }}>$</span>
                <input
                  type="text"
                  className="write-text-input"
                  style={{ paddingLeft: "32px", fontFamily: "var(--font-mono, monospace)", fontSize: "13.5px", width: "100%" }}
                  placeholder="git clone https://github.com/org/repo.git && cd repo && npm install && npm run dev"
                  value={form.quickstartCmd}
                  onChange={(e) => setForm({ ...form, quickstartCmd: e.target.value })}
                />
              </div>
            </div>

            {/* Big Section 5: Rich Engineering Notes & Deep Dive with Markdown Toolbar */}
            <div className="write-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="write-field-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📖</span>
                  <span>Deep Dive Architecture & Technical Notes (Rich Markdown)</span>
                </label>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {wordCount} words
                </span>
              </div>

              <div className="write-rich-editor">
                {/* Formatting Toolbar with Vector SVG Icons */}
                <div className="write-editor-toolbar">
                  <select
                    className="toolbar-select"
                    onChange={(e) => {
                      handleFormatHeading(e.target.value);
                      e.target.value = "p";
                    }}
                    defaultValue="p"
                  >
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                  </select>

                  <span className="toolbar-divider" />

                  {/* Bold */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("**", "**", "bold text")}
                    title="Bold"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                    </svg>
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("*", "*", "italic text")}
                    title="Italic"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="4" x2="10" y2="4" />
                      <line x1="14" y1="20" x2="5" y2="20" />
                      <line x1="15" y1="4" x2="9" y2="20" />
                    </svg>
                  </button>

                  {/* Code */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("`", "`", "code")}
                    title="Inline Code"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </button>

                  {/* Quote */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("> ", "", "Architecture decision...")}
                    title="Blockquote"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                    </svg>
                  </button>

                  {/* Bullet list */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("- ", "", "Module capability")}
                    title="Bulleted List"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="9" y1="6" x2="20" y2="6" />
                      <line x1="9" y1="12" x2="20" y2="12" />
                      <line x1="9" y1="18" x2="20" y2="18" />
                      <circle cx="4" cy="6" r="1.8" fill="currentColor" />
                      <circle cx="4" cy="12" r="1.8" fill="currentColor" />
                      <circle cx="4" cy="18" r="1.8" fill="currentColor" />
                    </svg>
                  </button>

                  {/* Numbered list */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("1. ", "", "Pipeline phase")}
                    title="Numbered List"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="10" y1="6" x2="21" y2="6" />
                      <line x1="10" y1="12" x2="21" y2="12" />
                      <line x1="10" y1="18" x2="21" y2="18" />
                      <path d="M4 6h1v4" />
                      <path d="M4 10h2" />
                      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                    </svg>
                  </button>

                  {/* Link */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("[", "](https://example.com)", "Link text")}
                    title="Link"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>

                  {/* Image */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("![Architecture Diagram](", ")", "https://images.unsplash.com/photo-1555066931-4365d14bab8c")}
                    title="Insert Image"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>

                  {/* Table */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("\n| Microservice | Technology | Port | Database |\n| --- | --- | --- | --- |\n| project-service | Java Spring Boot | 8081 | PostgreSQL |\n| blog-service | Java Spring Boot | 8082 | PostgreSQL |\n", "", "")}
                    title="Table"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M3 15h18" />
                      <path d="M9 3v18" />
                      <path d="M15 3v18" />
                    </svg>
                  </button>

                  {/* Code Block */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("\n```typescript\n// Architectural example\nexport interface ProjectPayload {\n  title: string;\n  status: 'Active' | 'Beta';\n}\n```\n", "", "")}
                    title="Code Block"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </button>

                  {/* Math / KaTeX Formula */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("\n$$\n\\hat{y}_{nj} = f(\\mathbf{x}_{nj}; \\mathbf{\\theta}) \\in \\{0, 1\\}\n$$\n", "", "")}
                    title="Math Formula (KaTeX)"
                  >
                    <span style={{ fontWeight: 800, fontSize: "14px", fontFamily: "serif" }}>∑</span>
                  </button>

                  {/* Mode Toggles */}
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      className={`toolbar-btn ${editorMode === "write" ? "active" : ""}`}
                      onClick={() => setEditorMode("write")}
                      title="Write Markdown"
                      style={{
                        padding: "5px 10px",
                        width: "auto",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: editorMode === "write" ? "var(--primary-light, rgba(99, 102, 241, 0.12))" : "transparent",
                        color: editorMode === "write" ? "var(--primary)" : "var(--text-secondary)",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className={`toolbar-btn ${editorMode === "preview" ? "active" : ""}`}
                      onClick={() => setEditorMode("preview")}
                      title="Preview Formatted Output"
                      style={{
                        padding: "5px 10px",
                        width: "auto",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: editorMode === "preview" ? "var(--primary-light, rgba(99, 102, 241, 0.12))" : "transparent",
                        color: editorMode === "preview" ? "var(--primary)" : "var(--text-secondary)",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      className={`toolbar-btn ${editorMode === "split" ? "active" : ""}`}
                      onClick={() => setEditorMode("split")}
                      title="Side-by-Side Split View"
                      style={{
                        padding: "5px 10px",
                        width: "auto",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: editorMode === "split" ? "var(--primary-light, rgba(99, 102, 241, 0.12))" : "transparent",
                        color: editorMode === "split" ? "var(--primary)" : "var(--text-secondary)",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="3" x2="12" y2="21" />
                      </svg>
                      <span>Split</span>
                    </button>
                  </div>
                </div>

                {/* Editor Body */}
                <div style={{ display: "grid", gridTemplateColumns: editorMode === "split" ? "1fr 1fr" : "1fr", minHeight: "360px" }}>
                  {(editorMode === "write" || editorMode === "split") && (
                    <textarea
                      ref={contentRef}
                      className="write-editor-textarea"
                      style={{
                        minHeight: "360px",
                        borderRight: editorMode === "split" ? "1px solid var(--border-color)" : "none",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "14px",
                        lineHeight: 1.6
                      }}
                      placeholder="Write your comprehensive technical documentation, architecture decisions, trade-offs, benchmarks, and deployment steps in rich markdown..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  )}

                  {(editorMode === "preview" || editorMode === "split") && (
                    <div style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "600px", background: "var(--bg-canvas)" }}>
                      {form.description?.trim() ? (
                        <MarkdownRenderer content={form.description} />
                      ) : (
                        <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                          Nothing to preview yet. Write markdown in the editor to see rendered technical documentation.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="write-actions-bottom" style={{ paddingTop: "12px" }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
              >
                ← Back to Projects
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={submitting}
                onClick={handleSubmit}
              >
                Publish Project 🚀
              </Button>
            </div>
          </main>

          {/* Right Sidebar: Desktop Inspector */}
          <aside className="write-blog-sidebar">
            {/* Card 1: Publish & Save */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <h3 className="write-card-title">Publish Controls</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  isLoading={submitting}
                  onClick={handleSubmit}
                >
                  Publish to Community 🚀
                </Button>

                <div className="write-field-group">
                  <label className="write-field-label">Project Status</label>
                  <select
                    className="write-select-input"
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
            </div>

            {/* Card 2: Cover Image & Media */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <h3 className="write-card-title">UI Screenshot & Cover</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <ImageUploader
                  label="Cover Image / Screenshot"
                  hint="Visual snapshot of software UI (1200x630px)"
                  value={form.coverImage}
                  onChange={(url) => setForm({ ...form, coverImage: url })}
                  aspectRatio="16/9"
                />

                <div className="write-field-group">
                  <label className="write-field-label" style={{ fontSize: "12px" }}>Or Direct Image URL</label>
                  <input
                    type="text"
                    className="write-text-input"
                    style={{ fontSize: "12.5px" }}
                    placeholder="https://... or /images/projects/sample.png"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  />
                </div>

                <div className="write-field-group">
                  <label className="write-field-label" style={{ fontSize: "12px" }}>Video Demo Walkthrough (Optional)</label>
                  <input
                    type="url"
                    className="write-text-input"
                    style={{ fontSize: "12.5px" }}
                    placeholder="YouTube or Loom URL"
                    value={form.videoDemoUrl}
                    onChange={(e) => setForm({ ...form, videoDemoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Metadata & Links */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h3 className="write-card-title">Project Metadata</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="write-field-group">
                  <label className="write-field-label">Category *</label>
                  <select
                    className="write-select-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="write-field-group">
                  <label className="write-field-label">Technologies (Comma separated) *</label>
                  <input
                    type="text"
                    className="write-text-input"
                    placeholder="React, Spring Boot, PostgreSQL, Docker"
                    value={form.technologies}
                    onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    required
                  />
                  {techPills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {techPills.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            padding: "2px 8px",
                            borderRadius: "4px"
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="write-field-group">
                  <label className="write-field-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="write-text-input"
                    placeholder="https://github.com/username/project"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  />
                </div>

                <div className="write-field-group">
                  <label className="write-field-label">Live Demo URL</label>
                  <input
                    type="url"
                    className="write-text-input"
                    placeholder="https://my-app.vercel.app"
                    value={form.liveDemoUrl}
                    onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Tips for Showcasing */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6M10 22h4M12 2v1M12 18v-2a7 7 0 1 0-7-7c0 2.22 1.03 4.2 2.65 5.5.85.69 1.35 1.7 1.35 2.5z" />
                </svg>
                <h3 className="write-card-title">Tips for a great showcase</h3>
              </div>

              <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                <li><strong>Clear Problem:</strong> Explain the friction before introducing the code.</li>
                <li><strong>Architecture Diagram:</strong> Include system diagrams or ASCII dataflows.</li>
                <li><strong>Quickstart Command:</strong> Give peers a 1-line copyable command to run.</li>
                <li><strong>Realistic Screenshots:</strong> High-res UI screenshots attract 3x more upvotes.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

