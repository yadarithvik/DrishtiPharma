/**
 * DRISHTI-PHARMA: INTERACTIVE CLINICAL VOICE ASSISTANT
 * "Best-of-Both-Worlds" Hybrid Conversational Dialogue Engine
 * Powered by NVIDIA Nemotron 3 Ultra 550B A55B & NVIDIA Magpie-TTS Zero-Shot.
 * Enables visually impaired patients to ask spoken questions about medication timing,
 * dosage, interactions, storage, and food intake.
 */

class DrishtiConversationalAssistant {
    constructor() {
        this.currentAudio = null;
        this.recognition = null;
        this.isListening = false;
        this.currentLang = 'en';

        this.initSpeechRecognition();
        this.bindEvents();
    }

    initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this.recognition = new SpeechRec();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateMicUI(true);
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const inputEl = document.getElementById('assistant-user-input');
                if (inputEl) {
                    inputEl.value = transcript;
                }
                this.askQuestion(transcript);
            };

            this.recognition.onerror = (event) => {
                console.warn('[Assistant Speech Rec Error]', event.error);
                this.isListening = false;
                this.updateMicUI(false);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateMicUI(false);
            };
        }
    }

    updateMicUI(listening) {
        const micBtn = document.getElementById('btn-assistant-mic');
        if (!micBtn) return;
        if (listening) {
            micBtn.classList.add('bg-red-500', 'text-white', 'animate-pulse');
            micBtn.classList.remove('bg-slate-800', 'text-yellow-400');
            micBtn.setAttribute('title', 'Listening... Speak now');
        } else {
            micBtn.classList.remove('bg-red-500', 'text-white', 'animate-pulse');
            micBtn.classList.add('bg-slate-800', 'text-yellow-400');
            micBtn.setAttribute('title', 'Click to Speak via Microphone');
        }
    }

    toggleMic() {
        if (!this.recognition) {
            alert('Speech Recognition is not supported by your current browser. Please type your query in the box.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            // Set locale
            if (this.currentLang === 'hi') {
                this.recognition.lang = 'hi-IN';
            } else if (this.currentLang === 'ta') {
                this.recognition.lang = 'ta-IN';
            } else {
                this.recognition.lang = 'en-US';
            }
            try {
                this.recognition.start();
            } catch (e) {
                console.warn('Recognition start error:', e);
            }
        }
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const sendBtn = document.getElementById('btn-assistant-send');
            const inputEl = document.getElementById('assistant-user-input');
            const micBtn = document.getElementById('btn-assistant-mic');
            const stopBtn = document.getElementById('btn-assistant-stop');

            if (sendBtn && inputEl) {
                sendBtn.addEventListener('click', () => {
                    const text = inputEl.value.trim();
                    if (text) {
                        this.askQuestion(text);
                        inputEl.value = '';
                    }
                });

                inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const text = inputEl.value.trim();
                        if (text) {
                            this.askQuestion(text);
                            inputEl.value = '';
                        }
                    }
                });
            }

            if (micBtn) {
                micBtn.addEventListener('click', () => this.toggleMic());
            }

            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stopAudio());
            }
        });
    }

    setLanguage(langCode) {
        this.currentLang = langCode;
        console.log(`[Assistant] Language set to: ${langCode}`);
    }

    stopAudio() {
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) {}
            this.currentAudio = null;
        }
        if (window.voiceEngine) {
            window.voiceEngine.stop();
        }
        const statusEl = document.getElementById('assistant-voice-status');
        if (statusEl) {
            statusEl.innerHTML = '<span class="text-slate-400">Audio Stopped</span>';
        }
    }

    async askQuestion(questionText) {
        if (!questionText || !questionText.trim()) return;

        this.stopAudio();
        const chatLog = document.getElementById('assistant-chat-log');
        const statusEl = document.getElementById('assistant-voice-status');

        // Append User Bubble
        if (chatLog) {
            const userMsg = document.createElement('div');
            userMsg.className = 'flex items-start justify-end gap-2 my-2';
            userMsg.innerHTML = `
                <div class="max-w-[85%] rounded-2xl bg-yellow-400 text-black px-4 py-2.5 text-xs font-semibold shadow-md">
                    <div class="text-[10px] font-mono opacity-80 mb-0.5">PATIENT QUERY</div>
                    ${this.escapeHtml(questionText)}
                </div>
                <div class="w-7 h-7 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center flex-shrink-0 text-xs mt-1">
                    <i class="fa-solid fa-user"></i>
                </div>
            `;
            chatLog.appendChild(userMsg);
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        // Show thinking state
        if (statusEl) {
            statusEl.innerHTML = `
                <span class="inline-flex items-center gap-1.5 text-yellow-400 animate-pulse">
                    <i class="fa-solid fa-brain-circuit"></i>
                    Nemotron 3 Ultra 550B reasoning...
                </span>
            `;
        }

        try {
            const resp = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: questionText,
                    language: this.currentLang
                })
            });

            if (!resp.ok) {
                throw new Error('Server returned HTTP ' + resp.status);
            }

            const data = await resp.json();
            this.renderAssistantResponse(data);

        } catch (err) {
            console.error('[Assistant Chat Error]', err);
            if (statusEl) {
                statusEl.innerHTML = '<span class="text-red-400">Connection error. Please try again.</span>';
            }
        }
    }

    renderAssistantResponse(data) {
        const chatLog = document.getElementById('assistant-chat-log');
        const statusEl = document.getElementById('assistant-voice-status');

        const replyText = data.response || "No response received.";
        const engineLabel = data.tts_engine || "Best-of-Both-Worlds Voice Engine";
        const latency = data.latency_seconds ? `${data.latency_seconds}s` : "sub-second";

        if (chatLog) {
            const assistMsg = document.createElement('div');
            assistMsg.className = 'flex items-start justify-start gap-2 my-2';
            assistMsg.innerHTML = `
                <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs mt-1 border border-emerald-500/30">
                    <i class="fa-solid fa-user-doctor"></i>
                </div>
                <div class="max-w-[85%] rounded-2xl bg-slate-900 border border-emerald-500/30 text-white px-4 py-3 text-xs shadow-md">
                    <div class="flex items-center justify-between gap-3 text-[10px] font-mono text-emerald-400 mb-1 border-b border-white/5 pb-1">
                        <span>NVIDIA NEMOTRON VOICE AGENT</span>
                        <span class="text-slate-400">${latency}</span>
                    </div>
                    <p class="leading-relaxed font-body text-slate-200">
                        ${this.escapeHtml(replyText)}
                    </p>
                    <div class="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span class="text-yellow-400"><i class="fa-solid fa-waveform-lines mr-1"></i>${engineLabel}</span>
                        ${data.audio_data_uri ? `<button class="hover:text-white flex items-center gap-1 font-bold text-emerald-400" onclick="window.conversationalAssistant.replayAudio('${data.audio_data_uri}')"><i class="fa-solid fa-play"></i> Replay</button>` : ''}
                    </div>
                </div>
            `;
            chatLog.appendChild(assistMsg);
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        // Live screen reader accessibility announcement
        const srAnnounce = document.getElementById('srAnnouncement');
        if (srAnnounce) {
            srAnnounce.textContent = replyText;
        }

        // Auto-play neural audio
        if (data.audio_data_uri) {
            this.replayAudio(data.audio_data_uri);
            if (statusEl) {
                statusEl.innerHTML = `
                    <span class="inline-flex items-center gap-1.5 text-emerald-400 font-mono">
                        <i class="fa-solid fa-volume-high animate-pulse"></i>
                        Vocalizing response via ${engineLabel}
                    </span>
                `;
            }
        } else {
            if (statusEl) {
                statusEl.innerHTML = '<span class="text-slate-400">Response ready</span>';
            }
        }
    }

    replayAudio(audioUri) {
        this.stopAudio();
        try {
            const audio = new Audio(audioUri);
            this.currentAudio = audio;
            audio.play();
            audio.onended = () => {
                const statusEl = document.getElementById('assistant-voice-status');
                if (statusEl) {
                    statusEl.innerHTML = '<span class="text-slate-400">Audio playback completed</span>';
                }
            };
        } catch (e) {
            console.warn('Audio replay error:', e);
        }
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Global instance
window.conversationalAssistant = new DrishtiConversationalAssistant();
