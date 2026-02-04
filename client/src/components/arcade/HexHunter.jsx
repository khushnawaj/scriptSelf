import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Trophy, Hash, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HexHunter = ({ dispatch }) => {
    const [targetColor, setTargetColor] = useState('');
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [gameState, setGameState] = useState('playing'); // playing, gameOver
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState(null); // { idx: number, type: 'correct'|'wrong' }

    useEffect(() => {
        generateRound();
    }, []);

    const generateRandomHex = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const generateRound = () => {
        const correct = generateRandomHex();
        // Generate similar colors for higher difficulty? For now random.
        const wrong1 = generateRandomHex();
        const wrong2 = generateRandomHex();
        setTargetColor(correct);
        setOptions([correct, wrong1, wrong2].sort(() => Math.random() - 0.5));
        setFeedback(null);
    };

    const handleGuess = (hex, idx) => {
        if (feedback) return; // Block clicks during feedback

        if (hex === targetColor) {
            setFeedback({ idx, type: 'correct' });

            // Score Calculation
            const streakBonus = Math.min(streak * 5, 25);
            const points = 15 + streakBonus;

            setTimeout(() => {
                setScore(s => s + points);
                setStreak(s => s + 1);
                dispatch(updateArcadeStats({ points, gameId: 'hex' }));

                if (round >= 10) {
                    setGameState('gameOver');
                    toast.success(`Masterful! Final Score: ${score + points}`);
                } else {
                    setRound(r => r + 1);
                    generateRound();
                }
            }, 600); // Wait for animation
        } else {
            setFeedback({ idx, type: 'wrong' });
            setStreak(0);
            toast.error('Miss! Streak Reset.');

            setTimeout(() => {
                if (round >= 10) {
                    setGameState('gameOver');
                } else {
                    setRound(r => r + 1);
                    generateRound();
                }
            }, 600);
        }
    };

    const restartGame = () => {
        setScore(0);
        setRound(1);
        setStreak(0);
        setGameState('playing');
        generateRound();
    };

    if (gameState === 'gameOver') {
        return (
            <div className="max-w-[340px] mx-auto text-center p-6 glass-frost rounded-2xl animate-in zoom-in duration-300 border border-pink-500/20">
                <Trophy size={40} className="mx-auto text-pink-500 mb-3 drop-shadow-[0_0_12px_rgba(236,72,153,0.4)]" />
                <h2 className="text-[20px] font-black tracking-tighter mb-1 uppercase">Calibration Finalized</h2>
                <p className="text-[11px] text-muted-foreground mb-4 font-bold opacity-60">Neural Sensors: Stable</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-background/40 p-2.5 rounded-xl border border-white/5">
                        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Efficiency</div>
                        <div className="font-black text-lg tabular-nums">{score}</div>
                    </div>
                    <div className="bg-background/40 p-2.5 rounded-xl border border-white/5">
                        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Uptime</div>
                        <div className="font-black text-lg">10/10</div>
                    </div>
                </div>
                <button onClick={restartGame} className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg transition-all active:scale-95">Recalibrate_Sensors</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4 flex flex-col items-center animate-in fade-in duration-700">
            {/* Mission Brief */}
            <div className="w-full bg-pink-500/5 border border-pink-500/20 p-4 rounded-xl animate-in slide-in-from-top-4 shadow-sm text-center">
                <h4 className="text-[11px] font-black text-pink-500 mb-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Hash size={14} /> Color_Decompiler
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium opacity-80">
                    Identify raw hex signals. Streak bonus active.
                </p>
            </div>

            <div className="w-full flex justify-between items-center bg-card border border-border/50 p-3 rounded-xl shadow-sm">
                <span className="font-black text-muted-foreground text-[10px] uppercase tracking-widest opacity-60">CYCLE {round}_10</span>
                <span className="font-black text-foreground text-[14px] tracking-tight">{score} XP</span>
                <div className="flex items-center gap-1.5 min-w-[40px] justify-end">
                    <Flame size={12} className={streak > 1 ? "fill-orange-500 text-orange-500 animate-pulse" : "text-slate-800 opacity-20"} />
                    <span className={`font-mono text-[12px] font-black ${streak > 1 ? "text-orange-500" : "text-slate-800 opacity-20"}`}>x{streak}</span>
                </div>
            </div>

            <div className="relative bg-slate-950 p-6 rounded-[2rem] border border-white/5 shadow-2xl transition-all duration-500 w-full flex flex-col items-center">
                {/* Target Color Blob */}
                <div className="relative group mb-8">
                    <div
                        className="w-40 h-40 mx-auto rounded-full shadow-2xl border-[6px] border-background transition-all duration-500 transform group-hover:scale-105"
                        style={{
                            backgroundColor: targetColor,
                            boxShadow: `0 0 40px ${targetColor}40`
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 gap-2.5 w-full max-w-[280px] mx-auto">
                    {options.map((hex, idx) => {
                        let btnClass = "py-3.5 bg-card/60 backdrop-blur-md border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 rounded-xl font-mono text-[16px] transition-all font-black tracking-widest relative overflow-hidden active:scale-95";

                        if (feedback?.idx === idx) {
                            if (feedback.type === 'correct') btnClass = "py-3.5 bg-emerald-500 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105 z-10";
                            if (feedback.type === 'wrong') btnClass = "py-3.5 bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-shake z-10";
                        } else if (feedback && hex === targetColor) {
                            btnClass = "py-3.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 opacity-100";
                        } else if (feedback) {
                            btnClass = "py-3.5 bg-muted/20 text-muted-foreground/30 border-transparent opacity-30 cursor-not-allowed";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleGuess(hex, idx)}
                                disabled={!!feedback}
                                className={btnClass}
                            >
                                {hex}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HexHunter;
