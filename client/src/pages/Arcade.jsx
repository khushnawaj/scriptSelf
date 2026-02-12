import { useState } from "react";
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
    Binary
} from "lucide-react";

/* =========================
   Game Components
========================= */
import MemoryGame from "../components/arcade/MemoryGame";
import TypingGame from "../components/arcade/TypingGame";
import StackOverflowEscape from "../components/arcade/StackOverflowEscape";
import BugHunter from "../components/arcade/BugHunter";

import { useNavigate } from "react-router-dom";

const Arcade = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [activeGame, setActiveGame] = useState(null);

    /* =========================
       Stats
    ========================= */
    const globalStreak = user?.arcade?.streak || 0;
    const points = user?.arcade?.points || 0;

    const currentStreak = activeGame
        ? user?.arcade?.games?.[activeGame]?.streak || 0
        : globalStreak;

    /* =========================
       Badges
    ========================= */
    const BADGES = [
        { days: 1, label: "Hello World", desc: "First step into the matrix" },
        { days: 3, label: "Script Kiddie", desc: "Starting to understand the flow" },
        { days: 7, label: "Code Ninja", desc: "Stealthy and efficient" },
        { days: 30, label: "Full Stack", desc: "Master of all layers" },
        { days: 60, label: "Architect", desc: "System design expert" },
    ];

    /* =====================================================
       UI
    ===================================================== */
    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 pb-16 animate-in fade-in duration-500">

            {/* =====================================================
         HEADER (GRID BASED)
      ===================================================== */}
            <div className="mb-6 relative group">
                {/* Ambient Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-[1.5rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>

                <div
                    className="
                        relative bg-card/40 backdrop-blur-2xl border border-white/5 rounded-[1.2rem] p-4 sm:p-5
                        grid gap-4
                        grid-cols-1
                        lg:grid-cols-[1fr_2.5fr_1.2fr]
                        items-center
                        shadow-xl shadow-black/10
                    "
                >
                    {/* ================= BRAND ================= */}
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-primary/20 p-1.5 rounded-lg">
                                <Gamepad2 size={24} className="text-primary animate-pulse" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
                                DevArcade
                            </h1>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground opacity-40 pl-0.5">
                            Status: <span className="text-emerald-500/80">Online</span>
                        </p>
                    </div>

                    {/* ================= BADGES ================= */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 lg:gap-2">
                        {BADGES.map((badge, i) => {
                            const unlocked = currentStreak >= badge.days;

                            return (
                                <div
                                    key={i}
                                    className={`
                                        flex items-center justify-center gap-1.5
                                        px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest
                                        transition-all duration-300
                                        ${unlocked
                                            ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.05)]"
                                            : "bg-white/[0.01] border-white/5 text-muted-foreground/20 grayscale"
                                        }
                                    `}
                                >
                                    {unlocked ? <Zap size={10} className="fill-current" /> : <Lock size={10} className="opacity-20" />}
                                    <span className="hidden sm:inline">{badge.label}</span>
                                    <span className="sm:hidden">{badge.days}D</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* ================= STATS ================= */}
                    <div className="grid grid-cols-2 gap-2 h-full">
                        <StatBox
                            icon={<Flame size={14} className="fill-current" />}
                            label="Streak"
                            value={currentStreak}
                            color="text-orange-500"
                            bg="bg-orange-500/10"
                            border="border-orange-500/10"
                        />

                        <StatBox
                            icon={<Trophy size={14} />}
                            label="XP"
                            value={points > 99999 ? `${Math.floor(points / 1000)}k` : points}
                            color="text-primary"
                            bg="bg-primary/10"
                            border="border-primary/10"
                        />
                    </div>
                </div>
            </div>

            {/* =====================================================
         GAME GRID
      ===================================================== */}
            {!activeGame ? (
                <div
                    className="
                        grid gap-3
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-3
                    "
                >
                    <GameCard title="Memory Matrix" desc="Neural Link" icon={<Brain size={28} />} onClick={() => user ? setActiveGame("memory") : navigate('/login')} color="primary" />
                    <GameCard title="Syntax Sprint" desc="Handshake" icon={<Hash size={28} />} onClick={() => user ? setActiveGame("typing") : navigate('/login')} color="emerald" />
                    <GameCard title="Stack Escape" desc="Recursion" icon={<Ghost size={28} />} onClick={() => user ? setActiveGame("escape") : navigate('/login')} color="cyan" />
                    <GameCard title="Bug Hunter" desc="Debug" icon={<Bug size={28} />} onClick={() => user ? setActiveGame("hunter") : navigate('/login')} color="lime" />
                </div>
            ) : (
                /* =====================================================
                   ACTIVE GAME VIEW
                ===================================================== */
                <div className="min-h-[75vh] flex flex-col animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={() => setActiveGame(null)}
                            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-all"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back_To_System_Arcade
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col transition-all duration-500">
                        {activeGame === "memory" && <MemoryGame dispatch={dispatch} />}
                        {activeGame === "typing" && <TypingGame dispatch={dispatch} />}
                        {activeGame === "escape" && <StackOverflowEscape dispatch={dispatch} />}
                        {activeGame === "hunter" && <BugHunter dispatch={dispatch} />}
                    </div>
                </div>
            )}
        </div>
    );
};

/* =====================================================
   Reusable Components
===================================================== */

const StatBox = ({ icon, label, value, color, bg, border }) => (
    <div
        className={`
            ${bg} ${border} border rounded-[1.5rem] p-4 text-center
            flex flex-col items-center justify-center transition-all hover:scale-[1.02]
            group/stat relative overflow-hidden
        `}
    >
        <div className={`absolute -bottom-2 -right-2 opacity-5 ${color} scale-[2]`}>{icon}</div>
        <div className={`${color} mb-1 transition-transform group-hover/stat:scale-110 duration-500`}>{icon}</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{label}</p>
        <p className="text-2xl font-black font-mono tracking-tighter">{value}</p>
    </div>
);

const GameCard = ({ title, desc, icon, onClick, color = "primary" }) => {
    const colorClasses = {
        primary: "group-hover:border-primary/50 group-hover:shadow-primary/20",
        emerald: "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20",
        pink: "group-hover:border-pink-500/50 group-hover:shadow-pink-500/20",
        violet: "group-hover:border-violet-500/50 group-hover:shadow-violet-500/20",
        cyan: "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20",
        lime: "group-hover:border-lime-500/50 group-hover:shadow-lime-500/20",
    }[color];

    const iconColors = {
        primary: "text-primary",
        emerald: "text-emerald-500",
        pink: "text-pink-500",
        violet: "text-violet-500",
        cyan: "text-cyan-500",
        lime: "text-lime-500",
    }[color];

    const glowColors = {
        primary: "bg-primary/20",
        emerald: "bg-emerald-500/20",
        pink: "bg-pink-500/20",
        violet: "bg-violet-500/20",
        cyan: "bg-cyan-500/20",
        lime: "bg-lime-500/20",
    }[color];

    const techLexicon = {
        "Memory Matrix": "Pattern_Recognition",
        "Syntax Sprint": "Elite_Typing_Test",
        "Hex Hunter": "UI_Color_Accuracy",
        "Logic Loop": "Defense_Simulation",
        "Stack Escape": "Algorithm_Navigation",
        "Bug Hunter": "Full_System_Audit"
    };

    return (
        <button
            onClick={onClick}
            className={`
                group relative bg-card/50 dark:bg-card/60 backdrop-blur-xl border border-border dark:border-white/5 rounded-[1.2rem]
                p-8 text-left transition-all duration-500
                hover:-translate-y-2 active:scale-[0.98]
                flex flex-col justify-between overflow-hidden min-h-[220px] shadow-sm hover:shadow-2xl hover:shadow-primary/5
                ${colorClasses}
            `}
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.05] transition-opacity duration-700"
                style={{ backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`, backgroundSize: '20px 20px' }} />

            {/* Interactive Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] transition-all duration-700 group-hover:scale-150 opacity-[0.08] dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 ${glowColors}`} />

            <div className="relative z-10 flex justify-between items-start">
                <div className={`p-3.5 bg-background/50 dark:bg-white/5 rounded-2xl border border-border dark:border-white/5 shadow-sm transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 ${iconColors}`}>
                    {icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 dark:text-muted-foreground/60">SIGNAL_LINK</span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? iconColors + ' opacity-90' : 'bg-muted dark:bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-4">
                <div>
                    <h3 className="text-xl font-black tracking-tight leading-none mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${iconColors}`} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground">{techLexicon[title] || desc}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border dark:border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60">CORE_POWER</span>
                        <span className="text-[10px] font-mono font-bold text-foreground opacity-90">{(Math.random() * 80 + 20).toFixed(0)}% OPTIMIZED</span>
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ${iconColors}`}>
                        START_SESSION <ArrowRight size={12} strokeWidth={3} />
                    </div>
                </div>
            </div>
        </button>
    );
};

export default Arcade;
