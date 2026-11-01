import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import heroImage from "/images/ilustartion.png";

const features = [
  {
    title: "Learn from Blogs",
    text: "Read insights on programming, modern frameworks, system design, and engineering careers.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    title: "Connect with Developers",
    text: "Find inspiring engineers, follow their activity, explore their tech stacks, and collaborate.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: "Explore Projects",
    text: "Discover innovative full-stack, open-source, and AI projects built by our developer community.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    title: "Share & Collaborate",
    text: "Publish technical articles, get peer feedback, and turn ideas into tangible production impact.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
];

export function Home() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <Shell>
      <section className="home-hero">
        <div>
          <span className="eyebrow">
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}></span>
            A community for builders
          </span>
          <h1>
            Share.
            <br />
            Build Together.
            <br />
            <span>Grow Forever.</span>
          </h1>
          <p>
            DevSphere is a community platform for developers, creators, and tech enthusiasts where ideas turn into impact.
          </p>
          {isAuthenticated && (
            <p className="welcome">
              <span style={{ fontSize: "16px" }}>👋</span> Welcome back, <strong>{currentUser.split("@")[0]}</strong>!
            </p>
          )}
          <div className="actions">
            <Button onClick={() => navigate("/write-blog")}>Start writing</Button>
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
        {features.map(({ title, text, icon }) => (
          <article key={title}>
            <div className="feature-icon">{icon}</div>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </Shell>
  );
}
