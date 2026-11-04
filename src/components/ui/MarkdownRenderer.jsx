import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";

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

  // 1. Remove empty code fences that create tall black rectangular blocks
  text = text.replace(/```[a-zA-Z0-9_-]*\s*```/g, "");

  // 2. Format single-line code blocks like ```text [1. ...] into multi-line blocks
  text = text.replace(/([^\n])(```[a-zA-Z0-9_-]*\b)/g, "$1\n\n$2\n");
  text = text.replace(/(```[a-zA-Z0-9_-]*)\s*([^\n`])/g, "$1\n$2");

  // 3. Render display math blocks ($$ ... $$) via KaTeX
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

  // 4. Render inline math ($ ... $) via KaTeX (skip pure prices like $100)
  text = text.replace(/(^|[^\$])\$([a-zA-Z0-9_\\{}^+*=()\/:, -]+?)\$(?!\$)/g, (match, prefix, math) => {
    const trimmed = math.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return match; // Keep literal currency
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

  // 5. Convert inline bullet points glued into a single line into clean markdown lists
  text = text.replace(/([^\n])\s+-\s+([A-Za-z0-9$*`•])/g, "$1\n\n- $2");

  // 6. Clean trailing horizontal rule dividers
  text = text.replace(/\s*---\s*$/, "");

  return text;
}

export function MarkdownRenderer({ content, className = "" }) {
  const renderedHtml = useMemo(() => {
    if (!content) return "";
    try {
      const preprocessed = preprocessContent(content);
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
      return String(content);
    }
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
