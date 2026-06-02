import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Folder, FolderPlus, FolderOpen, Edit2, Trash2, Plus,
    ChevronRight, ChevronDown, FileText, FileCode, Terminal,
    BookOpen, AlertCircle, MoreVertical, X, Check, RefreshCw,
    Home, File, Loader2, Inbox, HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const FILE_ICONS = {
    code: { icon: Terminal, color: 'text-emerald-400' },
    doc: { icon: FileText, color: 'text-blue-400' },
    adr: { icon: AlertCircle, color: 'text-amber-400' },
    pattern: { icon: BookOpen, color: 'text-purple-400' },
    cheatsheet: { icon: FileCode, color: 'text-cyan-400' },
    issue: { icon: HelpCircle, color: 'text-rose-400' },
    default: { icon: File, color: 'text-muted-foreground' },
};

const getFileIcon = (type) => FILE_ICONS[type] || FILE_ICONS.default;

const FolderSidebar = ({ onSelectFolder, selectedFolderId, onRefresh, className = '' }) => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [folderFiles, setFolderFiles] = useState({});
    const [loadingFiles, setLoadingFiles] = useState(new Set());
    const [contextMenu, setContextMenu] = useState(null);
    const [creatingSubfolder, setCreatingSubfolder] = useState(null);
    const [subfolderName, setSubfolderName] = useState('');

    useEffect(() => {
        fetchFolders();
        const handleFolderCreated = () => fetchFolders();
        window.addEventListener('folderCreated', handleFolderCreated);
        return () => window.removeEventListener('folderCreated', handleFolderCreated);
    }, []);

    const fetchFolders = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/folders?tree=true');
            if (res.data.success) setFolders(res.data.data);
        } catch (err) {
            console.error('Failed to fetch folders:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilesForFolder = useCallback(async (folderId) => {
        if (folderFiles[folderId]) return;
        setLoadingFiles(prev => new Set(prev).add(folderId));
        try {
            const res = await api.get(`/notes?folder=${folderId}&limit=50`);
            if (res.data.success) {
                setFolderFiles(prev => ({ ...prev, [folderId]: res.data.data || [] }));
            }
        } catch (err) {
            console.error('Failed to fetch folder files:', err);
        } finally {
            setLoadingFiles(prev => {
                const next = new Set(prev);
                next.delete(folderId);
                return next;
            });
        }
    }, [folderFiles]);

    const toggleExpand = (id, e) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                fetchFilesForFolder(id);
            }
            return next;
        });
    };

    const createFolder = async (parentId = null) => {
        const name = parentId ? subfolderName : newFolderName;
        if (!name || !name.trim()) return;
        try {
            const res = await api.post('/folders', { name: name.trim(), parent: parentId });
            if (res.data.success) {
                fetchFolders();
                setNewFolderName('');
                setSubfolderName('');
                setIsCreating(false);
                setCreatingSubfolder(null);
                toast.success(`📁 ${name.trim()}`);
                onRefresh?.();
                if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
            } else {
                toast.error(res.data.message || 'Failed');
            }
        } catch (err) {
            toast.error('Server error');
        }
    };

    const updateFolder = async (id) => {
        if (!editName.trim()) return;
        try {
            const res = await api.put(`/folders/${id}`, { name: editName.trim() });
            if (res.data.success) {
                fetchFolders();
                setEditingId(null);
                toast.success('Renamed');
            }
        } catch (err) {
            toast.error('Rename failed');
        }
    };

    const deleteFolder = async (id) => {
        if (!confirm('Delete this folder? Notes inside will be moved to root.')) return;
        try {
            const res = await api.delete(`/folders/${id}`);
            if (res.data.success) {
                fetchFolders();
                toast.success('Folder deleted');
                onRefresh?.();
                if (selectedFolderId === id) onSelectFolder(null);
            }
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    // ── Tree Line Connector ──
    const TreeLine = ({ depth, isLast }) => (
        <div className="flex items-center shrink-0" style={{ width: `${depth * 16}px` }}>
            {Array.from({ length: depth }).map((_, i) => (
                <div key={i} className="w-4 h-full flex justify-center shrink-0">
                    {i < depth - 1 ? (
                        <div className="w-px h-full bg-border/40" />
                    ) : (
                        <div className="relative w-full h-full">
                            <div className={`absolute left-1/2 top-0 w-px ${isLast ? 'h-1/2' : 'h-full'} bg-border/40`} />
                            <div className="absolute left-1/2 top-1/2 w-2 h-px bg-border/40" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // ── File Item (Note inside a folder) ──
    const FileItem = ({ note, depth, isLast }) => {
        const { icon: Icon, color } = getFileIcon(note.type);
        const link = note.type === 'code' ? `/playground?id=${note._id}` : `/notes/${note._id}`;

        return (
            <div
                onClick={() => navigate(link)}
                className="group flex items-center h-7 cursor-pointer hover:bg-primary/5 transition-all relative"
            >
                <TreeLine depth={depth} isLast={isLast} />
                <Icon size={13} className={`${color} shrink-0 mr-1.5`} />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground truncate flex-1 font-mono transition-colors">
                    {note.title}
                </span>
                <span className="text-[8px] text-muted-foreground/40 font-mono uppercase tracking-wider mr-2 shrink-0 hidden group-hover:inline">
                    {note.type || 'doc'}
                </span>
            </div>
        );
    };

    // ── Folder Item (Recursive) ──
    const FolderItem = ({ folder, depth = 0, isLast = false }) => {
        const isExpanded = expandedFolders.has(folder._id);
        const isSelected = selectedFolderId === folder._id;
        const hasChildren = folder.children && folder.children.length > 0;
        const files = folderFiles[folder._id] || [];
        const isLoadingF = loadingFiles.has(folder._id);
        const hasContent = hasChildren || files.length > 0;
        const showContext = contextMenu === folder._id;

        return (
            <div className="flex flex-col select-none">
                {/* Folder Row */}
                <div
                    className={`group flex items-center h-8 cursor-pointer transition-all relative ${
                        isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent/30 text-foreground/80'
                    }`}
                    onClick={() => {
                        onSelectFolder(folder._id);
                        if (!isExpanded) toggleExpand(folder._id);
                    }}
                >
                    {depth > 0 && <TreeLine depth={depth} isLast={isLast} />}
                    {depth === 0 && <div className="w-2 shrink-0" />}

                    {/* Expand/Collapse Chevron */}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(folder._id); }}
                        className="p-0.5 rounded hover:bg-black/10 transition-colors shrink-0 mr-0.5"
                    >
                        {isExpanded
                            ? <ChevronDown size={12} className="text-primary/60" />
                            : <ChevronRight size={12} className="text-muted-foreground/60" />
                        }
                    </button>

                    {/* Folder Icon */}
                    {isExpanded
                        ? <FolderOpen size={14} className="text-primary shrink-0 mr-1.5" />
                        : <Folder size={14} className={`${isSelected ? 'text-primary' : 'text-yellow-500/70'} shrink-0 mr-1.5`} />
                    }

                    {/* Name or Rename Input */}
                    {editingId === folder._id ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') updateFolder(folder._id);
                                if (e.key === 'Escape') setEditingId(null);
                            }}
                            onBlur={() => updateFolder(folder._id)}
                            className="flex-1 min-w-0 px-1 py-0 text-[12px] border border-primary/30 rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className={`text-[12px] truncate flex-1 font-medium ${isSelected ? 'font-semibold text-primary' : ''}`}>
                            {folder.name}
                        </span>
                    )}

                    {/* Note Count */}
                    {!editingId && folder.noteCount > 0 && (
                        <span className="text-[9px] text-muted-foreground/50 font-mono mr-1 shrink-0">
                            {folder.noteCount}
                        </span>
                    )}

                    {/* Context Actions */}
                    {!editingId && (
                        <div className="hidden group-hover:flex items-center gap-0 mr-1 shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); setCreatingSubfolder(folder._id); setExpandedFolders(prev => new Set(prev).add(folder._id)); }}
                                className="p-1 hover:bg-primary/10 rounded text-primary/60 hover:text-primary transition-colors"
                                title="New subfolder"
                            >
                                <FolderPlus size={11} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setEditingId(folder._id); setEditName(folder.name); }}
                                className="p-1 hover:bg-primary/10 rounded text-muted-foreground/60 hover:text-foreground transition-colors"
                                title="Rename"
                            >
                                <Edit2 size={11} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteFolder(folder._id); }}
                                className="p-1 hover:bg-destructive/10 rounded text-muted-foreground/60 hover:text-destructive transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Expanded Content: Subfolders + Files */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            {/* Inline subfolder creation */}
                            {creatingSubfolder === folder._id && (
                                <div className="flex items-center h-8 pl-2" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
                                    <FolderPlus size={12} className="text-primary mr-1.5 shrink-0" />
                                    <input
                                        type="text"
                                        value={subfolderName}
                                        onChange={(e) => setSubfolderName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') createFolder(folder._id);
                                            if (e.key === 'Escape') { setCreatingSubfolder(null); setSubfolderName(''); }
                                        }}
                                        placeholder="subfolder..."
                                        autoFocus
                                        className="flex-1 min-w-0 px-1.5 py-0.5 text-[11px] border border-primary/30 rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button onClick={() => createFolder(folder._id)} className="p-1 text-primary hover:bg-primary/10 rounded ml-0.5">
                                        <Check size={12} />
                                    </button>
                                    <button onClick={() => { setCreatingSubfolder(null); setSubfolderName(''); }} className="p-1 text-muted-foreground hover:bg-muted/30 rounded">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}

                            {/* Subfolders */}
                            {hasChildren && folder.children.map((child, i) => (
                                <FolderItem
                                    key={child._id}
                                    folder={child}
                                    depth={depth + 1}
                                    isLast={i === folder.children.length - 1 && files.length === 0}
                                />
                            ))}

                            {/* Files / Notes inside this folder */}
                            {isLoadingF && (
                                <div className="flex items-center h-7 gap-2" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
                                    <Loader2 size={11} className="animate-spin text-primary/50" />
                                    <span className="text-[10px] text-muted-foreground/40 font-mono">loading...</span>
                                </div>
                            )}
                            {files.map((note, i) => (
                                <FileItem
                                    key={note._id}
                                    note={note}
                                    depth={depth + 1}
                                    isLast={i === files.length - 1}
                                />
                            ))}

                            {/* Empty folder message */}
                            {!isLoadingF && !hasChildren && files.length === 0 && (
                                <div className="flex items-center h-7 gap-1.5" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
                                    <span className="text-[10px] text-muted-foreground/30 font-mono italic">── empty ──</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="px-3 py-3 border-b border-border/30 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal size={13} className="text-primary" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/60 uppercase font-mono">explorer</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={fetchFolders}
                            className="p-1.5 hover:bg-accent/50 rounded-md text-muted-foreground/50 hover:text-foreground transition-all"
                            title="Refresh"
                        >
                            <RefreshCw size={12} />
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-1.5 hover:bg-primary/10 rounded-md text-primary/60 hover:text-primary transition-all"
                            title="New folder"
                        >
                            <FolderPlus size={13} />
                        </button>
                    </div>
                </div>

                {/* New Root Folder Input */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex gap-1 mt-2">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') createFolder();
                                        if (e.key === 'Escape') { setIsCreating(false); setNewFolderName(''); }
                                    }}
                                    placeholder="folder-name"
                                    className="flex-1 px-2 py-1 text-[11px] border border-border/50 rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                    autoFocus
                                />
                                <button onClick={() => createFolder()} className="px-2 py-1 bg-primary text-white text-[10px] rounded hover:opacity-90 font-bold">
                                    <Check size={12} />
                                </button>
                                <button onClick={() => { setIsCreating(false); setNewFolderName(''); }} className="px-2 py-1 border border-border text-muted-foreground text-[10px] rounded hover:bg-muted/30">
                                    <X size={12} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
                {/* Root / All Notes */}
                <div
                    onClick={() => onSelectFolder(null)}
                    className={`group flex items-center h-8 px-2 cursor-pointer transition-all ${
                        selectedFolderId === null
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent/30 text-foreground/80'
                    }`}
                >
                    <Home size={13} className={`${selectedFolderId === null ? 'text-primary' : 'text-muted-foreground/50'} shrink-0 mr-2`} />
                    <span className={`text-[12px] font-medium ${selectedFolderId === null ? 'font-semibold text-primary' : ''}`}>
                        ~ /
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono ml-auto">root</span>
                </div>

                {/* Received / Shared Notes */}
                <div
                    onClick={() => onSelectFolder('received')}
                    className={`group flex items-center h-8 px-2 cursor-pointer transition-all ${
                        selectedFolderId === 'received'
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent/30 text-foreground/80'
                    }`}
                >
                    <Inbox size={13} className={`${selectedFolderId === 'received' ? 'text-primary' : 'text-muted-foreground/50'} shrink-0 mr-2`} />
                    <span className={`text-[12px] font-medium ${selectedFolderId === 'received' ? 'font-semibold text-primary' : ''}`}>
                        Received
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono ml-auto">shared</span>
                </div>

                {/* Separator */}
                <div className="h-px bg-border/20 mx-2 my-1" />

                {/* Folder Tree */}
                {folders.map((folder, i) => (
                    <FolderItem
                        key={folder._id}
                        folder={folder}
                        depth={0}
                        isLast={i === folders.length - 1}
                    />
                ))}

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="space-y-1 p-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-7 bg-accent/10 rounded animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && folders.length === 0 && !isCreating && (
                    <div className="flex flex-col items-center py-10 px-4 text-center">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4 border border-primary/10">
                            <FolderOpen size={22} className="text-primary/30" />
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 font-medium mb-4">No directories yet</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1.5"
                        >
                            <Plus size={12} /> mkdir
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="px-3 py-2 border-t border-border/20 bg-card/30">
                <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 font-mono">
                    <span>{folders.length} dir{folders.length !== 1 ? 's' : ''}</span>
                    <span>{selectedFolderId ? 'filtered' : 'all'}</span>
                </div>
            </div>
        </div>
    );
};

export default FolderSidebar;
