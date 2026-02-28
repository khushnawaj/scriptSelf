import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, RefreshCw, Settings, Info, Box } from 'lucide-react';
import api from '../utils/api';
import Spinner from '../components/Spinner';

const Roadmap = () => {
    const navigate = useNavigate();
    const fgRef = useRef();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        fetchGraphData();
    }, []);

    const fetchGraphData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/notes/roadmap');
            if (res.data.success) {
                setGraphData(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch graph data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNodeClick = (node) => {
        // Center on node
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(3, 1000);
        setSelectedNode(node);
    };

    const getNodeColor = (node) => {
        switch (node.type) {
            case 'issue': return '#f59e0b';
            case 'adr': return '#10b981';
            case 'pattern': return '#3b82f6';
            default: return '#6366f1';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col relative overflow-hidden bg-background/50 rounded-3xl border border-border mt-4">
            {/* Control Bar */}
            <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-4 bg-background/80 backdrop-blur-xl p-2 rounded-2xl border border-border shadow-2xl pointer-events-auto">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Network size={20} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-[14px] font-bold text-foreground mb-0">Neural Roadmap</h2>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Global Knowledge Connection</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="flex bg-background/80 backdrop-blur-xl p-1.5 rounded-xl border border-border shadow-md">
                        <button onClick={() => fgRef.current.zoomIn()} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><ZoomIn size={18} /></button>
                        <button onClick={() => fgRef.current.zoomOut()} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><ZoomOut size={18} /></button>
                        <div className="w-[1px] bg-border mx-1" />
                        <button onClick={fetchGraphData} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"><RefreshCw size={18} /></button>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-3 rounded-xl border transition-all shadow-md bg-background/80 backdrop-blur-xl ${showSettings ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner />
                </div>
            ) : (
                <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeLabel="name"
                        nodeColor={getNodeColor}
                        nodeRelSize={6}
                        linkColor={() => 'rgba(255, 255, 255, 0.08)'}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.name;
                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Inter, sans-serif`;
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                            // Draw circle
                            ctx.fillStyle = getNodeColor(node);
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                            ctx.fill();

                            // Draw label if zoomed in enough
                            if (globalScale > 1.5) {
                                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                                ctx.shadowBlur = 4;
                                ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
                                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 - 8, bckgDimensions[0], bckgDimensions[1]);
                                ctx.shadowBlur = 0;

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = '#fff';
                                ctx.fillText(label, node.x, node.y - 8);
                            }
                        }}
                        onNodeClick={handleNodeClick}
                        backgroundColor="transparent"
                    />
                </div>
            )}

            {/* Selection Card */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute right-6 top-24 bottom-6 w-80 bg-background/95 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl z-20 overflow-hidden flex flex-col"
                    >
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            <div className="flex justify-between items-start">
                                <span className={`px-2 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest ${selectedNode.type === 'adr' ? 'bg-green-500/10 text-green-500' :
                                    selectedNode.type === 'issue' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-primary/10 text-primary'
                                    }`}>
                                    {selectedNode.type || 'DOCUMENT'}
                                </span>
                                <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-foreground leading-tight mb-2">{selectedNode.name}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground text-[12px]">
                                    <Box size={14} />
                                    <span>Logic Hash: {selectedNode.id.substring(0, 8)}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info size={12} /> Neural Status
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-muted-foreground">Connectivity</span>
                                        <span className="text-foreground font-bold">{selectedNode.val / 10}x Pulse</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-muted-foreground">Sync Depth</span>
                                        <span className="text-foreground font-bold">84%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/10 border-t border-border mt-auto">
                            <button
                                onClick={() => navigate(`/notes/${selectedNode.id}`)}
                                className="w-full so-btn so-btn-primary py-3 font-bold"
                            >
                                Open Source Record
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal (Overlay) */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-24 right-6 w-64 bg-background/95 backdrop-blur-2xl border border-border rounded-2xl shadow-xl z-30 p-4"
                    >
                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">Display Protocol</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-foreground">Particle Flow</span>
                                <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-2 h-2 bg-primary rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-foreground">Logic Labels</span>
                                <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-2 h-2 bg-primary rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-foreground">3D Render</span>
                                <div className="w-8 h-4 bg-muted rounded-full relative">
                                    <div className="absolute left-1 top-1 w-2 h-2 bg-muted-foreground rounded-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Roadmap;
