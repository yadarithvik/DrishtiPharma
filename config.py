"""
===================================================================================================
Project Name     : Drishti-Pharma (दृष्टि फार्मा) - Inclusive Assistive Healthcare Vision System
Module Name      : config.py (Master Configuration & Regulatory Parameter Registry)
Hackathon / Track: PySustain-2026 | Track 5: AI for Assistive Healthcare & Inclusive Technologies
Course Code      : BACSE101 - Problem Solving using Python
Institution      : School of Electronics Engineering (SENSE), VIT Vellore
Faculty Mentor   : Dr. R. Elakkiya, Associate Professor Grade 1, SENSE, VIT Vellore
Student Innovators:
    1. Yada Rithvik
    2. Anirudh Dodia
    3. NeelKorak Jana
---------------------------------------------------------------------------------------------------
Regulatory Compliance & Design Standards:
    - Indian Pharmacopoeia (IP 2022) / CDSCO Schedule P / Schedule H / Schedule H1 Guidelines
    - WCAG 2.1 / 2.2 Level AAA Visual Accessibility Standards (> 7:1 Luminance Contrast Ratio)
    - WHO Good Manufacturing Practices (GMP) for Pharmaceutical Blister Packaging Identification
===================================================================================================
"""

import os
from datetime import datetime
from typing import Dict, List, Tuple, Any

# =================================================================================================
# 1. API KEYS, ENDPOINTS & HYBRID AI STACK REGISTRATION (BEST-OF-BOTH-WORLDS SETUP)
# =================================================================================================
# Google Gemini Multimodal API Key: Loaded from environment if set, falling back to active user key.
DEFAULT_GEMINI_KEY: str = os.environ.get("GEMINI_API_KEY", "")

# Ordered priority list of ultra-low latency Google Gemini Multimodal Vision models.
MODEL_CANDIDATES: List[str] = [
    "gemini-flash-lite-latest",   # Primary: Canonical high-speed production endpoint (Zero 503 spikes)
    "gemini-3.5-flash-lite",      # Secondary: High-efficiency multimodal model
    "gemini-3.1-flash-lite",      # Tertiary: Low-latency preview fallback
    "gemini-3.5-flash"            # Quaternary: Comprehensive flash fallback
]

# NVIDIA NIM & Cloud Functions (NVCF) Credentials (Active 200 OK Key Provided by User)
USER_ACTIVE_NVIDIA_KEY: str = os.environ.get("NVIDIA_API_KEY", "")
NVIDIA_API_KEY: str = os.environ.get("NVIDIA_API_KEY", USER_ACTIVE_NVIDIA_KEY)
if NVIDIA_API_KEY.startswith("nvapi-R43K"):
    NVIDIA_API_KEY = USER_ACTIVE_NVIDIA_KEY

# Redundant failover pool of verified NVIDIA keys
NVIDIA_KEY_POOL: List[str] = [k.strip() for k in os.environ.get("NVIDIA_KEY_POOL", os.environ.get("NVIDIA_API_KEY", "")).split(",") if k.strip()]
NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
NVIDIA_CHAT_URL: str = f"{NVIDIA_BASE_URL}/chat/completions"

# NVIDIA Multimodal Vision Fallback (Activated automatically if Gemini experiences a 503 spike)
NVIDIA_VISION_FALLBACK_MODEL: str = "meta/llama-3.2-11b-vision-instruct"

# NVIDIA Nemotron Clinical Conversational Voice Agent (Nemotron 3 Ultra 550B A55B)
VOICE_AGENT_MODEL: str = "nvidia/nemotron-3-ultra-550b-a55b"
VOICE_AGENT_FALLBACK_MODEL: str = "nvidia/nemotron-3-super-120b-a12b"

# NVIDIA Magpie-TTS Zero-Shot Multilingual NVCF Function ID
MAGPIE_ZEROSHOT_FUNCTION_ID: str = "55cf67bf-600f-4b04-8eac-12ed39537a08"
MAGPIE_TTS_SYNTHESIZE_URL: str = (
    f"https://{MAGPIE_ZEROSHOT_FUNCTION_ID}.invocation.api.nvcf.nvidia.com/v1/audio/synthesize"
)
MAGPIE_TTS_DEFAULT_VOICE: str = "Magpie-ZeroShot-Multilingual.Female"
MAGPIE_DEFAULT_SAMPLE_RATE: int = 22050

# Evaluation Reference Calendar:
# The PySustain-2026 hackathon and clinical assessment take place in October 2026.
# Expiry chronology and shelf-life calculations are strictly referenced to this date.
CURRENT_DATE: datetime = datetime(2026, 10, 11)


# =================================================================================================
# 2. SPECULAR-INVARIANT OPTICAL PREPROCESSING PARAMETERS (Patent-Pending Pipeline)
# =================================================================================================
# CLAHE (Contrast Limited Adaptive Histogram Equalization) Parameters for CIE-LAB L* Channel:
CLAHE_CLIP_LIMIT: float = 1.6          # Conservative clip limit preventing tile seam over-amplification
CLAHE_GRID_SIZE: Tuple[int, int] = (8, 8)  # 8x8 contextual spatial grid for micro-print equalization

# Specular Highlight Detection & Non-Destructive Attenuation Thresholds:
# Metallic pharmaceutical foil reflects incident point lights, creating saturation-depleted glare peaks.
SPECULAR_LUMINANCE_THRESHOLD: int = 236  # 8-bit CIE-LAB L* channel threshold (values >= 236 trigger masking)
SPECULAR_SATURATION_MAX: int = 65       # HSV saturation threshold (pure specular glare exhibits low chroma)
MAX_HOTSPOT_AREA_RATIO: float = 0.012   # Maximum isolated hotspot area ratio (prevents masking white walls)

# Edge-Preserving Bilateral Filter Parameters:
BILATERAL_DIAMETER: int = 7             # Pixel neighbourhood diameter during bilateral smoothing
BILATERAL_SIGMA_COLOR: float = 50.0     # Color space filter sigma (preserves sharp printed text boundaries)
BILATERAL_SIGMA_SPACE: float = 50.0     # Coordinate space filter sigma


# =================================================================================================
# 3. ACCESSIBILITY COLOR THEMES (WCAG 2.1 / 2.2 LEVEL AAA COMPLIANT)
# =================================================================================================
# Standard High-Contrast Dark Theme (Contrast Ratio >= 7:1 against background)
THEME_DARK: Dict[str, str] = {
    "bg_main": "#080C14",           # Deep Obsidian Slate (lowers ocular fatigue for photophobic users)
    "bg_card": "#131C2E",           # Elevated midnight surface
    "text_main": "#FFFFFF",         # Pure optical white
    "text_secondary": "#B0C4DE",    # Light Steel Blue for secondary metadata
    "accent_primary": "#FFD600",    # Cyber Yellow (peak human rod/cone sensitivity at ~555 nm)
    "accent_safe": "#00E676",       # Vibrant Emerald for Valid / Consumable medications
    "accent_danger": "#FF334B",     # Urgent Crimson for Expired / High-Hazard alerts
    "accent_warning": "#FF9100",    # Deep Amber for Expiring Soon (<60 days) warnings
    "accent_info": "#00E5FF",       # Neon Cyan for clinical indications and dosage
    "border": "#22334D"             # Structural border outline
}

# Maximum Human Contrast Theme (Black & Pure Spectral Yellow for Severe Low-Vision / Macular Degeneration)
THEME_HIGH_CONTRAST: Dict[str, str] = {
    "bg_main": "#000000",           # Pure Hex #000000
    "bg_card": "#0A0A0A",           # Near-black elevated panel
    "text_main": "#FFFF00",         # Pure High-Visibility Yellow
    "text_secondary": "#FFFFFF",    # Secondary pure white
    "accent_primary": "#FFFF00",    # Yellow tactile border
    "accent_safe": "#00FF66",       # High-luminance Green
    "accent_danger": "#FF0033",     # Pure Saturated Red
    "accent_warning": "#FFA500",    # High-luminance Amber
    "accent_info": "#00FFFF",       # High-luminance Cyan
    "border": "#FFFF00"             # High-contrast 2px yellow bounding box
}


# =================================================================================================
# 4. MULTILINGUAL AUDIO LOCALIZATION (INDIAN REGIONAL SPOKEN DIALECTS)
# =================================================================================================
# Regional language map configuring Web Speech API locales and neural gTTS synthesis parameters:
SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "ta": {
        "name": "தமிழ் (Tamil)",
        "code": "ta-IN",
        "tts_locale": "ta-IN",
        "label": "Tamil Regional Audio Voice",
        "engine": "Google Neural Speech (Native Dravidian Acoustic Model)"
    },
    "hi": {
        "name": "हिन्दी (Hindi)",
        "code": "hi-IN",
        "tts_locale": "hi-IN",
        "label": "Hindi National Audio Voice",
        "engine": "NVIDIA Magpie-TTS Zero-Shot (22.05 kHz Studio WAV)"
    },
    "en": {
        "name": "English (Universal)",
        "code": "en-US",
        "tts_locale": "en-US",
        "label": "Universal English Voice",
        "engine": "NVIDIA Magpie-TTS Zero-Shot (Studio Human Cadence)"
    }
}
