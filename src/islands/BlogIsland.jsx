import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { blogs as initialBlogs } from "../data/blogs";
import { useLocalStorage } from "../hooks/useLocalStorage";

const categories = ["All", "Web Development", "Mobile", "AI / ML", "DevOps", "Technology", "Programming"];

export function BlogIsland() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [storedBlogs] = useLocalStorage("publishedBlogs", []);

  // Adapt published blogs from localStorage into BlogCard format
  const publishedList = useMemo(() => {
    const list = Array.isArray(storedBlogs) ? storedBlogs : [];
    return list.map((blog) => ({
      title: blog.title,
      category: blog.category || "General",
      description: blog.content,
      author: blog.author || "Community Member",
      readTime: "Recent",
      tech: blog.category || "Article",
    }));
  }, [storedBlogs]);

  const allBlogs = useMemo(
    () => [...publishedList, ...initialBlogs],
    [publishedList]
  );

  // Filter blogs based on category selection and search query
  const filteredBlogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allBlogs.filter((blog) => {
      const matchesCategory =
        category === "All" ||
        blog.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !normalized ||
        `${blog.title} ${blog.description} ${blog.category} ${blog.author} ${blog.tech || ""}`
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [allBlogs, category, query]);

  return (
    <>
      <section className="blogActions">
        <div className="blogSearch">
          <input
            type="text"
            placeholder="Search blogs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search blogs"
          />
        </div>
        <button
          className="write"
          type="button"
          onClick={() => {
            window.location.href = "./writeBlog.html";
          }}
        >
          Write a Blog
        </button>
      </section>

      <section className="categories">
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
      </section>

      <section className="blogGrid">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog, idx) => (
            <article className="blogCard" key={`${blog.title}-${idx}`}>
              <div className="blogImage">{blog.tech || blog.category}</div>
              <div className="blogContent">
                <span className="tech">{blog.tech || blog.category}</span>
                <h2>{blog.title}</h2>
                <p>{blog.description}</p>
                <small>
                  {blog.author} · {blog.readTime || "5 min read"}
                </small>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state" style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", padding: "40px 0" }}>
            No blogs found matching &quot;{query}&quot;.
          </p>
        )}
      </section>
    </>
  );
}

// Progressive enhancement auto-mount
const container = document.getElementById("blog-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <BlogIsland />
    </React.StrictMode>
  );
}
