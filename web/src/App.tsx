import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Shield, 
  Users,
  Search
} from 'lucide-react';
import { TacticalScenarioSimulator } from './components/TacticalScenarioSimulator';
import { PlayerSimilarityScout } from './components/PlayerSimilarityScout';
import { PredictiveFantasyCard } from './components/PredictiveFantasyCard';
import { StadiumARView } from './components/StadiumARView';
import { FatigueInjuryPredictor } from './components/FatigueInjuryPredictor';
import { TacticalBoard3D } from './components/TacticalBoard3D';
import { OpponentScoutingReport } from './components/OpponentScoutingReport';
import { ServicesHealthPulse } from './components/ServicesHealthPulse';
import { RefereeConsistencyScorecard } from './components/RefereeConsistencyScorecard';
import { YouthAcademyTracker } from './components/YouthAcademyTracker';
import { StadiumDigitalTwin } from './components/StadiumDigitalTwin';
import { BiomechanicalStressViewer } from './components/BiomechanicalStressViewer';
import { AlphaZeroPassRecommender } from './components/AlphaZeroPassRecommender';
import { PlayerStockMarket } from './components/PlayerStockMarket';
import { SpatialVisionProView } from './components/SpatialVisionProView';
import { KalmanVoronoiControlMap } from './components/KalmanVoronoiControlMap';
import { GRPCTelemetryStreamer } from './components/gRPCTelemetryStreamer';
import { ComplexMatchGameplay } from './components/ComplexMatchGameplay';
import { AICoManagerPanel } from './components/AICoManagerPanel';
import { IoTSmartBallViewer } from './components/IoTSmartBallViewer';
import { PassingSonarViewer } from './components/PassingSonarViewer';
import { VARVerdictAudio } from './components/VARVerdictAudio';
import PassingNetwork from './components/PassingNetwork';
import MatchReportPanel from './components/MatchReportPanel';
import SpeedDistancePanel from './components/SpeedDistancePanel';
import PlayerHeatmapViewer from './components/PlayerHeatmapViewer';
import TacticalProfileCard from './components/TacticalProfileCard';
import PossessionLiveDashboard from './components/PossessionLiveDashboard';
import GMMTeamClusterViewer from './components/GMMTeamClusterViewer';
import PlayerPossessionBreakdown from './components/PlayerPossessionBreakdown';
import YOLO26AnalyticsStudio from './components/YOLO26AnalyticsStudio';
import NextGenStadiumStudio from './components/NextGenStadiumStudio';



import AudioVoiceControl from './components/AudioVoiceControl';







interface MatchState {
  match_id: string;
  win_probability: number;
  draw_probability: number;
  loss_probability: number;
  minute: number;
  xg: {
    team_a: number;
    team_b: number;
  };
  momentum: number;
}

interface TabItem {
  id: string;
  label: string;
  category: "match" | "ai-vision" | "tactics" | "medical" | "ops";
  icon: string;
  color: string;
  bg: string;
  tag?: string;
}

const TABS: TabItem[] = [
  // Match & Gameplay
  { id: "live", label: "Live Match Center", category: "match", icon: "🔥", color: "#00ff87", bg: "rgba(0,255,135,0.12)" },
  { id: "simulator", label: "Tactical Simulator", category: "match", icon: "⚡", color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
  { id: "epl", label: "EPL Gameplay", category: "match", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  { id: "bracket", label: "World Cup Bracket", category: "match", icon: "🏆", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  { id: "fantasy", label: "Live Fantasy", category: "match", icon: "🎖️", color: "#facc15", bg: "rgba(250,204,21,0.12)" },

  // AI & Computer Vision Engines
  { id: "ai-analytics", label: "AI Football Analytics", category: "ai-vision", icon: "⚽", color: "#4ade80", bg: "rgba(74,222,128,0.15)", tag: "YOLO11m" },
  { id: "possession", label: "Possession Analytics", category: "ai-vision", icon: "🏟️", color: "#f87171", bg: "rgba(248,113,113,0.15)", tag: "GMM CIELAB" },
  { id: "yolo26", label: "YOLO26 Studio", category: "ai-vision", icon: "🤖", color: "#c084fc", bg: "rgba(192,132,252,0.15)", tag: "17-Pose" },
  { id: "nextgen", label: "Next-Gen Stadium Engine", category: "ai-vision", icon: "⚡", color: "#38bdf8", bg: "rgba(56,189,248,0.15)", tag: "320 FPS" },

  // Scouting & Pass Tactics
  { id: "scout", label: "AI Scout Engine", category: "tactics", icon: "🔍", color: "#c084fc", bg: "rgba(168,85,247,0.12)" },
  { id: "alphazero", label: "AlphaZero Pass", category: "tactics", icon: "🎯", color: "#4ade80", bg: "rgba(34,197,94,0.12)" },
  { id: "sonar", label: "Passing Sonar", category: "tactics", icon: "🎯", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  { id: "voronoi", label: "Voronoi Control", category: "tactics", icon: "🧮", color: "#4ade80", bg: "rgba(34,197,94,0.12)" },
  { id: "stocks", label: "Player Stocks", category: "tactics", icon: "💰", color: "#facc15", bg: "rgba(234,179,8,0.12)" },

  // Medical, Biomechanics & 3D
  { id: "fatigue", label: "Fatigue & Risk", category: "medical", icon: "🛡️", color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  { id: "biomechanics", label: "Biomechanics", category: "medical", icon: "🧠", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  { id: "board3d", label: "3D Board", category: "medical", icon: "✏️", color: "#4ade80", bg: "rgba(34,197,94,0.12)" },
  { id: "ar", label: "WebAR View", category: "medical", icon: "🥽", color: "#38bdf8", bg: "rgba(14,165,233,0.12)" },
  { id: "visionpro", label: "Vision Pro Spatial", category: "medical", icon: "🕶️", color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  { id: "twin", label: "Digital Twin", category: "medical", icon: "🏟️", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },

  // Operations & Hardware
  { id: "referee", label: "AI Referee", category: "ops", icon: "⚖️", color: "#facc15", bg: "rgba(234,179,8,0.12)" },
  { id: "academy", label: "Youth Academy", category: "ops", icon: "🎓", color: "#c084fc", bg: "rgba(168,85,247,0.12)" },
  { id: "comanager", label: "Co-Manager", category: "ops", icon: "🤖", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  { id: "smartball", label: "IoT Smart Ball", category: "ops", icon: "⚽", color: "#facc15", bg: "rgba(250,204,21,0.12)" },
  { id: "varaudio", label: "VAR Audio", category: "ops", icon: "🔊", color: "#4ade80", bg: "rgba(34,197,94,0.12)" },
  { id: "grpc", label: "gRPC Inspector", category: "ops", icon: "📡", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
];

export default function App() {
  const [matchId, setMatchId] = useState<string>("wc_final_2026");
  const [activeTab, setActiveTab] = useState<string>("live");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [matchState, setMatchState] = useState<MatchState>({
    match_id: "wc_final_2026",
    win_probability: 0.48,
    draw_probability: 0.28,
    loss_probability: 0.24,
    minute: 42,
    xg: { team_a: 1.45, team_b: 0.92 },
    momentum: 45
  });


  // Dual-mode WebSocket with simulation fallback
  useEffect(() => {
    let socket: WebSocket | null = null;
    let simInterval: NodeJS.Timeout | null = null;

    const startSimulation = () => {
      if (simInterval) clearInterval(simInterval);
      simInterval = setInterval(() => {
        setMatchState(prev => {
          const delta = (Math.random() - 0.5) * 0.04;
          let win = Math.max(0.1, Math.min(0.8, prev.win_probability + delta));
          let loss = Math.max(0.1, Math.min(0.8, prev.loss_probability - delta));
          const draw = 1.0 - win - loss;

          return {
            ...prev,
            win_probability: Number(win.toFixed(3)),
            draw_probability: Number(draw.toFixed(3)),
            loss_probability: Number(loss.toFixed(3)),
            minute: prev.minute >= 90 ? 1 : prev.minute + 1,
            xg: {
              team_a: Number((prev.xg.team_a + Math.random() * 0.05).toFixed(2)),
              team_b: Number((prev.xg.team_b + Math.random() * 0.03).toFixed(2))
            },
            momentum: Math.round((win - loss) * 100)
          };
        });
      }, 1500);
    };

    const connectWS = () => {
      try {
        const wsUrl = `ws://localhost:8080/v1/ws/matches/${matchId}/live`;
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setWsConnected(true);
          if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMatchState(prev => ({
              ...prev,
              win_probability: data.home_win_prob ?? prev.win_probability,
              draw_probability: data.draw_prob ?? prev.draw_probability,
              loss_probability: data.away_win_prob ?? prev.loss_probability,
              minute: data.minute ?? prev.minute,
              xg: data.xg ?? prev.xg,
              momentum: data.momentum ?? Math.round(((data.home_win_prob ?? prev.win_probability) - (data.away_win_prob ?? prev.loss_probability)) * 100)
            }));
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          startSimulation();
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
        startSimulation();
      }
    };

    connectWS();
    startSimulation(); // Always start simulation as a base/fallback

    return () => {
      if (socket) socket.close();
      if (simInterval) clearInterval(simInterval);
    };
  }, [matchId]);

  // Filter tabs based on category and search
  const filteredTabs = TABS.filter((tab) => {
    const matchesCat = activeCategory === "all" || tab.category === activeCategory;
    const matchesSearch = searchQuery === "" || tab.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6' }}>
      
      {/* Premium Glassmorphic Header */}
      <header
        className="glass-panel"
        style={{
          margin: '16px 24px 8px',
          padding: '16px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(11,17,32,0.9) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00ff87, #00e5ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 0 20px rgba(0,255,135,0.3)',
              }}
            >
              ⚽
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }} className="gradient-text">
                  DeepStream AI
                </h1>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    backgroundColor: wsConnected ? 'rgba(0, 255, 135, 0.12)' : 'rgba(255, 165, 0, 0.12)',
                    color: wsConnected ? '#00ff87' : '#f59e0b',
                    border: wsConnected ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid rgba(255, 165, 0, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  {wsConnected ? '● Live Telemetry' : '⚡ Sim Engine'}
                </span>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', fontWeight: 700 }}>
                  26 AI Modules
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Enterprise Real-Time AI Football Analytics & 3D Spatial Platform
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="tab-search-input"
                type="text"
                placeholder="Search 26 AI features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '7px 12px 7px 34px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  outline: 'none',
                  width: '200px',
                  transition: 'all 0.2s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: "all", label: "🌐 All Modules (26)", icon: "🔥" },
            { id: "match", label: "🔴 Match & Gameplay (5)", icon: "⚽" },
            { id: "ai-vision", label: "🤖 AI & CV Engines (4)", icon: "👁️" },
            { id: "tactics", label: "🎯 Scouting & Tactics (5)", icon: "📐" },
            { id: "medical", label: "🩺 Biomechanics & 3D (6)", icon: "🧠" },
            { id: "ops", label: "⚖️ Ops & Hardware (6)", icon: "📡" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeCategory === cat.id ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeCategory === cat.id ? '#00ff87' : '#94a3b8',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                borderBottom: activeCategory === cat.id ? '2px solid #00ff87' : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feature Tab Buttons Carousel Grid */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '10px', paddingBottom: '4px' }}>
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`app-tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? tab.bg : 'transparent',
                  color: isActive ? tab.color : '#94a3b8',
                  border: isActive ? `1px solid ${tab.color}44` : '1px solid transparent',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.tag && (
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: `${tab.color}22`,
                      color: tab.color,
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {tab.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>










      {/* Main Content Area */}
      <main className="dashboard-grid">
        
        {activeTab === "live" ? (
          <>
            {/* Left Column: Match Analytics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Scorecard */}
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'red' }}>
                  <Flame size={16} />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>LIVE ({matchState.minute}')</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <Shield size={48} color="var(--color-blue)" />
                    <h3 style={{ margin: '8px 0 4px 0' }}>ARGENTINA</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Home</p>
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 800 }}>2 - 1</div>
                  <div>
                    <Shield size={48} color="var(--color-purple)" />
                    <h3 style={{ margin: '8px 0 4px 0' }}>FRANCE</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Away</p>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '8px' }}>
                    xG: <strong style={{ color: 'var(--color-green)' }}>{matchState.xg.team_a}</strong> - <strong>{matchState.xg.team_b}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '8px' }}>
                    Possession: <strong style={{ color: 'var(--color-blue)' }}>58%</strong> - <strong>42%</strong>
                  </div>
                </div>
              </div>

              {/* Real-time Momentum Graph */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="var(--color-green)" /> Attack Momentum Vector
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live updates</span>
                </div>

                {/* Simulated Momentum Graph */}
                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {Array.from({ length: 40 }).map((_, idx) => {
                    const heightVal = Math.abs(Math.sin((idx + matchState.minute) * 0.3) * 80) + 10;
                    const isPositive = Math.sin((idx + matchState.minute) * 0.3) > 0;
                    return (
                      <div 
                        key={idx}
                        style={{
                          flex: 1,
                          height: `${heightVal}px`,
                          backgroundColor: isPositive ? 'var(--color-green)' : 'var(--color-purple)',
                          opacity: idx === 39 ? 1 : 0.4,
                          borderRadius: '2px',
                          transition: 'height 0.3s ease'
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>-40 min</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Heat Map Overlay */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="var(--color-green)" /> Player Spatio-Temporal Heatmap
                </h3>
                
                <div className="pitch-bg" style={{ height: '260px' }}>
                  <div className="pitch-line-center"></div>
                  <div className="pitch-circle"></div>
                  
                  {/* Glowing Hotspots */}
                  <div style={{
                    position: 'absolute', top: '35%', left: '70%',
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,255,135,0.6) 0%, transparent 70%)',
                    filter: 'blur(4px)'
                  }} />
                  <div style={{
                    position: 'absolute', top: '60%', left: '45%',
                    width: '90px', height: '90px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)',
                    filter: 'blur(4px)'
                  }} />
                  <div style={{
                    position: 'absolute', top: '20%', left: '25%',
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,0,128,0.4) 0%, transparent 70%)',
                    filter: 'blur(4px)'
                  }} />
                </div>
              </div>

            </div>

            {/* Right Column: AI Predictions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Bayesian Calibration Win Probabilities */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--color-green)" /> Multi-Model Probability
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>Argentina Win</span>
                      <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>{(matchState.win_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matchState.win_probability * 100}%`, height: '100%', backgroundColor: 'var(--color-green)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>Draw</span>
                      <span style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{(matchState.draw_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matchState.draw_probability * 100}%`, height: '100%', backgroundColor: 'var(--color-blue)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>France Win</span>
                      <span style={{ color: 'var(--color-purple)', fontWeight: 700 }}>{(matchState.loss_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matchState.loss_probability * 100}%`, height: '100%', backgroundColor: 'var(--color-purple)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', padding: '12px', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '8px', backgroundColor: 'rgba(0,255,135,0.03)' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-green)', lineHeight: 1.4 }}>
                    💡 <strong>Ensemble Aggregator:</strong> High confidence rating on ARGENTINA due to extreme travel fatigue factors on France's defensive line (-18% stamina forecast).
                  </p>
                </div>
              </div>

              {/* Tactical Overview */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--color-blue)" /> AI Formation Detection
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Argentina</span>
                    <strong style={{ color: 'var(--color-blue)' }}>4-3-3 Attacking</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>France</span>
                    <strong style={{ color: 'var(--color-purple)' }}>4-2-3-1 Fluid</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>PPDA (Pressing Intensity)</span>
                    <strong>8.4 (High Intensity)</strong>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : activeTab === "simulator" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TacticalScenarioSimulator
              currentWinProb={matchState.win_probability}
              onApplyScenario={(newProb) => {
                setMatchState(prev => ({
                  ...prev,
                  win_probability: Number(newProb.toFixed(3)),
                  draw_probability: Number(((1 - newProb) * 0.55).toFixed(3)),
                  loss_probability: Number(((1 - newProb) * 0.45).toFixed(3))
                }));
              }}
            />
            <PassingNetwork />
          </div>
        ) : activeTab === "scout" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PlayerSimilarityScout />
            <OpponentScoutingReport />
            <ServicesHealthPulse />
          </div>

        ) : activeTab === "fantasy" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PredictiveFantasyCard />
          </div>
        ) : activeTab === "ar" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <StadiumARView />
          </div>
        ) : activeTab === "fatigue" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FatigueInjuryPredictor currentMinute={matchState.minute} />
          </div>
        ) : activeTab === "board3d" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TacticalBoard3D />
          </div>
        ) : activeTab === "referee" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RefereeConsistencyScorecard />
          </div>
        ) : activeTab === "academy" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <YouthAcademyTracker />
          </div>
        ) : activeTab === "twin" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <StadiumDigitalTwin />
          </div>
        ) : activeTab === "biomechanics" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <BiomechanicalStressViewer />
          </div>
        ) : activeTab === "alphazero" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AlphaZeroPassRecommender />
          </div>
        ) : activeTab === "stocks" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PlayerStockMarket />
          </div>
        ) : activeTab === "visionpro" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SpatialVisionProView />
          </div>
        ) : activeTab === "voronoi" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <KalmanVoronoiControlMap />
          </div>
        ) : activeTab === "grpc" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GRPCTelemetryStreamer />
          </div>
        ) : activeTab === "epl" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ComplexMatchGameplay />
          </div>
        ) : activeTab === "comanager" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AICoManagerPanel />
          </div>
        ) : activeTab === "smartball" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <IoTSmartBallViewer />
          </div>
        ) : activeTab === "sonar" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PassingSonarViewer />
          </div>
        ) : activeTab === "varaudio" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <VARVerdictAudio />
          </div>
        ) : (








          /* Bracket Tab */
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>🏆 World Cup 2026 Prediction Bracket</h2>
                <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Monte Carlo tree search path forecasts based on 1M simulated runs</p>
              </div>

              {/* Tournament Tree layout */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '24px' }}>
                {/* Round of 16 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                  <h4 style={{ color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>Round of 16</h4>
                  <div className="glass-panel" style={{ padding: '16px', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>🇦🇷 Argentina <span style={{ float: 'right', color: 'var(--color-green)' }}>82%</span></div>
                    <div style={{ paddingTop: '6px' }}>🇺🇸 USA <span style={{ float: 'right', opacity: 0.5 }}>18%</span></div>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>🇫🇷 France <span style={{ float: 'right', color: 'var(--color-green)' }}>65%</span></div>
                    <div style={{ paddingTop: '6px' }}>🇸🇳 Senegal <span style={{ float: 'right', opacity: 0.5 }}>35%</span></div>
                  </div>
                </div>

                {/* Quarter Finals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '96px' }}>
                  <h4 style={{ color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>Quarter Finals</h4>
                  <div className="glass-panel" style={{ padding: '16px', width: '200px', border: '1px solid var(--color-green)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>🇦🇷 Argentina <span style={{ float: 'right', color: 'var(--color-green)' }}>54%</span></div>
                    <div style={{ paddingTop: '6px' }}>🇫🇷 France <span style={{ float: 'right', opacity: 0.5 }}>46%</span></div>
                  </div>
                </div>

                {/* Winner */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Trophy size={48} color="gold" style={{ filter: 'drop-shadow(0 0 12px gold)' }} />
                  <h4 style={{ color: 'gold', margin: '8px 0 0 0', fontWeight: 800 }}>PROJECTED CHAMPION</h4>
                  <span style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>ARGENTINA 🇦🇷</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            AI Football Analytics Tab — merged from graduation project
            ========================================================= */}
        {activeTab === "ai-analytics" && (
          <div style={{ padding: '0 16px 32px' }}>
            {/* Section header */}
            <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, background: 'linear-gradient(90deg,#4ade80,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ⚽ AI Football Analytics Engine
              </h2>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                12-Stage Computer Vision Pipeline · YOLO11m · BoT-SORT · Homography Calibration · 340+ Tests
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                {['Detection','Tracking','Team Clustering','Pitch Calibration','Speed & Distance','Player Rating 0–10','Heatmaps','Possession','Tactics','Match Report'].map(f => (
                  <span key={f} style={{ padding: '3px 10px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '999px', color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>

            {/* 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
              {/* Match Report */}
              <MatchReportPanel homeTeam="Argentina" awayTeam="France" />

              {/* Speed Distance & Possession */}
              <SpeedDistancePanel homeTeam="Argentina" awayTeam="France" />

              {/* Heatmap */}
              <PlayerHeatmapViewer homeTeam="Argentina" awayTeam="France" />

              {/* Tactical Profiles */}
              <TacticalProfileCard homeTeam="Argentina" awayTeam="France" />
            </div>
          </div>
        )}

        {/* =========================================================
            Football Possession Analytics Tab — merged from possession project
            YOLOv8 + GMM CIELAB Team Clustering + Proximity Tracking
            ========================================================= */}
        {activeTab === "possession" && (
          <div style={{ padding: '0 16px 32px' }}>
            {/* Section header */}
            <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, background: 'linear-gradient(90deg,#f87171,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🏟️ Football Possession Analytics Engine
              </h2>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                YOLOv8 Detection · GMM CIELAB Automatic Team Clustering · Proximity-Based Possession Tracking
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                {[
                  'YOLOv8 Player Detection',
                  'Torso Crop + Grass Masking',
                  'CIELAB Color Space',
                  'Gaussian Mixture Model (k=2)',
                  'Frame-by-Frame Possession',
                  'Broadcast Scoreboard',
                  'JSON + CSV Export',
                ].map(f => (
                  <span key={f} style={{ padding: '3px 10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '999px', color: '#f87171', fontSize: '11px', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>

            {/* 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
              {/* Live Possession Dashboard (broadcast-style + trend chart) */}
              <PossessionLiveDashboard homeTeam="Argentina" awayTeam="France" />

              {/* GMM Team Cluster Viewer */}
              <GMMTeamClusterViewer homeTeam="Argentina" awayTeam="France" />

              {/* Player Possession Breakdown (full width) */}
              <div style={{ gridColumn: '1 / -1' }}>
                <PlayerPossessionBreakdown homeTeam="Argentina" awayTeam="France" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            YOLO26 AI Football Analytics Studio Tab
            Custom YOLO26 Detection + 17-Keypoint Pose + Ball Trajectory
            ========================================================= */}
        {activeTab === "yolo26" && (
          <div style={{ padding: '0 16px 32px' }}>
            <YOLO26AnalyticsStudio videoSrc="/YOLO26 .mp4" />
          </div>
        )}

        {/* =========================================================
            Next-Gen Stadium Engine Tab (RTSP, Voice Commentary, TensorRT, MultiCam Sync)
            ========================================================= */}
        {activeTab === "nextgen" && (
          <div style={{ padding: '0 16px 32px' }}>
            <NextGenStadiumStudio />
          </div>
        )}

      </main>

      {/* Futuristic Glassmorphic Footer */}
      <footer
        className="glass-panel"
        style={{
          margin: '24px',
          padding: '20px 32px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(3,7,18,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚽</span>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '14px' }}>DeepStream Platform v4.0.0 Enterprise</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
              Full-Stack AI Football Analytics · Go Gateway · Rust ONNX · Python Flask AI Engine · React 18
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4ade80' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            26 AI Modules Operational
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#60a5fa' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
            TensorRT INT8 328 FPS
          </div>
          <span style={{ color: '#64748b', fontSize: '11px' }}>© 2026 DeepStream. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

