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
    const { notes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories, isLoading: catsLoading } = useSelector((state) => state.categories);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sort, setSort] = useState('newest');

    useEffect(() => {
        dispatch(getAllNotes());
        dispatch(getCategories());

        // Handle search query from URL (Wiki-Links)
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchTerm(decodeURIComponent(searchParam));
        }
    }, [dispatch]);

    const filteredNotes = notes.filter((note) => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || note.category?.name === selectedCategory;

        let matchesTab = true;
        if (sort === 'public') matchesTab = note.isPublic;
        if (sort === 'private') matchesTab = !note.isPublic;

        return matchesSearch && matchesCategory && matchesTab;
    });

    if (notesLoading || catsLoading) return <Spinner />;

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <h1 className="text-[27px] font-normal text-foreground">Technical Library</h1>
                <Link to="/notes/new" className="so-btn so-btn-primary py-2.5 px-3">
                    Post new record
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b border-border gap-4">
                <div className="text-[17px] font-normal text-foreground">
                    {filteredNotes.length} active records
                </div>
                <div className="flex border border-border rounded-[3px] overflow-hidden shadow-sm">
                    {['Newest', 'Public', 'Private'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSort(tab.toLowerCase())}
                            className={`px-3 py-2 text-[12px] border-r border-border last:border-r-0 transition-colors ${sort === tab.toLowerCase()
                                ? 'bg-muted text-foreground font-bold'
                                : 'bg-card text-muted-foreground hover:bg-muted/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Note List - Clinical SO Style */}
            <div className="flex flex-col">
                {filteredNotes.map((note) => (
                    <div key={note._id} className="flex p-4 border-b border-border hover:bg-muted/10 transition-colors gap-4 group">
                        {/* Stats Column */}
                        <div className="flex flex-col items-end gap-3 w-16 shrink-0 pt-1 text-[13px]">
                            <div className="flex flex-col items-center opacity-60">
                                <span className="font-medium text-foreground">1</span>
                                <span className="text-[11px] text-muted-foreground">point</span>
                            </div>
                            <div className={`flex flex-col items-center border p-1 rounded-[3px] min-w-[52px] ${note.isPublic ? 'border-[#808000] text-[#808000] bg-[#eff1e1] dark:bg-[#3d3d2d]' : 'border-border text-muted-foreground'
                                }`}>
                                <span className="font-bold">1</span>
                                <span className="text-[10px] uppercase font-bold">{note.isPublic ? 'Public' : 'Vault'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground/50">
                                <span className="font-normal text-[11px]">Dynamic</span>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                            <Link
                                to={`/notes/${note._id}`}
                                className="text-[17px] font-normal text-link hover:text-link-hover
 mb-1 line-clamp-2 leading-snug transition-colors"
                            >
                                {note.title}
                            </Link>
                            <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 mb-4 font-normal">
                                {note.content.replace(/[#*`]/g, '').substring(0, 200)}...
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-y-3">
                                <div className="flex flex-wrap gap-1">
                                    {note.category && <span className="so-tag">{note.category.name}</span>}
                                    {note.tags?.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="so-tag">#{tag}</span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 ml-auto text-[12px] bg-muted/30 p-1.5 rounded-[3px] border border-transparent group-hover:border-border transition-colors">
                                    <div className="w-5 h-5 bg-[#808000] rounded-[2px] flex items-center justify-center text-white text-[10px] font-bold">
                                        {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-link hover:underline cursor-pointer font-medium">
                                        {note.user?.username || 'User'}
                                    </span>
                                    <span className="text-muted-foreground hidden sm:inline">
                                        recorded {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredNotes.length === 0 && (
                    <div className="py-24 text-center">
                        <MessageSquare size={48} className="mx-auto text-muted/30 mb-4" />
                        <p className="text-muted-foreground text-lg">No archival entries match your current filters.</p>
                        <Link to="/notes/new" className="text-link hover:underline mt-2 block font-medium">Create a new entry</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
