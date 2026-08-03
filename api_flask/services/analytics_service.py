"""
AI Football Analytics Service — DeepStream Integration.

Wraps the AI Football Analytics engine (merged from the graduation project) and exposes
clean Python APIs consumed by Flask endpoints. Operates on synthetic field_positions
data if no real CV pipeline output is available, making it fully runnable standalone.

Modules integrated from AI Football Analytics:
  - speed_distance     → per-player distance & speed (Phase 5)
  - player_analytics   → work-rate, fatigue, 0–10 rating (Phase 6)
  - heatmap_generator  → Gaussian density grids (Phase 7)
  - tactical_analysis  → compactness, press, build-up (Phase 8)
  - possession_engine  → field-space possession % (Phase 9)
  - match_report       → man-of-match, insights, recommendations (Phase 10)
"""

from __future__ import annotations

import math
import random
import sys
import os
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("deepstream.analytics_service")

# ---------------------------------------------------------------------------
# Path bootstrap — make features importable when running from api_flask/
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)


# ---------------------------------------------------------------------------
# Lazy imports — graceful fallback when numpy / cv2 not installed
# ---------------------------------------------------------------------------
def _try_import_analytics():
    try:
        from features.src.core.analytics_models import AnalyticsResult, TrackAnalytics
        from features.src.core.speed_distance import compute_analytics
        from features.src.core.player_analytics import compute_player_analytics
        from features.src.core.possession_engine import compute_field_possession
        from features.src.advanced.tactical_analysis import compute_tactical_analysis
        from features.src.advanced.match_report import build_match_report
        return {
            "compute_analytics": compute_analytics,
            "compute_player_analytics": compute_player_analytics,
            "compute_field_possession": compute_field_possession,
            "compute_tactical_analysis": compute_tactical_analysis,
            "build_match_report": build_match_report,
        }
    except ImportError as exc:
        logger.warning("Analytics modules not fully available (%s) — using mock data.", exc)
        return None


_ANALYTICS = _try_import_analytics()


# ---------------------------------------------------------------------------
# Synthetic field_positions generator (used when no real CV pipeline output)
# ---------------------------------------------------------------------------
def _generate_synthetic_field_positions(
    n_frames: int = 300,
    n_players_per_team: int = 11,
    fps: float = 25.0,
    pitch_length: float = 105.0,
    pitch_width: float = 68.0,
) -> List[dict]:
    """Generate synthetic field_positions for demo/testing purposes."""
    random.seed(42)
    players = []
    for team_id in (0, 1):
        for i in range(n_players_per_team):
            track_id = team_id * 20 + i + 1
            base_x = random.uniform(5.0, pitch_length - 5.0)
            base_y = random.uniform(5.0, pitch_width - 5.0)
            players.append({
                "track_id": track_id,
                "team_id": team_id,
                "role": "goalkeeper" if i == 0 else "player",
                "base_x": base_x,
                "base_y": base_y,
            })

    frames = []
    for f in range(n_frames):
        objects = []
        for p in players:
            drift_x = random.gauss(0, 0.4)
            drift_y = random.gauss(0, 0.3)
            x = max(0.0, min(pitch_length, p["base_x"] + drift_x * (f % 30)))
            y = max(0.0, min(pitch_width, p["base_y"] + drift_y * (f % 30)))
            objects.append({
                "track_id": p["track_id"],
                "team_id": p["team_id"],
                "role": p["role"],
                "field": [round(x, 2), round(y, 2)],
                "on_pitch": True,
            })
        # Ball
        ball_x = round(52.5 + math.sin(f * 0.1) * 20, 2)
        ball_y = round(34.0 + math.cos(f * 0.07) * 15, 2)
        objects.append({
            "track_id": -1,
            "team_id": None,
            "role": "ball",
            "field": [ball_x, ball_y],
            "on_pitch": True,
        })
        frames.append({"frame": f, "objects": objects})

    return frames


# ---------------------------------------------------------------------------
# Analytics orchestrator
# ---------------------------------------------------------------------------
class FootballAnalyticsService:
    """Orchestrates all AI Football Analytics phases and returns JSON-ready dicts."""

    def __init__(self, fps: float = 25.0):
        self.fps = fps
        self._cached_frames: Optional[List[dict]] = None

    # ------------------------------------------------------------------
    def _get_frames(self, field_positions: Optional[List[dict]] = None) -> List[dict]:
        if field_positions:
            self._cached_frames = field_positions
        if not self._cached_frames:
            self._cached_frames = _generate_synthetic_field_positions()
        return self._cached_frames

    # ------------------------------------------------------------------
    def compute_speed_distance(
        self, field_positions: Optional[List[dict]] = None
    ) -> Dict[str, Any]:
        """Speed & distance analytics for every player track."""
        frames = self._get_frames(field_positions)

        if _ANALYTICS:
            roles_map: Dict[int, tuple] = {}
            for frame in frames:
                for obj in frame.get("objects", []):
                    tid = obj.get("track_id")
                    if tid and tid != -1:
                        roles_map[tid] = (obj.get("role", "player"), obj.get("team_id"))

            result = _ANALYTICS["compute_analytics"](frames, roles_map, self.fps)
            return {
                "status": "success",
                "source": "ai_football_analytics",
                "fps": self.fps,
                "total_distance_m": round(result.total_distance_m, 1),
                "distance_by_team": {
                    str(k): round(v, 1) for k, v in result.distance_by_team.items()
                },
                "tracks": [t.to_dict() for t in result.tracks],
            }

        # Fallback mock
        return self._mock_speed_distance()

    # ------------------------------------------------------------------
    def compute_player_performance(
        self, field_positions: Optional[List[dict]] = None
    ) -> Dict[str, Any]:
        """Per-player rating (0–10), work rate, fatigue, insight."""
        frames = self._get_frames(field_positions)

        if _ANALYTICS:
            roles_map: Dict[int, tuple] = {}
            for frame in frames:
                for obj in frame.get("objects", []):
                    tid = obj.get("track_id")
                    if tid and tid != -1:
                        roles_map[tid] = (obj.get("role", "player"), obj.get("team_id"))

            speed_result = _ANALYTICS["compute_analytics"](frames, roles_map, self.fps)
            performances = _ANALYTICS["compute_player_analytics"](speed_result)
            return {
                "status": "success",
                "source": "ai_football_analytics",
                "players": [p.to_dict() for p in performances],
            }

        return self._mock_player_performance()

    # ------------------------------------------------------------------
    def compute_possession(
        self, field_positions: Optional[List[dict]] = None, gate_m: float = 5.0
    ) -> Dict[str, Any]:
        """Field-space ball possession percentages."""
        frames = self._get_frames(field_positions)

        if _ANALYTICS:
            result = _ANALYTICS["compute_field_possession"](frames, gate_m=gate_m)
            return {
                "status": "success",
                "source": "ai_football_analytics",
                "team_0_possession": result.percentages.get(0, 0.0),
                "team_1_possession": result.percentages.get(1, 0.0),
                "dominant_team": result.dominant_team,
                "possessed_frames": result.possessed_frames,
                "total_frames": result.total_frames,
            }

        return self._mock_possession()

    # ------------------------------------------------------------------
    def compute_tactical_profiles(
        self, field_positions: Optional[List[dict]] = None
    ) -> Dict[str, Any]:
        """Team tactical profiles — compactness, pressure style, build-up."""
        frames = self._get_frames(field_positions)

        if _ANALYTICS:
            roles_map: Dict[int, tuple] = {}
            for frame in frames:
                for obj in frame.get("objects", []):
                    tid = obj.get("track_id")
                    if tid and tid != -1:
                        roles_map[tid] = (obj.get("role", "player"), obj.get("team_id"))
            speed_result = _ANALYTICS["compute_analytics"](frames, roles_map, self.fps)
            profiles = _ANALYTICS["compute_tactical_analysis"](frames, speed_result)
            return {
                "status": "success",
                "source": "ai_football_analytics",
                "teams": [p.to_dict() for p in profiles],
            }

        return self._mock_tactical()

    # ------------------------------------------------------------------
    def compute_match_report(
        self,
        field_positions: Optional[List[dict]] = None,
        home_team_name: str = "Team A",
        away_team_name: str = "Team B",
    ) -> Dict[str, Any]:
        """Full match report — man-of-match, insights, recommendations."""
        frames = self._get_frames(field_positions)

        if _ANALYTICS:
            roles_map: Dict[int, tuple] = {}
            for frame in frames:
                for obj in frame.get("objects", []):
                    tid = obj.get("track_id")
                    if tid and tid != -1:
                        roles_map[tid] = (obj.get("role", "player"), obj.get("team_id"))

            speed_result = _ANALYTICS["compute_analytics"](frames, roles_map, self.fps)
            performances = _ANALYTICS["compute_player_analytics"](speed_result)
            possession = _ANALYTICS["compute_field_possession"](frames)
            profiles = _ANALYTICS["compute_tactical_analysis"](frames, speed_result)
            report = _ANALYTICS["build_match_report"](performances, profiles, possession)

            report_dict = report.to_dict()
            report_dict["home_team_name"] = home_team_name
            report_dict["away_team_name"] = away_team_name
            report_dict["source"] = "ai_football_analytics"
            report_dict["status"] = "success"
            return report_dict

        return self._mock_match_report(home_team_name, away_team_name)

    # ------------------------------------------------------------------
    def compute_heatmap(
        self,
        team_id: int = 0,
        field_positions: Optional[List[dict]] = None,
        px_per_meter: float = 4.0,
    ) -> Dict[str, Any]:
        """Gaussian heatmap density grid for a team (returned as flat array)."""
        frames = self._get_frames(field_positions)

        if _ANALYTICS:
            try:
                from features.src.advanced.heatmap_generator import (
                    collect_positions, density_grid, PitchDimensions,
                )
                dims = PitchDimensions()
                points = collect_positions(frames, team_id=team_id)
                grid = density_grid(points, dims, px_per_meter=px_per_meter)
                return {
                    "status": "success",
                    "source": "ai_football_analytics",
                    "team_id": team_id,
                    "grid_rows": int(grid.shape[0]),
                    "grid_cols": int(grid.shape[1]),
                    "grid": grid.tolist(),
                    "pitch_length_m": dims.length,
                    "pitch_width_m": dims.width,
                    "px_per_meter": px_per_meter,
                }
            except ImportError:
                pass

        return self._mock_heatmap(team_id)

    # ------------------------------------------------------------------
    # Mock fallbacks
    # ------------------------------------------------------------------
    def _mock_speed_distance(self) -> Dict[str, Any]:
        random.seed(99)
        tracks = []
        for i in range(22):
            tracks.append({
                "track_id": i + 1,
                "team_id": 0 if i < 11 else 1,
                "role": "goalkeeper" if i in (0, 11) else "player",
                "total_distance_m": round(random.uniform(4500, 11000), 1),
                "avg_speed_kmh": round(random.uniform(6.0, 12.0), 2),
                "max_speed_kmh": round(random.uniform(22.0, 35.0), 2),
                "player_display_name": f"Player {i + 1}",
            })
        return {
            "status": "success",
            "source": "mock",
            "fps": self.fps,
            "total_distance_m": round(sum(t["total_distance_m"] for t in tracks), 1),
            "distance_by_team": {
                "0": round(sum(t["total_distance_m"] for t in tracks if t["team_id"] == 0), 1),
                "1": round(sum(t["total_distance_m"] for t in tracks if t["team_id"] == 1), 1),
            },
            "tracks": tracks,
        }

    def _mock_player_performance(self) -> Dict[str, Any]:
        random.seed(42)
        players = []
        ratings = sorted([round(random.uniform(3.0, 9.5), 1) for _ in range(22)], reverse=True)
        for i, rating in enumerate(ratings):
            players.append({
                "track_id": i + 1,
                "team_id": 0 if i < 11 else 1,
                "role": "goalkeeper" if i in (0, 11) else "player",
                "player_display_name": f"Player {i + 1}",
                "total_distance_m": round(random.uniform(5000, 11000), 1),
                "avg_speed_kmh": round(random.uniform(7.0, 12.0), 2),
                "max_speed_kmh": round(random.uniform(22.0, 34.0), 2),
                "work_rate": random.choice(["High", "Medium", "Low"]),
                "activity_level": random.choice(["High", "Medium"]),
                "fatigue_level": random.choice(["Low", "Medium", "High"]),
                "performance_status": "Excellent" if rating >= 8 else "Good" if rating >= 6 else "Average",
                "player_rating": rating,
                "insight": "Very active and frequently involved in play. Covered a lot of ground.",
            })
        return {"status": "success", "source": "mock", "players": players}

    def _mock_possession(self) -> Dict[str, Any]:
        return {
            "status": "success",
            "source": "mock",
            "team_0_possession": 58.3,
            "team_1_possession": 41.7,
            "dominant_team": 0,
            "possessed_frames": 4800,
            "total_frames": 6000,
        }

    def _mock_tactical(self) -> Dict[str, Any]:
        return {
            "status": "success",
            "source": "mock",
            "teams": [
                {
                    "team_id": 0,
                    "compactness": "Compact",
                    "team_shape": "Balanced",
                    "attacking_zone": "Center",
                    "transition_speed": "Fast",
                    "build_up_style": "Short Passing Style",
                    "pressure_style": "High Press",
                    "metrics": {"compactness_m": 14.2, "avg_speed_kmh": 10.1},
                    "reasons": {"compactness": "players average 14.2 m from centroid"},
                },
                {
                    "team_id": 1,
                    "compactness": "Balanced",
                    "team_shape": "Wide",
                    "attacking_zone": "Right",
                    "transition_speed": "Medium",
                    "build_up_style": "Direct Style",
                    "pressure_style": "Mid Block",
                    "metrics": {"compactness_m": 20.1, "avg_speed_kmh": 8.8},
                    "reasons": {"compactness": "players average 20.1 m from centroid"},
                },
            ],
        }

    def _mock_match_report(self, home: str, away: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "source": "mock",
            "home_team_name": home,
            "away_team_name": away,
            "summary": f"{home} dominated the match with 58% possession. The standout performer was Player 7, rated 9.5/10. Tactically: {home} attacking, {away} counter-attacking.",
            "dominant_team": "Team 0",
            "man_of_the_match": 7,
            "weakest_player": 22,
            "man_of_the_match_display_name": "Player 7",
            "weakest_player_display_name": "Player 22",
            "teams": [
                {"team_id": 0, "style": "Attacking", "pressure": "High Press", "compactness": "Compact", "transition_speed": "Fast"},
                {"team_id": 1, "style": "Counter-Attacking", "pressure": "Mid Block", "compactness": "Balanced", "transition_speed": "Medium"},
            ],
            "key_insights": [
                f"{home} controlled possession (58%).",
                "Player 7 was the standout at 9.5/10 — Very active and frequently involved.",
                f"{home} played an Attacking game with a High Press and fast transitions.",
            ],
            "recommendations": [
                f"{away} should improve ball retention to contest possession.",
                f"{away} could push the defensive line higher to press.",
            ],
            "players": [],
        }

    def _mock_heatmap(self, team_id: int) -> Dict[str, Any]:
        import random
        random.seed(team_id)
        rows, cols = 272, 420  # 68m × 105m at 4px/m
        grid = [[round(random.uniform(0.0, 1.0), 3) for _ in range(cols)] for _ in range(rows)]
        return {
            "status": "success",
            "source": "mock",
            "team_id": team_id,
            "grid_rows": rows,
            "grid_cols": cols,
            "grid": grid,
            "pitch_length_m": 105.0,
            "pitch_width_m": 68.0,
            "px_per_meter": 4.0,
        }
