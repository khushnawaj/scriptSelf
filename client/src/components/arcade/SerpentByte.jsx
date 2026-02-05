import { useState, useEffect } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Zap, Flame } from 'lucide-react';

// Helper for mobile controls
const GamePadArrow = ({ direction }) => {
    const rotation = { up: 0, right: 90, down: 180, left: 270 };
    return <div style={{ transform: `rotate(${rotation[direction]}deg)` }}>▲</div>
};

const SerpentByte = ({ dispatch }) => {
    const GRID_SIZE = 20;
    const INITIAL_SNAKE = [{ x: 10, y: 10 }];
    const INITIAL_DIRECTION = { x: 0, y: -1 };
    const BASE_SPEED = 150;

    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 15, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [speed, setSpeed] = useState(BASE_SPEED);

    // Controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver) return;
            switch (e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) setDirection({ x: 1, y: 0 });
                    break;
                case ' ':
                    setIsPaused(p => !p);
                    break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction, gameOver]);

    // Game Loop
    useEffect(() => {
        if (gameOver || isPaused) return;

        const moveSnake = () => {
            const newSnake = [...snake];
            const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

            // Wall Collision
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setGameOver(true);
                return;
            }

            // Self Collision
            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return;
            }

            newSnake.unshift(head);

            // Eat Food
            if (head.x === food.x && head.y === food.y) {
                const points = 10;
                setScore(s => s + points);
                dispatch(updateArcadeStats(points));
                setFood({
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                });
                // Speed up
                setSpeed(s => Math.max(50, s * 0.98));
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [snake, direction, gameOver, isPaused, food, speed, dispatch]);

    const restartGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setGameOver(false);
        setSpeed(BASE_SPEED);
        setFood({ x: 15, y: 5 });
        setIsPaused(false);
    };

    return (
        <div className="max-w-[500px] mx-auto">
            {/* Mission Brief */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-[12px] mb-8 text-center animate-in slide-in-from-top-4">
                <h4 className="text-[14px] font-bold text-emerald-500 mb-2 flex items-center justify-center gap-2">
                    <Zap size={16} /> Mission Brief: Python Runner
                </h4>
                <p className="text-[12px] text-muted-foreground">
                    Consume resources to scale the operation. Avoid stack overflow collisions. <br />
                    <span className="text-foreground font-bold">Controls:</span> Arrow Keys to move. Space to pause.
                </p>
            </div>

            <div className="flex justify-between items-center mb-6 px-4">
                <span className="font-bold text-primary text-[20px] drop-shadow-sm">{score} XP</span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-slate-100 dark:bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">SPEED: {Math.round((BASE_SPEED - speed + 10))}MS</span>
            </div>

            <div
                className="relative bg-white dark:bg-slate-950 rounded-[2rem] border border-border dark:border-white/5 shadow-xl dark:shadow-2xl overflow-hidden mx-auto transition-all duration-500"
                style={{ width: 400, height: 400 }}
            >
                {/* Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] pointer-events-none opacity-20 dark:opacity-10">
                    {[...Array(400)].map((_, i) => <div key={i} className="border-[0.5px] border-slate-200 dark:border-emerald-500/30" />)}
                </div>

                {/* Snake */}
                {snake.map((segment, i) => (
                    <div
                        key={i}
                        className="absolute bg-emerald-500 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{
                            left: `${(segment.x / GRID_SIZE) * 100}%`,
                            top: `${(segment.y / GRID_SIZE) * 100}%`,
                            width: `${100 / GRID_SIZE}%`,
                            height: `${100 / GRID_SIZE}%`,
                            opacity: i === 0 ? 1 : 0.4 + (0.6 * (1 - i / snake.length)) // Fade tail
                        }}
                    />
                ))}

                {/* Food */}
                <div
                    className="absolute text-rose-500 flex items-center justify-center animate-pulse"
                    style={{
                        left: `${(food.x / GRID_SIZE) * 100}%`,
                        top: `${(food.y / GRID_SIZE) * 100}%`,
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`
                    }}
                >
                    <Flame size={16} className="fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center z-20 animate-in fade-in">
                        <h2 className="text-[32px] font-bold text-rose-500 mb-2">CRASHED!</h2>
                        <p className="text-muted-foreground mb-6">Runtime Error: Segment Violation</p>
                        <button onClick={restartGame} className="so-btn so-btn-primary px-8 py-3">Rerun Script</button>
                    </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !gameOver && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <span className="text-emerald-500 font-bold bg-black/50 px-4 py-2 rounded">SYSTEM PAUSED</span>
                    </div>
                )}
            </div>

            <div className="text-center mt-6 text-[12px] text-muted-foreground hidden md:block">
                Use <kbd className="bg-muted px-1 rounded">Arrows</kbd> to steer
            </div>
            {/* Mobile Controls */}
            <div className="md:hidden grid grid-cols-3 gap-2 max-w-[200px] mx-auto mt-6">
                <div />
                <button className="bg-secondary p-4 rounded-full active:bg-primary/20" onClick={() => !gameOver && setDirection(d => d.y === 0 ? { x: 0, y: -1 } : d)}><GamePadArrow direction="up" /></button>
                <div />
                <button className="bg-secondary p-4 rounded-full active:bg-primary/20" onClick={() => !gameOver && setDirection(d => d.x === 0 ? { x: -1, y: 0 } : d)}><GamePadArrow direction="left" /></button>
                <button className="bg-secondary p-4 rounded-full active:bg-primary/20" onClick={() => !gameOver && setDirection(d => d.x === 0 ? { x: 1, y: 0 } : d)}><GamePadArrow direction="right" /></button>
                <button className="bg-secondary p-4 rounded-full active:bg-primary/20" onClick={() => !gameOver && setDirection(d => d.y === 0 ? { x: 0, y: 1 } : d)}><GamePadArrow direction="down" /></button>
            </div>
        </div>
    );
};

export default SerpentByte;
