# Drishti-Pharma: "The Best-of-Both-Worlds" Hybrid AI Architecture
### Production Assistive Vision, Conversational Dialogue & Multilingual Audio Synthesis
**PySustain-2026 | Track 5: AI for Assistive Healthcare & Inclusive Technologies**  
**Course Code:** BACSE101 – Problem Solving using Python | **SENSE, VIT Vellore**  
**Faculty Mentor:** Dr. R. Elakkiya, Associate Professor Grade 1, SENSE, VIT Vellore  
**Innovators:** Yada Rithvik (`26BVD0190`), Anirudh Dodia (`26BVD0100`), NeelKorak Jana (`26BVD0113`)  

---

## 1. Architectural Philosophy: Why Single-Model Systems Fail

In assistive healthcare for visually impaired and blind patients, no single cloud or edge model excels across all three critical operational dimensions:
1. **Micro-Typography & Specular OCR**: Reading 4pt–6pt embossed expiration dates, dot-matrix batch codes, and multi-ingredient nutraceutical salts on reflective aluminum foil blister packs.
2. **Empathetic Spoken Reasoning**: Answering real-time patient questions (e.g. *"Should I take this before or after meals?"*) in concise, warm, spoken-friendly sentences without verbose markdown, asterisks, or disclaimers that confuse screen readers.
3. **Regional Multilingual Acoustic Quality**: Synthesizing natural human-sounding speech in Indian regional languages (Hindi, Tamil, English) with natural breathing and clinical cadence.

To address these distinct challenges, Drishti-Pharma establishes **The "Best-of-Both-Worlds" Hybrid Architecture**, combining Google's Multimodal Vision leadership with NVIDIA's conversational intelligence and studio neural speech synthesis.

```
                              ┌────────────────────────────────────────┐
                              │       Handheld Medicine Packaging      │
                              │      (Reflective Foil / Blister Pack)   │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │  Patent-Pending Specular Preprocessor   │
                              │     • HSV Saturation Decoupling        │
                              │     • Fast-Telea Gradient Inpainting   │
                              │     • CIE-LAB L* Adaptive CLAHE         │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                    ┌────────────────────────────────────────────────────────────┐
                    │               HYBRID MULTIMODAL VISION CORE                │
                    │   Primary: Google Gemini 3.5/3.1 Flash (Macro Crop OCR)   │
                    │   Failover: NVIDIA NIM Meta Llama 3.2 11B Vision Instruct  │
                    └─────────────────────────────┬──────────────────────────────┘
                                                  │
                                                  ▼
                    ┌────────────────────────────────────────────────────────────┐
                    │            DETERMINISTIC CLINICAL SAFETY GUARDIAN          │
                    │   • Indian Pharmacopoeia (IP 2022) Monograph Shelf-Life    │
                    │   • Reference Chronology Verification (October 2026)       │
                    │   • Schedule H / H1 / OTC Restriction Registry             │
                    └──────────────────────┬──────────────┬──────────────────────┘
                                           │              │
                   Scanned Context Grounding│              │Clinical Verdict
                                           ▼              ▼
┌────────────────────────────────────────────────┐  ┌────────────────────────────────────────┐
│   NVIDIA Nemotron 3 Ultra 550B A55B Dialogue   │  │      HYBRID REGIONAL SPEECH ENGINE     │
│   • Sub-second spoken medical Q&A              │  │  • Hindi (hi-IN): NVIDIA Magpie-TTS    │
│   • Grounded in active scanned medicine context│  │  • English (en-US): NVIDIA Magpie-TTS  │
│   • Zero markdown / pure spoken sentences      │  │  • Tamil (ta-IN): Google Neural Speech │
└────────────────────────┬───────────────────────┘  └───────────────────┬────────────────────┘
                         │                                              │
                         └──────────────────────┬───────────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │   Accessible Web & Voice Client   │
                              │  (http://localhost:8080/index.html│
                              └───────────────────────────────────┘
```

---

## 2. Empirical Benchmark Evidence: Google Gemini vs. NVIDIA NIM

The hybrid architecture was derived directly from empirical benchmarking across real Indian pharmaceutical packages and control conditions:

### Vision OCR Benchmark Summary

| Test Subject | Challenge | Google Gemini 3.5/3.1 Flash | NVIDIA NIM (Nemotron Nano / Llama 3.2) | Architectural Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Zincovit** | Dense blister with 20+ vitamins, minerals, and grape seed extract | **Brand**: `Zincovit`<br>**Salts**: Full 20+ formulation captured<br>**Mfr**: `Apex Laboratories`<br>**Latency**: **10.0s** 🏆 | Read brand; missed secondary minerals; misattributed manufacturer.<br>**Latency**: 48.7s | **Google Gemini Selected as Primary Vision Core** due to higher micro-typography comprehension. |
| **Gelusil MPS** | Torn foil strip with faint dot-matrix batch codes | **Brand**: `Gelusil MPS`<br>**Batch**: `2618046E` *(Exact match)*<br>**Mfr**: `Pfizer Limited` 🏆 | Identified antacid salts; missed terminal 'E' in batch.<br>**Latency**: 26.3s | **Google Gemini Selected** for precise character-level alphanumeric decoding. |
| **Cyclopam** | Severe specular glare on embossed foil | **Brand**: `Cyclopam`<br>**Salts**: Both `Dicyclomine` + `Paracetamol`<br>**EXP**: Decoded embossed date 🏆 | Read `Paracetamol`; missed `Dicyclomine HCl`.<br>**Latency**: 10.4s | **Google Gemini Selected** for complete multi-salt identification. |
| **Empty Bare Hand** | Zero-hallucination safety policy | `is_medicine: false`<br>**Hallucinations**: **0%** 🤝 | `is_medicine: false`<br>**Hallucinations**: **0%** 🤝 | **Tie**: Both models strictly adhere to zero-hallucination rejection on bare skin. |

---

## 3. Speech Synthesis Benchmark: Why Hybrid Audio is Essential

| Language / Dialect | Google Neural Engine (`gTTS`) | NVIDIA Magpie-TTS Zero-Shot (`55cf67bf...`) | Hybrid Deployment Strategy |
| :--- | :--- | :--- | :--- |
| **English (`en-US`)** | 62.5 KB MP3 • Web standard clarity • Slightly synthetic cadence | **241 KB Linear PCM WAV (22.05 kHz)** • Natural human breathing • Warm doctor inflection 🏆 | **NVIDIA Magpie-TTS Zero-Shot** deployed as Primary for English. |
| **Hindi (`hi-IN`)** | 76.2 KB MP3 • Accurate phonemes • Monotone inflection | **299 KB Linear PCM WAV (22.05 kHz)** • Flawless handling of clinical phrases (*"समाप्ति तिथि"*, *"सेवन के लिए सुरक्षित"*) 🏆 | **NVIDIA Magpie-TTS Zero-Shot** deployed as Primary for Hindi. |
| **Tamil (`ta-IN`)** | **84.8 KB MP3 • Native South Indian Dravidian acoustic dictionary** • Authentic pronunciation 🏆 | Preview NVCF microservice lacks native Tamil acoustic model (forced English phonetic fallback) | **Google Neural Speech** deployed as Primary for Tamil. |

---

## 4. Real-Time Conversational Dialogue: NVIDIA Nemotron 3 Ultra 550B A55B

Visually impaired patients frequently require follow-up guidance after a medicine is identified:
- *"Should I take this before or after food?"*
- *"Can I take it before going to sleep?"*
- *"What should I do if I missed a dose?"*
- *"How should I store this blister pack?"*

Standard LLMs respond with markdown headers, asterisks, bullet points, and lengthy legal disclaimers. When read aloud by screen readers, asterisks and bullet symbols create auditory confusion.

### Why NVIDIA Nemotron 3 Ultra 550B A55B Excels for Voice:
1. **Ultra-Scale Medical Dialogue (550B MoE Architecture)**: Provides deep clinical reasoning grounded in active pharmaceutical packaging context.
2. **Spoken-Only Formatting**: Adheres strictly to spoken conversational guidelines (2–3 clear sentences, zero asterisks, zero markdown).
3. **Contextual Grounding**: When `/api/scan` processes a medication, it immediately binds the medicine's brand name, active salts, expiry status, and schedule category into `conversational_agent.py`.
4. **Integrated Neural Speech**: Responses from `/api/chat` are immediately vocalized using the hybrid audio engine (Magpie-TTS for EN/HI, Google for TA).

---

## 5. Implementation Summary & File Mapping

| Component | File Path | Role in Hybrid Architecture |
| :--- | :--- | :--- |
| **Configuration** | [`config.py`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/config.py) | Registers Gemini & NVIDIA credentials, NVCF function IDs, and model constants. |
| **Vision Core** | [`core/ai_engine.py`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/core/ai_engine.py) | Primary Google Gemini Vision OCR with automatic failover to NVIDIA NIM Llama 3.2 Vision. |
| **Speech Engine** | [`core/voice_engine.py`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/core/voice_engine.py) | Hybrid audio router (Magpie-TTS for EN/HI, Google Neural for TA, with disk caching). |
| **Voice Agent** | [`core/conversational_agent.py`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/core/conversational_agent.py) | NVIDIA Nemotron 3 Ultra 550B A55B interactive clinical dialogue engine. |
| **REST Server** | [`backend_server.py`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/backend_server.py) | Python multi-threaded HTTP server exposing `/api/scan`, `/api/tts`, `/api/chat`, `/api/health`. |
| **Client UI** | [`frontend/index.html`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/frontend/index.html) | Section 4B interactive voice assistant panel with one-click accessibility chips. |
| **Assistant JS** | [`frontend/js/conversational-assistant.js`](file:///C:/Users/rithvik%20yada/Desktop/PY-HACKATHON/frontend/js/conversational-assistant.js) | Handles speech recognition (mic), `/api/chat` transport, and instant audio playback. |
