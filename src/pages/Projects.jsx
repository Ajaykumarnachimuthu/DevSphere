import { useMemo, useState } from "react";
import { Shell } from "../components/layout/Shell";
import { PageIntro } from "../components/layout/PageIntro";
import { ProjectCard } from "../components/cards/ProjectCard";
import { projects as initialProjects } from "../data/projects";

export function Projects() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [items, setItems] = useState(initialProjects);
  const [likedTitles, setLikedTitles] = useState([]);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = items.filter((project) => {
      const matchesCategory =
        category === "All" ||
        project.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        `${project.title} ${project.category} ${project.technologies.join(" ")} ${project.author}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    return [...result].sort((a, b) => {
      if (sort === "Most Liked") return b.likes - a.likes;
      if (sort === "Most Viewed") return b.views - a.views;
      return 0; // Default Latest order
    });
  }, [items, category, query, sort]);

  const handleLike = (project) => {
    if (likedTitles.includes(project.title)) {
      // Unlike
      setLikedTitles((prev) => prev.filter((t) => t !== project.title));
      setItems((prev) =>
        prev.map((item) =>
          item.title === project.title ? { ...item, likes: item.likes - 1 } : item
        )
      );
    } else {
      // Like
      setLikedTitles((prev) => [...prev, project.title]);
      setItems((prev) =>
        prev.map((item) =>
          item.title === project.title ? { ...item, likes: item.likes + 1 } : item
        )
      );
    }
  };

  return (
    <Shell>
      <PageIntro
        title="Explore Community Projects"
        text="Discover innovative tools, libraries, and applications built by developers across the community."
      />

      <div className="toolbar project-toolbar">
        <input
          type="text"
          placeholder="Search projects by title, stack, or creator..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Tools">Tools</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort projects"
        >
          <option value="Latest">Sort: Latest</option>
          <option value="Most Liked">Sort: Most Liked</option>
          <option value="Most Viewed">Sort: Most Viewed</option>
        </select>

        <button
          type="button"
          onClick={() =>
            setNotice("Project submission pipeline will be linked to backend API in Phase 4.")
          }
        >
          + Submit project
        </button>
      </div>

      {notice && <p className="message success" style={{ marginBottom: "20px" }}>{notice}</p>}

      <section className="card-grid">
        {filtered.length > 0 ? (
          filtered.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              isLiked={likedTitles.includes(project.title)}
              onLike={handleLike}
            />
          ))
        ) : (
          <p className="empty">No projects found matching your criteria.</p>
        )}
      </section>
    </Shell>
  );
}
