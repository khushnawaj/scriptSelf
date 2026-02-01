import React, { useState } from 'react';
import ReactDiffViewer from '@alexbruf/react-diff-viewer';
import { Sparkles, Check, X, Wand2, Loader2, Info } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function RefactorPanel({ noteId, originalCode, onOptimizationApplied }) {
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDiff, setShowDiff] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Analyzing with Gemini AI...");
        try {
            const { data } = await api.post(`/notes/${noteId}/analyze`);
            if (data.success) {
                setSuggestion(data.data);
                setShowDiff(true);
                toast.success("Optimization Suggested!", { id: toastId });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to analyze code.";
            toast.error(errorMsg, { id: toastId });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyRefactor = async () => {
        if (!suggestion) return;
        const toastId = toast.loading("Applying optimization...");
        try {
            // We assume backend updates the note with new refactored code if user clicks apply
            // Or we just send the update request here
            const { data } = await api.put(`/notes/${noteId}`, {
                codeSnippet: suggestion.refactoredCode
            });

            if (data.success) {
                toast.success("Optimization Applied!", { id: toastId });
                onOptimizationApplied(suggestion.refactoredCode);
                setShowDiff(false);
                setSuggestion(null);
            }
        } catch (error) {
            toast.error("Failed to apply optimization.", { id: toastId });
        }
    };

    return (
        <div className="mt-8 relative">
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:bg-primary/20 transition-all"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Sparkles size={24} className={isLoading ? "animate-pulse" : ""} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">AI Refactor Engine</h3>
                            <p className="text-sm text-muted-foreground italic">Powered by Gemini 1.5 Flash</p>
                        </div>
                    </div>

                    {!showDiff ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                            {isLoading ? "Analyzing..." : "Optimize Code"}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDiff(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyRefactor}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                <Check size={18} /> Apply Changes
                            </button>
                        </div>
                    )}
                </div>

                {showDiff && suggestion && (
                    <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
                        {/* Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-4 rounded-xl border border-border">
                                <h4 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-2">
                                    <Info size={14} /> AI Analysis
                                </h4>
                                <p className="text-sm leading-relaxed">{suggestion.explanation}</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-xl border border-border">
                                <h4 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-2">
                                    <Sparkles size={14} /> Complexity: {suggestion.complexity}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {suggestion.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Diff View */}
                        <div className="rounded-xl border border-border overflow-hidden bg-background/50">
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/80 border-b border-border text-xs font-bold font-mono">
                                <span>ORIGINAL</span>
                                <span className="mx-2 text-muted-foreground font-light">vs</span>
                                <span className="text-emerald-500">OPTIMIZED</span>
                            </div>
                            <ReactDiffViewer
                                oldValue={originalCode}
                                newValue={suggestion.refactoredCode || suggestion.optimizedCode}
                                splitView={true}
                                useDarkTheme={true}
                                hideLineNumbers={false}
                                styles={{
                                    variables: {
                                        dark: {
                                            diffViewerBackground: 'transparent',
                                            addedBackground: 'rgba(16, 185, 129, 0.1)',
                                            addedColor: '#10b981',
                                            removedBackground: 'rgba(239, 68, 68, 0.1)',
                                            removedColor: '#ef4444',
                                            wordAddedBackground: 'rgba(16, 185, 129, 0.2)',
                                            wordRemovedBackground: 'rgba(239, 68, 68, 0.2)',
                                        }
                                    },
                                    diffContainer: {
                                        fontSize: '13px',
                                        fontFamily: 'JetBrains Mono, Fira Code, monospace'
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            {/* Absolute accent border */}
            <div className="absolute inset-0 border-2 border-primary/10 rounded-2xl pointer-events-none group-hover:border-primary/30 transition-colors"></div>
        </div>
    );
}
