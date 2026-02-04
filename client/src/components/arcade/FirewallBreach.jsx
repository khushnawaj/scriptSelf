import { useState, useEffect, useRef } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Zap } from 'lucide-react';

const FirewallBreach = ({ dispatch }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

    // Game Constants
    // Game Constants
    const PADDLE_WIDTH = 90;
    const PADDLE_HEIGHT = 10;
    const BALL_RADIUS = 5;
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 8;

    // Game State Refs (for animation loop)
    const stateRef = useRef({
        paddleX: 250,
        ball: { x: 300, y: 350, dx: 3.5, dy: -3.5 },
        bricks: [],
        particles: [],
        isPlaying: false,
        score: 0
    });

    const initGame = () => {
        const bricks = [];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
        const brickPadding = 8;
        const brickWidth = 65;
        const brickHeight = 18;
        const offsetLeft = (600 - (brickWidth * BRICK_COLUMN_COUNT + brickPadding * (BRICK_COLUMN_COUNT - 1))) / 2;

        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                bricks.push({
                    x: (c * (brickWidth + brickPadding)) + offsetLeft,
                    y: (r * (brickHeight + brickPadding)) + 30,
                    status: 1,
                    color: colors[r],
                    width: brickWidth,
                    height: brickHeight
                });
            }
        }

        stateRef.current = {
            paddleX: 250,
            ball: { x: 300, y: 350, dx: 4, dy: -4 },
            bricks,
            particles: [],
            isPlaying: true,
            score: 0
        };
        setScore(0);
        setLives(3);
        setGameState('playing');
    };

    // ... (logic for canvas drawing stays same, just using b.width/b.height)

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const drawBall = (ball) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10;
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawPaddle = (x) => {
            ctx.beginPath();
            ctx.rect(x, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.fillStyle = '#8b5cf6';
            ctx.fill();
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 15;
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawBricks = (bricks) => {
            bricks.forEach(brick => {
                if (brick.status === 1) {
                    ctx.beginPath();
                    ctx.rect(brick.x, brick.y, brick.width, brick.height);
                    ctx.fillStyle = brick.color;
                    ctx.fill();
                    ctx.closePath();
                }
            });
        };

        const drawParticles = (particles) => {
            particles.forEach((p, index) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.closePath();
                ctx.globalAlpha = 1;

                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;

                if (p.life <= 0) particles.splice(index, 1);
            });
        };

        const createExplosion = (x, y, color) => {
            for (let i = 0; i < 8; i++) {
                stateRef.current.particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    size: Math.random() * 2 + 1,
                    color,
                    life: 1
                });
            }
        };

        const render = () => {
            if (gameState !== 'playing') return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const { ball, bricks, particles, paddleX } = stateRef.current;

            ball.x += ball.dx;
            ball.y += ball.dy;

            if (ball.x + ball.dx > canvas.width - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) ball.dx = -ball.dx;
            if (ball.y + ball.dy < BALL_RADIUS) ball.dy = -ball.dy;
            else if (ball.y + ball.dy > canvas.height - BALL_RADIUS) {
                if (lives > 1) {
                    setLives(prev => prev - 1);
                    stateRef.current.ball = { x: canvas.width / 2, y: canvas.height - 30, dx: 4, dy: -4 };
                } else {
                    setGameState('lost');
                    stateRef.current.isPlaying = false;
                }
            }

            const paddleY = canvas.height - PADDLE_HEIGHT - 10;
            if (ball.y + BALL_RADIUS > paddleY && ball.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT && ball.x > paddleX && ball.x < paddleX + PADDLE_WIDTH) {
                let collidePoint = ball.x - (paddleX + PADDLE_WIDTH / 2);
                collidePoint = collidePoint / (PADDLE_WIDTH / 2);
                let angle = collidePoint * (Math.PI / 3);
                const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * 1.01;
                ball.dx = speed * Math.sin(angle);
                ball.dy = -speed * Math.cos(angle);
            }

            let activeBricks = 0;
            bricks.forEach(b => {
                if (b.status === 1) {
                    activeBricks++;
                    if (ball.x > b.x && ball.x < b.x + b.width && ball.y > b.y && ball.y < b.y + b.height) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        stateRef.current.score += 20;
                        setScore(stateRef.current.score);
                        createExplosion(b.x + b.width / 2, b.y + b.height / 2, b.color);
                    }
                }
            });

            if (activeBricks === 0) {
                setGameState('won');
                stateRef.current.isPlaying = false;
                dispatch(updateArcadeStats({ points: stateRef.current.score + 100, gameId: 'breach' }));
            }

            drawBricks(bricks);
            drawPaddle(paddleX);
            drawBall(ball);
            drawParticles(particles);

            if (stateRef.current.isPlaying) animationFrameId = requestAnimationFrame(render);
        };

        if (gameState === 'playing') render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, lives, dispatch]);

    const handleMouseMove = (e) => {
        if (!canvasRef.current || gameState !== 'playing') return;
        const rect = canvasRef.current.getBoundingClientRect();
        const relativeX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        let newPaddleX = relativeX - PADDLE_WIDTH / 2;
        if (newPaddleX < 0) newPaddleX = 0;
        if (newPaddleX > canvasRef.current.width - PADDLE_WIDTH) newPaddleX = canvasRef.current.width - PADDLE_WIDTH;
        stateRef.current.paddleX = newPaddleX;
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4 flex flex-col items-center animate-in fade-in duration-700">
            {/* Mission Brief */}
            <div className="w-full bg-violet-500/5 border border-violet-500/20 p-4 rounded-xl animate-in slide-in-from-top-4 shadow-sm text-center">
                <h4 className="text-[11px] font-black text-violet-500 mb-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Zap size={14} /> Firewall_Breach
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium opacity-80">
                    Deflect data packets to penetrate security.
                </p>
            </div>

            {/* Stats */}
            <div className="w-full flex justify-between items-center bg-card border border-border/50 p-3 rounded-xl shadow-sm">
                <div className="flex flex-col items-start min-w-[80px]">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-50">SYNC_SCORE</span>
                    <span className="text-xl font-black text-foreground tabular-nums">{score}</span>
                </div>
                <div className="flex gap-1.5 min-w-[60px] justify-end">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${i < lives ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-800'}`} />
                    ))}
                </div>
            </div>

            <div className="relative bg-slate-950 p-4 sm:p-6 rounded-[2rem] border border-white/5 shadow-2xl transition-all duration-500 w-full flex justify-center">
                <div className="relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
                    {gameState !== 'playing' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6">
                            {gameState === 'menu' && (
                                <button onClick={initGame} className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg text-xs">
                                    INITIALIZE_BREACH
                                </button>
                            )}
                            {gameState === 'lost' && (
                                <div className="text-center animate-in zoom-in">
                                    <h2 className="text-2xl font-black text-rose-500 mb-2 uppercase tracking-tighter">CONNECTION_TERMINATED</h2>
                                    <p className="text-[10px] text-muted-foreground mb-6 uppercase tracking-widest font-bold font-mono">CORE_XP: {score}</p>
                                    <button onClick={initGame} className="px-8 py-3 bg-secondary text-white font-black uppercase tracking-widest rounded-xl text-[10px]">Retry_Handshake</button>
                                </div>
                            )}
                            {gameState === 'won' && (
                                <div className="text-center animate-in zoom-in">
                                    <h2 className="text-2xl font-black text-emerald-500 mb-2 uppercase tracking-tighter">ACCESS_GRANTED</h2>
                                    <p className="text-[10px] text-muted-foreground mb-6 uppercase tracking-widest font-bold">Root_Link_Stable</p>
                                    <button onClick={initGame} className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl text-[10px]">Re-run_Simulation</button>
                                </div>
                            )}
                        </div>
                    )}

                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={450}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                        className="touch-none cursor-crosshair"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            </div>

            <div className="text-center text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-30 mt-2">
                Mouse / Touch Controls Enabled
            </div>
        </div>
    );
};

export default FirewallBreach;
