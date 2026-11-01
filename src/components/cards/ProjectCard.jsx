import React from "react";
import { Link } from "react-router-dom";
import { getProjectThumbnail } from "../../data/projectImages";

export function ProjectCard({ project, onLike, isLiked }) {
  const projectId = project.id;
  const thumbnail = getProjectThumbnail(project);

  const formattedViews = project.views >= 1000
    ? `${(project.views / 1000).toFixed(1)}K`
    : project.views || 0;

  return (
    <article className="project-reference-card">
      {/* Top Media Thumbnail Box */}
      <div className="project-reference-media">
        <Link to={projectId ? `/projects/${projectId}` : "#"} tabIndex={-1}>
          <img
            src={thumbnail}
            alt={project.title}
            className="project-reference-img"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Card Content Body */}
      <div className="project-reference-body">
        {/* Category Pill */}
        <div className="project-category-wrapper">
          <span className="project-category-pill">
            {project.category || "Web Development"}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="project-reference-title">
          {projectId ? (
            <Link to={`/projects/${projectId}`} className="project-title-link">
              {project.title}
            </Link>
          ) : (
            project.title
          )}
        </h3>

        {/* Project Description (Clean 2-line clamp) */}
        <p className="project-reference-desc">
          {project.description}
        </p>

        {/* Tech Stack Pills */}
        <div className="project-tech-stack">
          {project.technologies?.slice(0, 4).map((tech) => (
            <span key={tech} className="project-tech-pill">
              {tech}
            </span>
          ))}
          {project.technologies?.length > 4 && (
            <span className="project-tech-pill tech-more">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {/* Footer: Author Avatar + Name on Left, Likes & Views on Right */}
        <div className="project-reference-footer">
          <div className="project-author-group">
            <div className="project-author-avatar">
              {(project.author || project.authorName || "D").charAt(0).toUpperCase()}
            </div>
            <span className="project-author-name">
              {project.author || project.authorName || "DevSphere Engineer"}
            </span>
          </div>

          <div className="project-stats-group">
            <button
              type="button"
              className={`project-stat-btn ${isLiked ? "active" : ""}`}
              onClick={() => onLike && onLike(project.title)}
              title={isLiked ? "Unlike project" : "Like this project"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "#EF4444" : "none"} stroke={isLiked ? "#EF4444" : "#64748B"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="stat-count">{project.likes || 0}</span>
            </button>

            <span className="project-stat-item" title={`${project.views || 0} views`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="stat-count">{formattedViews}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
