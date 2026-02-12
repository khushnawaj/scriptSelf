import { useState, useEffect, useCallback } from "react";
import {
    Search, Hash, FileCode, ArrowRight, Command,
    Plus, HelpCircle, FileText, History, Terminal,
    User, Shield, LogOut, Moon, Sun, Monitor, Share2, Trophy, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from '../features/auth/authSlice';
import { useTheme } from "../context/ThemeContext";
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme, toggleTheme, saveDesignSystem, themeAssets } = useTheme();
    const { user } = useSelector((state) => state.auth);

    // Initialize Recent Items from localStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('recent_vault_items') || '[]');
        setRecentItems(saved);
    }, [isOpen]);

    const addToRecent = useCallback((item) => {
        const newItem = { id: item._id, title: item.title, category: item.category?.name || 'GENERIC', type: 'note' };
        const updated = [newItem, ...recentItems.filter(r => r.id !== item._id)].slice(0, 5);
        localStorage.setItem('recent_vault_items', JSON.stringify(updated));
    }, [recentItems]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const executeCommand = (cmd) => {
        const action = cmd.toLowerCase().trim();
        if (action === '/new') navigate('/notes/new');
        else if (action === '/profile') navigate('/profile');
        else if (action === '/admin') navigate('/admin');
        else if (action === '/network') navigate('/network');
        else if (action === '/levels') navigate('/levels');
        else if (action === '/explorers') navigate('/explorers');
        else if (action === '/logout') { dispatch(logout()); dispatch(reset()); navigate('/login'); }
        else if (action.startsWith('/theme ')) {
            const v = action.split(' ')[1];
            if (['v1', 'v2', 'v3', 'v4', 'v5'].includes(v)) saveDesignSystem(v);
        }
        else if (action === '/dark') if (theme !== 'dark') toggleTheme();
        else if (action === '/light') if (theme !== 'light') toggleTheme();

        setIsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) { setQuery(""); setResults([]); return; }
        if (query.startsWith('/')) return; // Don't search if in command mode

        const timer = setTimeout(async () => {
            if (!query.trim()) { setResults([]); return; }
            try {
                const { data } = await api.get(`/notes?search=${query}&public=true`);
                setResults(data.data.slice(0, 5));
            } catch (err) { console.error("Search error:", err); }
        }, 150);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const staticActions = [
        { icon: Plus, label: 'Create New Record', action: () => { navigate('/notes/new'); setIsOpen(false); }, cmd: '/new' },
        { icon: Users, label: 'Explore Users', action: () => { navigate('/explorers'); setIsOpen(false); }, cmd: '/explorers' },
        { icon: User, label: 'Manage Profile', action: () => { navigate('/profile'); setIsOpen(false); }, cmd: '/profile' },
        { icon: Monitor, label: 'System Dashboard', action: () => { navigate('/dashboard'); setIsOpen(false); }, cmd: '/dashboard' }
    ];

    const commands = [
        { icon: Terminal, label: 'New Record', cmd: '/new' },
        { icon: Users, label: 'Explore Users', cmd: '/explorers' },
        { icon: Moon, label: 'Dark Mode', cmd: '/dark' },
        { icon: Sun, label: 'Light Mode', cmd: '/light' },
        { icon: Shield, label: 'Admin Console', cmd: '/admin' },
        { icon: Share2, label: 'Neural Graph', cmd: '/network' },
        { icon: Trophy, label: 'Leveling Rules', cmd: '/levels' },
        { icon: LogOut, label: 'Sign Out', cmd: '/logout' },
        { icon: Monitor, label: 'Theme V1 (Classic)', cmd: '/theme v1' },
        { icon: Monitor, label: 'Theme V2 (Modern)', cmd: '/theme v2' },
        { icon: Monitor, label: 'Theme V3 (Logic)', cmd: '/theme v3' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/60 backdrop-blur-md"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="bg-card w-full max-w-[650px] rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border border-border overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 px-6 py-5 bg-muted/20 border-b border-border">
                            {query.startsWith('/') ? <Terminal className="text-primary animate-pulse" size={20} /> : <Search className="text-muted-foreground" size={20} />}
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-[16px] text-foreground font-medium placeholder:text-muted-foreground/40"
                                placeholder={query.startsWith('/') ? "Type a system command..." : "Search intelligence archive or type '/' for commands..."}
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && query.startsWith('/') && executeCommand(query)}
                            />
                            <div className="hidden sm:flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 rounded-md border border-border bg-card text-[9px] font-black text-muted-foreground shadow-sm">ESC</kbd>
                            </div>
                        </div>

                        {/* Results Space */}
                        <div className="max-h-[500px] overflow-y-auto no-scrollbar p-2">
                            {/* Command Mode UI */}
                            {query.startsWith('/') && (
                                <div className="space-y-1">
                                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">System Protocols</div>
                                    {commands.filter(c => c.cmd.includes(query.toLowerCase())).map((c, i) => (
                                        <button key={i} onClick={() => executeCommand(c.cmd)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/[0.03] text-left transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    <c.icon size={16} />
                                                </div>
                                                <span className="text-[14px] font-bold text-foreground/80">{c.label}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground/40 group-hover:text-primary transition-colors">{c.cmd}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Default View (Recent & Quick Actions) */}
                            {!query && (
                                <div className="space-y-6 p-2">
                                    {recentItems.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                                <History size={12} /> Recently Accessed
                                            </div>
                                            {recentItems.map((item, i) => (
                                                <button key={i} onClick={() => { navigate(`/notes/${item.id}`); setIsOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary/50 text-left transition-all group">
                                                    <div className="p-2 bg-card border border-border rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                                        <FileCode size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[13px] font-bold text-foreground/80">{item.title}</div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.category}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Navigation Nodes</div>
                                        <div className="grid grid-cols-2 gap-1">
                                            {staticActions.map((a, i) => (
                                                <button key={i} onClick={a.action} className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-secondary/50 text-left transition-all group">
                                                    <div className="p-2 bg-primary/5 rounded-lg text-primary transition-colors">
                                                        <a.icon size={18} />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-foreground/80">{a.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search Results UI */}
                            {query && !query.startsWith('/') && (
                                <div className="space-y-1">
                                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intelligence Matches</div>
                                    {results.map((note) => (
                                        <button
                                            key={note._id}
                                            onClick={() => { addToRecent(note); navigate(`/notes/${note._id}`); setIsOpen(false); }}
                                            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-primary/[0.03] text-left transition-all group"
                                        >
                                            <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-secondary border border-border rounded-xl text-primary transform transition-transform group-hover:scale-105">
                                                <FileCode size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[14px] font-bold text-foreground group-hover:text-primary truncate transition-colors">{note.title}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-primary/10 text-primary rounded-md uppercase">{note.category?.name || 'GENERIC'}</span>
                                                    <span className="text-[11px] text-muted-foreground truncate">{note.tags.join(' • ')}</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))}
                                    {results.length === 0 && !query.startsWith('/') && (
                                        <div className="py-20 text-center space-y-4">
                                            <HelpCircle size={40} className="mx-auto text-muted-foreground opacity-10" />
                                            <p className="text-[13px] text-muted-foreground font-medium">No records found matching "<span className="text-foreground">{query}</span>"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Intelligence Footer */}
                        <div className="px-6 py-4 bg-muted/10 border-t border-border flex items-center justify-between text-[10px]">
                            <div className="flex gap-4 text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5 font-bold text-muted-foreground/70"><kbd className="bg-card px-1 rounded border border-border leading-none">↵</kbd> Execute</span>
                                <span className="flex items-center gap-1.5 font-bold text-muted-foreground/70"><kbd className="bg-card px-1 rounded border border-border leading-none">/</kbd> Command Mode</span>
                            </div>
                            <div className="font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                                ScriptShelf Neural Link
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

