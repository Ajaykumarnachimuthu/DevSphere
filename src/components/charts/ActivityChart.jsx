import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

/**
 * ActivityChart Component
 * Demonstrates proper Chart.js lifecycle management in React using useRef and useEffect.
 * Ensures clean destruction on unmount and prevents duplicate canvas chart instances.
 */
export function ActivityChart({
  data = [12, 24, 186],
  labels = ["Projects", "Blogs", "Connections"],
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy any existing instance before initializing a new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Community Activity",
            data,
            backgroundColor: "#4f46e5",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1f2937",
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#e2e8f0",
            },
            ticks: {
              color: "#64748b",
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
      },
    });

    // Teardown logic: clean up chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, labels]);

  return (
    <div
      className="activity-chart-container"
      style={{ position: "relative", height: "220px", width: "100%", marginTop: "16px" }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
