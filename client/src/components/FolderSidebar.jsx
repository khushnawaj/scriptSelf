import { useState, useEffect } from 'react';
import { Folder, FolderPlus, FolderOpen, Edit2, Trash2, Plus, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FolderSidebar = ({ onSelectFolder, selectedFolderId, onRefresh, className = '' }) => {
    const [folders, setFolders] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFolders();

        const handleFolderCreated = (e) => {
            fetchFolders();
        };

        window.addEventListener('folderCreated', handleFolderCreated);
        return () => window.removeEventListener('folderCreated', handleFolderCreated);
    }, []);

    const fetchFolders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/v1/folders?tree=true', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setFolders(data.data);
            } else {
                toast.error(data.error || 'Failed to load folders');
            }
        } catch (err) {
            console.error('Failed to fetch folders:', err);
            toast.error('Connection error while fetching folders');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id, e) => {
        e.stopPropagation();
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const createFolder = async (parentId = null) => {
        const name = parentId === null ? newFolderName : prompt('Enter subfolder name:');
        if (!name || !name.trim()) return;

        try {
            const res = await fetch('/api/v1/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    parent: parentId
                })
            });

            const data = await res.json();
            if (data.success) {
                fetchFolders();
                setNewFolderName('');
                setIsCreating(false);
                toast.success('Folder created!');
                onRefresh?.();
                if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
            } else {
                toast.error(data.message || 'Failed to create folder');
            }
        } catch (err) {
            toast.error('Server error while creating folder');
        }
    };

    const updateFolder = async (id) => {
        if (!editName.trim()) return;

        try {
            const res = await fetch(`/api/v1/folders/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: editName.trim() })
            });

            const data = await res.json();
            if (data.success) {
                fetchFolders();
                setEditingId(null);
                toast.success('Folder renamed!');
            } else {
                toast.error(data.message || 'Failed to rename folder');
            }
        } catch (err) {
            toast.error('Server error while renaming folder');
        }
    };

    const deleteFolder = async (id) => {
        if (!confirm('Delete this folder? Notes and subfolders will be moved up.')) return;

        try {
            const res = await fetch(`/api/v1/folders/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await res.json();
            if (data.success) {
                fetchFolders();
                toast.success('Folder deleted');
                onRefresh?.();
            } else {
                toast.error(data.message || 'Failed to delete folder');
            }
        } catch (err) {
            toast.error('Server error while deleting folder');
        }
    };

    const FolderItem = ({ folder, depth = 0 }) => {
        const isExpanded = expandedFolders.has(folder._id);
        const isSelected = selectedFolderId === folder._id;
        const hasChildren = folder.children && folder.children.length > 0;

        return (
            <div className="flex flex-col">
                <div
                    className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all cursor-pointer ${isSelected
                            ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20'
                            : 'hover:bg-accent/50 text-muted-foreground'
                        }`}
                    style={{ marginLeft: `${depth * 12}px` }}
                    onClick={() => onSelectFolder(folder._id)}
                >
                    <div
                        onClick={(e) => hasChildren && toggleExpand(folder._id, e)}
                        className={`p-0.5 rounded hover:bg-black/10 transition-colors ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>

                    <Folder size={14} className={`${isSelected ? 'text-primary' : 'text-primary/60'} shrink-0`} />

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
                            className="flex-1 min-w-0 px-1 py-0 text-xs border border-primary/30 rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <>
                            <span className="flex-1 text-[13px] truncate">
                                {folder.name}
                            </span>
                            <span className="text-[10px] opacity-60 font-mono">
                                {folder.noteCount || 0}
                            </span>
                            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        createFolder(folder._id);
                                    }}
                                    className="p-1 hover:bg-black/10 rounded text-primary"
                                    title="New Subfolder"
                                >
                                    <FolderPlus size={12} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(folder._id);
                                        setEditName(folder.name);
                                    }}
                                    className="p-1 hover:bg-black/10 rounded"
                                    title="Rename"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFolder(folder._id);
                                    }}
                                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            {folder.children.map(child => (
                                <FolderItem key={child._id} folder={child} depth={depth + 1} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full bg-card/30 backdrop-blur-sm ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                            <Folder size={14} className="text-primary" />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-[2px] text-foreground/70">Library</h3>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-95"
                        title="New root folder"
                    >
                        <FolderPlus size={16} />
                    </button>
                </div>

                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex gap-1 mb-3">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') createFolder();
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                    placeholder="Folder name..."
                                    className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                    autoFocus
                                />
                                <button
                                    onClick={() => createFolder()}
                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:opacity-90 transition-all font-bold"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* All Notes (Root) */}
                <button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-accent/40 transition-all border-b border-border/30 ${selectedFolderId === null ? 'bg-primary/5 text-primary font-bold shadow-inner' : 'text-muted-foreground'
                        }`}
                >
                    <FolderOpen size={16} className={`${selectedFolderId === null ? 'text-primary' : 'opacity-60'}`} />
                    <span>Global Library</span>
                    {selectedFolderId === null && (
                        <motion.div layoutId="active-nav" className="ml-auto w-1 h-4 bg-primary rounded-full" />
                    )}
                </button>

                <div className="p-2 space-y-0.5">
                    {folders.map((folder) => (
                        <FolderItem key={folder._id} folder={folder} />
                    ))}

                    {!isLoading && folders.length === 0 && !isCreating && (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] rotate-12 flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
                                <FolderOpen size={28} className="text-primary opacity-60 -rotate-12" />
                            </div>
                            <h4 className="text-[14px] font-black text-foreground mb-2">No Volumes Found</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mb-6 opacity-80">
                                Your digital shelf is waiting for organization. Initialize a new folder to begin.
                            </p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                                <Plus size={14} /> Build Framework
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-2 p-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-accent/20 rounded-md animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FolderSidebar;
