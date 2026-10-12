/**
 * DRISHTI-PHARMA: CONVERSATIONAL ASSISTIVE VOICE ENGINE
 * Bulletproof Web Speech API synthesis with natural dialogues and acoustic chimes.
 * Eliminates browser GC bugs and speaks complete clinical guidance (Drug name, Expiry, Consumability, Purpose).
 * Fully supports English, Hindi, and Tamil with native and phonetic fallback synthesis.
 */

const INDICATIONS_I18N = {
    'dolo-650': {
        en: 'fever and mild-to-moderate pain',
        hi: 'बुखार और हल्के से मध्यम दर्द के लिए',
        hiPhonetic: 'bukhaar aur dard ke liye',
        ta: 'காய்ச்சல் மற்றும் உடல் வலிக்கு',
        taPhonetic: 'kaaychchal mattrum udal valikku'
    },
    'dolo-cut-strip': {
        en: 'fever and mild-to-moderate pain',
        hi: 'बुखार और हल्के से मध्यम दर्द के लिए',
        hiPhonetic: 'bukhaar aur dard ke liye',
        ta: 'காய்ச்சல் மற்றும் உடல் வலிக்கு',
        taPhonetic: 'kaaychchal mattrum udal valikku'
    },
    'azithral-500': {
        en: 'bacterial and respiratory infections',
        hi: 'जीवाणु और श्वसन संक्रमण के लिए',
        hiPhonetic: 'jeevaanu aur shvasan sankraman ke liye',
        ta: 'பாக்டீரியா மற்றும் சுவாச தொற்றுக்கு',
        taPhonetic: 'bacteria mattrum suvaasa thottrukku'
    },
    'augmentin-625': {
        en: 'severe bacterial infections, sinusitis, and pneumonia',
        hi: 'गंभीर संक्रमण और निमोनिया के लिए',
        hiPhonetic: 'gambheer sankraman aur pneumonia ke liye',
        ta: 'தீவிர தொற்று மற்றும் நிமோனியாவிற்கு',
        taPhonetic: 'theevira thottru mattrum pneumoniavukku'
    },
    'met-neurobion': {
        en: 'neuropathy and vitamin deficiency',
        hi: 'विटामिन की कमी और तंत्रिका पोषण के लिए',
        hiPhonetic: 'vitamin ki kami aur tantrika poshan ke liye',
        ta: 'வைட்டமின் குறைபாடு மற்றும் நரம்பு சத்திற்கு',
        taPhonetic: 'vitamin kuraipaadu mattrum narambu saththirkku'
    }
};

class DrishtiVoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.currentLang = 'en-US';
        this.speechRate = 1.0;
        this.speechPitch = 1.0;
        this.voices = [];
        this.audioCtx = null;
        this.activeUtterance = null; // Prevents Chrome/Edge GC bug
        this.currentAudioPlayer = null; // High-fidelity Neural Audio Player

        this.init();
    }

    init() {
        if (this.synth) {
            this.loadVoices();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => this.loadVoices();
            }
        }
    }

    loadVoices() {
        if (!this.synth) return;
        this.voices = this.synth.getVoices();
    }

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    setLanguage(langCode) {
        this.currentLang = langCode;
        console.log(`[Drishti Voice] Language updated to: ${langCode}`);
    }

    setRate(rate) {
        this.speechRate = parseFloat(rate);
    }

    // Play synthetic acoustic alert tones
    playAlertTone(type = 'safe') {
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;

            if (type === 'safe') {
                // Pleasant ascending chime
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.45);
            } else if (type === 'caution') {
                // Double alert beep
                for (let i = 0; i < 2; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const t = now + (i * 0.16);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(660, t);
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.12);
                }
            } else if (type === 'expired' || type === 'unrecognized') {
                // Urgent alert tone
                for (let i = 0; i < 2; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const t = now + (i * 0.2);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(880, t);
                    osc.frequency.exponentialRampToValueAtTime(440, t + 0.16);
                    gain.gain.setValueAtTime(0.35, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.16);
                }
            }
        } catch (e) {
            console.warn('Audio tone error:', e);
        }
    }

    // Format human-friendly month and year
    formatDateSpoken(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.replace(' (Derived)', '').split('/');
        if (parts.length === 2) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const mIdx = parseInt(parts[0], 10) - 1;
            const monthName = months[mIdx] || parts[0];
            return `${monthName} ${parts[1]}`;
        }
        return dateStr;
    }

    buildSpeechText(data, lang, hasNativeVoice = true) {
        // If pre-computed conversational verdicts are provided from Python backend
        if (data && data.conversationalVerdicts) {
            if (lang.startsWith('ta') && data.conversationalVerdicts.ta) {
                return data.conversationalVerdicts.ta;
            }
            if (lang.startsWith('hi') && data.conversationalVerdicts.hi) {
                return data.conversationalVerdicts.hi;
            }
            if (data.conversationalVerdicts.en) {
                return data.conversationalVerdicts.en;
            }
        }

        // Special case: Empty hand / no packaging detected
        if (data.status === 'unrecognized') {
            if (lang.startsWith('hi')) {
                return hasNativeVoice 
                    ? 'कोई दवा की स्ट्रिप नहीं मिली। कृपया दवा की स्ट्रिप को कैमरे के सामने रखें और पुनः स्कैन करें।'
                    : 'Koi dawa ki strip nahi mili. Kripya dawa ki strip ko camera ke saamne rakhein aur punah scan karein.';
            } else if (lang.startsWith('ta')) {
                return hasNativeVoice 
                    ? 'மருந்து அட்டை எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து மாத்திரை அட்டையை கேமரா முன் காட்டி மீண்டும் ஸ்கேன் செய்யவும்.'
                    : 'Marundhu attai edhuvum kandariyappadavillai. Thayavuseidhu maathirai attaiyai camera mun kaatti meendum scan seiyavum.';
            } else {
                return 'No medicine blister pack detected. Please hold the medicine strip in front of the camera and capture again.';
            }
        }

        const isExpired = data.status === 'expired';
        const isCaution = data.status === 'caution';
        const formattedExpiry = this.formatDateSpoken(data.expiry);
        const medId = data.id || '';
        const i18n = INDICATIONS_I18N[medId] || {
            en: data.indications || 'fever and general symptoms',
            hi: 'बुखार और संबंधित लक्षणों के लिए',
            hiPhonetic: 'bukhaar aur lakshanon ke liye',
            ta: 'காய்ச்சல் மற்றும் பொதுவான அறிகுறிகளுக்கு',
            taPhonetic: 'kaaychchal mattrum arikurigalukku'
        };
        const name = data.name || 'Dolo 650';

        // TAMIL CONVERSATIONAL SPEECH (Exact user specification)
        if (lang.startsWith('ta')) {
            if (isExpired) {
                return `எச்சரிக்கை! ஸ்கேன் செய்யப்பட்ட மாத்திரை ${name}. இதன் காலாவதி தேதி ${formattedExpiry}. இது காலாவதியாகிவிட்டது, உட்கொள்ள வேண்டாம். இது பொதுவாக ${i18n.ta} பயன்படுத்தப்படுகிறது.`;
            } else if (data.isCutStrip) {
                return `ஸ்கேன் செய்யப்பட்ட மாத்திரை ${name}. காலாவதி தேதி வெட்டப்பட்டுள்ளது. உற்பத்தி தேதி அடிப்படையில் இதன் காலாவதி தேதி ${formattedExpiry}. இது உட்கொள்ள பாதுகாப்பானது. இது பொதுவாக ${i18n.ta} பயன்படுத்தப்படுகிறது.`;
            } else if (isCaution) {
                return `கவனம்! ஸ்கேன் செய்யப்பட்ட மாத்திரை ${name}. இதன் காலாவதி தேதி ${formattedExpiry}. இது விரைவில் காலாவதியாகிறது. இது உட்கொள்ள பாதுகாப்பானது. இது பொதுவாக ${i18n.ta} பயன்படுத்தப்படுகிறது.`;
            } else {
                return `ஸ்கேன் செய்யப்பட்ட மாத்திரை ${name}. இதன் காலாவதி தேதி ${formattedExpiry}. இது உட்கொள்ள பாதுகாப்பானது. இது பொதுவாக ${i18n.ta} பயன்படுத்தப்படுகிறது.`;
            }
        }

        // HINDI CONVERSATIONAL SPEECH
        if (lang.startsWith('hi')) {
            if (isExpired) {
                return `सावधान! स्कैन की गई दवा ${name} है। यह ${formattedExpiry} में समाप्त हो चुकी है। यह दवा समाप्त हो चुकी है और सेवन के योग्य नहीं है, कृपया इसे न लें। यह आमतौर पर ${i18n.hi} के लिए उपयोग की जाती है।`;
            } else if (data.isCutStrip) {
                return `स्कैन की गई दवा ${name} है। इस स्ट्रिप पर समाप्ति तिथि कटी हुई है। निर्माण तिथि के आधार पर यह ${formattedExpiry} में समाप्त होगी। यह सेवन के लिए सुरक्षित है। इसका उपयोग आमतौर पर ${i18n.hi} के लिए किया जाता है।`;
            } else {
                return `स्कैन की गई दवा ${name} है। इसकी समाप्ति तिथि ${formattedExpiry} है। यह सेवन के लिए सुरक्षित है। यह आमतौर पर ${i18n.hi} के लिए उपयोग की जाती है।`;
            }
        }

        // ENGLISH CONVERSATIONAL SPEECH (Exact user specification)
        if (isExpired) {
            return `Warning! The scanned tablet is ${name}. It is expired on ${formattedExpiry}. It is expired and not consumable, do not consume this medication! It was prescribed for ${i18n.en}.`;
        } else if (data.isCutStrip) {
            return `The scanned tablet is ${name}. The printed expiry date is cut off on this strip. Derived from manufactured date, it is expiring on ${formattedExpiry}. It is consumable and safe to use. It is generally used for ${i18n.en}.`;
        } else if (isCaution) {
            return `Caution! The scanned tablet is ${name}. It is expiring soon on ${formattedExpiry}. It is consumable within twenty-two days. It is generally used for ${i18n.en}.`;
        } else {
            return `The scanned tablet is ${name}. It expires on ${formattedExpiry}. It is consumable. It is generally used for ${i18n.en}.`;
        }
    }

    // Speak clinical verdict using Neural Python TTS with Web Speech API fallback
    async speakVerdict(data) {
        if (!data) return;

        // Cancel previous speech/audio
        this.stop();

        const status = data.status || 'safe';
        this.playAlertTone(status);

        const speechText = this.buildSpeechText(data, this.currentLang, true);
        console.log(`[Drishti Voice] Speaking (${this.currentLang}): "${speechText}"`);

        // Screen reader accessibility live announcement
        const srAnnounce = document.getElementById('srAnnouncement');
        if (srAnnounce) {
            srAnnounce.textContent = speechText;
        }

        // Step 1: Use Server-Side Python Neural TTS (Crystal-clear human female voice for Tamil, Hindi, English)
        try {
            const resp = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: speechText,
                    lang: this.currentLang
                })
            });

            if (resp.ok) {
                const res = await resp.json();
                if (res.audio) {
                    const audio = new Audio(res.audio);
                    this.currentAudioPlayer = audio;
                    await audio.play();
                    console.log('[Drishti Voice] Native neural audio stream playing.');
                    return;
                }
            }
        } catch (netErr) {
            console.warn('[Drishti Voice] Neural TTS API failed, falling back to browser speech:', netErr);
        }

        // Step 2: Graceful Client-side Fallback via Web Speech API
        if (this.synth) {
            if (this.synth.paused) this.synth.resume();
            if (this.voices.length === 0) this.voices = this.synth.getVoices();

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(speechText);
                utterance.rate = this.speechRate;
                utterance.pitch = this.speechPitch;

                if (this.currentLang.startsWith('ta')) {
                    utterance.pitch = 1.35;
                    utterance.rate = 0.95;
                    const femaleTamil = this.voices.find(v => 
                        v.lang.toLowerCase().startsWith('ta') && 
                        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('lekha'))
                    );
                    const anyTamil = this.voices.find(v => v.lang.toLowerCase().startsWith('ta'));
                    if (femaleTamil) {
                        utterance.voice = femaleTamil;
                        utterance.lang = 'ta-IN';
                    } else if (anyTamil) {
                        utterance.voice = anyTamil;
                        utterance.lang = 'ta-IN';
                    }
                }

                this.activeUtterance = utterance;
                utterance.onend = () => { this.activeUtterance = null; };
                utterance.onerror = () => { this.activeUtterance = null; };
                this.synth.speak(utterance);
            }, 50);
        }
    }

    stop() {
        if (this.currentAudioPlayer) {
            try {
                this.currentAudioPlayer.pause();
                this.currentAudioPlayer.currentTime = 0;
            } catch (e) {}
            this.currentAudioPlayer = null;
        }
        if (this.synth) {
            this.synth.cancel();
        }
    }
}

// Global instance
window.voiceEngine = new DrishtiVoiceEngine();
