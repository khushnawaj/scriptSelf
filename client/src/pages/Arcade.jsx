import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Gamepad2, Flame, Trophy, Brain, Zap, Hash, Lock, Ghost, Bug } from 'lucide-react';

// Game Components
import MemoryGame from '../components/arcade/MemoryGame';
import TypingGame from '../components/arcade/TypingGame';
import HexHunter from '../components/arcade/HexHunter';
import FirewallBreach from '../components/arcade/FirewallBreach';
import StackOverflowEscape from '../components/arcade/StackOverflowEscape';

import BugHunter from '../components/arcade/BugHunter';

const Arcade = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [activeGame, setActiveGame] = useState(null); // 'memory' | 'typing' | ...

    // Stats logic
    const globalStreak = user?.arcade?.streak || 0;
    const points = user?.arcade?.points || 0;

    // Get current streak based on active game
    const currentStreak = activeGame
        ? (user?.arcade?.games?.[activeGame]?.streak || 0)
        : globalStreak;

    const streakLabel = activeGame ? `${activeGame.charAt(0).toUpperCase() + activeGame.slice(1)} Streak` : "Daily Streak";

    // Badges Configuration
    const BADGES = [
        { days: 1, label: "Hello World", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { days: 3, label: "Script Kiddie", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { days: 7, label: "Code Ninja", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
        { days: 30, label: "Full Stack", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        { days: 60, label: "Architect", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    ];

    return (
        <div className="max-w-[1200px] mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header / Stats Bar */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-12 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-primary/20 p-6 rounded-[12px]">
                <div>
                    <h1 className="text-[32px] font-bold text-foreground flex items-center gap-3">
                        <Gamepad2 size={32} className="text-primary" /> DevArcade
                    </h1>
                    <p className="text-muted-foreground mt-1">Refine your cognitive stack. Maintain the streak.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
                    {/* Badges Logic */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 mask-gradient px-1">
                        {BADGES.map((badge, i) => {
                            const isUnlocked = currentStreak >= badge.days;
                            return (
                                <div
                                    key={i}
                                    title={isUnlocked ? `Unlocked: ${badge.label}` : `Streak ${badge.days} days to unlock`}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-full border text-[12px] font-bold whitespace-nowrap transition-all uppercase tracking-wide
                                        ${isUnlocked
                                            ? `${badge.bg} ${badge.border} ${badge.color} shadow-[0_0_15px_rgba(0,0,0,0.1)]`
                                            : "bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground/40"
                                        }
                                    `}
                                >
                                    {isUnlocked ? (
                                        <>
                                            <span>{badge.label}</span>
                                            <span className="text-[10px] opacity-70 bg-background/50 px-1.5 rounded">{badge.days}D</span>
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><Lock size={10} /> Locked</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 shrink-0">
                        <div className="flex flex-col items-center bg-background border border-border p-4 rounded-[8px] min-w-[100px]">
                            <div className="text-orange-500 font-bold text-[24px] flex items-center gap-1">
                                <Flame size={20} className="fill-orange-500" /> {currentStreak}
                            </div>
                            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{streakLabel}</span>
                        </div>
                        <div className="flex flex-col items-center bg-background border border-border p-4 rounded-[8px] min-w-[100px]">
                            <div className="text-primary font-bold text-[24px] flex items-center gap-1">
                                <Trophy size={20} /> {points}
                            </div>
                            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">XP Score</span>
                        </div>
                    </div>
                </div>
            </div>

            {!activeGame ? (
                // Game Selection Menu
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setActiveGame('memory')}
                        className="group relative h-[240px] bg-card border border-border hover:border-primary/50 rounded-[12px] p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 bg-primary/10 rounded-[8px] flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Memory Matrix</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Match tech stack icons to clear the grid. Train your visual memory.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveGame('typing')}
                        className="group relative h-[240px] bg-card border border-border hover:border-emerald-500/50 rounded-[12px] p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-[60px] group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-[8px] flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                                <Hash size={24} />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">Syntax Sprint</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Type algorithms against the clock. Boost your coding WPM.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveGame('hex')}
                        className="group relative h-[240px] bg-card border border-border hover:border-pink-500/50 rounded-[12px] p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-pink-500/5 rounded-full blur-[60px] group-hover:bg-pink-500/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-[8px] flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                                <span className="font-bold text-[18px]">#</span>
                            </div>
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground mb-1 group-hover:text-pink-500 transition-colors">Hex Hunter</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Can you identify the color from its hex code? For the frontend masters.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveGame('breach')}
                        className="group relative h-[240px] bg-card border border-border hover:border-violet-500/50 rounded-[12px] p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-violet-500/5 rounded-full blur-[60px] group-hover:bg-violet-500/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 bg-violet-500/10 rounded-[8px] flex items-center justify-center text-violet-500 mb-4 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground mb-1 group-hover:text-violet-500 transition-colors">Firewall Breach</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    System Defense: Penetrate security layers. Deflect data packets. Root access.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveGame('escape')}
                        className="group relative h-[240px] bg-card border border-border hover:border-cyan-500/50 rounded-[12px] p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-[60px] group-hover:bg-cyan-500/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-[8px] flex items-center justify-center text-cyan-500 mb-4 group-hover:scale-110 transition-transform">
                                <Ghost size={24} />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground mb-1 group-hover:text-cyan-500 transition-colors">Stack Overflow Escape</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Trapped in recursion? Solve logic puzzles to unlock doors before memory leaks.
                                </p>
                            </div>
                        </div>
                    </button>



                    <button
                        onClick={() => setActiveGame('hunter')}
                        className="group relative h-[240px] bg-card border border-border hover:border-lime-500/50 rounded-[12px] p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(132,204,22,0.2)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-lime-500/5 rounded-full blur-[60px] group-hover:bg-lime-500/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 bg-lime-500/10 rounded-[8px] flex items-center justify-center text-lime-500 mb-4 group-hover:scale-110 transition-transform">
                                <Bug size={24} />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground mb-1 group-hover:text-lime-500 transition-colors">Bug Hunter</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Errors are crawling everywhere. Squash bugs, defuse NullPointers, and survive.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            ) : (
                // Active Game Container
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setActiveGame(null)}
                        className="mb-6 text-[13px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                        ← Back to Arcade
                    </button>

                    {activeGame === 'memory' && <MemoryGame dispatch={dispatch} />}
                    {activeGame === 'typing' && <TypingGame dispatch={dispatch} />}
                    {activeGame === 'hex' && <HexHunter dispatch={dispatch} />}
                    {activeGame === 'breach' && <FirewallBreach dispatch={dispatch} />}
                    {activeGame === 'escape' && <StackOverflowEscape dispatch={dispatch} />}
                    {activeGame === 'hunter' && <BugHunter dispatch={dispatch} />}
                </div>
            )}
        </div>
    );
};

export default Arcade;
