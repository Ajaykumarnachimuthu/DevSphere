import React, { useState, useMemo } from "react";
import { Button } from "../ui/Button";
import { ImageUploader } from "../ui/ImageUploader";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { MermaidDiagram } from "../ui/MermaidDiagram";
import { projectsApi } from "../../services/api";

const CATEGORIES = [
  "Web Development",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Tools",
  "UI/UX",
  "Other",
];

const STATUS_OPTIONS = [
  "Active",
  "In Progress",
  "Beta",
  "Archived",
];

function extractMermaidCode(project) {
  if (!project) return "";
  const sources = [
    project.architectureDiagram,
    project.architectureSummary,
    project.description,
    project.proposedSolution,
    project.problemStatement,
  ];
  for (const src of sources) {
    if (!src || typeof src !== "string") continue;
    const match = src.match(/```(?:mermaid|flowchart)[\s\r\n]+([\s\S]+?)```/i);
    if (match) return match[1].trim();
    const rawGraph = src.match(/(?:^|\n)((?:graph\s+(?:TD|TB|LR|RL|BT)|flowchart\s+(?:TD|TB|LR|RL|BT)|sequenceDiagram)[\s\S]+?)(?=\n#{1,4}\s|\n\n\n|$)/i);
    if (rawGraph) return rawGraph[1].trim();
  }
  return "";
}

function isMermaidString(str) {
  if (!str || typeof str !== "string") return false;
  const clean = str.trim();
  return (
    clean.startsWith("```mermaid") ||
    /^\s*(graph\s+(?:TD|TB|LR|RL|BT)|flowchart\s+(?:TD|TB|LR|RL|BT)|sequenceDiagram)\b/i.test(clean)
  );
}

export function EditProjectModal({ project, isOpen, onClose, onSave }) {
  if (!isOpen || !project) return null;

  const initialMermaid = useMemo(() => extractMermaidCode(project), [project]);

  // Clean problem statement if it was polluted with raw mermaid code
  const initialProblem = isMermaidString(project.problemStatement) ? "" : (project.problemStatement || "");
  const initialSolution = isMermaidString(project.proposedSolution) ? "" : (project.proposedSolution || "");

  const [activeTab, setActiveTab] = useState("general"); // 'general', 'narrative', 'architecture', 'features', 'media', 'docs'
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    title: project.title || "",
    tagline: project.tagline || "",
    category: project.category || "Web Development",
    status: project.status || "Active",
    technologies: Array.isArray(project.technologies)
      ? project.technologies.join(", ")
      : project.technologies || "",
    coverImage: project.coverImage || "",
    videoDemoUrl: project.videoDemoUrl || "",
    githubUrl: project.githubUrl || "",
    liveDemoUrl: project.liveDemoUrl || "",
    problemStatement: initialProblem,
    proposedSolution: initialSolution,
    architectureDiagram: initialMermaid,
    architectureSummary: project.architectureSummary || "",
    keyFeatures: project.keyFeatures || "",
    quickstartCmd: project.quickstartCmd || "",
    description: project.description || "",
  });

  const [docPreviewMode, setDocPreviewMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("Project Title is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const techList = form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Ensure architecture diagram is preserved in description/summary
      let finalDescription = form.description.trim() || form.title.trim();
      if (form.architectureDiagram?.trim() && !finalDescription.includes(form.architectureDiagram.trim())) {
        finalDescription = `${finalDescription}\n\n### System Architecture\n\`\`\`mermaid\n${form.architectureDiagram.trim()}\n\`\`\``;
      }

      const finalArchSummary = form.architectureDiagram?.trim()
        ? `\`\`\`mermaid\n${form.architectureDiagram.trim()}\n\`\`\`\n\n${form.architectureSummary?.trim() || ""}`
        : form.architectureSummary?.trim() || form.proposedSolution?.trim() || "";

      const payload = {
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        category: form.category,
        status: form.status,
        technologies: techList,
        coverImage: form.coverImage.trim(),
        videoDemoUrl: form.videoDemoUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        liveDemoUrl: form.liveDemoUrl.trim(),
        problemStatement: form.problemStatement.trim(),
        proposedSolution: form.proposedSolution.trim(),
        architectureDiagram: form.architectureDiagram.trim(),
        architectureSummary: finalArchSummary,
        keyFeatures: form.keyFeatures.trim(),
        quickstartCmd: form.quickstartCmd.trim(),
        description: finalDescription,
      };

      const updated = await projectsApi.update(project.id, payload);
      const merged = { ...project, ...updated, ...payload };
      setSuccessMsg("✨ Project updated successfully!");
      if (onSave) {
        onSave(merged);
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error("Save project error:", err);
      setErrorMsg(err.message || "Failed to save project changes. Please check required fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="desktop-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="desktop-modal-dialog"
        style={{
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface-subtle)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "#6366f1",
                  background: "rgba(99, 102, 241, 0.12)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                }}
              >
                Project Studio • Full Editor
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                ID: {String(project.id).slice(0, 8)}...
              </span>
            </div>
            <h2
              style={{
                margin: "4px 0 0 0",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Edit Project Showcase
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "18px",
              color: "var(--text-secondary)",
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-surface)",
            padding: "0 16px",
            overflowX: "auto",
            gap: "4px",
          }}
        >
          {[
            { id: "general", label: "General & Tech", icon: "📋" },
            { id: "narrative", label: "Problem & Solution", icon: "💡" },
            { id: "architecture", label: "Architecture & Flowchart", icon: "🗺️" },
            { id: "features", label: "Features & Quickstart", icon: "✨" },
            { id: "media", label: "Media & External Links", icon: "🖼️" },
            { id: "docs", label: "Technical Docs", icon: "📝" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 14px",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === tab.id ? "3px solid #6366f1" : "3px solid transparent",
                color: activeTab === tab.id ? "#6366f1" : "var(--text-secondary)",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "13.5px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Alerts / Feedback */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 24px",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div
            style={{
              padding: "10px 24px",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10b981",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <span>✨</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div
            style={{
              padding: "24px",
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* TAB 1: General & Tech */}
            {activeTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                    Project Title *
                  </label>
                  <input
                    type="text"
                    className="write-text-input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. GLOF Sentinel"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                    Tagline / One-Liner Summary
                  </label>
                  <input
                    type="text"
                    className="write-text-input"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="High-level value proposition or mission statement"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                      Category
                    </label>
                    <select
                      className="write-select-input"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                      Project Status
                    </label>
                    <select
                      className="write-select-input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                    Technologies & Stack (Comma Separated)
                  </label>
                  <input
                    type="text"
                    className="write-text-input"
                    value={form.technologies}
                    onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    placeholder="React, Spring Boot, PostgreSQL, Docker, FastAPI"
                  />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                    Peers can filter projects by these technologies in the community showcase.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: Problem & Solution Narrative */}
            {activeTab === "narrative" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>⚠️</span>
                      <span>The Problem Statement</span>
                    </label>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Markdown narrative</span>
                  </div>
                  <textarea
                    className="write-text-input"
                    rows={5}
                    value={form.problemStatement}
                    onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                    placeholder="Describe the real-world friction, inefficiencies, or safety challenges that motivated building this system..."
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>💡</span>
                      <span>The Proposed Solution</span>
                    </label>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Markdown narrative</span>
                  </div>
                  <textarea
                    className="write-text-input"
                    rows={5}
                    value={form.proposedSolution}
                    onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
                    placeholder="Explain how the software addresses the problem: architecture approach, intelligent algorithms, and user impact..."
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Architecture & Flowchart (Mermaid) */}
            {activeTab === "architecture" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>🗺️</span>
                      <span>System Architecture Diagram (Mermaid.js Flowchart)</span>
                    </label>
                    <span style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>Interactive Live Preview Below</span>
                  </div>
                  <textarea
                    className="write-text-input"
                    rows={6}
                    style={{ fontFamily: "monospace", fontSize: "13px" }}
                    value={form.architectureDiagram}
                    onChange={(e) => setForm({ ...form, architectureDiagram: e.target.value })}
                    placeholder={"graph TD;\n  Client[Frontend: React/Vite] --> |REST API| Gateway[Spring Boot Gateway]\n  Gateway --> ProjectSvc[Project Service]\n  Gateway --> BlogSvc[Blog Service]\n  ProjectSvc --> DB[(PostgreSQL)]"}
                  />
                </div>

                {form.architectureDiagram ? (
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Live Rendered Diagram Preview:
                    </label>
                    <MermaidDiagram chart={form.architectureDiagram} title="Interactive Architecture Flowchart" />
                  </div>
                ) : (
                  <div style={{ padding: "16px", background: "var(--bg-surface-subtle)", borderRadius: "8px", fontSize: "12.5px", color: "var(--text-muted)" }}>
                    💡 Tip: Enter a Mermaid diagram like <code>graph TD; Client --&gt; Server</code> to render a live SVG flowchart.
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                    Architecture Decisions & Trade-Offs (Markdown Notes)
                  </label>
                  <textarea
                    className="write-text-input"
                    rows={3}
                    value={form.architectureSummary}
                    onChange={(e) => setForm({ ...form, architectureSummary: e.target.value })}
                    placeholder="Key architectural choices: microservices boundary, database normalization, caching strategy..."
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Features & Quickstart */}
            {activeTab === "features" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 700, marginBottom: "6px" }}>
                    ✨ Key Features & Capabilities (One Bullet per Line)
                  </label>
                  <textarea
                    className="write-text-input"
                    rows={6}
                    value={form.keyFeatures}
                    onChange={(e) => setForm({ ...form, keyFeatures: e.target.value })}
                    placeholder={"• Intelligent RAG Chatbot: Combines Google Gemini LLM with vector search\n• Real-Time Geospatial Telemetry: Live satellite lake tracking\n• Multi-Channel Emergency Broadcast: Automated SMS, WhatsApp & Siren dispatch\n• Fault-Tolerant Hybrid Microservices: Isolated database per service with zero cascading downtime"}
                  />
                </div>

                {/* Features Pills Live Preview */}
                {form.keyFeatures && (
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      Card Preview in Showcase:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
                      {form.keyFeatures
                        .split("\n")
                        .map((l) => l.replace(/^[-*•\ufffd\u2022]\s*/, "").trim())
                        .filter(Boolean)
                        .map((feat, idx) => {
                          const boldMatch = feat.match(/^\*\*([^*]+)\*\*[:\s]*(.*)$/);
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 14px",
                                background: "var(--bg-surface-subtle)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                fontSize: "13px",
                              }}
                            >
                              <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                              <span>
                                {boldMatch ? (
                                  <>
                                    <strong>{boldMatch[1]}: </strong>
                                    <span>{boldMatch[2]}</span>
                                  </>
                                ) : (
                                  feat.replace(/\*\*/g, "")
                                )}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 700, marginBottom: "6px" }}>
                    ⚡ Quickstart CLI Command (1-Click Run)
                  </label>
                  <input
                    type="text"
                    className="write-text-input"
                    style={{ fontFamily: "monospace" }}
                    value={form.quickstartCmd}
                    onChange={(e) => setForm({ ...form, quickstartCmd: e.target.value })}
                    placeholder="git clone https://github.com/org/repo.git && cd repo && docker-compose up -d"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: Media & External Links */}
            {activeTab === "media" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <ImageUploader
                  value={form.coverImage}
                  onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
                  label="Project Cover Image / Screenshot"
                  hint="Visual snapshot of software UI (Recommended: 1200×630px). Upload a local file or paste image URL."
                  aspectRatio="16/9"
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      className="write-text-input"
                      value={form.githubUrl}
                      onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                      placeholder="https://github.com/organization/repo"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      className="write-text-input"
                      value={form.liveDemoUrl}
                      onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                      placeholder="https://my-app.vercel.app"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                    📺 Video Walkthrough / Demo URL (YouTube, Vimeo, or Video Stream)
                  </label>
                  <input
                    type="url"
                    className="write-text-input"
                    value={form.videoDemoUrl}
                    onChange={(e) => setForm({ ...form, videoDemoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            )}

            {/* TAB 6: Technical Documentation (Markdown) */}
            {activeTab === "docs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: 700 }}>
                    Deep Dive Technical Documentation (Rich Markdown)
                  </label>
                  <button
                    type="button"
                    onClick={() => setDocPreviewMode(!docPreviewMode)}
                    style={{
                      padding: "4px 12px",
                      fontSize: "12px",
                      background: "transparent",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {docPreviewMode ? "✏️ Edit Markdown" : "👁️ Live Preview"}
                  </button>
                </div>

                {docPreviewMode ? (
                  <div
                    style={{
                      minHeight: "260px",
                      padding: "20px",
                      background: "var(--bg-surface-subtle)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      overflowY: "auto",
                    }}
                  >
                    <MarkdownRenderer content={form.description} />
                  </div>
                ) : (
                  <textarea
                    className="write-text-input"
                    rows={12}
                    style={{ fontFamily: "monospace", fontSize: "13.5px", lineHeight: "1.6" }}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="### Technical Architecture&#10;&#10;Explain internal mechanisms, state synchronization, caching, and background workers..."
                  />
                )}
              </div>
            )}
          </div>

          {/* Sticky Modal Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-surface-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              Tab: <strong style={{ color: "var(--text-primary)" }}>{activeTab.toUpperCase()}</strong> • All changes persist immediately to database.
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes 🚀
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;

