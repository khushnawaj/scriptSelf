import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Ghost, Terminal, Trophy, Timer, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StackOverflowEscape = ({ dispatch }) => {
    // 5x5 Maze: 0=Path, 1=Wall, 2=Start, 3=Exit, 4=CodeDoor
    const LEVELS = [
        {
            grid: [
                [2, 0, 1, 0, 3],
                [1, 0, 1, 4, 1],
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0]
            ],
            start: { x: 0, y: 0 },
            doorPuzzle: {
                question: "This recursive function causes a stack overflow. Fix it.",
                code: "function sum(n) {\n  return n + sum(n - 1);\n}",
                options: [
                    "Add: if (n <= 0) return 0;",
                    "Change to: return n + sum(n + 1);",
                    "Remove sum(n-1)"
                ],
                correct: 0
            }
        },
        {
            grid: [
                [2, 0, 1, 3, 0],
                [0, 0, 4, 1, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 0, 0, 0],
                [1, 1, 1, 1, 0]
            ],
            start: { x: 0, y: 0 },
            doorPuzzle: {
                question: "Memory Leak Detected. Identify the cause.",
                code: "useEffect(() => {\n  const id = setInterval(tick, 1000);\n  // Missing something?\n}, [])",
                options: [
                    "Add dependency [tick]",
                    "Add: return () => clearInterval(id);",
                    "Change to setTimeout"
                ],
                correct: 1
            }
        }
    ];

    const [level, setLevel] = useState(0);
    const [player, setPlayer] = useState({ x: 0, y: 0 });
    const [grid, setGrid] = useState([]);
    const [showPuzzle, setShowPuzzle] = useState(false);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [memory, setMemory] = useState(0); // "Memory Usage" % (Timer)

    useEffect(() => {
        loadLevel(0);
    }, []);

    const loadLevel = (lvlIdx) => {
        if (lvlIdx >= LEVELS.length) {
            setGameState('won');
            dispatch(updateArcadeStats({ points: 200, gameId: 'escape' }));
            return;
        }
        const lvl = LEVELS[lvlIdx];
        // Deep copy grid to modify it statefully if needed
        const newGrid = lvl.grid.map(row => [...row]);
        setGrid(newGrid);
        setPlayer({ ...lvl.start });
        setLevel(lvlIdx);
        setShowPuzzle(false);
        setMemory(0);
    };

    // Timer / Memory Leak
    useEffect(() => {
        if (gameState !== 'playing' || showPuzzle) return;
        const interval = setInterval(() => {
            setMemory(m => {
                if (m >= 100) {
                    setGameState('lost');
                    return 100;
                }
                return m + 2; // +2% per second
            });
        }, 500);
        return () => clearInterval(interval);
    }, [gameState, showPuzzle]);

    const move = (dx, dy) => {
        if (gameState !== 'playing' || showPuzzle) return;
        const newX = player.x + dx;
        const newY = player.y + dy;

        // Bounds check
        if (newX < 0 || newY < 0 || newX >= 5 || newY >= 5) return;

        const cell = grid[newY][newX];

        if (cell === 1) return; // Wall
        if (cell === 3) { // Exit
            loadLevel(level + 1);
            toast.success("Stack Frame Cleared!");
            return;
        }
        if (cell === 4) { // Door
            setShowPuzzle(true);
            return;
        }

        setPlayer({ x: newX, y: newY });
    };

    // Keyboard support
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowUp') move(0, -1);
            if (e.key === 'ArrowDown') move(0, 1);
            if (e.key === 'ArrowLeft') move(-1, 0);
            if (e.key === 'ArrowRight') move(1, 0);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [player, gameState, showPuzzle, grid]);

    const handlePuzzleSubmit = (idx) => {
        if (idx === LEVELS[level].doorPuzzle.correct) {
            toast.success("Correct! Door Unlocked.");
            const nextGrid = [...grid];
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    if (nextGrid[y][x] === 4) nextGrid[y][x] = 0;
                }
            }
            setGrid(nextGrid);
            setShowPuzzle(false);
        } else {
            toast.error("Segfault! Memory Spike.");
            setMemory(m => Math.min(100, m + 20)); // Penalty
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-center relative px-4 flex flex-col gap-6 animate-in fade-in duration-700">
            <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl animate-in slide-in-from-top-4 shadow-sm">
                <h4 className="text-[12px] font-black text-cyan-500 mb-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Ghost size={16} /> Recursion Escape
                </h4>
                <p className="text-[10px] text-muted-foreground opacity-80 leading-relaxed font-medium">
                    Navigate the call stack maze. Unlock gates before overflow.
                </p>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center bg-card border border-border p-3 rounded-xl shadow-sm">
                <div className="flex flex-col items-start min-w-[60px]">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">FRAME</span>
                    <span className="text-lg font-black text-foreground tabular-nums">LVL_0{level + 1}</span>
                </div>
                <div className="flex-1 mx-6">
                    <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-tighter mb-1">
                        <span>HEAP_UTILIZATION</span>
                        <span>{memory}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden border border-border dark:border-white/5">
                        <div
                            className={`h-full transition-all duration-500 ${memory > 80 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`}
                            style={{ width: `${memory}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className={`relative bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-[2rem] border border-border dark:border-white/5 shadow-xl dark:shadow-2xl transition-all duration-500 ${gameState !== 'playing' ? 'opacity-20 blur-xl scale-95' : ''}`}>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-[280px] mx-auto">
                    {grid.map((row, y) => (
                        row.map((cell, x) => {
                            let content = '';
                            let bg = 'bg-slate-50 dark:bg-white/[0.03]';

                            if (cell === 1) bg = 'bg-slate-200 dark:bg-slate-900 border border-border dark:border-white/5 shadow-inner'; // Wall
                            if (cell === 3) { content = '🚪'; bg = 'bg-emerald-500/10 border border-emerald-500/30'; } // Exit
                            if (cell === 4) { content = '🔒'; bg = 'bg-rose-500/10 border border-rose-500/30 animate-pulse'; } // Door
                            if (x === player.x && y === player.y) { content = '🤖'; bg = 'bg-cyan-500/20 border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10 scale-105'; }

                            return (
                                <div key={`${x}-${y}`} className={`aspect-square rounded-lg flex items-center justify-center text-[16px] sm:text-[20px] transition-all duration-300 ${bg}`}>
                                    <span className={x === player.x && y === player.y ? 'animate-bounce' : ''}>{content}</span>
                                </div>
                            );
                        })
                    ))}
                </div>

                {/* Mobile Controls */}
                <div className="mt-6 grid grid-cols-3 gap-2 max-w-[120px] mx-auto md:hidden">
                    <div />
                    <button onClick={() => move(0, -1)} className="p-2.5 bg-white/5 rounded-lg border border-white/10 active:scale-90 transition-transform flex items-center justify-center"><ArrowUp size={16} /></button>
                    <div />
                    <button onClick={() => move(-1, 0)} className="p-2.5 bg-white/5 rounded-lg border border-white/10 active:scale-90 transition-transform flex items-center justify-center"><ArrowLeft size={16} /></button>
                    <button onClick={() => move(0, 1)} className="p-2.5 bg-white/5 rounded-lg border border-white/10 active:scale-90 transition-transform flex items-center justify-center"><ArrowDown size={16} /></button>
                    <button onClick={() => move(1, 0)} className="p-2.5 bg-white/5 rounded-lg border border-white/10 active:scale-90 transition-transform flex items-center justify-center"><ArrowRight size={16} /></button>
                </div>
            </div>

            {/* Puzzle Modal */}
            {showPuzzle && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center p-4 z-20 animate-in fade-in zoom-in duration-300">
                    <div className="w-full max-w-xs bg-card border border-cyan-500/30 p-5 rounded-2xl shadow-2xl">
                        <h4 className="text-cyan-500 font-black mb-3 flex items-center justify-center gap-1.5 uppercase tracking-widest text-xs"><Terminal size={14} /> Logic_Gate</h4>
                        <div className="bg-slate-950 p-3 rounded-lg font-mono text-[10px] text-left text-muted-foreground mb-4 border border-white/5 overflow-x-auto">
                            <pre>{LEVELS[level].doorPuzzle.code}</pre>
                        </div>
                        <p className="text-[12px] font-bold mb-4 text-foreground leading-tight text-left">{LEVELS[level].doorPuzzle.question}</p>
                        <div className="space-y-2">
                            {LEVELS[level].doorPuzzle.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePuzzleSubmit(i)}
                                    className="w-full p-3 text-[11px] font-bold bg-secondary hover:bg-cyan-500/10 hover:text-cyan-400 border border-border/50 hover:border-cyan-500/50 rounded-lg transition-all text-left flex items-center justify-between"
                                >
                                    <span>{opt}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over / Win Screens */}
            {gameState !== 'playing' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-xl rounded-[2rem] animate-in fade-in duration-500">
                    <div className="text-center p-6">
                        {gameState === 'won' ? (
                            <>
                                <Trophy size={60} className="text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <h2 className="text-2xl font-black text-white mb-1 tracking-tighter uppercase">Escaped!</h2>
                                <p className="text-muted-foreground text-xs font-medium mb-6">System memory stabilized.</p>
                            </>
                        ) : (
                            <>
                                <Ghost size={60} className="text-rose-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse" />
                                <h2 className="text-2xl font-black text-rose-500 mb-1 tracking-tighter uppercase">Critical Leak!</h2>
                                <p className="text-muted-foreground text-xs font-medium mb-6">Stack Overflow detected.</p>
                            </>
                        )}
                        <button onClick={() => { setGameState('playing'); loadLevel(0); }} className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg">
                            RESTART
                        </button>
                    </div>
                </div>
            )}

            <div className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-30">
                WASD / Arrows / Touch Controls
            </div>
        </div>
    );
};

export default StackOverflowEscape;
