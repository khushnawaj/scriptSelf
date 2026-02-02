import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, createCategory } from '../features/categories/categorySlice';
import { Plus, Folder, Search, Globe, Lock, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, isLoading } = useSelector((state) => state.categories);
    const { user } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        const result = await dispatch(createCategory({
            name: newCatName,
            description: newCatDesc,
            isGlobal: user.role === 'admin' ? isGlobal : false
        }));

        if (!result.error) {
            toast.success('Category created');
            setShowModal(false);
            setNewCatName('');
            setNewCatDesc('');
            setIsGlobal(false);
        } else {
            toast.error(result.payload || 'Failed');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && categories.length === 0) return <div className="text-primary">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage your documentation structure</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-premium-primary"
                >
                    <Plus size={18} /> New Category
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => (
                    <div key={cat._id} className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                <Folder className="text-primary" size={24} />
                            </div>
                            {cat.isGlobal && (
                                <div title="Global Category" className="text-blue-400">
                                    <Globe size={18} />
                                </div>
                            )}
                            {!cat.isGlobal && (
                                <div title="Private Category" className="text-muted-foreground">
                                    <Lock size={18} />
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 h-10">
                            {cat.description || 'No description provided.'}
                        </p>
                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                            <span>{cat.notes ? cat.notes.length : 0} notes</span>
                            <span>{new Date(cat.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No categories found. Create your first one!
                </div>
            )}

            {/* Modal - Basic implementation */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Create Category</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                                    rows="3"
                                />
                            </div>

                            {user.role === 'admin' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="global"
                                        checked={isGlobal}
                                        onChange={(e) => setIsGlobal(e.target.checked)}
                                        className="w-4 h-4 rounded border-border bg-muted"
                                    />
                                    <label htmlFor="global" className="text-sm">Global Category</label>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-premium-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-premium-primary"
                                >
                                    <Save size={18} /> Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
