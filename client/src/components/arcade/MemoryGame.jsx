import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { FileCode, Database, Cpu, Globe, Server, Terminal, Layers, Wifi, Brain, Timer, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MemoryGame = ({ dispatch }) => {
    // Premium Tech Icons
    const ICON_MAP = {
        code: <FileCode size={24} />,
        db: <Database size={24} />,
        cpu: <Cpu size={24} />,
        web: <Globe size={24} />,
        server: <Server size={24} />,
        term: <Terminal size={24} />,
        stack: <Layers size={24} />,
        net: <Wifi size={24} />
    };
    const ICONS = Object.keys(ICON_MAP);

    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [time, setTime] = useState(0);

    const initializeGame = () => {
        const doubled = [...ICONS, ...ICONS];
        const shuffled = doubled.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setTime(0);
        setIsWon(false);
    };

    useEffect(() => {
        initializeGame();
    }, []);

    useEffect(() => {
        let interval;
        if (!isWon) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isWon]);

    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;
            if (cards[first] === cards[second]) {
                const newSolved = [...solved, first, second];
                setSolved(newSolved);
                setFlipped([]);

                if (newSolved.length === cards.length) {
                    const bonus = Math.max(10, 50 - moves);
                    dispatch(updateArcadeStats({ points: bonus, gameId: 'memory' }));
                    toast.success(`Matrix Cleared! +${bonus} XP`);
                    setIsWon(true);

                    // Auto-reset after animation
                    setTimeout(() => {
                        initializeGame();
                    }, 3000);
                }
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
            setMoves(m => m + 1);
        }
    }, [flipped]);

    const handleCardClick = (index) => {
        if (flipped.length < 2 && !flipped.includes(index) && !solved.includes(index) && !isWon) {
            setFlipped([...flipped, index]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4 flex flex-col items-center animate-in fade-in duration-700">
            {/* Mission Brief */}
            <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in slide-in-from-top-4 shadow-sm text-center">
                <h4 className="text-[12px] font-black text-emerald-500 mb-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Brain size={16} /> Neural Link Re-Sync
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium opacity-80">
                    Stabilize technology nodes. Efficiency yields higher XP.
                </p>
            </div>

            {/* Stats */}
            <div className="w-full flex justify-between items-center bg-card border border-border/50 p-3 rounded-xl shadow-sm">
                <div className="flex flex-col items-start min-w-[70px]">
                    <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">RUNTIME</span>
                    <span className="text-lg font-black text-foreground tabular-nums">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex flex-col items-end min-w-[70px]">
                    <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">CYCLES</span>
                    <span className="text-lg font-black text-foreground">{moves}</span>
                </div>
            </div>

            {/* Grid Container */}
            <div className={`relative bg-slate-950 p-4 sm:p-6 rounded-[2rem] border border-white/5 shadow-2xl transition-all duration-500 w-full flex justify-center ${isWon ? 'opacity-20 blur-xl scale-95' : ''}`}>
                <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-[400px]">
                    {cards.map((iconKey, index) => (
                        <div
                            key={index}
                            onClick={() => handleCardClick(index)}
                            className={`aspect-square cursor-pointer rounded-xl flex items-center justify-center transition-all duration-500 transform border-2 ${flipped.includes(index) || solved.includes(index)
                                ? 'bg-primary/10 rotate-0 border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.2)] text-primary'
                                : 'bg-white/[0.03] rotate-180 hover:bg-white/[0.08] border-white/5 text-transparent'
                                }`}
                        >
                            <div className={`transition-all duration-300 transform ${flipped.includes(index) || solved.includes(index) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                {ICON_MAP[iconKey]}
                            </div>
                        </div>
                    ))}
                </div>

                {isWon && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-[2rem] animate-in fade-in duration-500">
                        <div className="text-center p-6">
                            <Trophy size={60} className="text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-2">Matrix Cleared</h2>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-6">Neural Link Stabilized</p>
                            <button onClick={initializeGame} className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg">
                                CONTINUE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={initializeGame}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95"
                    disabled={isWon}
                >
                    FORCE_RESET
                </button>
            </div>
        </div>

    );
};

export default MemoryGame;
