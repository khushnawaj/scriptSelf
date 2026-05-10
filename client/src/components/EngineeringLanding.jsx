import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Zap,
    Plus,
    ArrowRight,
    Search,
    Code,
    LayoutPanelTop,
    Database,
    Globe,
    Binary,
    ChevronRight,
    User,
    Activity
} from 'lucide-react';

const EngineeringLanding = ({ user, notes, sharedNotes = [] }) => {
    const navigate = useNavigate();

    // Calculate basic counts
    const stats = useMemo(() => {
        const adrs = notes.filter(n => n.type === 'adr').length;
        const publicNotes = notes.filter(n => n.isPublic).length;
        const total = notes.length;
        return { adrs, publicNotes, total };
    }, [notes]);

    const recentNotes = useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    }, [notes]);

    const actions = [
        { title: 'New Note', desc: 'Write down a new idea', icon: Plus, color: 'text-primary', bg: 'bg-primary/10', path: '/notes/new' },
        { title: 'Playground', desc: 'Test your code here', icon: Code, color: 'text-blue-500', bg: 'bg-blue-500/10', path: '/playground' },
        { title: 'Games', desc: 'Play coding games', icon: Binary, color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/arcade' },
        { title: 'Neural Graph', desc: 'Visual connections', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/network' },
        { title: 'All Notes', desc: 'Browse your library', icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10', path: '/notes' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Immersive Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {[
                    { label: 'Total_Vault_Items', value: stats.total, icon: FileText, color: 'text-primary' },
                    { label: 'Public_Handshakes', value: stats.publicNotes, icon: Globe, color: 'text-blue-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[1.5rem] hover:border-primary/40 transition-all group/stat relative overflow-hidden">
                        
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className={`p-3 rounded-xl bg-background/50 border border-border/50 ${stat.color} group-hover/stat:scale-110 transition-transform`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/60  tracking-[0.3em]">{stat.label}</span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tighter relative z-10">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main section */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Quick actions */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Zap size={18} />
                            </div>
                            <h2 className="text-[11px] font-bold  tracking-[0.3em] text-foreground">
                                System_Protocols
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {actions.map((action, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    onClick={() => navigate(action.path)}
                                    className="p-6 bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl cursor-pointer hover:border-primary/40 transition-all flex items-center gap-5 group relative overflow-hidden"
                                >
                                    
                                    <div className={`w-14 h-14 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shrink-0 border border-current/10 relative z-10`}>
                                        <action.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="font-bold text-[14px]  tracking-tighter group-hover:text-primary transition-colors">{action.title}</h4>
                                        <p className="text-[11px] text-muted-foreground/60 font-medium  tracking-widest mt-1">{action.desc}</p>
                                    </div>
                                    <ArrowRight size={18} className="ml-auto text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Work */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <Activity size={18} />
                                </div>
                                <h2 className="text-[11px] font-bold  tracking-[0.3em] text-foreground">
                                    Access_Logs
                                </h2>
                            </div>
                            <button onClick={() => navigate('/notes')} className="text-[10px] font-bold  text-primary hover:underline tracking-[0.2em] opacity-80">
                                decrypt_full_vault
                            </button>
                        </div>
                        <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2rem] overflow-hidden divide-y divide-border/20 shadow-2xl relative">
                            
                            {recentNotes.length > 0 ? recentNotes.map((note, i) => (
                                <div
                                    key={note._id}
                                    onClick={() => navigate(`/notes/${note._id}`)}
                                    className="p-6 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group relative z-10"
                                >
                                    <div className="flex items-center gap-6 min-w-0">
                                        <div className="text-[11px] font-bold w-8 text-center text-muted-foreground/20 group-hover:text-primary transition-colors font-mono">
                                            [{String(i + 1).padStart(2, '0')}]
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-[14px]  tracking-tighter text-foreground truncate group-hover:text-primary transition-colors">{note.title}</h4>
                                            <div className="flex items-center gap-4 mt-2 text-[10px] font-bold  tracking-widest">
                                                <span className="text-primary opacity-80">{note.category?.name || 'GEN_LOG'}</span>
                                                <span className="text-muted-foreground/20">•</span>
                                                <span className="text-muted-foreground/40 font-mono">
                                                    TS: {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="hidden sm:block text-[9px] font-bold bg-background/50 border border-border/50 px-3 py-1.5 rounded-lg text-muted-foreground/60 group-hover:text-primary group-hover:border-primary/20 transition-all  tracking-[0.2em]">
                                            TYPE::{note.type || 'RAW'}
                                        </div>
                                        <ChevronRight className="text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-16 text-center text-muted-foreground/30 font-bold  tracking-[0.3em] text-xs italic">
                                    No records found. Initialize vault sequence...
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Shared with Me */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Globe size={18} />
                                </div>
                                <h2 className="text-[11px] font-bold  tracking-[0.3em] text-foreground">
                                    Signal_Pulses
                                </h2>
                            </div>
                            <span className="text-[9px] font-bold  text-muted-foreground/40 tracking-[0.3em]">External_Handshakes</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {sharedNotes && sharedNotes.length > 0 ? sharedNotes.map((note) => (
                                <div
                                    key={note._id}
                                    onClick={() => navigate(`/notes/${note._id}`)}
                                    className="p-6 bg-card/40 backdrop-blur-xl border border-border/50 rounded-[1.5rem] hover:border-blue-500/40 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                        <Globe size={48} className="text-blue-500" />
                                    </div>
                                    <div className="flex flex-col gap-5 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/10">
                                                {note.user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-[15px]  tracking-tighter text-foreground group-hover:text-blue-500 transition-colors truncate">{note.title}</h4>
                                                <p className="text-[9px] text-muted-foreground/60 font-bold  tracking-[0.2em] mt-1">UPLINK_FROM: {note.user?.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/20">
                                            <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg  tracking-[0.1em]">{note.type || 'PULSE'}</span>
                                            <span className="text-[10px] text-muted-foreground/40 font-bold  tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-16 text-center border border-border/50 border-dashed rounded-[2rem] bg-card/10 opacity-30">
                                    <p className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground italic">No incoming signals detected...</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">

                    {/* User Status Card */}
                    <section className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] relative overflow-hidden group/profile shadow-2xl shadow-primary/5">
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-bold  tracking-[0.3em] text-primary flex items-center gap-2">
                                    <User size={14} /> My_Status
                                </h3>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 " />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary bg-background shadow-xl shadow-primary/10 relative group-hover/profile:scale-105 transition-transform duration-500">
                                        <div className="absolute -inset-1 bg-primary/20 blur-lg opacity-0 group-hover/profile:opacity-100 transition-opacity" />
                                        <span className="relative z-10">{user?.username?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-lg  tracking-tighter text-foreground truncate">{user?.username}</h4>
                                        <p className="text-[10px] text-muted-foreground/60 font-bold  tracking-widest truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-primary/10 grid grid-cols-2 gap-6">
                                    <div>
                                        <span className="text-[9px] font-bold text-muted-foreground/40  tracking-[0.2em] block mb-1">Total_Vault</span>
                                        <span className="text-xl font-bold tabular-nums tracking-tighter">{stats.total}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-muted-foreground/40  tracking-[0.2em] block mb-1">Reputation</span>
                                        <span className="text-xl font-bold tabular-nums tracking-tighter text-primary">{user?.reputation || 0}</span>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/profile')} className="w-full py-4 bg-primary text-white rounded-2xl font-bold  tracking-[0.3em] text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                                    Open_Identity_Module
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />
                    </section>

                    {/* Quick Tip / Intelligence */}
                    <section className="bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                <Search size={16} />
                            </div>
                            <h3 className="text-[10px] font-bold  tracking-[0.3em] text-foreground">Intelligence_Tip</h3>
                        </div>
                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed font-medium relative z-10">
                            The <span className="text-primary font-bold">Neural Console</span> (ALT+ENTER) allows you to execute quick lookups and system commands from any interface.
                        </p>
                        <div className="mt-8 p-5 bg-background/50 rounded-2xl border border-border/50 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all relative z-10" onClick={() => navigate('/arcade')}>
                            <span className="text-[10px] font-bold  tracking-[0.2em] text-muted-foreground group-hover:text-foreground">Initialize_Simulation</span>
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Binary size={16} strokeWidth={3} />
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );

};

export default EngineeringLanding;
