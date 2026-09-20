import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { PageIntro } from "../components/layout/PageIntro";
import { SearchBar } from "../components/ui/SearchBar";
import { BlogCard } from "../components/cards/BlogCard";
import { blogs as initialBlogs } from "../data/blogs";
import { useLocalStorage } from "../hooks/useLocalStorage";

const categories = [
  "All",
  "Web Development",
  "AI / ML",
  "DevOps",
  "Technology",
  "Programming",
];

export function Blogs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [storedBlogs] = useLocalStorage("publishedBlogs", []);

  // Format custom published blogs to match blog card expectations
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

  // Filter blogs based on selected category and search input
  const filteredBlogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allBlogs.filter((blog) => {
      const matchesCategory =
        category === "All" ||
        blog.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !normalized ||
        `${blog.title} ${blog.description} ${blog.category} ${blog.author} ${blog.tech}`
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [allBlogs, category, query]);

  return (
    <Shell>
      <PageIntro
        title="Explore developer blogs"
        text="Learn from developers, share knowledge and grow together."
      />

      <div className="toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search blogs by title, topic, or author..."
          label="Search blogs"
        />
        <NavLink className="primary-link" to="/write-blog">
          Write a blog
        </NavLink>
      </div>

      <div className="filters">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "selected" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="card-grid">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog, index) => (
            <BlogCard
              key={`${blog.title}-${blog.author}-${index}`}
              blog={blog}
            />
          ))
        ) : (
          <p className="empty">No blogs found matching your criteria.</p>
        )}
      </section>
    </Shell>
  );
}
