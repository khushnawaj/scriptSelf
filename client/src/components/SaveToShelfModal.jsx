
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Folder, Save, LayoutGrid } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import Spinner from './Spinner';
import { toast } from 'react-hot-toast';

const SaveToShelfModal = ({ isOpen, onClose, onConfirm, isCloning }) => {
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchFolders = async () => {
                setLoading(true);
                try {
                    const res = await api.get('/folders');
                    // Store folders in a flat list or tree? 
                    // For selection, flat list with nesting indication is good.
                    // But API returns valid tree or flat list?
                    // Previous analysis suggests flat list with 'parent' field.
                    // Let's assume flat list in data.
                    setFolders(res.data.data || []);
                } catch (err) {
                    console.error('Failed to fetch folders', err);
                    toast.error('Could not load folders');
                } finally {
                    setLoading(false);
                }
            };
            fetchFolders();
            setSelectedFolder(''); // Reset selection
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleConfirm = () => {
        onConfirm(selectedFolder);
    };

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-border bg-muted/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-foreground italic flex items-center gap-2">
                                <Save size={18} className="text-primary" /> Save to Shelf
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Select destination for cloned record</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground hover:text-foreground">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-6 pt-4 pb-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search folders..."
                                className="w-full bg-secondary/30 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Folder List */}
                    <div className="px-3 py-2 max-h-[400px] overflow-y-auto no-scrollbar">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <Spinner />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Architecture...</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Root Option */}
                                <button
                                    onClick={() => setSelectedFolder('')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedFolder === '' ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-secondary border border-border overflow-hidden flex items-center justify-center text-muted-foreground shadow-sm">
                                            <LayoutGrid size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Root Directory</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">Top level (No Folder)</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedFolder === '' ? 'bg-primary text-white' : 'bg-muted/50 border border-border'}`}>
                                        {selectedFolder === '' && <Check size={12} />}
                                    </div>
                                </button>

                                {/* Folders */}
                                {filteredFolders.map(folder => (
                                    <button
                                        key={folder._id}
                                        onClick={() => setSelectedFolder(folder._id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedFolder === folder._id ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-secondary border border-border overflow-hidden flex items-center justify-center text-primary font-bold shadow-sm" style={{ color: folder.color }}>
                                                <Folder size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{folder.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">Created {new Date(folder.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedFolder === folder._id ? 'bg-primary text-white' : 'bg-muted/50 border border-border'}`}>
                                            {selectedFolder === folder._id && <Check size={12} />}
                                        </div>
                                    </button>
                                ))}

                                {filteredFolders.length === 0 && search && (
                                    <div className="py-10 text-center opacity-40">
                                        <p className="text-xs font-bold uppercase tracking-widest">No matching folders</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 border-t border-border flex items-center justify-end gap-3 bg-muted/5">
                        <button onClick={onClose} className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isCloning}
                            className="px-6 py-2 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCloning ? 'Cloning...' : 'Save to Shelf'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default SaveToShelfModal;
