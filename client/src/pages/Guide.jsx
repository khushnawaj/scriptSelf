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
    Binary,
    Bell,
    UserPlus,
    Bug,
    Keyboard,
    Monitor
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

                {/* Community & Tactical Alerts */}
                <div className="flex flex-col md:flex-row items-center gap-16 mt-20 pt-16 border-t border-border/50">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Hash size={18} /> Social Knowledge Graph
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">Tactical Networking</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            ScriptShelf is a living ecosystem. Stay synchronized with the community through advanced signal protocols.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">Real-time Signal Bell</h4>
                                    <p className="text-[14px] text-muted-foreground mt-1">
                                        The tactical bell in your navbar pulses when new signals are detected. Get notified instantly when someone follows you or interacts with your logic.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">Interactive Network Graphs</h4>
                                    <p className="text-[14px] text-muted-foreground mt-1">
                                        Exploration is core to learning. Click any **Follower** or **Following** count on a profile to open a detailed network list and discover new contributors.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-accent/20 p-8 border border-border rounded-[12px] font-mono text-[13px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                            <Bell size={48} className="text-primary animate-pulse" />
                        </div>
                        <div className="flex gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-[4px]">
                                <p className="text-[11px] text-primary font-bold mb-1 uppercase tracking-tighter">New_Signal_Detected</p>
                                <p className="text-foreground text-[12px]">@SeniorDev started following your architecture archives.</p>
                                <p className="text-[10px] text-muted-foreground mt-2">LINK_ESTABLISHED // 2m ago</p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex gap-4">
                                    <span className="text-[11px] font-bold text-foreground hover:text-primary cursor-pointer transition-colors">1.2k Followers</span>
                                    <span className="text-[11px] font-bold text-foreground hover:text-primary cursor-pointer transition-colors">450 Following</span>
                                </div>
                                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold">VERIFIED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-20">
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

                {/* Productivity Protocols */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Keyboard size={18} /> Tactical Acceleration
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">Productivity Protocols</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                ScriptShelf is engineered for speed. Use the global shortcut system to navigate between missions without a mouse.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/20 border border-border rounded-[4px] flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <span className="text-[13px] font-bold">Zen Mode</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-black text-primary uppercase">Alt+Z</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[4px] flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <span className="text-[13px] font-bold">Theme Swap</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-black text-primary uppercase">Alt+T</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[4px] flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <span className="text-[13px] font-bold">Arcade</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-black text-primary uppercase">Alt+A</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[4px] flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <span className="text-[13px] font-bold">Library</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-black text-primary uppercase">Alt+L</kbd>
                                </div>
                            </div>

                            <p className="text-[12px] text-muted-foreground italic bg-primary/5 p-3 border-l-2 border-primary">
                                Tip: Press <span className="font-bold text-foreground">?</span> anytime to open the full Tactical Shortcut Map.
                            </p>
                        </div>
                        <div className="flex-1 space-y-8">
                            <div className="p-8 bg-card border border-border rounded-[12px] relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Monitor size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-[14px]">Zen_Focus_Active</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase opacity-60">Distraction Filter: 100%</p>
                                    </div>
                                </div>
                                <p className="text-[14px] leading-relaxed text-muted-foreground relative z-10">
                                    Zen Mode (Alt+Z) centers your viewport and hides all peripheral sidebars. It’s the tactical choice for deep documentation sprints or high-speed code reading.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DevArcade Section */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px] mb-8">
                        <Zap size={18} /> Cognitive Training
                    </div>
                    <h2 className="text-[32px] font-bold leading-tight mb-8">DevArcade: Refine Your Stack</h2>
                    <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                        A built-in gamification suite to keep your developer skills sharp. Earn XP, maintain streaks, and unlock tiered rank badges.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Syntax Sprint", icon: "TS", desc: "Elite_Typing_Test", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            { title: "Memory Matrix", icon: <Database size={20} />, desc: "Pattern_Recognition", color: "text-primary", bg: "bg-primary/10" },
                            { title: "Hex Hunter", icon: "#", desc: "UI_Color_Accuracy", color: "text-amber-500", bg: "bg-amber-500/10" },
                            { title: "Firewall Breach", icon: <Shield size={20} />, desc: "Defense_Simulation", color: "text-violet-500", bg: "bg-violet-500/10" },
                            { title: "Bug Hunter v2.5", icon: <Bug size={20} />, desc: "Full_System_Audit", color: "text-rose-500", bg: "bg-rose-500/10" },
                            { title: "Stack Escape", icon: <Binary size={20} />, desc: "Algorithm_Navigation", color: "text-cyan-500", bg: "bg-cyan-500/10" },
                        ].map((game, i) => (
                            <div key={i} className="group bg-card/60 border border-border hover:border-primary/50 p-6 rounded-[0.8rem] space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl dark:shadow-primary/5 relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-start relative z-10">
                                    <div className={`w-12 h-12 rounded-[10px] ${game.bg} flex items-center justify-center ${game.color} font-black text-xl border border-white/5`}>
                                        {game.icon}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-widest">SIGNAL_LINK</span>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map(bit => <div key={bit} className={`w-0.5 h-2 rounded-full ${game.color} opacity-60`} />)}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-extrabold text-foreground group-hover:text-primary transition-colors">{game.title}</h4>
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{game.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-border flex justify-between items-center group-hover:border-primary/20 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">CORE_POWER</span>
                                        <span className="text-[9px] font-mono font-bold text-foreground/60">98% OPTIMIZED</span>
                                    </div>
                                    <ArrowRight size={14} className={`${game.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                </div>
                            </div>
                        ))}
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
