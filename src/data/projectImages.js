// Dynamic SVG generator for DevSphere projects rendering verified project details
export function getProjectThumbnail(project) {
  if (project?.coverImage) return project.coverImage;

  const title = (project?.title || "DevSphere Project").trim();
  const category = (project?.category || "Web Development").trim();
  const tech = Array.isArray(project?.technologies)
    ? project.technologies.slice(0, 3).join(" • ")
    : (project?.technologies || "Production Architecture");

  const catLower = category.toLowerCase();
  let gradStart = "%236366F1";
  let gradEnd = "%234F46E5";
  let badgeColor = "%23818CF8";
  let badgeBg = "%23312E81";

  if (catLower.includes("ai") || catLower.includes("ml")) {
    gradStart = "%238B5CF6";
    gradEnd = "%236D28D9";
    badgeColor = "%23C084FC";
    badgeBg = "%234C1D95";
  } else if (catLower.includes("web")) {
    gradStart = "%232563EB";
    gradEnd = "%231D4ED8";
    badgeColor = "%2360A5FA";
    badgeBg = "%231E3A8A";
  } else if (catLower.includes("devops") || catLower.includes("cloud")) {
    gradStart = "%23D97706";
    gradEnd = "%23B45309";
    badgeColor = "%23FBBF24";
    badgeBg = "%2378350F";
  } else if (catLower.includes("tool") || catLower.includes("data")) {
    gradStart = "%23059669";
    gradEnd = "%23047857";
    badgeColor = "%2334D399";
    badgeBg = "%23064E3B";
  }

  const escapeXml = (str) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const cleanTitle = escapeXml(title.length > 34 ? title.slice(0, 32) + "…" : title);
  const cleanCat = escapeXml(category.toUpperCase());
  const cleanTech = escapeXml(tech.length > 45 ? tech.slice(0, 43) + "…" : tech);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340" fill="none">
    <rect width="600" height="340" fill="%230B0F19"/>
    <defs>
      <linearGradient id="glow" x1="0" y1="0" x2="600" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${gradStart}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${gradEnd}" stop-opacity="0.05"/>
      </linearGradient>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%231E293B" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="%230F172A" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="600" height="340" fill="url(%23glow)"/>
    <g opacity="0.10">
      <line x1="0" y1="68" x2="600" y2="68" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="0" y1="136" x2="600" y2="136" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="0" y1="204" x2="600" y2="204" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="0" y1="272" x2="600" y2="272" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="120" y1="0" x2="120" y2="340" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="240" y1="0" x2="240" y2="340" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="360" y1="0" x2="360" y2="340" stroke="%2394A3B8" stroke-width="1"/>
      <line x1="480" y1="0" x2="480" y2="340" stroke="%2394A3B8" stroke-width="1"/>
    </g>
    <rect x="36" y="36" width="528" height="268" rx="14" fill="url(%23cardGrad)" stroke="%23334155" stroke-width="1.2"/>
    <rect x="64" y="64" width="130" height="26" rx="6" fill="${badgeBg}"/>
    <text x="74" y="81" fill="${badgeColor}" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="700" letter-spacing="0.5">${cleanCat}</text>
    <text x="64" y="142" fill="%23F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="21" font-weight="800">${cleanTitle}</text>
    <text x="64" y="174" fill="%2394A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="500">${cleanTech}</text>
    <circle cx="500" cy="78" r="18" fill="%231E293B" stroke="%23334155" stroke-width="1"/>
    <path d="M496 72 L 506 78 L 496 84 Z" fill="${badgeColor}"/>
    <line x1="64" y1="216" x2="536" y2="216" stroke="%231E293B" stroke-width="1"/>
    <circle cx="72" cy="250" r="5" fill="%2310B981"/>
    <text x="86" y="254" fill="%23CBD5E1" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600">DevSphere Verified Project</text>
  </svg>`;
}
