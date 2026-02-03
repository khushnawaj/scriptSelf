import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import {
    Activity,
    FileText,
    Folder,
    Trophy,
    Award,
    Plus,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories } = useSelector((state) => state.categories);

    useEffect(() => {
        dispatch(getNotes());
        dispatch(getCategories());
    }, [dispatch]);

    if (notesLoading) return <Spinner />;

    const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // Filter private vs public notes for dynamic stats
    const publicNotesCount = notes.filter(n => n.isPublic).length;
    const privateNotesCount = notes.length - publicNotesCount;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-[27px] font-normal text-foreground">Moderator Dashboard</h1>
                <Link to="/notes/new" className="so-btn so-btn-primary">
                    <Plus size={14} className="mr-1" /> New Record
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'My Records', value: notes.length, icon: FileText, color: 'text-indigo-600' },
                    { label: 'Public Posts', value: publicNotesCount, icon: Globe, color: 'text-emerald-600' },
                    { label: 'Private Vault', value: privateNotesCount, icon: Shield, color: 'text-slate-600' },
                    { label: 'Total Tags', value: categories.length, icon: Folder, color: 'text-amber-600' },
                ].map((stat, i) => (
                    <div key={i} className="border border-border p-6 rounded-[3px] bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
                            <stat.icon size={14} className={stat.color} />
                            <span>{stat.label}</span>
                        </div>
                        <h4 className="text-[24px] font-semibold text-foreground">{stat.value}</h4>
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
                                    <div className="text-[11px] font-bold px-2 py-0.5 border border-primary/30 text-primary bg-primary/5 rounded-[3px]">
                                        {note.isPublic ? 'PUBLIC' : 'VAULT'}
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
                            System Insights
                        </h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                            You currently have <span className="font-bold text-foreground">{notes.length}</span> active records across <span className="font-bold text-foreground">{categories.length}</span> tag categories.
                        </p>
                    </div>

                    <div className="border border-border p-5 rounded-[3px] bg-card">
                        <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Category Spread</h3>
                        <div className="space-y-3">
                            {categories.slice(0, 5).map(cat => {
                                const count = notes.filter(n => (n.category?._id || n.category) === cat._id).length;
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
