import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Chart from "chart.js/auto";
import { developers } from "../data/developers";
import { developersApi } from "../services/api";

export function ProfileChart() {
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({ projects: 12, blogs: 24, connections: 186 });
  const [message, setMessage] = useState("");
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // Read selectedDeveloper from localStorage or fallback
    let dev = developers[0];
    try {
      const stored = localStorage.getItem("selectedDeveloper");
      if (stored) {
        dev = JSON.parse(stored);
      }
    } catch {
      dev = developers[0];
    }
    setSelectedDeveloper(dev);

    const isConn = localStorage.getItem(`connection:${dev.name}`) === "true";
    setConnected(isConn);

    if (dev?.id) {
      developersApi.getStats(dev.id)
        .then((res) => {
          if (res) {
            setStats({
              projects: res.projectsCount ?? 12,
              blogs: res.blogsCount ?? 24,
              connections: res.connectionsCount ?? 186,
            });
            if (res.connected !== undefined) {
              setConnected(res.connected);
            }
          }
        })
        .catch(() => {
          // Fallback stats retained
        });
    }
  }, []);

  const handleConnect = async () => {
    if (!selectedDeveloper) return;
    const nextState = !connected;
    setConnected(nextState);
    localStorage.setItem(
      `connection:${selectedDeveloper.name}`,
      String(nextState)
    );

    if (selectedDeveloper.id) {
      try {
        const res = await developersApi.toggleConnect(selectedDeveloper.id);
        if (res && res.connected !== undefined) {
          setConnected(res.connected);
          setStats((prev) => ({
            ...prev,
            connections: res.totalConnections ?? (nextState ? prev.connections + 1 : prev.connections - 1),
          }));
        }
      } catch {
        // Fallback already saved to localStorage
      }
    }
  };

  // Lifecycle-safe Chart.js initialization & cleanup
  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Projects", "Blogs", "Connections"],
        datasets: [
          {
            label: "Developer Activity",
            data: [stats.projects, stats.blogs, stats.connections],
            backgroundColor: "#4F46E5",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [connected, stats]);

  if (!selectedDeveloper) return null;

  return (
    <div className="react-profile-interactive" style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleConnect}
          style={{
            backgroundColor: connected ? "#eef2ff" : "#4f46e5",
            color: connected ? "#4f46e5" : "#ffffff",
            border: "1px solid #4f46e5",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {connected ? "✓ Connected" : "+ Connect"}
        </button>

        <button
          type="button"
          className="outline"
          onClick={() =>
            setMessage(
              `Message panel for ${selectedDeveloper.name} will be connected to the backend later.`
            )
          }
          style={{
            backgroundColor: "#ffffff",
            color: "#4f46e5",
            border: "1px solid #4f46e5",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Message
        </button>
      </div>

      {message && (
        <p style={{ color: "#4f46e5", fontSize: "13px", margin: "8px 0" }}>
          {message}
        </p>
      )}

      <div style={{ position: "relative", height: "180px", width: "100%", marginTop: "16px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// Auto-mount
const container = document.getElementById("profile-interactive-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <ProfileChart />
    </React.StrictMode>
  );
}
