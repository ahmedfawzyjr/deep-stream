"use client";

import React, { useState, useEffect } from "react";

interface ClusteringTeam {
  team_id: number;
  team_name: string;
  jersey_color_lab: number[];
  jersey_color_rgb: number[];
  jersey_color_hex: string;
  gmm_component_weight: number;
  detection_confidence_avg: number;
  samples_used: number;
}

interface ClusteringData {
  status: string;
  source: string;
  clustering_method: string;
  color_space: string;
  n_teams: number;
  torso_crop_region: string;
  grass_masking: string;
  teams: ClusteringTeam[];
  gmm_log_likelihood: number;
  fitting_frames_sampled: number;
  fitting_frame_step: number;
}

const GMMTeamClusterViewer: React.FC<{
  homeTeam?: string;
  awayTeam?: string;
}> = ({ homeTeam = "Argentina", awayTeam = "France" }) => {
  const [data, setData] = useState<ClusteringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);

  const fetchClustering = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/v1/possession-analytics/clustering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam }),
      });
      const d: ClusteringData = await res.json();
      setData(d);
    } catch {
      // Fallback mock
      setData({
        status: "mock", source: "mock",
        clustering_method: "Gaussian Mixture Model (GMM)",
        color_space: "CIELAB",
        n_teams: 2,
        torso_crop_region: "15%–65% height, 20%–80% width",
        grass_masking: "HSV (H:30–85, S:35–255, V:35–255)",
        teams: [
          {
            team_id: 0, team_name: homeTeam,
            jersey_color_lab: [55.2, -18.4, 32.1],
            jersey_color_rgb: [59, 130, 246],
            jersey_color_hex: "#3b82f6",
            gmm_component_weight: 0.512,
            detection_confidence_avg: 0.891,
            samples_used: 118,
          },
          {
            team_id: 1, team_name: awayTeam,
            jersey_color_lab: [48.7, 38.2, -12.5],
            jersey_color_rgb: [239, 68, 68],
            jersey_color_hex: "#ef4444",
            gmm_component_weight: 0.488,
            detection_confidence_avg: 0.876,
            samples_used: 106,
          },
        ],
        gmm_log_likelihood: -1043.7,
        fitting_frames_sampled: 180,
        fitting_frame_step: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClustering();
  }, [homeTeam, awayTeam]);

  const team = data?.teams?.[activeTeam];
  const otherTeam = data?.teams?.[1 - activeTeam];

  // SVG Gaussian curve visualization
  const GaussianCurve: React.FC<{ color: string; mean: number; weight: number }> = ({ color, mean, weight }) => {
    const pts: string[] = [];
    const W = 200, H = 60;
    for (let i = 0; i <= W; i++) {
      const x = (i / W) * 4 - 2;
      const y = weight * Math.exp(-0.5 * (x - (mean - 2)) ** 2) * 2;
      pts.push(`${i},${H - y * H * 0.9}`);
    }
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline points={pts.join(" ")} fill={`url(#grad-${color})`} stroke={color} strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div
      id="gmm-team-cluster-viewer"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #150e2a 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(168,85,247,0.2)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 14px",
          background: "rgba(168,85,247,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🧬</span> GMM Jersey Color Clustering
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            Gaussian Mixture Model · CIELAB Color Space · Auto Team Detection
          </p>
        </div>
        <button
          id="gmm-refresh-btn"
          onClick={fetchClustering}
          style={{
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.3)",
            color: "#c084fc",
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

      {/* Pipeline explanation cards */}
      {data && (
        <div style={{ padding: "14px 24px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { step: "1", label: "Torso Crop", value: data.torso_crop_region, icon: "✂️" },
            { step: "2", label: "Grass Masking", value: data.grass_masking, icon: "🌱" },
            { step: "3", label: "Color Space", value: data.color_space, icon: "🎨" },
            { step: "4", label: "Clustering", value: data.clustering_method, icon: "🔬" },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "#c084fc", flexShrink: 0 }}>{s.step}</span>
              <span style={{ fontSize: "1rem" }}>{s.icon}</span>
              <span style={{ color: "#64748b", fontSize: "0.7rem", minWidth: "90px" }}>{s.label}</span>
              <span style={{ color: "#cbd5e1", fontSize: "0.7rem", fontWeight: 600 }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Team selector */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", margin: "14px 0 0" }}>
        {data?.teams.map((t) => (
          <button
            key={t.team_id}
            id={`gmm-team-btn-${t.team_id}`}
            onClick={() => setActiveTeam(t.team_id as 0 | 1)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              background: activeTeam === t.team_id ? `${t.jersey_color_hex}18` : "transparent",
              color: activeTeam === t.team_id ? t.jersey_color_hex : "#64748b",
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
              borderBottom: activeTeam === t.team_id ? `2px solid ${t.jersey_color_hex}` : "2px solid transparent",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.jersey_color_hex }} />
            {t.team_name}
          </button>
        ))}
      </div>

      {/* Team detail */}
      {team && (
        <div style={{ padding: "16px 24px 20px" }}>
          {/* Color swatch + LAB */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: team.jersey_color_hex,
                boxShadow: `0 0 20px ${team.jersey_color_hex}66`,
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "1rem" }}>{team.team_name}</div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "2px" }}>
                HEX: <span style={{ color: team.jersey_color_hex, fontWeight: 700 }}>{team.jersey_color_hex}</span>
                {" · "}
                RGB: <span style={{ color: "#94a3b8" }}>{team.jersey_color_rgb.join(", ")}</span>
              </div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "1px" }}>
                CIELAB: <span style={{ color: "#94a3b8" }}>L={team.jersey_color_lab[0].toFixed(1)} a={team.jersey_color_lab[1].toFixed(1)} b={team.jersey_color_lab[2].toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Gaussian visualization */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              GMM Component Distribution
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "8px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
              <GaussianCurve color={team.jersey_color_hex} mean={1} weight={team.gmm_component_weight} />
              {otherTeam && (
                <div style={{ position: "absolute", top: 8, left: 0, right: 0 }}>
                  <GaussianCurve color={otherTeam.jersey_color_hex} mean={3} weight={otherTeam.gmm_component_weight} />
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { label: "GMM Weight", value: (team.gmm_component_weight * 100).toFixed(1) + "%", color: team.jersey_color_hex },
              { label: "Avg Confidence", value: (team.detection_confidence_avg * 100).toFixed(1) + "%", color: "#22c55e" },
              { label: "Jersey Samples", value: team.samples_used.toString(), color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#64748b", fontSize: "0.62rem" }}>{s.label}</div>
                <div style={{ color: s.color, fontWeight: 700, fontSize: "0.9rem", marginTop: "2px" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* GMM metadata */}
          {data && (
            <div style={{ marginTop: "10px", padding: "10px 12px", background: "rgba(168,85,247,0.06)", borderRadius: "8px", border: "1px solid rgba(168,85,247,0.12)" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                Log-likelihood: <span style={{ color: "#c084fc", fontWeight: 600 }}>{data.gmm_log_likelihood}</span>
                {" · "}
                Sampling: <span style={{ color: "#c084fc", fontWeight: 600 }}>{data.fitting_frames_sampled} frames</span> every <span style={{ color: "#c084fc", fontWeight: 600 }}>{data.fitting_frame_step}</span> frames
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GMMTeamClusterViewer;
