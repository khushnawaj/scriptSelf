import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, UserPlus, MessageSquare, Heart, Settings, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    const dropdownRef = useRef(null);

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
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

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

    const deleteNotification = useCallback(async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            // Recalculate unread if the deleted one was unread
            const deleted = notifications.find(n => n._id === id);
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification');
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-[8px] transition-all"
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 glass-morphism shadow-2xl z-[100] rounded-[12px] overflow-hidden border border-border"
                    >
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className={`p-4 group transition-colors flex gap-4 ${n.isRead ? 'opacity-60' : 'bg-primary/5 hover:bg-primary/10'}`}
                                        >
                                            <div className="shrink-0 pt-1">
                                                <div className="w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center">
                                                    {getIcon(n.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[13px] leading-snug">
                                                        <span className="font-bold text-foreground">{n.sender?.username}</span> {n.message.replace(n.sender?.username, '').trim()}
                                                    </p>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!n.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(n._id)}
                                                                className="p-1 hover:text-primary transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(n._id)}
                                                            className="p-1 hover:text-rose-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatRelativeTime(n.createdAt)}
                                                    </span>
                                                    {n.link && (
                                                        <Link
                                                            to={n.link}
                                                            onClick={() => { markAsRead(n._id); setIsOpen(false); }}
                                                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            VIEW <ExternalLink size={10} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-3">
                                    <Bell size={32} className="mx-auto text-muted-foreground opacity-20" />
                                    <p className="text-[13px] text-muted-foreground italic">No signals detected yet.</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-muted/10 border-t border-border text-center">
                                <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">
                                    Archive Signal Logs
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
