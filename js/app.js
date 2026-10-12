/**
 * DRISHTI-PHARMA: MAIN APP COORDINATOR
 * Manages UI navigation, modals, keyboard shortcuts, and accessibility live regions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Navigation elements
    const navAbout = document.getElementById('nav-about');
    const navPrivacy = document.getElementById('nav-privacy');
    const btnMore = document.getElementById('btn-more');

    // Modals & Drawers
    const modalAbout = document.getElementById('modal-about');
    const modalPrivacy = document.getElementById('modal-privacy');
    const drawerMore = document.getElementById('drawer-more');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    // Modal Helpers
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // About Modal
    if (navAbout && modalAbout) {
        navAbout.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalAbout);
        });
    }

    // Privacy Modal
    if (navPrivacy && modalPrivacy) {
        navPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalPrivacy);
        });
    }

    // Close buttons for modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-backdrop');
            closeModal(modal);
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal(backdrop);
            }
        });
    });

    // Drawer More
    if (btnMore && drawerMore) {
        btnMore.addEventListener('click', (e) => {
            e.preventDefault();
            drawerMore.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (window.moreFeatures) {
                window.moreFeatures.renderHistoryList();
            }
        });
    }

    if (closeDrawerBtn && drawerMore) {
        closeDrawerBtn.addEventListener('click', () => {
            drawerMore.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    if (drawerMore) {
        drawerMore.addEventListener('click', (e) => {
            if (e.target === drawerMore) {
                drawerMore.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // Voice Engine Settings inside drawer
    const langSelect = document.getElementById('voiceLangSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (window.voiceEngine) {
                window.voiceEngine.setLanguage(val);
            }
            if (window.splitCamera) {
                window.splitCamera.setLanguage(val);
            }
        });
    }

    const rateRange = document.getElementById('voiceRateRange');
    const rateDisplay = document.getElementById('voiceRateDisplay');
    if (rateRange && rateDisplay) {
        rateRange.addEventListener('input', (e) => {
            const val = e.target.value;
            rateDisplay.textContent = `${val}x`;
            if (window.voiceEngine) {
                window.voiceEngine.setRate(val);
            }
        });
    }

    const testVoiceBtn = document.getElementById('testVoiceBtn');
    if (testVoiceBtn) {
        testVoiceBtn.addEventListener('click', () => {
            if (window.voiceEngine) {
                const sample = (window.splitCamera && window.splitCamera.currentMedicine) || window.drishtiScanner.samples[0];
                window.voiceEngine.speakVerdict(sample);
            }
        });
    }

    // Accessibility Toggles in drawer
    const bionicToggle = document.getElementById('toggleBionic');
    if (bionicToggle) {
        bionicToggle.addEventListener('change', (e) => {
            if (window.moreFeatures) {
                window.moreFeatures.toggleBionicReading(e.target.checked);
            }
        });
    }

    const contrastToggle = document.getElementById('toggleContrast');
    if (contrastToggle) {
        contrastToggle.addEventListener('change', (e) => {
            if (window.moreFeatures) {
                window.moreFeatures.toggleHighContrast(e.target.checked);
            }
        });
    }

    const fontPlus = document.getElementById('fontIncreaseBtn');
    const fontMinus = document.getElementById('fontDecreaseBtn');
    if (fontPlus) fontPlus.addEventListener('click', () => window.moreFeatures.adjustFontSize(5));
    if (fontMinus) fontMinus.addEventListener('click', () => window.moreFeatures.adjustFontSize(-5));

    // Clear and Export history buttons
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => window.moreFeatures.clearHistory());

    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    if (exportHistoryBtn) exportHistoryBtn.addEventListener('click', () => window.moreFeatures.exportHistory());

    // Keyboard Shortcuts (WCAG AAA Accessibility)
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (e.key === 'v' || e.key === 'V') {
            if (window.voiceEngine) {
                const sample = (window.splitCamera && window.splitCamera.currentMedicine) || window.drishtiScanner.samples[0];
                window.voiceEngine.speakVerdict(sample);
            }
        } else if (e.key === 'm' || e.key === 'M') {
            if (drawerMore) {
                drawerMore.classList.toggle('open');
                document.body.style.overflow = drawerMore.classList.contains('open') ? 'hidden' : '';
            }
        } else if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m));
            if (drawerMore) {
                drawerMore.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });

    console.log('⚡ Drishti-Pharma Frontend initialized.');
});
