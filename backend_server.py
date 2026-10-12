"""
===================================================================================================
Project Name     : Drishti-Pharma (दृष्टि फार्मा) - Inclusive Multimodal Assistive Vision System
Module Name      : backend_server.py (100% Python Multi-Threaded Application & REST API Server)
Hackathon / Track: PySustain-2026 | Track 5: AI for Assistive Healthcare & Inclusive Technologies
Course Code      : BACSE101 - Problem Solving using Python
Institution      : School of Electronics Engineering (SENSE), VIT Vellore
Faculty Mentor   : Dr. R. Elakkiya, Associate Professor Grade 1, SENSE, VIT Vellore
Student Innovators:
    1. Yada Rithvik       (Reg No: 26BVD0190)
    2. Anirudh Dodia      (Reg No: 26BVD0100)
    3. NeelKorak Jana     (Reg No: 26BVD0113)
---------------------------------------------------------------------------------------------------
100% Python Core Architecture:
    - Built using Python standard library `http.server.ThreadingHTTPServer`.
    - Serves the local interactive web interface (http://localhost:8080/index.html).
    - Bridges client-side webcam capture with the Python Specular-Invariant Vision Engine,
      Google Gemini Multimodal VLM reasoning, and Deterministic Indian Pharmacopoeia Guardian.
    - Endpoints:
        * POST /api/scan   : Specular Attenuation -> Gemini Vision -> Expiry Verification -> Audio
        * POST /api/tts    : High-fidelity regional audio speech synthesis (Tamil, Hindi, English)
        * GET  /api/health : Microservice diagnostic status check
===================================================================================================
"""

import os
import sys
import json
import base64
import time
import functools
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import urllib.parse
import cv2
import numpy as np
from PIL import Image
import io

# Ensure Windows terminal outputs UTF-8 cleanly
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add project root directory to sys.path
CURRENT_DIR: str = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import config
from core.vision_engine import preprocessor
from core.ai_engine import ai_engine
from core.safety_guardian import safety_guardian
from core.voice_engine import VoiceEngine, voice_engine
from core.conversational_agent import conversational_agent

FRONTEND_DIR: str = os.path.join(CURRENT_DIR, "frontend")


class DrishtiRequestHandler(SimpleHTTPRequestHandler):
    """
    100% Python HTTP Request Handler serving frontend assets and RESTful clinical APIs.
    """

    def end_headers(self):
        """Disables browser caching completely to guarantee live UI updates on reload."""
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        """Dispatches POST requests to appropriate clinical handlers."""
        if self.path == "/api/scan":
            self.handle_api_scan()
        elif self.path == "/api/tts":
            self.handle_api_tts()
        elif self.path == "/api/chat":
            self.handle_api_chat()
        else:
            self.send_error(404, "Endpoint not found")

    def do_GET(self):
        """Dispatches GET requests or serves frontend static assets."""
        if self.path == "/api/health":
            self.send_json_response({
                "status": "healthy",
                "service": "Drishti-Pharma Best-of-Both-Worlds Hybrid AI Server",
                "hybrid_stack": {
                    "vision_core": "Google Gemini Multimodal Vision (3.5/3.1 Flash)",
                    "vision_fallback": f"NVIDIA NIM ({config.NVIDIA_VISION_FALLBACK_MODEL})",
                    "speech_en_hi": "NVIDIA Magpie-TTS Zero-Shot (22.05 kHz Studio Audio)",
                    "speech_ta": "Google Neural Speech (Native Tamil)",
                    "dialogue_agent": "NVIDIA Nemotron 3 Ultra 550B A55B (Conversational Voice)"
                },
                "python_version": sys.version,
                "timestamp": datetime.now().isoformat()
            })
        else:
            super().do_GET()

    def handle_api_scan(self):
        """
        Processes captured frame through:
            1. Specular-Invariant Optical Preprocessing (VisionEngine)
            2. Multimodal AI Extraction with Zero-Hallucination Policy (AIEngine)
            3. Deterministic Safety Guardian with Indian Pharmacopoeia Shelf-Life Derivation
            4. Trilingual Conversational Verdict Synthesis (English, Tamil, Hindi)
        """
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            payload = json.loads(post_body.decode("utf-8"))

            image_data = payload.get("image")
            if not image_data:
                self.send_json_response({"is_medicine": False, "error_message": "No image data provided"}, 400)
                return

            if "," in image_data:
                image_data = image_data.split(",", 1)[1]

            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img_bgr is None:
                self.send_json_response({"is_medicine": False, "error_message": "Could not decode image"}, 400)
                return

            # Stage 1: Specular-Invariant Optical Preprocessing
            enhanced_bgr, optical_metrics = preprocessor.process_image(img_bgr)

            # Encode enhanced image to base64 for side-by-side inspection
            _, buffer = cv2.imencode(".jpg", enhanced_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
            enhanced_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

            # Stage 2: Multimodal AI Analysis with Gemini (with NVIDIA Failover)
            ai_result = ai_engine.analyze_blister_pack(img_bgr, enhanced_bgr)

            # Ground the conversational Nemotron Voice Agent with the scanned medication context
            if ai_result.get("is_medicine"):
                conversational_agent.set_medication_context(
                    ai_result.get("medicine") or {},
                    ai_result.get("expiry_guardian") or {}
                )

            # Stage 3: Combine optical metrics and AI diagnostics
            response_payload = {
                "is_medicine": ai_result.get("is_medicine", False),
                "error_message": ai_result.get("error_message"),
                "enhanced_image": enhanced_b64,
                "optical_metrics": optical_metrics,
                "medicine": ai_result.get("medicine"),
                "expiry_guardian": ai_result.get("expiry_guardian"),
                "conversational_verdicts": ai_result.get("conversational_verdicts"),
                "clinical_alerts": ai_result.get("clinical_alerts", []),
                "diagnostics": ai_result.get("diagnostics", {})
            }

            self.send_json_response(response_payload)

        except Exception as e:
            print(f"[API Error] /api/scan failed: {e}")
            self.send_json_response({
                "is_medicine": False,
                "error_message": f"Server processing error: {str(e)}"
            }, 500)

    def handle_api_tts(self):
        """
        Synthesizes high-fidelity natural spoken audio using the Best-of-Both-Worlds Hybrid Stack:
            - Hindi & English: NVIDIA Magpie-TTS Zero-Shot (22.05 kHz Studio WAV)
            - Tamil: Google Neural TTS (ta-IN native phonetics)
        """
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            payload = json.loads(post_body.decode("utf-8"))

            text = payload.get("text", "")
            lang = payload.get("lang") or payload.get("language") or "en"
            if not text:
                self.send_json_response({"error": "No text provided"}, 400)
                return

            res = voice_engine.synthesize(text, lang)
            if not res.get("success") or not res.get("audio_bytes"):
                self.send_json_response({"error": "TTS synthesis failed"}, 500)
                return

            mime_type = res.get("mime_type", "audio/wav")
            audio_b64 = f"data:{mime_type};base64," + base64.b64encode(res["audio_bytes"]).decode("utf-8")
            self.send_json_response({
                "audio": audio_b64,
                "lang": lang,
                "format": res.get("format"),
                "engine": res.get("engine"),
                "latency": res.get("latency")
            })

        except Exception as e:
            print(f"[API Error] /api/tts failed: {e}")
            self.send_json_response({"error": str(e)}, 500)

    def handle_api_chat(self):
        """
        Interactive Clinical Voice Dialogue powered by NVIDIA Nemotron 3 Ultra 550B A55B.
        Answers patient questions regarding dosage, food timing, morning/night, and precautions.
        """
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            payload = json.loads(post_body.decode("utf-8"))

            message = payload.get("message", "").strip()
            lang = payload.get("lang") or payload.get("language") or "en"
            if not message:
                self.send_json_response({"error": "No question message provided"}, 400)
                return

            turn = conversational_agent.chat_turn(message, language=lang, generate_audio=True)
            self.send_json_response(turn)

        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[API Error] /api/chat failed: {e}", flush=True)
            try:
                self.send_json_response({"error": str(e)}, 500)
            except Exception:
                pass

    def send_json_response(self, data: dict, status_code: int = 200):
        """Helper to send serialized JSON HTTP response with CORS headers."""
        try:
            body = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass

    def do_OPTIONS(self):
        """Handles CORS preflight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def handle_one_request(self):
        """Gracefully ignores client disconnects."""
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass


def free_port(port: int = 8080):
    """Ensures port 8080 is immediately available by terminating any stale listening process."""
    current_pid = os.getpid()
    try:
        import psutil
        for conn in psutil.net_connections(kind="inet"):
            if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                pid = conn.pid
                if pid and pid != current_pid:
                    try:
                        proc = psutil.Process(pid)
                        print(f"[Drishti-Pharma] Reclaiming port {port} (Terminated stale PID {pid}: {proc.name()})")
                        proc.kill()
                        proc.wait(timeout=2)
                    except Exception:
                        pass
        time.sleep(0.2)
    except Exception:
        pass


def run_server(port: int = 8080):
    """Boots 100% Python Multi-Threaded HTTP Server."""
    free_port(port)
    server_address = ("", port)
    handler = functools.partial(DrishtiRequestHandler, directory=FRONTEND_DIR)
    ThreadingHTTPServer.allow_reuse_address = True
    httpd = ThreadingHTTPServer(server_address, handler)
    httpd.daemon_threads = True
    print("=" * 80)
    print("  DRISHTI-PHARMA (दृष्टि फार्मा) - 100% PYTHON SERVER RUNNING")
    print("  PySustain-2026 | BACSE101 Problem Solving using Python | SENSE VIT Vellore")
    print("  Faculty Mentor: Dr. R. Elakkiya | Team: Yada Rithvik, Anirudh Dodia, NeelKorak Jana")
    print("=" * 80)
    print(f"[Drishti-Pharma] Serving interactive application at: http://localhost:{port}/index.html\n", flush=True)

    while True:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Drishti-Pharma] Server stopped.", flush=True)
            break
        except Exception as e:
            print(f"[Drishti-Pharma] Server notice: {e}, resuming...", flush=True)
            time.sleep(0.5)


if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run_server(port)
