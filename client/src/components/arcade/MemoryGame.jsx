import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { FileCode, Database, Cpu, Globe, Server, Terminal, Layers, Wifi, Brain, Timer, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MemoryGame = ({ dispatch }) => {
    // Premium Tech Icons
    const ICON_MAP = {
        code: <FileCode size={32} />,
        db: <Database size={32} />,
        cpu: <Cpu size={32} />,
        web: <Globe size={32} />,
        server: <Server size={32} />,
        term: <Terminal size={32} />,
        stack: <Layers size={32} />,
        net: <Wifi size={32} />
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
        <div className="max-w-[600px] mx-auto relative">
            <div className="flex justify-between items-center mb-4">
                <div className="bg-secondary/50 px-3 py-1 rounded-[6px] text-[12px] font-mono text-muted-foreground flex items-center gap-2">
                    <Timer size={14} /> {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                </div>
                <div className="bg-secondary/50 px-3 py-1 rounded-[6px] text-[12px] font-mono text-muted-foreground">
                    Moves: {moves}
                </div>
            </div>

            {/* Mission Brief */}
            <div className="bg-card border border-border p-4 rounded-[8px] mb-8 text-center animate-in slide-in-from-top-4">
                <h4 className="text-[14px] font-bold text-primary mb-2 flex items-center justify-center gap-2">
                    <Brain size={16} /> Mission Brief: Neural Link
                </h4>
                <p className="text-[12px] text-muted-foreground">
                    Connect matching technology nodes to stabilize the system. <br />
                    <span className="text-foreground font-bold">Rule:</span> Reveal pairs. Fewer moves yield higher efficiency ratings (XP).
                </p>
            </div>

            {isWon && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[12px] animate-in fade-in duration-500">
                    <div className="text-center animate-bounce">
                        <Trophy size={64} className="text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        <h2 className="text-[32px] font-bold text-foreground">VICTORY!</h2>
                        <p className="text-muted-foreground">Resetting grid...</p>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-4 gap-4 mb-8 transition-all duration-700 ${isWon ? 'scale-90 opacity-50 blur-sm' : ''}`}>
                {cards.map((iconKey, index) => (
                    <div
                        key={index}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square cursor-pointer rounded-[12px] flex items-center justify-center transition-all duration-300 transform border ${flipped.includes(index) || solved.includes(index)
                            ? 'bg-primary/20 rotate-0 border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)] text-primary'
                            : 'bg-muted rotate-y-180 hover:bg-muted/80 border-border text-transparent'
                            }`}
                    >
                        <div className={`transition-opacity duration-300 ${flipped.includes(index) || solved.includes(index) ? 'opacity-100' : 'opacity-0'}`}>
                            {ICON_MAP[iconKey]}
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center">
                <button onClick={initializeGame} className="so-btn border border-border hover:bg-accent" disabled={isWon}>
                    {isWon ? 'Refreshing...' : 'Reset Grid'}
                </button>
            </div>
        </div>
    );
};

export default MemoryGame;
