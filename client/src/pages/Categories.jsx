import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, createCategory, deleteCategory } from '../features/categories/categorySlice';
import { getNotes } from '../features/notes/noteSlice';
import { Search, Plus, X, Folder, Trash2, Calendar, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Categories = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { categories, isLoading } = useSelector((state) => state.categories);
    const { notes } = useSelector((state) => state.notes);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });

    useEffect(() => {
        dispatch(getCategories());
        if (user) {
            dispatch(getNotes());
        } else {
            // For guest, fetch public notes to get counts correct?
            dispatch(getNotes({ public: true }));
        }
    }, [dispatch, user]);

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;
        await dispatch(createCategory(newCategory));
        setShowModal(false);
        setNewCategory({ name: '', description: '' });
        toast.success('Category added');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this tag category?')) {
            await dispatch(deleteCategory(id));
            toast.success('Category removed');
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <h1 className="text-[27px] font-normal text-foreground">Tags</h1>
                {user && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="so-btn so-btn-primary py-2.5 px-3"
                    >
                        Create new tag
                    </button>
                )}
            </div>

            <p className="text-[15px] font-normal text-muted-foreground max-w-2xl leading-relaxed">
                A tag is a keyword or label that categorizes your record with other, similar records.
                Using the right tags makes it easier for you to retrieve your technical patterns later.
            </p>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                    type="text"
                    placeholder="Filter by tag name"
                    className="w-full border border-border bg-background rounded-[3px] py-1.5 pl-9 pr-4 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tags Grid - Stack Overflow Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                {filteredCategories.map((cat) => {
                    const count = notes.filter(n => (n.category?._id || n.category) === cat._id).length;
                    return (
                        <div key={cat._id} className="border border-border p-4 rounded-[3px] flex flex-col justify-between hover:border-muted-foreground transition-colors bg-card">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="so-tag text-[12px]">{cat.name}</span>
                                    {user && (
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="text-muted-foreground hover:text-rose-500 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[12px] text-foreground/80 line-clamp-3 mb-4 leading-normal">
                                    {cat.description || 'No description provided for this technical category.'}
                                </p>
                            </div>
                            <div className="flex justify-between items-center text-[12px] text-muted-foreground">
                                <span>{count} records</span>
                                <span>added {new Date(cat.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal for Creation */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-card border border-border w-full max-w-md rounded-[3px] shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[19px] font-normal text-foreground">Create New Tag</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-bold mb-1">Tag Name</label>
                                <input
                                    className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold mb-1">Tag Description</label>
                                <textarea
                                    className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] min-h-[100px] outline-none focus:border-primary focus:ring-4 focus:ring-accent"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="so-btn so-btn-primary flex-1">Create Tag</button>
                                <button type="button" onClick={() => setShowModal(false)} className="so-btn bg-transparent hover:bg-muted/50 flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
