import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Shell } from "../components/layout/Shell";

export function About() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const targets = [10000, 2500, 1200, 50];
    const timer = setInterval(() => {
      setCounts((current) =>
        current.map((value, index) =>
          Math.min(
            targets[index],
            value + Math.max(1, Math.ceil(targets[index] / 35))
          )
        )
      );
    }, 25);

    return () => clearInterval(timer);
  }, []);

  return (
    <Shell>
      <section className="about-hero">
        <div>
          <p className="eyebrow">About DevSphere</p>
          <h1>Empowering developers to learn, grow, and build together.</h1>
          <p>
            DevSphere is an open, community-driven platform where developers
            share knowledge, showcase projects, and connect with like-minded
            people across technologies.
          </p>
          <div className="actions">
            <NavLink className="primary-link" to="/signup">
              Join our community
            </NavLink>
            <NavLink className="login-link" to="/blogs">
              Read blogs
            </NavLink>
          </div>
        </div>

        <div className="code-block" aria-hidden="true">
          &lt;/&gt;
          <br />
          <small>
            const community = &quot;DevSphere&quot;;
            <br />
            const mission = &quot;Share. Build Together. Grow Forever.&quot;;
            <br />
            buildTogether();
          </small>
        </div>
      </section>

      <section className="numbers">
        <h2>DevSphere in numbers</h2>
        <div>
          {["Developers", "Blogs", "Projects", "Countries"].map(
            (label, index) => {
              const val = counts[index];
              const formatted =
                val >= 1000
                  ? `${(val / 1000).toFixed(val % 1000 ? 1 : 0)}K+`
                  : `${val}+`;

              return (
                <article key={label}>
                  <strong>{formatted}</strong>
                  <b>{label}</b>
                  <small>Global reach & impact</small>
                </article>
              );
            }
          )}
        </div>
      </section>
    </Shell>
  );
}
