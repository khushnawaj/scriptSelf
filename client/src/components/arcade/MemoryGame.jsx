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
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4 flex flex-col items-center animate-in fade-in duration-700">
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
            <div className={`relative bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-[2rem] border border-border dark:border-white/5 shadow-xl dark:shadow-2xl transition-all duration-500 w-full flex justify-center ${gameState === 'won' ? 'opacity-20 blur-xl scale-95' : ''}`}>
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
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-[2rem] animate-in fade-in duration-500">
                        <div className="text-center p-6 w-full max-w-sm">
                            <Trophy size={60} className="text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-bounce" />
                            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-2">Matrix Cleared</h2>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-6">Neural Link Stabilized</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-background/80 p-3 rounded-xl border border-border">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Steps</div>
                                    <div className="text-xl font-black text-foreground">{moves}</div>
                                </div>
                                <div className="bg-background/80 p-3 rounded-xl border border-border">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Time Taken</div>
                                    <div className="text-xl font-black text-foreground tabular-nums">
                                        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                            </div>

                            <button onClick={initializeGame} className="w-full px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg ring-offset-2 focus:ring-2">
                                RE-INITIALIZE
                            </button>
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

            {/* History Log */}
            {history.length > 0 && (
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border dark:border-white/5 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                    <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Timer size={12} /> Recent Extractions
                    </h5>
                    <div className="space-y-2">
                        {history.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] font-medium p-2 bg-white dark:bg-white/5 rounded-lg border border-border dark:border-white/5">
                                <span className="text-muted-foreground">Extraction #{history.length - i}</span>
                                <div className="flex items-center gap-3">
                                    <span className="tabular-nums">{entry.moves} Steps</span>
                                    <span className="tabular-nums text-muted-foreground">
                                        {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-emerald-500 font-bold">+{entry.score} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryGame;
