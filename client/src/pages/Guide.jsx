import {
    BookOpen,
    Code2,
    Hash,
    Zap,
    Shield,
    Database,
    Share2,
    ArrowRight,
    Search,
    Command,
    Workflow,
    Binary
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Guide = () => {
    return (
        <div className="max-w-[1000px] mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <header className="py-16 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                    <BookOpen size={14} /> Official Documentation
                </div>
                <h1 className="text-[42px] font-bold text-foreground leading-tight">
                    Mastering the <span className="text-primary">ScriptShelf</span> Protocol
                </h1>
                <p className="text-[18px] text-muted-foreground max-w-2xl mx-auto font-light">
                    ScriptShelf is more than a note-taker. It's a high-searchability neural network for your technical legacy. Here is how to use it like a pro.
                </p>
            </header>

            {/* Core Workflow */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
                <div className="glass-frost p-8 rounded-[3px] border-t-4 border-t-primary">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary mb-6">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-[19px] font-bold mb-3">1. Capture</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                        Document patterns, ADRs (Architectural Decision Records), or complex logic. Use our clinical Markdown editor with real-time preview.
                    </p>
                </div>
                <div className="glass-frost p-8 rounded-[3px] border-t-4 border-t-primary">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary mb-6">
                        <Database size={24} />
                    </div>
                    <h3 className="text-[19px] font-bold mb-3">2. Archive</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                        Categorize logic by stacks (React, Backend, DevOps) and add syntax tags. Choose between **Public Sharing** or **Private Vaulting**.
                    </p>
                </div>
                <div className="glass-frost p-8 rounded-[3px] border-t-4 border-t-primary">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary mb-6">
                        <Search size={24} />
                    </div>
                    <h3 className="text-[19px] font-bold mb-3">3. Retrieve</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                        Use the **Global Search (Ctrl+K)** or Wiki-Links to navigate your knowledge graph in milliseconds when you're in the middle of a build.
                    </p>
                </div>
            </section>

            {/* Detailed Features */}
            <div className="space-y-24 mt-12">
                {/* Wiki Links */}
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Workflow size={18} /> Knowledge Interlinking
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">The Wiki-Link Neural Network</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Stop creating isolated notes. ScriptShelf supports **Bidirectional Linking**. Wrap any title in double brackets <code className="bg-muted px-1.5 py-0.5 rounded text-primary">[[Title]]</code> to link them.
                        </p>
                        <ul className="space-y-3 text-[14px]">
                            <li className="flex gap-3">
                                <span className="text-primary font-bold">→</span>
                                <span>**Automatic Graphing**: Linking creates "Backlinks" automatically at the bottom of the target note.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary font-bold">→</span>
                                <span>**Aliases**: Use `[[Target|My Link]]` to clean up your writing while keeping the link intact.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 bg-accent/20 p-8 border border-border rounded-[12px] font-mono text-[13px] shadow-2xl">
                        <div className="flex gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-muted-foreground">// Architectural Decision</p>
                        <p className="text-foreground mt-2">As per our [[Authentication Strategy]], we will use JWT with a 10MB file limit.</p>
                        <div className="mt-8 pt-4 border-t border-border/50 text-primary uppercase text-[10px] tracking-widest">
                            Linking to "Authentication Strategy"...
                        </div>
                    </div>
                </div>

                {/* Collaboration & Forking */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Share2 size={18} /> Collaborative Forking
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">Clone to Your Library</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            See a brilliant implementation from another user? Don't copy-paste. **Clone** it.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-[3px] border-l-4 border-primary">
                                <div className="text-[20px] font-bold opacity-20">01</div>
                                <div>
                                    <p className="font-bold">One-Click Fork</p>
                                    <p className="text-[13px] text-muted-foreground">Creates a perfect replica in your own private shelf.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-[3px] border-l-4 border-primary">
                                <div className="text-[20px] font-bold opacity-20">02</div>
                                <div>
                                    <p className="font-bold">Private Evolution</p>
                                    <p className="text-[13px] text-muted-foreground">Modify the cloned logic privately without affecting the original.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 overflow-hidden rounded-[12px] border border-border shadow-2xl">
                        <div className="bg-card p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="h-4 w-32 bg-muted rounded" />
                                    <div className="h-4 w-48 bg-muted/50 rounded" />
                                </div>
                                <div className="px-4 py-2 border border-primary text-primary rounded-[3px] text-[12px] font-bold animate-pulse">
                                    CLONE TO MY SHELF
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-muted/20 rounded" />
                                <div className="h-4 w-full bg-muted/20 rounded" />
                                <div className="h-4 w-2/3 bg-muted/20 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Binary size={20} className="text-primary" />
                            <h3 className="text-[21px] font-bold">ADR Management</h3>
                        </div>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">
                            Turn your notes into **Architectural Decision Records**. Tag them with statuses like <span className="text-emerald-500 font-bold">Proposed</span>, <span className="text-primary font-bold">Accepted</span>, or <span className="text-rose-500 font-bold">Superceded</span> to track project evolution.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Code2 size={20} className="text-primary" />
                            <h3 className="text-[21px] font-bold">Integrated Resources</h3>
                        </div>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">
                            Embed YouTube tutorials directly or attach PDF documentations (up to 10MB) to your records. Your logic and its supporting documents stay together.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-primary" />
                            <h3 className="text-[21px] font-bold">Private Vaults</h3>
                        </div>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">
                            Sensitivity matters. Set records to **Vault** mode to hide them from the public library and global search of other users.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Command size={20} className="text-primary" />
                            <h3 className="text-[21px] font-bold">Universal Search</h3>
                        </div>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">
                            Press <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-[11px] font-bold">Ctrl+K</kbd> anywhere to trigger the Command Palette. Instantly jump to any tag, category, or implementation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="mt-32 p-12 glass-frost rounded-[12px] text-center space-y-8 border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-[34px] font-bold leading-tight">Ready to build your archives?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Start by documenting one pattern you used today. Over time, this becomes your most valuable professional asset.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/notes/new" className="so-btn so-btn-primary px-10 py-4 font-bold text-[16px]">
                        Create First Entry <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Guide;
