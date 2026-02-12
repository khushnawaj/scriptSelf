import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Brain,
    Activity,
    LifeBuoy,
    Search,
    Folder,
    X,
    Filter,
    FolderTree,
    Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getAllNotes, getSharedNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import EngineeringLanding from '../components/EngineeringLanding';
import { getReputationTier } from '../utils/reputation';
import NeuralBackground from '../components/NeuralBackground';
import FolderSidebar from '../components/FolderSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notes, sharedNotes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const navigate = useNavigate();
    const [showFolders, setShowFolders] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);

    useEffect(() => {
        dispatch(getAllNotes());
        dispatch(getSharedNotes());
        dispatch(getCategories());
    }, [dispatch]);

    if (notesLoading) return <Spinner />;

    const userNotes = notes.filter(n => (n.user?._id || n.user) === user?._id);

    const filteredNotes = selectedFolder
        ? userNotes.filter(n => {
            const noteFolderId = n.folder?._id || n.folder;
            return noteFolderId && String(noteFolderId) === String(selectedFolder);
        })
        : userNotes;

    const currentTier = getReputationTier(user?.reputation || 0);

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
            {/* Dynamic Background for High Tiers */}
            {currentTier.name === 'Legendary Master' && <NeuralBackground variant="overlord" />}
            {currentTier.name === 'Expert Architect' && <NeuralBackground variant="grid" />}

            {/* Simple Modern Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                            <Brain size={32} strokeWidth={2.5} />
                        </div>
                        Home
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm pl-1">
                        Welcome back, <span className="text-foreground font-bold">{user?.username}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedFolder && (
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className="flex items-center gap-2 px-4 h-14 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs font-bold text-destructive hover:bg-destructive/15 transition-all"
                        >
                            <X size={14} /> Clear Filter
                        </button>
                    )}
                    <button
                        onClick={() => setShowFolders(true)}
                        className={`flex items-center gap-2 px-6 h-14 border rounded-2xl text-sm font-bold transition-all active:scale-95 ${selectedFolder ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    >
                        <FolderTree size={20} />
                        <span className="hidden sm:inline">{selectedFolder ? 'Filtered view' : 'Directories'}</span>
                    </button>
                    <button
                        onClick={() => navigate(selectedFolder ? `/notes/new?folder=${selectedFolder}` : '/notes/new')}
                        className="so-btn so-btn-primary h-14 px-10 shadow-xl shadow-primary/10 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 group active:scale-95 transition-all"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Create Note
                    </button>
                </div>
            </header>



            {/* Dashboard Content */}
            <main className="relative z-10">
                <EngineeringLanding notes={filteredNotes} sharedNotes={sharedNotes} user={user} />
            </main>

            {/* Folder Drawer - Responsive & Sleek */}
            <AnimatePresence mode="wait">
                {showFolders && (
                    <div className="fixed inset-0 z-[500]">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFolders(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-md"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-card border-l border-border shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                        <FolderTree size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Directories</h2>
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">File Management</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFolders(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-all active:scale-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <FolderSidebar
                                    className="w-full h-full bg-transparent border-none"
                                    selectedFolderId={selectedFolder}
                                    onSelectFolder={(id) => {
                                        setSelectedFolder(id);
                                        setShowFolders(false);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Simple Footer */}
            <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Connected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Status: Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/guide')} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                        <LifeBuoy size={14} /> Help Guide
                    </button>
                    <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-xl border border-border text-[11px] font-bold">
                        <Search size={14} className="opacity-40" />
                        <span className="opacity-40 uppercase tracking-widest">Search</span>
                        <div className="flex gap-1 ml-2">
                            <kbd className="min-w-[20px] text-center text-foreground font-sans uppercase">Ctrl</kbd>
                            <span className="opacity-40">+</span>
                            <kbd className="min-w-[20px] text-center text-foreground font-sans uppercase">K</kbd>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
