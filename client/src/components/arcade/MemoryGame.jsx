import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import {
    Ghost,
    Zap,
    Fingerprint,
    Bug,
    Puzzle,
    Radio,
    Rocket,
    Gamepad2,
    Brain,
    Trophy,
    Timer,
    Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MemoryGame = ({ dispatch }) => {
    // Interesting / Cyberpunk Icons
    const ICON_MAP = {
        ghost: <Ghost size={24} />,
        energy: <Zap size={24} />,
        secure: <Fingerprint size={24} />,
        bug: <Bug size={24} />,
        logic: <Puzzle size={24} />,
        signal: <Radio size={24} />,
        deploy: <Rocket size={24} />,
        game: <Gamepad2 size={24} />
    };
    const ICONS = Object.keys(ICON_MAP);

    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [gameState, setGameState] = useState('idle'); // idle, playing, won
    const [history, setHistory] = useState([]);
    const [leaders, setLeaders] = useState([]);

    const initializeGame = () => {
        const doubled = [...ICONS, ...ICONS];
        const shuffled = doubled.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setSolved([]);
        setFlipped([]);
        setMoves(0);
        setTime(0);
        setGameState('idle');
    };

    useEffect(() => {
        initializeGame();

        // Fetch global leaders (minimal, no loading state)
        fetch('/api/v1/users/arcade/leaders/memory')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLeaders(data.data);
                }
            })
            .catch(() => { }); // Silent fail
    }, []);

    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'won') return;

        if (flipped.length === 2) {
            const [first, second] = flipped;
            if (cards[first] === cards[second]) {
                const newSolved = [...solved, first, second];
                setSolved(newSolved);
                setFlipped([]);

                if (newSolved.length === cards.length) {
                    const bonus = Math.max(10, 60 - moves);
                    const finalTime = time;

                    dispatch(updateArcadeStats({ points: bonus, gameId: 'memory' }));
                    toast.success(`System Breached! +${bonus} XP`);
                    setGameState('won');

                    // Update History
                    setHistory(prev => {
                        const newEntry = { moves, time: finalTime, score: bonus, date: new Date() };
                        return [newEntry, ...prev].slice(0, 5);
                    });
                }
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
            setMoves(m => m + 1);
        }
    }, [flipped]);

    const handleCardClick = (index) => {
        if (gameState === 'won') return;

        // Start timer on first move
        if (gameState === 'idle') {
            setGameState('playing');
        }

        // Prevent clicking already flipped or solved cards
        if (flipped.length < 2 && !flipped.includes(index) && !solved.includes(index)) {
            setFlipped([...flipped, index]);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 px-4 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Game Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mission Brief */}
                    <div className={`w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in slide-in-from-top-4 shadow-sm text-center transition-all duration-300 ${gameState === 'idle' ? 'ring-2 ring-emerald-500/40 bg-emerald-500/10' : ''}`}>
                        <h4 className="text-[12px] font-black text-emerald-500 mb-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                            <Brain size={16} /> Neural Link Re-Sync
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium opacity-80">
                            {gameState === 'idle' ? 'CLICK ANY NODE TO START SEQUENCE' : 'Stabilize technology nodes. Efficiency yields higher XP.'}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="w-full flex justify-between items-center bg-card border border-border p-3 rounded-xl shadow-sm">
                        <div className="flex flex-col items-start min-w-[70px]">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">RUNTIME</span>
                            <span className={`text-lg font-black tabular-nums transition-colors duration-300 ${gameState === 'playing' ? 'text-emerald-500' : 'text-foreground'}`}>
                                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                        <div className="flex flex-col items-end min-w-[70px]">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">STEPS</span>
                            <span className="text-lg font-black text-foreground">{moves}</span>
                        </div>
                    </div>

                    {/* Grid Container */}
                    <div className="relative bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-[2rem] border border-border dark:border-white/5 shadow-xl dark:shadow-2xl transition-all duration-500 w-full flex justify-center">
                        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-[400px]">
                            {cards.map((iconKey, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleCardClick(index)}
                                    className={`aspect-square cursor-pointer rounded-xl flex items-center justify-center transition-all duration-500 transform border-2 relative ${flipped.includes(index) || solved.includes(index)
                                        ? 'bg-primary/5 dark:bg-primary/10 rotate-0 border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.1)] dark:shadow-[0_0_15px_rgba(var(--primary),0.2)] text-primary'
                                        : 'bg-slate-50 dark:bg-white/[0.03] rotate-180 hover:bg-slate-100 dark:hover:bg-white/[0.08] border-border dark:border-white/5 text-transparent'
                                        } ${gameState === 'idle' ? 'hover:scale-[1.02] hover:border-emerald-500/50' : ''}`}
                                >
                                    <div className={`transition-all duration-300 transform ${flipped.includes(index) || solved.includes(index) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                        {ICON_MAP[iconKey]}
                                    </div>

                                    {/* Start Hint Overlay (Only on Idle) */}
                                    {gameState === 'idle' && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Play size={20} className="text-emerald-500 fill-emerald-500/20 rotate-180" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {gameState === 'won' && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-sm rounded-[2rem] animate-in fade-in duration-300">
                                <div className="bg-card border border-border rounded-xl text-center p-8 w-full max-w-sm space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                                    {/* Simple Trophy */}
                                    <Trophy size={48} className="text-yellow-500 mx-auto" />

                                    {/* Title */}
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">Game Complete!</h2>
                                        <p className="text-sm text-muted-foreground">Well done</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-secondary/50 p-3 rounded-lg border border-border">
                                            <div className="text-xs text-muted-foreground mb-1">Steps</div>
                                            <div className="text-lg font-bold text-foreground">{moves}</div>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded-lg border border-border">
                                            <div className="text-xs text-muted-foreground mb-1">Time</div>
                                            <div className="text-lg font-bold text-foreground tabular-nums">
                                                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={initializeGame}
                                            className="w-full px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Play Again
                                        </button>
                                        <button
                                            onClick={() => setGameState('idle')}
                                            className="w-full px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            View Board
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={initializeGame}
                            className="px-6 py-2.5 bg-secondary hover:bg-accent border border-border dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 text-foreground"
                            disabled={gameState !== 'playing'}
                        >
                            RESET_GRID
                        </button>
                    </div>
                </div>

                {/* Match History Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                            <Timer size={16} className="text-primary" />
                            <h5 className="text-[11px] font-black text-foreground uppercase tracking-widest">
                                Match History
                            </h5>
                        </div>

                        {history.length > 0 ? (
                            <div className="space-y-2">
                                {history.map((entry, i) => (
                                    <div
                                        key={i}
                                        className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2 hover:bg-secondary transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                Match #{history.length - i}
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-500">
                                                +{entry.score} XP
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Steps</span>
                                                <span className="font-black text-foreground">{entry.moves}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Time</span>
                                                <span className="font-black text-foreground tabular-nums">
                                                    {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-3">
                                <Brain size={40} className="mx-auto text-muted-foreground opacity-20" />
                                <p className="text-[11px] text-muted-foreground font-medium italic">
                                    No matches played yet
                                </p>
                                <p className="text-[9px] text-muted-foreground/60 font-medium">
                                    Complete a game to see your history
                                </p>
                            </div>
                        )}

                        {history.length > 0 && (
                            <div className="pt-3 border-t border-border space-y-2">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-muted-foreground uppercase tracking-wider">Total Matches</span>
                                    <span className="font-black text-foreground">{history.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-muted-foreground uppercase tracking-wider">Best Steps</span>
                                    <span className="font-black text-primary">{Math.min(...history.map(h => h.moves))}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-muted-foreground uppercase tracking-wider">Best Time</span>
                                    <span className="font-black text-emerald-500 tabular-nums">
                                        {(() => {
                                            const bestTime = Math.min(...history.map(h => h.time));
                                            return `${Math.floor(bestTime / 60)}:${(bestTime % 60).toString().padStart(2, '0')}`;
                                        })()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Global Leaders - Subtle */}
                        {leaders.length > 0 && (
                            <div className="pt-3 border-t border-border/50">
                                <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                                    Top Players
                                </div>
                                <div className="space-y-1.5">
                                    {leaders.map((leader, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px]">
                                            <span className="text-muted-foreground/50 font-mono">{i + 1}.</span>
                                            <span className="text-foreground/70 font-medium truncate flex-1">
                                                {leader.username}
                                            </span>
                                            <span className="text-primary/70 font-mono text-[9px]">
                                                {leader.points} XP
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemoryGame;
