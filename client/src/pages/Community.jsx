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
        <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700">
            {/* Immersive Header */}
            <div className="mb-6 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-[1.5rem] blur-xl opacity-30" />
                <div className="relative bg-card/40 backdrop-blur-3xl border border-border/50 rounded-[1.2rem] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Globe size={20} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-foreground ">Community Feed</h1>
                            <p className="text-[9px] font-bold text-muted-foreground/60  tracking-[0.2em]">Signal: Secure_Handshake</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full " />
                        <span className="text-[10px] font-bold text-emerald-500  tracking-widest">Live_Sync</span>
                    </div>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="flex-1 flex flex-col bg-card/30 backdrop-blur-3xl border border-border/50 rounded-[1.5rem] overflow-hidden shadow-2xl relative">
                {/* Blueprint Background */}
                
                

                {/* Messages Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative z-10 ${isDragging ? 'bg-primary/5' : ''}`}
                >
                    {isDragging && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary m-4 rounded-2xl pointer-events-none">
                            <Paperclip size={48} className="text-primary  mb-4" />
                            <p className="text-lg font-bold text-foreground">Drop file to share</p>
                            <p className="text-xs text-muted-foreground  tracking-widest font-bold">Community Sync Protocol</p>
                        </div>
                    )}

                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-3">
                            <Zap size={48} className="" />
                            <p className="text-[10px] font-bold  tracking-[0.3em]">Awaiting Uplink Signals...</p>
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5 group relative`}
                                >
                                    <div className="flex items-center gap-2 px-1">
                                        {!isMe && (
                                            <span className="text-[10px] font-bold text-primary  tracking-tighter">
                                                {msg.sender?.username}
                                            </span>
                                        )}
                                        <span className="text-[9px] font-bold text-muted-foreground/40">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`relative max-w-[80%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed border shadow-sm transition-all hover:shadow-xl ${isMe
                                        ? 'bg-primary text-white border-primary shadow-primary/20 rounded-tr-none'
                                        : 'bg-card/80 text-foreground border-border/60 rounded-tl-none backdrop-blur-md shadow-black/10'
                                        } ${msg.isDeleted ? 'italic opacity-60' : ''}`}>

                                        {/* Action Buttons */}
                                        {canModify && (
                                            <div className={`absolute top-2 ${isMe ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10`}>
                                                <button onClick={() => handleEditMessage(msg)} className="p-1.5 bg-background border border-border hover:text-primary rounded-lg shadow-sm" title="Edit">
                                                    <Pencil size={11} />
                                                </button>
                                                <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 bg-background border border-border hover:text-rose-500 rounded-lg shadow-sm" title="Delete">
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        )}

                                        {msg.attachment && msg.attachment.url && !msg.isDeleted && (
                                            <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/5 shadow-inner">
                                                {(msg.attachment.fileType === 'image' || msg.attachment.type === 'image') ? (
                                                    <div className="relative group/img cursor-zoom-in overflow-hidden">
                                                        <img src={msg.attachment.url} alt="" className="max-w-full h-auto transition-transform duration-700 group-hover/img:scale-105" onClick={() => window.open(msg.attachment.url, '_blank')} />
                                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                            <Maximize2 size={24} className="text-white drop-shadow-lg" />
                                                        </div>
                                                    </div>
                                                ) : (msg.attachment.fileType === 'video' || msg.attachment.type === 'video') ? (
                                                    <video src={msg.attachment.url} controls className="max-w-full h-auto" />
                                                ) : (
                                                    <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-all group/file">
                                                        <div className="p-2 bg-primary/20 rounded-lg group-hover/file:scale-110 transition-transform">
                                                            <File size={20} className={isMe ? 'text-white' : 'text-primary'} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] font-bold truncate pr-4 leading-tight  tracking-tighter">{msg.attachment.name}</p>
                                                            <p className="text-[8px]  font-bold opacity-40 tracking-[0.2em] mt-1">Binary_Payload</p>
                                                        </div>
                                                        <Download size={14} className="shrink-0 transition-transform group-hover/file:translate-y-0.5" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        <p className="font-medium">
                                            {msg.message}
                                            {msg.isEdited && <span className="text-[8px] opacity-40 ml-1.5  font-bold tracking-widest">[EDITED]</span>}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-secondary/20 border-t border-border/50 relative z-20">
                    {!user && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex items-center justify-center">
                            <div className="bg-card border border-border px-8 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2">
                                <Lock size={24} className="text-primary mb-1" />
                                <p className="font-bold text-xs  tracking-widest">Authentication Required</p>
                                <Link to="/login" className="px-6 py-2 bg-primary text-white text-[10px] font-bold  tracking-[0.2em] rounded-xl hover:opacity-90 transition-all">Establish_Link</Link>
                            </div>
                        </div>
                    )}
                    
                    {selectedFile && (
                        <div className="mb-4 px-1 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="relative inline-block group">
                                <div className="w-16 h-16 bg-background/50 border border-primary/30 rounded-xl overflow-hidden flex items-center justify-center relative shadow-lg shadow-primary/5">
                                    {selectedFile.fileType === 'image' || selectedFile.type === 'image' ? (
                                        <img src={selectedFile.url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-primary p-3">
                                            {selectedFile.fileType === 'video' ? <Video size={24} /> : <File size={24} />}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute -top-2 -right-2 bg-background border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 rounded-full p-1.5 shadow-xl transition-all hover:scale-110 z-50 cursor-pointer"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={editingMessageId ? submitEdit : handleSendMessage} className="flex gap-3 relative">
                        {editingMessageId && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 px-4 bg-primary/10 backdrop-blur border border-primary/20 text-[10px] font-bold  tracking-widest flex justify-between items-center text-primary rounded-xl">
                                <span className="flex items-center gap-2"><Pencil size={12} /> Modifying Record...</span>
                                <button type="button" onClick={() => { setEditingMessageId(null); setNewMessage(''); }} className="hover:scale-110 transition-transform"><X size={14} /></button>
                            </div>
                        )}
                        
                        <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
                        
                        <div className="flex-1 relative flex items-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="absolute left-3 p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg"
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Paperclip size={18} />}
                            </button>
                            
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Transmit signal to community..."
                                className="w-full bg-background/50 border border-border/50 rounded-xl pl-12 pr-4 py-3 text-[13px] font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading || (!newMessage.trim() && !fileToSend)}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold  tracking-[0.2em] text-[10px] flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-30"
                        >
                            <Send size={14} />
                            <span className="hidden sm:inline">Transmit</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Community;
