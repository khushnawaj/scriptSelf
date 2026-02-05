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
        <div className="w-full h-[600px] lg:h-[82vh] min-h-[550px] relative bg-slate-50 dark:bg-[#020617] rounded-3xl overflow-hidden border border-border dark:border-cyan-500/30 shadow-xl dark:shadow-[0_0_80px_rgba(6,182,212,0.15)] font-mono selection:bg-cyan-500/40 flex flex-col transition-all duration-500">
            {/* VINTAGE CRT EFFECTS */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] scanlines" />
            <div className="absolute inset-0 pointer-events-none z-50 vignette" />

            {/* HUD HEADER */}
            <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-border dark:border-cyan-500/20 shrink-0">
                <div className="max-w-[1400px] mx-auto p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-8">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.3em] font-black opacity-60 text-center sm:text-left">XP</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl sm:text-3xl font-black text-foreground dark:text-white tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(6,182,212,0.4)] dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">{score.toLocaleString()}</span>
                                <span className="text-[8px] text-cyan-600 dark:text-cyan-500 font-bold opacity-30 uppercase">nodes</span>
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-white/5 hidden sm:block" />

                        <div className="flex flex-col">
                            <span className="text-[7px] text-yellow-500 uppercase tracking-[0.3em] font-black opacity-60 text-center sm:text-left">COMBO</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`text-lg sm:text-2xl font-black ${streak > 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-700'}`}>
                                    {streak}x
                                </div>
                                {streak >= 5 && <Zap size={14} className="text-yellow-400 animate-pulse fill-yellow-400" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-10">
                        {/* SYSTEMS STATUS */}
                        <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[7px] text-rose-500 uppercase tracking-[0.3em] font-black opacity-60 mb-1 text-center sm:text-right">INTEGRITY</span>
                            <div className="flex gap-1 pt-0.5">
                                {[0, 1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`h-2 w-4 sm:h-3 sm:w-6 rounded-[1px] border transition-all duration-700 ${health > i * 25 ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-900 border-slate-800'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* TIMER CHIP */}
                        <div className={`relative px-4 py-1.5 sm:py-2 min-w-[80px] sm:min-w-[100px] rounded-lg border flex items-center justify-center gap-2 transition-all duration-300 ${timeLeft < 10 ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105' : 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400'}`}>
                            <Clock size={16} className={timeLeft < 10 ? 'animate-pulse' : ''} />
                            <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter">{timeLeft}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN INTERFACE */}
            <div id="game-container" className="relative z-10 grid grid-cols-1 lg:grid-cols-4 flex-1 overflow-hidden">

                {/* LEFT: CONSOLE / STATUS */}
                <div className="hidden lg:flex flex-col border-r border-border dark:border-white/5 bg-slate-100/30 dark:bg-slate-950/50 p-4 font-mono text-[10px] overflow-hidden">
                    <div className="mb-3 flex items-center justify-between opacity-40">
                        <span className="flex items-center gap-2 tracking-widest"><Cpu size={10} /> SYS_MON</span>
                        <span className="animate-pulse">● LIVE</span>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-hidden italic text-slate-500">
                        {consoleLogs.map((log, i) => (
                            <div key={i} className={`flex gap-2 ${log.includes('PASSED') ? 'text-emerald-500' : log.includes('ERROR') ? 'text-rose-400' : ''}`}>
                                <span className="opacity-20">[{new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' })}]</span>
                                <span className="truncate">{log}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
                        <div className="flex gap-2">
                            <div className={`p-1.5 rounded border ${powerUps.shield ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 bg-slate-900/50 text-slate-700'}`}>
                                <Shield size={14} fill={powerUps.shield ? "currentColor" : "none"} />
                            </div>
                            <div className={`p-1.5 rounded border ${powerUps.slowMotion > 0 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-700'}`}>
                                <Activity size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: PRIMARY WORKSTATION */}
                <div className="lg:col-span-3 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-y-auto no-scrollbar">

                    {gameState === 'menu' && (
                        <div className="text-center space-y-6 sm:space-y-10 animate-in fade-in zoom-in duration-500 w-full max-w-lg">
                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground dark:text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    BUG<span className="text-cyan-500">_HUNTER</span>
                                </h1>
                                <p className="text-muted-foreground text-[9px] tracking-[0.4em] uppercase font-black">Global_Debug_Interface_v2.4</p>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                {Object.keys(DIFFICULTIES).map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => startGame(diff)}
                                        className="group relative px-6 py-3.5 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-cyan-500 hover:bg-cyan-500/10 transition-all text-left flex items-center justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-slate-500 font-black tracking-[0.2em]">{DIFFICULTIES[diff].label}</span>
                                            <span className="text-sm sm:text-base font-black text-slate-300 group-hover:text-cyan-400 uppercase tracking-wide">{diff}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-cyan-500/40 font-black tracking-widest uppercase italic">x{DIFFICULTIES[diff].scoreMultiplier} XP</span>
                                            <ChevronRight className="text-slate-700 group-hover:text-cyan-500 transition-colors" size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {leaderboard.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 w-full text-left">
                                    <span className="text-[8px] text-slate-600 font-black tracking-[0.3em] uppercase mb-2 block text-center">LOCAL_TOP_AGENTS</span>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                        {leaderboard.map((entry, i) => (
                                            <div key={i} className="flex justify-between items-center text-[9px]">
                                                <span className="text-slate-500 uppercase">{i + 1}. {entry.difficulty}</span>
                                                <span className="text-cyan-500 font-bold">{entry.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {gameState === 'playing' && activeSnippet && (
                        <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-6 duration-500">
                            {/* CODE DECK */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl blur opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition duration-1000"></div>
                                <div className="relative bg-white dark:bg-[#070b18] border border-border dark:border-white/5 rounded-xl overflow-hidden shadow-2xl">
                                    {/* TERMINAL HEADER */}
                                    <div className="bg-slate-900/60 px-4 py-2 flex items-center gap-3 border-b border-white/5">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-black tracking-widest lowercase opacity-60">dev_source.js</span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className="text-[8px] text-cyan-500/60 font-black uppercase tracking-widest">LIVE_PROBE</span>
                                        </div>
                                    </div>

                                    {/* CORE SOURCE */}
                                    <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-[12px] leading-relaxed relative min-h-[150px] max-h-[300px] overflow-y-auto no-scrollbar">
                                        {feedback && (
                                            <div className={`absolute inset-0 flex items-center justify-center z-20 backdrop-blur-sm transition-all duration-300 ${feedback.type === 'success' ? 'bg-emerald-500/10' : feedback.type === 'shield' ? 'bg-cyan-500/10' : 'bg-rose-500/10'} animate-in fade-in`}>
                                                <div className={`text-3xl sm:text-5xl font-black italic tracking-tighter uppercase transform -rotate-3 drop-shadow-2xl ${feedback.type === 'success' ? 'text-emerald-400' : feedback.type === 'shield' ? 'text-cyan-400' : 'text-rose-500'}`}>
                                                    {feedback.message}
                                                </div>
                                            </div>
                                        )}

                                        <pre className="text-slate-600 dark:text-slate-400">
                                            {activeSnippet.code.split('\n').map((line, i) => (
                                                <div key={activeSnippet.key + i} className={`flex transition-all duration-500 ${i + 1 === activeSnippet.bugLine ? 'bg-rose-500/5 text-rose-600 dark:text-rose-300' : ''}`}>
                                                    <span className="w-8 text-slate-300 dark:text-slate-800 select-none mr-4 text-right font-bold italic opacity-40">{String(i + 1).padStart(2, '0')}</span>
                                                    <code className="whitespace-pre-wrap">{line}</code>
                                                </div>
                                            ))}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* HOTKEYS / ACTIONS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {activeSnippet.options.map((option, idx) => (
                                    <button
                                        key={activeSnippet.key + idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={!!feedback}
                                        className="relative group flex flex-col p-3 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-cyan-500 hover:bg-cyan-500/5 transition-all text-left animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[7px] font-black text-slate-500 bg-slate-800/50 px-1 py-0.5 rounded group-hover:bg-cyan-500 group-hover:text-black transition-colors uppercase">PROBE_{idx + 1}</span>
                                        </div>
                                        <code className="text-[10px] text-slate-400 group-hover:text-white leading-tight">{option}</code>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState === 'game_over' && (
                        <div className="text-center animate-in scale-in duration-500 py-6 w-full max-w-sm">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] animate-pulse"></div>
                                <div className="relative bg-slate-950 p-6 rounded-full border border-cyan-500/30 shadow-2xl">
                                    <Trophy size={40} className="text-cyan-400" />
                                </div>
                            </div>

                            <div className="space-y-1 mb-8">
                                <h2 className="text-[9px] text-slate-600 font-black tracking-[0.4em] uppercase">Session_End</h2>
                                <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                                    {score}
                                </h1>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                    <span className="text-[7px] text-slate-600 font-black tracking-widest uppercase block mb-1">DIFF</span>
                                    <div className="text-xs font-black text-cyan-400 uppercase">{difficulty}</div>
                                </div>
                                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                    <span className="text-[7px] text-slate-600 font-black tracking-widest uppercase block mb-1">STREAK</span>
                                    <div className="text-xs font-black text-yellow-500">{streak}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => setGameState('menu')}
                                className="w-full bg-white hover:bg-cyan-400 text-black font-black py-3.5 rounded-xl transition-all active:scale-95 uppercase text-xs tracking-[0.2em]"
                            >
                                REINITIALIZE
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* DECORATIVE FOOTER */}
            <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="bg-slate-950 px-4 py-1.5 flex justify-between items-center text-[7px] text-slate-800 font-black tracking-[0.3em] uppercase opacity-50">
                <span>SYS_NOMINAL</span>
                <span>ARCADE_STATION_NX4</span>
            </div>

            {/* CSS ANIMATIONS & CRT EFFECTS */}
            <style jsx>{`
                .scanlines {
                    background: linear-gradient(
                        rgba(18, 16, 16, 0) 50%,
                        rgba(0, 0, 0, 0.25) 50%
                    ), linear-gradient(
                        90deg,
                        rgba(255, 0, 0, 0.05),
                        rgba(0, 255, 0, 0.01),
                        rgba(0, 0, 255, 0.05)
                    );
                    background-size: 100% 2px, 3px 100%;
                }
                .vignette {
                    background: radial-gradient(circle, transparent 60%, rgba(0,0,0,0.8) 180%);
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
