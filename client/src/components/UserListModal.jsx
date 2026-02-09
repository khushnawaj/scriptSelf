import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
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

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/10">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">{title}</h3>
                            <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[450px] overflow-y-auto p-3 no-scrollbar">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <Spinner />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing sector...</p>
                                </div>
                            ) : users.length > 0 ? (
                                <div className="space-y-1.5">
                                    {users.map((u) => (
                                        <Link
                                            key={u._id}
                                            to={`/u/${u.username}`}
                                            onClick={onClose}
                                            className="flex items-center justify-between p-3.5 rounded-lg hover:bg-secondary/80 group transition-all border border-transparent hover:border-border"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-secondary border border-border rounded-lg flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
                                                    {u.avatar ? (
                                                        <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg text-muted-foreground opacity-50">{u.username.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{u.username}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 max-w-[180px]">
                                                        {u.bio || 'ScriptShelf Architect'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-1.5 bg-muted/50 rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mx-auto border border-border/50">
                                        <User size={24} className="text-muted-foreground opacity-30" />
                                    </div>
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">No connections found</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3.5 bg-muted/5 border-t border-border flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                            >
                                Dismiss_Overlay
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default UserListModal;
