import React, { useEffect, useMemo, useState } from "react";
import { Shell } from "../components/layout/Shell";
import { ProjectCard } from "../components/cards/ProjectCard";
import { Button } from "../components/ui/Button";
import { ProjectCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ImageUploader } from "../components/ui/ImageUploader";
import { projectsApi } from "../services/api";
import { useDevSphere } from "../context/DevSphereContext";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Tools",
  "UI/UX",
  "Other",
];

export function Projects() {
  const { isAuthenticated } = useDevSphere();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState([]);
  const [notice, setNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    coverImage: "",
    category: "Web Development",
    status: "Active",
    liveDemoUrl: "",
    githubUrl: "",
    description: "",
    technologies: "",
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getAll({
        category: category === "All" ? "" : category,
        search: query,
        sort,
      });
      const list = data?.content || (Array.isArray(data) ? data : null);
      if (list && list.length > 0) {
        setItems(list);
        const backendLiked = list
          .filter((p) => p.liked || p.likedByCurrentUser)
          .map((p) => p.id || p.title);
        if (backendLiked.length > 0) {
          setLikedIds((prev) => Array.from(new Set([...prev, ...backendLiked])));
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category, query, sort]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = items.filter((project) => {
      const matchesCategory =
        category === "All" ||
        project.category?.toLowerCase() === category.toLowerCase();
      const techList = Array.isArray(project.technologies) ? project.technologies.join(" ") : "";
      const matchesQuery =
        !normalizedQuery ||
        project.title.toLowerCase().includes(normalizedQuery) ||
        (project.authorName || project.author || "").toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery) ||
        techList.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    if (sort === "Most Liked") {
      return [...result].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    if (sort === "Most Viewed") {
      return [...result].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return result;
  }, [items, category, query, sort]);

  const handleLike = async (idOrTitle) => {
    const targetProject = items.find((p) => p.id === idOrTitle || p.title === idOrTitle);
    if (!targetProject) return;
    const targetKey = targetProject.id || targetProject.title;
    const currentlyLiked = likedIds.includes(targetKey);

    // Optimistic UI update
    setLikedIds((prev) =>
      currentlyLiked ? prev.filter((id) => id !== targetKey) : [...prev, targetKey]
    );
    setItems((prev) =>
      prev.map((project) =>
        (project.id === targetKey || project.title === targetKey)
          ? { ...project, likes: Math.max(0, (project.likes || 0) + (currentlyLiked ? -1 : 1)) }
          : project
      )
    );

    // Backend synchronization
    if (targetProject.id) {
      try {
        await projectsApi.toggleLike(targetProject.id);
      } catch (err) {
        // Rollback on network/auth error
        setLikedIds((prev) =>
          currentlyLiked ? [...prev, targetKey] : prev.filter((id) => id !== targetKey)
        );
        setItems((prev) =>
          prev.map((project) =>
            (project.id === targetKey || project.title === targetKey)
              ? { ...project, likes: Math.max(0, (project.likes || 0) + (currentlyLiked ? 1 : -1)) }
              : project
          )
        );
        if (err.status === 401 || err.status === 403) {
          setNotice("Please log in to like community projects.");
        }
      }
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setNotice("Please log in to submit a project.");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const techs = form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await projectsApi.create({
        title: form.title.trim(),
        tagline: form.tagline?.trim() || "",
        coverImage: form.coverImage || "",
        category: form.category,
        status: form.status,
        liveDemoUrl: form.liveDemoUrl?.trim() || "",
        githubUrl: form.githubUrl?.trim() || "",
        description: form.description.trim(),
        technologies: techs,
      });

      setItems((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setForm({
        title: "",
        tagline: "",
        coverImage: "",
        category: "Web Development",
        status: "Active",
        liveDemoUrl: "",
        githubUrl: "",
        description: "",
        technologies: "",
      });
      setNotice("Project published successfully to DevSphere!");
    } catch (err) {
      setNotice(err.message || "Failed to submit project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="projects-reference-container">
        {/* Top Header Row matching Reference Image */}
        <header className="projects-reference-header">
          <div className="projects-header-left">
            <h1 className="projects-reference-title">Projects</h1>
            <p className="projects-reference-subtitle">
              Explore innovative projects built by our community.
            </p>
          </div>

          <div className="projects-header-controls">
            {/* Search Input with Search Icon */}
            <div className="projects-search-box">
              <svg
                className="projects-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="projects-search-input"
                placeholder="Search projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Select */}
            <select
              className="projects-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile">Mobile</option>
              <option value="AI/ML">AI/ML</option>
              <option value="DevOps">DevOps</option>
              <option value="Tools">Tools</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Other">Other</option>
            </select>

            {/* Sort Select */}
            <select
              className="projects-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort projects"
            >
              <option value="Latest">Latest</option>
              <option value="Most Liked">Most Liked</option>
              <option value="Most Viewed">Most Viewed</option>
            </select>

            {/* Submit Project Purple Button */}
            <Button
              variant="primary"
              className="projects-submit-btn"
              onClick={() => {
                if (!isAuthenticated) {
                  setNotice("Please log in to submit a project.");
                } else {
                  setIsModalOpen(true);
                  setNotice("");
                }
              }}
            >
              + Submit Project
            </Button>
          </div>
        </header>

        {/* Category Pills Filter Bar */}
        <div className="projects-category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {notice && (
          <div className="alert-banner info" style={{ margin: "16px 0 24px 0" }}>
            <span>{notice}</span>
          </div>
        )}

        {/* Submit Modal Dialog */}
        {isModalOpen && (
          <div
            className="desktop-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="desktop-modal-dialog" role="dialog" aria-modal="true">
              <header className="desktop-modal-header">
                <div className="modal-header-titles">
                  <span className="modal-tag-badge">COMMUNITY SHOWCASE</span>
                  <h2>Submit a Project</h2>
                  <p>Share your product, repository, architecture, and live demo.</p>
                </div>
                <button
                  type="button"
                  className="desktop-modal-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </header>

              <form onSubmit={handleSubmitProject} className="desktop-modal-form">
                <div className="desktop-modal-body">
                  <div className="modal-col">
                    <div className="form-group">
                      <label>Project Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Distributed Task Scheduler"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile">Mobile</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Tools">Tools</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Technologies (Comma separated) *</label>
                      <input
                        type="text"
                        placeholder="React, Node.js, MongoDB, Tailwind CSS"
                        value={form.technologies}
                        onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        rows={3}
                        placeholder="A concise synopsis of what this application does..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <ImageUploader
                        label="Cover Image (Optional)"
                        hint="Visual snapshot of software UI (Recommended: 1200x630px)"
                        value={form.coverImage}
                        onChange={(url) => setForm({ ...form, coverImage: url })}
                        aspectRatio="16/9"
                      />
                    </div>
                  </div>
                </div>

                <footer className="desktop-modal-footer">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={submitting}>
                    Publish Project
                  </Button>
                </footer>
              </form>
            </div>
          </div>
        )}

        {/* 3-Column Card Grid matching Reference */}
        <section className="projects-reference-grid">
          {loading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : filtered.length > 0 ? (
            filtered.map((project) => (
              <ProjectCard
                key={project.id || project.title}
                project={project}
                isLiked={likedIds.includes(project.id || project.title)}
                onLike={handleLike}
              />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", padding: "40px 0" }}>
              <EmptyState
                title={query || category !== "All" ? "No projects found" : "No projects have been published yet."}
                description={
                  query
                    ? `No projects matched "${query}" in category "${category}".`
                    : category !== "All"
                    ? `No projects found in category "${category}".`
                    : "Explore projects created by developers, or submit your own repository."
                }
                actionLabel={query || category !== "All" ? "Clear Filters" : undefined}
                onAction={
                  query || category !== "All"
                    ? () => {
                        setQuery("");
                        setCategory("All");
                      }
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* Bottom Pagination matching Reference Image */}
        <nav className="projects-pagination" aria-label="Projects pagination">
          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              className={`pagination-btn ${currentPage === num ? "active" : ""}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
            disabled={currentPage === 4}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>
      </div>
    </Shell>
  );
}
