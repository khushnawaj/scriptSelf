
import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export default function NeuralGraph({ data = [] }) {
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const { themeAssets } = useTheme();
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [hoveredNode, setHoveredNode] = useState(null);

    // Prepare graph data
    const graphData = useMemo(() => {
        if (!data.length) return { nodes: [], links: [] };

        const nodes = data.map((note, i) => ({
            id: note._id,
            title: note.title,
            category: note.category?.name || 'LOG',
            x: Math.random() * 800,
            y: Math.random() * 600,
            vx: 0, vy: 0,
            radius: 5 + (note.reputation || 2) / 10
        }));

        const links = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const noteA = data[i];
                const noteB = data[j];
                const sharedTags = noteA.tags.filter(t => noteB.tags.includes(t));
                if (sharedTags.length >= 1 || noteA.category?._id === noteB.category?._id) {
                    links.push({ source: nodes[i], target: nodes[j], strength: sharedTags.length + 1 });
                }
            }
        }
        return { nodes, links };
    }, [data]);

    // Simple Force Simulation
    useEffect(() => {
        const { nodes, links } = graphData;
        if (!nodes.length) return;

        let animationFrame;
        const simulation = () => {
            // Center force
            nodes.forEach(n => {
                n.vx += (400 - n.x) * 0.001;
                n.vy += (300 - n.y) * 0.001;
            });

            // Link force
            links.forEach(l => {
                const dx = l.target.x - l.source.x;
                const dy = l.target.y - l.source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) return;
                const force = (dist - 150) * 0.002 * l.strength;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                l.source.vx += fx;
                l.source.vy += fy;
                l.target.vx -= fx;
                l.target.vy -= fy;
            });

            // Repulsion force
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = 80;
                    if (dist < minDist) {
                        const force = (minDist - dist) * 0.01;
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        nodes[i].vx -= fx;
                        nodes[i].vy -= fy;
                        nodes[j].vx += fx;
                        nodes[j].vy += fy;
                    }
                }
            }

            // Apply velocity & friction
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                n.vx *= 0.9;
                n.vy *= 0.9;
            });

            draw();
            animationFrame = requestAnimationFrame(simulation);
        };

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(canvas.width / 2 + transform.x, canvas.height / 2 + transform.y);
            ctx.scale(transform.scale, transform.scale);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            // Draw Links
            links.forEach(l => {
                ctx.beginPath();
                ctx.moveTo(l.source.x, l.source.y);
                ctx.lineTo(l.target.x, l.target.y);
                ctx.strokeStyle = themeAssets?.color || '#3b82f6';
                ctx.globalAlpha = 0.1 * l.strength;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Draw Nodes
            nodes.forEach(n => {
                const isHovered = hoveredNode === n.id;

                // Glow
                const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 3);
                gradient.addColorStop(0, `${themeAssets?.color || '#3b82f6'}33`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? '#fff' : (themeAssets?.color || '#3b82f6');
                ctx.globalAlpha = isHovered ? 1 : 0.8;
                ctx.fill();

                if (isHovered || transform.scale > 1.5) {
                    ctx.font = 'bold 10px Inter, sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = 1;
                    ctx.textAlign = 'center';
                    ctx.fillText(n.title, n.x, n.y + n.radius + 15);
                }
            });

            ctx.restore();
        };

        simulation();
        return () => cancelAnimationFrame(animationFrame);
    }, [graphData, transform, hoveredNode, themeAssets]);

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setTransform(prev => ({ ...prev, scale: Math.max(0.5, Math.min(3, prev.scale * delta)) }));
    };

    return (
        <div className="relative w-full h-[600px] bg-black/20 rounded-2xl border border-border overflow-hidden cursor-crosshair group">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full"
                onWheel={handleWheel}
                onMouseMove={(e) => {
                    // Basic hit detection (optimized version would use spatial hashing)
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2 - transform.x) / transform.scale + rect.width / 2;
                    const y = (e.clientY - rect.top - rect.height / 2 - transform.y) / transform.scale + rect.height / 2;

                    const hit = graphData.nodes.find(n => {
                        const d = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
                        return d < (n.radius + 5);
                    });
                    setHoveredNode(hit ? hit.id : null);
                }}
                onClick={() => {
                    if (hoveredNode) navigate(`/notes/${hoveredNode}`);
                }}
            />

            {/* UI Overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-card/80 backdrop-blur-md p-3 rounded-xl border border-border flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Network</span>
                        <span className="text-[9px] text-muted-foreground font-medium uppercase">{graphData.nodes.length} Synchronized Nodes</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-2 bg-card border border-border rounded-lg hover:text-primary transition-all"><RefreshCw size={16} /></button>
                <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(3, p.scale + 0.2) }))} className="p-2 bg-card border border-border rounded-lg hover:text-primary transition-all"><ZoomIn size={16} /></button>
                <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.5, p.scale - 0.2) }))} className="p-2 bg-card border border-border rounded-lg hover:text-primary transition-all"><ZoomOut size={16} /></button>
            </div>

            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-tighter bg-card/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> ACTIVE LINK</span>
                    <span className="flex items-center gap-1.5 opacity-50"><div className="w-2 h-2 rounded-full bg-border" /> COLD STORAGE</span>
                </div>
            </div>
        </div>
    );
}

