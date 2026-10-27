"""
===================================================================================================
Project Name     : Drishti-Pharma (दृष्टि फार्मा) - Inclusive Multimodal Assistive Vision System
Module Name      : main.py (Master Python Launcher & CLI Diagnostic Tool)
Hackathon / Track: PySustain-2026 | Track 5: AI for Assistive Healthcare & Inclusive Technologies
Course Code      : BACSE101 - Problem Solving using Python
Institution      : School of Electronics Engineering (SENSE), VIT Vellore
Faculty Mentor   : Dr. R. Elakkiya, Associate Professor Grade 1, SENSE, VIT Vellore
Student Innovators:
    1. Yada Rithvik
    2. Anirudh Dodia
    3. NeelKorak Jana
---------------------------------------------------------------------------------------------------
Execution Modes:
    1. Default Server Mode:
           python main.py
       Launches the multi-threaded Python backend and serves the Drishti-Pharma application.

    2. Single Image CLI Analysis:
           python main.py --scan path/to/image.jpg
       Runs optical preprocessing, Gemini VLM extraction, and clinical expiry validation in terminal.
===================================================================================================
"""

import sys
import os
import argparse
import webbrowser
import threading
import time

# Ensure Windows terminal outputs UTF-8 cleanly without CP1252 charmap crashes
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure local project directory is on sys.path
CURRENT_DIR: str = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from backend_server import run_server
from core.vision_engine import preprocessor
from core.ai_engine import ai_engine
from core.safety_guardian import safety_guardian


def resolve_image_path(image_path: str) -> str:
    """Resolves image path across current dir, project root, and desktop with friendly fallback."""
    if not image_path or image_path.strip().lower() in ["path/to/medicine_sample.jpg", "path/to/image.jpg", "none", ""]:
        image_path = "medicine_sample.jpg"

    # Candidates in order of priority
    candidates = [
        image_path,
        os.path.join(CURRENT_DIR, image_path),
        os.path.join(CURRENT_DIR, os.path.basename(image_path)),
        os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop", image_path),
        os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop", os.path.basename(image_path)),
        os.path.join(os.path.expanduser("~"), "Desktop", image_path),
        os.path.join(os.path.expanduser("~"), "Desktop", os.path.basename(image_path)),
    ]

    for candidate in candidates:
        if candidate and os.path.exists(candidate) and os.path.isfile(candidate):
            return os.path.abspath(candidate)

    # Fallback to project sample if available
    default_sample = os.path.join(CURRENT_DIR, "medicine_sample.jpg")
    if os.path.exists(default_sample):
        print(f"[Notice] Requested image '{image_path}' not found.")
        print(f"[Notice] Automatically falling back to standard sample: {default_sample}\n")
        return default_sample

    return image_path


def run_single_scan_cli(image_path: str):
    """Executes single-image analysis from the terminal."""
    import cv2

    resolved_path = resolve_image_path(image_path)
    if not os.path.exists(resolved_path):
        print(f"[Error] Image file not found: {image_path}")
        print("Available samples in project directory:")
        print("  - medicine_sample.jpg   (Valid Cyclopam blister pack)")
        print("  - expired_sample.jpg    (Expired Augmentin 625 Duo)")
        print("  - cut_strip_sample.jpg  (Cut Paracetamol strip with severed EXP)")
        sys.exit(1)

    print(f"[CLI] Loading packaging image: {resolved_path}...")
    img_bgr = cv2.imread(resolved_path)
    if img_bgr is None:
        print("[Error] Failed to decode image file.")
        sys.exit(1)

    print("[CLI] Running Specular-Invariant Optical Preprocessor...")
    enhanced_bgr, metrics = preprocessor.process_image(img_bgr)
    print(f"      Contrast Gain        : +{metrics['contrast_improvement_delta']}%")
    print(f"      Specular Rejection   : {metrics['specular_rejection_pct']}%")

    print("[CLI] Running Gemini Multimodal AI Engine with Zero-Hallucination Policy...")
    ai_result = ai_engine.analyze_blister_pack(img_bgr, enhanced_bgr)

    print("\n" + "=" * 60)
    print("                 PHARMACEUTICAL VERDICT")
    print("=" * 60)
    if not ai_result.get("is_medicine", False):
        print(f"STATUS  : SAFEGUARD ACTIVATED (No medicine detected)")
        print(f"MESSAGE : {ai_result.get('error_message')}")
    else:
        med = ai_result.get("medicine", {})
        guard = ai_result.get("expiry_guardian", {})
        print(f"BRAND NAME     : {med.get('medicine_name')}")
        print(f"GENERIC ACTIVE : {med.get('generic_name')}")
        print(f"STRENGTH       : {med.get('dosage_strength')}")
        print(f"PRINTED MFG    : {med.get('manufacturing_date_raw')}")
        print(f"PRINTED EXP    : {med.get('expiry_date_raw')}")
        print(f"EXPIRY STATUS  : {guard.get('badge')}")
        print(f"DAYS REMAINING : {guard.get('days_remaining')} days")
        print(f"DERIVED EXPIRY : {'Yes (IP 2022 Monograph)' if guard.get('is_derived_from_mfd') else 'No'}")
        
        verdicts = ai_result.get("conversational_verdicts", {})
        print("\nCONVERSATIONAL AUDIO VERDICT:")
        print(f"  [English]: {verdicts.get('en')}")
        print(f"  [Tamil]  : {verdicts.get('ta')}")
        print(f"  [Hindi]  : {verdicts.get('hi')}")
    print("=" * 60 + "\n")


def launch_server_and_browser(port: int = 8080):
    """Launches the backend server and opens the browser once ready."""
    def open_browser():
        url = f"http://localhost:{port}/index.html"
        import urllib.request
        # Poll server until ready before opening browser to prevent connection refused
        for _ in range(40):
            try:
                with urllib.request.urlopen(f"http://localhost:{port}/api/health", timeout=0.5) as resp:
                    if resp.status == 200:
                        break
            except Exception:
                time.sleep(0.5)
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()
    run_server(port)


def main():
    """Application entry point."""
    parser = argparse.ArgumentParser(
        description="Drishti-Pharma - Inclusive Multimodal Assistive Vision System"
    )
    parser.add_argument(
        "--scan", 
        type=str,
        nargs="?",
        const="medicine_sample.jpg",
        default=None,
        help="Analyze a single packaging image from file path via CLI (defaults to medicine_sample.jpg)"
    )
    parser.add_argument(
        "--port", 
        type=int, 
        default=8080, 
        help="Port to run the application server on (default: 8080)"
    )

    args = parser.parse_args()

    if args.scan is not None:
        run_single_scan_cli(args.scan)
    else:
        launch_server_and_browser(args.port)


if __name__ == "__main__":
    main()
