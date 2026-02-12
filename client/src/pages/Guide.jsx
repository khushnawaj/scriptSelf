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
    Sparkles,
    Users,
    FileText,
    Download,
    FolderTree,
    CornerDownRight
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
                        <p className="text-muted-foreground mt-6">```javascript<br />const logic = () =&gt; &#123; ... &#125;;<br />```</p>
                    </div>
                </div>

                {/* 2. Neural Graph & Links */}
                <div className="flex flex-col md:flex-row-reverse items-start gap-16">
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Share2 size={18} /> Component 02: Visual Intelligence
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">The Neural Graph</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Visualize the interconnected web of your archives. ScriptShelf map nodes based on semantic relationships and shared tags.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-[3px] border-l-4 border-primary">
                                <div>
                                    <p className="font-bold">Neural Mapping</p>
                                    <p className="text-[13px] text-muted-foreground">Access the global interactive graph via `/network`. See how your logic clusters together.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-[3px] border-l-4 border-primary">
                                <div>
                                    <p className="font-bold">Wiki-Link Protocol</p>
                                    <p className="text-[13px] text-muted-foreground">Type `[[Title]]` to forge bidirectional links. These links appear as visible neural paths in the graph.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full bg-black/20 rounded-2xl border border-border overflow-hidden p-4 group">
                        <div className="relative w-full h-[200px] flex items-center justify-center">
                            {/* Visual representation of graph */}
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full animate-pulse" />
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <Activity size={40} className="text-primary opacity-50" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural_Link_Active</span>
                            </div>
                            <div className="absolute top-10 left-10 w-3 h-3 bg-primary rounded-full blur-[2px]" />
                            <div className="absolute bottom-10 right-20 w-4 h-4 bg-primary/40 rounded-full blur-[2px]" />
                            <div className="absolute top-20 right-10 w-2 h-2 bg-emerald-500 rounded-full blur-[2px]" />
                        </div>
                    </div>
                </div>

                {/* 3. Folders & Organization */}
                <div className="flex flex-col md:flex-row items-start gap-16 border-t border-border/50 pt-16">
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <FolderTree size={18} /> Component 03: Structured Archives
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">Folder & Mention Protocol</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Reorganize your knowledge into a strict folder hierarchy. Reference other agents directly in your documentation.
                        </p>
                        <ul className="space-y-4 text-[14px]">
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Layout size={14} /></div>
                                <span>**Nested Folders**: Create hierarchies for project-specific documentation.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Users size={14} /></div>
                                <span>**Direct Mentions**: Type `@username` to notify team members.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Share2 size={14} /></div>
                                <span>**Clone & Fork**: Save public records to your personal shelf.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full bg-card border border-border rounded-[3px] p-8 text-left">
                        <div className="border-l-2 border-primary pl-4 mb-6">
                            <h4 className="font-bold text-[16px]">Folder Structure</h4>
                            <div className="mt-4 space-y-2 font-mono text-[12px] text-muted-foreground">
                                <div className="flex items-center gap-2"><CornerDownRight size={14} className="text-foreground" />  Backend_Systems</div>
                                <div className="flex items-center gap-2 pl-6"><CornerDownRight size={14} className="opacity-50" />  API_Routes</div>
                                <div className="flex items-center gap-2 pl-12"><FileText size={14} /> user_model.js</div>
                            </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded border border-border/50 text-[13px]">
                            <span className="text-primary font-bold">@alex_dev</span> check the schema in <span className="text-primary underline">[[Auth Flow]]</span>
                        </div>
                    </div>
                </div>

                {/* 4. Reputation & Reputation Tiers */}
                <div className="flex flex-col md:flex-row items-start gap-16 border-t border-border/50 pt-16">
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                            <Trophy size={18} /> Component 04: Reputation Tiers
                        </div>
                        <h2 className="text-[32px] font-bold leading-tight">Forge your Technical ID</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Ascend the ranks from a code-scripter to a System Overlord. Your reputation is tracked through our multi-tier architecture.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-muted/20 border border-border rounded-[4px]">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><CheckSquare size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-[15px]">The 5 Tiers of Archiving</h4>
                                    <p className="text-[13px] text-muted-foreground">Junior Scripter, Senior Architect, Staff Neuralist, Principal Engineer, and System Overlord.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-muted/20 border border-border rounded-[4px]">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Flame size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-[15px]">XP & Progress</h4>
                                    <p className="text-[13px] text-muted-foreground">Earn Intelligence Points through note contributions, public archiving, and simulations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-card border border-border rounded-[3px] border-l-4 border-l-primary p-8 text-left relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-secondary border-2 border-emerald-500/20 rounded-2xl flex items-center justify-center font-black text-emerald-500 text-xl shadow-xl">S</div>
                            <div>
                                <p className="font-black text-[20px] text-foreground">Senior Architect</p>
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Rank: Tier II // Authorized</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                    <span>Intelligence_Sync</span>
                                    <span className="text-emerald-500">72%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                                    <div className="w-[72%] h-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tight text-center">428 / 500 Intelligence Points to Next Tier</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border/50">
                            <Link to="/levels" className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2">
                                View Full Leveling Rules <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4. Strategic Logic Tracker */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row-reverse items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Binary size={18} /> Component 04: Logic Lifecycle
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

                {/* 5. Command Palette v2 & UI */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Keyboard size={18} /> Component 05: Control Protocol
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">Master Command Palette</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                ScriptShelf v2 features a high-speed command hub for navigation, theme switching, and system operations.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center transition-all hover:border-primary/50 group">
                                    <span className="text-[13px] font-bold group-hover:text-primary">Command Mode</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Ctrl+K</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center transition-all hover:border-primary/50 group">
                                    <span className="text-[13px] font-bold group-hover:text-primary">New Note</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Alt+N</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center transition-all hover:border-primary/50 group">
                                    <span className="text-[13px] font-bold group-hover:text-primary">Playground</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Alt+X</kbd>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-[3px] flex justify-between items-center transition-all hover:border-primary/50 group">
                                    <span className="text-[13px] font-bold group-hover:text-primary">Neural Graph</span>
                                    <kbd className="bg-background px-2 py-0.5 border border-border rounded text-[10px] font-bold text-primary">Alt+G</kbd>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <p className="text-[11px] font-black uppercase text-primary tracking-widest">Active Slash Commands</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { cmd: '/new', desc: 'Create record' },
                                        { cmd: '/theme v3', desc: 'Switch theme' },
                                        { cmd: '/dark', desc: 'Active night' },
                                        { cmd: '/network', desc: 'Open Graph' },
                                    ].map(item => (
                                        <div key={item.cmd} className="flex items-center gap-3 p-3 bg-card border border-border rounded shadow-sm">
                                            <span className="text-primary font-bold text-[12px]">{item.cmd}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">{item.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-6">
                            <div className="glass-frost p-8 rounded-[3px] text-left border-t-0 border-l-4 border-l-primary">
                                <div className="flex items-center gap-3 mb-4">
                                    <Monitor size={20} className="text-primary" />
                                    <h4 className="font-bold">Thematic Scrollbars</h4>
                                </div>
                                <p className="text-[14px] text-muted-foreground leading-relaxed">
                                    Our interface is fully synchronized. Custom scrollbars now adapt to your active theme's primary HSL tokens for a perfect visual flow.
                                </p>
                            </div>
                            <div className="p-6 bg-accent/10 border border-border border-dashed rounded-[3px] text-left">
                                <h4 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] mb-2">PRO_PROTOCOL: RECENT_ITEMS</h4>
                                <p className="text-[13px] text-muted-foreground">The command palette caches your last 5 viewed items for rapid-fire switching during deep-work sessions.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. Real-Time Chat System */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <MessageSquare size={18} /> Component 06: Communication
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">Encrypted Signal Protocol</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Connect with fellow developers through our end-to-end encrypted chat system. Share code, collaborate on projects, and build your network.
                            </p>
                            <ul className="space-y-4 text-[14px]">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Shield size={14} /></div>
                                    <span>**End-to-End Encryption**: All messages are encrypted in transit and at rest.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><CheckSquare size={14} /></div>
                                    <span>**Read Receipts**: Single tick (sent), double tick (delivered), blue tick (read).</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Share2 size={14} /></div>
                                    <span>**File Sharing**: Send images, videos, and documents up to 10MB instantly.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 bg-accent/20 p-8 border border-border rounded-[3px] font-mono text-[13px] shadow-sm text-left w-full">
                            <div className="flex gap-2 mb-4 border-b border-border/50 pb-2">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Chat_Interface.jsx</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded border-l-4 border-primary">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-muted-foreground">Encrypted Connection Active</span>
                                </div>
                                <div className="p-3 bg-muted/30 rounded text-xs">
                                    <p className="text-primary font-bold mb-1">@developer_42</p>
                                    <p className="text-muted-foreground">Check out this React hook I built...</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[9px] opacity-40">12:34 PM</span>
                                        <CheckSquare size={10} className="text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Community Feed */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row-reverse items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Globe size={18} /> Component 07: Collective
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">The Global Knowledge Stream</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Broadcast your discoveries to the entire ScriptShelf community. Share breakthroughs, ask questions, and learn from the collective intelligence.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-muted/20 border border-border rounded-[4px]">
                                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Sparkles size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-[15px]">Public Broadcasting</h4>
                                        <p className="text-[13px] text-muted-foreground">Share code snippets, tutorials, and insights with the entire community.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-muted/20 border border-border rounded-[4px]">
                                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Share2 size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-[15px]">Media Support</h4>
                                        <p className="text-[13px] text-muted-foreground">Attach images, videos, and files to enrich your posts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full glass-frost p-8 rounded-[3px] border-t-0 border-l-4 border-l-primary text-left">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center font-black text-primary">C</div>
                                <div>
                                    <p className="font-bold text-[18px]">Community_Feed</p>
                                    <p className="text-[11px] text-primary font-black uppercase tracking-tighter">Live Global Stream</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-muted/30 rounded border border-border/50">
                                    <p className="text-xs font-bold mb-1">Latest Discovery</p>
                                    <p className="text-[11px] text-muted-foreground">New optimization technique for React renders...</p>
                                </div>
                                <div className="flex gap-2 text-[10px] text-primary/70 font-bold">
                                    <span>Trending</span>
                                    <span>•</span>
                                    <span>247 Active Users</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* 10. Playground */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row-reverse items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px]">
                                <Terminal size={18} /> Component 08: Playground
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">The Logic Sandbox</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                A safe, isolated environment to prototype JavaScript logic before integrating it into your main codebase. Features a patched console for real-time output debugging.
                            </p>
                            <ul className="space-y-4 text-[14px]">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Zap size={14} /></div>
                                    <span>**Instant Execution**: Run standard JS and async functions immediately with the Play button.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Monitor size={14} /></div>
                                    <span>**Console Mirror**: System console logs are captured and displayed in a dedicated output pane.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Layout size={14} /></div>
                                    <span>**Zen Integration**: Toggle `Alt+Z` to maximize the coding area for purely focused prototyping.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full bg-card/50 border border-border p-8 rounded-[3px] text-left font-mono text-[13px]">
                            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                                <span className="font-bold text-primary">Playground.js</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                </div>
                            </div>
                            <div className="space-y-2 text-muted-foreground">
                                <p><span className="text-purple-400">const</span> <span className="text-blue-400">calculate</span> = (x) =&gt; &#123;</p>
                                <p className="pl-4"><span className="text-purple-400">return</span> x * <span className="text-orange-400">2</span>;</p>
                                <p>&#125;;</p>
                                <p className="text-emerald-500/50 italic">// Output: 42</p>
                            </div>
                            <div className="mt-6 p-3 bg-black/20 rounded border border-white/5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Console Output</p>
                                <p className="text-primary">&gt; Calculation complete.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 9. DevArcade Game Mode */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[13px] mb-8">
                        <Zap size={18} /> Component 09: Training Hub
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

                {/* 10. Admin Console */}
                <div className="mt-20 pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row items-start gap-16">
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-[13px]">
                                <Shield size={18} /> Component 10: Administration
                            </div>
                            <h2 className="text-[32px] font-bold leading-tight">System Control Center</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For authorized administrators only. Manage users, moderate content, and monitor system health from a unified command center.
                            </p>
                            <ul className="space-y-4 text-[14px]">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><Users size={14} /></div>
                                    <span>**User Management**: View, edit roles, and manage user accounts.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><FileText size={14} /></div>
                                    <span>**Content Moderation**: Pin, delete, or feature community content.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><Activity size={14} /></div>
                                    <span>**Analytics Dashboard**: Track system metrics and user activity.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><Download size={14} /></div>
                                    <span>**Data Export**: Download user and content data for backup.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full p-8 bg-gradient-to-br from-red-500/5 to-red-600/5 border-2 border-red-500/20 rounded-[3px] text-left">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield size={24} className="text-red-500" />
                                <div>
                                    <h4 className="font-bold text-[18px]">Security Level: Omega</h4>
                                    <p className="text-[11px] text-red-500 font-black uppercase tracking-tighter">Authorized Personnel Only</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-card border border-border rounded">
                                    <p className="text-[24px] font-black text-foreground">1,247</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Users</p>
                                </div>
                                <div className="p-4 bg-card border border-border rounded">
                                    <p className="text-[24px] font-black text-foreground">3,891</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Content Items</p>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-wider">Admin Access Required</p>
                            </div>
                        </div>
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
                <h2 className="text-[34px] font-bold leading-tight tracking-tight text-foreground">Your technical legacy <br /> starts with one note.</h2>
                <div className="flex justify-center gap-4">
                    <Link to="/notes/new" className="so-btn so-btn-primary px-10 py-4 font-bold text-[16px]">
                        Initialize First Entry <Zap size={18} className="ml-2" />
                    </Link>
                </div>
                <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Session_System: Stable // V2.9.0</p>
            </div>
        </div>
    );
};

export default Guide;
