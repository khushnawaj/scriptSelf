import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createNote, getNotes, updateNote } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
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
    FileCode
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NoteEditor = () => {
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const editorRef = useRef(null);

    const { categories } = useSelector((state) => state.categories);
    const { notes, isLoading } = useSelector((state) => state.notes);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'doc',
        categoryId: '',
        tags: '',
        isPublic: false,
        videoUrl: '',
    });

    const { title, content, type, categoryId, tags, isPublic, videoUrl } = formData;
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'

    useEffect(() => {
        dispatch(getCategories());
        if (!notes.length && id) {
            dispatch(getNotes());
        }
    }, [dispatch, id, notes.length]);

    useEffect(() => {
        if (id && notes.length > 0) {
            const noteToEdit = notes.find(n => n._id === id);
            if (noteToEdit) {
                setFormData({
                    title: noteToEdit.title,
                    content: noteToEdit.content,
                    type: noteToEdit.type || 'doc',
                    categoryId: noteToEdit.category?._id || noteToEdit.category,
                    tags: noteToEdit.tags ? noteToEdit.tags.join(', ') : '',
                    isPublic: noteToEdit.isPublic || false,
                    videoUrl: noteToEdit.videoUrl || '',
                });
            }
        }
    }, [id, notes]);

    const onChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: inputType === 'checkbox' ? checked : value
        }));
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const onEditorChange = (value) => {
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
    ];

    const onSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error('Enter a title');
        if (!categoryId) return toast.error('Choose a category');

        const noteData = new FormData();
        Object.keys(formData).forEach(key => {
            noteData.append(key, formData[key]);
        });
        noteData.set('category', categoryId);

        const action = id ? updateNote({ id, noteData }) : createNote(noteData);
        dispatch(action).then((res) => {
            if (!res.error) {
                toast.success(id ? 'Record Synchronized' : 'Vault Entry Created');
                navigate('/notes');
            }
        });
    };

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-[3px] text-primary">
                        <FileCode size={24} />
                    </div>
                    <div>
                        <h1 className="text-[24px] font-bold text-foreground">
                            {id ? 'Refine Record' : 'Create Vault Entry'}
                        </h1>
                        <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-bold">Workspace / Documentation</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 text-muted-foreground hover:bg-muted/50 rounded-[3px] transition-colors">
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={onSubmit}
                        className="so-btn so-btn-primary px-6 font-bold shadow-lg shadow-primary/10"
                    >
                        <Save size={16} className="mr-2" /> {id ? 'Synchronize' : 'Initialize'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Title Input */}
                    <div className="relative">
                        <input
                            name="title"
                            value={title}
                            onChange={onChange}
                            placeholder="Title of your documentation..."
                            className="w-full bg-transparent text-[28px] font-bold text-foreground border-none outline-none placeholder:text-muted-foreground/30 focus:ring-0"
                            required
                        />
                        <div className="h-px w-full bg-border absolute bottom-0 left-0" />
                    </div>

                    {/* Toolbar & Editor Section */}
                    <div className="border border-border rounded-[3px] overflow-hidden bg-card shadow-sm flex flex-col">
                        {/* Toolbar */}
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

                        {/* Editor Panes */}
                        <div className={`flex ${viewMode === 'split' ? 'min-h-[500px]' : 'min-h-[500px]'}`}>
                            {/* Write Pane */}
                            {(viewMode === 'edit' || viewMode === 'split') && (
                                <div className={`flex-1 border-r border-border min-w-0 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
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

                            {/* Preview Pane */}
                            {(viewMode === 'preview' || viewMode === 'split') && (
                                <div className={`flex-1 overflow-y-auto bg-background p-8 prose prose-zinc dark:prose-invert max-w-none ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || '*No content to preview yet. Start typing or use the toolbar.*'}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20 border-t border-border text-[11px] text-muted-foreground font-mono uppercase">
                            <div className="flex gap-4">
                                <span>Markdown Format</span>
                                <span>{wordCount} Words</span>
                                <span>{content.length} Characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#808000] animate-pulse" />
                                <span>Synchronized</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Config */}
                <div className="space-y-6">
                    <div className="bg-card border border-border p-5 rounded-[3px] shadow-sm">
                        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Layout size={14} className="text-primary" /> Configuration
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tag Category</label>
                                <select
                                    name="categoryId"
                                    value={categoryId}
                                    onChange={onChange}
                                    className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] outline-none focus:border-primary"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Search Tags</label>
                                <input
                                    name="tags"
                                    value={tags}
                                    onChange={onChange}
                                    placeholder="node architecture security"
                                    className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] outline-none focus:border-primary"
                                />
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

                    <div className="bg-accent/30 border border-primary/20 p-5 rounded-[3px]">
                        <h3 className="text-[13px] font-bold text-foreground mb-2 flex items-center gap-2">
                            <HelpCircle size={14} className="text-primary" /> System Pro-Tip
                        </h3>
                        <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                            Use the **Split View** to see your README live as you document logic.
                            Patterns with high-quality tags are 80% easier to find later.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteEditor;
