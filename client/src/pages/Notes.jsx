import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, deleteNote } from '../features/notes/noteSlice'; // Ensure deleteNote is exported
import { getCategories } from '../features/categories/categorySlice';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search,
    Plus,
    FileText,
    Code,
    Trash2,
    Edit,
    Filter,
    ExternalLink,
    PlayCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import Spinner from '../components/Spinner';

const Notes = () => {
    const dispatch = useDispatch();

    const { notes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories, isLoading: catsLoading } = useSelector((state) => state.categories);

    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        if (categoryFilter && categories.length > 0) {
            const foundCat = categories.find(c => c.name.toLowerCase() === categoryFilter.toLowerCase());
            if (foundCat) setSelectedCategory(foundCat._id);
        }
    }, [categoryFilter, categories]);

    useEffect(() => {
        dispatch(getNotes());
        dispatch(getCategories());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            await dispatch(deleteNote(id));
            toast.success('Note deleted');
        }
    };

    // Filtering Logic
    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory ? note.category?._id === selectedCategory : true;
        const matchesType = selectedType ? note.type === selectedType : true;

        return matchesSearch && matchesCategory && matchesType;
    });

    if (notesLoading || catsLoading) return (
        <div className="mt-10">
            <Spinner message="Retrieving your notes..." />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Notes</h1>
                    <p className="text-muted-foreground">Manage and organize your codebase.</p>
                </div>
                <Link
                    to="/notes/new"
                    className="btn-premium-primary"
                >
                    <Plus size={18} /> New Note
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-muted border border-border rounded-lg px-4 py-2 pl-10 appearance-none outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-48 cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none" size={16} />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="bg-muted border border-border rounded-lg px-4 py-2 pl-10 appearance-none outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-40 cursor-pointer"
                        >
                            <option value="">All Types</option>
                            <option value="code">Code</option>
                            <option value="doc">Document</option>
                            <option value="pdf">PDF</option>
                        </select>
                        <Code className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.length > 0 ? filteredNotes.map((note) => (
                    <div key={note._id} className="group bg-card border border-border p-6 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 relative flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <Link to={`/notes/${note._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors shrink-0">
                                    {note.type === 'code' ? <Code className="text-primary" size={20} /> : <FileText className="text-primary" size={20} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors flex items-center gap-2 truncate">
                                        {note.title}
                                        {note.videoUrl && <PlayCircle size={14} className="text-primary animate-pulse shrink-0" title="Tutorial Note" />}
                                    </h3>
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        {note.category?.name || 'Uncategorized'}
                                    </span>
                                </div>
                            </Link>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <Link to={`/notes/edit/${note._id}`} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                    <Edit size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(note._id)}
                                    className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4 flex-1">
                            {note.content.substring(0, 150)}...
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {note.tags && note.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-[10px] font-bold uppercase tracking-tighter bg-muted px-2 py-0.5 rounded text-muted-foreground hover:text-primary transition-colors">#{tag}</span>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            <Link to={`/notes/${note._id}`} className="flex items-center gap-1 text-primary hover:gap-2 transition-all">
                                View Note <ExternalLink size={12} />
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground italic font-medium">
                        No notes found matching your criteria.
                    </div>
                )}
            </div>

            {filteredNotes.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No notes found. Try adjusting filters or create a new one.
                </div>
            )}
        </div>
    );
};

export default Notes;
