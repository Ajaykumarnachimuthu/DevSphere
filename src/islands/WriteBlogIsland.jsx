import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function WriteBlogIsland() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState(() => {
    return localStorage.getItem("loggedInUser") || "";
  });
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [drafts, setDrafts] = useLocalStorage("drafts", []);
  const [published, setPublished] = useLocalStorage("publishedBlogs", []);

  const contentRef = useRef(null);

  const buildBlogPayload = () => ({
    title: title.trim(),
    category,
    content: content.trim(),
    author: author.trim() || "Anonymous",
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    createdAt: new Date().toISOString(),
  });

  const validate = (blog) => {
    if (!blog.title || !blog.category || !blog.content) {
      setMessage("Title, category and content are required.");
      setIsSuccess(false);
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    const blog = buildBlogPayload();
    if (!validate(blog)) return;

    const list = Array.isArray(drafts) ? drafts : [];
    setDrafts([...list, blog]);
    setMessage("Draft saved.");
    setIsSuccess(true);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    const blog = buildBlogPayload();
    if (!validate(blog)) return;

    const list = Array.isArray(published) ? published : [];
    setPublished([blog, ...list]);
    setMessage("Blog published successfully.");
    setIsSuccess(true);

    setTimeout(() => {
      window.location.href = "./BlogPage.html";
    }, 800);
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= 5000) {
      setContent(text);
    }
  };

  return (
    <section className="editor-card">
      <form onSubmit={handlePublish}>
        {message && (
          <p
            style={{
              color: isSuccess ? "green" : "crimson",
              fontWeight: 500,
              fontSize: "14px",
              marginBottom: "14px",
            }}
          >
            {message}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="blog-title">Blog Title</label>
          <input
            type="text"
            id="blog-title"
            name="blog-title"
            placeholder="Give your blog a meaningful title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              <option>Technology</option>
              <option>Programming</option>
              <option>Education</option>
              <option>Personal</option>
              <option>Travel</option>
              <option>Lifestyle</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Your Story</label>
          <textarea
            ref={contentRef}
            id="content"
            name="content"
            placeholder="Start writing your story here..."
            value={content}
            onChange={handleContentChange}
            maxLength={5000}
          />
          <div className="editor-info">
            <span>Write freely. Share your ideas.</span>
            <span>Characters: {content.length} / 5000</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            placeholder="e.g. coding, technology, web development"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <small>
            Add a few keywords to help readers discover your blog.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn secondary-btn"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn preview-btn"
            onClick={() => {
              setPreview(!preview);
              contentRef.current?.focus();
            }}
          >
            {preview ? "Hide Preview" : "Preview"}
          </button>
          <button type="submit" className="btn publish-btn">
            Publish Blog
          </button>
        </div>

        {preview && (
          <section
            className="blog-preview"
            style={{
              marginTop: "20px",
              padding: "20px",
              borderTop: "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "#f9fafb",
            }}
          >
            <h2 style={{ color: "#111827", marginBottom: "8px" }}>
              {title || "Untitled Blog"}
            </h2>
            <b style={{ color: "#4f46e5", display: "block", marginBottom: "12px" }}>
              Category: {category || "Unassigned"} · Author: {author || "Anonymous"}
            </b>
            <p style={{ color: "#4b5563", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {content || "Blog preview content will be rendered here."}
            </p>
          </section>
        )}
      </form>
    </section>
  );
}

// Auto-mount
const container = document.getElementById("write-blog-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <WriteBlogIsland />
    </React.StrictMode>
  );
}
