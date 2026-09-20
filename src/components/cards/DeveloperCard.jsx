export function DeveloperCard({ developer, onSelect }) {
  const initials = developer.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <article className="card developer-card">
      <div className="avatar">{initials}</div>
      <div className="developer-info">
        <h2>{developer.name}</h2>
        <b>{developer.role}</b>
        <p>{developer.description}</p>
        <div className="tags">
          {developer.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => onSelect(developer)}
        >
          View profile
        </button>
      </div>
    </article>
  );
}
