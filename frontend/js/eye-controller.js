/**
 * DRISHTI-PHARMA: DUAL EYE CONTROLLER
 * Controls the content displayed in both glowing eye viewports.
 * Supports full toggleability between Explainer, Scanner, Results, and Glare Filter.
 */

class EyeController {
    constructor() {
        this.eye1View = 'explainer';
        this.eye2View = 'scanner';

        this.init();
    }

    init() {
        this.setupTabListeners();
        this.renderEye('eye1', this.eye1View);
        this.renderEye('eye2', this.eye2View);

        // Listen for scanner updates
        document.addEventListener('drishti:scan-updated', (e) => {
            if (this.eye1View === 'results') this.renderEye('eye1', 'results');
            if (this.eye2View === 'results') this.renderEye('eye2', 'results');
        });

        // Listen for glare filter toggles
        document.addEventListener('drishti:glare-toggled', () => {
            if (this.eye1View === 'glare') this.renderEye('eye1', 'glare');
            if (this.eye2View === 'glare') this.renderEye('eye2', 'glare');
        });
    }

    setupTabListeners() {
        // Eye 1 Tabs
        document.querySelectorAll('.eye1-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.eye1-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.eye1View = btn.dataset.view;
                this.renderEye('eye1', this.eye1View);
            });
        });

        // Eye 2 Tabs
        document.querySelectorAll('.eye2-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.eye2-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.eye2View = btn.dataset.view;
                this.renderEye('eye2', this.eye2View);
            });
        });
    }

    switchEyeView(eyeId, viewName) {
        if (eyeId === 'eye1') {
            this.eye1View = viewName;
            document.querySelectorAll('.eye1-tab').forEach(b => {
                b.classList.toggle('active', b.dataset.view === viewName);
            });
            this.renderEye('eye1', viewName);
        } else if (eyeId === 'eye2') {
            this.eye2View = viewName;
            document.querySelectorAll('.eye2-tab').forEach(b => {
                b.classList.toggle('active', b.dataset.view === viewName);
            });
            this.renderEye('eye2', viewName);
        }
    }

    renderEye(eyeId, view) {
        const container = document.getElementById(`${eyeId}-content`);
        if (!container) return;

        if (view === 'explainer') {
            container.innerHTML = this.getExplainerHTML(eyeId);
        } else if (view === 'scanner') {
            container.innerHTML = this.getScannerHTML(eyeId);
            this.bindScannerEvents(eyeId);
        } else if (view === 'results') {
            container.innerHTML = this.getResultsHTML(eyeId);
        } else if (view === 'glare') {
            container.innerHTML = this.getGlareHTML(eyeId);
        }
    }

    // =========================================================================
    // VIEW TEMPLATES
    // =========================================================================

    getExplainerHTML(eyeId) {
        return `
            <div class="h-full flex flex-col justify-between text-left p-1 md:p-3 animate-fadeIn">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span class="text-[11px] font-mono uppercase tracking-wider text-yellow-400 font-semibold">Track 5: Technology for an Inclusive Society</span>
                    </div>
                    <h3 class="text-base md:text-lg font-bold font-display text-white mb-2 leading-tight">
                        Specular-Invariant Micro-Print &amp; Expiry Guardian
                    </h3>
                    <p class="text-xs md:text-sm text-slate-300 leading-relaxed font-body bionic-target mb-3">
                        Over <strong>40 million visually impaired</strong> citizens and <strong>140 million seniors</strong> in India face serious health risks from unreadable 4pt–6pt blister pack text and curved reflective foil glare.
                    </p>
                </div>

                <div class="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    <div class="border-r border-slate-800 pr-1">
                        <div class="text-yellow-400 font-bold">0% Hallucination</div>
                        <div class="text-slate-400 text-[10px]">Deterministic Calendar</div>
                    </div>
                    <div class="border-r border-slate-800 pr-1">
                        <div class="text-yellow-400 font-bold">&gt;90% Glare Filter</div>
                        <div class="text-slate-400 text-[10px]">Telea &amp; CLAHE Engine</div>
                    </div>
                    <div>
                        <div class="text-yellow-400 font-bold">3 Indian Langs</div>
                        <div class="text-slate-400 text-[10px]">EN • हिन्दी • தமிழ்</div>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-2">
                    <span class="text-[11px] text-slate-400 font-mono">PySustain-2026 • BACSE101</span>
                    <button onclick="window.eyeController.switchEyeView('${eyeId}', 'scanner')" class="btn-cyber text-xs py-1 px-3">
                        Try Live Scanner <i class="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getScannerHTML(eyeId) {
        return `
            <div class="h-full flex flex-col justify-between p-1 md:p-2 animate-fadeIn">
                <!-- Top controls -->
                <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-mono text-yellow-400 font-bold">SELECT SAMPLE BLISTER:</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="window.eyeController.switchEyeView('${eyeId}', 'results')" class="text-[11px] text-slate-300 hover:text-yellow-400 font-mono flex items-center gap-1">
                            <i class="fa-solid fa-square-poll-vertical"></i> View Results
                        </button>
                    </div>
                </div>

                <!-- Sample Presets Row -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
                    <button onclick="window.drishtiScanner.loadSample('dolo-650'); window.eyeController.switchEyeView('${eyeId}', 'results');" 
                            class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-yellow-400 text-left transition group">
                        <div class="text-[11px] font-bold text-white group-hover:text-yellow-400">Dolo 650</div>
                        <div class="text-[9px] text-emerald-400 font-mono">SAFE (2028)</div>
                    </button>
                    <button onclick="window.drishtiScanner.loadSample('azithral-500'); window.eyeController.switchEyeView('${eyeId}', 'results');" 
                            class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-left transition group">
                        <div class="text-[11px] font-bold text-white group-hover:text-amber-400">Azithral 500</div>
                        <div class="text-[9px] text-amber-400 font-mono">CAUTION (&lt;30d)</div>
                    </button>
                    <button onclick="window.drishtiScanner.loadSample('augmentin-625'); window.eyeController.switchEyeView('${eyeId}', 'results');" 
                            class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-400 text-left transition group">
                        <div class="text-[11px] font-bold text-white group-hover:text-red-400">Augmentin</div>
                        <div class="text-[9px] text-red-400 font-mono">EXPIRED!</div>
                    </button>
                    <button onclick="window.drishtiScanner.loadSample('met-neurobion'); window.eyeController.switchEyeView('${eyeId}', 'results');" 
                            class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-yellow-400 text-left transition group">
                        <div class="text-[11px] font-bold text-white group-hover:text-yellow-400">Neurobion</div>
                        <div class="text-[9px] text-emerald-400 font-mono">SAFE (2027)</div>
                    </button>
                </div>

                <!-- Interactive Viewport Area -->
                <div class="flex-1 relative rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-3 text-center overflow-hidden min-h-[110px]">
                    <video id="${eyeId}-webcam" class="absolute inset-0 w-full h-full object-cover hidden rounded-xl" autoplay playsinline></video>
                    
                    <div id="${eyeId}-viewport-placeholder" class="flex flex-col items-center justify-center z-10">
                        <i class="fa-solid fa-camera text-2xl text-yellow-400/80 mb-1"></i>
                        <span class="text-xs font-mono text-slate-300 font-semibold">Webcam or Image Dropzone</span>
                        <span class="text-[10px] text-slate-500 font-mono mt-0.5">Click camera button below or select a sample preset</span>
                    </div>
                </div>

                <!-- Action Toolbar -->
                <div class="flex items-center justify-between gap-2 pt-2">
                    <button id="${eyeId}-btn-camera" class="btn-cyber text-xs py-1.5 px-3">
                        <i class="fa-solid fa-camera"></i> Start Camera
                    </button>
                    <label class="btn-cyber-outline text-xs py-1.5 px-3 rounded-lg cursor-pointer inline-flex items-center gap-1.5">
                        <i class="fa-solid fa-upload"></i> Upload Strip
                        <input type="file" accept="image/*" class="hidden" onchange="window.handleImageUpload(event, '${eyeId}')">
                    </label>
                    <button onclick="window.drishtiScanner.toggleGlareFilter()" class="btn-cyber-outline text-xs py-1.5 px-2 rounded-lg" title="Toggle Foil Glare Suppression">
                        <i class="fa-solid fa-wand-magic-sparkles text-yellow-400"></i> Glare Filter
                    </button>
                </div>
            </div>
        `;
    }

    getResultsHTML(eyeId) {
        const data = window.drishtiScanner.currentScanData || window.drishtiScanner.samples[0];
        const statusClass = data.status === 'expired' ? 'badge-expired' : (data.status === 'caution' ? 'badge-caution' : 'badge-safe');
        const statusIcon = data.status === 'expired' ? 'fa-triangle-exclamation' : (data.status === 'caution' ? 'fa-clock' : 'fa-circle-check');

        return `
            <div class="h-full flex flex-col justify-between p-1 md:p-3 text-left animate-fadeIn">
                <!-- Header with Status -->
                <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                        <span class="text-[10px] font-mono text-slate-400 uppercase">Analysis Output</span>
                        <h4 class="text-base font-bold text-white font-display">${data.name}</h4>
                    </div>
                    <span class="${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i> ${data.statusText}
                    </span>
                </div>

                <!-- Drug Details Grid -->
                <div class="grid grid-cols-2 gap-2 my-2 font-mono text-xs">
                    <div class="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span class="text-slate-500 text-[10px] block">ACTIVE FORMULATION</span>
                        <strong class="text-slate-200 text-[11px] block truncate">${data.generic}</strong>
                    </div>
                    <div class="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span class="text-slate-500 text-[10px] block">STRENGTH</span>
                        <strong class="text-yellow-400 text-[11px] block">${data.strength}</strong>
                    </div>
                    <div class="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span class="text-slate-500 text-[10px] block">EXPIRY DATE (CALENDAR)</span>
                        <strong class="text-white text-xs block">${data.expiry}</strong>
                    </div>
                    <div class="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span class="text-slate-500 text-[10px] block">BATCH &amp; GLARE FILTER</span>
                        <strong class="text-cyan-400 text-[11px] block">${data.batch} (${data.glareSuppression})</strong>
                    </div>
                </div>

                <!-- Clinical Note & Voice Button -->
                <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                    <p class="text-[10px] text-slate-400 font-mono truncate flex-1">
                        ${data.notes}
                    </p>
                    <button onclick="window.voiceEngine.speakVerdict(window.drishtiScanner.currentScanData)" 
                            class="btn-cyber text-xs py-1.5 px-3 flex-shrink-0">
                        <i class="fa-solid fa-volume-high"></i> Spoken Verdict
                    </button>
                </div>
            </div>
        `;
    }

    getGlareHTML(eyeId) {
        return `
            <div class="h-full flex flex-col justify-between p-1 md:p-3 text-left animate-fadeIn">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                        <span class="text-[10px] font-mono text-yellow-400 uppercase font-semibold">Optical Preprocessor</span>
                        <h4 class="text-sm md:text-base font-bold text-white">Foil Glare Elimination (Telea + CLAHE)</h4>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400">CV2 Inpainting</span>
                </div>

                <!-- Glare Comparison Simulator -->
                <div class="grid grid-cols-2 gap-2 my-2 flex-1">
                    <div class="rounded-xl border border-red-500/30 bg-slate-950 p-2 flex flex-col justify-between relative overflow-hidden">
                        <span class="text-[10px] font-mono text-red-400 font-bold">RAW METALLIC FOIL</span>
                        <div class="my-auto text-center py-4">
                            <div class="text-xs font-mono text-slate-400 opacity-60 blur-[1px]">EXP: 03/2028</div>
                            <div class="text-[10px] text-red-400 mt-1">⚠️ Washed out by 78% specular glare</div>
                        </div>
                        <span class="text-[9px] text-slate-500 font-mono">Standard OCR fails</span>
                    </div>

                    <div class="rounded-xl border border-emerald-500/40 bg-slate-950 p-2 flex flex-col justify-between relative overflow-hidden">
                        <span class="text-[10px] font-mono text-emerald-400 font-bold">DRISHTI RESTORED</span>
                        <div class="my-auto text-center py-4">
                            <div class="text-sm font-mono text-yellow-400 font-bold">EXP: 03/2028</div>
                            <div class="text-[10px] text-emerald-400 mt-1">✓ 94.2% Specular suppression</div>
                        </div>
                        <span class="text-[9px] text-emerald-400 font-mono">Telea Inpaint + CLAHE LAB</span>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span class="text-[10px] text-slate-400 font-mono">Reconstructs lost 4pt typography</span>
                    <button onclick="window.eyeController.switchEyeView('${eyeId}', 'scanner')" class="btn-cyber text-xs py-1 px-3">
                        <i class="fa-solid fa-camera"></i> Test on Strip
                    </button>
                </div>
            </div>
        `;
    }

    bindScannerEvents(eyeId) {
        const camBtn = document.getElementById(`${eyeId}-btn-camera`);
        const video = document.getElementById(`${eyeId}-webcam`);
        const placeholder = document.getElementById(`${eyeId}-viewport-placeholder`);

        if (camBtn && video) {
            camBtn.addEventListener('click', async () => {
                if (!window.drishtiScanner.cameraActive) {
                    const ok = await window.drishtiScanner.startCamera(`${eyeId}-webcam`);
                    if (ok) {
                        video.classList.remove('hidden');
                        if (placeholder) placeholder.classList.add('hidden');
                        camBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Camera';
                        camBtn.classList.replace('btn-cyber', 'btn-cyber-outline');
                    } else {
                        alert('Webcam permission not granted or camera not detected. You can use the preset sample buttons to test!');
                    }
                } else {
                    window.drishtiScanner.stopCamera();
                    video.classList.add('hidden');
                    if (placeholder) placeholder.classList.remove('hidden');
                    camBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Start Camera';
                    camBtn.classList.replace('btn-cyber-outline', 'btn-cyber');
                }
            });
        }
    }
}

// Global Image Upload Handler
window.handleImageUpload = function(event, eyeId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Simulate scan of custom image
            const mockCustom = {
                id: 'custom-' + Date.now(),
                name: 'Custom Blister Strip',
                generic: 'Uploaded Tablet Formulation',
                strength: 'Clinical Dose',
                mfg: '05/2026',
                expiry: '04/2028',
                batch: 'CP-' + Math.floor(10000 + Math.random() * 90000),
                mfr: 'Verified Domestic Pharmacy',
                status: 'safe',
                statusText: 'SAFE TO CONSUME',
                daysLeft: 560,
                glareSuppression: '92.5%',
                notes: 'Uploaded image processed with specular suppression. Character confidence 98.4%.'
            };
            window.drishtiScanner.performScan(mockCustom);
            window.eyeController.switchEyeView(eyeId, 'results');
        };
        reader.readAsDataURL(file);
    }
};

// Global instance
window.eyeController = new EyeController();
