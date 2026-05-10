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
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="max-w-[1400px] mx-auto p-4 sm:p-10 space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
            {/* Dynamic Background for High Tiers */}
            {currentTier.name === 'Legendary Master' && <NeuralBackground variant="overlord" />}
            {currentTier.name === 'Expert Architect' && <NeuralBackground variant="grid" />}

            {/* Dev-OS Command Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-lg shadow-primary/5">
                            <Brain size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tighter text-foreground ">
                                Your Dashboard
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary " />
                                <p className="text-[10px] text-muted-foreground font-bold  tracking-[0.3em]">
                                    Active Session // <span className="text-foreground">{user?.username}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {selectedFolder && (
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className="flex items-center gap-3 px-5 h-14 bg-destructive/10 border border-destructive/20 rounded-2xl text-[10px] font-bold  tracking-[0.2em] text-destructive hover:bg-destructive/15 transition-all shadow-lg shadow-destructive/5"
                        >
                            <X size={16} strokeWidth={3} /> Clear Filter
                        </button>
                    )}
                    <button
                        onClick={() => setShowFolders(true)}
                        className={`flex items-center gap-3 px-6 h-14 border rounded-2xl text-[10px] font-bold  tracking-[0.2em] transition-all active:scale-95 relative overflow-hidden group ${selectedFolder ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-card/40 backdrop-blur-xl border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 shadow-lg'}`}
                    >
                        
                        <FolderTree size={18} strokeWidth={2.5} className="relative z-10" />
                        <span className="hidden sm:inline relative z-10">{selectedFolder ? 'Folder Active' : 'Browse Folders'}</span>
                    </button>
                    <button
                        onClick={() => navigate(selectedFolder ? `/notes/new?folder=${selectedFolder}` : '/notes/new')}
                        className="h-14 px-10 bg-primary text-white shadow-2xl shadow-primary/20 rounded-2xl text-[10px] font-bold  tracking-[0.3em] flex items-center gap-3 group active:scale-95 transition-all hover:translate-y-[-2px] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Plus size={20} strokeWidth={3} />
                        New Note
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
                            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-[450px] bg-card/90 backdrop-blur-2xl border-l border-border/50 shadow-2xl flex flex-col relative overflow-hidden"
                        >
                            
                            
                            <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/20 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                        <FolderTree size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold  tracking-tighter">Your Folders</h2>
                                        <p className="text-[10px] font-bold text-muted-foreground/60  tracking-[0.3em]">File Manager</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFolders(false)}
                                    className="p-3 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all active:scale-90 border border-transparent hover:border-destructive/20"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden relative z-10">
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

            {/* Technical Footer */}
            <footer className="pt-16 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3 group">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] " />
                        <span className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground group-hover:text-emerald-500 transition-colors">System Connected</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                            <Activity size={14} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors">Core Status: Stable</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/guide')} className="flex items-center gap-3 text-[10px] font-bold  tracking-[0.3em] text-muted-foreground hover:text-primary transition-all group">
                        <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                            <LifeBuoy size={14} strokeWidth={3} />
                        </div>
                        System Guide
                    </button>
                    <div className="flex items-center gap-4 bg-muted/50 px-6 py-3 rounded-2xl border border-border/50 text-[10px] font-bold">
                        <Search size={14} strokeWidth={3} className="text-primary" />
                        <span className="text-muted-foreground  tracking-[0.2em]">Quick Search</span>
                        <div className="flex gap-2 ml-4">
                            <kbd className="min-w-[24px] px-2 py-1 bg-background border border-border rounded-lg text-foreground font-mono">CTRL</kbd>
                            <span className="text-muted-foreground opacity-40">+</span>
                            <kbd className="min-w-[24px] px-2 py-1 bg-background border border-border rounded-lg text-foreground font-mono">K</kbd>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
