import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { BlogCard } from "../components/cards/BlogCard";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { blogsApi } from "../services/api";
import { getLikedBlogs, toggleBlogLikedLocal, recordBlogLiked } from "../utils/likesStorage";

const CATEGORIES = [
  "All",
  "Web Development",
  "AI / ML",
  "DevOps",
  "Technology",
  "Programming",
  "Tools",
];

export function Blogs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [backendBlogs, setBackendBlogs] = useState([]);
  const [likedBlogIds, setLikedBlogIds] = useState(() => getLikedBlogs());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const catParam = category === "All" ? "" : category.replace(/\s+/g, " ").trim();
        const res = await blogsApi.getAll({
          category: catParam,
          search: query,
        });
        const list = res?.content || (Array.isArray(res) ? res : null);
        if (list && list.length > 0 && isMounted) {
          const localLiked = getLikedBlogs();
          const mapped = list.map((b) => {
            const isLiked = localLiked.includes(String(b.id)) || Boolean(b.liked);
            if (b.liked) recordBlogLiked(b.id, true);
            return {
              id: b.id,
              title: b.title,
              category: b.category,
              description: b.content,
              author: b.authorName || b.author || "DevSphere Author",
              readTime: b.readTime || "5 min read",
              tech: b.tech || b.category,
              status: b.status,
              coverImage: b.coverImage,
              likes: b.likes ?? 0,
              liked: isLiked,
              views: b.views ?? 0,
              tags: Array.isArray(b.tags) ? b.tags : Array.from(b.tags || []),
            };
          });
          setBackendBlogs(mapped);
          setLikedBlogIds(getLikedBlogs());
        } else if (isMounted) {
          setBackendBlogs([]);
        }
      } catch {
        if (isMounted) {
          setBackendBlogs([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchBlogs, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [category, query]);

  const handleLikeBlog = async (blogId) => {
    if (!blogId) return;
    const { isLiked: nowLiked, delta } = toggleBlogLikedLocal(blogId);
    setLikedBlogIds(getLikedBlogs());
    setBackendBlogs((prev) =>
      prev.map((b) => (String(b.id) === String(blogId) ? { ...b, likes: Math.max(0, (b.likes || 0) + delta) } : b))
    );
    try {
      const updated = await blogsApi.toggleLike(blogId);
      if (updated && typeof updated.likes === "number") {
        setBackendBlogs((prev) =>
          prev.map((b) => (String(b.id) === String(blogId) ? { ...b, likes: updated.likes } : b))
        );
      }
    } catch {
      // Keep optimistic update and localStorage intact for guests / network issues
    }
  };

  const filteredBlogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = backendBlogs.filter((blog) => {
      const matchesCat =
        category === "All" ||
        blog.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        (blog.description && blog.description.toLowerCase().includes(q)) ||
        (blog.author && blog.author.toLowerCase().includes(q)) ||
        (blog.tech && blog.tech.toLowerCase().includes(q)) ||
        (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesCat && matchesQuery;
    });

    if (sort === "Most Liked") {
      return [...result].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    if (sort === "Quick Reads") {
      return [...result].sort((a, b) => parseInt(a.readTime || "5") - parseInt(b.readTime || "5"));
    }
    return result;
  }, [backendBlogs, category, query, sort]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="sample-list-page-wrapper">
      <Navbar />

      <main className="sample-list-container">
        {/* Top Header Row matching ba331b87.jpg */}
        <div className="sample-list-top-header">
          <div className="sample-list-title-group">
            <h1 className="sample-list-main-title">Blogs</h1>
            <p className="sample-list-subtitle">
              Explore insightful articles, tutorials, and deep dives written by developers.
            </p>
          </div>

          <div className="sample-list-toolbar-controls">
            <div className="sample-search-input-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search blogs..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="sample-select-dropdown"
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sample-select-dropdown"
              aria-label="Sort blogs"
            >
              <option value="Latest">Latest</option>
              <option value="Most Liked">Most Liked</option>
              <option value="Quick Reads">Quick Reads</option>
            </select>

            <Link to="/write-blog" className="sample-primary-action-btn">
              + Write a Blog
            </Link>
          </div>
        </div>

        {/* Category Filter Pills Row matching ba331b87.jpg */}
        <div className="sample-category-pills-row">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`sample-pill-btn ${category === item ? "active" : ""}`}
              onClick={() => {
                setCategory(item);
                setCurrentPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* 3-Column Card Grid matching ba331b87.jpg */}
        <section className="sample-card-grid">
          {loading ? (
            <>
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </>
          ) : displayedBlogs.length > 0 ? (
            displayedBlogs.map((blog, index) => (
              <BlogCard
                key={blog.id || `${blog.title}-${index}`}
                blog={blog}
                isLiked={likedBlogIds.includes(String(blog.id))}
                onLike={handleLikeBlog}
              />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                title={query || category !== "All" ? "No blogs found" : "No articles have been published yet."}
                description={
                  query
                    ? `No articles matched "${query}" in category "${category}".`
                    : category !== "All"
                    ? `No articles found in category "${category}".`
                    : "There are currently no articles in this section. Be the first to write and share your thoughts!"
                }
                actionLabel={query || category !== "All" ? "Reset filters" : undefined}
                onAction={
                  query || category !== "All"
                    ? () => {
                        setQuery("");
                        setCategory("All");
                        setCurrentPage(1);
                      }
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* Pagination Bar matching ba331b87.jpg */}
        {totalPages > 1 && (
          <div className="sample-pagination-row">
            <button
              type="button"
              className="sample-page-arrow-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`sample-page-num-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              className="sample-page-arrow-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
