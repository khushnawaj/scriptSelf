import { useState, useEffect } from 'react';
import { X, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Spinner from './Spinner';

const UserListModal = ({ isOpen, onClose, userId, title, type }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/users/${userId}/${type}`);
                    setUsers(res.data.data || []);
                } catch (err) {
                    console.error('Failed to fetch user list');
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen, userId, type]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-card border border-border rounded-[4px] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground">{title}</h3>
                            <button onClick={onClose} className="p-1 hover:bg-muted/50 rounded-full transition-colors">
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto p-2 no-scrollbar">
                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <Spinner />
                                </div>
                            ) : users.length > 0 ? (
                                <div className="space-y-1">
                                    {users.map((u) => (
                                        <Link
                                            key={u._id}
                                            to={`/u/${u.username}`}
                                            onClick={onClose}
                                            className="flex items-center justify-between p-3 rounded-[3px] hover:bg-muted/50 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-[2px] flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                                    {u.avatar ? (
                                                        <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.username.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{u.username}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                                        {u.bio || 'ScriptShelf Member'}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-3">
                                    <User size={32} className="mx-auto text-muted-foreground opacity-20" />
                                    <p className="text-[13px] text-muted-foreground italic">No users found in this sector.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-muted/10 border-t border-border flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                            >
                                Close_Buffer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserListModal;
