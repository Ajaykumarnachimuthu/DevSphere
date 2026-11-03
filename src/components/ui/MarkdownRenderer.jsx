import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    heading({ tokens, depth, raw }) {
      const text = this.parser.parseInline(tokens);
      const id = raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
  },
});

function preprocessContent(content) {
  if (!content) return "";
  let text = String(content);

  // 1. Convert display math blocks: $$ ... $$
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const cleanMath = math.trim();
    return `\n\n<div class="math-display-card"><span class="math-icon">📐</span><span class="math-formula">${cleanMath}</span></div>\n\n`;
  });

  // 2. Convert inline math: $ ... $ (without escaping currency like $100)
  text = text.replace(/(^|[^\$])\$([A-Za-z0-9_\\{}^+*=() -]+?)\$(?!\$)/g, (_, prefix, math) => {
    return `${prefix}<span class="math-inline-tag">${math.trim()}</span>`;
  });

  // 3. Convert inline bullets glued into a single line into proper markdown lists
  text = text.replace(/([^\n])\s+-\s+([A-Z0-9$*`])/g, "$1\n\n- $2");

  // 4. Clean trailing horizontal dividers
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
        ADD_ATTR: ["target", "rel", "class", "id"],
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
