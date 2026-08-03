"use client";

import React, { useState, useEffect, useRef } from "react";

interface HeatmapData {
  status: string;
  source: string;
  team_id: number;
  grid_rows: number;
  grid_cols: number;
  grid: number[][];
  pitch_length_m: number;
  pitch_width_m: number;
  px_per_meter: number;
}

// Color interpolation: deep blue → cyan → green → yellow → red
const heatColor = (value: number): string => {
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [0, 0, 80]],
    [0.2, [0, 80, 200]],
    [0.4, [0, 180, 180]],
    [0.6, [50, 220, 50]],
    [0.8, [220, 200, 0]],
    [1.0, [255, 40, 0]],
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i][0] && value <= stops[i + 1][0]) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const t = (value - lo[0]) / Math.max(hi[0] - lo[0], 1e-6);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
};

const PlayerHeatmapViewer: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Team A", awayTeam = "Team B" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [teamId, setTeamId] = useState<0 | 1>(0);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeatmap = async (team: 0 | 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5001/api/v1/football-analytics/heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: team, px_per_meter: 4.0 }),
      });
      const data: HeatmapData = await res.json();
      setHeatmapData(data);
    } catch (e) {
      setError("Flask API not reachable — showing synthetic heatmap.");
      setHeatmapData(generateMockHeatmap(team));
    } finally {
      setLoading(false);
    }
  };

  const generateMockHeatmap = (team: 0 | 1): HeatmapData => {
    const rows = 68, cols = 105;
    const grid: number[][] = [];
    // Team 0 concentrates on right half, team 1 on left
    const cx = team === 0 ? 75 : 30, cy = 34;
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        const dist = Math.hypot(c - cx, r - cy);
        const val = Math.max(0, 1 - dist / 45) * (0.6 + Math.random() * 0.4);
        row.push(Math.min(1, val));
      }
      grid.push(row);
    }
    return { status: "mock", source: "mock", team_id: team, grid_rows: rows, grid_cols: cols, grid, pitch_length_m: 105, pitch_width_m: 68, px_per_meter: 1 };
  };

  // Draw heatmap on canvas
  useEffect(() => {
    if (!heatmapData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { grid, grid_rows, grid_cols } = heatmapData;
    const cellW = canvas.width / grid_cols;
    const cellH = canvas.height / grid_rows;

    // Draw pitch background
    ctx.fillStyle = "#1a5c2a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stripes
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#1d6830" : "#1a5c2a";
      ctx.fillRect(i * (canvas.width / 10), 0, canvas.width / 10, canvas.height);
    }

    // Draw heatmap overlay
    for (let r = 0; r < grid_rows; r++) {
      for (let c = 0; c < grid_cols; c++) {
        const val = grid[r]?.[c] ?? 0;
        if (val < 0.05) continue;
        ctx.globalAlpha = val * 0.75;
        ctx.fillStyle = heatColor(val);
        ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH));
      }
    }
    ctx.globalAlpha = 1;

    // Draw pitch markings
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1.5;

    // Outer border
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 2);
    ctx.lineTo(canvas.width / 2, canvas.height - 2);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height * 0.15, 0, Math.PI * 2);
    ctx.stroke();

    // Penalty areas
    const paW = canvas.width * 0.15;
    const paH = canvas.height * 0.55;
    const paY = (canvas.height - paH) / 2;
    ctx.strokeRect(2, paY, paW, paH);
    ctx.strokeRect(canvas.width - 2 - paW, paY, paW, paH);

    // Goals
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    const gH = canvas.height * 0.18;
    const gY = (canvas.height - gH) / 2;
    ctx.strokeRect(0, gY, 8, gH);
    ctx.strokeRect(canvas.width - 8, gY, 8, gH);
  }, [heatmapData]);

  useEffect(() => {
    fetchHeatmap(teamId);
  }, [teamId]);

  return (
    <div
      id="player-heatmap-viewer"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #0c1a14 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(34,197,94,0.2)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 14px",
          background: "rgba(34,197,94,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🔥</span> Player Heatmap
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            Gaussian positional density · AI Football Analytics Engine
          </p>
        </div>
        <button
          id="heatmap-refresh-btn"
          onClick={() => fetchHeatmap(teamId)}
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#4ade80",
            borderRadius: "8px",
            padding: "5px 12px",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "⏳" : "🔄"} Refresh
        </button>
      </div>

      {/* Team toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {([0, 1] as const).map((tid) => (
          <button
            key={tid}
            id={`heatmap-team-btn-${tid}`}
            onClick={() => setTeamId(tid)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              background: teamId === tid ? (tid === 0 ? "rgba(59,130,246,0.12)" : "rgba(139,92,246,0.12)") : "transparent",
              color: teamId === tid ? (tid === 0 ? "#60a5fa" : "#a78bfa") : "#64748b",
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
              borderBottom: teamId === tid ? `2px solid ${tid === 0 ? "#3b82f6" : "#7c3aed"}` : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tid === 0 ? `🔵 ${homeTeam}` : `🟣 ${awayTeam}`}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ padding: "16px 24px" }}>
        <div
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
          }}
        >
          <canvas
            ref={canvasRef}
            width={420}
            height={272}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4ade80",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              ⏳ Computing heatmap...
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
          <span style={{ color: "#64748b", fontSize: "0.7rem" }}>Low</span>
          <div
            style={{
              flex: 1,
              height: "8px",
              borderRadius: "4px",
              background: "linear-gradient(90deg, rgb(0,0,80), rgb(0,80,200), rgb(0,180,180), rgb(50,220,50), rgb(220,200,0), rgb(255,40,0))",
            }}
          />
          <span style={{ color: "#64748b", fontSize: "0.7rem" }}>High</span>
        </div>

        {error && (
          <p style={{ color: "#f59e0b", fontSize: "0.72rem", marginTop: "8px" }}>
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerHeatmapViewer;
