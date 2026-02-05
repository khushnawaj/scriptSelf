import { useState, useEffect, useRef } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TypingGame = ({ dispatch }) => {
    const snippets = [
        "const [state, setState] = useState(null);",
        "useEffect(() => { console.log('Mounted'); }, []);",
        "git commit -m 'Initial commit'",
        "npm install react-redux @reduxjs/toolkit",
        "array.reduce((acc, curr) => acc + curr, 0);",
        "const { data, error } = useSWR('/api/user', fetcher);",
        "export default function App() { return <Component />; }",
        ".map(item => <li key={item.id}>{item.name}</li>)",
        "if (process.env.NODE_ENV === 'production') build();"
    ];

    const [currentSnippet, setCurrentSnippet] = useState('');
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [completed, setCompleted] = useState(0);

    const inputRef = useRef(null);

    useEffect(() => {
        nextSnippet();
    }, []);

    useEffect(() => {
        // Focus keeper
        const handleFocus = () => inputRef.current?.focus();
        window.addEventListener('click', handleFocus);
        return () => window.removeEventListener('click', handleFocus);
    }, []);

    const nextSnippet = () => {
        setCurrentSnippet(snippets[Math.floor(Math.random() * snippets.length)]);
        setInput('');
        setStartTime(null);
        setWpm(0);
    };

    const calculateWPM = (chars, ms) => {
        if (!ms || ms < 1000) return 0;
        const minutes = ms / 60000;
        const words = chars / 5;
        return Math.round(words / minutes);
    };

    const handleChange = (e) => {
        const val = e.target.value;
        if (!startTime) setStartTime(Date.now());

        setInput(val);

        // Calculate WPM continuously
        if (startTime) {
            setWpm(calculateWPM(val.length, Date.now() - startTime));
        }

        if (val === currentSnippet) {
            const finalTime = Date.now() - startTime;
            const finalWpm = calculateWPM(val.length, finalTime);

            // Score calc: Base 10 + Speed Bonus
            const bonus = Math.max(0, finalWpm - 20); // Bonus for > 20 WPM
            const points = 10 + Math.floor(bonus / 2);

            setScore(s => s + points);
            setCompleted(c => c + 1);
            dispatch(updateArcadeStats({ points, gameId: 'typing' }));
            toast.success(`Complete! ${finalWpm} WPM (+${points} XP)`);
            nextSnippet();
        }
    };

    // Render helper for colored text
    const renderText = () => {
        return currentSnippet.split('').map((char, index) => {
            let colorClass = 'text-muted-foreground/50 dark:text-muted-foreground/40';
            let bgClass = '';

            if (index < input.length) {
                if (input[index] === char) {
                    colorClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
                } else {
                    colorClass = 'text-rose-600 dark:text-rose-500';
                    bgClass = 'bg-rose-500/10 dark:bg-rose-500/20';
                }
            }

            // Cursor
            const isCursor = index === input.length;

            return (
                <span key={index} className={`relative ${colorClass} ${bgClass} transition-colors duration-75`}>
                    {isCursor && (
                        <span className="absolute -left-[1px] -top-1 bottom-0 w-[2px] bg-emerald-500 animate-pulse h-6" />
                    )}
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4 flex flex-col items-center animate-in fade-in duration-700">
            {/* Mission Brief */}
            <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in slide-in-from-top-4 shadow-sm text-center">
                <h4 className="text-[12px] font-black text-emerald-500 mb-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Zap size={16} /> Syntax Sprint
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium opacity-80">
                    Type accurately. Speed is the only metric.
                </p>
            </div>

            {/* Stats */}
            <div className="w-full flex justify-between items-center bg-card border border-border p-3 rounded-xl shadow-sm">
                <div className="flex flex-col items-start min-w-[60px]">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">WPM</span>
                    <span className="text-lg font-black text-foreground tabular-nums">{wpm}</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">DONE</span>
                    <span className="text-lg font-black text-primary">{completed}</span>
                </div>
                <div className="flex flex-col items-end min-w-[60px]">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">XP</span>
                    <span className="text-lg font-black text-amber-500">{score}</span>
                </div>
            </div>

            {/* Code Display Area */}
            <div className="relative bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-[2rem] border border-border dark:border-white/5 shadow-xl dark:shadow-2xl transition-all duration-500 w-full flex flex-col items-center">
                <div
                    className="relative w-full bg-slate-50 dark:bg-black/40 backdrop-blur-md p-6 sm:p-10 rounded-xl font-mono text-[18px] sm:text-[22px] shadow-inner border border-border dark:border-white/5 min-h-[140px] flex items-center cursor-text transition-all overflow-hidden"
                    onClick={() => inputRef.current?.focus()}
                >
                    <div className="w-full break-all whitespace-pre-wrap leading-relaxed">{renderText()}</div>
                </div>

                {/* Hidden Input */}
                <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={input}
                    onChange={handleChange}
                    className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
                    autoComplete="off"
                />

                <div className="mt-4 text-[8px] text-muted-foreground uppercase tracking-[0.4em] font-black animate-pulse opacity-30 text-center">
                    {startTime ? 'SYSTEM_RECORDING_SEQUENCE' : 'Awaiting input to initiate handshake'}
                </div>
            </div>
        </div>
    );
};

export default TypingGame;
