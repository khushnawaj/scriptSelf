import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { Send, User, MessageCircle, X, ChevronUp, ChevronDown, Users, Globe, ArrowLeft, Search, Zap, ShieldCheck, UserPlus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Chat = () => {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeTab, setActiveTab] = useState('global'); // 'global', 'inbox', 'private'
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [usersList, setUsersList] = useState([]);

    const socketRef = useRef();
    const scrollRef = useRef();

    // Listen for events from sidebar
    useEffect(() => {
        const handleOpenChat = (e) => {
            setIsOpen(true);
            setIsMinimized(false);
            if (e.detail?.tab) {
                setActiveTab(e.detail.tab);
                setMessages([]);
            }
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    useEffect(() => {
        if (user) {
            const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
            socketRef.current = io(socketUrl);

            // Join personal room
            socketRef.current.emit('joinPrivate', user._id);

            // Global messages
            socketRef.current.on('message', (message) => {
                if (activeTab === 'global') {
                    setMessages((prev) => [...prev, message]);
                }
            });

            // Private messages
            socketRef.current.on('privateMessage', (message) => {
                if (selectedRecipient && (message.sender?._id === selectedRecipient._id || message.sender === selectedRecipient._id)) {
                    setMessages((prev) => [...prev, message]);
                }
            });

            return () => {
                socketRef.current.disconnect();
            };
        }
    }, [user, activeTab, selectedRecipient]);

    useEffect(() => {
        if (user && isOpen && (activeTab === 'global' || activeTab === 'private')) {
            fetchMessages();
        }
    }, [user, activeTab, selectedRecipient, isOpen]);

    const fetchMessages = async () => {
        try {
            const params = activeTab === 'private' ? { recipientId: selectedRecipient._id } : {};
            const res = await api.get('/chat', { params });
            setMessages(res.data.data);
        } catch (err) {
            console.error('Failed to fetch chat history');
        }
    };

    const fetchUsers = async () => {
        if (!searchQuery.trim()) {
            setUsersList([]);
            return;
        }
        try {
            const res = await api.get('/users');
            const filtered = res.data.data.filter(u =>
                u._id !== user._id &&
                u.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setUsersList(filtered);
        } catch (err) {
            console.error('Failed to fetch users');
        }
    };

    useEffect(() => {
        if (activeTab === 'inbox') {
            const delayDebounceFn = setTimeout(() => {
                fetchUsers();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery, activeTab]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender: user._id,
            message: newMessage,
            recipient: activeTab === 'private' ? selectedRecipient._id : null
        };

        socketRef.current.emit('sendMessage', messageData);
        setNewMessage('');
    };

    const startPrivateChat = (recipient) => {
        setMessages([]);
        setSelectedRecipient(recipient);
        setActiveTab('private');
    };

    const toggleFollow = async (e, userId, isFollowing) => {
        e.stopPropagation();
        try {
            if (isFollowing) {
                await api.delete(`/users/${userId}/follow`);
                toast.success('Unfollowed');
            } else {
                await api.post(`/users/${userId}/follow`);
                toast.success('Following');
            }
            // Refresh list
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Action failed');
        }
    };

    if (!user) return null;

    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-tr from-primary to-primary-hover text-white rounded-[20px] shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] z-[1000] flex items-center gap-3 group border border-white/10"
            >
                <div className="relative">
                    <MessageCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary animate-pulse" />
                </div>
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className={`fixed bottom-6 right-6 w-[380px] sm:w-[420px] bg-card/90 backdrop-blur-[20px] border border-white/10 rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden flex flex-col transition-all duration-500 ring-1 ring-white/5 ${isMinimized ? 'h-[80px]' : 'h-[600px]'}`}
        >
            {/* Header */}
            <div className="p-6 bg-muted/30 border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    {activeTab === 'private' ? (
                        <button onClick={() => { setMessages([]); setActiveTab('inbox'); }} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5 active:scale-95">
                            <ArrowLeft size={16} className="text-primary" />
                        </button>
                    ) : (
                        <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Zap size={20} className="text-primary animate-pulse" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-[17px] font-black text-foreground tracking-tight flex items-center gap-2">
                            {activeTab === 'private' ? selectedRecipient?.username : 'Technical Pulse'}
                            {activeTab === 'private' && <ShieldCheck size={14} className="text-green-500" />}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-[0.15em]">
                            {activeTab === 'private' ? 'P2P Encrypted Node' : 'Global Network Stream'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-muted-foreground border border-transparent hover:border-white/5">
                        {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all text-muted-foreground border border-transparent hover:border-rose-500/10">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Navigation Tabs */}
                    <div className="flex p-1.5 bg-muted/20 border-b border-white/5 gap-1.5 relative z-10">
                        <button
                            onClick={() => { setMessages([]); setActiveTab('global'); }}
                            className={`flex-1 flex items-center justify-center py-2.5 gap-2.5 text-[11px] font-black uppercase tracking-[0.1em] rounded-2xl transition-all ${activeTab === 'global' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <Globe size={14} /> Global Stream
                        </button>
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`flex-1 flex items-center justify-center py-2.5 gap-2.5 text-[11px] font-black uppercase tracking-[0.1em] rounded-2xl transition-all ${activeTab === 'inbox' || activeTab === 'private' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <Users size={14} /> Network Nodes
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-transparent flex flex-col relative z-20">
                        <AnimatePresence mode="wait">
                            {activeTab === 'inbox' ? (
                                <motion.div
                                    key="inbox"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="p-5 space-y-4"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <Search size={15} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            placeholder="Search Technical Nodes..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-muted/40 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-[14px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {!searchQuery.trim() ? (
                                            <div className="py-12 text-center space-y-4 opacity-40">
                                                <Search size={32} className="mx-auto" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Search to connect with Nodes</p>
                                            </div>
                                        ) : usersList.length === 0 ? (
                                            <div className="py-12 text-center space-y-2 opacity-40">
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">No Nodes found matching frequency</p>
                                            </div>
                                        ) : (
                                            usersList.map((u, i) => {
                                                const isFollowing = u.followers?.includes(user._id);
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        key={u._id}
                                                        onClick={() => startPrivateChat(u)}
                                                        className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 rounded-2xl transition-all group border border-transparent hover:border-primary/10 active:scale-[0.98] cursor-pointer"
                                                    >
                                                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-primary font-bold overflow-hidden border border-white/5 group-hover:border-primary/20 transition-all">
                                                            {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <User size={24} />}
                                                        </div>
                                                        <div className="flex-1 flex flex-col items-start gap-0.5">
                                                            <span className="text-[15px] font-black text-foreground group-hover:text-primary transition-colors">{u.username}</span>
                                                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter bg-muted/50 px-1.5 py-0.5 rounded border border-white/5">{u.role} NODE</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => toggleFollow(e, u._id, isFollowing)}
                                                            className={`p-2.5 rounded-xl transition-all border ${isFollowing ? 'border-primary/20 text-primary bg-primary/5' : 'border-white/5 text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                                                        >
                                                            {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                                                        </button>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="messages"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 p-6 space-y-6"
                                >
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30 select-none">
                                            <div className="p-6 bg-muted/30 rounded-[30px] border border-white/5">
                                                <Zap size={48} className="text-primary" />
                                            </div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed">System standby.<br />Awaiting technical signals.</p>
                                        </div>
                                    )}
                                    {messages.map((msg, i) => {
                                        const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                key={i}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : ''}`}
                                            >
                                                {!isMe && (
                                                    <div className="flex items-center gap-2 mb-2 px-1">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{msg.sender?.username}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                                        <span className="text-[9px] font-bold text-muted-foreground/30 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                                <div className={`p-4 rounded-[22px] text-[14px] leading-relaxed shadow-lg transition-all border ${isMe
                                                    ? 'bg-gradient-to-br from-primary to-primary-hover text-white rounded-tr-none border-primary shadow-primary/20'
                                                    : 'bg-muted/40 backdrop-blur-md text-foreground rounded-tl-none border-white/5 shadow-black/5'
                                                    }`}>
                                                    {msg.message}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={scrollRef} className="h-4" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    {(activeTab === 'global' || activeTab === 'private') && (
                        <div className="p-6 bg-muted/30 border-t border-white/5 relative z-30">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <div className="flex-1 relative group bg-background/30 rounded-[20px] p-1 border border-white/5 focus-within:border-primary/50 transition-all">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={activeTab === 'private' ? "Inject secure bitstream..." : "Broadcast to network..."}
                                        className="w-full bg-transparent px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground/20 font-medium"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-14 h-14 bg-primary text-white rounded-[20px] flex items-center justify-center transition-all shadow-xl shadow-primary/30 disabled:opacity-40 disabled:scale-100 border border-white/10"
                                >
                                    <Send size={22} className="rotate-[-10deg]" />
                                </motion.button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default Chat;
