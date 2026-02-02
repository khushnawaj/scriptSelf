import { useState, useEffect } from "react";
import { Search, Hash, FileCode, ArrowRight, Command, Plus, HelpCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // CTRL+K search shortcut
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            try {
                const { data } = await api.get(`/notes?search=${query}`);
                setResults(data.data.slice(0, 5));
            } catch (err) {
                console.error("Search error:", err);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="bg-card w-full max-w-[600px] rounded-[3px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-border overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search Input - SO Field Style */}
                        <div className="flex items-center gap-3 px-4 py-4 bg-secondary border-b border-border">
                            <Search className="text-muted-foreground" size={20} />
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-[16px] text-foreground placeholder:text-muted-foreground/50"
                                placeholder="Search all records (Ctrl+K)..."
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                                <kbd className="px-1.5 py-0.5 rounded-[3px] border border-border bg-card text-[10px] font-bold text-muted-foreground">ESC</kbd>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="max-h-[450px] overflow-y-auto bg-card">
                            {!query && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        <button onClick={() => { navigate('/notes/new'); setIsOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-[3px] hover:bg-accent text-left text-[14px] text-foreground transition-colors group">
                                            <Plus size={16} className="text-primary" />
                                            <span>New Vault Record</span>
                                        </button>
                                        <button onClick={() => { navigate('/notes'); setIsOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-[3px] hover:bg-accent text-left text-[14px] text-foreground transition-colors group">
                                            <FileText size={16} className="text-primary" />
                                            <span>Explore Archive</span>
                                        </button>
                                        <button onClick={() => { navigate('/categories'); setIsOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-[3px] hover:bg-accent text-left text-[14px] text-foreground transition-colors group">
                                            <Hash size={16} className="text-primary" />
                                            <span>Browse Syntax Tags</span>
                                        </button>
                                        <button onClick={() => { navigate('/dashboard'); setIsOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-[3px] hover:bg-accent text-left text-[14px] text-foreground transition-colors group">
                                            <Command size={16} className="text-primary" />
                                            <span>System Metrics</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="p-2 border-t border-border mt-2">
                                    <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Matched Records</div>
                                    <div className="space-y-1">
                                        {results.map((note) => (
                                            <button
                                                key={note._id}
                                                onClick={() => { navigate(`/notes/${note._id}`); setIsOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-3 rounded-[3px] hover:bg-accent text-left transition-all group"
                                            >
                                                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-secondary text-primary rounded-[3px]">
                                                    <FileCode size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[15px] font-medium text-link group-hover:text-link-hover truncate transition-colors">{note.title}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="so-tag text-[10px] m-0 px-1.5 py-0.5">{note.category?.name || 'GENERIC'}</span>
                                                        <span className="text-[11px] text-muted-foreground truncate">{note.tags.join(', ')}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && results.length === 0 && (
                                <div className="py-20 text-center">
                                    <HelpCircle size={48} className="mx-auto text-muted/20 mb-4" />
                                    <p className="text-[15px] text-muted-foreground">Archive search yield: 0 results for "<span className="font-bold text-foreground">{query}</span>"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Tips - System Style */}
                        <div className="px-4 py-3 bg-accent/30 border-t border-primary/20 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex gap-4">
                                <span><span className="font-bold text-foreground">↵</span> to select</span>
                                <span><span className="font-bold text-foreground">ESC</span> to exit archive</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-primary uppercase tracking-widest">
                                ScriptShelf Search
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
