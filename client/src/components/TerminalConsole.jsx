import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Cpu, Database, ShieldAlert } from 'lucide-react';

const TerminalConsole = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { type: 'system', content: '📡 SC_ARCHIVE_TERMINAL v4.0.2 [Protocol: SECURE]' },
        { type: 'system', content: 'System Pulse: 🟢 STABLE' },
        { type: 'system', content: 'Type "help" to list available intelligence modules.' },
        { type: 'system', content: ' ' },
    ]);
    const { notes } = useSelector((state) => state.notes);
    const { user } = useSelector((state) => state.auth);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (cmd) => {
        const fullHistory = [...history, { type: 'input', content: `> ${cmd}` }];
        const parts = cmd.trim().toLowerCase().split(' ');
        const base = parts[0];
        const arg = parts.slice(1).join(' ');

        let output = [];

        switch (base) {
            case 'help':
                output = [
                    'AVAILABLE SIGNAL PROTOCOLS:',
                    '  ls            - Scan neural library nodes (list notes)',
                    '  cat [id/title] - Access raw data stream (view note details)',
                    '  cd [folder]   - Shift focus directory',
                    '  whoami        - Display current operator signature',
                    '  clear         - Wipe terminal buffer',
                    '  exit/quit     - Sever terminal connection',
                    '  goto [path]   - Force navigate to sector',
                    '  sysinfo       - Display system architecture specs',
                ];
                break;
            case 'ls':
                if (notes && notes.length > 0) {
                    output = notes.map(n => `[${n._id.substring(0, 8)}]  ${n.title} (${n.type || 'RAW'})`);
                } else {
                    output = ['Intelligence database empty. No nodes detected.'];
                }
                break;
            case 'cat':
                if (!arg) {
                    output = ['CRITICAL ERROR: No target node ID specified.'];
                } else {
                    const found = notes.find(n => n.title.toLowerCase().includes(arg) || n._id.includes(arg));
                    if (found) {
                        output = [
                            `NODE: ${found.title}`,
                            `TYPE: ${found.type || 'RAW'}`,
                            `CREATED: ${new Date(found.createdAt).toLocaleString()}`,
                            '--- CONTENT STREAM ---',
                            found.content.substring(0, 500) + (found.content.length > 500 ? '...' : ''),
                            '--- END STREAM ---',
                            `Redirecting to node details in 2s...`
                        ];
                        setTimeout(() => {
                            navigate(`/notes/${found._id}`);
                            onClose();
                        }, 2000);
                    } else {
                        output = [`NODE NOT FOUND: "${arg}" not detected in active matrix.`];
                    }
                }
                break;
            case 'whoami':
                output = [`OPERATOR: ${user?.username || 'GUEST_ARCHITECT'}`, `SIGNATURE: ${user?.email || 'OFFLINE'}`, `RANK: ${user?.role === 'admin' ? 'ROOT_PROTOCOL' : 'STANDARD_PROTOCOL'}`];
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'goto':
                if (arg) {
                    output = [`Executing sector jump to: /${arg}...`];
                    setTimeout(() => {
                        navigate(`/${arg}`);
                        onClose();
                    }, 500);
                } else {
                    output = ['Sector coordinates missing. Usage: goto [dashboard|notes|community|playground]'];
                }
                break;
            case 'sysinfo':
                output = [
                    'SC-ARCHIVE NEURAL CORE v1.0.1',
                    'KERNEL: MERN_STACK_PROTOCOL',
                    'AI_ENGINE: GEMINI_1.5_FLASH',
                    'MEMORY: REDUX_TOOLKIT_SYNC',
                    'UPLOADER: CLOUDINARY_PIPELINE'
                ];
                break;
            case 'exit':
            case 'quit':
                onClose();
                return;
            case '':
                break;
            default:
                output = [`COMMAND NOT RECOGNIZED: "${base}". Send "help" for valid signals.`];
        }

        setHistory([...fullHistory, ...output.map(o => ({ type: 'system', content: o }))]);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 pointer-events-none"
            >
                <div
                    className="w-full h-full max-w-5xl bg-zinc-950 border border-green-900/40 rounded-lg shadow-[0_0_50px_rgba(0,50,0,0.3)] flex flex-col pointer-events-auto overflow-hidden relative"
                >
                    {/* CRT Scanline Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-10" />
                    <div className="absolute inset-0 pointer-events-none bg-green-900/5 z-0 animate-pulse" />

                    {/* Terminal Header */}
                    <div className="bg-zinc-900/80 border-b border-green-900/20 px-4 py-3 flex items-center justify-between z-20">
                        <div className="flex items-center gap-3">
                            <Cpu size={14} className="text-green-500 animate-pulse" />
                            <span className="text-[11px] font-black text-green-500 uppercase tracking-[0.2em]">Neural_Console_v4.0.2</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-green-500 transition-all">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-[12px] md:text-[14px] leading-relaxed selection:bg-green-500 selection:text-black z-20 custom-scrollbar"
                    >
                        {history.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.type === 'input' ? 'text-green-400 font-bold' : log.type === 'system' ? 'text-green-600/80' : 'text-zinc-500'}`}>
                                {log.content}
                            </div>
                        ))}
                    </div>

                    {/* Command Input Area */}
                    <div className="p-4 bg-zinc-900/30 border-t border-green-900/10 flex items-center gap-4 z-20">
                        <span className="text-green-500 font-black tracking-widest animate-pulse">#_</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommand(input);
                                if (e.key === 'Escape') onClose();
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono caret-green-500 text-[14px]"
                            placeholder="Awaiting operator signal..."
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TerminalConsole;
