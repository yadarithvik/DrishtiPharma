"""
===================================================================================================
Project Name     : Drishti-Pharma (दृष्टि फार्मा) - Inclusive Assistive Healthcare Vision System
Package Name     : core (Clinical Vision & Verification Subsystems)
Hackathon / Track: PySustain-2026 | Track 5: AI for Assistive Healthcare & Inclusive Technologies
Course Code      : BACSE101 - Problem Solving using Python
Institution      : School of Electronics Engineering (SENSE), VIT Vellore
Faculty Mentor   : Dr. R. Elakkiya, Associate Professor Grade 1, SENSE, VIT Vellore
Student Innovators:
    1. Yada Rithvik
    2. Anirudh Dodia
    3. NeelKorak Jana
---------------------------------------------------------------------------------------------------
Package Architecture Overview:
    - vision_engine.py : Specular-Invariant Optical Preprocessor (Glare Attenuation & Micro-Print)
    - ai_engine.py     : Gemini Multimodal Zero-Hallucination VLM Pharmaceutical Extractor
    - safety_guardian.py: Deterministic Expiry Calendar & Indian Pharmacopoeia Shelf-Life Engine
    - voice_engine.py  : Multilingual Neural & Accessible Web Speech Audio Feedback System
    - evaluation.py    : Empirical Quantitative Benchmarking & Latency Profiling Engine
===================================================================================================
"""

from .vision_engine import SpecularInvariantPreprocessor, preprocessor
from .ai_engine import MultimodalAIEngine, ai_engine
from .safety_guardian import SafetyGuardian, safety_guardian, PHARMACOPOEIA_SHELF_LIFE_MONTHS
from .voice_engine import VoiceEngine, voice_engine
from .evaluation import PerformanceEvaluator, evaluator
from .conversational_agent import NemotronVoiceAgent, conversational_agent

__all__ = [
    "SpecularInvariantPreprocessor",
    "preprocessor",
    "MultimodalAIEngine",
    "ai_engine",
    "SafetyGuardian",
    "safety_guardian",
    "PHARMACOPOEIA_SHELF_LIFE_MONTHS",
    "VoiceEngine",
    "voice_engine",
    "PerformanceEvaluator",
    "evaluator",
    "NemotronVoiceAgent",
    "conversational_agent"
]
