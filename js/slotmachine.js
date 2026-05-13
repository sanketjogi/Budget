// ======================== SLOT MACHINE — Mobile Balance Reveal 🎰 ========================
// Only active on mobile (≤768px). Hides balance behind spinning reels.
// User pulls a lever to reveal. Auto-hides after 8s for re-pull.

const SlotMachine = (() => {
    // ── State ──
    let initialized = false;
    let revealed = false;
    let spinning = false;
    let cachedBalance = 0;
    let hideTimer = null;
    let audioCtx = null;

    const HIDE_DELAY = 8000;
    const PULL_THRESHOLD = 55;

    // ── Helpers ──
    function isMobile() { return window.innerWidth <= 768; }

    function vibrate(pattern) {
        try { navigator.vibrate && navigator.vibrate(pattern); } catch (_) {}
    }

    // ── Init ──
    function init() {
        if (initialized) return;
        if (!isMobile()) return;
        buildUI();
        attachLeverEvents();
        initialized = true;
    }

    function buildUI() {
        const card = document.getElementById('balance-card');
        if (!card || card.querySelector('.slot-lever-container')) return;

        card.classList.add('slot-machine-active');

        // Lever
        const lever = document.createElement('div');
        lever.className = 'slot-lever-container';
        lever.innerHTML = `
            <div class="slot-lever-track"></div>
            <div class="slot-lever-arm" id="slot-lever-arm">
                <div class="slot-lever-ball"></div>
            </div>
            <span class="slot-pull-hint">Pull ↓</span>
        `;
        card.appendChild(lever);

        // Slot display (replaces balance text on mobile)
        const statInfo = card.querySelector('.stat-info');
        const display = document.createElement('div');
        display.className = 'slot-display';
        display.id = 'slot-display';
        display.innerHTML = '<span class="slot-placeholder">• • • • •</span>';
        statInfo.appendChild(display);

        // Hide original balance span
        const bal = document.getElementById('total-balance');
        if (bal) bal.classList.add('slot-original-hidden');
    }

    // ── Lever Drag ──
    function attachLeverEvents() {
        const arm = document.getElementById('slot-lever-arm');
        if (!arm) return;

        let startY = 0, dy = 0, dragging = false;

        function onStart(e) {
            if (spinning) return;
            e.preventDefault();
            dragging = true;
            startY = (e.touches ? e.touches[0].clientY : e.clientY);
            arm.classList.add('dragging');
        }
        function onMove(e) {
            if (!dragging) return;
            e.preventDefault();
            dy = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
            dy = Math.max(0, Math.min(dy, 80));
            arm.style.transform = `translateY(${dy}px)`;
            arm.classList.toggle('ready', dy >= PULL_THRESHOLD);
        }
        function onEnd() {
            if (!dragging) return;
            dragging = false;
            arm.classList.remove('dragging', 'ready');
            if (dy >= PULL_THRESHOLD) triggerSpin();
            arm.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
            arm.style.transform = 'translateY(0)';
            setTimeout(() => { arm.style.transition = ''; }, 420);
            dy = 0;
        }

        arm.addEventListener('touchstart', onStart, { passive: false });
        arm.addEventListener('touchmove', onMove, { passive: false });
        arm.addEventListener('touchend', onEnd);
        arm.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    }

    // ── Core Spin Logic ──
    function triggerSpin() {
        if (spinning) return;
        spinning = true;
        revealed = false;

        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

        // Audio context (needs user gesture)
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();

        vibrate([30, 20, 30]);
        playLeverSound();
        buildReels(cachedBalance);

        const reels = document.querySelectorAll('.slot-reel');
        const n = reels.length;

        // Start all reels spinning
        reels.forEach(r => r.querySelector('.slot-reel-strip').classList.add('spinning'));

        // Play ticking sound
        playTickingSound(n);

        // Stop reels RIGHT-TO-LEFT (ones place first) with slow dramatic buildup
        // STAGGER is large so each digit stops noticeably after the previous
        const STAGGER = 550;
        const SPIN_START = 900; // let all reels spin freely first
        for (let i = n - 1; i >= 0; i--) {
            const stopOrder = n - 1 - i;
            const delay = SPIN_START + stopOrder * STAGGER;
            setTimeout(() => {
                stopReel(reels[i]);
                vibrate([20]);
                playReelStopSound(stopOrder);
            }, delay);
        }

        // Finale — after last reel has fully stopped
        const finaleDelay = SPIN_START + n * STAGGER + 300;
        setTimeout(() => {
            spinning = false;
            revealed = true;
            playRevealSound();
            vibrate([50, 30, 50, 30, 80]);
            // No celebration sparkles — clean reveal
            scheduleHide();
        }, finaleDelay);
    }

    // ── Build Digit Reels ──
    function buildReels(value) {
        const display = document.getElementById('slot-display');
        if (!display) return;

        const isNeg = value < 0;
        const abs = Math.abs(value);
        const formatted = abs.toLocaleString('en-IN');

        let html = `<span class="slot-currency">${isNeg ? '−' : ''}₹</span><div class="slot-reels">`;

        for (const ch of formatted) {
            if (ch === ',') {
                html += '<span class="slot-comma">,</span>';
            } else {
                const d = parseInt(ch);
                html += `<div class="slot-reel"><div class="slot-reel-strip" data-target="${d}">`;
                for (let c = 0; c < 3; c++) {
                    for (let i = 0; i <= 9; i++) html += `<div class="slot-digit">${i}</div>`;
                }
                html += `<div class="slot-digit slot-final">${d}</div>`;
                html += '</div></div>';
            }
        }

        html += '</div>';
        display.innerHTML = html;
    }

    function stopReel(reel) {
        const strip = reel.querySelector('.slot-reel-strip');
        strip.classList.remove('spinning');
        strip.classList.add('stopping');
        const h = reel.offsetHeight;
        strip.style.transform = `translateY(-${30 * h}px)`;
    }

    // ── Auto-hide ──
    function scheduleHide() {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            const display = document.getElementById('slot-display');
            if (display) {
                display.classList.add('slot-fading');
                setTimeout(() => {
                    display.innerHTML = '<span class="slot-placeholder">• • • • •</span>';
                    display.classList.remove('slot-fading');
                    revealed = false;
                    // Reset pull hint
                    const hint = document.querySelector('.slot-pull-hint');
                    if (hint) hint.style.opacity = '1';
                }, 600);
            }
        }, HIDE_DELAY);
    }

    // ── Celebration ──
    function showCelebration() {
        const card = document.getElementById('balance-card');
        if (!card) return;

        // Hide pull hint
        const hint = card.querySelector('.slot-pull-hint');
        if (hint) hint.style.opacity = '0';

        // Sparkle burst
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'slot-sparkles';
        for (let i = 0; i < 12; i++) {
            const s = document.createElement('span');
            s.className = 'slot-sparkle';
            s.style.setProperty('--angle', `${i * 30}deg`);
            s.style.setProperty('--delay', `${Math.random() * 0.2}s`);
            s.textContent = ['✨', '💰', '⭐', '🪙'][i % 4];
            sparkleContainer.appendChild(s);
        }
        card.appendChild(sparkleContainer);
        setTimeout(() => sparkleContainer.remove(), 1200);
    }

    // ── Sound Synthesis (Web Audio API) ──
    function playLeverSound() {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    function playTickingSound(numReels) {
        if (!audioCtx) return;
        const dur = 0.7 + numReels * 0.28;
        const ticks = Math.floor(dur / 0.04);
        for (let i = 0; i < ticks; i++) {
            const t = audioCtx.currentTime + i * 0.04;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(500 + Math.random() * 500, t);
            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.025);
        }
    }

    function playReelStopSound(index) {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350 + index * 60, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.1);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    function playRevealSound() {
        if (!audioCtx) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const t = audioCtx.currentTime + i * 0.09;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.28);
        });
    }

    // ── Public API ──
    function updateBalance(val) {
        cachedBalance = val;
        // If currently revealed and not spinning, update live
        if (revealed && !spinning) {
            buildReels(val);
            // Re-stop all reels instantly
            document.querySelectorAll('.slot-reel').forEach(r => {
                const strip = r.querySelector('.slot-reel-strip');
                strip.classList.remove('spinning');
                strip.classList.add('stopping');
                strip.style.transform = `translateY(-${30 * r.offsetHeight}px)`;
            });
        }
    }

    function isActive() {
        return initialized && isMobile();
    }

    return { init, updateBalance, isActive };
})();
