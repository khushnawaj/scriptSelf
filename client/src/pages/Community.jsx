import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { Send, Globe, Zap, Paperclip, File, Image as ImageIcon, Video, Loader2, Download, ArrowLeft, Maximize2, X, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Community = () => {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const selectedFileRef = useRef(null);

    useEffect(() => {
        selectedFileRef.current = selectedFile;
    }, [selectedFile]);

    const fileToSend = selectedFile || selectedFileRef.current;
    const [isDragging, setIsDragging] = useState(false);

    const socketRef = useRef();
    const scrollRef = useRef();
    const fileInputRef = useRef();

    // Initial fetch of messages (Public access)
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get('/chat');
                setMessages(res.data.data);
            } catch (err) {
                console.error('Failed to fetch chat history');
            }
        };
        fetchMessages();
    }, []);

    // Socket connection (Authenticated users only)
    useEffect(() => {
        if (!user) return;

        const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1').replace('/api/v1', '');
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('[SOCKET] Connected to Community');
        });

        socketRef.current.on('message', (message) => {
            console.log('[SOCKET] Received Global Message:', message);
            setMessages((prev) => {
                if (prev.find(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    // Paste support
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const file = new File([blob], `screenshot_${Date.now()}.png`, { type: 'image/png' });
                        uploadFile(file);
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large (max 10MB)');
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedFile(res.data.data);
            toast.success('File uploaded successfully');
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const socketId = socketRef.current?.id;
        const isConnected = socketRef.current?.connected;

        console.log('[COMMUNITY] Send Triggered. SocketID:', socketId, 'Connected:', isConnected);
        console.log('[COMMUNITY] Message:', newMessage, 'File Source:', selectedFile ? 'STATE' : (selectedFileRef.current ? 'REF' : 'NONE'));

        if (!newMessage.trim() && !fileToSend) return;

        const messageData = {
            sender: user._id,
            message: newMessage,
            recipient: null,
            attachment: fileToSend && fileToSend.url ? fileToSend : null
        };

        console.log('[COMMUNITY] Final Payload:', JSON.stringify(messageData, null, 2));

        if (socketRef.current?.connected) {
            socketRef.current.emit('sendMessage', messageData);
            setNewMessage('');
            setSelectedFile(null);
            selectedFileRef.current = null;
        } else {
            toast.error('Not connected to live stream');
        }
    };

    const handleEditMessage = (msg) => {
        setEditingMessageId(msg._id);
        setNewMessage(msg.message);
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/chat/${editingMessageId}`, { message: newMessage });
            // Optimistic update
            setMessages(prev => prev.map(m => m._id === editingMessageId ? { ...m, message: newMessage, isEdited: true } : m));
            setEditingMessageId(null);
            setNewMessage('');
            toast.success('Message updated');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update failed');
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/chat/${msgId}`);
            setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, message: 'This message was deleted', attachment: null } : m));
            toast.success('Message deleted');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Delete failed');
        }
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) uploadFile(file);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) uploadFile(file);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Globe size={18} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-foreground tracking-tight">Community Feed</h1>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Live Technical Stream</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 rounded-full border border-green-500/10">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-background/50 relative ${isDragging ? 'bg-primary/5' : ''}`}
            >
                {isDragging && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary m-4 rounded-xl pointer-events-none">
                        <Paperclip size={48} className="text-primary animate-bounce mb-4" />
                        <p className="text-lg font-bold text-foreground">Drop file to share</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Community Sync Protocol</p>
                    </div>
                )}
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-3">
                        <Zap size={48} />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Awaiting Signals...</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const senderId = (msg.sender?._id || msg.sender)?.toString();
                        const myId = user?._id?.toString();
                        const isMe = senderId === myId;
                        const isAdmin = user?.role === 'admin';
                        const timeDiff = (Date.now() - new Date(msg.createdAt).getTime()) / 1000 / 60;
                        const canModify = !msg.isDeleted && msg._id?.length === 24 && ((isMe && timeDiff < 15) || isAdmin);

                        return (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={i}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group relative`}
                            >
                                <div className="flex items-center gap-2 px-1">
                                    {!isMe && (
                                        <span className="text-[11px] font-bold text-primary">
                                            {msg.sender?.username}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground/50">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`relative max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-normal border shadow-sm transition-all hover:shadow-md ${isMe
                                    ? 'bg-primary text-white border-primary rounded-tr-none'
                                    : 'bg-card text-foreground border-border rounded-tl-none'
                                    } ${msg.isDeleted ? 'italic opacity-60' : ''}`}>

                                    {/* Action Buttons */}
                                    {canModify && (
                                        <div className={`absolute top-2 ${isMe ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur rounded-lg border border-border p-1 shadow-sm z-10`}>
                                            <button onClick={() => handleEditMessage(msg)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-primary rounded-md" title="Edit (15m)">
                                                <Pencil size={12} />
                                            </button>
                                            <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-destructive rounded-md" title="Delete">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {msg.attachment && msg.attachment.url && !msg.isDeleted && (
                                        <div className="mb-2.5 overflow-hidden rounded-xl border border-white/5 bg-black/5">
                                            {(msg.attachment.fileType === 'image' || msg.attachment.type === 'image') ? (
                                                <div className="relative group/img cursor-zoom-in">
                                                    <img src={msg.attachment.url} alt="" className="max-w-full h-auto transition-transform duration-500 group-hover/img:scale-105" onClick={() => window.open(msg.attachment.url, '_blank')} />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                        <Maximize2 size={24} className="text-white" />
                                                    </div>
                                                </div>
                                            ) : (msg.attachment.fileType === 'video' || msg.attachment.type === 'video') ? (
                                                <video src={msg.attachment.url} controls className="max-w-full h-auto" />
                                            ) : (
                                                <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-all">
                                                    <div className="p-2 bg-primary/20 rounded-lg">
                                                        <File size={20} className={isMe ? 'text-white' : 'text-primary'} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-bold truncate pr-4 leading-tight">{msg.attachment.name}</p>
                                                        <p className="text-[9px] uppercase font-black opacity-50 tracking-widest mt-0.5">Application/Octet-Stream</p>
                                                    </div>
                                                    <Download size={16} className="shrink-0 transition-transform group-hover:translate-y-0.5" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <p className="leading-relaxed">
                                        {msg.message}
                                        {msg.isEdited && <span className="text-[9px] opacity-50 ml-1 italic">(edited)</span>}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-secondary/30 border-t border-border relative">
                {!user && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-b-xl">
                        <div className="bg-card border border-border px-6 py-3 rounded-xl shadow-lg flex flex-col items-center gap-1">
                            <p className="font-bold text-sm text-foreground">Join the conversation</p>
                            <Link to="/login" className="text-[11px] text-primary hover:underline font-black uppercase tracking-wide">Login to Chat</Link>
                        </div>
                    </div>
                )}
                {selectedFile && (
                    <div className="mb-3 px-1 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="relative inline-block group">
                            <div className="w-14 h-14 bg-muted/40 border border-border rounded-xl overflow-hidden flex items-center justify-center relative">
                                {selectedFile.fileType === 'image' || selectedFile.type === 'image' ? (
                                    <img src={selectedFile.url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-muted-foreground p-3 bg-primary/10 rounded-lg">
                                        {selectedFile.fileType === 'video' ? <Video size={20} /> : <File size={20} />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/5 dark:bg-black/10 pointer-events-none" />
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedFile(null)}
                                className="absolute -top-2 -right-2 bg-background border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 rounded-full p-1 shadow-sm transition-all scale-90 hover:scale-100 z-50 cursor-pointer"
                                title="Remove file"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={editingMessageId ? submitEdit : handleSendMessage} className="flex gap-2">
                    {editingMessageId && (
                        <div className="absolute bottom-full left-0 right-0 p-2 bg-muted/80 backdrop-blur border-t border-b border-border text-[11px] flex justify-between items-center text-foreground">
                            <span>Editing message...</span>
                            <button type="button" onClick={() => { setEditingMessageId(null); setNewMessage(''); }} className="hover:text-red-500"><X size={14} /></button>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all shrink-0 cursor-pointer"
                        title="Attach File"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Paperclip size={18} />}
                    </div>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-background border border-border rounded-md px-4 py-2 text-[13px] outline-none focus:border-primary transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isUploading || (!newMessage.trim() && !fileToSend)}
                        className="so-btn so-btn-primary disabled:opacity-50"
                    >
                        <Send size={16} />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Community;
