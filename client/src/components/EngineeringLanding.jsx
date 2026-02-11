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

const EngineeringLanding = ({ user, notes }) => {
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
        <div className="space-y-10">
            {/* Simple stats cards */}
            <div className="grid grid-cols-2 gap-6">
                {[
                    { label: 'Total Notes', value: stats.total, icon: FileText },
                    { label: 'Public Notes', value: stats.publicNotes, icon: Globe },
                ].map((stat, i) => (
                    <div key={i} className="bg-card/50 border border-border p-6 rounded-2xl hover:bg-card transition-all group">
                        <div className="flex items-center gap-4 mb-3">
                            <stat.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main section */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Quick actions */}
                    <section>
                        <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {actions.map((action, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    onClick={() => navigate(action.path)}
                                    className="p-5 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all flex items-center gap-5 group"
                                >
                                    <div className={`w-14 h-14 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shrink-0`}>
                                        <action.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[15px] group-hover:text-primary transition-colors">{action.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                                    </div>
                                    <ArrowRight size={18} className="ml-auto text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Work */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black tracking-tight">Recent Notes</h2>
                            <button onClick={() => navigate('/notes')} className="text-[11px] font-black uppercase text-primary hover:underline tracking-widest">
                                View Library
                            </button>
                        </div>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                            {recentNotes.length > 0 ? recentNotes.map((note, i) => (
                                <div
                                    key={note._id}
                                    onClick={() => navigate(`/notes/${note._id}`)}
                                    className="p-5 flex items-center justify-between hover:bg-muted/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="text-[10px] font-black w-10 text-center text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-[15px] text-foreground truncate group-hover:text-primary transition-colors">{note.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] font-medium">
                                                <span className="text-primary font-bold uppercase tracking-widest">{note.category?.name || 'General'}</span>
                                                <span className="text-muted-foreground opacity-30">•</span>
                                                <span className="text-muted-foreground">Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:block text-[9px] font-black bg-muted px-2 py-1 rounded-md text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all uppercase tracking-widest">
                                            {note.type || 'Note'}
                                        </div>
                                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-all" />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-muted-foreground italic text-sm">
                                    No notes found yet. Click "New Note" to start.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">

                    {/* User Profile */}
                    <section className="bg-primary/5 border border-primary/20 p-6 rounded-[24px] relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                <User size={14} /> My Profile
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl border-2 border-primary/30 flex items-center justify-center text-xl font-black text-primary bg-primary/10">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base text-foreground capitalize leading-tight">{user?.username}</h4>
                                        <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-primary/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Total Items</span>
                                        <span className="text-xl font-black tabular-nums">{stats.total}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Public</span>
                                        <span className="text-xl font-black tabular-nums">{stats.publicNotes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />
                    </section>

                    {/* Quick Tip */}
                    <section className="bg-card border border-border p-6 rounded-[24px] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Search size={16} className="text-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] leading-none text-foreground">Quick Tip</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Use the **Playground** to test your code before saving it as a note. It's a great way to make sure everything works perfectly.
                        </p>
                        <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate('/arcade')}>
                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">Play Games</span>
                            <Binary size={14} className="text-muted-foreground group-hover:text-primary" />
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default EngineeringLanding;
