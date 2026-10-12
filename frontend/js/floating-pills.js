/**
 * DRISHTI-PHARMA: FLOATING PILLS & CAPSULES ENGINE
 * Generates an ambient, floating pharmaceutical particle canvas.
 * Includes 2-tone capsules, round scored tablets, and caplets.
 */

class FloatingPillsEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 38;
        this.mouseX = 0;
        this.mouseY = 0;
        this.hasMouse = false;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.hasMouse = true;
        });
        window.addEventListener('mouseleave', () => {
            this.hasMouse = false;
        });

        // Spawn initial particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle(true));
        }

        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    createParticle(randomY = false) {
        const types = ['capsule', 'round_tablet', 'caplet'];
        const type = types[Math.floor(Math.random() * types.length)];
        const scale = 0.6 + Math.random() * 0.7; // 0.6x to 1.3x size

        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : this.height + 40,
            type: type,
            width: type === 'round_tablet' ? 22 * scale : 34 * scale,
            height: type === 'round_tablet' ? 22 * scale : 14 * scale,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -0.3 - Math.random() * 0.45, // Slow float upwards
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.015,
            opacity: 0.12 + Math.random() * 0.22, // Subtle background opacity
            glowColor: Math.random() > 0.4 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(255, 255, 255, 0.3)',
            fillHalf: Math.random() > 0.5 ? 'rgba(250, 204, 21, 0.18)' : 'rgba(245, 158, 11, 0.15)'
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Motion update
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.vRot;

            // Subtle mouse repulsion
            if (this.hasMouse) {
                const dx = p.x - this.mouseX;
                const dy = p.y - this.mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.8;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
            }

            // Wrap around edges
            if (p.y < -50) {
                this.particles[i] = this.createParticle(false);
                continue;
            }
            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;

            // Draw particle
            this.drawParticle(p);
        }

        requestAnimationFrame(() => this.animate());
    }

    drawParticle(p) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = p.opacity;

        if (p.type === 'capsule') {
            this.drawCapsule(p);
        } else if (p.type === 'round_tablet') {
            this.drawRoundTablet(p);
        } else {
            this.drawCaplet(p);
        }

        this.ctx.restore();
    }

    drawCapsule(p) {
        const w = p.width;
        const h = p.height;
        const r = h / 2;

        this.ctx.lineWidth = 1.4;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.shadowColor = p.glowColor;
        this.ctx.shadowBlur = 6;

        // Outer capsule path
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + r, -h / 2);
        this.ctx.lineTo(w / 2 - r, -h / 2);
        this.ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
        this.ctx.lineTo(-w / 2 + r, h / 2);
        this.ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2);
        this.ctx.closePath();
        this.ctx.stroke();

        // Fill left half (amber tint)
        this.ctx.save();
        this.ctx.clip();
        this.ctx.fillStyle = p.fillHalf;
        this.ctx.fillRect(-w / 2, -h / 2, w / 2, h);
        this.ctx.restore();

        // Dividing center ring
        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(0, h / 2);
        this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
        this.ctx.stroke();
    }

    drawRoundTablet(p) {
        const r = p.width / 2;

        this.ctx.lineWidth = 1.4;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.shadowColor = p.glowColor;
        this.ctx.shadowBlur = 5;

        // Tablet circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r, 0, Math.PI * 2);
        this.ctx.stroke();

        // Center score/bisect line
        this.ctx.beginPath();
        this.ctx.moveTo(-r * 0.7, 0);
        this.ctx.lineTo(r * 0.7, 0);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.stroke();
    }

    drawCaplet(p) {
        const w = p.width;
        const h = p.height;
        const r = h / 2;

        this.ctx.lineWidth = 1.4;
        this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
        this.ctx.shadowColor = p.glowColor;
        this.ctx.shadowBlur = 6;

        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + r, -h / 2);
        this.ctx.lineTo(w / 2 - r, -h / 2);
        this.ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
        this.ctx.lineTo(-w / 2 + r, h / 2);
        this.ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.pillsEngine = new FloatingPillsEngine('pillsCanvas');
});
