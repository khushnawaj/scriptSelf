import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Send } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { shareNote } from '../features/notes/noteSlice';
import api from '../utils/api';
import Spinner from './Spinner';
import { toast } from 'react-hot-toast';

const ShareNoteModal = ({ isOpen, onClose, noteId, currentSharedWith = [] }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [connections, setConnections] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            const fetchConnections = async () => {
                setLoading(true);
                try {
                    // Fetch both followers and following to give a full list of candidates
                    const [followersRes, followingRes] = await Promise.all([
                        api.get(`/users/${user._id}/followers`),
                        api.get(`/users/${user._id}/following`)
                    ]);

                    const allConnections = [...(followersRes.data.data || []), ...(followingRes.data.data || [])];
                    // Deduplicate
                    const uniqueConnections = Array.from(new Map(allConnections.map(u => [u._id, u])).values());

                    setConnections(uniqueConnections);
                } catch (err) {
                    console.error('Failed to fetch connections');
                    toast.error('Could not load your network');
                } finally {
                    setLoading(false);
                }
            };
            fetchConnections();
            setSelectedUsers(currentSharedWith.map(u => u._id || u));
        }
    }, [isOpen, user, currentSharedWith]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await dispatch(shareNote({ id: noteId, userIds: selectedUsers }));
            onClose();
        } finally {
            setIsSharing(false);
        }
    };

    const filteredUsers = connections.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
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
                                <Send size={18} className="text-primary" /> Direct Pulse Share
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Authorize access for selected sector agents</p>
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
                                placeholder="Search connections..."
                                className="w-full bg-secondary/30 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="px-3 py-2 max-h-[400px] overflow-y-auto no-scrollbar">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <Spinner />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Scanning Network...</p>
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="space-y-1">
                                {filteredUsers.map(u => (
                                    <button
                                        key={u._id}
                                        onClick={() => toggleUser(u._id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedUsers.includes(u._id) ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-secondary border border-border overflow-hidden flex items-center justify-center text-primary font-bold shadow-sm">
                                                {u.avatar ? (
                                                    <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-muted-foreground opacity-50 uppercase">{u.username.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{u.username}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">{u.bio || 'Network Member'}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedUsers.includes(u._id) ? 'bg-primary text-white' : 'bg-muted/50 border border-border'}`}>
                                            {selectedUsers.includes(u._id) && <Check size={14} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-40">
                                <p className="text-xs font-bold uppercase tracking-widest">No matching agents</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 border-t border-border flex items-center justify-between bg-muted/5">
                        <span className="text-[11px] font-bold text-muted-foreground">
                            {selectedUsers.length} Agent{selectedUsers.length !== 1 ? 's' : ''} Selected
                        </span>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="px-6 py-2 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSharing ? 'Syncing...' : 'Broadcast Access'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default ShareNoteModal;
