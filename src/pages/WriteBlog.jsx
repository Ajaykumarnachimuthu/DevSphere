import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { PageIntro } from "../components/layout/PageIntro";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../hooks/useAuth";

export function WriteBlog() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    title: "",
    category: "",
    author: currentUser ? currentUser.split("@")[0] : "",
    content: "",
    tags: "",
  });

  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [drafts, setDrafts] = useLocalStorage("drafts", []);
  const [published, setPublished] = useLocalStorage("publishedBlogs", []);

  const contentRef = useRef(null);

  const buildBlogPayload = () => ({
    title: form.title.trim(),
    category: form.category,
    content: form.content.trim(),
    author: form.author.trim() || "Anonymous",
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    createdAt: new Date().toISOString(),
  });

  const validate = (blog) => {
    if (!blog.title || !blog.category || !blog.content) {
      setMessage("Title, category, and content are required fields.");
      setIsSuccess(false);
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    const blog = buildBlogPayload();
    if (!validate(blog)) return;

    const existingDrafts = Array.isArray(drafts) ? drafts : [];
    setDrafts([...existingDrafts, blog]);
    setMessage("Draft saved successfully to localStorage.");
    setIsSuccess(true);
  };

  const handlePublish = () => {
    const blog = buildBlogPayload();
    if (!validate(blog)) return;

    const existingPublished = Array.isArray(published) ? published : [];
    setPublished([blog, ...existingPublished]);
    setMessage("Blog published successfully! Redirecting…");
    setIsSuccess(true);

    setTimeout(() => {
      navigate("/blogs");
    }, 700);
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= 5000) {
      setForm((prev) => ({ ...prev, content: text }));
    }
  };

  return (
    <Shell>
      <PageIntro
        title="Write your story"
        text="Share your insights, tutorials, and experiences with the developer community."
      />

      <section className="editor card">
        {message && (
          <p className={isSuccess ? "message success" : "message"}>{message}</p>
        )}

        <label>
          Blog title
          <input
            type="text"
            placeholder="e.g. Master React Hooks in 10 Minutes"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <div className="form-row">
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="AI / ML">AI / ML</option>
              <option value="DevOps">DevOps</option>
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
            </select>
          </label>

          <label>
            Author name
            <input
              type="text"
              placeholder="Your name or handle"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </label>
        </div>

        <label>
          Your story
          <textarea
            ref={contentRef}
            placeholder="Write your article content here (Markdown or plain text)..."
            value={form.content}
            onChange={handleContentChange}
            maxLength={5000}
          />
          <small className="char-count">
            {form.content.length} / 5000 characters
          </small>
        </label>

        <label>
          Tags (comma separated)
          <input
            type="text"
            placeholder="react, javascript, webdev"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </label>

        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={handleSaveDraft}
          >
            Save draft
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setPreview(!preview);
              contentRef.current?.focus();
            }}
          >
            {preview ? "Hide preview" : "Preview"}
          </button>
          <button type="button" onClick={handlePublish}>
            Publish blog
          </button>
        </div>

        {preview && (
          <article className="preview">
            <h2>{form.title || "Untitled Blog Post"}</h2>
            <b>
              Category: {form.category || "General"} · By:{" "}
              {form.author || "Anonymous"}
            </b>
            <p>{form.content || "Preview text will appear here once typed."}</p>
          </article>
        )}
      </section>
    </Shell>
  );
}
