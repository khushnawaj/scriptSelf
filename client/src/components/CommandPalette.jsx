import { useState, useEffect } from "react";

import { Search, Hash, FileCode, ArrowRight } from "lucide-react"; // Install @headlessui/react for accessible modal if needed or use simple div
// We will use a simple fixed overlay for now to avoid installing new UI libs unless user wanted.
// For "Senior-Level", headless UI or Radix is robust. I will use a simple accessible div implementation to be safe on dependencies.

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from '../utils/api'; // Direct API call for search

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    // Toggle with CMD+K / CTRL+K
    useEffect(() => {
        const handleKeyDown = (e) => {
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

    // Debounced Search
    useEffect(() => {
        if (!isOpen || !query) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                // Assuming we use the existing GET /notes?search=...
                const { data } = await api.get(`/notes?search=${query}`);
                setResults(data.data.slice(0, 5)); // Limit to 5
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
            <div
                className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="text-muted-foreground" size={20} />
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
                        placeholder="Type a command or search..."
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="hidden sm:inline-block pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">ESC</span>
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                    {query === "" && (
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Suggestions
                        </div>
                    )}

                    {query === "" && (
                        <>
                            <button onClick={() => { navigate('/notes/new'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left text-sm transition-colors group">
                                <FileCode size={16} className="text-primary" />
                                <span>Create New Note</span>
                                <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button onClick={() => { navigate('/dashboard'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left text-sm transition-colors group">
                                <Search size={16} className="text-primary" />
                                <span>Go to Dashboard</span>
                            </button>
                        </>
                    )}

                    {results.map((note) => (
                        <button
                            key={note._id}
                            onClick={() => { navigate(`/notes/${note._id}`); setIsOpen(false); }}
                            className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors group"
                        >
                            <FileCode size={18} className="text-blue-500 mt-0.5" />
                            <div className="flex-1 overflow-hidden">
                                <div className="text-sm font-medium truncate">{note.title}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{note.category?.name}</span>
                                    {note.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-xs text-muted-foreground flex items-center gap-0.5">
                                            <Hash size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 self-center">Jump to</span>
                        </button>
                    ))}

                    {query && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                            No results found.
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex gap-3">
                        <span><strong>↑↓</strong> to navigate</span>
                        <span><strong>↵</strong> to select</span>
                    </div>
                    <div>
                        ScriptShelf PRO
                    </div>
                </div>
            </div>
        </div>
    );
}
