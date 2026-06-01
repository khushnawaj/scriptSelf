import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Eraser, PlayCircle, Loader2, Save, FolderPlus, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

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

    const [searchParams] = useSearchParams();
    const noteId = searchParams.get('id');

    const [code, setCode] = useState(TEMPLATE);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    
    // Save Modal States
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [fileName, setFileName] = useState('My Script');
    const [isPublic, setIsPublic] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [folders, setFolders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // New folder creation inline
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolderLoading, setIsCreatingFolderLoading] = useState(false);

    // Fetch initial code if noteId is present
    useEffect(() => {
        if (noteId) {
            api.get(`/notes/${noteId}`)
                .then(res => {
                    if (res.data.success) {
                        const note = res.data.data;
                        setCode(note.codeSnippet || note.content || TEMPLATE);
                        setFileName(note.title);
                        if (note.category) setSelectedCategory(note.category._id || note.category);
                        if (note.folder) setSelectedFolder(note.folder._id || note.folder);
                        setIsPublic(note.isPublic);
                    }
                })
                .catch(() => toast.error('Failed to load saved script'));
        }
    }, [noteId]);

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

    const handleOpenSaveModal = async () => {
        setIsSaveModalOpen(true);
        setIsCreatingFolder(false);
        setNewFolderName('');
        try {
            const [foldersRes, categoriesRes] = await Promise.all([
                api.get('/folders'),
                api.get('/categories')
            ]);
            setFolders(foldersRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
            if (categoriesRes.data.data?.length > 0 && !selectedCategory) {
                setSelectedCategory(categoriesRes.data.data[0]._id);
            }
        } catch (error) {
            toast.error('Failed to load directories/categories');
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreatingFolderLoading(true);
        try {
            const res = await api.post('/folders', { name: newFolderName.trim() });
            if (res.data.success) {
                const created = res.data.data;
                setFolders(prev => [...prev, created]);
                setSelectedFolder(created._id);
                setNewFolderName('');
                setIsCreatingFolder(false);
                toast.success(`Folder "${created.name}" created!`);
            }
        } catch (e) {
            toast.error('Failed to create folder');
        } finally {
            setIsCreatingFolderLoading(false);
        }
    };

    const handleSaveScript = async () => {
        if (!fileName.trim()) return toast.error('Please enter a file name');
        if (!selectedCategory) return toast.error('Please select a category');

        setIsSaving(true);
        try {
            let folderId = selectedFolder;

            // Automatically create folder if user typed a name but didn't click "Create" button first
            if (isCreatingFolder && newFolderName.trim()) {
                const folderRes = await api.post('/folders', { name: newFolderName.trim() });
                if (folderRes.data.success) {
                    const created = folderRes.data.data;
                    folderId = created._id;
                    setFolders(prev => [...prev, created]);
                    setSelectedFolder(created._id);
                    setNewFolderName('');
                    setIsCreatingFolder(false);
                    toast.success(`Folder "${created.name}" created!`);
                }
            }

            await api.post('/notes', {
                title: fileName,
                content: `// Playground Snippet: ${fileName}\n\n${code}`,
                codeSnippet: code,
                type: 'code',
                isPublic,
                folder: folderId || null,
                category: selectedCategory
            });
            toast.success('Script saved successfully!');
            setIsSaveModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save script');
        } finally {
            setIsSaving(false);
        }
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
        <div className="h-full flex flex-col bg-background text-foreground animate-in fade-in duration-1000 overflow-hidden">
            {/* Header / Command Strip */}
            <div className="h-16 shrink-0 border-b border-border/50 flex items-center justify-between px-6 bg-card/20 backdrop-blur-3xl relative overflow-hidden">
                
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-primary shadow-2xl shadow-primary/20 rounded-xl border border-white/10">
                        <TerminalIcon className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-[10px]  tracking-[0.4em] text-foreground leading-none mb-1">Code Playground</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <p className="text-[9px] font-bold  tracking-[0.2em] text-muted-foreground/60">System Ready // Status: Idle</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={handleOpenSaveModal}
                        className="h-10 px-4 text-[9px] font-bold tracking-[0.2em] text-muted-foreground hover:text-primary transition-all flex items-center gap-2 bg-background/30 border border-border/50 rounded-xl"
                        title="Save script"
                    >
                        <Save size={14} strokeWidth={3} /> <span className="hidden sm:inline">Save</span>
                    </button>
                    <button
                        onClick={clearOutput}
                        className="h-10 px-4 text-[9px] font-bold  tracking-[0.2em] text-muted-foreground hover:text-rose-500 transition-all flex items-center gap-2 bg-background/30 border border-border/50 rounded-xl"
                        title="Clear console"
                    >
                        <Eraser size={14} strokeWidth={3} /> <span className="hidden sm:inline">Clear Console</span>
                    </button>
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="h-10 px-6 bg-primary text-white text-[10px] font-bold  tracking-[0.3em] rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 group relative overflow-hidden"
                    >
                        
                        <PlayCircle size={16} strokeWidth={3} className={isRunning ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
                        <span>{isRunning ? 'RUNNING...' : 'Run Code'}</span>
                    </button>
                </div>
            </div>

            {/* Main Environment */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                

                {/* Editor Pane */}
                <div className="flex-1 min-w-0 border-b md:border-b-0 md:border-r border-border/50 relative h-[50%] md:h-full min-h-[300px] group">
                    <div className="absolute top-4 right-6 z-20 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                        <span className="text-[10px] font-bold  tracking-[0.4em] text-primary">SRC_MODULE</span>
                    </div>
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
                            padding: { top: 30, bottom: 30 },
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontLigatures: true,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            wordWrap: 'on',
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>

                {/* Output Pane */}
                <div className={`w-full md:w-[35%] md:min-w-[350px] h-[50%] md:h-full shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-border/50 shadow-2xl z-10 transition-all duration-700 ${
                    theme === 'dark' ? 'bg-card/20 backdrop-blur-3xl' : 'bg-secondary/30'
                }`}>
                    <div className="h-12 shrink-0 border-b border-border/50 flex items-center justify-between px-6 bg-background/40 relative">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary  shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                            <span className="text-[10px] font-bold  tracking-[0.3em] text-foreground">Output Console</span>
                        </div>
                        <div className="flex gap-2 opacity-30">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />)}
                        </div>
                    </div>

                    <div
                        ref={outputRef}
                        className="flex-1 overflow-auto p-6 font-mono text-[12px] space-y-3 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent"
                    >
                        {output.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/20 gap-4 opacity-50">
                                <div className="p-5 bg-background/50 rounded-2xl border border-border/50">
                                    <TerminalIcon size={40} strokeWidth={1} />
                                </div>
                                <span className="font-bold text-[10px] tracking-[0.4em] ">Waiting for input</span>
                            </div>
                        ) : (
                            output.map((log, i) => (
                                <div key={i} className={`flex gap-4 group p-4 rounded-2xl transition-all relative overflow-hidden border ${
                                    log.type === 'error' ? 'text-rose-500 bg-rose-500/5 border-rose-500/20' :
                                    log.type === 'warn' ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' :
                                    'text-foreground/80 bg-background/40 border-border/50 hover:border-primary/30'
                                }`}>
                                    
                                    <span className="opacity-30 select-none w-16 shrink-0 font-bold text-[9px] pt-1 hidden lg:block tracking-tighter">{log.timestamp}</span>
                                    <pre className="whitespace-pre-wrap font-inherit break-all flex-1 relative z-10 leading-relaxed italic">{log.content}</pre>
                                </div>
                            ))
                        )}
                        <div className="h-6" />
                    </div>
                </div>
            </div>

            {/* Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-background border border-border/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button 
                            onClick={() => setIsSaveModalOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Save className="text-primary" size={24} />
                            Save Script
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold tracking-widest text-muted-foreground mb-2">FILE NAME</label>
                                <input 
                                    type="text" 
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="Enter file name..."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold tracking-widest text-muted-foreground">DIRECTORY</label>
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreatingFolder(!isCreatingFolder); setNewFolderName(''); }}
                                        className="text-[10px] font-bold tracking-widest text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                                    >
                                        <FolderPlus size={12} />
                                        {isCreatingFolder ? 'Cancel' : 'New Folder'}
                                    </button>
                                </div>

                                {isCreatingFolder ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setIsCreatingFolder(false); }}
                                            placeholder="Folder name..."
                                            autoFocus
                                            className="flex-1 bg-secondary/50 border border-primary/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateFolder}
                                            disabled={isCreatingFolderLoading || !newFolderName.trim()}
                                            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {isCreatingFolderLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                            Create
                                        </button>
                                    </div>
                                ) : (
                                    <select 
                                        value={selectedFolder}
                                        onChange={(e) => setSelectedFolder(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    >
                                        <option value="">Root Directory (no folder)</option>
                                        {folders.map(f => (
                                            <option key={f._id} value={f._id}>{f.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-muted-foreground mb-2">CATEGORY</label>
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm appearance-none"
                                >
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-muted-foreground mb-2">VISIBILITY</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={!isPublic}
                                            onChange={() => setIsPublic(false)}
                                            className="text-primary focus:ring-primary h-4 w-4"
                                        />
                                        <span className="text-sm">Private</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={isPublic}
                                            onChange={() => setIsPublic(true)}
                                            className="text-primary focus:ring-primary h-4 w-4"
                                        />
                                        <span className="text-sm">Public</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsSaveModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-border/50 text-sm font-semibold hover:bg-secondary/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveScript}
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Script'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playground;
