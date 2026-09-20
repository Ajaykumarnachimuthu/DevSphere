import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { StatsCard } from "../components/cards/StatsCard";
import { ActivityChart } from "../components/charts/ActivityChart";
import { developers } from "../data/developers";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function DeveloperProfile() {
  const [storedDeveloper] = useLocalStorage("selectedDeveloper", null);
  const [selected, setSelected] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Read from stored developer or use fallback default
    const dev = storedDeveloper || developers[0];
    setSelected(dev);

    const isConnected =
      localStorage.getItem(`connection:${dev.name}`) === "true";
    setConnected(isConnected);
  }, [storedDeveloper]);

  if (!selected) return null;

  const handleConnect = () => {
    const nextState = !connected;
    setConnected(nextState);
    localStorage.setItem(`connection:${selected.name}`, String(nextState));
  };

  const initials = selected.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <Shell>
      <p className="crumb">
        <NavLink to="/developers">Developers</NavLink> / Profile
      </p>

      <section className="profile card">
        <div className="avatar large">{initials}</div>
        <div className="profile-details">
          <b>{selected.role}</b>
          <h1>{selected.name}</h1>
          <small>{selected.location} · Available for collaboration</small>
          <p>{selected.description}</p>
          <div className="profile-actions">
            <button
              type="button"
              className={connected ? "secondary" : ""}
              onClick={handleConnect}
            >
              {connected ? "✓ Connected" : "+ Connect"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() =>
                setMessage(
                  `Direct messaging panel for ${selected.name} will be connected to the backend in Phase 4.`
                )
              }
            >
              Message
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </div>
      </section>

      <div className="profile-grid">
        <section className="card profile-about-card">
          <h2>About</h2>
          <p>
            {selected.description} Passionate about writing clean code, building
            performant systems, and collaborating with cross-functional teams.
          </p>

          <h2>Skills & Technologies</h2>
          <div className="tags">
            {selected.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="card profile-stats-card">
          <StatsCard
            projectsCount={12}
            blogsCount={24}
            connectionsCount={connected ? 187 : 186}
          />
          <h2 style={{ marginTop: "24px" }}>Activity Breakdown</h2>
          <ActivityChart
            data={[12, 24, connected ? 187 : 186]}
            labels={["Projects", "Blogs", "Connections"]}
          />
        </section>
      </div>
    </Shell>
  );
}
