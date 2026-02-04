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
            <div className="max-w-[400px] mx-auto text-center p-8 glass-frost rounded-[12px] animate-in zoom-in duration-300 border border-pink-500/20">
                <Trophy size={48} className="mx-auto text-pink-500 mb-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                <h2 className="text-[24px] font-bold mb-2">Calibration Complete</h2>
                <p className="text-muted-foreground mb-6">Final Efficiency Score: {score}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-background/50 p-3 rounded-[8px]">
                        <div className="text-[10px] text-muted-foreground uppercase">Rounds</div>
                        <div className="font-bold">10/10</div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-[8px]">
                        <div className="text-[10px] text-muted-foreground uppercase">Best Streak</div>
                        <div className="font-bold text-primary">--</div>{/* Could track best streak if needed */}
                    </div>
                </div>
                <button onClick={restartGame} className="so-btn so-btn-primary w-full py-3">Recalibrate Sensors</button>
            </div>
        );
    }

    return (
        <div className="max-w-[500px] mx-auto text-center">
            {/* Mission Brief */}
            <div className="bg-pink-500/5 border border-pink-500/20 p-4 rounded-[8px] mb-8 animate-in slide-in-from-top-4">
                <h4 className="text-[14px] font-bold text-pink-500 mb-2 flex items-center justify-center gap-2">
                    <Hash size={16} /> Mission Brief: Color Decompiler
                </h4>
                <p className="text-[12px] text-muted-foreground">
                    Identify the raw hexadecimal signal for the displayed visual output. <br />
                    <span className="text-foreground font-bold">Streak Bonus:</span> Consecutive hits grant multipliers.
                </p>
            </div>

            <div className="flex justify-between items-center mb-6 px-4 bg-muted/20 p-3 rounded-full backdrop-blur-sm">
                <span className="font-bold text-muted-foreground text-[13px]">Round {round}/10</span>
                <span className="font-bold text-foreground text-[16px]">{score} XP</span>
                <div className="flex items-center gap-1">
                    <Flame size={14} className={streak > 1 ? "fill-orange-500 text-orange-500 animate-pulse" : "text-muted-foreground"} />
                    <span className={`font-mono text-[14px] ${streak > 1 ? "text-orange-500 font-bold" : "text-muted-foreground"}`}>x{streak}</span>
                </div>
            </div>

            {/* Target Color Blob */}
            <div className="relative group">
                <div
                    className="w-40 h-40 mx-auto rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] mb-10 border-[6px] border-background transition-all duration-300 transform group-hover:scale-105"
                    style={{
                        backgroundColor: targetColor,
                        boxShadow: `0 0 40px ${targetColor}40`
                    }}
                />
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-[300px] mx-auto">
                {options.map((hex, idx) => {
                    let btnClass = "py-4 bg-card border border-border hover:border-pink-500/50 hover:bg-pink-500/5 rounded-[12px] font-mono text-[18px] transition-all font-medium relative overflow-hidden";

                    if (feedback?.idx === idx) {
                        if (feedback.type === 'correct') btnClass = "py-4 bg-emerald-500 text-white border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105";
                        if (feedback.type === 'wrong') btnClass = "py-4 bg-rose-500 text-white border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-shake";
                    } else if (feedback && hex === targetColor) {
                        // Reveal correct one if user picked wrong
                        btnClass = "py-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/50 opacity-100";
                    } else if (feedback) {
                        btnClass = "py-4 bg-muted/50 text-muted-foreground border-transparent opacity-50 cursor-not-allowed";
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
    );
};

export default HexHunter;
