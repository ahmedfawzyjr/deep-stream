"use client";

import React, { useState, useEffect } from "react";

interface PlayerEntry {
  player_id: number;
  team_id: number;
  team_name: string;
  possession_frames: number;
  possession_pct_of_team: number;
  jersey_color_rgb: number[];
}

interface BreakdownData {
  status: string;
  source: string;
  home_team: string;
  away_team: string;
  players: PlayerEntry[];
}

const rgb = (arr: number[]) => `rgb(${arr[0]},${arr[1]},${arr[2]})`;

const PlayerPossessionBreakdown: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Argentina", awayTeam = "France" }) => {
  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);
  const [sortBy, setSortBy] = useState<"frames" | "id">("frames");

  const fetchBreakdown = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/v1/possession-analytics/player-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam, n_frames: 600 }),
      });
      const d: BreakdownData = await res.json();
      setData(d);
    } catch {
      // Generate mock data
      const players: PlayerEntry[] = [];
      for (let team = 0; team < 2; team++) {
        const color = team === 0 ? [59, 130, 246] : [239, 68, 68];
        const totalFrames = team === 0 ? 367 : 233;
        let remaining = totalFrames;
        for (let i = 1; i <= 11; i++) {
          const pid = team * 11 + i;
          const frames = i === 1
            ? Math.round(totalFrames * 0.05)
            : Math.round(remaining * (Math.random() * 0.3 + 0.05));
          remaining -= frames;
          players.push({
            player_id: pid,
            team_id: team,
            team_name: team === 0 ? homeTeam : awayTeam,
            possession_frames: Math.max(0, frames),
            possession_pct_of_team: Math.max(0, Math.round((frames / totalFrames) * 100 * 10) / 10),
            jersey_color_rgb: color,
          });
        }
      }
      setData({ status: "mock", source: "mock", home_team: homeTeam, away_team: awayTeam, players });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, [homeTeam, awayTeam]);

  const teamPlayers = (data?.players || [])
    .filter((p) => p.team_id === activeTeam)
    .sort((a, b) => sortBy === "frames" ? b.possession_frames - a.possession_frames : a.player_id - b.player_id);

  const maxFrames = Math.max(...teamPlayers.map((p) => p.possession_frames), 1);
  const totalTeamFrames = teamPlayers.reduce((sum, p) => sum + p.possession_frames, 0);
  const teamColor = activeTeam === 0 ? "#3b82f6" : "#ef4444";

  const exportCSV = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/v1/possession-analytics/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam, n_frames: 600 }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `possession_${homeTeam}_vs_${awayTeam}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("CSV export not available (Flask API not running)");
    }
  };

  return (
    <div
      id="player-possession-breakdown"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #0c1a14 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(34,197,94,0.18)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 14px",
          background: "rgba(34,197,94,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚽</span> Player Possession Breakdown
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            Per-player possession frame counts · proximity-based tracking
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            id="possession-csv-export-btn"
            onClick={exportCSV}
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#4ade80",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📥 CSV
          </button>
          <button
            id="possession-breakdown-refresh-btn"
            onClick={fetchBreakdown}
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#4ade80",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "⏳" : "🔄"}
          </button>
        </div>
      </div>

      {/* Team + Sort controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex" }}>
          {[0, 1].map((tid) => {
            const tColor = tid === 0 ? "#3b82f6" : "#ef4444";
            return (
              <button
                key={tid}
                id={`breakdown-team-btn-${tid}`}
                onClick={() => setActiveTeam(tid as 0 | 1)}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  background: activeTeam === tid ? `${tColor}14` : "transparent",
                  color: activeTeam === tid ? tColor : "#64748b",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  borderBottom: activeTeam === tid ? `2px solid ${tColor}` : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {tid === 0 ? `🔵 ${homeTeam}` : `🔴 ${awayTeam}`}
              </button>
            );
          })}
        </div>
        <div style={{ paddingRight: "16px", display: "flex", gap: "6px" }}>
          {(["frames", "id"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                border: "none",
                background: sortBy === s ? "rgba(255,255,255,0.1)" : "transparent",
                color: sortBy === s ? "#f1f5f9" : "#64748b",
                fontSize: "0.68rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s === "frames" ? "Sort by Possession" : "Sort by #"}
            </button>
          ))}
        </div>
      </div>

      {/* Player list */}
      <div style={{ padding: "14px 24px 20px", display: "flex", flexDirection: "column", gap: "7px" }}>
        {/* Team total */}
        <div
          style={{
            padding: "8px 12px",
            background: `${teamColor}0c`,
            borderRadius: "8px",
            border: `1px solid ${teamColor}22`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Team Total</span>
          <span style={{ color: teamColor, fontWeight: 700, fontSize: "0.85rem" }}>
            {totalTeamFrames} frames
          </span>
        </div>

        {teamPlayers.slice(0, 11).map((p, rank) => {
          const barPct = (p.possession_frames / maxFrames) * 100;
          const isTop3 = rank < 3;
          const color = rgb(p.jersey_color_rgb);

          return (
            <div
              key={p.player_id}
              style={{
                padding: "8px 12px",
                background: isTop3 ? `${color.replace("rgb", "rgba").replace(")", ", 0.06)")}` : "rgba(255,255,255,0.02)",
                borderRadius: "8px",
                border: `1px solid ${isTop3 ? `${color.replace("rgb", "rgba").replace(")", ", 0.2)")}` : "rgba(255,255,255,0.05)"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Rank badge */}
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: isTop3 ? color : "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      color: isTop3 ? "#fff" : "#64748b",
                      flexShrink: 0,
                    }}
                  >
                    {rank + 1}
                  </span>
                  <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.82rem" }}>
                    {p.team_id === 0 ? (p.player_id <= 1 ? "GK" : `#${p.player_id}`) : (p.player_id === 12 ? "GK" : `#${p.player_id - 11}`)}
                    {" "}
                    <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.72rem" }}>Player {p.player_id}</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{p.possession_frames} frames</span>
                  <span style={{ color: color, fontWeight: 700, fontSize: "0.78rem", minWidth: "42px", textAlign: "right" }}>
                    {p.possession_pct_of_team.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barPct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${color}, ${color.replace("rgb", "rgba").replace(")", ", 0.6)")})`,
                    borderRadius: "2px",
                    transition: "width 1s cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerPossessionBreakdown;
