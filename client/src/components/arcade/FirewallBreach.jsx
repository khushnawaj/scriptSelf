import { useState, useEffect, useRef } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Zap } from 'lucide-react';

const FirewallBreach = ({ dispatch }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

    // Game Constants
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 12;
    const BALL_RADIUS = 6;
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 9; // Fits nicely in ~600px

    // Game State Refs (for animation loop)
    const stateRef = useRef({
        paddleX: 250,
        ball: { x: 300, y: 400, dx: 4, dy: -4 },
        bricks: [],
        particles: [],
        isPlaying: false,
        score: 0
    });

    const initGame = () => {
        const bricks = [];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                bricks.push({
                    x: (c * (60 + 10)) + 35, // 60 width, 10 padding
                    y: (r * (20 + 10)) + 30, // 20 height
                    status: 1,
                    color: colors[r]
                });
            }
        }

        stateRef.current = {
            paddleX: 250,
            ball: { x: 300, y: 400, dx: 4, dy: -4 },
            bricks,
            particles: [],
            isPlaying: true,
            score: 0
        };
        setScore(0);
        setLives(3);
        setGameState('playing');
    };

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
            ctx.fillStyle = '#8b5cf6'; // Violet
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
                    ctx.rect(brick.x, brick.y, 60, 20);
                    ctx.fillStyle = brick.color;
                    ctx.fill();
                    ctx.closePath();
                    // Shine effect
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(brick.x, brick.y, 60, 10);
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
                    size: Math.random() * 3 + 1,
                    color,
                    life: 1
                });
            }
        };

        const render = () => {
            if (gameState !== 'playing') return;

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { ball, bricks, particles, paddleX } = stateRef.current;

            // Move Ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall Collision
            if (ball.x + ball.dx > canvas.width - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
                ball.dx = -ball.dx;
            }
            if (ball.y + ball.dy < BALL_RADIUS) {
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > canvas.height - BALL_RADIUS) {
                // Ball Lost
                if (lives > 1) {
                    setLives(prev => prev - 1);
                    stateRef.current.ball = { x: canvas.width / 2, y: canvas.height - 30, dx: 4, dy: -4 };
                } else {
                    setGameState('lost');
                    stateRef.current.isPlaying = false;
                }
            }

            // Paddle Collision
            const paddleY = canvas.height - PADDLE_HEIGHT - 10;
            if (
                ball.y + BALL_RADIUS > paddleY &&
                ball.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT &&
                ball.x > paddleX &&
                ball.x < paddleX + PADDLE_WIDTH
            ) {
                // Determine collision point for angle control
                let collidePoint = ball.x - (paddleX + PADDLE_WIDTH / 2);
                collidePoint = collidePoint / (PADDLE_WIDTH / 2);

                let angle = collidePoint * (Math.PI / 3); // 60 degrees max

                // Speed up slightly on paddle hit
                const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * 1.02;

                ball.dx = speed * Math.sin(angle);
                ball.dy = -speed * Math.cos(angle);
            }

            // Brick Collision
            let activeBricks = 0;
            bricks.forEach(b => {
                if (b.status === 1) {
                    activeBricks++;
                    if (
                        ball.x > b.x &&
                        ball.x < b.x + 60 &&
                        ball.y > b.y &&
                        ball.y < b.y + 20
                    ) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        stateRef.current.score += 20;
                        setScore(stateRef.current.score);
                        createExplosion(b.x + 30, b.y + 10, b.color);
                    }
                }
            });

            if (activeBricks === 0) {
                setGameState('won');
                stateRef.current.isPlaying = false;
                dispatch(updateArcadeStats({ points: stateRef.current.score + 100, gameId: 'breach' })); // Win bonus
            }

            // Draw
            drawBricks(bricks);
            drawPaddle(paddleX);
            drawBall(ball);
            drawParticles(particles);

            if (stateRef.current.isPlaying) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        if (gameState === 'playing') {
            render();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, lives, dispatch]);

    const handleMouseMove = (e) => {
        if (!canvasRef.current || gameState !== 'playing') return;
        const rect = canvasRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;

        let newPaddleX = relativeX - PADDLE_WIDTH / 2;
        // Clamp
        if (newPaddleX < 0) newPaddleX = 0;
        if (newPaddleX > canvasRef.current.width - PADDLE_WIDTH) {
            newPaddleX = canvasRef.current.width - PADDLE_WIDTH;
        }

        stateRef.current.paddleX = newPaddleX;
    };

    return (
        <div className="max-w-[700px] mx-auto">
            {/* Mission Brief */}
            <div className="bg-violet-500/5 border border-violet-500/20 p-4 rounded-[12px] mb-8 text-center animate-in slide-in-from-top-4">
                <h4 className="text-[14px] font-bold text-violet-500 mb-2 flex items-center justify-center gap-2">
                    <Zap size={16} /> Mission Brief: Firewall Breach
                </h4>
                <p className="text-[12px] text-muted-foreground">
                    Penetrate the system security layers. Deflect the data packet to destroy nodes.
                </p>
            </div>

            <div className="flex justify-between items-center mb-4 px-4">
                <span className="font-bold text-foreground text-[20px]">Score: {score}</span>
                <div className="flex gap-1">
                    {[...Array(lives)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />)}
                </div>
            </div>

            <div className="relative bg-slate-950 rounded-[12px] border border-border shadow-2xl overflow-hidden cursor-none flex justify-center">
                {/* Menu Overlay */}
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        {gameState === 'menu' && (
                            <button onClick={initGame} className="so-btn so-btn-primary px-8 py-3 text-[16px] animate-pulse">
                                INITIALIZE BREACH
                            </button>
                        )}
                        {gameState === 'lost' && (
                            <div className="text-center animate-in zoom-in">
                                <h2 className="text-[32px] font-bold text-rose-500 mb-2">CONNECTION TERMINATED</h2>
                                <p className="text-muted-foreground mb-6">Final Score: {score}</p>
                                <button onClick={initGame} className="so-btn so-btn-secondary px-8 py-3">Retry Handshake</button>
                            </div>
                        )}
                        {gameState === 'won' && (
                            <div className="text-center animate-in zoom-in">
                                <h2 className="text-[32px] font-bold text-emerald-500 mb-2">ACCESS GRANTED</h2>
                                <p className="text-muted-foreground mb-6">Root access established.</p>
                                <button onClick={initGame} className="so-btn so-btn-primary px-8 py-3">Re-run Simulation</button>
                            </div>
                        )}
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    width={680}
                    height={500}
                    onMouseMove={handleMouseMove}
                    className="touch-none bg-slate-950"
                    style={{ maxWidth: '100%' }}
                />
            </div>

            <div className="text-center mt-6 text-[12px] text-muted-foreground">
                Mouse/Touch to Move Paddle
            </div>
        </div>
    );
};

export default FirewallBreach;
