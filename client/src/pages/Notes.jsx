import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, resetNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import Spinner from '../components/Spinner';
import LogicSeal from '../components/LogicSeal';
import {
    Search,
    Filter,
    Plus,
    MessageSquare,
    Eye,
    ThumbsUp,
    Clock,
    User,
    ChevronDown,
    Tag,
    FolderTree,
    Pin,
    ArrowUpRight
} from 'lucide-react';

const Notes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { notes, total, pagination, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories, isLoading: catsLoading } = useSelector((state) => state.categories);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [sort, setSort] = useState(user ? 'newest' : 'public');
    const [page, setPage] = useState(1);
    const [showMoreCategories, setShowMoreCategories] = useState(false);
    const [showMoreTypes, setShowMoreTypes] = useState(false);
    const [showMoreTags, setShowMoreTags] = useState(false);

    // Sync search term and folder from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);

        const searchParam = urlParams.get('search');
        if (searchParam) {
            setSearchTerm(decodeURIComponent(searchParam));
        }

        const folderParam = urlParams.get('folder');
        if (folderParam) {
            setSelectedFolder(folderParam);
        }
    }, [location.search]);

    // Sync sort state when user login state changes
    useEffect(() => {
        if (!user && sort !== 'public') {
            setSort('public');
        }
    }, [user]);

    useEffect(() => {
        const catId = selectedCategory === 'All' ? null : selectedCategory;
        const type = selectedType === 'All' ? null : selectedType.toLowerCase();

        // If guest, always forcing public=true
        const isPublic = (!user || sort === 'public') ? true : (sort === 'private' ? false : null);

        const params = {
            search: searchTerm,
            page,
            limit: 10,
            category: catId,
            type: type
        };

        if (isPublic) params.public = true;
        if (selectedFolder) params.folder = selectedFolder;

        dispatch(getNotes(params));
        dispatch(getCategories());

        return () => {
            dispatch(resetNotes());
        };
    }, [dispatch, searchTerm, page, selectedCategory, selectedType, sort, user, selectedFolder]);

    const handleCategoryClick = (id) => {
        setSelectedCategory(id);
        setPage(1);
    };

    const handleTypeClick = (type) => {
        setSelectedType(type);
        setPage(1);
    };

    // Only show full spinner on absolute first mount (when total is -1)
    if (notesLoading && total === -1) return <Spinner />;

    return (
        <div className="flex-1 flex flex-col md:flex-row gap-6 lg:gap-8 animate-in fade-in duration-300">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-56 lg:w-64 shrink-0 space-y-6 lg:space-y-8 p-4 lg:p-6 border-b md:border-b-0 md:border-r border-border/50">
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
                        Collections
                        <FolderTree size={12} className="opacity-50" />
                    </h3>
                    <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                        <button
                            onClick={() => handleCategoryClick('All')}
                            className={`group flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 text-[12px] lg:text-[13px] rounded-[4px] border transition-all whitespace-nowrap lg:whitespace-normal ${selectedCategory === 'All' ? 'bg-primary border-primary text-white font-bold shadow-md shadow-primary/20' : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCategory === 'All' ? 'bg-white' : 'bg-muted-foreground/30 group-hover:bg-primary'}`} />
                            All Records
                        </button>
                        {(showMoreCategories ? categories : categories.slice(0, 5)).map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat._id)}
                                className={`group flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 text-[12px] lg:text-[13px] rounded-[4px] border transition-all whitespace-nowrap lg:whitespace-normal ${selectedCategory === cat._id ? 'bg-primary border-primary text-white font-bold shadow-md shadow-primary/20' : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                                title={cat.name}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCategory === cat._id ? 'bg-white' : 'bg-muted-foreground/30 group-hover:bg-primary'}`} />
                                <span className="truncate">{cat.name}</span>
                            </button>
                        ))}
                        {categories.length > 5 && (
                            <button
                                onClick={() => setShowMoreCategories(!showMoreCategories)}
                                className="text-[11px] font-bold text-primary hover:underline px-3 py-1 flex items-center gap-1 mt-1 shrink-0"
                            >
                                {showMoreCategories ? 'Show Less' : 'Show More'}
                                <ChevronDown size={12} className={`transition-transform ${showMoreCategories ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
                        Record Types
                        <Filter size={12} className="opacity-50" />
                    </h3>
                    <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                        {['All', 'Code', 'Doc', 'ADR', 'Pattern', 'CheatSheet'].slice(0, showMoreTypes ? undefined : 4).map(type => (
                            <button
                                key={type}
                                onClick={() => handleTypeClick(type)}
                                className={`flex items-center gap-2 lg:gap-3 px-3 py-1.5 lg:py-2 text-[10px] lg:text-[11px] uppercase tracking-wider font-bold rounded-[4px] border transition-all whitespace-nowrap ${selectedType === type ? 'bg-foreground border-foreground text-background shadow-sm' : 'bg-muted/30 border-transparent text-muted-foreground hover:border-border hover:bg-muted/50'}`}
                            >
                                {type}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowMoreTypes(!showMoreTypes)}
                            className="text-[11px] font-bold text-primary hover:underline px-3 py-1 flex items-center gap-1 mt-1 shrink-0"
                        >
                            {showMoreTypes ? 'Show Less' : 'Show More'}
                            <ChevronDown size={12} className={`transition-transform ${showMoreTypes ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
                        Global Tags
                        <Tag size={12} className="opacity-50" />
                    </h3>
                    <div className={`flex flex-wrap gap-2 transition-all duration-300 ${showMoreTags ? 'max-h-[200px] overflow-y-auto pr-2 custom-scrollbar p-1' : ''}`}>
                        {['React', 'Node', 'ADR', 'Python', 'Javascript', 'Security', 'Database', 'Architecture', 'CSS', 'HTML', 'Git', 'Cloud', 'DevOps', 'Mobile', 'UI/UX'].slice(0, showMoreTags ? undefined : 8).map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setSearchTerm(tag);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${searchTerm.toLowerCase() === tag.toLowerCase() ? 'bg-primary border-primary text-white' : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'}`}
                            >
                                #{tag}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowMoreTags(!showMoreTags)}
                            className="text-[11px] font-bold text-primary hover:underline px-3 py-1 flex items-center gap-1 mt-1 shrink-0"
                        >
                            {showMoreTags ? 'Show Less' : 'Show More'}
                            <ChevronDown size={12} className={`transition-transform ${showMoreTags ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block bg-muted/30 p-4 rounded-[4px] border border-border">
                    <p className="text-[11px] text-muted-foreground font-bold uppercase mb-2">Reference Guide</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                        Use <code className="text-primary bg-primary/5 px-1 rounded">[[Title]]</code> in your notes to create dynamic references between records.
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Technical Library</h1>
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        <div className="flex border border-border rounded-[3px] overflow-hidden shadow-sm bg-card shrink-0">
                            {(user ? ['Newest', 'Public', 'Private'] : ['Public']).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSort(tab.toLowerCase())}
                                    className={`px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] border-r border-border last:border-r-0 transition-all ${sort === tab.toLowerCase()
                                        ? 'bg-muted text-foreground font-bold'
                                        : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        {user ? (
                            <Link to="/notes/new" className="so-btn so-btn-primary py-2 px-3 text-[12px] shrink-0">
                                <Plus size={14} className="sm:mr-1" /> <span className="hidden sm:inline">Add Record</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="so-btn border border-primary text-primary hover:bg-primary/5 py-2 px-3 text-[12px] shrink-0 transition-all font-bold">
                                Log in
                            </Link>
                        )}
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

                {selectedFolder && (
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground bg-primary/5 px-3 py-1.5 rounded-[3px] border border-primary/20">
                        <FolderTree size={14} className="text-primary" />
                        Active Directory: <span className="font-bold text-foreground">Filtered View</span>
                        <button
                            onClick={() => {
                                setSelectedFolder(null);
                                // Remove 'folder' param from URL without page reload
                                const url = new URL(window.location);
                                url.searchParams.delete('folder');
                                window.history.replaceState({}, '', url);
                            }}
                            className="ml-auto text-[11px] font-bold uppercase hover:text-primary transition-colors"
                        >
                            Clear Directory
                        </button>
                    </div>
                )}

                {/* Note List */}
                <div className={`flex flex-col transition-opacity duration-300 ${notesLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    {notes.map((note) => (
                        <div key={note._id} className="flex flex-col sm:flex-row p-4 border-b border-border hover:bg-muted/10 transition-colors gap-4 group">
                            {/* Stats Column */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-16 shrink-0 sm:pt-1 text-[13px] border-b sm:border-none border-border/50 pb-2 sm:pb-0">
                                <div className="flex flex-col items-center opacity-40 group-hover:opacity-80 transition-opacity min-w-[40px]">
                                    <span className="font-bold text-foreground">{(note.views || 0) + 1}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Pulse</span>
                                </div>
                                <div className={`flex flex-col items-center border p-1 rounded-[3px] min-w-[50px] sm:min-w-[56px] transition-all shadow-sm ${note.isPublic ? 'border-[#808000]/60 text-[#808000] bg-[#eff1e1] dark:bg-[#3d3d2d] dark:border-[#808000]/30' : 'border-border text-muted-foreground bg-muted/20'
                                    }`}>
                                    <LogicSeal content={note.content} id={note._id} size={40} className="mb-1 border-none bg-transparent opacity-60" />
                                    <span className="font-black text-[10px] sm:text-[11px] uppercase tracking-tighter">{note.isPublic ? 'Public' : 'Vault'}</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-1 text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.1em]">
                                    {note.type || 'DOC'}
                                </div>
                                <div className="sm:hidden ml-auto text-muted-foreground/50 text-[10px] font-bold">
                                    {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/notes/${note._id}`}
                                    className="text-[18px] font-normal text-link hover:text-link-hover mb-1 line-clamp-2 leading-snug transition-colors group-hover:underline flex items-center gap-2"
                                >
                                    {note.isPinned && <Pin size={16} className="text-amber-500 fill-amber-500 shrink-0" />}
                                    {note.title}
                                </Link>
                                <p className="text-[14px] text-muted-foreground line-clamp-2 mt-1 mb-4 font-normal leading-relaxed">
                                    {note.content.replace(/[#*`\[\]]/g, '').substring(0, 240)}...
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {note.category && (
                                            <span className="so-tag bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                                                <FolderTree size={10} />
                                                {note.category.name}
                                            </span>
                                        )}
                                        {note.tags?.slice(0, 3).map((tag, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSearchTerm(tag);
                                                }}
                                                className="so-tag text-muted-foreground bg-muted/50 border-transparent hover:bg-primary/10 hover:text-primary transition-all text-[10px] sm:text-[11px]"
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2.5 ml-0 sm:ml-auto text-[11px] sm:text-[12px] bg-accent/30 p-1.5 sm:p-2 rounded-[3px] border border-transparent group-hover:border-border transition-all w-fit">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-[2px] flex items-center justify-center text-white text-[9px] sm:text-[11px] font-bold shadow-sm">
                                            {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-link font-bold leading-none mb-0.5">
                                                {note.user?.username || 'User'}
                                            </span>
                                            <span className="hidden sm:inline text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium">
                                                {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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
