import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";
import { MermaidDiagram } from "./MermaidDiagram";

marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    heading({ tokens, depth, raw }) {
      const text = this.parser.parseInline(tokens);
      const id = raw
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
  },
});

function preprocessContent(content) {
  if (!content) return "";
  let text = String(content);

  // 1. Remove empty code fences and whitespace-only fences that render as black rectangular bars
  text = text.replace(/```[a-zA-Z0-9_-]*[\s\r\n]*```/g, "");

  // 2. Break bracketed pipeline stages onto individual lines (e.g., [ 1. Understand Traveller ] ... [ 2. Plan Journey ])
  text = text.replace(/([^\n])\s*(\[\s*\d+\.\s+[^\]]+\])/g, "$1\n$2");

  // 3. Convert ASCII arrows to clean typography arrows (for prose, outside of mermaid)
  text = text.replace(/--->|-->/g, " → ");

  // 4. Format code fences cleanly with dedicated lines for open and close markers
  text = text.replace(/([^\n])\s*(```[a-zA-Z0-9_-]*)/g, "$1\n\n$2\n");
  text = text.replace(/(```[a-zA-Z0-9_-]*)\s*([^\n`])/g, "$1\n$2");
  text = text.replace(/([^\n`])\s*(```)(?!\w)/g, "$1\n$2\n\n");

  // 5. Render display math blocks ($$ ... $$) via KaTeX
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `\n\n<div class="math-display-container">${rendered}</div>\n\n`;
    } catch {
      return `\n\n<div class="math-display-card"><span class="math-icon">📐</span><span class="math-formula">${math.trim()}</span></div>\n\n`;
    }
  });

  // 6. Render inline math ($ ... $) via KaTeX
  text = text.replace(/(^|[^\$])\$([a-zA-Z0-9_\\{}^+*=()\/:, \-\*<>\|\.]+?)\$(?!\$)/g, (match, prefix, math) => {
    const trimmed = math.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return match;
    }
    try {
      const rendered = katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false,
      });
      return `${prefix}<span class="math-inline-container">${rendered}</span>`;
    } catch {
      return `${prefix}<span class="math-inline-tag">${trimmed}</span>`;
    }
  });

  // 7. Convert inline bullet points glued into a single line into clean markdown lists
  text = text.replace(/([^\n])\s+-\s+([A-Za-z0-9$*`•])/g, "$1\n\n- $2");

  // 8. Clean trailing horizontal rule dividers
  text = text.replace(/\s*---\s*$/, "");

  return text;
}

function renderMarkdownHtml(markdownText) {
  try {
    const preprocessed = preprocessContent(markdownText);
    const rawHtml = marked.parse(preprocessed);
    return DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ["target", "rel", "class", "id", "style", "aria-hidden"],
      ADD_TAGS: [
        "math", "semantics", "annotation", "annotation-xml",
        "mrow", "mi", "mo", "mn", "msub", "msup", "msubsup",
        "mfrac", "mtext", "mspace", "msqrt", "mtable", "mtr", "mtd"
      ],
    });
  } catch (e) {
    console.warn("Markdown render error", e);
    return String(markdownText);
  }
}

export function MarkdownRenderer({ content, className = "" }) {
  const segments = useMemo(() => {
    if (!content) return [];
    const text = String(content).trim();

    // 1. If entire content is a raw mermaid diagram (without ``` fences)
    if (/^\s*(graph\s+(?:TD|TB|LR|RL|BT)|flowchart\s+(?:TD|TB|LR|RL|BT)|sequenceDiagram|classDiagram|stateDiagram|erDiagram)\b/i.test(text)) {
      return [{ type: "mermaid", content: text }];
    }

    // 2. Split on ```mermaid ... ``` or ```flowchart ... ``` blocks
    const regex = /(```(?:mermaid|flowchart)[\s\S]*?```)/gi;
    const parts = text.split(regex);

    return parts
      .map((part) => {
        if (/^```(?:mermaid|flowchart)/i.test(part.trim())) {
          return { type: "mermaid", content: part };
        }
        return { type: "markdown", html: renderMarkdownHtml(part) };
      })
      .filter((p) => (p.type === "mermaid" ? p.content.trim().length > 0 : p.html.trim().length > 0));
  }, [content]);

  if (!content) return null;

  return (
    <div className={`markdown-body ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === "mermaid") {
          return <MermaidDiagram key={idx} chart={seg.content} />;
        }
        return (
          <div
            key={idx}
            className="markdown-segment"
            dangerouslySetInnerHTML={{ __html: seg.html }}
          />
        );
      })}
    </div>
  );
}

export default MarkdownRenderer;
