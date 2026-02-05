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
    Monitor,
    Activity,
    Terminal,
    Eye,
    Settings,
    Layout,
    CheckSquare,
    Globe,
    Layers,
    Cpu,
    Flame,
    Trophy,
    ListFilter,
    Tags,
    Star,
    MessageSquare,
    Sparkles
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
                    Master your <span className="text-primary">Knowledge Vault</span>
                </h1>
                <p className="text-[18px] text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                    ScriptShelf is your high-density neural network for technical logic. This manual covers every feature, shortcut, and strategy to secure your technical legacy.
                </p>
            </header>

            {/* Quick Start Roadmap */}
            <section className="mb-24">
                <h2 className="text-[24px] font-bold mb-8 flex items-center gap-3">
                    <Flame size={24} className="text-primary" /> The 5-Minute Setup
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-frost p-6 rounded-[3px] border-t-2 border-t-primary">
                        <div className="text-[28px] font-black text-primary/20 mb-2">01</div>
                        <h4 className="font-bold text-[16px] mb-2">Initialize</h4>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">Open the editor via **Alt+N**. Your capture buffer is ready for logic input.</p>
                    </div>
                    <div className="glass-frost p-6 rounded-[3px] border-t-2 border-t-primary">
                        <div className="text-[28px] font-black text-primary/20 mb-2">02</div>
                        <h4 className="font-bold text-[16px] mb-2">Categorize</h4>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">Select a root stack and add surgical tags like #react or #middleware.</p>
                    </div>
                    <div className="glass-frost p-6 rounded-[3px] border-t-2 border-t-primary">
                        <div className="text-[28px] font-black text-primary/20 mb-2">03</div>
                        <h4 className="font-bold text-[16px] mb-2">Cross-Link</h4>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">Build neural paths using `[[Note Title]]` to connect related code vaults.</p>
                    </div>
                    <div className="glass-frost p-6 rounded-[3px] border-t-2 border-t-primary">
                        <div className="text-[28px] font-black text-primary/20 mb-2">04</div>
                        <h4 className="font-bold text-[16px] mb-2">Authorize</h4>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">Link your GitHub and tech stack in settings to verify your technical ID.</p>
                    </div>
                </div>
            </section>

            {/* Core Workflow */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-border/50">
                <div className="glass-frost p-8 rounded-[3px] border-t-4 border-t-primary">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary mb-6">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-[19px] font-bold mb-3">1. Efficient Capture</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                        Capture snippets at terminal speed. Our editor features mirror-sync preview and supports GitHub Flavored Markdown (GFM).
                    </p>
                </div>
                <div className="glass-frost p-8 rounded-[3px] border-t-4 border-t-primary">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary mb-6">
                        <Database size={24} />
                    </div>
                    <h3 className="text-[19px] font-bold mb-3">2. Atomic Organization</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                        Organize by multi-level stacks and surgical tagging. Move beyond folders into a multidimensional knowledge library.
                    </p>
                    <p className="text-[11px] text-primary/70 font-bold mt-4 uppercase tracking-tighter">
                        PRO-TIP: Tags like #Hooks or #Security enable surgical retrieval.
                    </p>
                </div>
                <div className="glass-frost p-8 rounded-[3px] border-t-4 border-t-primary">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary mb-6">
                        <Search size={24} />
                    </div>
                    <h3 className="text-[19px] font-bold mb-3">3. Rapid Retrieval</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                        Instant global search and [[Wiki-Links]] allow you to jump between dependencies like a local Wikipedia.
                    </p>
                </div>
            </section>

            {/* Detailed Features */}
            <div className="space-y-24 mt-20">
                {/* 1. Tactical Editor */}
                <div className="flex flex-col md:flex-row items-start gap-16">
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Terminal size={18} /> Component 01: Capture
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">The Tactical Editor</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A minimalist powerhouse for 100% focused writing. Featuring live side-by-side preview and technical formatting.
                        </p>
                        <ul className="space-y-4 text-[14px]">
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Eye size={14} /></div>
                                <span>**Mirror-Sync**: Live rendering of tables, checklists, and code.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Code2 size={14} /></div>
                                <span>**Syntax Mastery**: Full support for 50+ languages including Rust, Go, and Python.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Shield size={14} /></div>
                                <span>**Vault Toggle**: Choose between private encrypted mode or public community library.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 bg-accent/20 p-8 border border-border rounded-[3px] font-mono text-[13px] shadow-sm text-left w-full">
                        <div className="flex gap-2 mb-4 border-b border-border/50 pb-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active_Buffer.md</span>
                        </div>
                        <p className="text-primary font-bold"># Implementing Auth Strategy</p>
                        <p className="text-muted-foreground mt-2">Connecting with [[Auth Layer]] and [[Redux Store]].</p>
                        <div className="mt-4 p-4 bg-muted/30 rounded border border-border/50 italic text-[12px]">
                            -- tech_stack: [react, thunk]<br />
                            -- privacy: vaulted
                        </div>
                        <p className="text-zinc-500 mt-6">```javascript<br />const logic = () =&gt; &#123; ... &#125;;<br />```</p>
                    </div>
                </div>

                {/* 2. Neural Links */}
                <div className="flex flex-col md:flex-row-reverse items-start gap-16">
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Workflow size={18} /> Component 02: Interlink
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">The Neural Link Protocol</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Connect your logic flow. Every note you write is a node in your personal knowledge graph.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-[3px] border-l-4 border-primary">
                                <div>
                                    <p className="font-bold">Wiki-Links</p>
                                    <p className="text-[13px] text-muted-foreground">Type `[[Title]]` to link. ScriptShelf tracks these bidirectional paths.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-[3px] border-l-4 border-primary">
                                <div>
                                    <p className="font-bold">Auto-Backlinks</p>
                                    <p className="text-[13px] text-muted-foreground">Navigate backward to see which other notes depend on the current snippet.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full flex flex-col items-center gap-4 py-8 bg-accent/10 rounded-[3px] border border-border border-dashed">
                        <div className="px-6 py-2 glass-frost border-primary/40 text-primary font-bold rounded">[[ Global Store ]]</div>
                        <div className="h-8 w-px bg-primary/20" />
                        <div className="flex gap-4">
                            <div className="px-4 py-1 bg-muted/50 border border-border rounded text-[12px]">[[ Auth Slice ]]</div>
                            <div className="px-4 py-1 bg-muted/50 border border-border rounded text-[12px]">[[ User Slice ]]</div>
                        </div>
                        <div className="mt-4 text-[10px] text-primary font-black uppercase tracking-widest opacity-40">Relationship_Map_Loaded</div>
                    </div>
                </div>

                {/* 3. Reputation & Identity */}
                <div className="flex flex-col md:flex-row items-start gap-16">
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Trophy size={18} /> Component 03: Identity
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">Your Technical Footprint</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Convert your knowledge into professional credit. Every contribution adds to your global Reputation XP.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-muted/20 border border-border rounded-[4px]">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Activity size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-[15px]">Reputation Pulse</h4>
                                    <p className="text-[13px] text-muted-foreground">Track consistency with our visual activity heat-map on your profile.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-muted/20 border border-border rounded-[4px]">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Share2 size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-[15px]">The Clone Economy</h4>
                                    <p className="text-[13px] text-muted-foreground">Fork public scripts to your own shelf to evolve them privately.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full glass-frost p-8 rounded-[3px] border-t-0 border-l-4 border-l-primary text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary">K</div>
                            <div>
                                <p className="font-bold text-[18px]">Archived_User</p>
                                <p className="text-[11px] text-primary font-black uppercase tracking-tighter">Level 42 Architect</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                                <span>Signal_Strength</span>
                                <span>85%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full"><div className="w-[85%] h-full bg-primary rounded-full" /></div>
                        </div>
                    </div>
                </div>

                {/* 4. Strategic Logic Tracker */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row-reverse items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Binary size={18} /> Logic Lifecycle
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">The ADR Status Engine</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Code evolves. Use Architectural Decision Record (ADR) statuses to track the validity of your logic entries over time.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-[3px]">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                    <span className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest">Proposed</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-[3px]">
                                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" />
                                    <span className="text-[12px] font-bold text-primary uppercase tracking-widest">Accepted</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-[3px]">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                                    <span className="text-[12px] font-bold text-rose-500 uppercase tracking-widest">Superceded</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full p-8 bg-card border border-border rounded-[3px] border-l-4 border-l-primary text-left">
                            <h4 className="font-bold mb-4">Why track status?</h4>
                            <p className="text-[14px] text-muted-foreground leading-relaxed italic">
                                "Tracking why we moved from REST to GraphQL helps avoid making the same mistakes twice. Status labels provide historical context for your growth."
                            </p>
                        </div>
                    </div>
                </div>

                {/* 5. Productivity Protocols */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Keyboard size={18} /> Component 04: Control
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">Master Terminal Controls</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                ScriptShelf is engineered for keyboard-first developers. Navegate at high speeds without reaching for the mouse.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center">
                                    <span className="text-[13px] font-bold">Search Palette</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Ctrl+K</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center">
                                    <span className="text-[13px] font-bold">Zen Mode</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Alt+Z</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center">
                                    <span className="text-[13px] font-bold">New Note</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Alt+N</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center">
                                    <span className="text-[13px] font-bold">Help Map</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">?</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full glass-frost p-8 rounded-[3px] text-left">
                            <div className="flex items-center gap-3 mb-4">
                                <Monitor size={20} className="text-primary" />
                                <h4 className="font-bold">Focus Engine</h4>
                            </div>
                            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                                Zen Mode centers your viewport and hides all sidebars. Perfect for deep documentation or high-speed code reading.
                            </p>
                            <ul className="space-y-2 text-[12px] font-bold text-primary/70">
                                <li>- DISTRACTION_FILTER: ENABLED</li>
                                <li>- VIEWPORT_CENTERING: ACTIVE</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 6. DevArcade Game Mode */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px] mb-8">
                        <Zap size={18} /> Training Hub
                    </div>
                    <h2 className="text-[32px] font-bold leading-tight mb-8">DevArcade: Gamified Sharpening</h2>
                    <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl text-left">
                        Play built-in technical mini-games to sharpen your coding reflexes. Earn XP while mastering syntax and pattern recognition.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        {[
                            { title: "Syntax Sprint", icon: <Terminal size={18} />, desc: "Elite Typing Speed", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            { title: "Bug Hunter", icon: <Bug size={18} />, desc: "Visual Audit Speed", color: "text-rose-500", bg: "bg-rose-500/10" },
                            { title: "Logic Loop", icon: <Binary size={18} />, desc: "Algo_Optimizing", color: "text-primary", bg: "bg-primary/10" },
                        ].map((game, i) => (
                            <div key={i} className="group glass-frost hover:border-primary/50 p-6 rounded-[3px] space-y-4 transition-all hover:shadow-lg">
                                <div className={`w-10 h-10 rounded-[3px] ${game.bg} flex items-center justify-center ${game.color} border border-white/5`}>
                                    {game.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{game.title}</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{game.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-border flex justify-between items-center group-hover:border-primary/20 transition-colors">
                                    <span className="text-[9px] font-bold text-foreground/40 uppercase">System: Ready</span>
                                    <ArrowRight size={14} className={`${game.color} opacity-0 group-hover:opacity-100 transition-all`} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-start">
                        <Link to="/arcade" className="so-btn so-btn-primary px-8 py-3 text-[14px] font-bold">Launch Arcade System</Link>
                    </div>
                </div>
            </div>

            {/* Support Protocols */}
            <div className="mt-32 pt-20 border-t border-border/50 text-center space-y-12">
                <h2 className="text-[32px] font-bold tracking-tight">Support Protocols</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="glass-frost p-8 rounded-[3px] space-y-4 hover:border-primary/50 transition-all cursor-pointer">
                        <MessageSquare size={24} className="text-primary" />
                        <h4 className="font-bold">Discord Node</h4>
                        <p className="text-[13px] text-muted-foreground">Join our community for real-time encrypted support and strategy sharing.</p>
                    </div>
                    <div className="glass-frost p-8 rounded-[3px] space-y-4 hover:border-primary/50 transition-all cursor-pointer">
                        <Bug size={32} className="text-primary" />
                        <h4 className="font-bold">GitHub Tracker</h4>
                        <p className="text-[13px] text-muted-foreground">Log signal bugs or request new core modules in our official repository.</p>
                    </div>
                    <div className="glass-frost p-8 rounded-[3px] space-y-4 hover:border-primary/50 transition-all cursor-pointer">
                        <Shield size={24} className="text-primary" />
                        <h4 className="font-bold">Security Wing</h4>
                        <p className="text-[13px] text-muted-foreground">Reporting vulnerability signals? Access our encrypted reporting line.</p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="mt-32 p-12 glass-frost rounded-[3px] text-center space-y-8 border-none border-t-4 border-t-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-[34px] font-bold leading-tight tracking-tight text-white">Your technical legacy <br /> starts with one note.</h2>
                <div className="flex justify-center gap-4">
                    <Link to="/notes/new" className="so-btn so-btn-primary px-10 py-4 font-bold text-[16px]">
                        Initialize First Entry <Zap size={18} className="ml-2" />
                    </Link>
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Session_System: Stable // V2.9.0</p>
            </div>
        </div>
    );
};

export default Guide;
