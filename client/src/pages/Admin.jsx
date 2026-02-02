import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Users,
    Trash2,
    Shield,
    ShieldAlert,
    Activity,
    FolderTree,
    Settings,
    Search,
    UserPlus,
    Tag,
    Plus,
    X,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/Spinner';

const Admin = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', isGlobal: true });

    // If not admin, redirect
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, catsRes] = await Promise.all([
                api.get('/users'),
                api.get('/categories')
            ]);
            setUsers(usersRes.data.data);
            setCategories(catsRes.data.data);
        } catch (error) {
            toast.error('Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to remove this user? This cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User removed');
        } catch (error) {
            toast.error('Failed to remove user');
        }
    };

    const handleToggleGlobal = async (catId, isGlobal) => {
        try {
            await api.put(`/categories/${catId}`, { isGlobal: !isGlobal });
            setCategories(categories.map(c => c._id === catId ? { ...c, isGlobal: !isGlobal } : c));
            toast.success('Category updated');
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/categories', newCategory);
            setCategories([...categories, data.data]);
            setShowCategoryModal(false);
            setNewCategory({ name: '', description: '', isGlobal: true });
            toast.success('Global Category Created');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create category');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-[3px] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-[3px]">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-[27px] font-normal text-foreground">Admin Center</h1>
                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-wider font-bold">
                            <ShieldCheck size={12} /> System Management Console
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[13px] font-bold text-foreground">User: {user.username}</p>
                        <p className="text-[11px] text-primary font-bold uppercase">Super Admin Privileges</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
                    { label: 'Total Categories', value: categories.length, icon: Tag, color: 'text-amber-500' },
                    { label: 'Public Content', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-emerald-500' },
                    { label: 'System Status', value: 'Active', icon: Activity, color: 'text-rose-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-4 rounded-[3px] shadow-sm">
                        <div className="flex justify-between items-start">
                            <stat.icon size={20} className={stat.color} />
                            <span className="text-[21px] font-bold text-foreground">{stat.value}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Management Area */}
            <div className="bg-card border border-border rounded-[3px] shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border bg-muted/20">
                    {[
                        { id: 'users', label: 'User Management', icon: Users },
                        { id: 'categories', label: 'Global Categories', icon: FolderTree },
                        { id: 'settings', label: 'System Settings', icon: Settings }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-[13px] font-bold transition-all border-b-2 ${activeTab === tab.id
                                ? 'border-primary text-primary bg-background'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & Actions Bar */}
                <div className="p-4 bg-muted/10 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-[3px] text-[13px] outline-none focus:border-primary"
                        />
                    </div>
                    {activeTab === 'categories' && (
                        <button onClick={() => setShowCategoryModal(true)} className="so-btn so-btn-primary px-4">
                            <Plus size={14} className="mr-2" /> Add Global Category
                        </button>
                    )}
                </div>

                {/* Content Tabs */}
                <div className="p-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="overflow-x-auto"
                            >
                                <table className="w-full text-left text-[13px]">
                                    <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 font-bold uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 font-bold uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 font-bold uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 font-bold uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-[3px] bg-primary/20 text-primary flex items-center justify-center font-bold">
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-foreground">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-[3px] text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {u._id !== user.id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {activeTab === 'categories' && (
                            <motion.div
                                key="categories"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {filteredCategories.map(cat => (
                                    <div key={cat._id} className="border border-border p-4 rounded-[3px] bg-muted/10 group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="so-tag">{cat.name}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleGlobal(cat._id, cat.isGlobal)}
                                                    className={`p-1 rounded ${cat.isGlobal ? 'text-primary' : 'text-muted-foreground'} hover:bg-muted`}
                                                    title={cat.isGlobal ? 'Make Private' : 'Make Global'}
                                                >
                                                    <Shield size={14} />
                                                </button>
                                                <button className="p-1 text-muted-foreground hover:text-rose-500 rounded hover:bg-muted">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-muted-foreground line-clamp-2">{cat.description || 'No description provided.'}</p>
                                        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                                            <span className={cat.isGlobal ? 'text-primary' : 'text-muted-foreground'}>
                                                {cat.isGlobal ? 'Global Access' : 'Private Tag'}
                                            </span>
                                            <span className="text-muted-foreground/50">Used in {cat.notes?.length || 0} notes</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="p-12 text-center space-y-4"
                            >
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                    <Settings size={32} />
                                </div>
                                <div>
                                    <h3 className="text-[19px] font-bold">System Config in Read-only Mode</h3>
                                    <p className="text-muted-foreground text-[14px] max-w-sm mx-auto">
                                        Advanced system parameters are currently managed via the server environment variables for security.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Global Category Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-md rounded-[3px] shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[19px] font-bold text-foreground flex items-center gap-2">
                                    <Tag size={20} className="text-primary" /> Create Global Category
                                </h3>
                                <button onClick={() => setShowCategoryModal(false)}>
                                    <X size={20} className="text-muted-foreground hover:text-foreground" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-bold mb-1">Category Name</label>
                                    <input
                                        className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] outline-none focus:border-primary"
                                        placeholder="e.g. System Architecture"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold mb-1">Description</label>
                                    <textarea
                                        className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] min-h-[100px] outline-none focus:border-primary"
                                        placeholder="What kind of records belong here?"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    />
                                </div>
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-[3px]">
                                    <p className="text-[11px] text-primary font-bold uppercase flex items-center gap-1">
                                        <ShieldCheck size={12} /> Pro Tip
                                    </p>
                                    <p className="text-[12px] text-muted-foreground mt-1">
                                        Global categories are visible to **all users** on the platform. Use them for standard technologies or common frameworks.
                                    </p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="so-btn so-btn-primary flex-1 py-2.5">Create Category</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(false)}
                                        className="so-btn bg-transparent hover:bg-muted/50 border border-border flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Admin;
