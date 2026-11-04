/**
 * Smart GitHub README.md Parser for DevSphere
 * Automatically extracts structured project metadata:
 * - Title, Tagline, Category, Technologies
 * - Problem Statement, Proposed Solution, Key Features
 * - Quickstart Command, GitHub URL, Live Demo URL, Architecture Summary
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
    // Strip leading/trailing special symbols and emojis
    cleanTitle = cleanTitle.replace(/^[^\w\s]+|[^\w\s]+$/g, "").trim();
    // Normalize spaces
    cleanTitle = cleanTitle.replace(/\s+/g, " ");
    if (cleanTitle) {
      result.title = cleanTitle;
    }
  }

  // 2. Extract Tagline / One-liner:
  // Look for blockquote `> "Tagline"` or `> Tagline` under the title
  const quoteMatch = text.match(/^\s*>\s*([^\n\r]+)/m);
  if (quoteMatch) {
    let cleanQuote = quoteMatch[1].trim();
    cleanQuote = cleanQuote.replace(/^["'*_`]+|["'*_`]+$/g, "").trim();
    if (cleanQuote.length > 10) {
      result.tagline = cleanQuote;
    }
  }

  // If no quote block, use the first non-heading, non-badge paragraph
  if (!result.tagline) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("#") && !p.startsWith("[![") && !p.startsWith("<"));
    if (paragraphs.length > 0) {
      const firstPara = paragraphs[0].replace(/\n/g, " ").trim();
      if (firstPara.length > 15) {
        result.tagline = firstPara.slice(0, 240);
      }
    }
  }

  // 3. Extract Live Demo URL
  const demoMatch = text.match(/https?:\/\/[a-zA-Z0-9-]+\.(vercel\.app|netlify\.app|onrender\.com|github\.io|pages\.dev|railway\.app)[^\s\)\"\']*/i);
  if (demoMatch) {
    result.liveDemoUrl = demoMatch[0].trim().replace(/[\.,\)]+$/, "");
  }

  // 4. Extract GitHub URL
  if (!result.githubUrl) {
    const gitMatch = text.match(/https?:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/i);
    if (gitMatch) {
      result.githubUrl = gitMatch[0].trim().replace(/\.git$/, "").replace(/[\.,\)]+$/, "");
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

  // 5. Helper to extract section content by heading keywords
  const extractSection = (headers) => {
    for (const h of headers) {
      const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|\\n)#{1,3}\\s*${escaped}[^\\n]*\\n+([\\s\\S]+?)(?=\\n#{1,3}\\s|\\Z)`, "i");
      const match = text.match(regex);
      if (match && match[1]) {
        const content = match[1].trim();
        // Ignore sections that are just image badges or empty
        if (content.length > 15 && !content.startsWith("[![")) {
          return content;
        }
      }
    }
    return "";
  };

  // 6. Problem Statement Extraction
  result.problemStatement = extractSection([
    "Problem Statement",
    "The Problem",
    "Problem",
    "Motivation",
    "Background",
    "Why DevSphere",
    "Why",
  ]);

  // 7. Proposed Solution / Overview Extraction
  result.proposedSolution = extractSection([
    "Solution",
    "Proposed Solution",
    "The Solution",
    "Solution Architecture",
    "What is",
    "About the Project",
    "Overview",
    "About",
  ]);

  // 8. Key Features Extraction
  const featuresRaw = extractSection([
    "Key Features",
    "Features",
    "Core Features",
    "Capabilities",
    "Highlights",
    "Main Features",
  ]);

  if (featuresRaw) {
    // Extract bullet points from the section
    const lines = featuresRaw.split("\n");
    const bullets = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[-*•]\s+/.test(trimmed)) {
        bullets.push(trimmed.replace(/^[-*•]\s+/, "- "));
      }
    }
    if (bullets.length > 0) {
      result.keyFeatures = bullets.slice(0, 8).join("\n");
    } else {
      result.keyFeatures = featuresRaw.slice(0, 500);
    }
  }

  // 9. Quickstart / Run Command Extraction
  // Look for code blocks with bash/sh/shell or git/npm/docker commands
  const codeBlockMatches = text.match(/```(?:bash|sh|shell|zsh)?\s*([\s\S]+?)```/gi);
  if (codeBlockMatches) {
    for (const block of codeBlockMatches) {
      const clean = block.replace(/```(?:bash|sh|shell|zsh)?/i, "").replace(/```/, "").trim();
      if (/(git clone|npm install|yarn|pnpm|pip install|docker|docker-compose|mvn|gradle|uvicorn|cargo run)/i.test(clean)) {
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

  // If no code block, check for single-line clone commands
  if (!result.quickstartCmd && result.githubUrl) {
    result.quickstartCmd = `git clone ${result.githubUrl}.git && cd ${result.githubUrl.split("/").pop()} && npm install && npm run dev`;
  }

  // 10. Architecture Summary / Technical Description
  const archContent = extractSection([
    "Architecture",
    "System Architecture",
    "Architecture & Design",
    "Technical Architecture",
    "How It Works",
    "Tech Stack",
  ]);
  result.description = archContent || result.proposedSolution || result.tagline || result.title;

  // 11. Known Technologies Recognition (50+ tech stacks)
  const knownTechCatalog = [
    "React", "Vue", "Angular", "Next.js", "Vite", "Svelte", "TypeScript", "JavaScript",
    "Spring Boot", "Java", "FastAPI", "Python", "Flask", "Django", "Node.js", "Express",
    "PostgreSQL", "Supabase", "MongoDB", "MySQL", "Redis", "Docker", "Kubernetes",
    "Tailwind CSS", "Bootstrap", "PyTorch", "TensorFlow", "scikit-learn", "GraphQL",
    "WebSockets", "AWS", "Google Cloud", "Llama", "Gemini", "Groq", "pgvector", "Hibernate",
    "Redux", "Kafka", "RabbitMQ", "HTML5", "CSS3", "C++", "Rust", "Go", "Flutter"
  ];

  const foundTechs = [];
  const textLower = text.toLowerCase();
  for (const tech of knownTechCatalog) {
    const escaped = tech.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(textLower)) {
      foundTechs.push(tech);
    }
  }

  if (foundTechs.length > 0) {
    result.technologies = foundTechs.slice(0, 8).join(", ");
  }

  // 12. Smart Category Inference
  if (/(ai|machine learning|deep learning|neural|llm|rag|nlp|computer vision|pytorch|tensorflow|scikit-learn|gemini|llama|groq|vector|embeddings)/i.test(textLower)) {
    result.category = "AI/ML";
  } else if (/(docker|kubernetes|k8s|ci\/cd|pipeline|github actions|terraform|ansible|prometheus|grafana|helm)/i.test(textLower)) {
    result.category = "DevOps";
  } else if (/(android|ios|flutter|react native|swift|kotlin|mobile app)/i.test(textLower)) {
    result.category = "Mobile";
  } else if (/(ui|ux|design system|figma|canvas|tailwind|art|animation|creative|svg)/i.test(textLower)) {
    result.category = "UI/UX";
  } else if (/(cli|command-line|compiler|linter|parser|tool|utility|scraper|generator|benchmark)/i.test(textLower)) {
    result.category = "Tools";
  } else {
    result.category = "Web Development";
  }

  return result;
}
