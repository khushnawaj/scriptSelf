import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Folder, FolderOpen, FolderPlus, FileText, Terminal,
    FileCode, BookOpen, AlertCircle, Home, ChevronRight,
    Plus, Trash2, Edit2, Check, X, Loader2, RefreshCw,
    ArrowLeft, File, HardDrive, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const TYPE_ICON = {
    code:       { Icon: Terminal,    color: '#4ade80', bg: '#052e16' },
    doc:        { Icon: FileText,    color: '#60a5fa', bg: '#0c1a33' },
    adr:        { Icon: AlertCircle, color: '#fbbf24', bg: '#2d1b00' },
    pattern:    { Icon: BookOpen,    color: '#c084fc', bg: '#1e0a33' },
    cheatsheet: { Icon: FileCode,    color: '#22d3ee', bg: '#031a1e' },
    default:    { Icon: File,        color: '#94a3b8', bg: '#1a1f2e' },
};

const getTypeStyle = (type) => TYPE_ICON[type] || TYPE_ICON.default;

export default function FileExplorer() {
    const navigate = useNavigate();
    const [allFolders, setAllFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumb, setBreadcrumb] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    // Folders at current level
    const currentFolders = allFolders.filter(f => {
        const parentId = f.parent?._id || f.parent;
        if (currentFolderId === null) return !parentId;
        return parentId && String(parentId) === String(currentFolderId);
    });

    if (currentFolderId === null) {
        currentFolders.unshift({
            _id: 'received',
            name: 'Received',
            isVirtual: true
        });
    }

    const fetchFolders = useCallback(async () => {
        setIsLoadingFolders(true);
        try {
            const res = await api.get('/folders');
            if (res.data.success) setAllFolders(res.data.data);
        } catch { toast.error('Failed to load folders'); }
        finally { setIsLoadingFolders(false); }
    }, []);

    const fetchNotes = useCallback(async (folderId) => {
        setIsLoadingNotes(true);
        setNotes([]);
        try {
            const param = folderId ? `folder=${folderId}` : 'folder=__root__';
            const res = await api.get(`/notes?${param}&limit=100`);
            if (res.data.success) setNotes(res.data.data || []);
        } catch { }
        finally { setIsLoadingNotes(false); }
    }, []);

    useEffect(() => { fetchFolders(); }, [fetchFolders]);

    useEffect(() => {
        fetchNotes(currentFolderId);
        setSelected(null);
    }, [currentFolderId, fetchNotes]);

    const openFolder = (folder) => {
        setBreadcrumb(prev => [...prev, { id: folder._id, name: folder.name }]);
        setCurrentFolderId(folder._id);
    };

    const navTo = (idx) => {
        if (idx === -1) { setBreadcrumb([]); setCurrentFolderId(null); }
        else { setBreadcrumb(prev => prev.slice(0, idx + 1)); setCurrentFolderId(breadcrumb[idx].id); }
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const res = await api.post('/folders', { name: newFolderName.trim(), parent: currentFolderId });
            if (res.data.success) {
                toast.success('Folder created');
                setNewFolderName(''); setIsCreating(false);
                fetchFolders();
            }
        } catch { toast.error('Failed'); }
    };

    const renameFolder = async (id) => {
        if (!editName.trim()) return;
        try {
            const res = await api.put(`/folders/${id}`, { name: editName.trim() });
            if (res.data.success) { toast.success('Renamed'); fetchFolders(); }
        } catch { toast.error('Failed'); }
        finally { setEditingId(null); }
    };

    const deleteFolder = async (id) => {
        if (!confirm('Delete this folder?')) return;
        try {
            await api.delete(`/folders/${id}`);
            toast.success('Deleted'); fetchFolders();
            if (selected === id) setSelected(null);
        } catch { toast.error('Failed'); }
    };

    const renameNote = async (id) => {
        if (!editName.trim()) return;
        try {
            const res = await api.put(`/notes/${id}`, { title: editName.trim() });
            if (res.data.success) { toast.success('Renamed file'); fetchNotes(currentFolderId); }
        } catch { toast.error('Failed to rename file'); }
        finally { setEditingId(null); }
    };

    const deleteNote = async (id) => {
        if (!confirm('Delete this file?')) return;
        try {
            await api.delete(`/notes/${id}`);
            toast.success('Deleted file'); fetchNotes(currentFolderId);
            if (selected === id) setSelected(null);
        } catch { toast.error('Failed to delete file'); }
    };

    const openNote = (note) => {
        if (note.type === 'code') navigate(`/playground?id=${note._id}`);
        else navigate(`/notes/${note._id}`);
    };

    const FolderIcon = ({ folder, isSelected }) => {
        const isEditing = editingId === folder._id;
        const isReceived = folder._id === 'received';
        const BaseIcon = isReceived ? Inbox : (isSelected ? FolderOpen : Folder);
        const iconColor = isReceived ? 'text-primary' : (isSelected ? 'text-yellow-400 drop-shadow-lg' : 'text-yellow-400/80 group-hover:text-yellow-400');

        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onDoubleClick={() => openFolder(folder)}
                onClick={(e) => { e.stopPropagation(); setSelected(folder._id); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer select-none transition-all group relative ${
                    isSelected ? 'bg-primary/20 ring-1 ring-primary/40' : 'hover:bg-white/5'
                }`}
                style={{ width: 96 }}
            >
                {/* Folder Icon */}
                <div className="relative">
                    <BaseIcon size={52} className={`${iconColor} transition-colors`} />
                    {folder.noteCount > 0 && !isReceived && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                            {folder.noteCount > 9 ? '9+' : folder.noteCount}
                        </span>
                    )}
                </div>

                {/* Name / Edit */}
                {isEditing ? (
                    <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') renameFolder(folder._id); if (e.key === 'Escape') setEditingId(null); }}
                        onBlur={() => renameFolder(folder._id)}
                        className="w-full text-center text-[11px] bg-background border border-primary/40 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className="text-[11px] text-center leading-tight text-foreground/80 group-hover:text-foreground truncate w-full text-center">
                        {folder.name}
                    </span>
                )}

                {/* Hover Actions */}
                {isSelected && !isEditing && !isReceived && (
                    <div className="absolute -top-2 -right-2 flex gap-0.5 bg-card border border-border rounded-lg p-0.5 shadow-lg z-10">
                        <button onClick={e => { e.stopPropagation(); setEditingId(folder._id); setEditName(folder.name); }}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 size={11} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteFolder(folder._id); }}
                            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={11} />
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    const NoteIcon = ({ note, isSelected }) => {
        const { Icon, color, bg } = getTypeStyle(note.type);
        const isEditing = editingId === note._id;
        const isReceived = currentFolderId === 'received';

        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onDoubleClick={() => openNote(note)}
                onClick={(e) => { e.stopPropagation(); setSelected(note._id); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer select-none transition-all group relative ${
                    isSelected ? 'bg-primary/20 ring-1 ring-primary/40' : 'hover:bg-white/5'
                }`}
                style={{ width: 96 }}
            >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, border: `1px solid ${color}22` }}>
                    <Icon size={26} style={{ color }} />
                </div>
                
                {/* Name / Edit */}
                {isEditing ? (
                    <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') renameNote(note._id); if (e.key === 'Escape') setEditingId(null); }}
                        onBlur={() => renameNote(note._id)}
                        className="w-full text-center text-[11px] bg-background border border-primary/40 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className="text-[11px] text-center leading-tight text-foreground/70 group-hover:text-foreground/90 line-clamp-2 w-full text-center">
                        {note.title}
                    </span>
                )}

                {/* Hover Actions */}
                {isSelected && !isEditing && !isReceived && (
                    <div className="absolute -top-2 -right-2 flex gap-0.5 bg-card border border-border rounded-lg p-0.5 shadow-lg z-10">
                        <button onClick={e => { e.stopPropagation(); setEditingId(note._id); setEditName(note.title); }}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 size={11} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteNote(note._id); }}
                            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={11} />
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    const isEmpty = !isLoadingFolders && !isLoadingNotes && currentFolders.length === 0 && notes.length === 0;

    return (
        <div
            className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-background"
            onClick={() => setSelected(null)}
        >
            {/* Top Bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border/40 bg-card/40 backdrop-blur-sm shrink-0">
                {/* Back */}
                <button
                    onClick={() => breadcrumb.length > 0 && navTo(breadcrumb.length - 2)}
                    disabled={breadcrumb.length === 0}
                    className="p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ArrowLeft size={14} />
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1 flex-1 min-w-0 text-sm">
                    <button
                        onClick={() => navTo(-1)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    >
                        <HardDrive size={13} />
                        <span className="font-medium">Files</span>
                    </button>
                    {breadcrumb.map((crumb, i) => (
                        <span key={crumb.id} className="flex items-center gap-1 min-w-0">
                            <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />
                            <button
                                onClick={() => navTo(i)}
                                className={`truncate transition-colors ${
                                    i === breadcrumb.length - 1
                                        ? 'text-foreground font-semibold'
                                        : 'text-muted-foreground hover:text-primary'
                                }`}
                            >
                                {crumb.name}
                            </button>
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { fetchFolders(); fetchNotes(currentFolderId); }}
                        className="p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
                        <RefreshCw size={13} />
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        disabled={currentFolderId === 'received'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FolderPlus size={13} /> New Folder
                    </button>
                    <button
                        onClick={() => navigate(currentFolderId && currentFolderId !== 'received' ? `/notes/new?folder=${currentFolderId}` : '/notes/new')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Plus size={13} /> New Note
                    </button>
                </div>
            </div>

            {/* New Folder Input Bar */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-border/40 bg-card/20"
                    >
                        <div className="flex items-center gap-2 px-5 py-2">
                            <Folder size={14} className="text-yellow-400 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') { setIsCreating(false); setNewFolderName(''); } }}
                                placeholder="New folder name..."
                                className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                            />
                            <button onClick={createFolder} className="p-1.5 bg-primary text-white rounded-md hover:opacity-90">
                                <Check size={13} />
                            </button>
                            <button onClick={() => { setIsCreating(false); setNewFolderName(''); }} className="p-1.5 border border-border rounded-md text-muted-foreground hover:text-foreground">
                                <X size={13} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {(isLoadingFolders || isLoadingNotes) ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 size={24} className="animate-spin text-primary/50" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FolderOpen size={48} className="text-muted-foreground/20 mb-4" />
                        <p className="text-sm text-muted-foreground/50 font-medium">This folder is empty</p>
                        <p className="text-xs text-muted-foreground/30 mt-1">Create a folder or add a note</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Folders */}
                        {currentFolders.length > 0 && (
                            <div>
                                {notes.length > 0 && (
                                    <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider mb-4">
                                        Folders ({currentFolders.length})
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {currentFolders.map(folder => (
                                        <FolderIcon key={folder._id} folder={folder} isSelected={selected === folder._id} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes / Files */}
                        {notes.length > 0 && (
                            <div>
                                {currentFolders.length > 0 && (
                                    <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider mb-4">
                                        Files ({notes.length})
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {notes.map(note => (
                                        <NoteIcon key={note._id} note={note} isSelected={selected === note._id} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="px-5 py-2 border-t border-border/30 bg-card/20 text-[10px] text-muted-foreground/40 font-mono flex items-center gap-4 shrink-0">
                <span>{currentFolders.length} folder{currentFolders.length !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{notes.length} file{notes.length !== 1 ? 's' : ''}</span>
                {selected && <span className="ml-auto">1 selected</span>}
            </div>
        </div>
    );
}
