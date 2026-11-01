import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Button } from "../components/ui/Button";
import { useDevSphere } from "../context/DevSphereContext";
import { blogsApi, filesApi } from "../services/api";

export function WriteBlog() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useDevSphere();

  const [form, setForm] = useState({
    title: "",
    category: "",
    coverImage: "",
    content: "",
    visibility: "public", // 'public' or 'private'
    allowComments: true,
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  // Word count helper
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  // Insert markdown formatting at cursor position
  const insertFormatting = (prefix, suffix = "") => {
    const el = contentRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.content.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent =
      form.content.substring(0, start) +
      replacement +
      form.content.substring(end);

    setForm((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleFormatHeading = (headingLevel) => {
    if (headingLevel === "h1") insertFormatting("# ", "");
    else if (headingLevel === "h2") insertFormatting("## ", "");
    else if (headingLevel === "h3") insertFormatting("### ", "");
    else if (headingLevel === "p") insertFormatting("\n", "\n");
  };

  // Cover image upload handling
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      try {
        const res = await filesApi.upload(file);
        setForm((prev) => ({ ...prev, coverImage: res.url }));
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          setForm((prev) => ({ ...prev, coverImage: event.target.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      alert("Could not upload cover image: " + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveCover = (e) => {
    e.stopPropagation();
    setForm((prev) => ({ ...prev, coverImage: "" }));
  };

  const validate = (payload) => {
    if (!payload.title.trim()) {
      setMessage("Please provide an article title.");
      setIsSuccess(false);
      return false;
    }
    if (!payload.category) {
      setMessage("Please select a category for your blog.");
      setIsSuccess(false);
      return false;
    }
    if (!payload.content.trim()) {
      setMessage("Please write some content before publishing.");
      setIsSuccess(false);
      return false;
    }
    return true;
  };

  const buildPayload = (isDraft) => ({
    title: form.title.trim(),
    category: form.category,
    coverImage: form.coverImage || "",
    content: form.content.trim(),
    draft: isDraft,
    author: currentUser ? currentUser.split("@")[0] : "",
    visibility: form.visibility,
    allowComments: form.allowComments,
    tags: [form.category || "Development", "DevSphere"],
  });

  const handleSaveDraft = async () => {
    const payload = buildPayload(true);
    if (!validate(payload)) return;

    setSubmitting(true);
    setMessage("");

    try {
      await blogsApi.create(payload);
      setMessage("Draft saved successfully! You can resume editing anytime.");
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.message || "Failed to save draft. Please check your connection.");
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    const payload = buildPayload(false);
    if (!validate(payload)) return;

    setSubmitting(true);
    setMessage("");

    try {
      await blogsApi.create(payload);
      setMessage("Blog published successfully to the DevSphere community! Redirecting…");
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/blogs");
      }, 700);
    } catch (err) {
      setMessage(err.message || "Failed to publish blog. Please check all fields.");
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="write-blog-reference-container">
        {/* Top Back Link */}
        <div className="write-blog-back-nav">
          <Link to="/blogs" className="write-blog-back-link">
            ← Back to blogs
          </Link>
        </div>

        {/* Page Header */}
        <header className="write-blog-header">
          <h1 className="write-blog-page-title">Write a New Blog</h1>
          <p className="write-blog-page-subtitle">
            Share your knowledge with the DevSphere community.
          </p>
        </header>

        {message && (
          <div
            className={`alert-banner ${isSuccess ? "success" : "info"}`}
            style={{ marginBottom: "24px" }}
          >
            <span>{message}</span>
          </div>
        )}

        {/* 2-Column Desktop Grid matching Reference Image */}
        <div className="write-blog-layout-grid">
          {/* Left Column: Form & Editor */}
          <div className="write-blog-main-form">
            {/* Title & Category Row */}
            <div className="write-form-row">
              <div className="write-field-group title-field">
                <label className="write-field-label">Title</label>
                <input
                  type="text"
                  className="write-text-input"
                  placeholder="Enter blog title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="write-field-group category-field">
                <label className="write-field-label">Category</label>
                <div className="write-select-wrapper">
                  <select
                    className="write-select-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile">Mobile</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Tools">Tools</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Programming">Programming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cover Image Upload Area */}
            <div className="write-field-group">
              <label className="write-field-label">Cover Image</label>
              <div
                className={`write-cover-dropzone ${form.coverImage ? "has-image" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageFileChange}
                />

                {uploadingImage ? (
                  <div className="dropzone-loading">
                    <div className="btn-spinner" />
                    <span>Uploading image...</span>
                  </div>
                ) : form.coverImage ? (
                  <div className="dropzone-preview-box">
                    <img
                      src={form.coverImage}
                      alt="Cover Preview"
                      className="dropzone-preview-img"
                    />
                    <div className="dropzone-preview-overlay">
                      <span>Click to change cover image</span>
                      <button
                        type="button"
                        className="dropzone-remove-btn"
                        onClick={handleRemoveCover}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="dropzone-placeholder">
                    {/* Purple Cloud Upload Icon */}
                    <svg
                      className="dropzone-cloud-icon"
                      width="38"
                      height="38"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                      <polyline points="12 12 12 16" />
                      <polyline points="9 13 12 10 15 13" />
                    </svg>
                    <span className="dropzone-main-text">Click to upload an image</span>
                    <span className="dropzone-sub-text">Recommended size: 1200x630px</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rich Content Editor */}
            <div className="write-field-group">
              <label className="write-field-label">Content</label>
              <div className="write-rich-editor">
                {/* Formatting Toolbar */}
                <div className="write-editor-toolbar">
                  {/* Paragraph Select */}
                  <select
                    className="toolbar-select"
                    onChange={(e) => {
                      handleFormatHeading(e.target.value);
                      e.target.value = "p";
                    }}
                    defaultValue="p"
                  >
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                  </select>

                  <span className="toolbar-divider" />

                  {/* Bold */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("**", "**")}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("*", "*")}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>

                  {/* H1 */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("# ", "")}
                    title="Heading 1"
                  >
                    H1
                  </button>

                  {/* H2 */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("## ", "")}
                    title="Heading 2"
                  >
                    H2
                  </button>

                  {/* Code */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("`", "`")}
                    title="Inline Code"
                  >
                    &lt;/&gt;
                  </button>

                  {/* Quote */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("> ", "")}
                    title="Blockquote"
                  >
                    “
                  </button>

                  {/* Bullet list */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("- ", "")}
                    title="Bulleted List"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" /><line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" /><line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
                    </svg>
                  </button>

                  {/* Numbered list */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("1. ", "")}
                    title="Numbered List"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
                      <path d="M4 6h1v4M4 10h2M4 18h2.5M4 14.5a1.5 1.5 0 0 1 2.5 1c0 1-1.5 1.5-2.5 2.5" />
                    </svg>
                  </button>

                  {/* Link */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("[", "](https://)")}
                    title="Link"
                  >
                    🔗
                  </button>

                  {/* Image */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("![Image](", ")")}
                    title="Insert Image"
                  >
                    🖼
                  </button>

                  {/* Table */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n")}
                    title="Table"
                  >
                    ▦
                  </button>

                  {/* More */}
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => insertFormatting("\n```javascript\n// code snippet\n```\n")}
                    title="Code Block"
                  >
                    ...
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  ref={contentRef}
                  className="write-editor-textarea"
                  placeholder="Write your blog content here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />

                {/* Footer Status Bar with Word Count */}
                <div className="write-editor-statusbar">
                  <span>{wordCount} words</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row matching Reference Image */}
            <div className="write-actions-bottom">
              <button
                type="button"
                className="write-save-draft-btn"
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                className="write-publish-btn"
                onClick={handlePublish}
                disabled={submitting}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>{submitting ? "Publishing..." : "Publish Blog"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar Cards matching Reference Image */}
          <aside className="write-blog-sidebar">
            {/* Card 1: Tips for a great blog */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                  <path d="M9 18h6M10 22h4M12 2v1M12 18v-2a7 7 0 1 0-7-7c0 2.22 1.03 4.2 2.65 5.5.85.69 1.35 1.7 1.35 2.5z" />
                </svg>
                <h3 className="write-card-title">Tips for a great blog</h3>
              </div>
              <ul className="write-tips-list">
                <li>
                  <span className="tip-check">✓</span>
                  <span>Write a catchy and descriptive title</span>
                </li>
                <li>
                  <span className="tip-check">✓</span>
                  <span>Add a relevant cover image</span>
                </li>
                <li>
                  <span className="tip-check">✓</span>
                  <span>Use headings to structure your content</span>
                </li>
                <li>
                  <span className="tip-check">✓</span>
                  <span>Include code snippets and examples</span>
                </li>
                <li>
                  <span className="tip-check">✓</span>
                  <span>Keep your content simple and valuable</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Preview */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <h3 className="write-card-title">Preview</h3>
              </div>
              <div className="write-preview-box">
                {form.coverImage ? (
                  <img
                    src={form.coverImage}
                    alt="Preview cover"
                    className="preview-mini-img"
                  />
                ) : (
                  <div className="preview-placeholder-img">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <div className="preview-skeleton-title">
                  {form.title ? (
                    <span className="preview-live-title">{form.title}</span>
                  ) : (
                    <span className="skeleton-bar title-bar" />
                  )}
                </div>
                <div className="preview-skeleton-body">
                  <span className="skeleton-bar body-bar-1" />
                  <span className="skeleton-bar body-bar-2" />
                </div>
              </div>
            </div>

            {/* Card 3: Post Settings */}
            <div className="write-sidebar-card">
              <div className="write-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h3 className="write-card-title">Post Settings</h3>
              </div>

              {/* Visibility Radios */}
              <div className="write-settings-group">
                <label className="settings-sublabel">Visibility</label>
                <div className="settings-radio-row">
                  <label className="settings-radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={form.visibility === "public"}
                      onChange={() => setForm({ ...form, visibility: "public" })}
                    />
                    <span>Public</span>
                  </label>
                  <label className="settings-radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={form.visibility === "private"}
                      onChange={() => setForm({ ...form, visibility: "private" })}
                    />
                    <span>Private</span>
                  </label>
                </div>
              </div>

              {/* Allow Comments Toggle */}
              <div className="write-settings-group toggle-row">
                <span className="settings-sublabel">Allow comments</span>
                <label className="custom-switch">
                  <input
                    type="checkbox"
                    checked={form.allowComments}
                    onChange={(e) => setForm({ ...form, allowComments: e.target.checked })}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
