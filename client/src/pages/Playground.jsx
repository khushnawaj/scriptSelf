import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Trash2, Terminal as TerminalIcon, Eraser, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Playground = () => {
    const { theme } = useTheme();

    const TEMPLATE = `// JavaScript Playground
console.log("Hello, ScriptShelf Dev!");

function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(5, 10);
console.log("Result:", result);

// Async example
setTimeout(() => {
    console.log("Async log successfully captured!");
}, 500);`;

    const [code, setCode] = useState(TEMPLATE);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const outputRef = useRef(null);
    const editorRef = useRef(null);

    // Auto-scroll output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // Force layout update on resize (fixes Zen mode transition)
    useEffect(() => {
        const handleResize = () => {
            if (editorRef.current) {
                editorRef.current.layout();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const addLog = (type, content) => {
        setOutput(prev => [...prev, { type, content, timestamp: new Date().toLocaleTimeString() }]);
    };

    // Sandbox Iframe Logic
    const runCode = async () => {
        setIsRunning(true);
        setOutput([]);

        const sandboxSource = `
            <!DOCTYPE html>
            <html>
                <head>
                    <script>
                        const originalLog = console.log;
                        const originalError = console.error;
                        const originalWarn = console.warn;

                        const addLog = (type, args) => {
                            parent.postMessage({
                                type: 'PLAYGROUND_LOG',
                                logType: type,
                                content: args.map(a => {
                                    try {
                                        return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
                                    } catch(e) {
                                        return String(a);
                                    }
                                }).join(' ')
                            }, '*');
                        };

                        console.log = (...args) => {
                            originalLog(...args);
                            addLog('log', args);
                        };
                        console.error = (...args) => {
                            originalError(...args);
                            addLog('error', args);
                        };
                        console.warn = (...args) => {
                            originalWarn(...args);
                            addLog('warn', args);
                        };

                        window.onerror = (message, source, lineno, colno, error) => {
                            addLog('error', [message]);
                        };

                        window.addEventListener('message', async (event) => {
                            const { code } = event.data;
                            try {
                                const run = new Function("return (async () => { " + code + " })()");
                                await run();
                            } catch (err) {
                                console.error(err.toString());
                            } finally {
                                parent.postMessage({ type: 'PLAYGROUND_DONE' }, '*');
                            }
                        });
                    <\/script>
                </head>
                <body></body>
            </html>
        `;

        // Create temporary iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.sandbox = 'allow-scripts';
        document.body.appendChild(iframe);

        const handleMessage = (event) => {
            if (event.data.type === 'PLAYGROUND_LOG') {
                addLog(event.data.logType, event.data.content);
            }
            if (event.data.type === 'PLAYGROUND_DONE') {
                setIsRunning(false);
                window.removeEventListener('message', handleMessage);
                document.body.removeChild(iframe);
            }
        };

        window.addEventListener('message', handleMessage);

        const blob = new Blob([sandboxSource], { type: 'text/html' });
        iframe.src = URL.createObjectURL(blob);

        iframe.onload = () => {
            iframe.contentWindow.postMessage({ code }, '*');
        };

        // Safety timeout
        setTimeout(() => {
            if (isRunning) {
                setIsRunning(false);
                window.removeEventListener('message', handleMessage);
                if (document.body.contains(iframe)) document.body.removeChild(iframe);
            }
        }, 5000);
    };

    const clearOutput = () => setOutput([]);

    return (
        <div className="h-full flex flex-col bg-background text-foreground animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TerminalIcon className="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-tight text-foreground">Playground</h1>
                        <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">Live JS Environment</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={clearOutput}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        title="Clear console"
                    >
                        <Eraser size={14} /> <span className="hidden sm:inline">Clear</span>
                    </button>
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <PlayCircle size={15} className={isRunning ? "animate-pulse" : "fill-current"} />
                        <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run Code'}</span>
                        <span className="inline sm:hidden">{isRunning ? '...' : 'Run'}</span>
                    </button>
                </div>
            </div>

            {/* Main Split View - Responsive: Column on Mobile, Row on Desktop */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Editor Pane */}
                <div className="flex-1 min-w-0 border-b md:border-b-0 md:border-r border-border relative h-[50%] md:h-full min-h-[300px]">
                    <Editor
                        height="100%"
                        language="javascript"
                        theme={theme === 'dark' ? "vs-dark" : "light"}
                        value={code}
                        onChange={(value) => setCode(value)}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            padding: { top: 20, bottom: 20 },
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontLigatures: true,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            wordWrap: 'on', // Better for mobile
                        }}
                    />
                </div>

                {/* Output Pane */}
                <div className={`w-full md:w-[35%] md:min-w-[300px] h-[50%] md:h-full shrink-0 flex flex-col border-t md:border-t-0 md:border-l shadow-2xl z-10 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0d1117] border-white/5' : 'bg-secondary/30 border-border'
                    }`}>
                    <div className={`h-10 shrink-0 border-b flex items-center justify-between px-4 ${theme === 'dark' ? 'bg-[#161b22] border-white/5' : 'bg-muted border-border'
                        }`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Console Output</span>
                        <div className="flex gap-1.5 grayscale opacity-50">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                    </div>

                    <div
                        ref={outputRef}
                        className={`flex-1 overflow-auto p-4 font-mono text-[11px] space-y-1.5 scrollbar-thin ${theme === 'dark' ? 'scrollbar-thumb-white/10' : 'scrollbar-thumb-black/10'
                            } scrollbar-track-transparent`}
                    >
                        {output.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/20 gap-2">
                                <TerminalIcon size={32} strokeWidth={1.5} />
                                <span className="font-medium text-[10px] tracking-tight">Ready to execute...</span>
                            </div>
                        ) : (
                            output.map((log, i) => (
                                <div key={i} className={`flex gap-2 group p-1.5 rounded transition-all break-words ${log.type === 'error' ? 'text-red-500 bg-red-500/5' :
                                        log.type === 'warn' ? 'text-yellow-600 bg-yellow-500/5' :
                                            theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'
                                    }`}>
                                    <span className="opacity-30 select-none w-14 shrink-0 font-light text-[9px] pt-0.5 hidden sm:block">{log.timestamp}</span>
                                    <pre className="whitespace-pre-wrap font-inherit break-all flex-1">{log.content}</pre>
                                </div>
                            ))
                        )}
                        <div className="h-4" /> {/* Spacer */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;
