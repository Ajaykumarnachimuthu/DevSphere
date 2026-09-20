export function BlogCard({ blog }) {
  const displayTech = blog.tech || blog.category || "General";
  return (
    <article className="card blog-card">
      <div className="card-image">{displayTech}</div>
      <div className="card-body">
        <span className="tag">{displayTech}</span>
        <h2>{blog.title}</h2>
        <p>{blog.description}</p>
        <small>
          {blog.author || "Anonymous"} · {blog.readTime || "3 min read"}
        </small>
      </div>
    </article>
  );
}
