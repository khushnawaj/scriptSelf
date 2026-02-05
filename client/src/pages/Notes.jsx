import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, getAllNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import Spinner from '../components/Spinner';
import {
    Search,
    Filter,
    Plus,
    MessageSquare,
    Eye,
    ThumbsUp,
    Clock,
    User,
    ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Notes = () => {
    const dispatch = useDispatch();
    const { notes, total, pagination, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories, isLoading: catsLoading } = useSelector((state) => state.categories);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [sort, setSort] = useState('newest'); // newest, public, private
    const [page, setPage] = useState(1);

    useEffect(() => {
        const catId = selectedCategory === 'All' ? null : selectedCategory;
        const type = selectedType === 'All' ? null : selectedType.toLowerCase();
        const isPublic = sort === 'public' ? true : (sort === 'private' ? false : null);

        const params = {
            search: searchTerm,
            page,
            limit: 10,
            category: catId,
            type: type
        };

        if (sort === 'public') params.public = true;

        dispatch(getNotes(params));
        dispatch(getCategories());

        // Handle search query from URL (Wiki-Links)
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam && !searchTerm) {
            setSearchTerm(decodeURIComponent(searchParam));
        }
    }, [dispatch, searchTerm, page, selectedCategory, selectedType, sort]);

    const handleCategoryClick = (id) => {
        setSelectedCategory(id);
        setPage(1);
    };

    const handleTypeClick = (type) => {
        setSelectedType(type);
        setPage(1);
    };

    if (notesLoading && page === 1) return <Spinner />;

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300 min-h-screen">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0 space-y-8">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 border-b border-border pb-2">Collections</h3>
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => handleCategoryClick('All')}
                            className={`text-left px-3 py-2 text-[13px] rounded-[3px] transition-all ${selectedCategory === 'All' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-foreground hover:bg-muted'}`}
                        >
                            All Records
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat._id)}
                                className={`text-left px-3 py-2 text-[13px] rounded-[3px] transition-all truncate ${selectedCategory === cat._id ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                title={cat.name}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 border-b border-border pb-2">Record Types</h3>
                    <div className="flex flex-wrap lg:flex-col gap-1">
                        {['All', 'Code', 'Doc', 'ADR', 'Pattern', 'CheatSheet'].map(type => (
                            <button
                                key={type}
                                onClick={() => handleTypeClick(type)}
                                className={`text-left px-3 py-2 text-[13px] rounded-[3px] transition-all ${selectedType === type ? 'bg-indigo-500/10 text-indigo-500 font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-[3px] border border-border">
                    <p className="text-[11px] text-muted-foreground font-bold uppercase mb-2">Reference Guide</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                        Use <code className="text-primary bg-primary/5 px-1 rounded">[[Title]]</code> in your notes to create dynamic references between records.
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                    <div className="space-y-1">
                        <h1 className="text-[27px] font-normal text-foreground leading-tight tracking-tight">Technical Library</h1>
                        <p className="text-[13px] text-muted-foreground">Archive of system logic, patterns, and architectural decisions.</p>
                    </div>
                    <Link to="/notes/new" className="so-btn so-btn-primary py-2.5 px-6 shrink-0 shadow-lg shadow-primary/10">
                        <Plus size={16} className="mr-1" /> Post New Record
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center py-4 border-b border-border gap-4">
                    <div className="text-[17px] font-normal text-foreground">
                        <span className="font-bold">{total}</span> entry pulse detected
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex border border-border rounded-[3px] overflow-hidden shadow-sm bg-card">
                            {['Newest', 'Public', 'Private'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSort(tab.toLowerCase())}
                                    className={`px-4 py-2 text-[12px] border-r border-border last:border-r-0 transition-all ${sort === tab.toLowerCase()
                                        ? 'bg-muted text-foreground font-bold'
                                        : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Feedback */}
                {searchTerm && (
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground bg-accent/20 px-3 py-1.5 rounded-[3px] border border-border">
                        <Search size={14} className="text-primary" />
                        Filtering by: <span className="font-bold text-foreground">"{searchTerm}"</span>
                        <button onClick={() => setSearchTerm('')} className="ml-auto text-[11px] font-bold uppercase hover:text-primary transition-colors">Clear Filter</button>
                    </div>
                )}

                {/* Note List */}
                <div className="flex flex-col">
                    {notes.map((note) => (
                        <div key={note._id} className="flex p-4 border-b border-border hover:bg-muted/10 transition-colors gap-4 group">
                            {/* Stats Column */}
                            <div className="flex flex-col items-end gap-3 w-16 shrink-0 pt-1 text-[13px]">
                                <div className="flex flex-col items-center opacity-40 group-hover:opacity-80 transition-opacity">
                                    <span className="font-bold text-foreground">{(note.views || 0) + 1}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Pulse</span>
                                </div>
                                <div className={`flex flex-col items-center border p-1.5 rounded-[3px] min-w-[56px] transition-all shadow-sm ${note.isPublic ? 'border-[#808000]/60 text-[#808000] bg-[#eff1e1] dark:bg-[#3d3d2d] dark:border-[#808000]/30' : 'border-border text-muted-foreground bg-muted/20'
                                    }`}>
                                    <span className="font-black text-[11px] uppercase tracking-tighter">{note.isPublic ? 'Public' : 'Vault'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.1em]">
                                    {note.type || 'DOC'}
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/notes/${note._id}`}
                                    className="text-[18px] font-normal text-link hover:text-link-hover mb-1 line-clamp-2 leading-snug transition-colors group-hover:underline"
                                >
                                    {note.title}
                                </Link>
                                <p className="text-[14px] text-muted-foreground line-clamp-2 mt-1 mb-4 font-normal leading-relaxed">
                                    {note.content.replace(/[#*`\[\]]/g, '').substring(0, 240)}...
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {note.category && <span className="so-tag bg-primary/5 text-primary border-primary/20">{note.category.name}</span>}
                                        {note.tags?.slice(0, 4).map((tag, i) => (
                                            <span key={i} className="so-tag bg-muted/50 text-muted-foreground border-transparent">#{tag}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2.5 ml-auto text-[12px] bg-accent/30 p-2 rounded-[3px] border border-transparent group-hover:border-border transition-all">
                                        <div className="w-6 h-6 bg-primary rounded-[2px] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                                            {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-link font-bold leading-none mb-0.5">
                                                {note.user?.username || 'User'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {notes.length === 0 && (
                        <div className="py-32 text-center bg-muted/10 rounded-[4px] border border-dashed border-border mt-4">
                            <MessageSquare size={48} className="mx-auto text-muted/30 mb-6" />
                            <h3 className="text-xl font-normal text-foreground">No tactical records found</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">Adjust your filters or initiate a new documentation pulse to populate this shelf.</p>
                            <Link to="/notes/new" className="text-primary hover:underline mt-6 inline-block font-bold uppercase tracking-widest text-[11px]">Initiate Logic Recording</Link>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {total > 10 && (
                    <div className="flex items-center justify-between pt-12 pb-20 mt-8 border-t border-border">
                        <div className="text-[13px] text-muted-foreground">
                            Frame <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{Math.ceil(total / 10)}</span>
                        </div>
                        <div className="flex border border-border rounded-[3px] shadow-sm bg-card overflow-hidden">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={!pagination.previous}
                                className="px-4 py-2 text-[12px] font-bold uppercase tracking-widest bg-transparent hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed border-r border-border transition-all"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={!pagination.next}
                                className="px-4 py-2 text-[12px] font-bold uppercase tracking-widest bg-transparent hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
