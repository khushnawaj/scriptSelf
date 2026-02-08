import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Binary,
    Compass,
    Share2,
    Target,
    Cpu,
    Database,
    Layers,
    ChevronRight,
    Activity
} from 'lucide-react';

const SchematicVisualizer = () => (
    <div className="absolute inset-0 pointer-events-none opacity-[0.15] dark:opacity-[0.08] overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Animated Schematic Lines */}
            <motion.path
                d="M -100 200 L 400 200 L 500 300 L 800 300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary/30"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
                d="M 1000 600 L 600 600 L 500 500 L 200 500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary/30"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
            />

            {/* Moving Pulses */}
            <motion.circle
                r="2"
                fill="currentColor"
                className="text-primary"
                animate={{
                    offsetDistance: ["0%", "100%"]
                }}
                style={{
                    offsetPath: "path('M -100 200 L 400 200 L 500 300 L 800 300')",
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    </div>
);

const TerminalLanding = ({ user, notes }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [systemLoad, setSystemLoad] = useState([0.12, 0.15, 0.08]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const loadTimer = setInterval(() => {
            setSystemLoad([
                (Math.random() * 0.1 + 0.05).toFixed(2),
                (Math.random() * 0.1 + 0.1).toFixed(2),
                (Math.random() * 0.1 + 0.08).toFixed(2)
            ]);
        }, 5000);
        return () => {
            clearInterval(timer);
            clearInterval(loadTimer);
        };
    }, []);

    const recentRecords = useMemo(() => notes?.slice(0, 8) || [], [notes]);

    return (
        <div className="w-full h-[650px] bg-card text-foreground font-mono border border-border rounded-[6px] shadow-sm relative overflow-hidden flex flex-col group selection:bg-primary/20">
            <SchematicVisualizer />

            {/* Header: OS Kernel Status */}
            <div className="h-12 border-b border-border bg-muted/30 backdrop-blur-md flex items-center justify-between px-6 z-20 relative">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-primary font-black tracking-tighter text-sm">
                        <Cpu size={14} className="animate-pulse" />
                        SCRIPTSHELF_OS.INTERNAL
                    </div>
                    <div className="hidden md:flex gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        <span>SESSION: {user?.username?.toUpperCase()}</span>
                        <span>|</span>
                        <span>KERNEL_VER: 4.2.0X</span>
                    </div>
                </div>
                <div className="flex items-center gap-8 text-[10px] font-black tabular-nums">
                    <div className="flex gap-4 opacity-70">
                        <span className="flex items-center gap-1.5"><Activity size={10} className="text-primary" /> LOAD: {systemLoad.join(' ')}</span>
                        <span className="flex items-center gap-1.5 text-primary">CLK: {currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden z-10 relative">
                {/* Left Panel: Resource Topology */}
                <div className="w-64 border-r border-border h-full p-6 flex flex-col gap-8 bg-muted/10">
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Layers size={12} /> Resource_Stack
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Doc_Buffer', val: notes?.length || 0, max: 100 },
                                { label: 'Thread_Pool', val: 32, max: 64 },
                                { label: 'Cache_State', val: 84, max: 100 }
                            ].map(metric => (
                                <div key={metric.label} className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold uppercase">
                                        <span className="text-muted-foreground">{metric.label}</span>
                                        <span className="text-primary">{metric.val}</span>
                                    </div>
                                    <div className="h-0.5 w-full bg-border">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(metric.val / metric.max) * 100}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex-1 overflow-hidden">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Memory_Allocation</h3>
                        <div className="space-y-0.5">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="flex justify-between text-[8px] font-medium opacity-30 hover:opacity-100 transition-opacity">
                                    <span>PAG_0x{(0xFA20 + i * 16).toString(16).toUpperCase()}</span>
                                    <span className="text-primary">[{Math.random() > 0.5 ? 'READY' : 'WAIT'}]</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Panel: Document Registry */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/20">
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-3">
                                <Database size={18} className="text-primary" />
                                KNOWLEDGE_GRAV_CORES
                            </h2>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Indexing active pointers in /vault/root</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-sm">
                            <Binary size={12} className="text-primary" />
                            <span className="text-[10px] font-black text-primary tracking-widest uppercase">OPTIMIZED</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar p-8 pt-4">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {recentRecords.map((note, i) => (
                                <motion.div
                                    key={note._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(`/notes/${note._id}`)}
                                    className="p-4 border border-border bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden rounded-[4px]"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rotate-45 translate-x-12 -translate-y-12" />

                                    <div className="flex items-center justify-between z-10">
                                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">PTR: 0x{note._id.slice(-4).toUpperCase()}</span>
                                        <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary translate-x-0 group-hover:translate-x-1 transition-transform" />
                                    </div>

                                    <h4 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{note.title}</h4>

                                    <div className="flex items-center justify-between mt-auto z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="so-tag py-0.5 px-2 text-[9px] min-w-[40px] justify-center">
                                                {note.type?.toUpperCase() || 'RAW'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                                {note.category?.name || 'ROOT'}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-mono text-muted-foreground opacity-40">3{i}82-HASH</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Global Context */}
                <div className="w-72 border-l border-border h-full p-6 flex flex-col gap-8 bg-muted/10">
                    <section>
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Compass size={12} /> Global_Nav
                        </h3>
                        <div className="space-y-1">
                            {['Playground', 'Arcade', 'Community', 'Settings'].map((item, i) => (
                                <div key={item} className="p-3 border border-transparent hover:border-border hover:bg-card transition-all flex items-center justify-between group cursor-pointer rounded-[4px]">
                                    <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-tight">{item}</span>
                                    <span className="text-[9px] text-muted-foreground/40 group-hover:text-primary">0{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-primary/5 border border-primary/20 p-4 rounded-[4px]">
                        <div className="flex items-center gap-2 mb-3">
                            <Target size={14} className="text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Neural_Feed</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
                            Detected <span className="text-foreground">{notes?.length || 0}</span> logic nodes in primary memory.
                            Kernel telemetry optimized for production load.
                        </p>
                    </section>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-8 border-t border-border bg-muted/20 flex items-center justify-between px-6 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                <div className="flex gap-6">
                    <span className="text-primary">√ SYNC_ACTIVE</span>
                    <span>DB_CLUSTER: CLOUD_VAULT</span>
                    <span>LATENCY: 24MS</span>
                </div>
                <div className="flex gap-4">
                    <span>UTF-8</span>
                    <span>LN: 104 COL: 12</span>
                    <span className="text-primary font-black">INS</span>
                </div>
            </div>
        </div>
    );
};

export default TerminalLanding;
