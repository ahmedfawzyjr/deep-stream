"""
Flask Microservice for Deep Stream AI & Generative AI Features.
Exposes REST endpoints for tactical AI breakdowns, prompt engineering execution, and LLM commentary.
"""

from flask import Flask, request, jsonify
from services.genai_service import GenAIService
from services.scouting_service import ScoutingService
from services.fantasy_service import FantasyService
from services.injury_service import InjuryRiskService
from services.referee_service import RefereeEvaluationService
from services.academy_service import AcademyGrowthService
from services.alphazero_pass import AlphaZeroPassEngine
from services.stock_market_service import PlayerStockMarketService
from services.co_manager import AICoManagerService
from services.epl_database import EPLDatabaseService
from services.analytics_service import FootballAnalyticsService
from services.possession_analytics_service import PossessionAnalyticsService
from services.yolo26_service import YOLO26AnalyticsService
from services.rtsp_streamer_service import RTSPStreamerService
from services.voice_commentary_service import AIVoiceCommentaryService
from services.tensorrt_accelerator_service import TensorRTAcceleratorService
from services.multicam_sync_service import MultiCamSyncService

app = Flask(__name__)
genai_engine = GenAIService()
scouting_engine = ScoutingService()
fantasy_engine = FantasyService()
injury_engine = InjuryRiskService()
referee_engine = RefereeEvaluationService()
academy_engine = AcademyGrowthService()
alphazero_engine = AlphaZeroPassEngine()
stock_engine = PlayerStockMarketService()
comanager_engine = AICoManagerService()
epl_engine = EPLDatabaseService()
football_analytics = FootballAnalyticsService(fps=25.0)
possession_analytics = PossessionAnalyticsService()
yolo26_analytics = YOLO26AnalyticsService()
rtsp_streamer = RTSPStreamerService()
voice_commentary = AIVoiceCommentaryService()
tensorrt_accelerator = TensorRTAcceleratorService()
multicam_sync = MultiCamSyncService()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'api_flask_genai',
        'version': '1.5.0'
    }), 200





@app.route('/api/v1/tactical-breakdown', methods=['POST'])
def generate_tactical_breakdown():
    data = request.get_json() or {}
    home_team = data.get('home_team', 'Arsenal')
    away_team = data.get('away_team', 'Chelsea')
    win_prob = data.get('win_prob', 0.55)

    commentary = genai_engine.generate_tactical_analysis(home_team, away_team, win_prob)
    return jsonify({
        'status': 'success',
        'home_team': home_team,
        'away_team': away_team,
        'genai_tactical_insight': commentary
    }), 200

@app.route('/api/v1/chatbot', methods=['POST'])
def chat_assistant():
    data = request.get_json() or {}
    user_prompt = data.get('prompt', 'What is the tactical form of Arsenal?')
    reply = genai_engine.process_chat_prompt(user_prompt)
    return jsonify({
        'status': 'success',
        'prompt': user_prompt,
        'response': reply
    }), 200

@app.route('/api/v1/scouting/similar', methods=['POST'])
def get_similar_players():
    data = request.get_json() or {}
    target_player = data.get('player_name', 'Bukayo Saka')
    top_k = data.get('top_k', 4)
    result = scouting_engine.find_similar_players(target_player, top_k)
    return jsonify({
        'status': 'success',
        'data': result
    }), 200

@app.route('/api/v1/tactics/scenario-simulate', methods=['POST'])
def simulate_scenario():
    data = request.get_json() or {}
    base_win_prob = data.get('base_win_prob', 0.55)
    sub_out = data.get('sub_out', 'p1')
    sub_in = data.get('sub_in', 'p9')
    tactic = data.get('tactic', 'high_press')

    result = scouting_engine.simulate_tactical_scenario(base_win_prob, sub_out, sub_in, tactic)
    return jsonify({
        'status': 'success',
        'simulation': result
    }), 200

@app.route('/api/v1/commentary/audio', methods=['POST'])
def get_audio_commentary():
    data = request.get_json() or {}
    home = data.get('home_team', 'Arsenal')
    away = data.get('away_team', 'Chelsea')
    minute = data.get('minute', 65)

    speech_text = genai_engine.generate_voice_tactical_commentary(home, away, minute)
    return jsonify({
        'status': 'success',
        'speech_text': speech_text,
        'home_team': home,
        'away_team': away,
        'minute': minute
    }), 200

@app.route('/api/v1/fantasy/predict', methods=['POST'])
def submit_fantasy_prediction():
    data = request.get_json() or {}
    user = data.get('username', 'Guest_User')
    winner = data.get('predicted_winner', 'ARG')
    score = data.get('predicted_score', '2-1')
    scorer = data.get('next_scorer', 'Messi')

    res = fantasy_engine.submit_user_prediction(user, winner, score, scorer)
    return jsonify(res), 200

@app.route('/api/v1/fantasy/leaderboard', methods=['GET'])
def get_fantasy_leaderboard():
    leaderboard = fantasy_engine.get_leaderboard(5)
    return jsonify({
        'status': 'success',
        'leaderboard': leaderboard
    }), 200

@app.route('/api/v1/analytics/fatigue-injury', methods=['POST'])
def get_fatigue_injury_analytics():
    data = request.get_json() or {}
    minute = data.get('minute', 65)
    temp = data.get('temperature', 28.0)
    result = injury_engine.predict_squad_fatigue(minute, temp)
    return jsonify({
        'status': 'success',
        'fatigue_analytics': result
    }), 200

@app.route('/api/v1/referee/evaluate', methods=['POST'])
def evaluate_referee():
    data = request.get_json() or {}
    ref_name = data.get('referee_name', 'Szymon Marciniak')
    result = referee_engine.evaluate_referee_performance(ref_name)
    return jsonify({
        'status': 'success',
        'referee_evaluation': result
    }), 200

@app.route('/api/v1/academy/predict-growth', methods=['POST'])
def predict_youth_growth():
    data = request.get_json() or {}
    player = data.get('player_name', 'Ethan Nwaneri')
    age = data.get('age', 17)
    rating = data.get('rating', 74)
    result = academy_engine.predict_youth_trajectory(player, age, rating)
    return jsonify({
        'status': 'success',
        'growth_prediction': result
    }), 200

@app.route('/api/v1/tactics/alphazero-pass', methods=['POST'])
def recommend_alphazero_pass():
    data = request.get_json() or {}
    holder = data.get('ball_holder', 'Lionel Messi')
    result = alphazero_engine.recommend_optimal_pass(holder)
    return jsonify({
        'status': 'success',
        'alphazero_pass_recommendation': result
    }), 200

@app.route('/api/v1/finance/player-stocks', methods=['GET'])
def get_player_stock_ticker():
    result = stock_engine.get_live_stock_ticker(65)
    return jsonify({
        'status': 'success',
        'stock_ticker': result
    }), 200

@app.route('/api/v1/tactics/co-manager', methods=['GET'])
def get_co_manager_advice():
    minute = int(request.args.get('minute', 68))
    result = comanager_engine.evaluate_tactical_status(minute)
    return jsonify({
        'status': 'success',
        'co_manager_advice': result
    }), 200

@app.route('/api/v1/epl/player-radar', methods=['GET'])
def get_epl_player_radar():
    player = request.args.get('player', 'Bukayo Saka')
    result = epl_engine.get_player_radar(player)
    return jsonify({
        'status': 'success',
        'player_radar': result
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


# ===========================================================================
# AI Football Analytics Endpoints (merged from graduation project)
# ===========================================================================

@app.route('/api/v1/football-analytics/speed-distance', methods=['POST'])
def get_speed_distance():
    """Per-player speed & distance analytics.
    Optional body: {"field_positions": [...]} for real CV pipeline output.
    Without it, uses synthetic demo data.
    """
    data = request.get_json() or {}
    field_positions = data.get('field_positions')
    result = football_analytics.compute_speed_distance(field_positions)
    return jsonify(result), 200


@app.route('/api/v1/football-analytics/player-performance', methods=['POST'])
def get_player_performance():
    """Per-player 0–10 rating, work rate, fatigue, and insight sentence."""
    data = request.get_json() or {}
    field_positions = data.get('field_positions')
    result = football_analytics.compute_player_performance(field_positions)
    return jsonify(result), 200


@app.route('/api/v1/football-analytics/possession', methods=['POST'])
def get_possession():
    """Field-space ball possession percentages (team 0 vs team 1)."""
    data = request.get_json() or {}
    field_positions = data.get('field_positions')
    gate_m = float(data.get('gate_m', 5.0))
    result = football_analytics.compute_possession(field_positions, gate_m=gate_m)
    return jsonify(result), 200


@app.route('/api/v1/football-analytics/tactical', methods=['POST'])
def get_tactical_profiles():
    """Team tactical profiles: compactness, pressure style, build-up, attacking zone."""
    data = request.get_json() or {}
    field_positions = data.get('field_positions')
    result = football_analytics.compute_tactical_profiles(field_positions)
    return jsonify(result), 200


@app.route('/api/v1/football-analytics/heatmap', methods=['POST'])
def get_heatmap():
    """Gaussian density heatmap grid for a team.
    Body: {"team_id": 0|1, "px_per_meter": 4.0, "field_positions": [...]}
    """
    data = request.get_json() or {}
    team_id = int(data.get('team_id', 0))
    px_per_meter = float(data.get('px_per_meter', 4.0))
    field_positions = data.get('field_positions')
    result = football_analytics.compute_heatmap(team_id, field_positions, px_per_meter)
    return jsonify(result), 200


@app.route('/api/v1/football-analytics/match-report', methods=['POST'])
def get_match_report():
    """Full AI match report: man-of-match, key insights, team tactics, recommendations."""
    data = request.get_json() or {}
    field_positions = data.get('field_positions')
    home_team = data.get('home_team', 'Team A')
    away_team = data.get('away_team', 'Team B')
    result = football_analytics.compute_match_report(field_positions, home_team, away_team)
    return jsonify(result), 200

# ===========================================================================
# Football Possession Analytics Endpoints (merged from possession project)
# GMM-based jersey color team clustering + YOLOv8 proximity possession tracking
# ===========================================================================

@app.route('/api/v1/possession-analytics/summary', methods=['POST'])
def get_possession_analytics_summary():
    """Full possession summary: %, timeline, dominant team, clustering method.
    Body: {"home_team": str, "away_team": str, "n_frames": int, "dist_threshold": float}
    """
    data = request.get_json() or {}
    home = data.get('home_team', 'Team A')
    away = data.get('away_team', 'Team B')
    n_frames = int(data.get('n_frames', 500))
    dist_threshold = float(data.get('dist_threshold', 80.0))
    result = possession_analytics.get_possession_summary(home, away, n_frames, dist_threshold)
    return jsonify(result), 200


@app.route('/api/v1/possession-analytics/trend', methods=['POST'])
def get_possession_trend():
    """Windowed possession trend for time-series chart.
    Body: {"home_team": str, "away_team": str, "n_frames": int, "window_size": int}
    """
    data = request.get_json() or {}
    home = data.get('home_team', 'Team A')
    away = data.get('away_team', 'Team B')
    n_frames = int(data.get('n_frames', 500))
    window_size = int(data.get('window_size', 50))
    result = possession_analytics.get_possession_trend(home, away, n_frames, window_size)
    return jsonify(result), 200


@app.route('/api/v1/possession-analytics/clustering', methods=['POST'])
def get_team_clustering():
    """GMM team clustering info: CIELAB centroids, jersey color, confidence, samples.
    Body: {"home_team": str, "away_team": str}
    """
    data = request.get_json() or {}
    home = data.get('home_team', 'Team A')
    away = data.get('away_team', 'Team B')
    result = possession_analytics.get_team_clustering_info(home, away)
    return jsonify(result), 200


@app.route('/api/v1/possession-analytics/player-breakdown', methods=['POST'])
def get_player_possession_breakdown():
    """Per-player possession frame count and percentage.
    Body: {"home_team": str, "away_team": str, "n_frames": int}
    """
    data = request.get_json() or {}
    home = data.get('home_team', 'Team A')
    away = data.get('away_team', 'Team B')
    n_frames = int(data.get('n_frames', 500))
    result = possession_analytics.get_player_possession_breakdown(home, away, n_frames)
    return jsonify(result), 200


@app.route('/api/v1/possession-analytics/export-csv', methods=['POST'])
def export_possession_csv():
    """Returns possession event log as downloadable CSV."""
    from flask import Response
    data = request.get_json() or {}
    home = data.get('home_team', 'Team A')
    away = data.get('away_team', 'Team B')
    n_frames = int(data.get('n_frames', 500))
    csv_content = possession_analytics.get_possession_csv(home, away, n_frames)
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment;filename=possession_{home}_vs_{away}.csv'}
    )


# ===========================================================================
# YOLO26 AI Football Analytics Endpoints
# Custom-trained YOLO26 detection, pose estimation, trajectory, & movement map
# ===========================================================================

@app.route('/api/v1/yolo26/pose-analysis', methods=['POST'])
def get_yolo26_pose_analysis():
    """17-keypoint skeleton pose estimation & biomechanical metrics."""
    data = request.get_json() or {}
    player_id = int(data.get('player_id', 7))
    result = yolo26_analytics.get_pose_analysis(player_id)
    return jsonify(result), 200


@app.route('/api/v1/yolo26/ball-trajectory', methods=['POST'])
def get_yolo26_ball_trajectory():
    """Parabolic ball trajectory path, flight curve, speed, and spin."""
    data = request.get_json() or {}
    n_points = int(data.get('n_points', 40))
    result = yolo26_analytics.get_ball_trajectory(n_points)
    return jsonify(result), 200


@app.route('/api/v1/yolo26/movement-map', methods=['POST'])
def get_yolo26_movement_map():
    """Field-wide player & ball movement trajectories."""
    result = yolo26_analytics.get_movement_map()
    return jsonify(result), 200


@app.route('/api/v1/yolo26/summary', methods=['GET', 'POST'])
def get_yolo26_summary():
    """YOLO26 model architecture performance metrics & feature state."""
    result = yolo26_analytics.get_model_summary()
    return jsonify(result), 200


# ===========================================================================
# Next Updates Services (RTSP Stream, Voice Commentary, TensorRT, MultiCam)
# ===========================================================================

# 1. RTSP & WebRTC Live Streaming
@app.route('/api/v1/rtsp/connect-stream', methods=['POST'])
def rtsp_connect_stream():
    data = request.get_json() or {}
    rtsp_url = data.get('rtsp_url', 'rtsp://stadium-cam.local/live')
    cam_name = data.get('camera_name', 'Stadium Camera')
    res = rtsp_streamer.connect_stream(rtsp_url, cam_name)
    return jsonify(res), 200

@app.route('/api/v1/rtsp/streams', methods=['GET', 'POST'])
def rtsp_get_streams():
    res = rtsp_streamer.get_active_streams()
    return jsonify(res), 200

@app.route('/api/v1/rtsp/frame-buffer-status', methods=['GET', 'POST'])
def rtsp_get_cuda_buffer_status():
    res = rtsp_streamer.get_cuda_buffer_status()
    return jsonify(res), 200


# 2. AI Multilingual Voice Commentary (AR / EN / FR)
@app.route('/api/v1/commentary/generate', methods=['POST'])
def commentary_generate():
    data = request.get_json() or {}
    lang = data.get('language', 'ar')
    event_type = data.get('event_type', 'shot')
    res = voice_commentary.generate_commentary(lang, event_type)
    return jsonify(res), 200

@app.route('/api/v1/commentary/live-feed', methods=['GET', 'POST'])
def commentary_get_live_feed():
    data = request.get_json() or {}
    lang = data.get('language', 'ar')
    res = voice_commentary.get_live_feed(lang)
    return jsonify(res), 200


# 3. NVIDIA TensorRT GPU Acceleration
@app.route('/api/v1/tensorrt/quantize', methods=['POST'])
def tensorrt_quantize():
    data = request.get_json() or {}
    model_name = data.get('model_name', 'YOLO26m-Football-Custom')
    target_precision = data.get('target_precision', 'INT8')
    res = tensorrt_accelerator.quantize_model(model_name, target_precision)
    return jsonify(res), 200

@app.route('/api/v1/tensorrt/benchmark', methods=['GET', 'POST'])
def tensorrt_get_benchmark():
    res = tensorrt_accelerator.get_benchmark_comparison()
    return jsonify(res), 200


# 4. Multi-Camera Stadium Synchronization (Zero Occlusion)
@app.route('/api/v1/multicam/sync', methods=['POST', 'GET'])
def multicam_sync_feeds():
    res = multicam_sync.synchronize_feeds()
    return jsonify(res), 200

@app.route('/api/v1/multicam/occlusion-status', methods=['GET', 'POST'])
def multicam_get_occlusion_status():
    res = multicam_sync.get_occlusion_status()
    return jsonify(res), 200


