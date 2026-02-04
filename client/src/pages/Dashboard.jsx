import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, getAllNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import {
    Activity,
    FileText,
    Folder,
    Trophy,
    Award,
    Plus,
    Clock,
    Globe,
    Shield,
    Database,
    Zap,
    Gamepad2,
    Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories } = useSelector((state) => state.categories);

    useEffect(() => {
        dispatch(getAllNotes());
        dispatch(getCategories());
    }, [dispatch]);

    if (notesLoading) return <Spinner />;

    // STRICTLY Filter for current user only
    const userNotes = notes.filter(n => (n.user?._id || n.user) === user?._id);

    const recentNotes = [...userNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // Filter private vs public notes for dynamic stats
    const publicNotesCount = userNotes.filter(n => n.isPublic).length;
    const privateNotesCount = userNotes.length - publicNotesCount;
    const adrCount = userNotes.filter(n => n.type === 'adr').length;
    const patternsCount = userNotes.filter(n => n.type === 'pattern').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end border-b border-border pb-6">
                <div>
                    <h1 className="text-[24px] font-semibold text-foreground tracking-tight">Technical Pulse</h1>
                    <p className="text-muted-foreground text-[13px] opacity-80">Welcome back, {user?.username}. Your knowledge base overview.</p>
                </div>
                <Link to="/notes/new" className="so-btn so-btn-primary h-10 px-6 flex items-center gap-2">
                    <Plus size={16} /> New Record
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'My Records', value: userNotes.length, icon: FileText, color: 'bg-indigo-500/10 text-indigo-500' },
                    { label: 'Logic Patterns', value: patternsCount, icon: Zap, color: 'bg-amber-500/10 text-amber-500' },
                    { label: 'Decision Records', value: adrCount, icon: Database, color: 'bg-rose-500/10 text-rose-500' },
                    { label: 'Public Posts', value: publicNotesCount, icon: Globe, color: 'bg-emerald-500/10 text-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="group relative border border-border/50 p-6 rounded-[6px] bg-card hover:border-primary/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-[6px] ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                            <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">{stat.label}</span>
                        </div>
                        <h4 className="text-[28px] font-semibold text-foreground tabular-nums">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h2 className="text-[19px] font-normal text-foreground">Recent Activity</h2>
                        <Link to="/notes" className="text-[13px] text-link hover:underline">View all records</Link>
                    </div>

                    <div className="border border-border rounded-[3px] bg-card divide-y divide-border overflow-hidden">
                        {recentNotes.length > 0 ? recentNotes.map((note) => (
                            <Link
                                to={`/notes/${note._id}`}
                                key={note._id}
                                className="block p-4 hover:bg-muted/30 transition-colors group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-normal text-link hover:text-link-hover truncate mb-1">
                                            {note.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                                            <span className="font-bold text-primary">{note.category?.name || 'GENERIC'}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="text-[10px] font-bold px-2 py-0.5 border border-primary/30 text-primary bg-primary/5 rounded-[3px] uppercase">
                                            {note.type || 'DOC'}
                                        </div>
                                        {note.type === 'adr' && (
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase">
                                                Decision: {note.adrStatus || 'Proposed'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="p-8 text-center text-muted-foreground italic">
                                No records found. Start documentation to see activity.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-accent/30 border border-primary/20 p-6 rounded-[3px]">
                        <h3 className="text-[15px] font-bold text-foreground mb-3 flex items-center gap-2">
                            Arcade Performance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] text-muted-foreground">Total XP</span>
                                <span className="text-[14px] font-bold text-primary flex items-center gap-1">
                                    <Trophy size={14} /> {user?.arcade?.points || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] text-muted-foreground">Active Streak</span>
                                <span className="text-[14px] font-bold text-orange-500 flex items-center gap-1">
                                    <Flame size={14} fill="currentColor" /> {user?.arcade?.streak || 0}
                                </span>
                            </div>
                            <div className="pt-2">
                                <Link to="/arcade" className="so-btn so-btn-primary w-full py-2 text-[12px] flex items-center justify-center gap-2">
                                    <Gamepad2 size={14} /> Enter Arcade
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border p-5 rounded-[3px] bg-card">
                        <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">System Insights</h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                            You currently have <span className="font-bold text-foreground">{userNotes.length}</span> active records across <span className="font-bold text-foreground">{categories.length}</span> tag categories.
                        </p>
                    </div>

                    <div className="border border-border p-5 rounded-[3px] bg-card">
                        <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Category Spread</h3>
                        <div className="space-y-3">
                            {categories.slice(0, 5).map(cat => {
                                const count = userNotes.filter(n => (n.category?._id || n.category) === cat._id).length;
                                const percentage = notes.length > 0 ? (count / notes.length) * 100 : 0;
                                return (
                                    <div key={cat._id} className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span className="text-muted-foreground">{cat.name}</span>
                                            <span className="text-foreground font-bold">{count}</span>
                                        </div>
                                        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
