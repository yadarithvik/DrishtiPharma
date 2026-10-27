# Drishti-Pharma: Viva Defense & Live Evaluator Cheat Sheet
## Quick-Reference Guide for Instant Code Demonstrations during Faculty Review
**PySustain-2026 | BACSE101 Problem Solving using Python | SENSE, VIT Vellore**  
**Faculty Mentor:** Dr. R. Elakkiya | **Team:** Yada Rithvik, Anirudh Dodia, NeelKorak Jana

---

## ⚡ The Golden Rule: Central Control Panel (`config.py`)
Almost every parameter your evaluator ("Madam") asks you to change live is located in **`config.py`**. You do not need to rewrite complex functions; you just tweak one variable and restart the app.

---

## 🎯 Top 8 Live Questions & Exactly How to Edit Them

### 1. "Change today's date to test if an expired medicine becomes valid, or vice versa."
* **File to Open:** `config.py`
* **Line Number:** Line 45
* **Variable:** `CURRENT_DATE: datetime = datetime(2026, 10, 8)`
* **How to Change:**
  - To simulate a future evaluation date: `CURRENT_DATE: datetime = datetime(2027, 1, 1)`
  - To test real current system clock: `CURRENT_DATE: datetime = datetime.now()`
* **Explanation to Madam:** *"Madam, our Expiry Guardian uses deterministic calendar arithmetic referenced to the evaluation timestamp in `config.py`. Changing this updates all shelf-life calculations across the entire system instantly."*

---

### 2. "Change the Expiry Warning threshold from 60 days to 90 days."
* **File to Open:** `core/safety_guardian.py`
* **Line Number:** Line 301
* **Code to Edit:**
  ```python
  # Change:
  elif days_remaining <= 60:
  # To:
  elif days_remaining <= 90:
  ```
* **Explanation to Madam:** *"Madam, medications with remaining shelf-life below this threshold are categorized under Schedule P caution ('Expiring Soon'), prompting the patient or caregiver to consume or replace them promptly."*

---

### 3. "What if a medicine has a cut strip and isn't in your Indian Pharmacopoeia list? Add a new medicine."
* **File to Open:** `core/safety_guardian.py`
* **Line Number:** Line 63 (`PHARMACOPOEIA_SHELF_LIFE_MONTHS`)
* **How to Add:** Simply add a new key-value pair to the dictionary:
  ```python
  "ASPIRIN": 36,        # E.g. Aspirin 36 months standard IP shelf life
  "METOPROLOL": 24,     # E.g. Beta-blocker 24 months
  ```
* **Explanation to Madam:** *"Madam, whenever the printed expiry stamp is severed by scissors, our deterministic rule engine extracts the MFD and looks up the drug's monograph in `PHARMACOPOEIA_SHELF_LIFE_MONTHS`. It computes EXP = MFD + ShelfLife without using any generative guessing."*

---

### 4. "Show me where the Computer Vision glare removal happens. Adjust the glare reduction intensity."
* **File to Open:** `config.py`
* **Line Numbers:** Lines 52–58
* **Variables to Show / Adjust:**
  - `CLAHE_CLIP_LIMIT = 1.6` (Increase to `2.5` to make faint embossed text sharper)
  - `SPECULAR_LUMINANCE_THRESHOLD = 236` (Lower to `220` to mask more aggressive glare)
  - `BILATERAL_DIAMETER = 7` (Bilateral edge-preserving filter window)
* **Explanation to Madam:** *"Madam, in `core/vision_engine.py`, we convert frames to CIE-LAB color space. We compress the L* luminance channel non-destructively: 212 + (L - 212) * 0.20 for pixels above threshold, while preserving skin tone in YCrCb color space so the user's hand and face are never warped."*

---

### 5. "Show me the Python code running directly in the terminal without opening a browser."
* **Command to Run in Terminal:**
  ```powershell
  python main.py --scan path/to/image.jpg
  ```
* **Explanation to Madam:** *"Madam, our system is 100% Python. `main.py` has a dedicated CLI mode that loads OpenCV, executes our optical preprocessor, calls Gemini Multimodal VLM, and outputs the full clinical verdict and Indian Pharmacopoeia calculations directly in stdout."*

---

### 6. "Change the Multimodal AI Vision Model or API Key."
* **File to Open:** `config.py`
* **Line Numbers:** Lines 29–40
* **Variables:**
  - `DEFAULT_GEMINI_KEY = "..."`
  - `MODEL_CANDIDATES = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]`
* **Explanation to Madam:** *"Madam, we configured automated candidate fallback in `MODEL_CANDIDATES`. If `gemini-3.5-flash-lite` experiences transient rate limits, the system automatically falls back to `gemini-3.1-flash-lite` with zero user disruption."*

---

### 7. "Where is the Multilingual Audio Feedback? How does it speak in Tamil or Hindi?"
* **File to Open:** `core/voice_engine.py` (and `config.py` Line 103)
* **Code to Show:**
  - `SUPPORTED_LANGUAGES` dictionary in `config.py`:
    - `"ta": "ta-IN"` (Tamil Regional)
    - `"hi": "hi-IN"` (Hindi National)
    - `"en": "en-US"` (English Universal)
  - `VoiceEngine.synthesize_mp3(text, lang)` in `core/voice_engine.py`
* **Explanation to Madam:** *"Madam, for assistive inclusivity, our voice engine formats natural spoken guidance for blind users and synthesizes audio using standard Google TTS (`gTTS`) and Web Speech API, sending Base64 audio directly to the frontend."*

---

### 8. "Why did you build a custom Python server instead of Streamlit or Flask?"
* **What to Answer Confidently:**
  1. **Zero Framework Bloat:** Built with standard Python library `http.server.ThreadingHTTPServer` on port 8080.
  2. **Sub-Second Boot Time:** Boots in under 1 second with automatic port management (`psutil`).
  3. **WCAG 2.1 AAA Accessibility:** Streamlit does not support live split-camera view, low-vision high-contrast dark themes, or screen-reader live regions (`aria-live="assertive"`). Our architecture gives 100% control over accessibility and low latency.
