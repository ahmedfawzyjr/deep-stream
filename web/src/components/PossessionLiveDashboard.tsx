"use client";

import React, { useState, useEffect } from "react";

interface PossessionWindow {
  window_start_frame: number;
  window_end_frame: number;
  home_pct: number;
  away_pct: number;
  loose_pct: number;
}

interface PossessionSummary {
  status: string;
  source: string;
  home_team: string;
  away_team: string;
  total_frames_analyzed: number;
  possessed_frames: number;
  loose_ball_frames: number;
  home_possession_pct: number;
  away_possession_pct: number;
  loose_ball_pct: number;
  dominant_team: string;
  dominant_team_id: number;
  team_colors: {
    home_rgb: number[];
    away_rgb: number[];
  };
  clustering_method: string;
}

interface PossessionTrend {
  status: string;
  home_team: string;
  away_team: string;
  window_size_frames: number;
  total_frames: number;
  windows: PossessionWindow[];
}

const rgb = (arr: number[]) => `rgb(${arr[0]},${arr[1]},${arr[2]})`;

// Simple sparkline-style bar chart using SVG
const TrendChart: React.FC<{
  windows: PossessionWindow[];
  homeColor: string;
  awayColor: string;
  homeTeam: string;
  awayTeam: string;
}> = ({ windows, homeColor, awayColor, homeTeam, awayTeam }) => {
  const W = 420;
  const H = 100;
  const n = windows.length;
  const barW = Math.max(2, (W - 2) / n - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", borderRadius: "6px", overflow: "visible" }}
    >
      {/* grid lines */}
      {[0, 25, 50, 75, 100].map((v) => (
        <line
          key={v}
          x1={0} y1={H - (v / 100) * H}
          x2={W} y2={H - (v / 100) * H}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={0.8}
        />
      ))}

      {/* Home bars */}
      {windows.map((w, i) => {
        const h = (w.home_pct / 100) * H;
        return (
          <rect
            key={`h-${i}`}
            x={i * (barW + 1)}
            y={H - h}
            width={barW}
            height={h}
            fill={homeColor}
            opacity={0.65}
            rx={1}
          />
        );
      })}

      {/* Away bars (stacked above home) */}
      {windows.map((w, i) => {
        const homeH = (w.home_pct / 100) * H;
        const awayH = (w.away_pct / 100) * H;
        return (
          <rect
            key={`a-${i}`}
            x={i * (barW + 1)}
            y={H - homeH - awayH}
            width={barW}
            height={awayH}
            fill={awayColor}
            opacity={0.55}
            rx={1}
          />
        );
      })}

      {/* 50% reference line */}
      <line
        x1={0} y1={H / 2}
        x2={W} y2={H / 2}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1}
        strokeDasharray="4,3"
      />
    </svg>
  );
};

const PossessionLiveDashboard: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Argentina", awayTeam = "France" }) => {
  const [summary, setSummary] = useState<PossessionSummary | null>(null);
  const [trend, setTrend] = useState<PossessionTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distThreshold, setDistThreshold] = useState(80);
  const [showPulse, setShowPulse] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, trendRes] = await Promise.all([
        fetch("http://localhost:5001/api/v1/possession-analytics/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            home_team: homeTeam,
            away_team: awayTeam,
            n_frames: 600,
            dist_threshold: distThreshold,
          }),
        }),
        fetch("http://localhost:5001/api/v1/possession-analytics/trend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam, n_frames: 600, window_size: 50 }),
        }),
      ]);
      const [s, t] = await Promise.all([sumRes.json(), trendRes.json()]);
      setSummary(s);
      setTrend(t);
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1200);
    } catch {
      // Fallback to inline mock
      const mockSummary: PossessionSummary = {
        status: "mock", source: "mock",
        home_team: homeTeam, away_team: awayTeam,
        total_frames_analyzed: 600, possessed_frames: 540, loose_ball_frames: 60,
        home_possession_pct: 61.2, away_possession_pct: 38.8, loose_ball_pct: 10.0,
        dominant_team: homeTeam, dominant_team_id: 0,
        team_colors: { home_rgb: [59, 130, 246], away_rgb: [239, 68, 68] },
        clustering_method: "GMM_CIELAB",
      };
      setSummary(mockSummary);
      // Generate mock windows
      const windows: PossessionWindow[] = Array.from({ length: 12 }, (_, i) => ({
        window_start_frame: i * 50,
        window_end_frame: (i + 1) * 50 - 1,
        home_pct: 45 + Math.sin(i * 0.8) * 18,
        away_pct: 100 - (45 + Math.sin(i * 0.8) * 18),
        loose_pct: 8,
      }));
      setTrend({ status: "mock", home_team: homeTeam, away_team: awayTeam, window_size_frames: 50, total_frames: 600, windows });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [homeTeam, awayTeam]);

  const homeColor = summary ? rgb(summary.team_colors.home_rgb) : "#3b82f6";
  const awayColor = summary ? rgb(summary.team_colors.away_rgb) : "#ef4444";

  const homePct = summary?.home_possession_pct ?? 0;
  const awayPct = summary?.away_possession_pct ?? 0;
  const loosePct = summary?.loose_ball_pct ?? 0;

  return (
    <div
      id="possession-live-dashboard"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #0c1226 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(59,130,246,0.2)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 14px",
          background: "linear-gradient(90deg, rgba(59,130,246,0.1), rgba(239,68,68,0.07))",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: showPulse ? "0 0 12px #22c55e" : "none",
                transition: "box-shadow 0.4s",
              }}
            />
            Live Possession Tracker
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            YOLOv8 + GMM Team Clustering · Football Possession Analytics Engine
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div>
            <label style={{ color: "#64748b", fontSize: "0.65rem", display: "block", marginBottom: "2px" }}>Dist threshold (px)</label>
            <input
              id="possession-dist-threshold"
              type="range"
              min={30} max={150} value={distThreshold}
              onChange={(e) => setDistThreshold(Number(e.target.value))}
              style={{ width: "80px", accentColor: "#3b82f6" }}
            />
            <span style={{ color: "#60a5fa", fontSize: "0.65rem", marginLeft: "4px" }}>{distThreshold}px</span>
          </div>
          <button
            id="possession-refresh-btn"
            onClick={fetchAll}
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "#60a5fa",
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
      </div>

      {/* Broadcast-style scoreboard bar */}
      <div
        style={{
          padding: "16px 24px 0",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "0",
          }}
        >
          {/* Home */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            <div
              style={{
                width: "14px",
                height: "34px",
                borderRadius: "3px",
                background: homeColor,
                boxShadow: `0 0 8px ${homeColor}88`,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: "0.9rem" }}>{homeTeam.toUpperCase()}</div>
              <div style={{ color: homeColor, fontWeight: 700, fontSize: "1.3rem", lineHeight: 1 }}>{homePct.toFixed(1)}%</div>
            </div>
          </div>

          {/* Center bar */}
          <div style={{ flex: 2, padding: "0 12px" }}>
            <div
              style={{
                height: "10px",
                borderRadius: "5px",
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: `${homePct}%`,
                  background: `linear-gradient(90deg, ${homeColor}, ${homeColor}bb)`,
                  transition: "width 1s cubic-bezier(.4,0,.2,1)",
                  borderRadius: "5px 0 0 5px",
                }}
              />
              <div
                style={{
                  width: `${awayPct}%`,
                  background: `linear-gradient(90deg, ${awayColor}bb, ${awayColor})`,
                  transition: "width 1s cubic-bezier(.4,0,.2,1)",
                  borderRadius: "0 5px 5px 0",
                }}
              />
            </div>
            <div style={{ textAlign: "center", marginTop: "4px" }}>
              <span style={{ color: "#64748b", fontSize: "0.65rem" }}>
                ⚽ Loose Ball {loosePct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Away */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: "0.9rem" }}>{awayTeam.toUpperCase()}</div>
              <div style={{ color: awayColor, fontWeight: 700, fontSize: "1.3rem", lineHeight: 1 }}>{awayPct.toFixed(1)}%</div>
            </div>
            <div
              style={{
                width: "14px",
                height: "34px",
                borderRadius: "3px",
                background: awayColor,
                boxShadow: `0 0 8px ${awayColor}88`,
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Dominant team badge */}
      {summary && (
        <div style={{ padding: "12px 24px 0", display: "flex", justifyContent: "center" }}>
          <span
            style={{
              padding: "4px 16px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              background:
                summary.dominant_team_id === 0
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(239,68,68,0.15)",
              color: summary.dominant_team_id === 0 ? "#60a5fa" : "#f87171",
              border: `1px solid ${summary.dominant_team_id === 0 ? "rgba(59,130,246,0.35)" : "rgba(239,68,68,0.35)"}`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            👑 {summary.dominant_team} dominating · {summary.possessed_frames}/{summary.total_frames_analyzed} frames tracked
          </span>
        </div>
      )}

      {/* Time-series chart */}
      {trend && trend.windows.length > 0 && (
        <div style={{ padding: "16px 24px" }}>
          <div
            style={{
              color: "#64748b",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Possession Over Time (per {trend.window_size_frames} frames)
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "8px",
              padding: "10px 8px 6px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <TrendChart
              windows={trend.windows}
              homeColor={homeColor}
              awayColor={awayColor}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: homeColor, opacity: 0.75 }} />
                <span style={{ color: "#94a3b8", fontSize: "0.68rem" }}>{homeTeam}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: awayColor, opacity: 0.65 }} />
                <span style={{ color: "#94a3b8", fontSize: "0.68rem" }}>{awayTeam}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      {summary && (
        <div
          style={{
            padding: "0 24px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {[
            { label: "Total Frames", value: summary.total_frames_analyzed.toLocaleString(), icon: "📹" },
            { label: "Method", value: summary.clustering_method.replace("_", " "), icon: "🧬" },
            { label: "Loose Ball", value: `${summary.loose_ball_frames} frames`, icon: "⚽" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: "1rem", marginBottom: "2px" }}>{s.icon}</div>
              <div style={{ color: "#64748b", fontSize: "0.65rem" }}>{s.label}</div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.8rem" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PossessionLiveDashboard;
