import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, resetNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import Spinner from '../components/Spinner';
import LogicSeal from '../components/LogicSeal';
import Pagination from '../components/Pagination';
import { Activity } from 'react';
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
    ArrowUpRight,
    LayoutGrid,
    LayoutList
} from 'lucide-react';
import { getCoverGradientStyle } from '../utils/noteCover';

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
    const [libraryView, setLibraryView] = useState(() => {
        try {
            return localStorage.getItem('ss_notes_view') === 'shelf' ? 'shelf' : 'list';
        } catch {
            return 'list';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('ss_notes_view', libraryView);
        } catch { /* ignore */ }
    }, [libraryView]);

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
        <div className="flex-1 flex flex-col md:flex-row gap-8 lg:gap-10 animate-in fade-in duration-700">
            {/* Sidebar Filters - System Protocols */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-8 lg:space-y-10 p-6 lg:p-8 bg-card/20 backdrop-blur-xl border border-border/50 rounded-[2rem] relative overflow-hidden h-fit">


                <div className="space-y-6 relative z-10">
                    <h3 className="text-[10px] font-bold  tracking-[0.3em] text-primary border-b border-primary/20 pb-3 flex items-center justify-between">
                        COLLECTIONS_VAULT
                        <FolderTree size={12} className="opacity-50" />
                    </h3>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar -mx-2 px-2 lg:mx-0 lg:px-0">
                        <button
                            onClick={() => handleCategoryClick('All')}
                            className={`group flex items-center gap-3 px-4 py-3 text-[11px] font-bold  tracking-[0.1em] rounded-xl border transition-all whitespace-nowrap ${selectedCategory === 'All' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-background/50 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCategory === 'All' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-muted-foreground/30 group-hover:bg-primary'}`} />
                            All_Records
                        </button>
                        {(showMoreCategories ? categories : categories.slice(0, 5)).map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat._id)}
                                className={`group flex items-center gap-3 px-4 py-3 text-[11px] font-bold  tracking-[0.1em] rounded-xl border transition-all whitespace-nowrap ${selectedCategory === cat._id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-background/50 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                                title={cat.name}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCategory === cat._id ? 'bg-white shadow-[0_0_8px_white]' : 'bg-muted-foreground/30 group-hover:bg-primary'}`} />
                                <span className="truncate">{cat.name}</span>
                            </button>
                        ))}
                        {categories.length > 5 && (
                            <button
                                onClick={() => setShowMoreCategories(!showMoreCategories)}
                                className="text-[10px] font-bold text-primary hover:underline px-4 py-2 flex items-center gap-2 mt-1 shrink-0  tracking-widest"
                            >
                                {showMoreCategories ? 'collapse_tree' : 'expand_vault'}
                                <ChevronDown size={12} className={`transition-transform ${showMoreCategories ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <h3 className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground border-b border-border/50 pb-3 flex items-center justify-between">
                        SIGNAL_FILTERS
                        <Filter size={12} className="opacity-50" />
                    </h3>
                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar -mx-2 px-2 lg:mx-0 lg:px-0">
                        {['All', 'Code', 'Doc', 'ADR', 'Pattern', 'CheatSheet'].slice(0, showMoreTypes ? undefined : 4).map(type => (
                            <button
                                key={type}
                                onClick={() => handleTypeClick(type)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold  tracking-[0.2em] rounded-lg border transition-all whitespace-nowrap ${selectedType === type ? 'bg-foreground border-foreground text-background' : 'bg-background/50 border-border/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground'}`}
                            >
                                {type}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowMoreTypes(!showMoreTypes)}
                            className="text-[10px] font-bold text-primary hover:underline px-4 py-2 flex items-center gap-2 mt-1 shrink-0  tracking-widest"
                        >
                            {showMoreTypes ? 'min_types' : 'all_types'}
                            <ChevronDown size={12} className={`transition-transform ${showMoreTypes ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <h3 className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground border-b border-border/50 pb-3 flex items-center justify-between">
                        NEURAL_TAGS
                        <Tag size={12} className="opacity-50" />
                    </h3>
                    <div className={`flex flex-wrap gap-2 transition-all duration-300 ${showMoreTags ? 'max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1' : ''}`}>
                        {['React', 'Node', 'ADR', 'Python', 'Javascript', 'Security', 'Database', 'Architecture', 'CSS', 'HTML', 'Git', 'Cloud', 'DevOps', 'Mobile', 'UI/UX'].slice(0, showMoreTags ? undefined : 8).map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setSearchTerm(tag);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 text-[9px] font-bold  tracking-[0.15em] rounded-full border transition-all ${searchTerm.toLowerCase() === tag.toLowerCase() ? 'bg-primary/20 border-primary text-primary' : 'bg-background/50 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'}`}
                            >
                                #{tag}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowMoreTags(!showMoreTags)}
                            className="text-[10px] font-bold text-primary hover:underline px-4 py-2 flex items-center gap-2 mt-1 shrink-0  tracking-widest"
                        >
                            {showMoreTags ? 'compact' : 'full_index'}
                            <ChevronDown size={12} className={`transition-transform ${showMoreTags ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block bg-primary/5 p-6 rounded-2xl border border-primary/20 relative z-10">
                    <div className="text-[9px] font-bold text-primary  tracking-[0.3em] mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary " />
                        SYS_INTELLIGENCE
                    </div>
                    <p className="text-[12px] text-muted-foreground/80 leading-relaxed font-medium">
                        Use <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md font-mono">[[Title]]</code> to link records and build your neural knowledge graph.
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-border/50 pb-8">
                    <div>
                        <h1 className="text-xl font-bold text-foreground  tracking-tighter">Vault_Repository</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <p className="text-[10px] text-muted-foreground font-bold  tracking-[0.3em]">Status: Authorized_Access // {total} Records_Found</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                        <div className="flex bg-background/50 border border-border/50 rounded-xl overflow-hidden p-1 shadow-inner" title="Library layout">
                            <button
                                type="button"
                                onClick={() => setLibraryView('list')}
                                className={`p-2.5 rounded-lg transition-all ${libraryView === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted/50'}`}
                                aria-pressed={libraryView === 'list'}
                                aria-label="List view"
                            >
                                <LayoutList size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setLibraryView('shelf')}
                                className={`p-2.5 rounded-lg transition-all ${libraryView === 'shelf' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted/50'}`}
                                aria-pressed={libraryView === 'shelf'}
                                aria-label="Shelf view"
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>

                        <div className="flex bg-background/50 border border-border/50 rounded-xl overflow-hidden p-1 shadow-inner">
                            {(user ? ['Newest', 'Public', 'Private'] : ['Public']).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSort(tab.toLowerCase())}
                                    className={`px-5 py-2.5 text-[10px] font-bold  tracking-[0.2em] rounded-lg transition-all ${sort === tab.toLowerCase()
                                        ? 'bg-foreground text-background shadow-md'
                                        : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {user ? (
                            <Link to="/notes/new" className="h-12 px-6 bg-primary text-white shadow-xl shadow-primary/20 rounded-xl text-[10px] font-bold  tracking-[0.3em] flex items-center gap-2 group active:scale-95 transition-all shrink-0">
                                <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Initialize_Record</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="h-12 px-6 border-2 border-primary text-primary hover:bg-primary/10 rounded-xl text-[10px] font-bold  tracking-[0.3em] flex items-center gap-2 transition-all shrink-0">
                                Auth_Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search Feedback */}
                {(searchTerm || selectedFolder) && (
                    <div className="flex flex-wrap items-center gap-3 bg-primary/5 px-5 py-3 rounded-2xl border border-primary/20 animate-in slide-in-from-left-4 duration-500">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Search size={14} strokeWidth={3} />
                        </div>
                        <p className="text-[11px] font-bold  tracking-[0.2em] text-muted-foreground">
                            Active_Filter: <span className="text-foreground">{searchTerm || 'DIRECTORY_FILTER'}</span>
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedFolder(null);
                                const url = new URL(window.location);
                                url.searchParams.delete('folder');
                                window.history.replaceState({}, '', url);
                            }}
                            className="ml-auto text-[10px] font-bold  tracking-[0.2em] text-primary hover:text-primary/70 transition-colors border-b border-primary/20"
                        >
                            Reset_Core
                        </button>
                    </div>
                )}

                {/* Note List / Shelf */}
                <div className={`transition-opacity duration-500 ${notesLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    {libraryView === 'shelf' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                            {notes.map((note) => (
                                <Link
                                    key={note._id}
                                    to={`/notes/${note._id}`}
                                    className="group flex flex-col rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 relative"
                                >

                                    <div className="relative h-48 overflow-hidden shrink-0">
                                        {note.coverImageUrl ? (
                                            <img
                                                src={note.coverImageUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : note.coverGradient ? (
                                            <div
                                                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                                                style={getCoverGradientStyle(note.coverGradient) || undefined}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center p-8 group-hover:bg-background/30 transition-colors">
                                                <LogicSeal content={note.content} id={note._id} size={100} className="opacity-40 border-primary/20 group-hover:opacity-60 transition-opacity" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
                                        <div className="absolute top-4 left-4 flex items-center gap-2">
                                            <span className={`text-[9px] font-bold  tracking-[0.2em] px-3 py-1 rounded-full border backdrop-blur-md shadow-lg ${note.isPublic ? 'bg-primary/20 border-primary text-primary' : 'bg-background/80 border-border text-muted-foreground'}`}>
                                                {note.isPublic ? 'PUBLIC_PULSE' : 'SECURE_VAULT'}
                                            </span>
                                            {note.isPinned && <Pin size={16} className="text-primary fill-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]" />}
                                        </div>
                                        <span className="absolute bottom-4 right-4 text-[9px] font-bold  tracking-[0.2em] text-muted-foreground/60 bg-background/80 backdrop-blur px-3 py-1 rounded-lg border border-border/50 shadow-lg">
                                            TS::{note.type || 'RAW'}
                                        </span>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1 gap-4 relative z-10">
                                        <h3 className="text-[18px] font-bold text-foreground  tracking-tighter leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                            {note.title}
                                        </h3>
                                        <p className="text-[13px] text-muted-foreground/80 line-clamp-3 leading-relaxed flex-1 font-medium italic">
                                            {note.content.replace(/[#*`\[\]]/g, '').substring(0, 180)}
                                            {note.content.length > 180 ? '...' : ''}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/20">
                                            {note.category && (
                                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 flex items-center gap-1.5  tracking-widest">
                                                    <FolderTree size={10} /> {note.category.name}
                                                </span>
                                            )}
                                            {note.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-[9px] font-bold text-muted-foreground/60 bg-background/50 px-2 py-1 rounded-lg border border-border/50  tracking-widest">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-bold  tracking-widest pt-2">
                                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20 border border-white/10 group-hover:scale-110 transition-transform">
                                                {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-foreground/90 truncate">{note.user?.username || 'ANON_USER'}</span>
                                            <div className="ml-auto flex items-center gap-1.5 opacity-40">
                                                <Activity size={12} strokeWidth={3} className="text-emerald-500" />
                                                <span>{(note.views || 0) + 1} PULSE</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] overflow-hidden shadow-2xl relative">

                            {notes.map((note, i) => (
                                <div key={note._id} className="flex flex-col sm:flex-row p-6 hover:bg-primary/5 transition-all gap-6 group relative z-10 border-b border-border/20 last:border-b-0">
                                    {/* Technical Metadata Column */}
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 w-full sm:w-20 shrink-0 text-center">
                                        <div className="flex flex-col items-center opacity-20 group-hover:opacity-100 transition-opacity min-w-[50px] font-mono">
                                            <span className="text-lg font-bold text-foreground">[{String(i + 1).padStart(2, '0')}]</span>
                                            <span className="text-[8px] text-muted-foreground  tracking-[0.3em] font-bold">LOG_ID</span>
                                        </div>
                                        <div className={`flex flex-col items-center border-2 p-2 rounded-2xl min-w-[60px] sm:min-w-[64px] transition-all shadow-lg ${note.isPublic ? 'border-primary/40 text-primary bg-primary/5' : 'border-border/50 text-muted-foreground bg-background/50'}`}>
                                            <LogicSeal content={note.content} id={note._id} size={44} className="mb-1.5 border-none bg-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
                                            <span className="font-bold text-[9px]  tracking-tighter">{note.isPublic ? 'PUBLIC' : 'SECURE'}</span>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground/30 text-[9px] font-bold  tracking-[0.3em] group-hover:text-primary transition-colors">
                                            {note.type || 'RAW_DOC'}
                                        </div>
                                    </div>

                                    {/* Content Core Column */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/notes/${note._id}`}
                                            className="text-2xl font-bold text-foreground  tracking-tighter hover:text-primary transition-colors group-hover:translate-x-1 inline-flex items-center gap-3"
                                        >
                                            {note.isPinned && <Pin size={20} className="text-primary fill-primary shrink-0 " />}
                                            {note.title}
                                        </Link>
                                        <p className="text-[15px] text-muted-foreground/80 line-clamp-2 mt-2 mb-6 font-medium italic leading-relaxed">
                                            {note.content.replace(/[#*`\[\]]/g, '').substring(0, 280)}...
                                        </p>

                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                            <div className="flex flex-wrap gap-2.5">
                                                {note.category && (
                                                    <span className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 text-[10px] font-bold  tracking-[0.2em] shadow-sm">
                                                        <FolderTree size={12} strokeWidth={3} />
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
                                                        className="px-3 py-1.5 bg-background/50 text-muted-foreground/60 border border-border/50 rounded-xl hover:border-primary/50 hover:text-primary transition-all text-[10px] font-bold  tracking-[0.2em]"
                                                    >
                                                        #{tag}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-4 bg-background/50 p-2.5 rounded-2xl border border-border/50 group-hover:border-primary/20 transition-all w-fit xl:ml-auto">
                                                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20 border border-white/10">
                                                    {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex flex-col pr-4">
                                                    <span className="text-[11px] font-bold  tracking-[0.1em] text-foreground leading-none mb-1">
                                                        {note.user?.username || 'AUTH_ENTITY'}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground/50 font-bold  tracking-[0.2em]">
                                                        TS::{new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {notes.length === 0 && (
                        <div className="py-40 text-center bg-card/20 backdrop-blur-xl rounded-[3rem] border border-dashed border-border/50 mt-4 relative overflow-hidden group">

                            <MessageSquare size={64} className="mx-auto text-muted-foreground/20 mb-8 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-bold text-foreground  tracking-tighter">No_Tactical_Records_Found</h3>
                            <p className="text-muted-foreground/60 text-sm max-w-sm mx-auto mt-4 font-medium  tracking-widest leading-relaxed">Adjust your neural filters or initiate a new documentation pulse to populate this repository.</p>
                            <Link to="/notes/new" className="mt-10 h-12 px-10 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-xl font-bold  tracking-[0.3em] text-[10px] inline-flex items-center gap-2 transition-all">
                                Initialize_Logic_Uplink
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="pt-10">
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(total / 10)}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default Notes;
