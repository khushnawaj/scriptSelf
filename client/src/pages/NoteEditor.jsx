import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createNote, getNotes, updateNote } from '../features/notes/noteSlice';
import api from '../utils/api';
import { getCategories, createCategory } from '../features/categories/categorySlice';
import {
    Plus,
    X,
    CheckCircle2,
    Info,
    Layout,
    Eye,
    Code,
    HelpCircle,
    Bold,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Type,
    Image as ImageIcon,
    Columns,
    Maximize2,
    Save,
    Trash2,
    FileCode,
    FileUp,
    Code2,
    Folder
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../components/Mermaid';
import { motion, AnimatePresence } from 'framer-motion';

const NoteEditor = () => {
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const urlFolderId = searchParams.get('folder');
    const editorRef = useRef(null);

    const { categories } = useSelector((state) => state.categories);
    const { notes, isLoading } = useSelector((state) => state.notes);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'doc',
        adrStatus: 'proposed',
        categoryId: '',
        folderId: '',
        tags: '',
        isPublic: false,
        videoUrl: '',
    });

    const { title, content, type, adrStatus, categoryId, folderId, tags, isPublic, videoUrl } = formData;
    const [folders, setFolders] = useState([]);
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [file, setFile] = useState(null);
    const [hasDraft, setHasDraft] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // --- Draft System Logic ---
    const draftKey = id ? `ss_draft_${id}` : 'ss_draft_new';

    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            setHasDraft(true);
        }
    }, [draftKey]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isDirty && (content || title)) {
                localStorage.setItem(draftKey, JSON.stringify(formData));
                setLastSaved(new Date().toLocaleTimeString());
            }
        }, 2000);

        return () => {
            clearTimeout(timer);
            if (isDirty && (content || title)) {
                localStorage.setItem(draftKey, JSON.stringify(formData));
            }
        };
    }, [formData, draftKey, isDirty]);

    const restoreDraft = () => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            setFormData(parsed);
            setHasDraft(false);
            setIsDirty(true);
            toast.success('Draft restored from local cache');
        }
    };

    const discardDraft = () => {
        localStorage.removeItem(draftKey);
        setHasDraft(false);
        toast.success('Draft discarded');
    };

    useEffect(() => {
        dispatch(getCategories());
        fetchFolders();
        if (!notes.length && id) {
            dispatch(getNotes());
        }
    }, [dispatch, id, notes.length]);

    const fetchFolders = async () => {
        try {
            const res = await api.get('/folders?tree=true');
            if (res.data.success) {
                const flattened = flattenFolders(res.data.data);
                setFolders(flattened);
            }
        } catch (err) {
            console.error('Failed to fetch folders', err);
            toast.error('Failed to sync folder structure');
        }
    };

    const flattenFolders = (nodes, depth = 0) => {
        let flat = [];
        nodes.forEach(node => {
            flat.push({
                _id: node._id,
                name: node.name,
                depth,
                displayText: `${'\u00A0'.repeat(depth * 3)}${depth > 0 ? '↳ ' : ''}${node.name}`
            });
            if (node.children && node.children.length > 0) {
                flat = [...flat, ...flattenFolders(node.children, depth + 1)];
            }
        });
        return flat;
    };

    const location = useLocation();

    useEffect(() => {
        if (id && notes.length > 0) {
            const noteToEdit = notes.find(n => n._id === id);
            if (noteToEdit) {
                setFormData({
                    title: noteToEdit.title,
                    content: noteToEdit.content,
                    type: noteToEdit.type || 'doc',
                    adrStatus: noteToEdit.adrStatus || 'proposed',
                    categoryId: noteToEdit.category?._id || noteToEdit.category,
                    folderId: noteToEdit.folder || '',
                    tags: noteToEdit.tags ? noteToEdit.tags.join(', ') : '',
                    isPublic: noteToEdit.isPublic || false,
                    videoUrl: noteToEdit.videoUrl || '',
                });
                setTimeout(() => setIsDirty(false), 500);
            }
        } else if (!id) {
            // New note initialization
            if (location.state?.type === 'issue') {
                setFormData(prev => ({
                    ...prev,
                    type: 'issue',
                    isPublic: true,
                    content: `### Problem Description\n\n\n### Expected Behavior\n\n\n### Context / Environment\n- OS:\n- Browser:\n- Version:\n\n### Reproducible Steps\n1. \n2. \n3. `,
                    categoryId: categories.find(c => c.name === 'General')?._id || ''
                }));
            }
        }

        if (urlFolderId && !id && !formData.folderId) {
            setFormData(prev => ({ ...prev, folderId: urlFolderId }));
        }

        setTimeout(() => setIsDirty(false), 500);
    }, [id, notes, location.state, categories, urlFolderId]);

    const onChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setIsDirty(true);

        if (name === 'type' && value === 'issue' && !formData.content) {
            setFormData(prev => ({
                ...prev,
                type: value,
                content: `### Problem Description\n\n\n### Expected Behavior\n\n\n### Context / Environment\n- OS:\n- Browser:\n- Version:\n\n### Reproducible Steps\n1. \n2. \n3. `
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: inputType === 'checkbox' ? checked : value
            }));
        }
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const onEditorChange = (value) => {
        setIsDirty(true);
        setFormData(prev => ({ ...prev, content: value || '' }));
    };

    const injectMarkdown = (prefix, suffix = '') => {
        if (!editorRef.current) return;
        const selection = editorRef.current.getSelection();
        const model = editorRef.current.getModel();
        const selectedText = model.getValueInRange(selection);

        const newText = prefix + selectedText + suffix;

        editorRef.current.executeEdits('toolbar', [{
            range: selection,
            text: newText,
            forceMoveMarkers: true
        }]);

        editorRef.current.focus();
    };

    const toolbarActions = [
        { icon: Bold, label: 'Bold', action: () => injectMarkdown('**', '**') },
        { icon: Italic, label: 'Italic', action: () => injectMarkdown('_', '_') },
        { icon: Type, label: 'Heading', action: () => injectMarkdown('### ') },
        { icon: LinkIcon, label: 'Link', action: () => injectMarkdown('[', '](url)') },
        { icon: Code, label: 'Inline Code', action: () => injectMarkdown('`', '`') },
        { icon: FileCode, label: 'Code Block', action: () => injectMarkdown('```javascript\n', '\n```') },
        { icon: List, label: 'List', action: () => injectMarkdown('- ') },
        { icon: ListOrdered, label: 'Ordered List', action: () => injectMarkdown('1. ') },
        { icon: ImageIcon, label: 'Image', action: () => injectMarkdown('![alt text](', ')') },
        { icon: LinkIcon, label: 'Wiki Link', action: () => injectMarkdown('[[', ']]') },
    ];

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        const res = await dispatch(createCategory({ name: newCategoryName }));
        if (!res.error) {
            toast.success('Category created');
            setFormData(prev => ({ ...prev, categoryId: res.payload._id }));
            setShowCategoryModal(false);
            setNewCategoryName('');
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            const res = await api.post('/folders', { name: newFolderName });

            if (res.data.success) {
                toast.success('Folder created');
                // Format the new folder object to match existing structure
                const newFolder = res.data.data;
                setFolders(prev => [...prev, newFolder]);
                setFormData(prev => ({ ...prev, folderId: newFolder._id }));
                setShowFolderModal(false);
                setNewFolderName('');

                // Notify other components (like Sidebar)
                window.dispatchEvent(new CustomEvent('folderCreated', { detail: newFolder }));
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to create folder';
            toast.error(message);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) return toast.error('Enter a title');
        if (!categoryId) return toast.error('Choose a category');

        const noteData = new FormData();
        noteData.append('title', title.trim());
        noteData.append('content', content);
        noteData.append('type', type);
        noteData.append('category', categoryId);
        if (folderId) noteData.append('folder', folderId);
        noteData.append('isPublic', String(isPublic));
        noteData.append('adrStatus', adrStatus);
        noteData.append('videoUrl', videoUrl);

        // Explicitly cast tags to string to avoid nested array corruption
        const rawTagsString = String(tags || '');
        const tagsArray = rawTagsString.split(/[,\s]+/).filter(t => t.trim() !== '');
        tagsArray.forEach(tag => {
            noteData.append('tags', tag);
        });

        if (file) {
            noteData.append('file', file);
        }

        const action = id ? updateNote({ id, noteData }) : createNote(noteData);
        setIsSaving(true);
        dispatch(action).then((res) => {
            setIsSaving(false);
            if (res.meta.requestStatus === 'fulfilled') {
                localStorage.removeItem(draftKey);
                const targetPath = folderId ? `/notes?folder=${folderId}` : '/notes';
                navigate(targetPath);
            }
        });
    };

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-300 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-[3px] text-primary">
                        <FileCode size={24} />
                    </div>
                    <div>
                        <h1 className="text-[24px] font-bold text-foreground">
                            {id ? 'Edit Record' : type === 'issue' ? 'Ask a Question' : 'Create New Note'}
                        </h1>
                        <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-bold">Workspace / Library</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {hasDraft && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-[6px]"
                            >
                                <span className="text-[12px] font-bold text-primary uppercase tracking-wider">Unsaved Progress</span>
                                <div className="flex gap-3">
                                    <button onClick={restoreDraft} className="text-[12px] font-bold text-foreground hover:text-primary transition-colors">Restore</button>
                                    <button onClick={discardDraft} className="text-[12px] font-bold text-muted-foreground hover:text-foreground">Discard</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button type="button" onClick={() => navigate(-1)} className="p-2 text-muted-foreground hover:bg-muted/50 rounded-[6px] transition-colors">
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isSaving}
                        className="so-btn so-btn-primary px-8 font-bold shadow-xl shadow-primary/20"
                    >
                        {isSaving ? 'Syncing...' : (
                            <><Save size={18} className="mr-2" /> Sync Record</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative">
                        <input
                            name="title"
                            value={title}
                            onChange={onChange}
                            placeholder={type === 'issue' ? "Question: What specific problem are you facing? (e.g. 'Redux state not updating after API call')" : "Title of your documentation..."}
                            className={`w-full bg-transparent text-[28px] font-bold border-none outline-none placeholder:text-muted-foreground/30 focus:ring-0 ${type === 'issue' ? 'text-primary' : 'text-foreground'}`}
                            required
                        />
                        <div className="h-px w-full bg-border absolute bottom-0 left-0" />
                    </div>

                    <div className="glass-frost rounded-[3px] overflow-hidden shadow-sm flex flex-col">
                        <div className="flex flex-wrap items-center justify-between px-2 py-1 bg-muted/20 border-b border-border">
                            <div className="flex flex-wrap gap-1">
                                {toolbarActions.map((item, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={item.action}
                                        className="p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-[3px] transition-all"
                                        title={item.label}
                                    >
                                        <item.icon size={16} />
                                    </button>
                                ))}
                            </div>

                            <div className="flex border border-border rounded-[2px] overflow-hidden ml-auto">
                                {[
                                    { id: 'edit', icon: Code, label: 'Write' },
                                    { id: 'split', icon: Columns, label: 'Split' },
                                    { id: 'preview', icon: Eye, label: 'Preview' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setViewMode(tab.id)}
                                        className={`px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 transition-colors ${viewMode === tab.id ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-muted/30'
                                            }`}
                                    >
                                        <tab.icon size={12} /> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex h-[600px]">
                            {(viewMode === 'edit' || viewMode === 'split') && (
                                <div className={`flex-1 min-w-0 border-r border-border h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                                    <Editor
                                        height="100%"
                                        language="markdown"
                                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                        value={content}
                                        onMount={handleEditorDidMount}
                                        onChange={onEditorChange}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                            scrollBeyondLastLine: false,
                                            padding: { top: 16, bottom: 16 },
                                            fontFamily: "'Fira Code', 'Fira Mono', monospace",
                                        }}
                                    />
                                </div>
                            )}

                            {(viewMode === 'preview' || viewMode === 'split') && (
                                <div className={`flex-1 overflow-y-auto bg-card p-10 prose prose-zinc dark:prose-invert max-w-none h-full shadow-inner ${viewMode === 'split' ? 'w-1/2 border-l border-border' : 'w-full'} text-foreground`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                const codeString = String(children).replace(/\n$/, '');

                                                if (match?.[1] === 'mermaid') {
                                                    return <Mermaid chart={codeString} />;
                                                }

                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={theme === 'dark' ? vscDarkPlus : prism}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="!rounded-[3px] !bg-background !p-6 !border !border-border !text-[14px]"
                                                        {...props}
                                                    >
                                                        {codeString}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className="bg-accent/40 text-primary px-1.5 py-0.5 rounded-[3px] font-mono text-[14px] font-semibold" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {content || '*No content to preview yet. Start typing or use the toolbar.*'}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20 border-t border-border text-[11px] text-muted-foreground font-mono uppercase">
                            <div className="flex gap-4">
                                <span>Markdown Format</span>
                                <span>{wordCount} Words</span>
                                {lastSaved && <span className="text-primary/70">Internal Draft: {lastSaved}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500 animate-pulse' : 'bg-primary'}`} />
                                <span>{isDirty ? 'Unsaved Changes' : 'Synced to Cache'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-frost p-5 rounded-[3px] shadow-sm">
                        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Layout size={14} className="text-primary" /> Configuration
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Note Classification</label>
                                <select
                                    name="type"
                                    value={type}
                                    onChange={onChange}
                                    className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] text-foreground outline-none focus:border-primary"
                                >
                                    <option value="doc">Standard Doc</option>
                                    <option value="issue">Community Question (Issue)</option>
                                    <option value="adr">Arch Decision (ADR)</option>
                                    <option value="pattern">Logic Pattern</option>
                                    <option value="code">Code Snippet</option>
                                    <option value="cheatsheet">Cheatsheet</option>
                                </select>
                            </div>

                            {type === 'adr' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[11px] font-bold text-muted-foreground uppercase">ADR Status</label>
                                    <select
                                        name="adrStatus"
                                        value={adrStatus}
                                        onChange={onChange}
                                        className="w-full border border-primary/30 bg-primary/5 rounded-[3px] py-1.5 px-3 text-[13px] text-primary font-bold outline-none"
                                    >
                                        <option value="proposed">Proposed</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="deprecated">Deprecated</option>
                                        <option value="superseded">Superseded</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Tag Category</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(true)}
                                        className="text-[10px] text-primary hover:underline font-bold"
                                    >
                                        + New
                                    </button>
                                </div>
                                <select
                                    name="categoryId"
                                    value={categoryId}
                                    onChange={onChange}
                                    className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] text-foreground outline-none focus:border-primary"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Folder (Optional)</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowFolderModal(true)}
                                        className="text-[10px] text-primary hover:underline font-bold"
                                    >
                                        + New
                                    </button>
                                </div>
                                <div className="relative">
                                    <select
                                        name="folderId"
                                        value={folderId}
                                        onChange={onChange}
                                        className="w-full border border-border bg-background rounded-[3px] py-2 pl-9 pr-3 text-[13px] text-foreground outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">No Folder (Root)</option>
                                        {folders.map((folder) => (
                                            <option key={folder._id} value={folder._id}>
                                                {folder.displayText || folder.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Folder size={14} className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Search Tags</label>
                                <input
                                    name="tags"
                                    value={tags}
                                    onChange={onChange}
                                    placeholder="node architecture security"
                                    className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] text-foreground outline-none focus:border-primary"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Research Resource (PDF)</label>
                                <div className="border border-border border-dashed rounded-[3px] p-4 text-center hover:bg-muted/10 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {file ? (
                                        <div className="text-[12px] flex items-center justify-center gap-2 text-primary font-bold">
                                            <FileCode size={14} /> {file.name}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <FileUp size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-[11px] text-muted-foreground">Attach technical papers</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={isPublic}
                                            onChange={onChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-primary transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">Public Post</p>
                                        <p className="text-[10px] text-muted-foreground">Allow community viewing</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {type === 'issue' ? (
                        <div className="bg-primary/5 border border-primary/20 p-5 rounded-[3px]">
                            <h3 className="text-[13px] font-bold text-primary mb-3 flex items-center gap-2">
                                <Info size={14} /> Community Guidelines
                            </h3>
                            <ul className="text-[11px] text-muted-foreground space-y-2 list-disc pl-4">
                                <li>Be specific about the error message.</li>
                                <li>Provide a <span className="text-primary font-bold">Minimal Reproducible Example</span>.</li>
                                <li>Tag your tech stack for better visibility.</li>
                                <li>Award solutions to help the community grow.</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-accent/30 border border-primary/20 p-5 rounded-[3px]">
                            <h3 className="text-[13px] font-bold text-foreground mb-2 flex items-center gap-2">
                                <HelpCircle size={14} className="text-primary" /> System Pro-Tip
                            </h3>
                            <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                                Use the **Split View** to see your README live as you document logic.
                                Patterns with high-quality tags are 80% easier to find later.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showCategoryModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-frost w-full max-w-sm rounded-[3px] shadow-2xl p-6"
                        >
                            <h3 className="text-[17px] font-bold text-foreground mb-4">Quick Create Category</h3>
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <input
                                    autoFocus
                                    className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[14px] text-foreground outline-none focus:border-primary"
                                    placeholder="e.g. System Design"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="so-btn so-btn-primary flex-1">Create</button>
                                    <button type="button" onClick={() => setShowCategoryModal(false)} className="so-btn bg-transparent hover:bg-muted/50 flex-1">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showFolderModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-frost w-full max-w-sm rounded-[3px] shadow-2xl p-6"
                        >
                            <h3 className="text-[17px] font-bold text-foreground mb-4">Quick Create Folder</h3>
                            <form onSubmit={handleCreateFolder} className="space-y-4">
                                <input
                                    autoFocus
                                    className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[14px] text-foreground outline-none focus:border-primary"
                                    placeholder="e.g. Project Docs"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="so-btn so-btn-primary flex-1">Create</button>
                                    <button type="button" onClick={() => setShowFolderModal(false)} className="so-btn bg-transparent hover:bg-muted/50 flex-1">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NoteEditor;
