export function StatsCard({ projectsCount = 12, blogsCount = 24, connectionsCount = 186 }) {
  return (
    <section className="card stats">
      <h2>Developer stats</h2>
      <div className="stats-row">
        <div>
          <strong>{projectsCount}</strong>
          <p>Projects</p>
        </div>
        <div>
          <strong>{blogsCount}</strong>
          <p>Blogs</p>
        </div>
        <div>
          <strong>{connectionsCount}</strong>
          <p>Connections</p>
        </div>
      </div>
    </section>
  );
}
