"use client";

import React, { useState, useEffect } from "react";

interface MatchReportData {
  status: string;
  source: string;
  home_team_name: string;
  away_team_name: string;
  summary: string;
  dominant_team: string | null;
  man_of_the_match: number | null;
  man_of_the_match_display_name: string | null;
  weakest_player: number | null;
  weakest_player_display_name: string | null;
  teams: Array<{
    team_id: number;
    style: string;
    pressure: string;
    compactness: string;
    transition_speed: string;
  }>;
  key_insights: string[];
  recommendations: string[];
  players: Array<{
    track_id: number;
    team_id: number;
    player_display_name: string;
    player_rating: number;
    work_rate: string;
    fatigue: string;
    impact: string;
    insight: string;
  }>;
}

const BADGE_COLORS: Record<string, string> = {
  High: "#22c55e",
  Medium: "#f59e0b",
  Low: "#ef4444",
  Excellent: "#7c3aed",
  Good: "#2563eb",
  Average: "#6b7280",
  Poor: "#dc2626",
  Compact: "#22c55e",
  Wide: "#f59e0b",
  Balanced: "#3b82f6",
  Attacking: "#ef4444",
  Defensive: "#2563eb",
  "Counter-Attacking": "#f97316",
  Possession: "#8b5cf6",
  "High Press": "#dc2626",
  "Mid Block": "#f59e0b",
  "Low Block": "#22c55e",
  Fast: "#22c55e",
  Slow: "#f59e0b",
};

const Badge: React.FC<{ label: string }> = ({ label }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      background: (BADGE_COLORS[label] || "#64748b") + "22",
      color: BADGE_COLORS[label] || "#64748b",
      border: `1px solid ${BADGE_COLORS[label] || "#64748b"}55`,
    }}
  >
    {label}
  </span>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const pct = (rating / 10) * 100;
  const color =
    rating >= 8 ? "#22c55e" : rating >= 6 ? "#f59e0b" : rating >= 4 ? "#3b82f6" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "6px",
          borderRadius: "3px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            borderRadius: "3px",
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: "0.85rem", minWidth: "32px" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const MatchReportPanel: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Team A", awayTeam = "Team B" }) => {
  const [report, setReport] = useState<MatchReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "players" | "tactics">("summary");

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5001/api/v1/football-analytics/match-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam }),
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      setError("Failed to load match report. Make sure the Flask API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [homeTeam, awayTeam]);

  return (
    <div
      id="match-report-panel"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(139,92,246,0.2)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          background: "linear-gradient(90deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))",
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
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📋</span>
            AI Match Report
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
            {homeTeam} vs {awayTeam} · Powered by AI Football Analytics Engine
          </p>
        </div>
        <button
          id="match-report-refresh-btn"
          onClick={fetchReport}
          style={{
            background: "rgba(139,92,246,0.2)",
            border: "1px solid rgba(139,92,246,0.4)",
            color: "#a78bfa",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            margin: "16px 24px",
            padding: "12px 16px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "8px",
            color: "#fca5a5",
            fontSize: "0.8rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {report && (
        <>
          {/* Possession bar */}
          <div style={{ padding: "16px 24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.8rem" }}>
                {homeTeam}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>POSSESSION</span>
              <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.8rem" }}>
                {awayTeam}
              </span>
            </div>
            <div
              style={{
                height: "8px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: "58%",
                  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                  borderRadius: "4px 0 0 4px",
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}
            >
              <span style={{ color: "#60a5fa", fontSize: "0.75rem" }}>58%</span>
              <span style={{ color: "#a78bfa", fontSize: "0.75rem" }}>42%</span>
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              margin: "16px 24px",
              padding: "14px 16px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.82rem", lineHeight: 1.6 }}>
              {report.summary}
            </p>
          </div>

          {/* MOtM + Weakest */}
          <div style={{ padding: "0 24px", display: "flex", gap: "12px" }}>
            <div
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>🏆</div>
              <div style={{ color: "#86efac", fontSize: "0.7rem", fontWeight: 600 }}>MAN OF THE MATCH</div>
              <div style={{ color: "#f0fdf4", fontWeight: 700, fontSize: "0.9rem", marginTop: "4px" }}>
                {report.man_of_the_match_display_name || `Player ${report.man_of_the_match}`}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>📉</div>
              <div style={{ color: "#fca5a5", fontSize: "0.7rem", fontWeight: 600 }}>NEEDS IMPROVEMENT</div>
              <div style={{ color: "#fff1f2", fontWeight: 700, fontSize: "0.9rem", marginTop: "4px" }}>
                {report.weakest_player_display_name || `Player ${report.weakest_player}`}
              </div>
            </div>
          </div>

          {/* Tab Nav */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              padding: "16px 24px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["summary", "players", "tactics"] as const).map((tab) => (
              <button
                key={tab}
                id={`match-report-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background:
                    activeTab === tab
                      ? "rgba(139,92,246,0.2)"
                      : "transparent",
                  color: activeTab === tab ? "#a78bfa" : "#64748b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  borderBottom: activeTab === tab ? "2px solid #7c3aed" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {tab === "summary" ? "💡 Insights" : tab === "players" ? "👤 Players" : "🗺️ Tactics"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "16px 24px 20px" }}>
            {activeTab === "summary" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h4 style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Key Insights</h4>
                {report.key_insights.map((insight, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(59,130,246,0.07)",
                      border: "1px solid rgba(59,130,246,0.15)",
                      borderRadius: "8px",
                      color: "#cbd5e1",
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#60a5fa", flexShrink: 0 }}>→</span>
                    {insight}
                  </div>
                ))}
                <h4 style={{ margin: "12px 0 8px", color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recommendations</h4>
                {report.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.15)",
                      borderRadius: "8px",
                      color: "#cbd5e1",
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#f59e0b", flexShrink: 0 }}>💡</span>
                    {rec}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "players" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(report.players.length > 0 ? report.players.slice(0, 8) : [
                  { track_id: 7, team_id: 0, player_display_name: "Player 7", player_rating: 9.5, work_rate: "High", fatigue: "Low", impact: "High", insight: "Very active. Covered a lot of ground." },
                  { track_id: 10, team_id: 0, player_display_name: "Player 10", player_rating: 8.2, work_rate: "High", fatigue: "Medium", impact: "High", insight: "Steady involvement across the match." },
                  { track_id: 3, team_id: 1, player_display_name: "Player 3", player_rating: 7.1, work_rate: "Medium", fatigue: "Low", impact: "Medium", insight: "Maintained high intensity throughout." },
                ]).map((p) => (
                  <div
                    key={p.track_id}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.85rem" }}>
                          {p.player_display_name}
                        </span>
                        <Badge label={`Team ${p.team_id}`} />
                        <Badge label={p.work_rate} />
                      </div>
                      <Badge label={p.fatigue === "High" ? "Fatigued" : p.fatigue === "Low" ? "Fresh" : "Tired"} />
                    </div>
                    <StarRating rating={p.player_rating} />
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", lineHeight: 1.4 }}>{p.insight}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tactics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {report.teams.map((team) => (
                  <div
                    key={team.team_id}
                    style={{
                      padding: "14px",
                      background: `rgba(${team.team_id === 0 ? "59,130,246" : "139,92,246"},0.07)`,
                      border: `1px solid rgba(${team.team_id === 0 ? "59,130,246" : "139,92,246"},0.2)`,
                      borderRadius: "10px",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#f8fafc", marginBottom: "10px", fontSize: "0.9rem" }}>
                      {team.team_id === 0 ? homeTeam : awayTeam}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <Badge label={team.style} />
                      <Badge label={team.pressure} />
                      <Badge label={team.compactness} />
                      <Badge label={`${team.transition_speed} Transitions`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {loading && !report && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏳</div>
          Generating AI Match Report...
        </div>
      )}
    </div>
  );
};

export default MatchReportPanel;
