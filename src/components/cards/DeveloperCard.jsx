export function DeveloperCard({ developer, onSelect }) {
  const name = developer?.name || "Developer";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "D";
  const skills = Array.isArray(developer?.skills) ? developer.skills : [];

  return (
    <article className="developer-card">
      <div className="avatar" title={name}>
        {initials}
      </div>
      <div className="developer-info">
        <h2>{name}</h2>
        <b>{developer?.role || "Software Engineer"}</b>
        <p>{developer?.description || developer?.bio || ""}</p>
        {skills.length > 0 && (
          <div className="tags">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
        <button
          type="button"
          className="secondary"
          onClick={() => onSelect(developer)}
        >
          View Profile &rarr;
        </button>
      </div>
    </article>
  );
}
