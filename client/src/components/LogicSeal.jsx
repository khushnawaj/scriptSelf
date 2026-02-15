import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * LogicSeal: Procedurally generated SVG patterns representing a document's "Neural Fingerprint".
 * It hashes the content and id to create a unique geometric seal.
 */
const LogicSeal = ({ content = "", id = "", size = 100, className = "" }) => {
    const { themeAssets } = useTheme();

    const sealData = useMemo(() => {
        // Simple hashing function
        const combined = (content.substring(0, 100) + id).split("");
        let hash = 0;
        combined.forEach(char => {
            hash = ((hash << 5) - hash) + char.charCodeAt(0);
            hash |= 0;
        });

        const absHash = Math.abs(hash);

        // Derive visual parameters from hash
        const getVal = (offset, range) => (absHash >> offset) % range;

        // Extract hue from theme color if possible, otherwise use randomized
        // themeAssets.color is a hex normally (e.g. #0d9488)
        const getThemeHue = (hex) => {
            if (!hex || hex.charAt(0) !== '#') return 200;
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h;
            if (max === min) h = 0;
            else if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / (max - min) + 2;
            else h = (r - g) / (max - min) + 4;
            return Math.round(h * 60);
        };

        const themeHue = getThemeHue(themeAssets?.color);
        // Mix theme hue with hash hue (bias towards theme while keeping uniqueness)
        const hashHue = getVal(0, 360);
        const primaryHue = (themeHue + (hashHue % 60) - 30 + 360) % 360;
        const secondaryHue = (primaryHue + 40) % 360;

        const shapes = [];
        const numShapes = 4 + (absHash % 4);

        for (let i = 0; i < numShapes; i++) {
            const seed = (absHash * (i + 1)) % 1000;
            const type = seed % 3; // 0: Circle, 1: Polygon, 2: Line
            const shapeSize = 10 + (seed % 30);
            const x = 20 + (seed % 60);
            const y = 20 + ((seed >> 2) % 60);
            const rotation = seed % 360;
            const opacity = 0.2 + (seed % 50) / 100;

            shapes.push({ type, x, y, size: shapeSize, rotation, opacity, color: i % 2 === 0 ? `hsl(${primaryHue}, 70%, 60%)` : `hsl(${secondaryHue}, 60%, 50%)` });
        }

        return { primaryHue, secondaryHue, shapes };
    }, [content, id, themeAssets]);

    return (
        <div
            className={`relative overflow-hidden flex items-center justify-center bg-muted/5 border border-border/50 rounded-xl ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full opacity-80"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background Glow */}
                <defs>
                    <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={`hsl(${sealData.primaryHue}, 70%, 20%)`} stopOpacity="0.4" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="50%" cy="50%" r="50%" fill={`url(#glow-${id})`} />

                {/* Geometric Shapes */}
                {sealData.shapes.map((s, i) => {
                    const transform = `rotate(${s.rotation} ${s.x} ${s.y})`;
                    if (s.type === 0) {
                        return <circle key={i} cx={s.x} cy={s.y} r={s.size / 2} fill={s.color} fillOpacity={s.opacity} />;
                    } else if (s.type === 1) {
                        return (
                            <rect
                                key={i}
                                x={s.x - s.size / 2} y={s.y - s.size / 2}
                                width={s.size} height={s.size}
                                fill={s.color} fillOpacity={s.opacity}
                                transform={transform}
                                rx={2}
                            />
                        );
                    } else {
                        return (
                            <line
                                key={i}
                                x1={s.x - s.size} y1={s.y}
                                x2={s.x + s.size} y2={s.y}
                                stroke={s.color}
                                strokeWidth="2"
                                strokeOpacity={s.opacity}
                                transform={transform}
                            />
                        );
                    }
                })}

                {/* Connecting "Neural" Lines */}
                <path
                    d="M 10 10 L 90 90 M 10 90 L 90 10"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeOpacity="0.1"
                />
            </svg>

            {/* Corner Metadata Decoration */}
            <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-20 translate-y-[-1px]">
                <div className="w-1 h-1 bg-current rounded-full" />
                <div className="w-1 h-1 bg-current rounded-full" />
                <div className="w-1 h-1 bg-current rounded-full" />
            </div>
        </div>
    );
};

export default LogicSeal;
