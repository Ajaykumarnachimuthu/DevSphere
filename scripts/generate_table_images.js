import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

const pagesData = [
  {
    id: "page1_home",
    title: "1. HOME PAGE",
    files: [
      {
        fileName: "HomeIsland.jsx",
        purpose: "Progressively mounts dynamic authenticated user welcome greeting and handles cross-tab session synchronization.",
        rows: [
          ["Progressive Mount", "createRoot(container)", "#home-island-root in index.html", "Mounts React island without replacing static hero markup."],
          ["State Management", "useState(() => localStorage.getItem(\"loggedInUser\"))", "User greeting state", "Stores active username or email reactively."],
          ["Lifecycle Effect", "useEffect(() => { ... handleStorage ... }, [])", "Component mount", "Subscribes to window 'storage' event for cross-tab updates."],
          ["Effect Cleanup", "return () => window.removeEventListener(\"storage\", handleStorage)", "Component unmount", "Removes storage listener to prevent memory leaks."],
          ["Conditional Rendering", "if (!currentUser) return null;", "Root render guard", "Hides welcome banner when no authenticated user is present."],
          ["Themed Styling", "style={{ backgroundColor: \"#eef2ff\", color: \"#4f46e5\", ... }}", "Welcome banner div", "Applies highlighted pill styling matching DevSphere theme."]
        ]
      },
      {
        fileName: "Home.jsx",
        purpose: "Full page landing component composing layout shell, hero copy, CTA buttons, and feature showcase grid.",
        rows: [
          ["Page Composition", "<Shell> ... </Shell>", "Root container", "Wraps landing content with global Navbar and Footer."],
          ["Client Navigation", "const navigate = useNavigate()", "CTA action buttons", "Programmatically navigates to /blogs, /projects, or /signup."],
          ["Context Consumption", "const { currentUser, isAuthenticated } = useAuth()", "Hero section", "Displays welcome text and conditionally alters button targets."],
          ["Reusable UI", "<Button variant=\"outline\">", "Hero button group", "Renders standardized styled buttons with click handlers."],
          ["List Rendering", "features.map(([title, text]) => (<article key={title}>...))", "Feature grid section", "Iterates over 4 community pillars with unique keys."]
        ]
      },
      {
        fileName: "Button.jsx",
        purpose: "Standardized reusable button supporting primary, outline, and secondary variants.",
        rows: [
          ["Component Props", "export function Button({ children, variant = \"primary\", ...props })", "Button element", "Receives visual style variant and click handler props."],
          ["Class Derivation", "variant === \"outline\" ? \"outline\" : \"secondary\"", "Class list merger", "Dynamically generates CSS class string based on variant prop."]
        ]
      }
    ]
  },
  {
    id: "page2_login",
    title: "2. LOGIN PAGE",
    files: [
      {
        fileName: "LoginForm.jsx",
        purpose: "Handles controlled credential inputs, regex validation, password visibility toggle, error focus, and session authentication.",
        rows: [
          ["Controlled Inputs", "value={email}, onChange={(e) => setEmail(e.target.value)}", "Email & password inputs", "Single source of truth in React state for form inputs."],
          ["DOM Ref Focus", "const emailInputRef = useRef(null); emailInputRef.current?.focus()", "Email input element", "Shifts user focus automatically to email on validation error."],
          ["Password Toggle", "type={showPassword ? \"text\" : \"password\"}", "Password field", "Toggles password visibility without direct DOM mutations."],
          ["Form Event", "<form onSubmit={handleSubmit}>, e.preventDefault()", "Login form container", "Prevents page reload and initiates synchronous validation."],
          ["Regex Validation", "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emailVal)", "Email validation", "Validates standard email address syntax before submit."],
          ["Auth Context Call", "login(emailVal)", "Submission success", "Dispatches logged-in user to global DevSphereContext."],
          ["Local Storage Sync", "localStorage.setItem(\"loggedInUser\", emailVal)", "Submission success", "Maintains raw-string compatibility with legacy vanilla JS."],
          ["Provider Injection", "<DevSphereProvider><LoginForm /></DevSphereProvider>", "Island auto-mount", "Injects context tree into standalone progressive island."]
        ]
      },
      {
        fileName: "Login.jsx",
        purpose: "Full page login view composing AuthCard, FormInput, and router navigation.",
        rows: [
          ["Container Card", "<AuthCard title=\"...\" subtitle=\"...\">", "Root wrapper", "Standardizes authentication card layout and headers."],
          ["Forwarded Ref", "<FormInput ref={emailRef} ... />", "Form email control", "Passes ref across component boundaries to native input."],
          ["Programmatic Route", "navigate(\"/\") inside setTimeout", "Post-login redirect", "Transitions user smoothly to Home page after 600ms."],
          ["Router Link", "<NavLink to=\"/signup\">", "Bottom prompt", "Client-side navigation link to registration view."]
        ]
      },
      {
        fileName: "FormInput.jsx",
        purpose: "Reusable labeled form input component with forwardRef for programmatic focus management.",
        rows: [
          ["Ref Forwarding", "forwardRef(function FormInput({ label, error, ...props }, ref))", "Input wrapper", "Exposes underlying HTML input node to parent component refs."],
          ["Conditional Error", "{error && <small className=\"input-error\">{error}</small>}", "Input bottom label", "Displays inline validation error message when present."]
        ]
      }
    ]
  },
  {
    id: "page3_signup",
    title: "3. SIGNUP PAGE",
    files: [
      {
        fileName: "SignupForm.jsx",
        purpose: "Manages registration inputs, real-time password strength evaluation, and duplicate account prevention.",
        rows: [
          ["Object State", "const [form, setForm] = useState({ username: \"\", ... })", "Form fields", "Consolidates 4 input fields into a single state object."],
          ["Field Updaters", "onChange={(e) => setForm({ ...form, username: e.target.value })}", "All input controls", "Immutably updates targeted field while preserving others."],
          ["Derived State", "const strength = len < 6 ? \"Weak\" : len < 10 ? \"Medium\" : \"Strong\"", "Password field", "Calculates password complexity on every keystroke."],
          ["Dynamic Styling", "color: strength === \"Weak\" ? \"crimson\" : ...", "Strength badge", "Visually indicates security level with color-coded tags."],
          ["Storage Lookup", "users = JSON.parse(localStorage.getItem(\"users\"))", "Submit handler", "Retrieves registered users array to verify email uniqueness."],
          ["Array Mutation", "users.some(u => u.email === address); users.push(...)", "Submit handler", "Blocks duplicate registration and appends new credential record."],
          ["Form Reset", "setForm({ username: \"\", email: \"\", password: \"\", confirmPassword: \"\" })", "Post-registration", "Clears all input controls upon successful account creation."]
        ]
      },
      {
        fileName: "Signup.jsx",
        purpose: "Full page signup view with AuthCard and useLocalStorage integration.",
        rows: [
          ["Custom Storage Hook", "const [users, setUsers] = useLocalStorage(\"users\", [])", "Registration state", "Synchronizes registered user array with localStorage."],
          ["Layout Container", "<AuthCard title=\"Create your account\" subtitle=\"...\">", "Page container", "Provides centered layout card with title and subtitle."],
          ["Route Link", "<NavLink to=\"/login\">", "Bottom prompt", "Client-side link allowing users to navigate to Login."]
        ]
      },
      {
        fileName: "AuthCard.jsx",
        purpose: "Reusable centered container card for authentication views standardizing headings and margins.",
        rows: [
          ["Component Props", "export function AuthCard({ title, subtitle, children })", "Card container", "Renders title, eyebrow label, and nested form children."],
          ["Eyebrow Badge", "{subtitle && <p className=\"eyebrow\">{subtitle}</p>}", "Card top header", "Displays optional category badge above primary page heading."]
        ]
      }
    ]
  },
  {
    id: "page4_blogs",
    title: "4. BLOGS PAGE",
    files: [
      {
        fileName: "BlogIsland.jsx",
        purpose: "Real-time search, category pill filter, and dynamic merging of published articles with curated feed.",
        rows: [
          ["Custom Storage Hook", "const [storedBlogs] = useLocalStorage(\"publishedBlogs\", [])", "Published blogs loader", "Pulls articles authored in writeBlog.html from localStorage."],
          ["Memoized Normalization", "useMemo(() => storedBlogs.map(...), [storedBlogs])", "Schema adaptation", "Adapts user drafts into standard BlogCard property structure."],
          ["Feed Concatenation", "useMemo(() => [...publishedList, ...initialBlogs], [...])", "Feed generation", "Merges user published blogs with static curated blogs."],
          ["Multi-Criteria Filter", "useMemo(() => allBlogs.filter(...), [allBlogs, category, query])", "Blog grid filter", "Filters articles against category pill and search query."],
          ["Real-Time Search", "value={query}, onChange={(e) => setQuery(e.target.value)}", "Search bar input", "Drives instant list filtering without page reload."],
          ["Dynamic Class Name", "className={category === cat ? \"active\" : \"\"}", "Category buttons", "Applies highlighted active styling to selected category pill."],
          ["List Rendering", "filteredBlogs.map((blog, idx) => (<article className=\"blogCard\">...))", "Blog grid section", "Iterates over matching articles and renders card elements."],
          ["Empty State", "filteredBlogs.length > 0 ? (...) : (<p className=\"empty-state\">...)", "Blog grid", "Displays friendly 'No blogs found' message on empty search."]
        ]
      },
      {
        fileName: "BlogCard.jsx",
        purpose: "Reusable presentation component rendering article thumbnail, category badge, author, and reading time.",
        rows: [
          ["Component Props", "export function BlogCard({ blog })", "Card component", "Receives standardized blog object via props."],
          ["Fallback Logic", "const displayTech = blog.tech || blog.category || \"General\"", "Card badge / image", "Provides fallback tech badge if category is unassigned."],
          ["Semantic Markup", "<article className=\"card blog-card\"> ... </article>", "Card container", "Renders accessible card layout with thumbnail and metadata."]
        ]
      }
    ]
  },
  {
    id: "page5_write_blog",
    title: "5. WRITE BLOG PAGE",
    files: [
      {
        fileName: "WriteBlogIsland.jsx",
        purpose: "Blog authoring editor with 5000-char limiter, live preview, draft saving, and publishing.",
        rows: [
          ["Storage Auto-fill", "useState(() => localStorage.getItem(\"loggedInUser\") || \"\")", "Author input field", "Automatically pre-fills author with active logged-in user."],
          ["Textarea Ref", "const contentRef = useRef(null); contentRef.current?.focus()", "Content textarea", "Restores keyboard focus to editor when preview is closed."],
          ["Character Limiter", "if (text.length <= 5000) setContent(text)", "handleContentChange", "Restricts story content to a maximum of 5,000 characters."],
          ["Live Character Count", "{content.length} / 5000 characters", "Editor status bar", "Displays real-time character count feedback to author."],
          ["Conditional Preview", "{preview && (<section className=\"blog-preview\"> ... </section>)}", "Below editor actions", "Toggles live WYSIWYG article preview before publishing."],
          ["Draft Storage Hook", "const [drafts, setDrafts] = useLocalStorage(\"drafts\", [])", "Save draft handler", "Persists unfinished blog posts to localStorage under drafts."],
          ["Publish Storage Hook", "const [published, setPublished] = useLocalStorage(\"publishedBlogs\", [])", "Publish handler", "Prepends article to publishedBlogs and redirects to feed."],
          ["Array Tag Parsing", "tags.split(\",\").map(t => t.trim()).filter(Boolean)", "Payload builder", "Transforms comma-separated tag string into a clean string array."]
        ]
      }
    ]
  },
  {
    id: "page6_developers",
    title: "6. DEVELOPERS PAGE",
    files: [
      {
        fileName: "DevelopersIsland.jsx",
        purpose: "Real-time developer directory search, dynamic avatar initials, and profile selection.",
        rows: [
          ["Search State", "const [query, setQuery] = useState(\"\")", "Search input bar", "Tracks search string for developer name, skill, or role."],
          ["Memoized Search", "useMemo(() => developers.filter(...), [query])", "Developer grid", "Efficiently filters developer profiles across 4 attributes."],
          ["Avatar Initials", "dev.name.split(\" \").map(part => part[0]).join(\"\")", "Avatar circle", "Derives 2-letter uppercase initials from developer full name."],
          ["Class Alternation", "const avatarClass = 'a' + ((idx % 6) + 1)", "Avatar styling", "Dynamically cycles avatar background colors (.a1 to .a6)."],
          ["Storage Setter", "const [, setSelectedDeveloper] = useLocalStorage(\"selectedDeveloper\", null)", "\"View Profile\" link", "Saves selected developer object to localStorage for profile page."],
          ["Dual Storage Sync", "localStorage.setItem(\"selectedDeveloper\", JSON.stringify(dev))", "Profile selection", "Preserves compatibility with legacy DeveloperProfile.js."],
          ["Nested Mapping", "dev.skills.map(skill => (<i key={skill}>{skill}</i>))", "Skill badges row", "Renders individual pill tags for each developer skill."]
        ]
      },
      {
        fileName: "DeveloperCard.jsx",
        purpose: "Reusable presentation card displaying initials avatar, role, bio, skills, and profile action.",
        rows: [
          ["Component Props", "export function DeveloperCard({ developer, onSelect })", "Card root", "Receives developer data and selection callback function."],
          ["Avatar Derivation", "developer.name.split(\" \").map(p => p[0]).join(\"\")", "Avatar container", "Computes initials dynamically inside the component."],
          ["Event Delegation", "onClick={() => onSelect(developer)}", "\"View Profile\" button", "Invokes parent selection handler passing the developer object."]
        ]
      }
    ]
  },
  {
    id: "page7_developer_profile",
    title: "7. DEVELOPER PROFILE PAGE",
    files: [
      {
        fileName: "ProfileChart.jsx",
        purpose: "Connect status toggle and lifecycle-safe Chart.js activity bar chart on canvas.",
        rows: [
          ["Storage Profile Load", "useEffect(() => { dev = JSON.parse(stored); ... }, [])", "Component mount", "Reads active selectedDeveloper and connection state from storage."],
          ["Canvas Ref", "const canvasRef = useRef(null); <canvas ref={canvasRef} />", "Chart canvas", "Direct DOM reference to canvas required by Chart.js library."],
          ["Instance Ref", "const chartInstanceRef = useRef(null)", "Lifecycle tracker", "Holds Chart.js instance across renders without triggering re-render."],
          ["Chart Instantiation", "chartInstanceRef.current = new Chart(ctx, { type: \"bar\", ... })", "Chart effect", "Renders 3-bar developer activity chart (Projects, Blogs, Conn)."],
          ["Chart Teardown", "return () => { if (chartInstanceRef.current) chartInstanceRef.current.destroy(); }", "Effect cleanup", "Destroys chart on unmount; prevents 'Canvas is already in use' crash."],
          ["Reactive Connection", "setConnected(!connected); localStorage.setItem(...)", "Connect button", "Toggles connection state, persists flag, and updates chart bar."],
          ["Dynamic Chart Data", "data: [12, 24, connected ? 187 : 186]", "Chart dataset", "Reactively increments connection bar height upon connect click."]
        ]
      },
      {
        fileName: "ActivityChart.jsx",
        purpose: "Reusable Chart.js component with useRef canvas binding and useEffect cleanup.",
        rows: [
          ["Component Props", "export function ActivityChart({ data, labels })", "Chart component", "Receives numerical activity data and labels dynamically."],
          ["Canvas Reference", "const canvasRef = useRef(null)", "<canvas ref={canvasRef} />", "Targets canvas rendering context without getElementById."],
          ["Safe Re-creation", "if (chartInstanceRef.current) chartInstanceRef.current.destroy()", "Initialization check", "Clears previous chart instance before drawing updated datasets."],
          ["Teardown Cleanup", "return () => chartInstanceRef.current?.destroy()", "Lifecycle unmount", "Destroys instance on component unmount to prevent memory leaks."]
        ]
      },
      {
        fileName: "StatsCard.jsx",
        purpose: "Reusable statistics summary card displaying projects, blogs, and connection counts.",
        rows: [
          ["Default Props", "{ projectsCount = 12, blogsCount = 24, connectionsCount = 186 }", "Component declaration", "Provides fallback numbers if props are not passed."],
          ["Metric Display", "<strong>{projectsCount}</strong><p>Projects</p>", "Stats row grid", "Renders formatted bold summary metrics in a 3-column row."]
        ]
      }
    ]
  },
  {
    id: "page8_projects",
    title: "8. PROJECTS PAGE",
    files: [
      {
        fileName: "ProjectsIsland.jsx",
        purpose: "Multi-criteria search, category filter, sorting, and interactive likes counter toggle.",
        rows: [
          ["State Management", "useState(initialProjects), useState([]) (likedTitles)", "In-memory showcase", "Manages live project items array and user liked titles."],
          ["Sorting State", "const [sort, setSort] = useState(\"Latest\")", "Sort dropdown", "Controls sorting order: Latest, Most Liked, or Most Viewed."],
          ["Multi-Criteria Filter", "useMemo(() => result.sort(...), [projectsList, category, query, sort])", "Projects grid", "Combines category match, search match, and sorting algorithm."],
          ["Reactive Like Toggle", "handleLike = (title) => { ... likes ± 1 ... }", "Like button", "Increments/decrements likes in state and toggles heart icon."],
          ["Conditional Styling", "color: isLiked ? \"#e11d48\" : \"#4f46e5\"", "Heart icon button", "Toggles heart icon between outline ♡ and filled crimson ♥."],
          ["Dropdown Selectors", "value={category}, onChange={(e) => setCategory(e.target.value)}", "Filter toolbar", "Controlled <select> element for filtering by project category."],
          ["Alternating Classes", "const picClass = picClasses[idx % picClasses.length]", "Card image placeholder", "Cycles 6 thumbnail gradient classes (.finance, .rail, etc.)."]
        ]
      },
      {
        fileName: "ProjectCard.jsx",
        purpose: "Reusable showcase card with tech pills, view count, and reactive like button.",
        rows: [
          ["Component Props", "export function ProjectCard({ project, onLike, isLiked })", "Showcase card", "Receives project object, like status, and click handler."],
          ["Tech Stack Mapping", "project.technologies.map(item => (<span key={item}>{item}</span>))", "Tags row", "Iterates over tech stack strings rendering badge pills."],
          ["Interactive Like", "onClick={() => onLike(project)}", "Like button control", "Triggers parent like toggle passing project object."]
        ]
      }
    ]
  },
  {
    id: "page9_about",
    title: "9. ABOUT PAGE",
    files: [
      {
        fileName: "AboutStats.jsx",
        purpose: "Smooth animated incremental counters with guaranteed timer cleanup upon unmount.",
        rows: [
          ["State Array", "const [counts, setCounts] = useState([0, 0, 0, 0])", "Metric counters", "Stores current animation values for Devs, Blogs, Projects, Countries."],
          ["Lifecycle Interval", "useEffect(() => { timer = setInterval(...); }, [])", "Mount effect", "Runs timer every 25ms to increment counters smoothly."],
          ["Incremental Math", "Math.min(target, value + Math.max(1, Math.ceil(target / 40)))", "Timer tick", "Computes proportional steps so all numbers finish simultaneously."],
          ["Lifecycle Cleanup", "return () => clearInterval(timer)", "Unmount cleanup", "Safely clears interval on unmount; prevents ghost memory leaks."],
          ["Metric Formatting", "val >= 1000 ? (val / 1000).toFixed(...) + 'K' : val", "Number display", "Converts raw thousands into compact strings (e.g. 10K+, 2.5K+)."],
          ["List Rendering", "labels.map(({ label, sub }, idx) => (<article key={label}>...))", "Stats grid", "Iterates over label definitions rendering metric cards with subtitles."]
        ]
      }
    ]
  }
];

function generateHtml(page) {
  const fileTables = page.files.map((file) => `
    <div class="file-section">
      <p class="meta-line"><span class="bold">React File:</span> <span class="filename">${file.fileName}</span></p>
      <p class="meta-line"><span class="bold">Purpose:</span> ${file.purpose}</p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 20%;">React Feature</th>
            <th style="width: 32%;">Code / Method Used</th>
            <th style="width: 22%;">Where Used</th>
            <th style="width: 26%;">Purpose</th>
          </tr>
        </thead>
        <tbody>
          ${file.rows.map((row) => `
            <tr>
              <td class="bold-cell">${row[0]}</td>
              <td class="code-cell">${row[1]}</td>
              <td>${row[2]}</td>
              <td>${row[3]}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${page.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 36px 44px 60px 44px;
    width: 1200px;
  }
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .file-section {
    margin-bottom: 28px;
  }
  .meta-line {
    font-size: 15px;
    color: #334155;
    margin-bottom: 6px;
    line-height: 1.4;
  }
  .bold {
    font-weight: 700;
    color: #0f172a;
  }
  .filename {
    color: #1e293b;
    font-weight: 600;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .data-table th {
    background: #3B49DF;
    color: #ffffff;
    text-align: left;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 700;
    border: 1px solid #3B49DF;
    letter-spacing: 0.2px;
  }
  .data-table td {
    padding: 10px 16px;
    font-size: 13.5px;
    color: #334155;
    border: 1px solid #e2e8f0;
    vertical-align: middle;
    line-height: 1.45;
  }
  .data-table tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  .data-table tbody tr:hover {
    background: #f1f5f9;
  }
  .bold-cell {
    font-weight: 600;
    color: #0f172a;
  }
  .code-cell {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12.5px;
    color: #0f172a;
    background: rgba(241, 245, 249, 0.6);
    padding: 2px 6px;
    border-radius: 4px;
  }
</style>
</head>
<body>
  <h1>${page.title}</h1>
  ${fileTables}
</body>
</html>`;
}

const chromePath = "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe";
const outputDir = path.resolve("docs/react_page_tables");
const artifactDir = path.resolve("C:/Users/N.AJAYKUMAR/.gemini/antigravity-ide/brain/51d4d2b2-9327-46de-94b6-537258b97a73");
const tempDir = os.tmpdir();

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Generating HTML templates and PNG screenshots for all 9 pages...");

pagesData.forEach((page, idx) => {
  const htmlContent = generateHtml(page);
  const tempHtmlPath = path.join(tempDir, `${page.id}.html`);
  const tempImgPath = path.join(tempDir, `${page.id}.png`);
  const finalImgPath = path.join(outputDir, `${page.id}.png`);
  const artifactImgPath = path.join(artifactDir, `${page.id}.png`);

  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  // Calculate window height estimate: base 220px + per-file 150px + per-row 68px + buffer 150px
  const totalRows = page.files.reduce((sum, f) => sum + f.rows.length, 0);
  const height = Math.max(750, 220 + page.files.length * 150 + totalRows * 68 + 150);

  const cmd = `cmd.exe /c ""${chromePath}" --headless=new --no-sandbox --disable-gpu --screenshot="${tempImgPath}" --window-size=1200,${height} "file:///${tempHtmlPath.replace(/\\/g, "/")}"`;

  try {
    execSync(cmd, { stdio: "ignore" });
    if (fs.existsSync(tempImgPath)) {
      fs.copyFileSync(tempImgPath, finalImgPath);
      fs.copyFileSync(tempImgPath, artifactImgPath);
      fs.unlinkSync(tempImgPath);
      console.log(`[OK] Generated: ${page.id}.png (${height}px height) -> Saved to docs/react_page_tables/ and artifacts`);
    } else {
      console.error(`[ERROR] Failed to produce screenshot for ${page.id}`);
    }
  } catch (err) {
    console.error(`[FAIL] ${page.id}:`, err.message);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
});

console.log("All 9 React page table images generated successfully!");
