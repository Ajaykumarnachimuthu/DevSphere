export function ProjectCard({ project, onLike, isLiked }) {
  return (
    <article className="card project-card">
      <div className="project-image">{project.title}</div>
      <div className="card-body">
        <b>{project.category}</b>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="tags">
          {project.technologies.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <small>
          {project.author} ·{" "}
          <button
            type="button"
            className={`like ${isLiked ? "liked" : ""}`}
            onClick={() => onLike(project)}
            title="Like this project"
          >
            {isLiked ? "♥" : "♡"} {project.likes}
          </button>{" "}
          · ◉ {project.views}
        </small>
      </div>
    </article>
  );
}
