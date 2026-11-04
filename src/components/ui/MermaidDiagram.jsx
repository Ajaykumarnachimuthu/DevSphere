import React, { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";

// Configure mermaid once
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
});

/**
 * Normalizes common variations in user-written Mermaid diagrams
 * (e.g. `-> |label|` to `--> |label|`, stripping outer fences)
 */
export function normalizeMermaidCode(raw) {
  if (!raw || typeof raw !== "string") return "";
  let code = raw.trim();

  // Strip code fences like ```mermaid ... ``` or ``` ... ```
  code = code.replace(/^```(?:mermaid|flowchart)?[\r\n]+/i, "").replace(/```\s*$/, "").trim();

  // Fix single dash arrows with pipe labels: `A -> |label| B` => `A --> |label| B`
  code = code.replace(/(\[[^\]]+\]|\([^\)]+\)|\w+)\s*->\s*\|([^|]+)\|\s*/g, "$1 --> |$2| ");

  // Fix `->` alone if flowchart: `A -> B` => `A --> B`
  code = code.replace(/(\[[^\]]+\]|\([^\)]+\)|\w+)\s*->\s*(\[[^\]]+\]|\([^\)]+\)|\w+)/g, "$1 --> $2");

  // Ensure diagram type header if missing but uses arrow syntax
  if (!/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|quadrantChart|mindmap)\b/i.test(code)) {
    if (code.includes("-->") || code.includes("->")) {
      code = `graph TD\n${code}`;
    }
  }

  return code;
}

export function MermaidDiagram({ chart, title = "System Architecture Flow", className = "" }) {
  const containerRef = useRef(null);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [renderError, setRenderError] = useState(null);
  const [svgHtml, setSvgHtml] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanChart = normalizeMermaidCode(chart);

  useEffect(() => {
    let isCurrent = true;
    if (!cleanChart) {
      setSvgHtml("");
      setRenderError(null);
      return;
    }

    const renderChart = async () => {
      try {
        setRenderError(null);
        const uniqueId = `mermaid_diag_${reactId}_${Date.now()}`;
        // Render SVG string
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isCurrent) {
          setSvgHtml(svg);
        }
      } catch (err) {
        if (isCurrent) {
          console.warn("Mermaid render warning:", err);
          setRenderError(err?.message || "Could not render diagram");
        }
      }
    };

    renderChart();

    return () => {
      isCurrent = false;
      // Clean up any lingering error elements created by mermaid in document.body
      const errorDiv = document.getElementById("d" + reactId);
      if (errorDiv) {
        errorDiv.remove();
      }
    };
  }, [cleanChart, reactId]);

  const handleCopy = () => {
    if (!cleanChart) return;
    navigator.clipboard?.writeText(cleanChart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cleanChart) return null;

  return (
    <div
      className={`mermaid-interactive-container ${className}`}
      style={{
        margin: "18px 0",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg, 12px)",
        boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))",
        overflow: "hidden",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--bg-surface-subtle, rgba(99, 102, 241, 0.04))",
          borderBottom: "1px solid var(--border-color)",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
          <span style={{ fontSize: "16px" }}>🗺️</span>
          <span>{title}</span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "var(--primary, #6366f1)",
              fontWeight: 700,
            }}
          >
            Interactive Mermaid
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {showCode ? "Show Diagram" : "View Code"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              background: copied ? "rgba(16, 185, 129, 0.15)" : "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: copied ? "#059669" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div style={{ padding: "20px", display: "flex", justifyContent: "center", overflowX: "auto" }}>
        {showCode ? (
          <pre
            style={{
              width: "100%",
              margin: 0,
              padding: "16px",
              background: "var(--bg-code, #0f172a)",
              color: "#f8fafc",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "monospace",
              lineHeight: 1.6,
              overflowX: "auto",
            }}
          >
            {cleanChart}
          </pre>
        ) : renderError ? (
          <div style={{ width: "100%", padding: "16px", textAlign: "left" }}>
            <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "8px", fontWeight: 600 }}>
              ⚠️ Diagram Syntax Preview Fallback:
            </div>
            <pre
              style={{
                margin: 0,
                padding: "16px",
                background: "var(--bg-code, #0f172a)",
                color: "#f8fafc",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "monospace",
                lineHeight: 1.6,
                overflowX: "auto",
              }}
            >
              {cleanChart}
            </pre>
          </div>
        ) : svgHtml ? (
          <div
            ref={containerRef}
            className="mermaid-svg-wrapper"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              minHeight: "160px",
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div style={{ padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
            Rendering architecture diagram...
          </div>
        )}
      </div>
    </div>
  );
}

export default MermaidDiagram;

