/**
 * DevSphere Smart GitHub README.md Parser & Extractor
 * Automatically extracts structured project metadata from ANY GitHub README:
 * - Project Title & Tagline / One-liner
 * - Problem Statement (Friction & Motivation)
 * - Proposed Solution & Architecture Overview
 * - Key Features & Capabilities (normalized bullets)
 * - Quickstart CLI Command (git clone, cd, run scripts)
 * - Deep Dive Technical Documentation (Architecture, ML Engine, Tech Stack, APIs)
 * - Technologies Catalog & Smart Category Inference
 */

export function parseReadmeToProject(markdown, fallbackGithubUrl = "") {
  if (!markdown || typeof markdown !== "string") {
    return null;
  }

  const text = markdown.trim();
  const result = {
    title: "",
    tagline: "",
    category: "Web Development",
    technologies: "",
    githubUrl: fallbackGithubUrl || "",
    liveDemoUrl: "",
    problemStatement: "",
    proposedSolution: "",
    keyFeatures: "",
    quickstartCmd: "",
    description: "",
  };

  // 1. Extract Title: First top-level heading (# Title)
  const titleMatch = text.match(/^#\s+([^\n\r]+)/m);
  if (titleMatch) {
    let cleanTitle = titleMatch[1].trim();
    // Strip image badges like [![...](...)](...)
    cleanTitle = cleanTitle.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "");
    // Strip markdown links like [...](...)
    cleanTitle = cleanTitle.replace(/\[.*?\]\(.*?\)/g, "");
    // Strip leading emojis, symbols, variation selectors, zero-width joiners
    cleanTitle = cleanTitle.replace(/^[\s\p{Emoji}\p{Symbol}\p{Punctuation}\uFE00-\uFE0F\u200D]+/gu, "").trim();
    // Strip trailing emojis and punctuation
    cleanTitle = cleanTitle.replace(/[\s\p{Emoji}\p{Symbol}\p{Punctuation}\uFE00-\uFE0F\u200D]+$/gu, "").trim();
    cleanTitle = cleanTitle.replace(/\s+/g, " ");
    if (cleanTitle) {
      result.title = cleanTitle;
    }
  }

  // 2. Extract Tagline / One-liner:
  // Look for blockquote `> Tagline` under title
  const quoteMatch = text.match(/^\s*>\s*([^\n\r]+)/m);
  if (quoteMatch) {
    let cleanQuote = quoteMatch[1].trim();
    // Strip markdown bold, italics, links, backticks cleanly
    cleanQuote = cleanQuote
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^["'`\s]+|["'`\s]+$/g, "")
      .trim();
    if (cleanQuote.length > 10) {
      result.tagline = cleanQuote;
    }
  }

  // Fallback tagline to first descriptive paragraph if no blockquote
  if (!result.tagline) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("#") && !p.startsWith("[![") && !p.startsWith("<") && !p.startsWith("---"));
    if (paragraphs.length > 0) {
      let firstPara = paragraphs[0]
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\n/g, " ")
        .trim();
      if (firstPara.length > 15) {
        result.tagline = firstPara.slice(0, 240);
      }
    }
  }

  // 3. Extract GitHub Repository URL
  if (!result.githubUrl) {
    const gitMatch = text.match(/https?:\/\/github\.com\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/i);
    if (gitMatch) {
      result.githubUrl = `https://github.com/${gitMatch[1].replace(/\.git$/, "").replace(/[\.,\)]+$/, "")}`;
    }
  }

  // If title was missing, attempt from GitHub URL repository name
  if (!result.title && result.githubUrl) {
    const parts = result.githubUrl.split("/");
    const repoName = parts[parts.length - 1];
    if (repoName) {
      result.title = repoName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // 4. Extract Live Demo URL
  const demoMatch = text.match(/https?:\/\/[a-zA-Z0-9.-]+\.(vercel\.app|netlify\.app|onrender\.com|github\.io|pages\.dev|railway\.app|fly\.dev)[^\s\)\"\']*/i);
  if (demoMatch) {
    result.liveDemoUrl = demoMatch[0].trim().replace(/[\.,\)]+$/, "");
  }

  // 5. Universal Section Extractor:
  // Supports ANY emojis (e.g. 🌟, ✨, 🚀, 🏗️), numbers, symbols, and punctuation in headings.
  // Note: Uses $ instead of \Z so it never gets corrupted by 'i' flag matching letter 'z'.
  const extractSection = (keywords) => {
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        `(?:^|\\n)#{1,4}\\s*[^\\w\\n]*\\s*${escaped}[^\\n]*\\n+([\\s\\S]+?)(?=(?:\\n#{1,3}\\s|$))`,
        "i"
      );
      const match = text.match(regex);
      if (match && match[1]) {
        let content = match[1].trim();
        // Remove trailing divider lines '---'
        content = content.replace(/\s*---\s*$/, "").trim();
        if (content.length > 15 && !content.startsWith("[![")) {
          return content;
        }
      }
    }
    return "";
  };

  // 6. Key Features Extraction
  const featuresRaw = extractSection([
    "Key Features",
    "Features",
    "Core Features",
    "Capabilities",
    "Highlights",
    "Main Features",
    "What it does",
  ]);

  if (featuresRaw) {
    const lines = featuresRaw.split("\n");
    const bullets = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[-*•]\s+/.test(trimmed)) {
        // Normalize bullet format to '• '
        const cleanedBullet = trimmed.replace(/^[-*•]\s+/, "• ");
        bullets.push(cleanedBullet);
      }
    }
    if (bullets.length > 0) {
      result.keyFeatures = bullets.slice(0, 10).join("\n");
    } else {
      result.keyFeatures = featuresRaw.slice(0, 600);
    }
  }

  // 7. Overview extraction (serves as rich base for Problem & Solution when dedicated sections are absent)
  const overviewRaw = extractSection([
    "Overview",
    "About the Project",
    "About",
    "Introduction",
    "Background",
    "Project Description",
  ]);

  // 8. Problem Statement Extraction
  let problemRaw = extractSection([
    "Problem Statement",
    "The Problem",
    "Problem",
    "Motivation",
    "The Challenge",
    "Challenge",
    "Why DevSphere",
    "Why this Project",
    "Why",
  ]);

  if (!problemRaw && overviewRaw) {
    const overviewParas = overviewRaw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("#") && !p.startsWith("---") && !p.startsWith("<"));

    if (overviewParas.length >= 1) {
      // First paragraph of Overview describes the real-world friction, hazard, or motivation
      problemRaw = overviewParas[0];
    }
  }

  result.problemStatement = problemRaw || "";

  // 9. Proposed Solution Extraction
  let solutionRaw = extractSection([
    "Solution",
    "Proposed Solution",
    "The Solution",
    "Solution Architecture",
    "Approach",
    "How It Works",
    "What is GLOF Sentinel",
    "What is",
  ]);

  if (!solutionRaw && overviewRaw) {
    const overviewParas = overviewRaw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("#") && !p.startsWith("---") && !p.startsWith("<"));

    // Look for paragraph describing how software addresses or solves it
    const solutionPara = overviewParas.find((p, idx) =>
      idx > 0 || /(addresses|solves|fusing|engineered|features|combines|delivers|provides|transforms)/i.test(p)
    );

    if (solutionPara && solutionPara !== problemRaw) {
      solutionRaw = solutionPara;
    } else if (overviewParas.length > 1) {
      solutionRaw = overviewParas.slice(1).join("\n\n");
    }
  }

  result.proposedSolution = solutionRaw || "";

  // 10. Quickstart CLI Command Extraction
  // Prefer clone and run commands from bash/sh/cmd code blocks
  const codeBlockMatches = text.match(/```(?:bash|sh|shell|cmd|zsh)?\s*([\s\S]+?)```/gi);
  if (codeBlockMatches) {
    // Priority 1: Git clone command block
    for (const block of codeBlockMatches) {
      const clean = block.replace(/```(?:bash|sh|shell|cmd|zsh)?/i, "").replace(/```/, "").trim();
      if (/git clone/i.test(clean)) {
        const cmdLines = clean
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#") && !l.startsWith("$"));
        if (cmdLines.length > 0) {
          result.quickstartCmd = cmdLines.join(" && ").slice(0, 255);
          break;
        }
      }
    }

    // Priority 2: npm, yarn, docker, pip, uvicorn run command
    if (!result.quickstartCmd) {
      for (const block of codeBlockMatches) {
        const clean = block.replace(/```(?:bash|sh|shell|cmd|zsh)?/i, "").replace(/```/, "").trim();
        if (/(npm|yarn|pnpm|pip install|docker|uvicorn|python)/i.test(clean)) {
          const cmdLines = clean
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && !l.startsWith("#") && !l.startsWith("$"));
          if (cmdLines.length > 0) {
            result.quickstartCmd = cmdLines.join(" && ").slice(0, 255);
            break;
          }
        }
      }
    }
  }

  // Fallback clone command if GitHub URL is present
  if (!result.quickstartCmd && result.githubUrl) {
    const repoSlug = result.githubUrl.split("/").pop();
    result.quickstartCmd = `git clone ${result.githubUrl}.git && cd ${repoSlug}`;
  }

  // 11. Architecture Summary & Deep Dive Technical Notes
  const architectureRaw = extractSection([
    "System Architecture",
    "Architecture",
    "Technical Architecture",
    "Architecture & Decisions",
  ]);

  const mlEngineRaw = extractSection([
    "Machine Learning Engine",
    "Machine Learning",
    "ML Engine",
    "Model Architecture",
  ]);

  const techStackRaw = extractSection([
    "Tech Stack",
    "Technologies Used",
    "Stack",
  ]);

  const apiDocsRaw = extractSection([
    "API Documentation",
    "API Endpoints",
    "Endpoints",
  ]);

  const deepDiveParts = [];
  if (architectureRaw) {
    deepDiveParts.push(`### System Architecture\n\n${architectureRaw}`);
  }
  if (mlEngineRaw) {
    deepDiveParts.push(`### Machine Learning Engine\n\n${mlEngineRaw}`);
  }
  if (techStackRaw) {
    deepDiveParts.push(`### Tech Stack Breakdown\n\n${techStackRaw}`);
  }
  if (apiDocsRaw) {
    deepDiveParts.push(`### API Documentation\n\n${apiDocsRaw}`);
  }

  if (deepDiveParts.length > 0) {
    result.description = deepDiveParts.join("\n\n---\n\n");
  } else {
    result.description =
      result.proposedSolution ||
      result.problemStatement ||
      result.tagline ||
      result.title;
  }

  // 12. Broad Technology Recognition from Badges, Markdown Tables, and Text
  const knownTechCatalog = [
    "FastAPI", "Python", "MongoDB", "Motor", "Scikit-Learn", "Pandas", "NumPy",
    "APScheduler", "Leaflet.js", "Chart.js", "Render", "Vercel", "Docker", "Docker-Compose",
    "React", "Vue", "Angular", "Next.js", "Vite", "TypeScript", "JavaScript",
    "Spring Boot", "Java", "Flask", "Django", "Node.js", "Express",
    "PostgreSQL", "Supabase", "MySQL", "Redis", "Kubernetes",
    "Tailwind CSS", "Bootstrap", "PyTorch", "TensorFlow", "GraphQL",
    "WebSockets", "AWS", "Google Cloud", "Llama", "Gemini", "Groq", "pgvector",
    "HTML5", "CSS3", "C++", "Rust", "Go", "Open-Meteo"
  ];

  const foundTechs = new Set();
  const textLower = text.toLowerCase();

  for (const tech of knownTechCatalog) {
    const escaped = tech.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:\\b|_|/)${escaped}(?:\\b|_|/|-)`, "i");
    if (regex.test(textLower)) {
      foundTechs.add(tech);
    }
  }

  // Check shield badges: badge/FastAPI-0.104.1
  const badgeMatches = text.match(/badge\/([a-zA-Z0-9_%+-]+)-/g);
  if (badgeMatches) {
    for (const b of badgeMatches) {
      const rawName = decodeURIComponent(b.replace(/^badge\//, "").replace(/-$/, "").replace(/_/g, " "));
      for (const tech of knownTechCatalog) {
        if (tech.toLowerCase() === rawName.toLowerCase()) {
          foundTechs.add(tech);
        }
      }
    }
  }

  if (foundTechs.size > 0) {
    result.technologies = Array.from(foundTechs).slice(0, 10).join(", ");
  }

  // 13. Smart Category Inference
  if (/(ai|machine learning|deep learning|neural|random forest|scikit-learn|pandas|hazard|flood|prediction|model|llm|rag|nlp|computer vision|pytorch|tensorflow|gemini|llama|groq|vector|embeddings)/i.test(textLower)) {
    result.category = "AI/ML";
  } else if (/(docker|kubernetes|k8s|ci\/cd|pipeline|github actions|terraform|ansible|prometheus|grafana|helm)/i.test(textLower)) {
    result.category = "DevOps";
  } else if (/(android|ios|flutter|react native|swift|kotlin|mobile app)/i.test(textLower)) {
    result.category = "Mobile";
  } else if (/(ui|ux|design system|figma|canvas|tailwind|art|animation|creative|svg|glassmorphism)/i.test(textLower)) {
    result.category = "UI/UX";
  } else if (/(cli|command-line|compiler|linter|parser|tool|utility|scraper|generator|benchmark)/i.test(textLower)) {
    result.category = "Tools";
  } else {
    result.category = "Web Development";
  }

  return result;
}
