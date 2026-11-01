import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { statsApi } from "../services/api";

export function About() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    // Fetch live platform statistics from backend
    statsApi
      .getOverview()
      .then((data) => {
        if (data) {
          setLiveStats(data);
          const realTargets = [
            data.developersCount ?? 0,
            data.blogsCount ?? 0,
            data.projectsCount ?? 0,
            data.countriesCount ?? 0,
          ];
          setCounts(realTargets);
        }
      })
      .catch(() => {
        setCounts([0, 0, 0, 0]);
      });
  }, []);

  return (
    <Shell>
      <section className="about-hero">
        <div>
          <span className="eyebrow">
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}></span>
            About DevSphere
          </span>
          <h1>Empowering developers to learn, grow, and build together.</h1>
          <p>
            DevSphere is an open, modern developer platform where engineers, creators, and tech enthusiasts share knowledge, showcase production projects, and connect across global tech stacks.
          </p>
          <div className="actions">
            <NavLink className="primary-link" to="/signup">
              Join Our Community
            </NavLink>
            <NavLink className="login-link" to="/blogs">
              Read Developer Blogs
            </NavLink>
          </div>
        </div>

        <div className="code-block" aria-hidden="true">
          <span style={{ color: "#818cf8" }}>// The DevSphere Community Contract</span>
          <br />
          <small>
            const community = &quot;DevSphere&quot;;
            <br />
            const mission = &quot;Share. Build Together. Grow Forever.&quot;;
            <br />
            const techStack = [&quot;React 18&quot;, &quot;Spring Boot 3.4&quot;, &quot;PostgreSQL&quot;];
            <br />
            <br />
            await buildTogether(community);
          </small>
        </div>
      </section>

      <section className="numbers">
        <h2>DevSphere in Numbers</h2>
        <div>
          {[
            {
              label: "Developers",
              count: `${liveStats?.developersCount ?? counts[0]} Active`,
              desc: "Verified community members",
            },
            {
              label: "Technical Blogs",
              count: `${liveStats?.blogsCount ?? counts[1]} Published`,
              desc: "Tutorials & insights",
            },
            {
              label: "Showcase Projects",
              count: `${liveStats?.projectsCount ?? counts[2]} Deployed`,
              desc: "Community projects",
            },
            {
              label: "Global Reach",
              count: `${liveStats?.countriesCount ?? counts[3]} Countries`,
              desc: "Across continents",
            },
          ].map(({ label, count, desc }) => (
            <article key={label}>
              <strong>{count}</strong>
              <b>{label}</b>
              <small>{desc}</small>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}
