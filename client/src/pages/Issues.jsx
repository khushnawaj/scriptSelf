import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, resetNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import Spinner from '../components/Spinner';
import {
    Search,
    Plus,
    MessageSquare,
    CheckCircle2,
    HelpCircle,
    Clock,
    User,
    ArrowUp,
    Filter,
    Pin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Issues = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notes, total, pagination, isLoading } = useSelector((state) => state.notes);
    const { user } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, solved, open, unanswered, mine
    const [page, setPage] = useState(1);

    // Initial Fetch
    useEffect(() => {
        dispatch(getNotes({
            type: 'issue',
            page,
            limit: 10,
            search: searchTerm,
            // If we sort by 'solved' it's client side or need backend support?
            // For now, fetch all issues and client filter or ignoring 'solved' filter in API call
        }));

        return () => {
            dispatch(resetNotes());
        }
    }, [dispatch, page, searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        dispatch(getNotes({
            type: 'issue',
            page: 1,
            limit: 10,
            search: searchTerm
        }));
    };

    const handleAskQuestion = () => {
        if (!user) {
            navigate('/login');
        } else {
            // Redirect to new note with type=issue pre-selected?
            // Or create a specific /issues/new page?
            // For now, reuse /notes/new but maybe with state?
            navigate('/notes/new', { state: { type: 'issue' } });
        }
    };

    const filteredNotes = notes.filter(note => {
        if (filter === 'all') return true;
        const isSolved = note.comments?.some(c => c.isSolution);
        if (filter === 'solved') return isSolved;
        if (filter === 'open') return !isSolved;
        if (filter === 'unanswered') return (!note.comments || note.comments.length === 0);
        if (filter === 'mine') return user && note.user && (note.user._id === user._id || note.user === user._id);
        return true;
    });

    if (isLoading && page === 1 && notes.length === 0) return <Spinner />;

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <HelpCircle size={32} className="text-primary" /> Community Support
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Raise issues, ask for help, or contribute by solving problems for other developers.
                        Solutions are marked by the original poster.
                    </p>
                </div>
                <button
                    onClick={handleAskQuestion}
                    className="so-btn so-btn-primary py-3 px-6 shadow-xl shadow-primary/20 shrink-0"
                >
                    <Plus size={18} className="mr-2" /> Ask a Question
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary/30 border border-border rounded-[8px] py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:bg-background transition-all outline-none"
                    />
                </form>

                <div className="flex bg-secondary/30 p-1 rounded-[8px] border border-border shrink-0 overflow-x-auto">
                    {['All', 'Open', 'Solved', 'Unanswered', 'Mine'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-all ${filter === f.toLowerCase()
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
                {filteredNotes.map((note) => {
                    const isSolved = note.comments?.some(c => c.isSolution);
                    const solution = note.comments?.find(c => c.isSolution);

                    return (
                        <Link
                            key={note._id}
                            to={`/notes/${note._id}`}
                            className="block bg-card border border-border hover:border-primary/50 rounded-[12px] p-5 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                        >
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                {/* Vote/Status Column */}
                                <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3 sm:gap-1 min-w-0 sm:min-w-[60px] text-muted-foreground">
                                    <div className={`flex flex-col items-center justify-center p-2 rounded-[8px] w-full sm:w-full border ${isSolved ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-secondary/50 border-transparent'}`}>
                                        <span className="text-base sm:text-lg font-bold">{(note.views || 0) > 99 ? '99+' : (note.views || 0) + 1}</span>
                                        <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-wider">Views</span>
                                    </div>
                                    {isSolved && (
                                        <div className="flex sm:flex-col items-center gap-1 sm:gap-0 sm:mt-2 text-green-500">
                                            <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                            <span className="text-[9px] font-bold uppercase mt-0 sm:mt-1">Solved</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                                        {note.isPinned && <Pin size={16} className="text-amber-500 fill-amber-500 shrink-0" />}
                                        {note.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {note.content.replace(/[#*`\[\]]/g, '').substring(0, 150)}...
                                    </p>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs text-muted-foreground gap-4">
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-[9px] sm:text-[10px]">
                                                    {note.user?.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-foreground truncate max-w-[80px] sm:max-w-none">{note.user?.username}</span>
                                            </div>
                                            <span className="flex items-center gap-1 whitespace-nowrap">
                                                <Clock className="w-[11px] h-[11px] sm:w-3 sm:h-3" />
                                                {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1 whitespace-nowrap">
                                                <MessageSquare className="w-[11px] h-[11px] sm:w-3 sm:h-3" />
                                                {note.comments?.length || 0}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {note.tags?.slice(0, 2).map(tag => (
                                                <span key={tag} className="bg-secondary px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Solution Preview */}
                                    {isSolved && solution && (
                                        <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
                                            <div className="mt-0.5 text-green-500">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-bold mb-1">Solution by {solution.user?.username}</p>
                                                <p className="text-sm text-foreground/80 line-clamp-1 italic">"{solution.text}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {filteredNotes.length === 0 && (
                    <div className="text-center py-20 bg-secondary/10 rounded-[12px] border border-dashed border-border">
                        <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-bold text-foreground">No discussions found</h3>
                        <p className="text-muted-foreground text-sm mt-1">Be the first to ask a question to the community.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 10 && (
                <div className="flex justify-center mt-12 gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border border-border rounded hover:bg-muted disabled:opacity-50 text-sm"
                    >
                        Previous
                    </button>
                    <button
                        disabled={page * 10 >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border border-border rounded hover:bg-muted disabled:opacity-50 text-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Issues;
