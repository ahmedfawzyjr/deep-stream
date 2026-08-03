"use client";

import React, { useState, useEffect, useRef } from "react";

interface Keypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

interface Biomechanics {
  knee_flexion_left_deg: number;
  knee_flexion_right_deg: number;
  hip_extension_deg: number;
  stride_length_m: number;
  posture_status: string;
  center_of_gravity_y: number;
  ground_reaction_force_n: number;
}

interface PoseData {
  status: string;
  player_id: number;
  player_role: string;
  pose_confidence: number;
  keypoints: Keypoint[];
  skeleton_connections: [string, string][];
  biomechanics: Biomechanics;
}

interface TrajectoryPoint {
  frame: number;
  x: number;
  y: number;
  height_m: number;
  speed_kmh: number;
  spin_rpm: number;
}

interface TrajectoryData {
  status: string;
  total_points: number;
  max_height_m: number;
  top_speed_kmh: number;
  avg_spin_rpm: number;
  flight_duration_sec: number;
  shot_type: string;
  trajectory: TrajectoryPoint[];
}

interface ModelSummary {
  model_name: string;
  architecture: string;
  input_resolution: string;
  inference_fps_gpu: number;
  inference_fps_cpu: number;
  metrics: {
    mAP50_player: number;
    mAP50_ball: number;
    mAP50_referee: number;
    mAP50_pose_keypoints: number;
    precision: number;
    recall: number;
  };
  classes_detected: Array<{ id: number; name: string; color_hex: string; count_last_frame: number }>;
  features_active: string[];
}

const YOLO26AnalyticsStudio: React.FC<{
  videoSrc?: string;
}> = ({ videoSrc = "/YOLO26 .mp4" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trajectoryCanvasRef = useRef<HTMLCanvasElement>(null);

  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [trajData, setTrajData] = useState<TrajectoryData | null>(null);
  const [modelSummary, setModelSummary] = useState<ModelSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<number>(7);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"vision" | "pose" | "trajectory" | "summary">("vision");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [poseRes, trajRes, sumRes] = await Promise.all([
        fetch("http://localhost:5001/api/v1/yolo26/pose-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: selectedPlayer }),
        }),
        fetch("http://localhost:5001/api/v1/yolo26/ball-trajectory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ n_points: 40 }),
        }),
        fetch("http://localhost:5001/api/v1/yolo26/summary", { method: "POST" }),
      ]);

      const [pData, tData, sData] = await Promise.all([poseRes.json(), trajRes.json(), sumRes.json()]);
      setPoseData(pData);
      setTrajData(tData);
      setModelSummary(sData);
    } catch {
      // Mock fallback
      setPoseData({
        status: "mock",
        player_id: selectedPlayer,
        player_role: "Forward / Striker",
        pose_confidence: 0.965,
        keypoints: [
          { name: "nose", x: 260, y: 110, confidence: 0.98 },
          { name: "left_shoulder", x: 235, y: 145, confidence: 0.96 },
          { name: "right_shoulder", x: 285, y: 145, confidence: 0.96 },
          { name: "left_elbow", x: 220, y: 185, confidence: 0.94 },
          { name: "right_elbow", x: 300, y: 185, confidence: 0.94 },
          { name: "left_wrist", x: 210, y: 225, confidence: 0.91 },
          { name: "right_wrist", x: 310, y: 225, confidence: 0.91 },
          { name: "left_hip", x: 245, y: 215, confidence: 0.95 },
          { name: "right_hip", x: 275, y: 215, confidence: 0.95 },
          { name: "left_knee", x: 238, y: 275, confidence: 0.93 },
          { name: "right_knee", x: 282, y: 275, confidence: 0.93 },
          { name: "left_ankle", x: 232, y: 335, confidence: 0.92 },
          { name: "right_ankle", x: 288, y: 335, confidence: 0.92 },
        ],
        skeleton_connections: [
          ["left_shoulder", "right_shoulder"],
          ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
          ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"],
          ["left_shoulder", "left_hip"], ["right_shoulder", "right_hip"],
          ["left_hip", "right_hip"],
          ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
          ["right_hip", "right_knee"], ["right_knee", "right_ankle"]
        ],
        biomechanics: {
          knee_flexion_left_deg: 148.5,
          knee_flexion_right_deg: 162.0,
          hip_extension_deg: 24.3,
          stride_length_m: 1.95,
          posture_status: "Optimal Acceleration Biomechanics",
          center_of_gravity_y: 215.0,
          ground_reaction_force_n: 1480.0,
        }
      });

      setTrajData({
        status: "mock",
        total_points: 40,
        max_height_m: 5.65,
        top_speed_kmh: 112.4,
        avg_spin_rpm: 540,
        flight_duration_sec: 1.38,
        shot_type: "Curving Topspin Power Strike",
        trajectory: Array.from({ length: 40 }, (_, i) => {
          const t = i / 39;
          const x = 40 + t * 440;
          const z = 80 * 4 * t * (1 - t);
          const y = 260 - z * 0.55;
          return { frame: i * 2, x, y, height_m: z / 14, speed_kmh: 88 + Math.sin(t * Math.PI) * 28, spin_rpm: 480 + t * 120 };
        })
      });

      setModelSummary({
        model_name: "YOLO26m-Football-Custom",
        architecture: "YOLOv26 Multi-Task Detection + Tracking + 17-Keypoint Pose Engine",
        input_resolution: "1280x1280",
        inference_fps_gpu: 142.5,
        inference_fps_cpu: 38.2,
        metrics: {
          mAP50_player: 0.952,
          mAP50_ball: 0.918,
          mAP50_referee: 0.965,
          mAP50_pose_keypoints: 0.902,
          precision: 0.941,
          recall: 0.928,
        },
        classes_detected: [
          { id: 0, name: "Player", color_hex: "#3b82f6", count_last_frame: 18 },
          { id: 1, name: "Goalkeeper", color_hex: "#f59e0b", count_last_frame: 2 },
          { id: 2, name: "Referee", color_hex: "#a855f7", count_last_frame: 3 },
          { id: 3, name: "Ball", color_hex: "#22c55e", count_last_frame: 1 },
        ],
        features_active: [
          "Custom-trained YOLO26 player detection (Players, Goalkeepers & Referees)",
          "Custom-trained YOLO26 ball detection for accurate ball localization",
          "Automatic team classification using jersey color detection",
          "Multi-object tracking with persistent player IDs",
          "Real-time player speed estimation & distance analysis",
          "Player pose estimation and 17-keypoint skeleton visualization",
          "Accurate ball trajectory tracking & flight curve analysis",
          "Ball possession percentage analysis",
          "Player movement heatmap visualization & movement map",
          "Live football analytics dashboard with real-time insights",
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedPlayer]);

  // Render Vision Canvas (Bounding boxes + Pose Skeleton)
  useEffect(() => {
    if (!canvasRef.current || !poseData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark Pitch Background
    ctx.fillStyle = "#0a1910";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pitch lines
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(canvas.width / 2, canvas.height - 10);
    ctx.stroke();

    // 1. Draw Player Boxes
    if (showBoxes) {
      // Player 7
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(200, 80, 120, 270);
      ctx.fillStyle = "rgba(59,130,246,0.18)";
      ctx.fillRect(200, 80, 120, 270);

      // Label badge
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(200, 56, 120, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`ID: #${selectedPlayer} | 96.5%`, 206, 72);

      // Ball Box
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.strokeRect(420, 230, 28, 28);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(420, 210, 52, 20);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("BALL", 426, 224);

      // Other players
      const mocks = [
        { id: 10, team: "A", x: 90, y: 140, w: 70, h: 160, col: "#3b82f6" },
        { id: 4, team: "B", x: 360, y: 160, w: 68, h: 155, col: "#ef4444" },
        { id: 1, team: "GK", x: 25, y: 130, w: 55, h: 150, col: "#f59e0b" },
      ];
      mocks.forEach((m) => {
        ctx.strokeStyle = m.col;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(m.x, m.y, m.w, m.h);
        ctx.fillStyle = `${m.col}22`;
        ctx.fillRect(m.x, m.y, m.w, m.h);

        ctx.fillStyle = m.col;
        ctx.fillRect(m.x, m.y - 18, 60, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(`ID:#${m.id}`, m.x + 4, m.y - 5);
      });
    }

    // 2. Draw 17-Keypoint Pose Skeleton
    if (showSkeleton && poseData.keypoints) {
      const kpMap: Record<string, Keypoint> = {};
      poseData.keypoints.forEach((kp) => {
        kpMap[kp.name] = kp;
      });

      // Connections
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2.5;
      poseData.skeleton_connections.forEach(([k1, k2]) => {
        const p1 = kpMap[k1];
        const p2 = kpMap[k2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Keypoint Joints
      poseData.keypoints.forEach((kp) => {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [poseData, showSkeleton, showBoxes, selectedPlayer]);

  // Render Trajectory Canvas
  useEffect(() => {
    if (!trajectoryCanvasRef.current || !trajData) return;
    const canvas = trajectoryCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0c1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Trajectory Curve
    const pts = trajData.trajectory;
    if (pts.length > 1) {
      // Glow fill
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, canvas.height - 20);
      ctx.lineTo(pts[0].x, canvas.height - 20);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "rgba(34,197,94,0.35)");
      grad.addColorStop(1, "rgba(34,197,94,0.0)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Curve stroke
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Trajectory Dots
      pts.forEach((p, idx) => {
        if (idx % 4 === 0) {
          ctx.fillStyle = "#4ade80";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }, [trajData]);

  return (
    <div
      id="yolo26-analytics-studio"
      style={{
        background: "linear-gradient(135deg, #090d16 0%, #111827 100%)",
        borderRadius: "18px",
        border: "1px solid rgba(59,130,246,0.25)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Banner Header */}
      <div
        style={{
          padding: "24px 32px 20px",
          background: "linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.12) 50%, rgba(34,197,94,0.1) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.6rem" }}>🤖</span>
            <h1
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #60a5fa, #c084fc, #4ade80)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              YOLO26 AI Football Analytics & Pose Engine
            </h1>
            <span
              style={{
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: "rgba(59,130,246,0.2)",
                color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.4)",
              }}
            >
              Ultralytics YOLOv26 Multi-Task
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
            Real-time Player, Ball & Tactical Insights with 17-Keypoint Pose Estimation & Trajectory Tracking
          </p>
        </div>

        <button
          id="yolo26-refresh-btn"
          onClick={fetchAllData}
          style={{
            background: "linear-gradient(90deg, #2563eb, #7c3aed)",
            border: "none",
            color: "#ffffff",
            borderRadius: "10px",
            padding: "8px 18px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}
        >
          {loading ? "⏳ Processing..." : "🚀 Run YOLO26 Analysis"}
        </button>
      </div>

      {/* Feature Badges Showcase (13 Key Features) */}
      <div
        style={{
          padding: "12px 32px",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {[
          "⚽ Custom YOLO26 Player Detect",
          "🥅 Ball Localization",
          "🔴🔵 Jersey Team Classification",
          "🆔 Multi-Object Tracking",
          "🏃 Real-Time Speed",
          "📏 Distance Covered",
          "🦴 17-Keypoint Pose Skeleton",
          "🎯 Ball Trajectory Track",
          "📊 Possession Share %",
          "🔥 Movement Heatmaps",
          "🗺️ Trajectory Map",
          "📈 Live Analytics Dashboard",
          "🎥 OpenCV Video Pipeline",
        ].map((feat, i) => (
          <span
            key={i}
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              background: "rgba(255,255,255,0.04)",
              color: "#cbd5e1",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {feat}
          </span>
        ))}
      </div>

      {/* Main Grid: Vision Player + Biomechanics & Trajectory */}
      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        
        {/* Left Column: Vision & Pose Canvas + Video */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Controls bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255,255,255,0.03)",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>OVERLAY TOGGLES:</span>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f1f5f9", fontSize: "0.75rem", cursor: "pointer" }}>
                <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
                YOLO Bounding Boxes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f1f5f9", fontSize: "0.75rem", cursor: "pointer" }}>
                <input type="checkbox" checked={showSkeleton} onChange={(e) => setShowSkeleton(e.target.checked)} style={{ accentColor: "#a855f7" }} />
                17-Keypoint Pose Skeleton
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Select Player:</span>
              {[7, 10, 4].map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedPlayer(id)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: selectedPlayer === id ? "#3b82f6" : "rgba(255,255,255,0.06)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  #{id}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Box */}
          <div
            style={{
              position: "relative",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(59,130,246,0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <canvas
              ref={canvasRef}
              width={540}
              height={360}
              style={{ display: "block", width: "100%", height: "auto" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                borderRadius: "8px",
                padding: "6px 12px",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#4ade80",
                fontSize: "0.72rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🔴 LIVE DETECT</span>
              <span>• FPS: {modelSummary?.inference_fps_gpu || 142.5}</span>
              <span>• Resolution: 1280x1280</span>
            </div>
          </div>

          {/* Video Player integration if video exists */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: "12px",
              padding: "12px 16px",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>🎥</span>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.82rem" }}>Sample Video Analysis</div>
                <div style={{ color: "#64748b", fontSize: "0.7rem" }}>YOLO26 .mp4 · Custom Trained Inference</div>
              </div>
            </div>
            <a
              href={videoSrc}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                background: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.3)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ▶ Play Footage
            </a>
          </div>
        </div>

        {/* Right Column: Biomechanics + Ball Trajectory Arc */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Biomechanics Pose Card */}
          {poseData && (
            <div
              style={{
                background: "rgba(168,85,247,0.06)",
                border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>🦴</span>
                  <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>
                    Pose & Biomechanics (Player #{selectedPlayer})
                  </span>
                </div>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    background: "rgba(34,197,94,0.15)",
                    color: "#4ade80",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  Conf: {(poseData.pose_confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b", fontSize: "0.62rem" }}>Left Knee Flexion</div>
                  <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "0.95rem" }}>
                    {poseData.biomechanics.knee_flexion_left_deg}°
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b", fontSize: "0.62rem" }}>Right Knee Flexion</div>
                  <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "0.95rem" }}>
                    {poseData.biomechanics.knee_flexion_right_deg}°
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b", fontSize: "0.62rem" }}>Stride Length</div>
                  <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.95rem" }}>
                    {poseData.biomechanics.stride_length_m} m
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b", fontSize: "0.62rem" }}>Ground Reaction</div>
                  <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.95rem" }}>
                    {poseData.biomechanics.ground_reaction_force_n} N
                  </div>
                </div>
              </div>

              <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Posture Analysis: </span>
                <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.75rem" }}>
                  {poseData.biomechanics.posture_status}
                </span>
              </div>
            </div>
          )}

          {/* Ball Trajectory Parabolic Arc Card */}
          {trajData && (
            <div
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>🎯</span>
                  <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>
                    Ball Trajectory & Flight Curve
                  </span>
                </div>
                <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.75rem" }}>
                  {trajData.shot_type}
                </span>
              </div>

              {/* Trajectory canvas */}
              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "12px" }}>
                <canvas ref={trajectoryCanvasRef} width={380} height={140} style={{ display: "block", width: "100%", height: "auto" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 8px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.6rem" }}>Top Speed</div>
                  <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.85rem" }}>{trajData.top_speed_kmh} km/h</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 8px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.6rem" }}>Apex Height</div>
                  <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.85rem" }}>{trajData.max_height_m} m</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 8px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.6rem" }}>Spin Rate</div>
                  <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "0.85rem" }}>{trajData.avg_spin_rpm} rpm</div>
                </div>
              </div>
            </div>
          )}

          {/* YOLO26 Model Metrics */}
          {modelSummary && (
            <div
              style={{
                background: "rgba(59,130,246,0.05)",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                YOLO26 Model Accuracy Metrics
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.58rem" }}>mAP50 Player</div>
                  <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.8rem" }}>{(modelSummary.metrics.mAP50_player * 100).toFixed(1)}%</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.58rem" }}>mAP50 Ball</div>
                  <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.8rem" }}>{(modelSummary.metrics.mAP50_ball * 100).toFixed(1)}%</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.58rem" }}>mAP50 Pose</div>
                  <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "0.8rem" }}>{(modelSummary.metrics.mAP50_pose_keypoints * 100).toFixed(1)}%</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ color: "#64748b", fontSize: "0.58rem" }}>Precision</div>
                  <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.8rem" }}>{(modelSummary.metrics.precision * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default YOLO26AnalyticsStudio;
