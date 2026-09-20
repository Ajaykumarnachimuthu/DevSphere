import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { developers } from "../data/developers";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function DevelopersIsland() {
  const [query, setQuery] = useState("");
  const [, setSelectedDeveloper] = useLocalStorage("selectedDeveloper", null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return developers;
    return developers.filter((dev) =>
      `${dev.name} ${dev.role} ${dev.skills.join(" ")} ${dev.location}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const handleSelectDeveloper = (dev) => {
    setSelectedDeveloper(dev);
    // Vanilla JS localStorage compatibility
    localStorage.setItem("selectedDeveloper", JSON.stringify(dev));
  };

  return (
    <>
      <section className="head">
        <h1>
          Discover <span>Developers</span>
        </h1>
        <p>Connect, learn and collaborate with talented developers.</p>
        <div className="devsearch">
          🔍
          <input
            placeholder="Search developers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search developers"
          />
        </div>
      </section>

      <section className="grid">
        {filtered.length > 0 ? (
          filtered.map((dev, idx) => {
            const initials = dev.name
              .split(" ")
              .map((part) => part[0])
              .join("");
            const avatarClass = `a${(idx % 6) + 1}`;

            return (
              <article key={dev.name}>
                <div className={`avatar ${avatarClass}`}>{initials}</div>
                <div>
                  <h2>{dev.name}</h2>
                  <b>{dev.role}</b>
                  <p>{dev.description}</p>
                  <div className="tags">
                    {dev.skills.map((skill) => (
                      <i key={skill}>{skill}</i>
                    ))}
                  </div>
                  <a
                    href="DeveloperProfile.html"
                    onClick={() => handleSelectDeveloper(dev)}
                  >
                    View Profile
                  </a>
                </div>
              </article>
            );
          })
        ) : (
          <p
            className="empty-state"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "#6b7280",
              padding: "40px",
            }}
          >
            No developers found matching &quot;{query}&quot;.
          </p>
        )}
      </section>
    </>
  );
}

// Auto-mount
const container = document.getElementById("developers-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <DevelopersIsland />
    </React.StrictMode>
  );
}
