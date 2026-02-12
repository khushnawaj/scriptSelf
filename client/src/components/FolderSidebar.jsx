import { useState, useEffect } from 'react';
import { Folder, FolderPlus, FolderOpen, Edit2, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FolderSidebar = ({ onSelectFolder, selectedFolderId, onRefresh }) => {
    const [folders, setFolders] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const res = await fetch('/api/v1/folders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setFolders(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch folders:', err);
        }
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const res = await fetch('/api/v1/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: newFolderName })
            });

            const data = await res.json();
            if (data.success) {
                setFolders([...folders, data.data]);
                setNewFolderName('');
                setIsCreating(false);
                toast.success('Folder created!');
                onRefresh?.();
            }
        } catch (err) {
            toast.error('Failed to create folder');
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
                body: JSON.stringify({ name: editName })
            });

            const data = await res.json();
            if (data.success) {
                setFolders(folders.map(f => f._id === id ? data.data : f));
                setEditingId(null);
                toast.success('Folder renamed!');
            }
        } catch (err) {
            toast.error('Failed to rename folder');
        }
    };

    const deleteFolder = async (id) => {
        if (!confirm('Delete this folder? Notes will be moved to root.')) return;

        try {
            const res = await fetch(`/api/v1/folders/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await res.json();
            if (data.success) {
                setFolders(folders.filter(f => f._id !== id));
                toast.success('Folder deleted');
                onRefresh?.();
            }
        } catch (err) {
            toast.error('Failed to delete folder');
        }
    };

    return (
        <div className="w-60 border-r border-border bg-card/30 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Folders</h3>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="New folder"
                    >
                        <FolderPlus size={16} className="text-primary" />
                    </button>
                </div>

                {/* New Folder Input */}
                {isCreating && (
                    <div className="flex gap-1 mb-2">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') createFolder();
                                if (e.key === 'Escape') setIsCreating(false);
                            }}
                            placeholder="Folder name"
                            className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                        <button
                            onClick={createFolder}
                            className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* All Notes (Root) */}
            <button
                onClick={() => onSelectFolder(null)}
                className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent/50 transition-colors border-b border-border/50 ${selectedFolderId === null ? 'bg-accent/70 font-semibold' : ''
                    }`}
            >
                <FolderOpen size={16} className="text-muted-foreground" />
                <span className="flex-1 text-left">All Notes</span>
            </button>

            {/* Folder List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {folders.map((folder) => (
                    <div
                        key={folder._id}
                        className={`group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 transition-colors cursor-pointer ${selectedFolderId === folder._id ? 'bg-accent font-medium' : ''
                            }`}
                    >
                        {editingId === folder._id ? (
                            <>
                                <Folder size={14} className="text-primary shrink-0" />
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateFolder(folder._id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onBlur={() => updateFolder(folder._id)}
                                    className="flex-1 px-1 py-0 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                            </>
                        ) : (
                            <>
                                <Folder size={14} className="text-primary shrink-0" />
                                <span
                                    onClick={() => onSelectFolder(folder._id)}
                                    className="flex-1 text-xs truncate"
                                >
                                    {folder.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground mr-1">
                                    {folder.noteCount || 0}
                                </span>
                                <div className="hidden group-hover:flex items-center gap-0.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingId(folder._id);
                                            setEditName(folder.name);
                                        }}
                                        className="p-1 hover:bg-background rounded"
                                        title="Rename"
                                    >
                                        <Edit2 size={11} className="text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFolder(folder._id);
                                        }}
                                        className="p-1 hover:bg-destructive/10 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 size={11} className="text-destructive" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {folders.length === 0 && !isCreating && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Folder size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No folders yet</p>
                        <p className="text-[10px] mt-1">Click + to create one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FolderSidebar;
