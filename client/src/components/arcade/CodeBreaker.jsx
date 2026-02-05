import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Zap, Timer, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CodeBreaker = ({ dispatch }) => {
    const ICONS = ['⚛️', '🐍', '☕', '🚀', '💾', '🐳']; // 6 Options
    const ATTEMPTS = 10;
    const CODE_LENGTH = 4;

    const [secretCode, setSecretCode] = useState([]);
    const [guesses, setGuesses] = useState([]); // Array of { code: [], feedback: { correct, partial } }
    const [currentGuess, setCurrentGuess] = useState([]);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [time, setTime] = useState(0);

    // Initialize
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const code = [];
        // No duplicates for "Standard" difficulty, effectively 6P4 permutations
        // To make it slightly easier/standard.
        const pool = [...ICONS];
        for (let i = 0; i < CODE_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            code.push(pool[randomIndex]);
            pool.splice(randomIndex, 1); // remove to ensure unique
        }
        setSecretCode(code);
        setGuesses([]);
        setCurrentGuess([]);
        setGameState('playing');
        setTime(0);
    };

    // Timer
    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const handleIconClick = (icon) => {
        if (gameState !== 'playing') return;
        if (currentGuess.length < CODE_LENGTH) {
            if (!currentGuess.includes(icon)) { // Unique constraint enforcement for user too
                setCurrentGuess([...currentGuess, icon]);
            } else {
                toast.error('Unique icons only!');
            }
        }
    };

    const handleBackspace = () => {
        setCurrentGuess(currentGuess.slice(0, -1));
    };

    const submitGuess = () => {
        if (currentGuess.length !== CODE_LENGTH) return;

        // Calculate Feedback
        let correct = 0;
        let partial = 0;

        // Since we enforce unique icons, logic is simpler
        currentGuess.forEach((icon, index) => {
            if (icon === secretCode[index]) {
                correct++;
            } else if (secretCode.includes(icon)) {
                partial++;
            }
        });

        const newHistory = [...guesses, { code: currentGuess, feedback: { correct, partial } }];
        setGuesses(newHistory);
        setCurrentGuess([]);

        // Win/Loss
        if (correct === CODE_LENGTH) {
            setGameState('won');
            const points = Math.max(10, 100 - (guesses.length * 10)); // Speed/Efficiency bonus
            dispatch(updateArcadeStats(points));
            toast.success(`Access Granted! +${points} XP`);
        } else if (newHistory.length >= ATTEMPTS) {
            setGameState('lost');
            toast.error('System Locked. Access Denied.');
        }
    };

    return (
        <div className="max-w-[500px] mx-auto">
            {/* Mission Brief */}
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-[8px] mb-8 animate-in slide-in-from-top-4 text-center">
                <h4 className="text-[14px] font-bold text-amber-500 mb-2 flex items-center justify-center gap-2">
                    <Zap size={16} /> Mission Brief: Decrypt Token
                </h4>
                <p className="text-[12px] text-muted-foreground">
                    Crack the 4-icon security sequence. <br />
                    <span className="text-foreground font-bold">Rule:</span> Green = Correct Slot. Yellow = Wrong Slot. Unique icons only.
                </p>
            </div>

            <div className="flex justify-between items-center mb-6 px-4">
                <span className="font-bold text-muted-foreground text-[12px] uppercase tracking-wider">Attempt {guesses.length + 1}/{ATTEMPTS}</span>
                <span className="flex items-center gap-2 text-primary font-mono font-bold"><Timer size={14} /> {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
            </div>

            {/* Game Board */}
            <div className="bg-white dark:bg-card border border-border rounded-[12px] p-6 mb-8 flex flex-col gap-3 min-h-[400px] shadow-xl dark:shadow-2xl transition-all duration-500">
                {/* History */}
                <div className="flex-1 space-y-2.5 flex flex-col justify-end">
                    {guesses.map((turn, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-muted/30 p-2.5 rounded-[8px] animate-in fade-in slide-in-from-bottom-2 border border-border/50">
                            <div className="flex gap-2">
                                {turn.code.map((icon, idx) => (
                                    <div key={idx} className="w-9 h-9 flex items-center justify-center text-[18px] bg-white dark:bg-background border border-border rounded shadow-sm scale-in">{icon}</div>
                                ))}
                            </div>
                            <div className="flex gap-1.5 px-2">
                                {[...Array(turn.feedback.correct)].map((_, j) => <div key={`c-${j}`} className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />)}
                                {[...Array(turn.feedback.partial)].map((_, j) => <div key={`p-${j}`} className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />)}
                                {[...Array(4 - turn.feedback.correct - turn.feedback.partial)].map((_, j) => <div key={`m-${j}`} className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-muted border border-border" />)}
                            </div>
                        </div>
                    ))}
                </div>      {/* Empty Slots Filler can go here if needed to show simpler fixed grid */}

                <div className="border-t border-border pt-6 mt-4">
                    {/* Current Guess Input Display */}
                    <div className="flex justify-center gap-4 mb-8">
                        {[...Array(CODE_LENGTH)].map((_, i) => (
                            <div key={i} className={`w-14 h-14 flex items-center justify-center text-[28px] border-2 rounded-xl transition-all duration-300
                                ${currentGuess[i] ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'border-dashed border-border bg-slate-50 dark:bg-muted/20'}
                             `}>
                                {currentGuess[i]}
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    {gameState === 'playing' ? (
                        <>
                            <div className="flex justify-center gap-3 mb-6">
                                {ICONS.map((icon, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleIconClick(icon)}
                                        disabled={currentGuess.includes(icon)}
                                        className="w-10 h-10 flex items-center justify-center text-[20px] bg-secondary hover:bg-secondary/80 border border-border rounded-[8px] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleBackspace} className="flex-1 py-3 rounded-[8px] bg-muted text-muted-foreground hover:bg-muted/80 font-bold text-[13px]">Backspace</button>
                                <button
                                    onClick={submitGuess}
                                    disabled={currentGuess.length !== CODE_LENGTH}
                                    className="flex-[2] py-3 rounded-[8px] so-btn so-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Decrypt Signal
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            {gameState === 'won' ? (
                                <div className="mb-4 text-emerald-500 font-bold flex flex-col items-center animate-in zoom-in">
                                    <Trophy size={48} className="mb-2" />
                                    <span>ACCESS GRANTED</span>
                                </div>
                            ) : (
                                <div className="mb-4 text-rose-500 font-bold flex flex-col items-center animate-in zoom-in">
                                    <div className="flex gap-2 mb-2 p-2 bg-slate-950 rounded border border-border">{secretCode.map((icon, i) => <span key={i}>{icon}</span>)}</div>
                                    <span>SYSTEM LOCKDOWN</span>
                                </div>
                            )}
                            <button onClick={startNewGame} className="so-btn so-btn-primary w-full py-3">Reboot System</button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CodeBreaker;
