import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Ghost, Terminal, Trophy } from 'lucide-react';
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
        // Keep memory from previous level? Or reset? Let's reset for fairness.
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
            // Remove door from grid
            const nextGrid = [...grid];
            // Find door pos (we just hit it, but player position didn't update to it yet)
            // Actually player is adjacent. We need to find the specific door we hit?
            // Simplification: Remove ALL doors in this small level or find the one adjacent
            // Let's just create a generic way: set the door cell to 0.
            // Search grid for 4
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
        <div className="max-w-[500px] mx-auto text-center relative">
            <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-[8px] mb-8 animate-in slide-in-from-top-4">
                <h4 className="text-[14px] font-bold text-cyan-500 mb-2 flex items-center justify-center gap-2">
                    <Ghost size={16} /> Mission Brief: Recursion Escape
                </h4>
                <p className="text-[12px] text-muted-foreground">
                    Navigate the call stack maze. Unlock logic gates. Escape before heap overflow.
                </p>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center mb-6 px-4">
                <span className="font-bold text-muted-foreground">Level {level + 1}</span>
                <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${memory > 80 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`}
                        style={{ width: `${memory}%` }}
                    />
                </div>
                <span className="font-mono text-[12px] text-muted-foreground">{memory}% Mem</span>
            </div>

            {/* Grid */}
            <div className={`relative bg-slate-950 p-4 rounded-[12px] border border-border inline-block shadow-2xl ${gameState !== 'playing' ? 'opacity-50 blur-sm' : ''}`}>
                <div className="grid grid-cols-5 gap-2">
                    {grid.map((row, y) => (
                        row.map((cell, x) => {
                            let content = '';
                            let bg = 'bg-muted/10';

                            if (cell === 1) bg = 'bg-slate-800 border border-slate-700'; // Wall
                            if (cell === 3) { content = '🚪'; bg = 'bg-emerald-500/20 border border-emerald-500/50'; } // Exit
                            if (cell === 4) { content = '🔒'; bg = 'bg-rose-500/20 border border-rose-500/50 animate-pulse'; } // Door
                            if (x === player.x && y === player.y) { content = '🤖'; bg = 'bg-cyan-500/20 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]'; }

                            return (
                                <div key={`${x}-${y}`} className={`w-12 h-12 rounded-[6px] flex items-center justify-center text-[20px] ${bg}`}>
                                    {content}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Puzzle Modal */}
            {showPuzzle && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[12px] flex flex-col items-center justify-center p-6 z-20 animate-in fade-in zoom-in">
                    <div className="w-full max-w-sm bg-card border border-cyan-500/30 p-4 rounded-[12px] shadow-2xl">
                        <h4 className="text-cyan-500 font-bold mb-2 flex items-center gap-2"><Terminal size={14} /> Logic Gate</h4>
                        <div className="bg-slate-950 p-3 rounded font-mono text-[11px] text-left text-muted-foreground mb-4 border border-border">
                            {LEVELS[level].doorPuzzle.code}
                        </div>
                        <p className="text-[13px] font-bold mb-4">{LEVELS[level].doorPuzzle.question}</p>
                        <div className="space-y-2">
                            {LEVELS[level].doorPuzzle.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePuzzleSubmit(i)}
                                    className="w-full p-2 text-[12px] bg-secondary hover:bg-cyan-500/20 hover:text-cyan-500 border border-transparent hover:border-cyan-500/50 rounded transition-colors text-left"
                                >
                                    {String.fromCharCode(65 + i)}. {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over / Win Screens */}
            {gameState !== 'playing' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 rounded-[12px]">
                    <div className="text-center">
                        {gameState === 'won' ? (
                            <>
                                <Trophy size={48} className="text-emerald-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Escaped!</h2>
                                <p className="text-muted-foreground mb-4">Stack unwound successfully.</p>
                            </>
                        ) : (
                            <>
                                <Ghost size={48} className="text-rose-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Stack Overflow</h2>
                                <p className="text-muted-foreground mb-4">Memory limit exceeded.</p>
                            </>
                        )}
                        <button onClick={() => { setGameState('playing'); loadLevel(0); }} className="so-btn so-btn-primary">
                            Restart Simulation
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-8 text-[11px] text-muted-foreground">
                Controls: Use Arrow Keys to navigate
            </div>
        </div>
    );
};

export default StackOverflowEscape;
