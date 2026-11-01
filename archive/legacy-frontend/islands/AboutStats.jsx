import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { statsApi } from "../services/api";

export function AboutStats() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [targets, setTargets] = useState([6, 3, 5, 2]);

  useEffect(() => {
    statsApi.getOverview()
      .then((data) => {
        if (data) {
          setTargets([
            data.developersCount ?? 6,
            data.blogsCount ?? 3,
            data.projectsCount ?? 5,
            data.countriesCount ?? 2,
          ]);
        }
      })
      .catch(() => {
        // Fallback targets
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounts((current) =>
        current.map((value, idx) =>
          Math.min(
            targets[idx],
            value + Math.max(1, Math.ceil(targets[idx] / 40))
          )
        )
      );
    }, 25);

    return () => clearInterval(timer);
  }, [targets]);

  const labels = [
    { label: "Developers", sub: "Active community members" },
    { label: "Blogs", sub: "Knowledge shared" },
    { label: "Projects", sub: "Innovative projects built" },
    { label: "Countries", sub: "Developers worldwide" },
  ];

  return (
    <div>
      {labels.map(({ label, sub }, idx) => {
        const val = counts[idx];
        const formatted =
          val >= 1000
            ? `${(val / 1000).toFixed(val % 1000 ? 1 : 0)}K`
            : `${val}`;

        return (
          <article key={label}>
            <strong>{formatted}+</strong>
            <b>{label}</b>
            <small>{sub}</small>
          </article>
        );
      })}
    </div>
  );
}

// Auto-mount
const container = document.getElementById("about-stats-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <AboutStats />
    </React.StrictMode>
  );
}
