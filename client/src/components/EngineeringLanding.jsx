import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Code, Binary, HardDrive, BookOpen, FileText,
    ChevronRight, ArrowUpRight, Clock, Star, Zap
} from 'lucide-react';

const NOTE_TYPE_COLOR = {
    code: '#22c55e', doc: '#3b82f6', adr: '#f59e0b',
    pattern: '#a855f7', cheatsheet: '#06b6d4',
};

// ── Mini SVG circular arc ──
const Arc = ({ pct = 0, size = 72, stroke = 8, color = 'hsl(var(--primary))' }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="currentColor" strokeWidth={stroke} className="text-muted/50" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
    );
};

// ── Bar (activity chart) ──
const Bar = ({ h, active }) => (
    <div className="flex flex-col items-center gap-1 flex-1">
        <div className={`w-full rounded-full overflow-hidden flex flex-col justify-end ${active ? 'bg-transparent' : 'bg-muted/50'}`}
            style={{ height: 60 }}>
            <div className={`w-full rounded-full transition-all duration-700 ${active ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                style={{ height: `${h}%` }} />
        </div>
    </div>
);

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EngineeringLanding = ({ user, notes, sharedNotes = [], tier, navigate }) => {

    const stats = useMemo(() => ({
        total: notes.length,
        public: notes.filter(n => n.isPublic).length,
        snippets: notes.filter(n => n.type === 'code').length,
        rep: user?.reputation || 0,
        shared: sharedNotes.length,
    }), [notes, sharedNotes, user]);

    // Group notes by day of week
    const byDay = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        notes.forEach(n => {
            const d = new Date(n.createdAt).getDay();
            counts[d]++;
        });
        const max = Math.max(...counts, 1);
        return counts.map(c => Math.round((c / max) * 100));
    }, [notes]);

    const todayDay = new Date().getDay();
    const recent = useMemo(() =>
        [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
        [notes]
    );
    const publicPct  = stats.total ? Math.round((stats.public   / stats.total) * 100) : 0;
    const snippetPct = stats.total ? Math.round((stats.snippets / stats.total) * 100) : 0;
    const repPct     = Math.min(stats.rep % 100 || 0, 100);

    const actions = [
        { label: 'New Note',   icon: Plus,      color: 'hsl(var(--primary))', path: '/notes/new' },
        { label: 'Playground', icon: Code,       color: '#22c55e', path: '/playground' },
        { label: 'Files',      icon: HardDrive,  color: '#3b82f6', path: '/files' },
        { label: 'Library',    icon: BookOpen,   color: '#a855f7', path: '/notes' },
        { label: 'Arcade',     icon: Binary,     color: '#f59e0b', path: '/arcade' },
    ];

    // card style helper
    const card = 'rounded-3xl p-5 overflow-hidden relative bg-card border border-border/40 shadow-sm';

    return (
        <div className="space-y-5">

            {/* ── Welcome Row ────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-1 font-light">Overview</p>
                    <h1 className="text-4xl font-light tracking-tight text-foreground">
                        Welcome in, <span className="text-primary font-medium">{user?.username}</span>
                    </h1>
                </div>
                <button onClick={() => navigate('/notes/new')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium bg-primary text-primary-foreground transition-all active:scale-95 shadow-md hover:opacity-90">
                    <Plus size={15} /> New Note
                </button>
            </div>

            {/* ── Progress Bar Row ────────────────────── */}
            <div className={`${card} flex flex-col sm:flex-row items-center gap-4 py-4`}>
                {[
                    { label: 'Notes',    pct: Math.min(stats.total * 5, 100), accent: true },
                    { label: 'Public',   pct: publicPct },
                    { label: 'Snippets', pct: snippetPct },
                    { label: 'XP Progress', pct: repPct },
                ].map(({ label, pct, accent }) => (
                    <div key={label} className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>{label}</span><span>{pct}%</span>
                        </div>
                        <div className="h-7 rounded-2xl overflow-hidden relative bg-muted/60">
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`absolute inset-y-0 left-0 rounded-2xl flex items-center justify-end pr-3 ${accent ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}
                                style={{ minWidth: pct > 5 ? undefined : 0 }}>
                                {pct > 12 && <span className="text-[10px] font-medium">{pct}%</span>}
                            </motion.div>
                        </div>
                    </div>
                ))}

                {/* Big numbers */}
                <div className="hidden lg:flex items-center gap-8 pl-4 border-l border-border/40 shrink-0">
                    {[
                        { n: stats.total,   l: 'Notes' },
                        { n: stats.rep,     l: 'XP' },
                        { n: stats.shared,  l: 'Shared' },
                    ].map(({ n, l }) => (
                        <div key={l} className="text-center">
                            <p className="text-4xl font-light tracking-tight">{n}</p>
                            <p className="text-xs text-muted-foreground font-light mt-1">{l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bento Grid ──────────────────────────── */}
            <div className="grid grid-cols-12 gap-4">

                {/* Profile Card  col 1-3 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`${card} col-span-12 md:col-span-3 flex flex-col gap-4`}>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-light border border-primary bg-primary/10 text-primary shrink-0">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-base text-foreground">{user?.username}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tier?.bg} ${tier?.color} ${tier?.border} border mt-1 inline-block`}>
                                {tier?.name}
                            </span>
                        </div>
                    </div>

                    {/* Rep arc */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                            <Arc pct={repPct} size={80} stroke={6} color="hsl(var(--primary))" />
                            <span className="absolute text-sm font-medium">{repPct}%</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-light">Reputation</p>
                            <p className="text-3xl font-light text-foreground">{stats.rep}</p>
                            <p className="text-xs text-muted-foreground font-light">{tier?.name}</p>
                        </div>
                    </div>

                    <button onClick={() => navigate('/profile')}
                        className="mt-auto w-full py-2.5 rounded-2xl text-sm font-medium border border-border/50 text-foreground hover:border-primary/50 hover:text-primary transition-all">
                        View Profile
                    </button>
                </motion.div>

                {/* Activity Chart  col 4-7 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`${card} col-span-12 md:col-span-4`}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="font-medium text-foreground text-base">Activity</p>
                            <p className="text-xs text-muted-foreground font-light mt-0.5">Notes by day of week</p>
                        </div>
                        <button className="p-1.5 hover:bg-muted/50 rounded-xl transition-colors">
                            <ArrowUpRight size={14} className="text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex items-end gap-1.5 h-16 mb-2">
                        {byDay.map((h, i) => <Bar key={i} h={Math.max(h, 4)} active={i === todayDay} />)}
                    </div>
                    <div className="flex gap-1.5">
                        {DAYS.map((d, i) => (
                            <div key={i} className="flex-1 text-center text-[10px] font-medium"
                                style={{ color: i === todayDay ? 'hsl(var(--primary))' : 'var(--muted-foreground)' }}>
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground font-light">Total Notes</p>
                            <p className="text-2xl font-light">{stats.total}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground font-light">Snippets</p>
                            <p className="text-2xl font-light" style={{ color: '#22c55e' }}>{stats.snippets}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats arc  col 8-9 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className={`${card} col-span-12 md:col-span-2 flex flex-col items-center justify-center gap-3`}>
                    <p className="text-xs font-medium text-muted-foreground self-start">Public Ratio</p>
                    <div className="relative flex items-center justify-center">
                        <Arc pct={publicPct} size={90} stroke={6} color="#3b82f6" />
                        <span className="absolute text-xl font-light">{publicPct}%</span>
                    </div>
                    <div className="w-full space-y-2">
                        {[
                            { l: 'Public',   v: stats.public,   c: '#3b82f6' },
                            { l: 'Snippets', v: stats.snippets, c: '#22c55e' },
                        ].map(({ l, v, c }) => (
                            <div key={l} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground font-light">
                                    <span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
                                </span>
                                <span className="font-medium">{v}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Notes card  col 10-12 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`${card} col-span-12 md:col-span-3 bg-muted/20`}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-medium text-sm font-light">Recent Notes</p>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">{recent.length}/5</span>
                    </div>
                    <div className="space-y-3">
                        {recent.length > 0 ? recent.map((note, i) => (
                            <div key={note._id}
                                onClick={() => navigate(note.type === 'code' ? `/playground?id=${note._id}` : `/notes/${note._id}`)}
                                className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        background: NOTE_TYPE_COLOR[note.type] ? NOTE_TYPE_COLOR[note.type] + '15' : 'var(--muted)',
                                        border: `1px solid ${NOTE_TYPE_COLOR[note.type] || 'var(--border)'}`
                                    }}>
                                    <FileText size={12} style={{ color: NOTE_TYPE_COLOR[note.type] || 'var(--muted-foreground)' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground truncate transition-colors font-light">
                                        {note.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-light">
                                        {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center shrink-0">
                                    <div className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-xs text-muted-foreground text-center py-4 font-light">No notes yet</p>
                        )}
                    </div>
                    <button onClick={() => navigate('/notes')}
                        className="mt-4 w-full py-2 rounded-2xl text-xs font-medium transition-all hover:opacity-90 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground">
                        View All Notes
                    </button>
                </motion.div>

                {/* Quick Actions  col 1-5 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className={`${card} col-span-12 md:col-span-5`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={14} className="text-primary" />
                        <p className="font-medium text-sm text-foreground">Quick Actions</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {actions.map((a) => (
                            <button key={a.label} onClick={() => navigate(a.path)}
                                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border/40 hover:border-primary/50 transition-all group hover:shadow-sm hover:bg-muted/30">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: a.color + (a.color.includes('hsl') ? '/10' : '18'), border: `1px solid ${a.color}${a.color.includes('hsl') ? '/30' : '30'}` }}>
                                    <a.icon size={17} style={{ color: a.color, strokeWidth: 1.5 }} />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors">
                                    {a.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Shared with me  col 6-12  */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className={`${card} col-span-12 md:col-span-7`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Star size={13} className="text-primary" />
                            <p className="font-medium text-sm text-foreground">Shared with me</p>
                        </div>
                        {sharedNotes.length > 0 && (
                            <button onClick={() => navigate('/notes')}
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors font-light">
                                See all <ChevronRight size={11} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>

                    {sharedNotes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {sharedNotes.slice(0, 4).map((note) => (
                                <div key={note._id}
                                    onClick={() => navigate(`/notes/${note._id}`)}
                                    className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 hover:border-primary/40 hover:bg-muted/30 cursor-pointer group transition-all">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-medium text-sm shrink-0 bg-primary/10 text-primary border border-primary/20">
                                        {note.user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors font-light">{note.title}</p>
                                        <p className="text-[11px] text-muted-foreground font-light">by {note.user?.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border/40 rounded-2xl">
                            <div className="w-10 h-10 rounded-2xl mb-3 flex items-center justify-center bg-primary/10 border border-primary/20">
                                <Star size={18} className="text-primary" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium text-foreground">No shared notes yet</p>
                            <p className="text-xs text-muted-foreground mt-1 font-light">Notes shared by others will appear here</p>
                        </div>
                    )}
                </motion.div>

            </div>{/* end bento grid */}
        </div>
    );
};

export default EngineeringLanding;
