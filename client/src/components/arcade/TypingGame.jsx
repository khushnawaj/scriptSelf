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
            let colorClass = 'text-muted-foreground/40';
            let bgClass = '';

            if (index < input.length) {
                if (input[index] === char) {
                    colorClass = 'text-emerald-400';
                } else {
                    colorClass = 'text-rose-500';
                    bgClass = 'bg-rose-500/20';
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
        <div className="max-w-[700px] mx-auto space-y-8 p-8 glass-frost rounded-[16px] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />

            {/* Header Stats */}
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                    <h4 className="text-[14px] font-bold text-emerald-500 flex items-center gap-2 mb-1">
                        <Zap size={16} /> Syntax Sprint
                    </h4>
                    <p className="text-[12px] text-muted-foreground">Type accurately. Speed is key.</p>
                </div>
                <div className="flex gap-4 text-sm font-mono">
                    <div className="text-center">
                        <div className="text-muted-foreground text-[10px] uppercase tracking-wider">WPM</div>
                        <div className="text-xl font-bold text-foreground">{wpm}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Completed</div>
                        <div className="text-xl font-bold text-primary">{completed}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Score</div>
                        <div className="text-xl font-bold text-amber-500">{score}</div>
                    </div>
                </div>
            </div>

            {/* Code Display */}
            <div
                className="relative bg-slate-950/80 backdrop-blur-md p-8 rounded-[12px] font-mono text-[20px] leading-relaxed shadow-inner border border-white/5 min-h-[140px] flex items-center cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                <div>{renderText()}</div>
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

            <div className="text-center text-[11px] text-muted-foreground uppercase tracking-widest animate-pulse">
                {startTime ? 'Recording Keystrokes...' : 'Start typing to begin'}
            </div>
        </div>
    );
};

export default TypingGame;
