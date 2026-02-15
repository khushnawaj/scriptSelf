
import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function NeuralBackground({ variant = 'grid', density = 30 }) {
    const canvasRef = useRef(null);
    const { themeAssets } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Particles for the grid variant
        const particles = Array.from({ length: density }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        }));

        const themeColor = themeAssets?.color || '#3b82f6';

        // Convert hex to rgb for rgba usage
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        };
        const rgbColor = hexToRgb(themeColor);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (variant === 'grid') {
                ctx.strokeStyle = `rgba(${rgbColor}, 0.05)`;
                ctx.lineWidth = 1;

                particles.forEach((p, i) => {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0) p.x = canvas.width;
                    if (p.x > canvas.width) p.x = 0;
                    if (p.y < 0) p.y = canvas.height;
                    if (p.y > canvas.height) p.y = 0;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${rgbColor}, 0.1)`;
                    ctx.fill();

                    // Connect particles
                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 200) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.globalAlpha = (1 - dist / 200) * 0.1;
                            ctx.stroke();
                        }
                    }
                });
            } else if (variant === 'overlord') {
                // Matrix Data Rain style for top tier
                ctx.font = '10px monospace';
                const chars = "01".split("");
                const columns = Math.ceil(canvas.width / 20);
                const drops = Array(columns).fill(1).map(() => Math.random() * -100);

                const renderRain = () => {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = `rgba(${rgbColor}, 0.15)`; // Use theme color for Overlord too
                    drops.forEach((y, i) => {
                        const text = chars[Math.floor(Math.random() * chars.length)];
                        ctx.fillText(text, i * 20, y);

                        if (y > canvas.height && Math.random() > 0.975) {
                            drops[i] = 0;
                        }
                        drops[i] += 10;
                    });
                };
                renderRain();
            }

            animationFrame = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [variant, density, themeAssets]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1] opacity-50"
            style={{ filter: 'blur(1px)' }}
        />
    );
}
