import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, UserPlus, MessageSquare, Heart, Settings, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Access user state
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const { user } = useSelector((state) => state.auth);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            const data = res.data?.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Setup Socket.io for Real-time Notifications
        if (user && !socketRef.current) {
            const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1').replace('/api/v1', '');
            socketRef.current = io(socketUrl, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socketRef.current.on('connect', () => {
                // Join user's private room to receive personal notifications
                socketRef.current.emit('joinPrivate', user._id);
            });

            socketRef.current.on('notification', (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.success(`New ${newNotification.type}: ${newNotification.sender?.username || 'User'} sent a signal`);
            });
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            socketRef.current = null;
        };
    }, [fetchNotifications, user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read');
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            // Assuming backend supports /read-all or we map through unread
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
            if (unreadIds.length === 0) return;

            await Promise.all(unreadIds.map(id => api.put(`/notifications/${id}/read`)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications cleared");
        } catch (err) {
            toast.error("Failed to sync status");
        }
    }, [notifications]);

    const deleteNotification = useCallback(async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            const deleted = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification');
        }
    }, [notifications]);

    const clearAllNotifications = useCallback(async () => {
        if (!window.confirm("Purge all signal logs? This cannot be undone.")) return;
        try {
            // Map through all notifications and delete them
            await Promise.all(notifications.map(n => api.delete(`/notifications/${n._id}`)));
            setNotifications([]);
            setUnreadCount(0);
            toast.success("Intelligence logs purged");
        } catch (err) {
            toast.error("Failed to purge logs");
        }
    }, [notifications]);



    const getIcon = (type) => {
        switch (type) {
            case 'follow': return <UserPlus size={14} className="text-primary" />;
            case 'comment': return <MessageSquare size={14} className="text-emerald-500" />;
            case 'like': return <Heart size={14} className="text-rose-500" fill="currentColor" />;
            default: return <Settings size={14} className="text-muted-foreground" />;
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] rounded-2xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border bg-muted/20">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Signal Intelligence</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-tighter transition-colors"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearAllNotifications}
                                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-tighter transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                            </div>

                            {/* Tabs */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`text-[11px] font-bold pb-2 border-b-2 transition-all ${filter === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    All Logs
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`text-[11px] font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${filter === 'unread' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    Unread
                                    {unreadCount > 0 && <span className="w-4 h-4 rounded-full bg-primary/10 text-[9px] flex items-center justify-center font-black">{unreadCount}</span>}
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[420px] overflow-y-auto no-scrollbar py-2">
                            {filteredNotifications.length > 0 ? (
                                <div className="space-y-1 px-2">
                                    {filteredNotifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className={`relative group p-3 rounded-xl transition-all flex gap-4 ${n.isRead ? 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0' : 'bg-primary/[0.03] hover:bg-primary/[0.06]'}`}
                                        >
                                            <div className="shrink-0">
                                                <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm relative">
                                                    {getIcon(n.type)}
                                                    {!n.isRead && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[12px] leading-snug">
                                                        <span className="font-bold text-foreground">{n.sender?.username}</span>
                                                        <span className="text-muted-foreground ml-1">{n.message.replace(n.sender?.username, '').trim()}</span>
                                                    </p>
                                                    <button
                                                        onClick={() => deleteNotification(n._id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all shrink-0"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
                                                        {formatRelativeTime(n.createdAt)}
                                                    </span>
                                                    {n.link && (
                                                        <Link
                                                            to={n.link}
                                                            onClick={() => { markAsRead(n._id); setIsOpen(false); }}
                                                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            OPEN LOG <ExternalLink size={10} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto border border-border/50">
                                        <Bell size={24} className="text-muted-foreground opacity-10" />
                                    </div>
                                    <div className="space-y-1 px-8">
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Workspace Silence</p>
                                        <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">No active signals detected in this sector.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-muted/20 border-t border-border flex justify-center">
                            <button className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-colors">
                                Archive Management Protocol
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default NotificationBell;
