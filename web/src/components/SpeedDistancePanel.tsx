"use client";

import React, { useState, useEffect, useRef } from "react";

interface PossessionData {
  status: string;
  source: string;
  team_0_possession: number;
  team_1_possession: number;
  dominant_team: number | null;
  possessed_frames: number;
  total_frames: number;
}

interface PlayerPerfData {
  status: string;
  source: string;
  players: Array<{
    track_id: number;
    team_id: number;
    role: string;
    player_display_name: string;
    total_distance_m: number;
    avg_speed_kmh: number;
    max_speed_kmh: number;
    work_rate: string;
    activity_level: string;
    fatigue_level: string;
    performance_status: string;
    player_rating: number;
    insight: string;
  }>;
}

const SpeedDistancePanel: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Team A", awayTeam = "Team B" }) => {
  const [possession, setPossession] = useState<PossessionData | null>(null);
  const [perfData, setPerfData] = useState<PlayerPerfData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [possRes, perfRes] = await Promise.all([
        fetch("http://localhost:5001/api/v1/football-analytics/possession", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
        fetch("http://localhost:5001/api/v1/football-analytics/player-performance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      ]);
      const [possData, pData] = await Promise.all([possRes.json(), perfRes.json()]);
      setPossession(possData);
      setPerfData(pData);
    } catch {
      // Use mock data on error
      setPossession({
        status: "mock",
        source: "mock",
        team_0_possession: 58.3,
        team_1_possession: 41.7,
        dominant_team: 0,
        possessed_frames: 4800,
        total_frames: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredPlayers = (perfData?.players || [])
    .filter((p) => p.team_id === activeTeam)
    .slice(0, 8);

  const ratingColor = (r: number) =>
    r >= 8 ? "#22c55e" : r >= 6 ? "#f59e0b" : r >= 4 ? "#3b82f6" : "#ef4444";

  const teamColor = (id: number) => (id === 0 ? "#3b82f6" : "#7c3aed");

  return (
    <div
      id="speed-distance-panel"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 100%)",
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
          background: "rgba(59,130,246,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🏃</span> Player Performance & Possession
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            Speed · Distance · Rating · Fatigue — AI Football Analytics Engine
          </p>
        </div>
        <button
          id="speed-distance-refresh-btn"
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

      {/* Possession Arc */}
      {possession && (
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Team 0 */}
            <div style={{ textAlign: "right", flex: 1 }}>
              <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "1.4rem" }}>
                {possession.team_0_possession}%
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{homeTeam}</div>
            </div>

            {/* Donut visualization */}
            <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r="30"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="10"
                />
                <circle
                  cx="40" cy="40" r="30"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray={`${(possession.team_0_possession / 100) * 188.5} 188.5`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  lineHeight: 1,
                }}
              >
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>⚽</span>
              </div>
            </div>

            {/* Team 1 */}
            <div style={{ flex: 1 }}>
              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "1.4rem" }}>
                {possession.team_1_possession}%
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{awayTeam}</div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#64748b",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              {possession.possessed_frames} / {possession.total_frames} frames tracked
            </span>
          </div>
        </div>
      )}

      {/* Team selector */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {([0, 1] as const).map((tid) => (
          <button
            key={tid}
            id={`speed-team-btn-${tid}`}
            onClick={() => setActiveTeam(tid)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              background: activeTeam === tid ? `rgba(${tid === 0 ? "59,130,246" : "139,92,246"},0.12)` : "transparent",
              color: activeTeam === tid ? (tid === 0 ? "#60a5fa" : "#a78bfa") : "#64748b",
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
              borderBottom: activeTeam === tid ? `2px solid ${teamColor(tid)}` : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tid === 0 ? homeTeam : awayTeam}
          </button>
        ))}
      </div>

      {/* Player bars */}
      <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {(filteredPlayers.length > 0 ? filteredPlayers : [
          { track_id: 7, team_id: 0, role: "player", player_display_name: "Player 7", total_distance_m: 10820, avg_speed_kmh: 11.2, max_speed_kmh: 32.4, work_rate: "High", activity_level: "High", fatigue_level: "Low", performance_status: "Excellent", player_rating: 9.5, insight: "Very active." },
          { track_id: 10, team_id: 0, role: "player", player_display_name: "Player 10", total_distance_m: 9300, avg_speed_kmh: 9.8, max_speed_kmh: 28.1, work_rate: "High", activity_level: "Medium", fatigue_level: "Medium", performance_status: "Good", player_rating: 7.8, insight: "Steady." },
          { track_id: 1, team_id: 0, role: "goalkeeper", player_display_name: "Player 1", total_distance_m: 4200, avg_speed_kmh: 5.6, max_speed_kmh: 18.2, work_rate: "Low", activity_level: "Low", fatigue_level: "Low", performance_status: "Good", player_rating: 6.5, insight: "Commanded the box." },
        ]).map((p) => (
          <div
            key={p.track_id}
            style={{
              background: "rgba(255,255,255,0.025)",
              borderRadius: "10px",
              padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: `${teamColor(p.team_id)}22`,
                    border: `1px solid ${teamColor(p.team_id)}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    color: teamColor(p.team_id),
                    fontWeight: 700,
                  }}
                >
                  {p.role === "goalkeeper" ? "GK" : `#${p.track_id}`}
                </span>
                <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.85rem" }}>
                  {p.player_display_name}
                </span>
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: ratingColor(p.player_rating),
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {p.player_rating.toFixed(1)}
                <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 400 }}>/10</span>
              </span>
            </div>

            {/* Rating bar */}
            <div
              style={{
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.07)",
                marginBottom: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(p.player_rating / 10) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${ratingColor(p.player_rating)}, ${ratingColor(p.player_rating)}88)`,
                  borderRadius: "2px",
                  transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Distance</div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.8rem" }}>
                  {(p.total_distance_m / 1000).toFixed(2)}
                  <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 400 }}>km</span>
                </div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Speed</div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.8rem" }}>
                  {p.avg_speed_kmh.toFixed(1)}
                  <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 400 }}>km/h</span>
                </div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Top Speed</div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.8rem" }}>
                  {p.max_speed_kmh.toFixed(1)}
                  <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 400 }}>km/h</span>
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "4px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: "999px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    background: p.fatigue_level === "High" ? "rgba(239,68,68,0.15)" : p.fatigue_level === "Medium" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
                    color: p.fatigue_level === "High" ? "#ef4444" : p.fatigue_level === "Medium" ? "#f59e0b" : "#22c55e",
                    border: `1px solid ${p.fatigue_level === "High" ? "#ef444433" : p.fatigue_level === "Medium" ? "#f59e0b33" : "#22c55e33"}`,
                  }}
                >
                  {p.fatigue_level === "High" ? "⚠️" : p.fatigue_level === "Medium" ? "😤" : "💪"} {p.fatigue_level}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeedDistancePanel;
