import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import heroImage from "/frontend/images/ilustartion.png";

export function Home() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <Shell>
      <section className="home-hero">
        <div>
          <p className="eyebrow">A community for builders</p>
          <h1>
            Share.
            <br />
            Build Together.
            <br />
            <span>Grow Forever.</span>
          </h1>
          <p>
            DevSphere is a community for developers, creators and tech
            enthusiasts where ideas turn into impact.
          </p>
          {isAuthenticated && (
            <p className="welcome">Welcome back, {currentUser}!</p>
          )}
          <div className="actions">
            <Button onClick={() => navigate("/blogs")}>Start writing</Button>
            <Button
              className="outline"
              onClick={() => navigate(isAuthenticated ? "/projects" : "/signup")}
            >
              {isAuthenticated ? "Explore projects" : "Join community"}
            </Button>
          </div>
        </div>
        <img src={heroImage} alt="Developer collaboration illustration" />
      </section>

      <section className="feature-grid">
        {[
          [
            "Learn from blogs",
            "Read insights on programming, frameworks and careers.",
          ],
          [
            "Connect with developers",
            "Find people to learn from and collaborate with.",
          ],
          ["Explore projects", "Discover innovative work from the community."],
          ["Share and collaborate", "Turn knowledge into useful impact."],
        ].map(([title, text]) => (
          <article key={title}>
            <span className="feature-icon">+</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </Shell>
  );
}
