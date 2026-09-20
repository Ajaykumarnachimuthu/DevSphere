import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { projects as initialProjects } from "../data/projects";

const categories = [
  "All",
  "Web Development",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Tools",
  "UI/UX",
  "Other",
];

const picClasses = ["finance", "rail", "vehicle", "habit", "market", "task"];

export function ProjectsIsland() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [projectsList, setProjectsList] = useState(initialProjects);
  const [likedTitles, setLikedTitles] = useState([]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = projectsList.filter((project) => {
      const matchesCategory =
        category === "All" ||
        project.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !normalized ||
        `${project.title} ${project.category} ${project.technologies.join(" ")} ${project.author}`
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });

    return [...result].sort((a, b) => {
      if (sort === "Most Liked") return b.likes - a.likes;
      if (sort === "Most Viewed") return b.views - a.views;
      return 0;
    });
  }, [projectsList, category, query, sort]);

  const handleLike = (projectTitle) => {
    const isLiked = likedTitles.includes(projectTitle);
    if (isLiked) {
      setLikedTitles((prev) => prev.filter((t) => t !== projectTitle));
      setProjectsList((prev) =>
        prev.map((p) =>
          p.title === projectTitle ? { ...p, likes: p.likes - 1 } : p
        )
      );
    } else {
      setLikedTitles((prev) => [...prev, projectTitle]);
      setProjectsList((prev) =>
        prev.map((p) =>
          p.title === projectTitle ? { ...p, likes: p.likes + 1 } : p
        )
      );
    }
  };

  return (
    <>
      <section className="top">
        <div>
          <h1>Projects</h1>
          <p>Explore innovative projects built by our community.</p>
        </div>
        <div className="filters">
          <input
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value === "All Categories" ? "All" : e.target.value
              )
            }
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="AI/ML">AI/ML</option>
            <option value="DevOps">DevOps</option>
            <option value="Tools">Tools</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort projects"
          >
            <option value="Latest">Latest</option>
            <option value="Most Liked">Most Liked</option>
            <option value="Most Viewed">Most Viewed</option>
          </select>
          <button
            type="button"
            onClick={() =>
              alert("Project submission will be connected to the backend later.")
            }
          >
            + Submit Project
          </button>
        </div>
      </section>

      <div className="cats">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="grid">
        {filtered.length > 0 ? (
          filtered.map((project, idx) => {
            const isLiked = likedTitles.includes(project.title);
            const picClass = picClasses[idx % picClasses.length];
            return (
              <article key={project.title}>
                <div className={`pic ${picClass}`}>{project.title}</div>
                <div className="body">
                  <b>{project.category}</b>
                  <h2>{project.title}</h2>
                  <p>{project.description}</p>
                  <div className="tags">
                    {project.technologies.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <small>
                    {project.author} ·{" "}
                    <button
                      type="button"
                      className={`like ${isLiked ? "liked" : ""}`}
                      onClick={() => handleLike(project.title)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: isLiked ? "#e11d48" : "#4f46e5",
                        fontWeight: 600,
                      }}
                    >
                      {isLiked ? "♥" : "♡"} {project.likes}
                    </button>{" "}
                    · ◉ {project.views}
                  </small>
                </div>
              </article>
            );
          })
        ) : (
          <p
            className="empty-state"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "#6b7280",
              padding: "40px",
            }}
          >
            No projects found matching &quot;{query}&quot;.
          </p>
        )}
      </section>
    </>
  );
}

// Auto-mount
const container = document.getElementById("projects-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <ProjectsIsland />
    </React.StrictMode>
  );
}
