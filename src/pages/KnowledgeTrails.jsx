import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogsApi } from "../services/api";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";

export function KnowledgeTrails() {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrail, setSelectedTrail] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      const data = await blogsApi.getTrails();
      setTrails(data || []);
      if (data && data.length > 0) {
        setSelectedTrail(data[0]);
      }
    } catch (e) {
      console.error("Could not fetch knowledge trails", e);
    } finally {
      setLoading(false);
    }
  };

  // Fallback curated trail data if backend has no initial seed
  const displayTrails = trails.length > 0 ? trails : [
    {
      id: "spring-boot-mastery",
      title: "Spring Boot 3 & Microservices Mastery",
      description: "A comprehensive deep dive into enterprise Java development: Dependency Injection, Spring Security, JWT, Spring Data JPA, and Event-Driven architecture.",
      author: "Ajay",
      estimatedHours: 12,
      category: "Backend Engineering",
      prerequisites: "Core Java 17+, basic REST concepts",
      learningObjectives: "Build resilient, production-ready REST services with Spring Boot and PostgreSQL.",
      articles: [
        { id: "intro-spring-boot", title: "Introduction to Spring Boot 3 & Core Concepts", readTime: "8 min read" },
        { id: "di-and-ioc", title: "Mastering Inversion of Control & Dependency Injection", readTime: "10 min read" },
        { id: "spring-security-jwt", title: "Stateless Authentication with Spring Security 6 & JWT", readTime: "15 min read" },
        { id: "spring-data-jpa", title: "High-Performance Persistence with Spring Data JPA & HikariCP", readTime: "12 min read" },
        { id: "rest-api-architecture", title: "Designing Resilient RESTful APIs & Production Error Handling", readTime: "14 min read" },
      ]
    },
    {
      id: "react-fullstack-systems",
      title: "Modern React 18 & Full-Stack Systems",
      description: "From component composition to state machines, React Query, Vite tooling, and seamless Spring Boot REST API integration.",
      author: "DevSphere Team",
      estimatedHours: 10,
      category: "Frontend & Full-Stack",
      prerequisites: "JavaScript ES6+, HTML/CSS fundamentals",
      learningObjectives: "Architect lightning-fast developer portals and single-page apps.",
      articles: [
        { id: "react-island-architecture", title: "React Islands Architecture for Hybrid SPAs", readTime: "7 min read" },
        { id: "state-management", title: "Clean State Architecture & Context vs Stores", readTime: "9 min read" },
        { id: "api-client-patterns", title: "Bulletproof API Service Layers with Fetch & Error Boundaries", readTime: "11 min read" },
      ]
    }
  ];

  const currentTrail = selectedTrail || displayTrails[0];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container" style={{ padding: "40px 20px 80px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 48px auto" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, color: "var(--primary)" }}>
            STRUCTURED LEARNING PATHWAYS
          </span>
          <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "12px 0 16px 0", letterSpacing: "-0.5px" }}>
            DEVSphere Knowledge Trails
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Curated, ordered engineering tracks designed to guide developers from foundational concepts to production architecture mastery.
          </p>
        </div>

        <div className="trails-layout-grid">
          {/* Trails Sidebar / Selector */}
          <div className="trails-sidebar">
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Available Trails</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {displayTrails.map((trail) => (
                <div
                  key={trail.id}
                  className={`trail-card-item ${currentTrail?.id === trail.id ? "active" : ""}`}
                  onClick={() => setSelectedTrail(trail)}
                >
                  <span className="trail-cat">{trail.category}</span>
                  <h4>{trail.title}</h4>
                  <p>{trail.description.slice(0, 90)}...</p>
                  <div className="trail-meta">
                    <span>⏱ {trail.estimatedHours || 10} hours</span>
                    <span>📚 {trail.articles?.length || 5} lessons</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Trail Detail View */}
          {currentTrail && (
            <div className="trail-detail-view">
              <div className="trail-hero-banner">
                <span className="badge-pill">{currentTrail.category}</span>
                <h2>{currentTrail.title}</h2>
                <p>{currentTrail.description}</p>

                <div className="trail-info-row">
                  <div>
                    <span className="label">Curator</span>
                    <strong>{currentTrail.author}</strong>
                  </div>
                  <div>
                    <span className="label">Total Duration</span>
                    <strong>{currentTrail.estimatedHours || 10} Hours</strong>
                  </div>
                  <div>
                    <span className="label">Modules</span>
                    <strong>{currentTrail.articles?.length || 0} Lessons</strong>
                  </div>
                </div>
              </div>

              {/* Objectives & Prerequisites */}
              <div className="trail-callout-grid">
                {currentTrail.prerequisites && (
                  <div className="callout-card">
                    <h4>🎯 Prerequisites</h4>
                    <p>{currentTrail.prerequisites}</p>
                  </div>
                )}
                {currentTrail.learningObjectives && (
                  <div className="callout-card">
                    <h4>🚀 Learning Objectives</h4>
                    <p>{currentTrail.learningObjectives}</p>
                  </div>
                )}
              </div>

              {/* Ordered Article Lessons */}
              <div className="trail-curriculum">
                <h3>Curriculum & Step-by-Step Lessons</h3>
                <div className="curriculum-list">
                  {currentTrail.articles?.map((article, idx) => (
                    <div key={article.id || idx} className="curriculum-item">
                      <div className="step-circle">{idx + 1}</div>
                      <div className="step-info">
                        <h4>{article.title}</h4>
                        <span className="step-duration">⏱ {article.readTime || "10 min read"}</span>
                      </div>
                      <Link to={article.id?.length > 10 ? `/blogs/${article.id}` : "/blogs"}>
                        <Button variant="outline" size="sm">
                          Start Lesson →
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

