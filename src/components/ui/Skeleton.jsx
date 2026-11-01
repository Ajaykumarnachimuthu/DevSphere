import React from "react";

export function Skeleton({ width, height, borderRadius, className = "", style = {} }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: width || "100%",
        height: height || "16px",
        borderRadius: borderRadius || "var(--radius-sm)",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="card project-card skeleton-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <Skeleton width="60%" height="22px" borderRadius="var(--radius-sm)" />
        <Skeleton width="70px" height="20px" borderRadius="var(--radius-pill)" />
      </div>
      <Skeleton width="90%" height="14px" style={{ marginBottom: "8px" }} />
      <Skeleton width="75%" height="14px" style={{ marginBottom: "16px" }} />

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        <Skeleton width="50px" height="22px" borderRadius="var(--radius-pill)" />
        <Skeleton width="65px" height="22px" borderRadius="var(--radius-pill)" />
        <Skeleton width="45px" height="22px" borderRadius="var(--radius-pill)" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
        <Skeleton width="80px" height="14px" />
        <div style={{ display: "flex", gap: "12px" }}>
          <Skeleton width="40px" height="16px" />
          <Skeleton width="40px" height="16px" />
        </div>
      </div>
    </div>
  );
}

export function DeveloperCardSkeleton() {
  return (
    <div className="card developer-card skeleton-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px" }}>
      <Skeleton width="80px" height="80px" borderRadius="50%" style={{ marginBottom: "16px" }} />
      <Skeleton width="50%" height="20px" style={{ marginBottom: "8px" }} />
      <Skeleton width="35%" height="14px" style={{ marginBottom: "14px" }} />
      <Skeleton width="85%" height="14px" style={{ marginBottom: "6px" }} />
      <Skeleton width="65%" height="14px" style={{ marginBottom: "16px" }} />

      <div style={{ display: "flex", gap: "6px", justifyContent: "center", width: "100%", marginBottom: "18px" }}>
        <Skeleton width="55px" height="20px" borderRadius="var(--radius-pill)" />
        <Skeleton width="55px" height="20px" borderRadius="var(--radius-pill)" />
        <Skeleton width="55px" height="20px" borderRadius="var(--radius-pill)" />
      </div>

      <Skeleton width="100%" height="36px" borderRadius="var(--radius-md)" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="card blog-card skeleton-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <Skeleton width="80px" height="20px" borderRadius="var(--radius-pill)" />
        <Skeleton width="60px" height="14px" />
      </div>
      <Skeleton width="85%" height="22px" style={{ marginBottom: "10px" }} />
      <Skeleton width="95%" height="14px" style={{ marginBottom: "6px" }} />
      <Skeleton width="70%" height="14px" style={{ marginBottom: "16px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Skeleton width="28px" height="28px" borderRadius="50%" />
          <Skeleton width="90px" height="14px" />
        </div>
        <Skeleton width="50px" height="14px" />
      </div>
    </div>
  );
}

