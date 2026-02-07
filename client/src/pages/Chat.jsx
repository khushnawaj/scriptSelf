import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { Send, User, MessageCircle, ArrowLeft, Search, ShieldCheck, UserPlus, UserCheck, Users, Paperclip, File, Image as ImageIcon, Video, Loader2, Download, Maximize2, Zap, Wifi, Check, CheckCheck, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Chat = () => {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [connections, setConnections] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    const socketRef = useRef();
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const selectedFileRef = useRef(null);

    useEffect(() => {
        selectedFileRef.current = selectedFile;
    }, [selectedFile]);

    const activeFile = selectedFile || selectedFileRef.current;

    // Socket Management
    useEffect(() => {
        if (!user || socketRef.current) return;

        const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1').replace('/api/v1', '');
        socketRef.current = io(socketUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current.on('connect', () => {
            setIsSocketConnected(true);
            socketRef.current.emit('joinPrivate', user._id);
        });

        socketRef.current.on('disconnect', () => setIsSocketConnected(false));

        socketRef.current.on('privateMessage', (message) => {
            const senderId = (message.sender?._id || message.sender)?.toString();
            const myId = user?._id?.toString();

            setMessages((prev) => {
                if (senderId === myId) {
                    const optimisticIndex = prev.findIndex(m => {
                        if (m.status !== 'pending') return false;
                        if ((m.sender?._id || m.sender)?.toString() !== myId) return false;
                        if (m.message && message.message && m.message === message.message) return true;
                        if (m.attachment?.url && message.attachment?.url) {
                            const myUrl = m.attachment.url.split('?')[0];
                            const serverUrl = message.attachment.url.split('?')[0];
                            return myUrl === serverUrl;
                        }
                        return false;
                    });

                    if (optimisticIndex !== -1) {
                        const updated = [...prev];
                        updated[optimisticIndex] = message;
                        return updated;
                    }
                }

                if (prev.find(m => m._id === message._id)) return prev;
                return [...prev, message];
            });

            if (senderId !== myId) {
                socketRef.current.emit('messageDelivered', { messageId: message._id, senderId });
            }
        });

        socketRef.current.on('statusUpdate', ({ messageId, status }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
        });

        socketRef.current.on('messagesRead', ({ recipientId }) => {
            setMessages(prev => prev.map(m => {
                if (m.sender?._id?.toString() === user._id?.toString() && m.status !== 'read') {
                    return { ...m, status: 'read' };
                }
                return m;
            }));
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    const location = useLocation();

    useEffect(() => {
        if (user) {
            api.get(`/users/${user._id}/following`).then(res => {
                const connectionsList = res.data.data;
                setConnections(connectionsList);

                // Check if URL has user parameter (from notification)
                const params = new URLSearchParams(location.search);
                const userId = params.get('user');
                if (userId && !selectedRecipient) {
                    const targetUser = connectionsList.find(u => u._id === userId);
                    if (targetUser) {
                        setSelectedRecipient(targetUser);
                    }
                }
            });
        }
    }, [user, location.search]);

    useEffect(() => {
        if (user && selectedRecipient) {
            socketRef.current?.emit('markAsRead', {
                recipientId: user._id,
                senderId: selectedRecipient._id
            });

            api.get('/chat', { params: { recipientId: selectedRecipient._id } })
                .then(res => setMessages(res.data.data))
                .catch(() => toast.error('History sync failed'));
        }
    }, [user, selectedRecipient]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages]);

    const uploadFile = async (file) => {
        if (!file) return;

        const localPreview = {
            name: file.name,
            fileType: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
            url: URL.createObjectURL(file),
            isLocal: true
        };

        setSelectedFile(localPreview);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            URL.revokeObjectURL(localPreview.url);
            setSelectedFile(res.data.data);
            toast.success('📤 Ready to send', {
                duration: 2000,
                style: { background: '#10b981', color: '#fff', fontWeight: 'bold' }
            });
        } catch (err) {
            toast.error('Upload failed. Try again.');
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !activeFile) || !selectedRecipient) return;

        const tempId = Date.now().toString();
        const payload = {
            sender: user._id,
            message: newMessage,
            recipient: selectedRecipient._id,
            attachment: activeFile && activeFile.url ? activeFile : null,
            tempId
        };

        const optimisticMsg = {
            ...payload,
            _id: tempId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            sender: { _id: user._id, username: user.username, avatar: user.avatar }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSelectedFile(null);
        selectedFileRef.current = null;

        if (socketRef.current?.connected) {
            socketRef.current.emit('sendMessage', payload);
        } else {
            toast.error('Re-establishing link...');
            socketRef.current.connect();
        }
    };

    const conversationMessages = useMemo(() => {
        return messages.filter(m => {
            if (!selectedRecipient || !user) return false;
            const sId = (m.sender?._id || m.sender?.id || m.sender)?.toString();
            const rId = (m.recipient?._id || m.recipient?.id || m.recipient)?.toString();
            const myId = (user._id || user.id)?.toString();
            const tId = (selectedRecipient._id || selectedRecipient.id)?.toString();
            return (sId === tId && rId === myId) || (sId === myId && rId === tId);
        });
    }, [messages, selectedRecipient, user]);

    const filteredConnections = useMemo(() => {
        if (!searchQuery.trim()) return connections;
        const query = searchQuery.toLowerCase();
        return connections.filter(u =>
            u.username?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query)
        );
    }, [connections, searchQuery]);

    return (
        <div className="flex h-[calc(100vh-140px)] max-w-6xl mx-auto bg-card/50 dark:bg-card/30 border border-border/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Sidebar */}
            <div className={`w-full md:w-[320px] border-r border-border/50 flex flex-col bg-gradient-to-b from-secondary/5 to-transparent ${selectedRecipient ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-border/50 bg-background/80 dark:bg-background/40 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                            SIGNAL <Zap size={18} className="text-primary" />
                        </h2>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background/60 dark:bg-background/40 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                    {filteredConnections.map(u => (
                        <NodeItem
                            key={u._id}
                            user={u}
                            active={selectedRecipient?._id === u._id}
                            onClick={() => setSelectedRecipient(u)}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-gradient-to-b from-background/50 to-background/30 dark:from-background/20 dark:to-background/10 ${!selectedRecipient ? 'hidden md:flex' : 'flex'}`}>
                {selectedRecipient ? (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col h-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-background/90 dark:bg-background/60 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedRecipient(null)} className="md:hidden p-2 hover:bg-muted/50 rounded-full transition-colors">
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="w-11 h-11 rounded-xl border-2 border-primary/20 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-black text-primary shadow-inner">
                                    {selectedRecipient.avatar ? <img src={selectedRecipient.avatar} alt="" className="w-full h-full object-cover" /> : selectedRecipient.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black flex items-center gap-2 leading-none mb-1.5">
                                        {selectedRecipient.username}
                                        <ShieldCheck size={14} className="text-primary" />
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500'}`} />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            {isSocketConnected ? 'Encrypted' : 'Connecting...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); uploadFile(e.dataTransfer.files[0]); }}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-dots-pattern"
                        >
                            <AnimatePresence initial={false}>
                                {conversationMessages.map((msg) => (
                                    <MessageBubble key={msg._id} msg={msg} isMe={(msg.sender?._id || msg.sender) === user?._id} />
                                ))}
                            </AnimatePresence>
                            <div ref={scrollRef} className="h-2" />

                            <AnimatePresence>
                                {isDragging && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-4 z-50 bg-primary/95 dark:bg-primary/90 backdrop-blur-md rounded-3xl border-4 border-dashed border-white/30 flex flex-col items-center justify-center text-white shadow-2xl"
                                    >
                                        <Paperclip size={64} className="mb-4 animate-bounce" />
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Drop to Attach</h3>
                                        <p className="mt-2 text-white/70 font-medium">Instant cloud sync</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-background/95 dark:bg-background/70 backdrop-blur-xl border-t border-border/50">
                            <AnimatePresence>
                                {activeFile && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="mb-4 p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 rounded-2xl border border-primary/20 flex items-center gap-4 relative overflow-hidden shadow-lg"
                                    >
                                        {isUploading && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            />
                                        )}

                                        <div className={`w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary relative ${isUploading ? 'animate-pulse' : ''}`}>
                                            {isUploading ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : (
                                                <>
                                                    {activeFile.fileType === 'image' ? <ImageIcon size={24} /> : activeFile.fileType === 'video' ? <Video size={24} /> : <File size={24} />}
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 relative z-10">
                                            <p className="text-sm font-black text-foreground truncate mb-1">{activeFile.name}</p>
                                            <div className="flex items-center gap-2">
                                                {isUploading ? (
                                                    <p className="text-[10px] text-primary uppercase font-black tracking-widest animate-pulse">Uploading...</p>
                                                ) : activeFile.isLocal ? (
                                                    <p className="text-[10px] text-amber-500 dark:text-amber-400 uppercase font-black tracking-widest">Preview</p>
                                                ) : (
                                                    <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-black tracking-widest flex items-center gap-1">
                                                        <CheckCheck size={12} /> Ready
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {!isUploading && (
                                            <button
                                                onClick={() => {
                                                    if (activeFile.isLocal && activeFile.url) {
                                                        URL.revokeObjectURL(activeFile.url);
                                                    }
                                                    setSelectedFile(null);
                                                }}
                                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all relative z-10"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                                <div className="flex-1 bg-secondary/20 dark:bg-secondary/10 border border-border/50 rounded-2xl flex items-end p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300">
                                    <input type="file" ref={fileInputRef} onChange={(e) => uploadFile(e.target.files[0])} className="hidden" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={isUploading}
                                        className="p-3 text-muted-foreground hover:text-primary transition-colors flex-shrink-0 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                                    </button>
                                    <textarea
                                        rows="1"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-[14px] min-h-[46px] resize-none overflow-y-auto custom-scrollbar placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUploading || (!newMessage.trim() && !activeFile)}
                                    className="p-4 rounded-2xl bg-primary text-white hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary/20 dark:shadow-primary/30"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20 dark:opacity-10 pointer-events-none select-none">
                        <MessageCircle size={80} strokeWidth={1} />
                        <h2 className="text-4xl font-black uppercase tracking-[0.2em] mt-8 text-foreground/40">SECURE CHAT</h2>
                    </div>
                )}
            </div>

            <style>{`
                .bg-dots-pattern { 
                    background-image: radial-gradient(rgba(59, 130, 246, 0.08) 1.5px, transparent 1.5px); 
                    background-size: 24px 24px; 
                }
                .dark .bg-dots-pattern { 
                    background-image: radial-gradient(rgba(59, 130, 246, 0.12) 1.5px, transparent 1.5px); 
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(59, 130, 246, 0.2); 
                    border-radius: 10px; 
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(59, 130, 246, 0.3); 
                }
            `}</style>
        </div>
    );
};

const NodeItem = React.memo(({ user, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative group border ${active
            ? 'bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 shadow-lg shadow-primary/5'
            : 'border-transparent hover:bg-secondary/50 dark:hover:bg-secondary/30'
            }`}
    >
        <div className="relative">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border flex items-center justify-center text-primary font-black overflow-hidden transform transition-transform duration-300 group-hover:scale-110 ${active ? 'border-primary/40 dark:border-primary/50' : 'border-border/50'
                }`}>
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.username?.[0]?.toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[3px] border-card rounded-full ${active ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
            <p className={`font-black text-sm truncate uppercase tracking-tight transition-colors ${active ? 'text-primary' : 'text-foreground'
                }`}>{user.username}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-1">Active</p>
        </div>
    </button>
));

const MessageBubble = React.memo(({ msg, isMe }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : ''}`}
    >
        <div className={`relative p-4 rounded-2xl text-[14px] leading-relaxed border transition-all duration-300 ${isMe
            ? 'bg-primary text-white border-primary shadow-xl shadow-primary/10 dark:shadow-primary/20 rounded-tr-none'
            : 'bg-card dark:bg-card/80 text-foreground border-border/50 shadow-md dark:shadow-lg rounded-tl-none'
            }`}>
            {msg.attachment && msg.attachment.url && (
                <div className="mb-4 overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 border border-white/5 dark:border-white/10 shadow-inner cursor-pointer" onClick={() => window.open(msg.attachment.url, '_blank')}>
                    {(msg.attachment.fileType === 'image' || msg.attachment.type === 'image') ? (
                        <div className="relative group/asset overflow-hidden">
                            <img src={msg.attachment.url} alt="" className="max-w-full h-auto transition-transform duration-700 group-hover/asset:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 flex items-center justify-center transition-all duration-300">
                                <Maximize2 size={24} className="text-white transform scale-90 group-hover/asset:scale-100 transition-transform" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-white/5 dark:bg-white/10 hover:bg-white/10 dark:hover:bg-white/15 transition-colors">
                            <div className="w-10 h-10 bg-primary/20 dark:bg-primary/30 rounded-lg flex items-center justify-center text-primary">
                                <File size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate">{msg.attachment.name}</p>
                                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">File</p>
                            </div>
                            <Download size={18} className="opacity-40" />
                        </div>
                    )}
                </div>
            )}
            <p className="whitespace-pre-wrap">{msg.message}</p>
        </div>
        <div className={`mt-2 flex items-center gap-2 px-1 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-[9px] font-black uppercase opacity-20 dark:opacity-30 tracking-tighter">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMe && (
                <div className="transition-all duration-500">
                    {msg.status === 'pending' && <Clock size={10} className="text-muted-foreground/30 animate-pulse" />}
                    {msg.status === 'sent' && <Check size={11} className="text-muted-foreground/40" />}
                    {msg.status === 'delivered' && <CheckCheck size={11} className="text-muted-foreground/40" />}
                    {msg.status === 'read' && <CheckCheck size={11} className="text-blue-500 dark:text-blue-400" />}
                </div>
            )}
        </div>
    </motion.div>
));

export default Chat;
