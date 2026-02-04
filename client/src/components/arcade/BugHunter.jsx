import { useState, useEffect, useRef } from 'react';
import { updateArcadeStats } from '../../features/auth/authSlice';
import { Bug, Trophy, Zap, Terminal, Shield, Bomb, Clock, Play, AlertCircle, Cpu, Activity, Database, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const BugHunter = ({ dispatch }) => {
    // Config
    const GAME_DURATION = 60;
    const DIFFICULTIES = {
        Junior: { spawnRate: 1500, timePenalty: 5, scoreMultiplier: 1, label: 'SYNTAX_VOID' },
        Mid: { spawnRate: 1000, timePenalty: 8, scoreMultiplier: 1.5, label: 'LOGIC_BREACH' },
        Senior: { spawnRate: 700, timePenalty: 12, scoreMultiplier: 2, label: 'KERNEL_TERROR' }
    };

    // State
    const [gameState, setGameState] = useState('menu'); // menu, playing, game_over
    const [difficulty, setDifficulty] = useState('Junior');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [health, setHealth] = useState(100);
    const [streak, setStreak] = useState(0);
    const [activeSnippet, setActiveSnippet] = useState(null);
    const [feedback, setFeedback] = useState(null); // { message, type }
    const [powerUps, setPowerUps] = useState({ shield: false, slowMotion: 0 }); // slowMotion is a count of seconds
    const [leaderboard, setLeaderboard] = useState([]);
    const [consoleLogs, setConsoleLogs] = useState([]);

    // Constants
    const SNIPPETS = {
        Junior: [
            {
                id: 'j1',
                code: `function greet() {\n  return "Hello" + name; // BUG: name undefined\n}`,
                bugLine: 2,
                options: ['Add: const name = "Dev";', 'Change to: return "Hello";', 'Pass name as param'],
                correct: 2,
                type: 'ReferenceError',
                testInput: 'greet()',
                testOutput: 'ReferenceError: name is not defined'
            },
            {
                id: 'j2',
                code: `const arr = [1, 2, 3];\nfor(let i=0; i<=arr.length; i++) { // BUG\n  process(arr[i]);\n}`,
                bugLine: 2,
                options: ['i < arr.length', 'i <= arr.length - 1', 'Both are correct'],
                correct: 0,
                type: 'IndexOutOfBounds',
                testInput: 'arr[3]',
                testOutput: 'undefined (Expected: 3 nodes processed)'
            },
            {
                id: 'j3',
                code: `const price = "100";\nconst total = price + 50; // BUG: string concat\nconsole.log(total);`,
                bugLine: 2,
                options: ['Number(price) + 50', 'price * 1 + 50', 'Both are valid'],
                correct: 2,
                type: 'Type Mismatch',
                testInput: 'total',
                testOutput: '"10050" (Expected: 150)'
            },
            {
                id: 'j4',
                code: `if (status = "active") { // BUG: Assignment in condition\n  grantAccess();\n}`,
                bugLine: 1,
                options: ['Use ==', 'Use ===', 'Use .equals()'],
                correct: 1,
                type: 'Logical Flaw',
                testInput: 'status === "inactive"',
                testOutput: 'Access Granted (Expected: Denied)'
            },
            {
                id: 'j5',
                code: `const items = [1, 2, 3];\nconst doubled = items.map(i => {\n  i * 2; // BUG: No return\n});`,
                bugLine: 3,
                options: ['Add return keyword', 'Remove curly braces', 'Both are valid fixes'],
                correct: 2,
                type: 'Missing Return',
                testInput: 'doubled[0]',
                testOutput: 'undefined (Expected: 2)'
            },
            {
                id: 'j6',
                code: `const user = null;\nconst name = user.name; // BUG: Cannot read prop`,
                bugLine: 2,
                options: ['const name = user?.name;', 'if(user) name = user.name;', 'Both are valid'],
                correct: 2,
                type: 'TypeError',
                testInput: 'name',
                testOutput: 'Crash: Cannot read property name of null'
            },
            {
                id: 'j7',
                code: `async function check() {\n  const res = fetch("/api"); // BUG: Missing await\n  return res.json();\n}`,
                bugLine: 2,
                options: ['await fetch("/api")', 'return await res.json()', 'Change to .then()'],
                correct: 0,
                type: 'Promise Leak',
                testInput: 'typeof res',
                testOutput: 'Promise (Expected: Response)'
            },
            {
                id: 'j8',
                code: `if (x = 0 || x > 10) { // BUG: Assignment in check\n  doWork();\n}`,
                bugLine: 1,
                options: ['x === 0', 'x == 0', 'Both are valid'],
                correct: 0,
                type: 'Logic Breach',
                testInput: 'x = 0',
                testOutput: 'False (Expected: True)'
            },
            {
                id: 'j9',
                code: `function count(n) {\n  if(n === 0) return; // BUG: Missing return value\n  return n + count(n-1);\n}`,
                bugLine: 2,
                options: ['return 0', 'return 1', 'return n'],
                correct: 0,
                type: 'Recursion Depth',
                testInput: 'count(2)',
                testOutput: 'NaN (Expected: 3)'
            },
            {
                id: 'j10',
                code: `const colors = ["red", "blue"];\ncolors[5] = "green"; // BUG: Sparse array\nconsole.log(colors.length);`,
                bugLine: 2,
                options: ['Use .push()', 'Initialize with 6 slots', 'Neither, it works fine'],
                correct: 0,
                type: 'Memory Leak',
                testInput: 'colors.length',
                testOutput: '6 (Expected: 3)'
            }
        ],
        Mid: [
            {
                id: 'm1',
                code: `const obj = { val: 10 };\nconst next = obj;\nnext.val = 20;\n// BUG: obj.val is now 20`,
                bugLine: 2,
                options: ['const next = { ...obj };', 'const next = Object.assign({}, obj);', 'Both A and B'],
                correct: 2,
                type: 'Mutation Leak',
                testInput: 'obj.val',
                testOutput: '20 (Expected: 10)'
            },
            {
                id: 'm2',
                code: `function sum(a, b) {\n  if(typeof a !== 'number') return;\n  return a + b; // BUG: b not checked\n}`,
                bugLine: 3,
                options: ['Check b too', 'Use Number(a) + Number(b)', 'Use TypeScript'],
                correct: 0,
                type: 'Type Coercion',
                testInput: 'sum(5, "5")',
                testOutput: '"55" (Expected: 10)'
            },
            {
                id: 'm3',
                code: `function heavyWork() {\n  const data = new Array(1000000);\n  window.addEventListener('scroll', () => {\n    console.log(data.length); // BUG: Memory Leak\n  });\n}`,
                bugLine: 4,
                options: ['Use removeEventListener', 'Use AbortController', 'Both A and B'],
                correct: 2,
                type: 'Memory Leak',
                testInput: 'Heap Size',
                testOutput: '1.2GB (Expected: < 100MB)'
            },
            {
                id: 'm4',
                code: `const user = { id: 1, profile: { name: "JD" } };\nconst shallow = { ...user };\nshallow.profile.name = "AD"; // BUG`,
                bugLine: 3,
                options: ['Deep clone needed', 'Spread nested profile', 'Use JSON.parse/stringify'],
                correct: 0,
                type: 'Shallow Copy',
                testInput: 'user.profile.name',
                testOutput: '"AD" (Expected: "JD")'
            },
            {
                id: 'm5',
                code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100); // BUG\n}`,
                bugLine: 1,
                options: ['Use let instead of var', 'Use a closure (IIFE)', 'Both A and B'],
                correct: 2,
                type: 'Scope Pollution',
                testInput: 'Output',
                testOutput: '3, 3, 3 (Expected: 0, 1, 2)'
            },
            {
                id: 'm6',
                code: `const nums = [1, 2, 3];\nconst sum = nums.reduce((acc, n) => acc + n); // BUG: No init val`,
                bugLine: 2,
                options: ['Add , 0 after callback', 'It works fine actually', 'Use for loop'],
                correct: 0,
                type: 'Logic Rift',
                testInput: 'nums = []',
                testOutput: 'TypeError: Reduce empty array'
            },
            {
                id: 'm7',
                code: `function App() {\n  const [count, setCount] = useState(0);\n  const handle = () => {\n    setCount(count + 1);\n    setCount(count + 1); // BUG\n  };\n}`,
                bugLine: 5,
                options: ['Use prev => prev + 1', 'Use useEffect', 'Only call it once'],
                correct: 0,
                type: 'State Batching',
                testInput: 'count after call',
                testOutput: '1 (Expected: 2)'
            },
            {
                id: 'm8',
                code: `const data = JSON.parse(input); // BUG: Untrusted input\ndisplay(data.name);`,
                bugLine: 1,
                options: ['Wrap in try-catch', 'Check if input is string', 'Neither'],
                correct: 0,
                type: 'Parsing Error',
                testInput: 'input = "invalid"',
                testOutput: 'Uncaught SyntaxError'
            },
            {
                id: 'm9',
                code: `const btn = document.querySelector("#save");\nbtn.onclick = () => save();\nbtn.onclick = () => log(); // BUG`,
                bugLine: 3,
                options: ['Use addEventListener', 'Use a wrapper function', 'Both are correct'],
                correct: 2,
                type: 'Event Overwrite',
                testInput: 'Click',
                testOutput: 'Only "log" called'
            },
            {
                id: 'm10',
                code: `const a = {};\nconst b = { key: "val" };\na[b] = 123; // BUG: Stringification\nconsole.log(a);`,
                bugLine: 3,
                options: ['Use Map instead', 'Use b.key as index', 'Both are valid'],
                correct: 2,
                type: 'Object Collision',
                testInput: 'a["[object Object]"]',
                testOutput: '123'
            }
        ],
        Senior: [
            {
                id: 's1',
                code: `async function load() {\n  const users = await getUsers();\n  users.forEach(async u => {\n    await save(u); // BUG: doesn't wait\n  });\n}`,
                bugLine: 3,
                options: ['Use for...of', 'Use Promise.all()', 'Both A and B'],
                correct: 2,
                type: 'Race Condition',
                testInput: 'db.count()',
                testOutput: '0 (Expected: 100)'
            },
            {
                id: 's2',
                code: `function fib(n) {\n  if(n < 2) return n;\n  return fib(n-1) + fib(n-2); // BUG\n}`,
                bugLine: 3,
                options: ['Use Memoization', 'Use Iterative approach', 'Both A and B'],
                correct: 2,
                type: 'Performance Breach',
                testInput: 'fib(45)',
                testOutput: 'Timeout: Stack Overflow'
            },
            {
                id: 's3',
                code: `const reducer = (state, action) => {\n  if(action.type === "ADD") {\n    state.items.push(action.item); // BUG\n    return state;\n  }\n};`,
                bugLine: 3,
                options: ['Return { ...state, items: [...] }', 'Use Immer', 'Both A and B'],
                correct: 2,
                type: 'State Mutation',
                testInput: 'prev === next',
                testOutput: 'true (Expected: false)'
            },
            {
                id: 's4',
                code: `function useTimer(val) {\n  useEffect(() => {\n    setInterval(() => console.log(val), 1000); // BUG\n  }, []);\n}`,
                bugLine: 3,
                options: ['Add val to dependencies', 'Use a ref for val', 'Both A and B'],
                correct: 1,
                type: 'Stale Closure',
                testInput: 'Logs',
                testOutput: 'InitialVal, InitialVal... (Expected: Updates)'
            },
            {
                id: 's5',
                code: `try {\n  setTimeout(() => {\n    throw new Error("Crash");\n  }, 10); // BUG: Not caught\n} catch(e) { handle(e); }`,
                bugLine: 3,
                options: ['Wrap inside timeout', 'Use Promises/Async', 'Both A and B'],
                correct: 2,
                type: 'Silent Crash',
                testInput: 'Error Handler',
                testOutput: 'Process Exited (Expected: Handled)'
            },
            {
                id: 's6',
                code: `const query = \`SELECT * FROM users WHERE id = \${id}\`; // BUG: Injection\nawait db.execute(query);`,
                bugLine: 1,
                options: ['Use parameterized queries', 'Sanitize id input', 'Both A and B'],
                correct: 2,
                type: 'SQL Injection',
                testInput: 'id = "1 OR 1=1"',
                testOutput: 'Dumped all users'
            },
            {
                id: 's7',
                code: `function heavy(n) {\n  let res = 0;\n  for(let i=0; i<n; i++) res += i; // BUG: Blocking main thread\n  return res;\n}`,
                bugLine: 3,
                options: ['Use Web Worker', 'Use setImmediate/setTimeout split', 'Both A and B'],
                correct: 2,
                type: 'Thread Block',
                testInput: 'heavy(10^9)',
                testOutput: 'UI Frozen'
            },
            {
                id: 's8',
                code: `const middleware = store => next => action => {\n  console.log(action); // BUG: Missing next(action)\n};`,
                bugLine: 2,
                options: ['Add next(action)', 'Add return next(action)', 'Both are correct'],
                correct: 2,
                type: 'Middleware Lock',
                testInput: 'Dispatch',
                testOutput: 'State never updates'
            },
            {
                id: 's9',
                code: `const App = () => {\n  const [v, setV] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setV(v + 1), 1000); // BUG: Stale v\n  }, []);\n}`,
                bugLine: 4,
                options: ['setV(v => v + 1)', 'Add v to deps', 'Both are valid fix approaches'],
                correct: 2,
                type: 'Stale State Call',
                testInput: 'v after 5s',
                testOutput: '1 (Expected: 5)'
            },
            {
                id: 's10',
                code: `class Node {\n  constructor() {\n    this.child = new Node(); // BUG: Infinite recursion\n  }\n}`,
                bugLine: 3,
                options: ['Pass child as arg', 'Initialize as null', 'Both are valid'],
                correct: 2,
                type: 'Kernel Panic',
                testInput: 'new Node()',
                testOutput: 'Stack Overflow'
            }
        ]
    };

    // Load Leaderboard
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('bugHunter_leaderboard') || '[]');
        setLeaderboard(saved);
    }, []);

    // Timers
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                // Handle Slow Motion powerup
                if (powerUps.slowMotion > 0) {
                    setPowerUps(p => ({ ...p, slowMotion: p.slowMotion - 1 }));
                    return prev; // Don't decrease time while slow motion is active
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, powerUps.slowMotion]);

    const startGame = (diff) => {
        setDifficulty(diff);
        setGameState('playing');
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setHealth(100);
        setStreak(0);
        setPowerUps({ shield: false, slowMotion: 0 });
        setConsoleLogs(["Initializing debugger...", `Difficulty set to ${diff}`, "Scanning for anomalies..."]);
        loadNextSnippet(diff);
    };

    const endGame = () => {
        setGameState('game_over');
        dispatch(updateArcadeStats({ points: score, gameId: 'hunter' }));

        // Update Local Leaderboard
        const newLeaderboard = [...leaderboard, { score, difficulty, date: new Date().toLocaleDateString() }]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        setLeaderboard(newLeaderboard);
        localStorage.setItem('bugHunter_leaderboard', JSON.stringify(newLeaderboard));

        if (score > 500) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#10b981', '#f43f5e']
            });
        }
    };

    const loadNextSnippet = (diff = difficulty) => {
        const pool = SNIPPETS[diff];
        const randomSnippet = pool[Math.floor(Math.random() * pool.length)];
        setActiveSnippet({ ...randomSnippet, key: Math.random() });
        setFeedback(null);
        setConsoleLogs(prev => [
            ...prev,
            `> Found potential ${randomSnippet.type} at line ${randomSnippet.bugLine}`,
            `> RUNNING TEST: ${randomSnippet.testInput}`,
            `> OUTPUT: ${randomSnippet.testOutput}`
        ].slice(-6));
    };

    const handleAnswer = (index) => {
        if (feedback) return;
        const isCorrect = index === activeSnippet.correct;

        if (isCorrect) {
            const points = 100 * DIFFICULTIES[difficulty].scoreMultiplier + (streak * 10);
            setScore(s => Math.floor(s + points));
            setStreak(s => s + 1);
            setFeedback({ message: 'SQUASHED!', type: 'success' });
            setConsoleLogs(prev => [...prev, `> FIX APPLIED: ${activeSnippet.options[index]}`, `> TEST PASSED!`].slice(-6));

            // Chance for Power-up drop on high streak
            if (streak > 0 && streak % 5 === 0) {
                const roll = Math.random();
                if (roll > 0.5) {
                    setPowerUps(p => ({ ...p, shield: true }));
                    toast.success("SYSTEM SHIELD ACTIVATED", { icon: '🛡️', style: { background: '#1e293b', color: '#fff', border: '1px solid #06b6d4' } });
                } else {
                    setPowerUps(p => ({ ...p, slowMotion: p.slowMotion + 5 }));
                    toast.success("TIME DILATION ACTIVE", { icon: '⏳', style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981' } });
                }
            }

            if ((streak + 1) % 3 === 0) {
                setTimeLeft(t => Math.min(t + 5, GAME_DURATION));
            }

            setTimeout(() => loadNextSnippet(), 800);
        } else {
            if (powerUps.shield) {
                setPowerUps(p => ({ ...p, shield: false }));
                setFeedback({ message: 'SHIELD BLOCKED!', type: 'shield' });
                toast.error("SHIELD BREACHED", { icon: '🛡️' });
            } else {
                setHealth(h => {
                    const newHealth = h - 25;
                    if (newHealth <= 0) endGame();
                    return Math.max(0, newHealth);
                });
                setFeedback({ message: 'CORE FAILURE!', type: 'error' });
                setConsoleLogs(prev => [...prev, `> ERROR: Illegal mutation at ${activeSnippet.id}`, `> FATAL ERROR: Deployment failed`].slice(-6));
            }

            setStreak(0);
            setTimeLeft(t => Math.max(0, t - DIFFICULTIES[difficulty].timePenalty));

            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.classList.add('animate-shake');
                setTimeout(() => gameContainer.classList.remove('animate-shake'), 500);
            }

            setTimeout(() => loadNextSnippet(), 1000);
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto min-h-[650px] relative bg-[#020617] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.1)] font-mono selection:bg-cyan-500/40">
            {/* VINTAGE CRT EFFECTS */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] scanlines" />
            <div className="absolute inset-0 pointer-events-none z-50 vignette" />

            {/* HUD HEADER */}
            <div className="relative z-10 bg-slate-900/90 backdrop-blur-xl border-b border-cyan-500/20 p-5 flex justify-between items-center overflow-hidden">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-cyan-500 uppercase tracking-[0.2em] font-black">USER_SCORE</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">{score.toLocaleString()}</span>
                            <span className="text-xs text-cyan-500/50">XP</span>
                        </div>
                    </div>

                    <div className="h-10 w-[1px] bg-white/10" />

                    <div className="flex flex-col">
                        <span className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] font-black">COMBO_LINK</span>
                        <div className="flex items-center gap-2">
                            <div className={`text-xl font-bold ${streak > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
                                {streak}x
                            </div>
                            {streak >= 5 && <Zap size={16} className="text-yellow-400 animate-bounce fill-yellow-400" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* SYSTEMS STATUS */}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-rose-500 uppercase tracking-[0.2em] font-black mb-1">CORE_INTEGRITY</span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`h-4 w-6 rounded-sm border transition-all duration-500 ${health > i * 25 ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-800 border-slate-700'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* TIMER CHIP */}
                    <div className={`relative px-6 py-2 rounded-lg border-2 flex items-center gap-3 transition-colors ${timeLeft < 10 ? 'border-rose-500/50 bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'}`}>
                        <Clock size={20} className={timeLeft < 10 ? 'animate-pulse' : ''} />
                        <span className="text-2xl font-black tabular-nums">{timeLeft}s</span>
                        {powerUps.slowMotion > 0 && (
                            <div className="absolute -top-3 -right-3 bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold animate-pulse">
                                SLOW_{powerUps.slowMotion}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN INTERFACE */}
            <div id="game-container" className="relative z-10 grid grid-cols-1 lg:grid-cols-4 h-[550px]">

                {/* LEFT: CONSOLE / STATUS */}
                <div className="hidden lg:flex flex-col border-r border-white/5 bg-slate-950/50 p-4 font-mono text-[11px] overflow-hidden">
                    <div className="mb-4 flex items-center justify-between opacity-50">
                        <span className="flex items-center gap-2"><Cpu size={12} /> SYSTEM_MONITOR</span>
                        <span className="animate-pulse">● LIVE</span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden italic text-slate-400">
                        {consoleLogs.map((log, i) => (
                            <div key={i} className={`flex gap-2 ${log.includes('PASSED') ? 'text-emerald-400' : log.includes('ERROR') ? 'text-rose-400' : ''}`}>
                                <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-slate-500">
                            <span>Powerups</span>
                        </div>
                        <div className="flex gap-2">
                            <div className={`p-2 rounded border ${powerUps.shield ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 bg-slate-900/50 text-slate-700'}`}>
                                <Shield size={16} fill={powerUps.shield ? "currentColor" : "none"} />
                            </div>
                            <div className={`p-2 rounded border ${powerUps.slowMotion > 0 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-700'}`}>
                                <Activity size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: PRIMARY WORKSTATION */}
                <div className="lg:col-span-3 p-6 flex flex-col items-center justify-center relative">

                    {gameState === 'menu' && (
                        <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500">
                            <div className="space-y-4">
                                <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    BUG<span className="text-cyan-500">_HUNTER</span>
                                </h1>
                                <p className="text-slate-400 text-sm tracking-widest uppercase">Global_Debugging_Interface_v2.4.0</p>
                            </div>

                            <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                {Object.keys(DIFFICULTIES).map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => startGame(diff)}
                                        className="group relative px-8 py-5 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-cyan-500 hover:bg-cyan-500/10 transition-all text-left flex items-center justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em]">{DIFFICULTIES[diff].label}</span>
                                            <span className="text-lg font-black text-slate-200 group-hover:text-cyan-400 uppercase tracking-wide">{diff}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-cyan-500/50 select-none">x{DIFFICULTIES[diff].scoreMultiplier} XP</span>
                                            <ChevronRight className="text-slate-700 group-hover:text-cyan-500 transition-colors" size={20} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {leaderboard.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/5 max-w-xs mx-auto text-left">
                                    <span className="text-[10px] text-slate-600 font-black tracking-[0.3em] uppercase mb-3 block text-center">LOCAL_TOP_AGENTS</span>
                                    <div className="space-y-2">
                                        {leaderboard.map((entry, i) => (
                                            <div key={i} className="flex justify-between items-center text-[11px]">
                                                <span className="text-slate-500">{i + 1}. {entry.difficulty}</span>
                                                <span className="text-cyan-500 font-bold">{entry.score} XP</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {gameState === 'playing' && activeSnippet && (
                        <div className="w-full max-w-2xl space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                            {/* CODE DECK */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                    {/* TERMINAL HEADER */}
                                    <div className="bg-slate-900/80 px-5 py-3 flex items-center gap-3 border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold tracking-widest lowercase">./{activeSnippet.type.replace(' ', '_').toLowerCase()}.sh</span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <Database size={12} className="text-cyan-500" />
                                            <span className="text-[10px] text-cyan-500/70 font-black">MEM_ACCESS</span>
                                        </div>
                                    </div>

                                    {/* CORE SOURCE */}
                                    <div className="p-8 font-mono text-[13px] leading-relaxed relative min-h-[200px]">
                                        {feedback && (
                                            <div className={`absolute inset-0 flex items-center justify-center z-20 backdrop-blur-md transition-all duration-300 ${feedback.type === 'success' ? 'bg-emerald-500/10' : feedback.type === 'shield' ? 'bg-cyan-500/10' : 'bg-rose-500/10'} animate-in fade-in`}>
                                                <div className={`text-5xl font-black italic tracking-tighter uppercase transform -rotate-3 drop-shadow-2xl ${feedback.type === 'success' ? 'text-emerald-400' : feedback.type === 'shield' ? 'text-cyan-400' : 'text-rose-500'}`}>
                                                    {feedback.message}
                                                </div>
                                            </div>
                                        )}

                                        <pre className="text-slate-400">
                                            {activeSnippet.code.split('\n').map((line, i) => (
                                                <div key={i} className={`flex transition-all duration-500 ${i + 1 === activeSnippet.bugLine ? 'bg-rose-500/5 text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : ''}`}>
                                                    <span className="w-10 text-slate-700 select-none mr-6 text-right font-bold italic">{String(i + 1).padStart(2, '0')}</span>
                                                    <code className="whitespace-pre-wrap">{line}</code>
                                                </div>
                                            ))}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* HOTKEYS / ACTIONS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {activeSnippet.options.map((option, idx) => (
                                    <button
                                        key={activeSnippet.key + idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={!!feedback}
                                        className="relative group flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-cyan-500 hover:bg-cyan-500/5 transition-all text-left animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded group-hover:bg-cyan-500 group-hover:text-black transition-colors">FIX_0{idx + 1}</span>
                                            <Play size={10} className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <code className="text-xs text-slate-300 group-hover:text-white leading-relaxed">{option}</code>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState === 'game_over' && (
                        <div className="text-center animate-in scale-in duration-500 py-10">
                            <div className="relative inline-block mb-10">
                                <div className="absolute inset-0 bg-cyan-500/30 blur-[60px] animate-pulse"></div>
                                <div className="relative bg-slate-950 p-8 rounded-full border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                                    <Trophy size={60} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                                </div>
                            </div>

                            <div className="space-y-2 mb-10">
                                <h2 className="text-sm text-slate-500 font-bold tracking-[0.4em] uppercase">Session_Terminated</h2>
                                <h1 className="text-7xl font-black text-white tracking-widest tabular-nums drop-shadow-2xl">
                                    {score}
                                </h1>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-12">
                                <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1 block">PROTOCOL</span>
                                    <div className="text-xl font-black text-cyan-400 uppercase tracking-wide">{difficulty}</div>
                                </div>
                                <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1 block">BEST_COMBO</span>
                                    <div className="text-xl font-black text-yellow-500 tabular-nums">MAX_LINK</div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setGameState('menu')}
                                    className="bg-white hover:bg-cyan-400 text-black font-black py-4 px-10 rounded-xl transition-all hover:scale-105 shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
                                >
                                    REINITIALIZE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DECORATIVE FOOTER */}
            <div className="h-2 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="bg-slate-950 px-6 py-2 flex justify-between items-center text-[9px] text-slate-700 font-black tracking-widest uppercase">
                <span>SYSTEM_STATUS: NOMINAL</span>
                <span className="flex items-center gap-4">
                    <span>DPI_LOCK: ENABLED</span>
                    <span className="text-cyan-900">ARCADE_STATION_NX4</span>
                </span>
            </div>

            {/* CSS ANIMATIONS & CRT EFFECTS */}
            <style jsx>{`
                .scanlines {
                    background: linear-gradient(
                        rgba(18, 16, 16, 0) 50%,
                        rgba(0, 0, 0, 0.25) 50%
                    ), linear-gradient(
                        90deg,
                        rgba(255, 0, 0, 0.06),
                        rgba(0, 255, 0, 0.02),
                        rgba(0, 0, 255, 0.06)
                    );
                    background-size: 100% 2px, 3px 100%;
                }
                .vignette {
                    background: radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 150%);
                }
                .grid-bg {
                    background-image: 
                        linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};

export default BugHunter;
