"use client";

import React, { useState, useEffect } from "react";

interface TacticalTeam {
  team_id: number;
  compactness: string;
  team_shape: string;
  attacking_zone: string;
  transition_speed: string;
  build_up_style: string;
  pressure_style: string;
  metrics: Record<string, number>;
  reasons: Record<string, string>;
}

interface TacticalData {
  status: string;
  source: string;
  teams: TacticalTeam[];
}

const LABEL_ICONS: Record<string, string> = {
  "High Press": "⬆️",
  "Mid Block": "↔️",
  "Low Block": "⬇️",
  "Short Passing Style": "🔁",
  "Direct Style": "➡️",
  Mixed: "🔀",
  Compact: "🟢",
  Wide: "🔵",
  Balanced: "⚡",
  Left: "⬅️",
  Center: "⊙",
  Right: "➡️",
  Fast: "🚀",
  Medium: "🏃",
  Slow: "🐢",
  Attacking: "⚔️",
  Defensive: "🛡️",
};

const LABEL_COLORS: Record<string, string> = {
  "High Press": "#ef4444",
  "Mid Block": "#f59e0b",
  "Low Block": "#22c55e",
  "Short Passing Style": "#3b82f6",
  "Direct Style": "#f97316",
  Mixed: "#8b5cf6",
  Compact: "#22c55e",
  Wide: "#3b82f6",
  Balanced: "#f59e0b",
  Fast: "#22c55e",
  Medium: "#f59e0b",
  Slow: "#ef4444",
};

const MetricBar: React.FC<{ label: string; value: number; max: number; unit?: string; color: string }> = ({
  label, value, max, unit = "", color,
}) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{label}</span>
      <span style={{ color: "#f1f5f9", fontSize: "0.7rem", fontWeight: 600 }}>
        {value.toFixed(1)}{unit}
      </span>
    </div>
    <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: "2px",
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  </div>
);

const TacticalCard: React.FC<{ team: TacticalTeam; teamName: string }> = ({ team, teamName }) => {
  const [expanded, setExpanded] = useState(false);
  const tc = team.team_id === 0 ? "#3b82f6" : "#7c3aed";

  const badges = [
    { key: "pressure_style", label: team.pressure_style, icon: LABEL_ICONS[team.pressure_style] || "🔵" },
    { key: "build_up_style", label: team.build_up_style, icon: LABEL_ICONS[team.build_up_style] || "⚽" },
    { key: "compactness", label: team.compactness, icon: LABEL_ICONS[team.compactness] || "📐" },
    { key: "transition_speed", label: `${team.transition_speed} Trans.`, icon: LABEL_ICONS[team.transition_speed] || "🏃" },
    { key: "attacking_zone", label: `${team.attacking_zone} Zone`, icon: "🎯" },
  ];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(${team.team_id === 0 ? "59,130,246" : "139,92,246"},0.08) 0%, rgba(15,23,42,0.9) 100%)`,
        border: `1px solid rgba(${team.team_id === 0 ? "59,130,246" : "139,92,246"},0.25)`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: `${tc}22`,
              border: `1px solid ${tc}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            {team.team_id === 0 ? "🔵" : "🟣"}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.9rem" }}>{teamName}</div>
            <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
              Team {team.team_id} · {team.pressure_style}
            </div>
          </div>
        </div>
        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Badge row */}
      <div style={{ padding: "0 16px 14px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {badges.map((b) => (
          <span
            key={b.key}
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              background: `${LABEL_COLORS[b.label.split(" ")[0]] || "#64748b"}18`,
              color: LABEL_COLORS[b.label.split(" ")[0]] || "#94a3b8",
              border: `1px solid ${LABEL_COLORS[b.label.split(" ")[0]] || "#64748b"}33`,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>

      {/* Expanded metrics */}
      {expanded && (
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {team.metrics.compactness_m !== undefined && (
            <MetricBar label="Compactness" value={team.metrics.compactness_m} max={35} unit="m" color={tc} />
          )}
          {team.metrics.avg_speed_kmh !== undefined && (
            <MetricBar label="Avg Team Speed" value={team.metrics.avg_speed_kmh} max={15} unit="km/h" color="#22c55e" />
          )}
          {team.metrics.width_m !== undefined && (
            <MetricBar label="Lateral Width" value={team.metrics.width_m} max={40} unit="m" color="#f59e0b" />
          )}
          {team.metrics.block_height_m !== undefined && (
            <MetricBar label="Block Height" value={team.metrics.block_height_m} max={105} unit="m" color="#8b5cf6" />
          )}

          {/* Reasons */}
          {Object.entries(team.reasons).length > 0 && (
            <div style={{ marginTop: "4px" }}>
              <div style={{ color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                Why these labels?
              </div>
              {Object.entries(team.reasons).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ color: tc, fontSize: "0.7rem", flexShrink: 0 }}>→</span>
                  <span style={{ color: "#94a3b8", fontSize: "0.7rem", lineHeight: 1.4 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TacticalProfileCard: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Team A", awayTeam = "Team B" }) => {
  const [data, setData] = useState<TacticalData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTactical = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/v1/football-analytics/tactical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d: TacticalData = await res.json();
      setData(d);
    } catch {
      setData({
        status: "mock",
        source: "mock",
        teams: [
          {
            team_id: 0,
            compactness: "Compact",
            team_shape: "Balanced",
            attacking_zone: "Center",
            transition_speed: "Fast",
            build_up_style: "Short Passing Style",
            pressure_style: "High Press",
            metrics: { compactness_m: 14.2, avg_speed_kmh: 10.1, width_m: 16.5, block_height_m: 62.0 },
            reasons: {
              compactness: "players average 14.2 m from the team centroid",
              pressure_style: "defensive block ~62 m up from its own goal",
              build_up_style: "compact 16.5 m vertical block, patient transitions",
            },
          },
          {
            team_id: 1,
            compactness: "Balanced",
            team_shape: "Wide",
            attacking_zone: "Right",
            transition_speed: "Medium",
            build_up_style: "Direct Style",
            pressure_style: "Mid Block",
            metrics: { compactness_m: 20.1, avg_speed_kmh: 8.8, width_m: 22.3, block_height_m: 45.0 },
            reasons: {
              compactness: "players average 20.1 m from the team centroid",
              pressure_style: "defensive block ~45 m up from its own goal",
              build_up_style: "stretched 22.3 m vertically with medium transitions",
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTactical();
  }, []);

  const teamNames = [homeTeam, awayTeam];

  return (
    <div
      id="tactical-profile-card"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1c1130 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(139,92,246,0.18)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 14px",
          background: "rgba(139,92,246,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🗺️</span> Tactical Profile Analysis
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            Compactness · Pressure · Build-up · Transition — AI Football Analytics
          </p>
        </div>
        <button
          id="tactical-refresh-btn"
          onClick={fetchTactical}
          style={{
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "#a78bfa",
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

      <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {(data?.teams || []).map((team) => (
          <TacticalCard
            key={team.team_id}
            team={team}
            teamName={teamNames[team.team_id] || `Team ${team.team_id}`}
          />
        ))}

        {!data && loading && (
          <div style={{ textAlign: "center", color: "#64748b", padding: "30px", fontSize: "0.85rem" }}>
            ⏳ Loading tactical profiles...
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalProfileCard;
