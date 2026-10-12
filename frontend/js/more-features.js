/**
 * DRISHTI-PHARMA: 'MORE' FEATURES CONTROLLER
 * Coordinates the 4 sub-features in the 'More' navigation drawer:
 * 1. Voice Companion Settings (EN, HI, TA voice, rate, pitch)
 * 2. Medicine History Log (LocalStorage, timestamps, audio replay, export)
 * 3. Accessibility Suite (Bionic reading, contrast, font sizing)
 * 4. Emergency Caregiver Alert (Simulated emergency dispatch to Family Member / XXXXXX)
 */

class MoreFeaturesController {
    constructor() {
        this.history = [];
        this.bionicEnabled = false;
        this.highContrastEnabled = false;
        this.fontSizeModifier = 100;
        this.caregiverContact = {
            category: 'Family Member',
            phone: 'XXXXXX',
            channel: 'WhatsApp & SMS'
        };

        this.init();
    }

    init() {
        this.loadHistory();
        this.setupEventListeners();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('drishti_medicine_history');
            if (saved) {
                this.history = JSON.parse(saved);
            } else {
                // Populate default starter scan
                this.history = [
                    {
                        id: 'init-1',
                        name: 'Dolo 650',
                        generic: 'Paracetamol IP 650mg',
                        strength: '650 mg',
                        expiry: '03/2028',
                        status: 'safe',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ];
            }
        } catch (e) {
            this.history = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('drishti_medicine_history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    }

    addHistoryEntry(scanData) {
        const entry = {
            id: 'scan-' + Date.now(),
            name: scanData.name,
            generic: scanData.generic,
            strength: scanData.strength,
            expiry: scanData.expiry,
            status: scanData.status,
            batch: scanData.batch,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.history.unshift(entry);
        if (this.history.length > 25) {
            this.history.pop();
        }
        this.saveHistory();
        this.renderHistoryList();
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistoryList();
    }

    exportHistory() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.history, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `DrishtiPharma_ScanHistory_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    // Accessibility Controls
    toggleBionicReading(enable = null) {
        this.bionicEnabled = enable !== null ? enable : !this.bionicEnabled;
        if (this.bionicEnabled) {
            document.body.classList.add('bionic-reading');
            this.applyBionicText();
        } else {
            document.body.classList.remove('bionic-reading');
        }
        return this.bionicEnabled;
    }

    applyBionicText() {
        const elements = document.querySelectorAll('.bionic-target');
        elements.forEach(el => {
            if (!el.dataset.originalText) {
                el.dataset.originalText = el.innerHTML;
            }
            if (this.bionicEnabled) {
                const words = el.dataset.originalText.split(' ');
                const bionic = words.map(w => {
                    if (w.length <= 3) return `<b>${w}</b>`;
                    const mid = Math.ceil(w.length / 2);
                    return `<b>${w.slice(0, mid)}</b>${w.slice(mid)}`;
                }).join(' ');
                el.innerHTML = bionic;
            } else {
                el.innerHTML = el.dataset.originalText;
            }
        });
    }

    toggleHighContrast(enable = null) {
        this.highContrastEnabled = enable !== null ? enable : !this.highContrastEnabled;
        if (this.highContrastEnabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        return this.highContrastEnabled;
    }

    adjustFontSize(delta) {
        this.fontSizeModifier = Math.max(90, Math.min(130, this.fontSizeModifier + delta));
        document.documentElement.style.fontSize = `${this.fontSizeModifier}%`;
    }

    // Emergency Caregiver Alert Dispatch
    triggerExpiredAlert(medData) {
        const alertBanner = document.getElementById('emergencyAlertBanner');
        const alertText = document.getElementById('emergencyAlertText');
        if (alertBanner && alertText) {
            alertText.innerHTML = `⚠️ <strong>CRITICAL ALERT DISPATCHED</strong> to designated <strong>${this.caregiverContact.category}</strong> (${this.caregiverContact.phone}): Detected expired medication <em>${medData.name}</em> (Expired: ${medData.expiry}).`;
            alertBanner.classList.remove('hidden');
            alertBanner.classList.add('flex');

            setTimeout(() => {
                alertBanner.classList.add('hidden');
                alertBanner.classList.remove('flex');
            }, 8000);
        }
    }

    // Render History table / list
    renderHistoryList() {
        const listContainer = document.getElementById('historyListContainer');
        if (!listContainer) return;

        if (this.history.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8 text-slate-500 font-mono text-xs">
                    No medicine scans recorded yet. Use the scanner to record your first entry.
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.history.map(item => {
            const badgeClass = item.status === 'expired' ? 'badge-expired' : (item.status === 'caution' ? 'badge-caution' : 'badge-safe');
            const statusLabel = item.status === 'expired' ? 'EXPIRED' : (item.status === 'caution' ? 'EXPIRING SOON' : 'SAFE');
            return `
                <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-bold text-sm text-white truncate">${item.name}</span>
                            <span class="${badgeClass} text-[10px] py-0.5 px-2">${statusLabel}</span>
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                            <span>EXP: <strong class="text-slate-200">${item.expiry}</strong></span>
                            <span>TIME: ${item.timestamp}</span>
                        </div>
                    </div>
                    <button onclick="window.voiceEngine.speakVerdict(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                            class="p-2 rounded-lg bg-slate-800 hover:bg-yellow-400 hover:text-black text-slate-300 transition" 
                            title="Speak this verdict">
                        <i class="fa-solid fa-volume-high text-xs"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        const tabs = document.querySelectorAll('.more-tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active', 'text-yellow-400', 'border-yellow-400'));
                btn.classList.add('active', 'text-yellow-400', 'border-yellow-400');
                const targetView = btn.dataset.view;
                document.querySelectorAll('.more-view-panel').forEach(p => p.classList.add('hidden'));
                const activePanel = document.getElementById(`moreView-${targetView}`);
                if (activePanel) activePanel.classList.remove('hidden');
                if (targetView === 'history') this.renderHistoryList();
            });
        });
    }
}

// Global instance
window.moreFeatures = new MoreFeaturesController();
