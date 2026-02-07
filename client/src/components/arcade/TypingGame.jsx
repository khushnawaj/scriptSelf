import { useState, useEffect, useRef } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Terminal, Code2, Database, Globe, Hash, GitBranch, Cpu, ListRestart, Zap, ChevronRight, Volume2, VolumeX, Eye, Binary } from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { fetchGitHubSnippet, fetchTechTrivia } from '../../services/snippetService';

const CATEGORIES = [
    { id: 'js', name: 'JavaScript', icon: <Code2 size={13} /> },
    { id: 'react', name: 'React JS', icon: <Cpu size={13} /> },
    { id: 'nodejs', name: 'Node.js', icon: <Binary size={13} /> },
    { id: 'python', name: 'Python', icon: <Hash size={13} /> },
    { id: 'html', name: 'HTML', icon: <Globe size={13} /> },
    { id: 'css', name: 'CSS', icon: <Hash size={13} /> },
    { id: 'sql', name: 'SQL', icon: <Database size={13} /> },
    { id: 'git', name: 'Git', icon: <GitBranch size={13} /> },
    { id: 'docker', name: 'Docker', icon: <Terminal size={13} /> },
    { id: 'trivia', name: 'Tech Trivia', icon: <ListRestart size={13} /> }
];

const TypingGame = ({ dispatch }) => {
    const [currentCategory, setCurrentCategory] = useState('js');
    const [currentSnippet, setCurrentSnippet] = useState('INITIALIZING_STREAM...');
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [loading, setLoading] = useState(false);
    const [triviaQuestion, setTriviaQuestion] = useState(null);
    const [gameState, setGameState] = useState('SCANNING'); // SCANNING, BLIND, REVEALED
    const [shake, setShake] = useState(false);
    const [seenSnippets, setSeenSnippets] = useState(new Set());

    // NEW GAMIFICATION STATES
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [level, setLevel] = useState(1);

    const inputRef = useRef(null);

    // Sound and UI State
    const [muted, setMuted] = useState(false);

    // Sound Effects Refs (using browser Audio API)
    const audioContextRef = useRef(null);

    // Initialize Audio Context on interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
        };
        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    // Sound Logic wrapper
    const playSound = (type) => {
        if (muted || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'type':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'success':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554, now + 0.1); // C#5
                osc.frequency.setValueAtTime(659, now + 0.2); // E5
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'levelUp':
                // Arpeggio
                [440, 554, 659, 880, 1108].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'square';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.05, now + i * 0.08);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
                    o.start(now + i * 0.08);
                    o.stop(now + i * 0.08 + 0.2);
                });
                break;
        }
    };

    useEffect(() => {
        setSeenSnippets(new Set());
        nextSnippet();
    }, [currentCategory]);

    useEffect(() => {
        const handleFocus = () => {
            if (gameState !== 'SCANNING') inputRef.current?.focus();
        };
        window.addEventListener('click', handleFocus);
        return () => window.removeEventListener('click', handleFocus);
    }, [gameState]);

    // Scan Timer Logic - Optimized (Single Timeout + CSS Animation)
    useEffect(() => {
        let timeout;
        if (gameState === 'SCANNING') {
            timeout = setTimeout(() => {
                setGameState('BLIND');
                if (inputRef.current) inputRef.current.focus();
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [gameState]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && gameState === 'SCANNING') {
                handleStartBlind();
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                nextSnippet();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const handleStartBlind = () => {
        setGameState('BLIND');
        if (inputRef.current) inputRef.current.focus();
    };

    // Level Calculation
    useEffect(() => {
        const newLevel = Math.floor(score / 500) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
            playSound('levelUp');
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-card border-2 border-primary shadow-lg rounded-lg pointer-events-none flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <Zap className="h-10 w-10 text-primary animate-pulse" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-foreground">
                                    SYSTEM UPGRADE!
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Clearance Level {newLevel} Granted.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    }, [score]);

    const nextSnippet = async () => {
        setLoading(true);
        setInput('');
        setStartTime(null);
        setWpm(0);
        setTriviaQuestion(null);
        setGameState('SCANNING');

        const cleanup = (str) => {
            if (!str) return '';
            return str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').trim();
        };

        try {
            let attempts = 0;
            let data = null;
            let isDuplicate = true;

            while (isDuplicate && attempts < 3) {
                if (currentCategory === 'trivia') {
                    data = await fetchTechTrivia();
                    if (data) isDuplicate = seenSnippets.has(data.question);
                } else {
                    data = await fetchGitHubSnippet(currentCategory);
                    if (data && typeof data === 'object') isDuplicate = seenSnippets.has(data.code);
                    else if (data) isDuplicate = seenSnippets.has(data);
                }
                attempts++;
            }

            if (currentCategory === 'trivia') {
                if (data) {
                    setTriviaQuestion(cleanup(data.question));
                    setCurrentSnippet(cleanup(data.answer));
                    setSeenSnippets(prev => new Set(prev).add(data.question));
                    setGameState('REVEALED'); // Trivia is always revealed
                } else {
                    setCurrentSnippet("API Error. Skip to continue.");
                    setGameState('REVEALED');
                }
            } else {
                if (data && typeof data === 'object') {
                    setTriviaQuestion(cleanup(data.question));
                    setCurrentSnippet(cleanup(data.code));
                    setSeenSnippets(prev => new Set(prev).add(data.code));
                } else {
                    setTriviaQuestion(`Execute ${CATEGORIES.find(c => c.id === currentCategory)?.name} Pattern:`);
                    setCurrentSnippet(cleanup(data));
                    setSeenSnippets(prev => new Set(prev).add(data));
                }
            }
        } catch (error) {
            console.error(error);
            setCurrentSnippet("SYSTEM_FAULT: RETRY_REQUEST");
            setGameState('REVEALED');
        } finally {
            setLoading(false);
        }
    };

    const calculateWPM = (chars, ms) => {
        if (!ms || ms < 1000) return 0;
        const minutes = ms / 60000;
        const words = chars / 5;
        return Math.round(words / minutes);
    };

    const handleChange = (e) => {
        if (loading || gameState === 'SCANNING') return;
        const val = e.target.value;
        if (!startTime) setStartTime(Date.now());

        if (val.length > currentSnippet.length) return;

        // Sound Feedback
        if (val.length > input.length) {
            // Typing forward
            const char = val.slice(-1);
            const targetChar = currentSnippet[val.length - 1];
            if (char === targetChar) {
                playSound('type');
            } else {
                playSound('error');
            }
        }

        setInput(val);

        if (startTime) {
            setWpm(calculateWPM(val.length, Date.now() - startTime));
        }

        if (val === currentSnippet) {
            handleWin();
        }
    };

    const handleWin = () => {
        const finalTime = Date.now() - startTime;
        const finalWpm = calculateWPM(input.length, finalTime);

        const blindBonus = gameState === 'BLIND' ? 50 : 0;

        // Streak Logic
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);

        // Multiplier: 1x, 1.5x (streak 3), 2x (streak 5), 3x (streak 10)
        let multiplier = 1;
        if (newStreak >= 10) multiplier = 3;
        else if (newStreak >= 5) multiplier = 2;
        else if (newStreak >= 3) multiplier = 1.5;

        const basePoints = 10 + Math.floor(finalWpm / 10);
        const points = Math.floor((basePoints + blindBonus) * multiplier);

        setScore(s => s + points);
        setCompleted(c => c + 1);
        dispatch(updateArcadeStats({ points, gameId: 'typing' }));
        playSound('success');

        confetti({
            particleCount: 150 * multiplier,
            spread: 80,
            origin: { y: 0.6 },
            colors: gameState === 'BLIND' ? ['#f59e0b', '#fff'] : ['#10b981', '#fff']
        });

        toast.success(
            gameState === 'BLIND'
                ? `BLIND SOLVE! +${points} XP (Streak x${multiplier})`
                : `MATCH FOUND: ${finalWpm} WPM (+${points} XP)`
        );
        nextSnippet();
    };

    const handleSubmitBlind = () => {
        if (input === currentSnippet) {
            handleWin();
        } else {
            setShake(true);
            setStreak(0); // Reset streak on fail
            playSound('error');
            setTimeout(() => setShake(false), 500);
            toast.error("Incorrect Syntax. Streak Lost!");
            setGameState('REVEALED'); // Auto reveal on fail
        }
    };

    // Get Title based on Level
    const getLevelTitle = (lvl) => {
        if (lvl < 2) return "Script Kiddie";
        if (lvl < 5) return "Codemonkey";
        if (lvl < 10) return "Junior Dev";
        if (lvl < 20) return "Senior Eng";
        if (lvl < 50) return "10x Developer";
        return "Architect";
    };

    const renderText = () => {
        // 1. SCANNING PHASE
        if (gameState === 'SCANNING') {
            return (
                <div className="relative font-mono text-foreground/90 transition-opacity duration-300">
                    {currentSnippet}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"
                        style={{ backgroundSize: '200% 100%' }} />
                </div>
            );
        }

        // 2. BLIND PHASE (Cyberpunk Terminal Look)
        if (gameState === 'BLIND') {
            return (
                <div className="relative font-mono text-lg tracking-wide">
                    {/* Typed correct text */}
                    <span className="text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{input}</span>

                    {/* Retro Block Cursor */}
                    <span className="inline-block w-[0.6em] h-[1.1em] align-middle bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b] mx-[1px]" />

                    {/* Pending Text (Teasing Blur) */}
                    <span className="blur-[3px] opacity-30 grayscale select-none transition-all duration-500 ease-out">{currentSnippet.slice(input.length)}</span>
                </div>
            );
        }

        // 3. REVEALED
        return currentSnippet.split('').map((char, index) => {
            let colorClass = 'text-muted-foreground/20';

            if (index < input.length) {
                if (input[index] === char) {
                    colorClass = 'text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]';
                } else {
                    colorClass = 'text-rose-500 font-bold bg-rose-500/10 decoration-rose-500 underline underline-offset-4';
                }
            } else if (index === input.length) {
                // Active Character Cursor
                return (
                    <span key={index} className="relative inline-block">
                        <span className="absolute inset-0 bg-primary/20 animate-pulse" />
                        <span className="relative z-10 text-foreground border-b-2 border-primary">
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    </span>
                );
            }

            return (
                <span key={index} className={`${colorClass} transition-colors duration-100`}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            );
        });
    };


    return (
        <div className="w-full max-w-6xl mx-auto space-y-10 py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <h1 className="text-[32px] font-bold text-foreground flex items-center gap-3">
                        <span className="flex flex-col">
                            <span>Syntax Sprint</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{getLevelTitle(level)} // LVL {level}</span>
                        </span>
                        {startTime && <span className="so-tag bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse">LIVE_SESSION</span>}
                    </h1>
                    <div className="flex gap-4 p-4 bg-card border border-border rounded-[3px] shadow-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10} /> Streak</span>
                            <span className="text-[24px] font-bold text-amber-500 tabular-nums leading-none">x{streak}</span>
                        </div>
                        <div className="w-px bg-border mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Live WPM</span>
                            <span className="text-[24px] font-bold text-emerald-600 tabular-nums leading-none">{wpm}</span>
                        </div>
                        <div className="w-px bg-border mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Global XP</span>
                            <span className="text-[24px] font-bold text-primary tabular-nums leading-none">{score}</span>
                        </div>
                        <div className="w-px bg-border mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Records</span>
                            <span className="text-[24px] font-bold text-foreground tabular-nums leading-none">{completed}</span>
                        </div>
                    </div>
                </div>
                <p className="text-[15px] text-muted-foreground max-w-2xl leading-relaxed">
                    Memorize the syntax pattern during the scan phase, then execute blindly from memory.
                </p>
                {/* Level Progress Bar */}
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${(score % 500) / 5}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground px-1 flex items-center justify-between">
                            Active Paradigms
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCurrentCategory(cat.id)}
                                    className={`px-3 py-2 border rounded-[3px] text-[12px] font-bold uppercase tracking-tight transition-all flex items-center justify-between group
                                        ${currentCategory === cat.id
                                            ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                            : 'bg-secondary border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">{cat.icon} {cat.name}</span>
                                    {currentCategory === cat.id && <ChevronRight size={14} className="opacity-60" />}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Console - Cyberpunk/Arcade Container */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={`
                        relative min-h-[400px] flex flex-col items-stretch overflow-hidden rounded-xl border-2 shadow-2xl transition-all duration-500
                        ${gameState === 'SCANNING' ? 'border-blue-500/50 shadow-blue-500/20 bg-blue-950/5' : ''}
                        ${gameState === 'BLIND' ? 'border-amber-500/50 shadow-amber-500/20 bg-amber-950/5' : ''}
                        ${gameState === 'REVEALED' ? 'border-emerald-500/50 shadow-emerald-500/20 bg-emerald-950/5' : ''}
                        ${shake ? 'animate-shake border-rose-500 shadow-rose-500/50' : ''}
                    `}>

                        {/* Glassmorphism Header */}
                        <div className="absolute top-0 inset-x-0 h-12 bg-background/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-20 select-none">
                            <div className="flex gap-2 items-center">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                </div>
                                <div className="h-4 w-px bg-white/20 mx-2" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    {gameState === 'SCANNING' && <span className="text-blue-400 animate-pulse"><Database size={12} /> RECEIVING_DATA</span>}
                                    {gameState === 'BLIND' && <span className="text-amber-400 animate-pulse"><Terminal size={12} /> INPUT_REQUIRED</span>}
                                    {gameState === 'REVEALED' && <span className="text-emerald-400"><Zap size={12} /> SYSTEM_SYNCED</span>}
                                </span>
                            </div>

                            {/* Trivia / Volume Controls */}
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block text-[10px] font-medium text-muted-foreground/80 italic truncate max-w-[200px]">
                                    {triviaQuestion}
                                </div>
                                <div className="h-4 w-px bg-white/20" />
                                <button
                                    onClick={() => setMuted(!muted)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/10"
                                >
                                    {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-muted/30" />
                                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-t-primary border-r-primary animate-spin" />
                                    <Binary size={24} className="absolute inset-0 m-auto text-primary animate-pulse" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Stream...</span>
                            </div>
                        )}

                        {/* Game Area */}
                        <div
                            className="flex-1 p-8 pt-20 font-mono text-[22px] sm:text-[26px] leading-[1.8] flex items-start cursor-text select-none focus:outline-none transition-all relative overflow-y-auto custom-scrollbar"
                            onClick={() => { if (gameState !== 'SCANNING') inputRef.current?.focus() }}
                        >
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                <Code2 size={400} />
                            </div>

                            <div className="w-full break-words whitespace-pre-wrap tracking-wide z-10">
                                {renderText()}
                            </div>

                            {/* Scan Phase Overlay */}
                            {gameState === 'SCANNING' && (
                                <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-3 z-30 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="h-1 w-64 bg-secondary rounded-full overflow-hidden shadow-lg border border-white/5">
                                        <div className="h-full bg-blue-500 w-full animate-[progress_3s_linear_forwards] origin-left"
                                            style={{ animationName: 'shrink', animationDuration: '3s', animationTimingFunction: 'linear', animationFillMode: 'forwards' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleStartBlind}
                                        className="group relative px-6 py-2 bg-background/50 hover:bg-blue-500/10 border border-blue-500/30 hover:border-blue-500 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-3 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start Decryption <Zap size={12} />
                                        </span>
                                        <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">[Press Enter]</span>
                                </div>
                            )}

                            <input
                                ref={inputRef}
                                onChange={handleChange}
                                value={input}
                                autoFocus
                                className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
                                autoComplete="off"
                                disabled={loading || gameState === 'SCANNING'}
                            />
                        </div>
                    </div>

                    {/* Control Bar (Moved OUTSIDE the typing area) */}
                    <div className="flex justify-between items-center gap-4">
                        {/* Left: Status */}
                        <div className="flex-1 px-4 py-3 bg-secondary/30 border border-border rounded-lg flex items-center gap-4 shadow-sm backdrop-blur-sm">
                            <div className="text-[11px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-3">
                                <span className={`h-2 w-2 rounded-full ${gameState === 'SCANNING' ? 'bg-primary' : gameState === 'BLIND' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500'}`} />
                                {gameState === 'SCANNING' ? 'SCANNING...' : gameState === 'BLIND' ? 'BLIND_MODE' : 'SYSTEM_READY'}
                            </div>
                            <div className="h-3 w-px bg-border" />
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] opacity-60">
                                {streak > 2 ? `STREAK x${streak >= 10 ? '3' : streak >= 5 ? '2' : '1.5'}` : 'BUILD_STREAK'}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        {!loading && gameState === 'BLIND' && (
                            <div className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button
                                    onClick={() => {
                                        setGameState('REVEALED');
                                        setStreak(0);
                                        setTimeout(() => inputRef.current?.focus(), 100);
                                    }}
                                    className="px-4 py-3 bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold tracking-widest uppercase rounded-lg border border-border shadow-sm transition-all flex items-center gap-2"
                                >
                                    <Eye size={14} /> Reveal
                                </button>
                                <button
                                    onClick={handleSubmitBlind}
                                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black tracking-widest uppercase rounded-lg shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <span>Execute</span> <Zap size={14} fill="currentColor" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Skip Button moved to bottom for better flow */}
            <div className="flex justify-center">
                <button
                    onClick={nextSnippet}
                    disabled={loading || gameState === 'SCANNING'}
                    className="so-btn bg-card hover:bg-accent border border-border text-muted-foreground px-8 py-3 w-full max-w-sm flex items-center justify-center gap-3"
                >
                    <ListRestart size={16} className={`${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'CALCULATING_NEXT_NODE...' : 'SKIP / NEXT CHALLENGE'}</span>
                </button>
            </div>
        </div>
    );
};

export default TypingGame;

