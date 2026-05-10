import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Gamepad2,
    Flame,
    Trophy,
    Brain,
    Zap,
    Hash,
    Lock,
    Ghost,
    Bug,
    ArrowRight,
    Binary,
    Shield,
    Boxes,
    Cpu,
    MousePointer2,
    Keyboard,
    Monitor,
    Layout
} from "lucide-react";

/* =========================
   Game Components
========================= */
import MemoryGame from "../components/arcade/MemoryGame";
import TypingGame from "../components/arcade/TypingGame";
import StackOverflowEscape from "../components/arcade/StackOverflowEscape";
import BugHunter from "../components/arcade/BugHunter";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Arcade = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [activeGame, setActiveGame] = useState(null);

    /* =========================
       Config
    ========================= */
    const GAMES = [
        { id: "memory", title: "Memory Matrix", desc: "Pattern_Recognition", icon: <Brain size={28} />, color: "primary", component: MemoryGame, difficulty: "Easy" },
        { id: "typing", title: "Syntax Sprint", desc: "Elite_Typing_Test", icon: <Keyboard size={28} />, color: "emerald", component: TypingGame, difficulty: "Medium" },
        { id: "escape", title: "Stack Escape", desc: "Algorithm_Navigation", icon: <Ghost size={28} />, color: "cyan", component: StackOverflowEscape, difficulty: "Hard" },
        { id: "hunter", title: "Bug Hunter", desc: "Full_System_Audit", icon: <Bug size={28} />, color: "rose", component: BugHunter, difficulty: "Medium" }
    ];

    const activeGameData = useMemo(() => GAMES.find(g => g.id === activeGame), [activeGame]);

    /* =========================
       Stats
    ========================= */
    const points = user?.arcade?.points || 0;
    const currentStreak = activeGame
        ? user?.arcade?.games?.[activeGame]?.streak || 0
        : user?.arcade?.streak || 0;

    const BADGES = [
        { days: 1, label: "Hello World", desc: "First step into the matrix" },
        { days: 3, label: "Script Kiddie", desc: "Starting to understand the flow" },
        { days: 7, label: "Code Ninja", desc: "Stealthy and efficient" },
        { days: 30, label: "Full Stack", desc: "Master of all layers" },
    ];

    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 pb-24 animate-in fade-in duration-1000">
            {/* Main Header Section */}
            <div className="mb-14 relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-[3.5rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                
                <div className="relative bg-card/10 backdrop-blur-3xl border border-border/30 rounded-[3rem] p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-12 items-center overflow-hidden shadow-2xl">
                    
                    
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="bg-primary/20 p-5 rounded-3xl border border-primary/20 shadow-inner">
                                <Gamepad2 size={36} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tighter  leading-none mb-2">Arcade Zone</h1>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500  shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[11px] font-bold  tracking-[0.2em] text-muted-foreground/60">Active Session</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start relative z-10">
                        {BADGES.map((badge, i) => {
                            const unlocked = currentStreak >= badge.days;
                            return (
                                <div 
                                    key={i} 
                                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-[10px] font-bold  tracking-widest transition-all duration-500 hover:scale-105 ${unlocked ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/[0.01] border-white/5 text-muted-foreground/20"}`}
                                    title={badge.desc}
                                >
                                    {unlocked ? <Zap size={12} className="fill-current" /> : <Lock size={12} />}
                                    {badge.label}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-2 gap-5 relative z-10">
                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-6 text-center group/stat hover:border-orange-500/30 transition-all duration-500">
                            <Flame size={24} className="mx-auto mb-2 text-orange-500 group-hover/stat:scale-125 transition-transform duration-500" />
                            <p className="text-[10px] font-bold text-muted-foreground/40  tracking-widest mb-1">Streak</p>
                            <p className="text-xl font-bold tracking-tighter">{currentStreak}</p>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 text-center group/stat hover:border-primary/30 transition-all duration-500">
                            <Trophy size={24} className="mx-auto mb-2 text-primary group-hover/stat:scale-125 transition-transform duration-500" />
                            <p className="text-[10px] font-bold text-muted-foreground/40  tracking-widest mb-1">Experience</p>
                            <p className="text-xl font-bold tracking-tighter">{points > 999 ? `${(points/1000).toFixed(1)}k` : points}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Games Grid - Optimized Responsiveness */}
            <AnimatePresence mode="wait">
                {!activeGame ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                    >
                        {GAMES.map((game) => (
                            <GameCard 
                                key={game.id} 
                                {...game} 
                                onClick={() => user ? setActiveGame(game.id) : navigate('/login')} 
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="min-h-[80vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-12 bg-card/10 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-border/30 shadow-2xl relative overflow-hidden">
                            
                            <button
                                onClick={() => setActiveGame(null)}
                                className="group flex items-center gap-4 text-[11px] font-bold  tracking-[0.2em] text-muted-foreground hover:text-primary transition-all relative z-10"
                            >
                                <span className="p-3 bg-background/50 rounded-xl border border-border/50 group-hover:border-primary/30 transition-all">←</span> Back to Arcade
                            </button>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className={`w-2.5 h-2.5 rounded-full  bg-${activeGameData.color === 'primary' ? 'primary' : activeGameData.color}`} />
                                <span className="text-sm font-bold  tracking-[0.3em] text-foreground">{activeGameData.title}</span>
                                <div className="px-3 py-1 bg-background/50 rounded-lg border border-border/50 text-[10px] font-bold text-muted-foreground/50">{activeGameData.difficulty.toUpperCase()}</div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 bg-card/5 backdrop-blur-md rounded-[4rem] border border-border/20 relative overflow-hidden shadow-inner">
                            
                            {activeGameData && <activeGameData.component dispatch={dispatch} />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GameCard = ({ title, desc, icon, onClick, color, difficulty }) => {
    const colorMap = {
        primary: "primary",
        emerald: "emerald-500",
        cyan: "cyan-500",
        rose: "rose-500",
        pink: "pink-500",
        amber: "amber-500",
        violet: "violet-500",
        blue: "blue-500"
    };

    const activeColor = colorMap[color];

    return (
        <button
            onClick={onClick}
            className={`group relative bg-card/10 backdrop-blur-2xl border border-border/30 rounded-[2.5rem] p-6 sm:p-10 text-left transition-all duration-700 hover:-translate-y-4 active:scale-[0.98] flex flex-col justify-between overflow-hidden min-h-[300px] sm:min-h-[340px] shadow-xl hover:shadow-2xl`}
        >
            {/* Visual Accents */}
            
            <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-[90px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 bg-${activeColor}`} />
            
            <div className="relative z-10 flex justify-between items-start">
                <div className={`p-6 bg-background/40 backdrop-blur rounded-[2rem] border border-border/30 group-hover:border-${activeColor}/50 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 text-${activeColor}`}>
                    {icon}
                </div>
                <div className="flex flex-col items-end gap-3">
                    <span className="text-[9px] font-bold  tracking-widest text-muted-foreground/30">Complexity</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(i => (
                            <div 
                                key={i} 
                                className={`w-2 h-5 rounded-full transition-all duration-500 ${i <= (difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 4) ? `bg-${activeColor} shadow-[0_0_12px_currentColor]` : 'bg-muted/10'}`} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-10">
                <div className="mb-8">
                    <h3 className="text-base sm:text-lg font-bold tracking-tighter leading-tight mb-3 text-foreground group-hover:text-primary transition-colors duration-500 ">{title}</h3>
                    <p className="text-[11px] font-bold  tracking-widest text-muted-foreground/40">{desc.replace(/_/g, ' ')}</p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border/10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold  tracking-widest text-muted-foreground/30 mb-1">Level</span>
                        <span className={`text-[12px] font-bold  tracking-[0.2em] text-${activeColor}`}>{difficulty}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-[11px] font-bold  tracking-widest translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 text-${activeColor}`}>
                        Play Now <ArrowRight size={16} strokeWidth={3} />
                    </div>
                </div>
            </div>
        </button>
    );
};


export default Arcade;
