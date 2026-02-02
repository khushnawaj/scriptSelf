import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createNote, getNotes, updateNote } from '../features/notes/noteSlice';
import { getCategories, createCategory } from '../features/categories/categorySlice';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Save, ArrowLeft, Code, FileText, Link as LinkIcon, Hash, Eye, Edit2, LayoutTemplate, Globe, Plus, File, PlayCircle, Minimize2, Maximize2, X, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const NoteEditor = () => {
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { categories } = useSelector((state) => state.categories);
    const { notes, isLoading, isError, message } = useSelector((state) => state.notes);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        codeSnippet: '',
        type: 'doc', // Default changed to doc as it fits "Cheat Sheet" better usually
        categoryId: '',
        tags: '',
        attachmentUrl: '',
        isPublic: false,
        isPinned: false,
        videoUrl: '', // New field for tutorials
        file: null
    });

    const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
    const [isTutorialMode, setIsTutorialMode] = useState(false);
    const [isPlaygroundMode, setIsPlaygroundMode] = useState(false);
    const [playgroundDoc, setPlaygroundDoc] = useState('');

    const { title, content, codeSnippet, type, categoryId, tags, attachmentUrl, isPublic, isPinned, videoUrl } = formData;

    // Inline Category Creation State
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [filePreview, setFilePreview] = useState(null);

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
                    codeSnippet: noteToEdit.codeSnippet || '',
                    type: noteToEdit.type,
                    categoryId: noteToEdit.category?._id || noteToEdit.category,
                    tags: noteToEdit.tags ? noteToEdit.tags.join(', ') : '',
                    attachmentUrl: noteToEdit.attachmentUrl || '',
                    isPublic: noteToEdit.isPublic || false,
                    isPinned: noteToEdit.isPinned || false,
                    videoUrl: noteToEdit.videoUrl || '',
                    file: null
                });
                if (noteToEdit.videoUrl) setIsTutorialMode(true);
            }
        }
    }, [id, notes]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
    }, [isError, message]);

    const onChange = (e) => {
        if (e.target.name === 'file') {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, file: file }));

            // Generate Preview
            if (file) {
                if (file.type.startsWith('image/')) {
                    setFilePreview({ type: 'image', url: URL.createObjectURL(file) });
                } else if (file.type === 'application/pdf') {
                    setFilePreview({ type: 'pdf', url: URL.createObjectURL(file) });
                } else {
                    setFilePreview({ type: 'other', name: file.name });
                }
            } else {
                setFilePreview(null);
            }
        } else if (e.target.name === 'isPublic') {
            setFormData(prev => ({ ...prev, isPublic: e.target.checked }));
        } else if (e.target.name === 'isPinned') {
            setFormData(prev => ({ ...prev, isPinned: e.target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const onMonacoChange = (value) => {
        setFormData(prev => ({ ...prev, content: value || '' }));
    };

    const runCode = () => {
        setPlaygroundDoc(content);
        toast.success("Code updated in playground!");
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!categoryId) {
            toast.error('Please select a category');
            return;
        }

        const noteData = new FormData();
        noteData.append('title', title);
        noteData.append('content', content);
        noteData.append('codeSnippet', codeSnippet);
        noteData.append('type', type);
        noteData.append('category', categoryId);
        noteData.append('attachmentUrl', attachmentUrl); // Legacy or optional external link
        noteData.append('isPublic', isPublic);
        noteData.append('isPinned', isPinned);
        noteData.append('videoUrl', videoUrl);
        noteData.append('tags', tags);

        if (formData.file) {
            noteData.append('file', formData.file);
        }

        const action = id
            ? updateNote({ id, noteData })
            : createNote(noteData);

        dispatch(action).then((res) => {
            if (!res.error) {
                navigate('/dashboard');
            }
        });
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setIsCreatingCategory(false);
            return;
        }

        const slug = newCategoryName.toLowerCase().replace(/ /g, '-');
        // Dispatch create action
        const resultAction = await dispatch(createCategory({ name: newCategoryName, slug }));
        if (createCategory.fulfilled.match(resultAction)) {
            setFormData(prev => ({ ...prev, categoryId: resultAction.payload._id }));
            toast.success(`Category ${newCategoryName} created!`);
            setIsCreatingCategory(false);
            setNewCategoryName('');
        } else {
            toast.error("Failed to create category");
        }
    };

    // Template Injection
    const applyTemplate = (templateType) => {
        if (templateType === 'cheatsheet') {
            setFormData(prev => ({
                ...prev,
                content: prev.content + `
## 🎯 Quick Reference

**Concept** -> \`Implementation\`

*   Item 1 -> \`code\`
*   Item 2 -> \`code\`

### 📦 Section Name
\`\`\`javascript
// Code example
console.log("Hello");
\`\`\`
`
            }));
            toast.success("Cheat Sheet template added!");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-premium-ghost px-2 text-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex gap-2">
                    {/* Template Button */}
                    <button
                        onClick={() => applyTemplate('cheatsheet')}
                        className="btn-premium-secondary py-1.5"
                        title="Insert Cheat Sheet Template"
                    >
                        <LayoutTemplate size={14} /> Template
                    </button>
                    <button
                        onClick={() => setIsTutorialMode(!isTutorialMode)}
                        className={clsx(
                            isTutorialMode ? "btn-premium-primary" : "btn-premium-secondary",
                            "py-1.5"
                        )}
                        title="Toggle Tutorial Mode (Side-by-side video)"
                    >
                        {isTutorialMode ? <Minimize2 size={14} /> : <PlayCircle size={14} />}
                        {isTutorialMode ? 'Focus Editor' : 'Tutorial Mode'}
                    </button>
                    <button
                        onClick={() => setIsPlaygroundMode(!isPlaygroundMode)}
                        className={clsx(
                            isPlaygroundMode ? "btn-premium-primary" : "btn-premium-secondary",
                            "py-1.5"
                        )}
                        title="Toggle Live Output Playground"
                    >
                        <Terminal size={14} />
                        {isPlaygroundMode ? 'Close Playground' : 'Playground'}
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    {id ? 'Edit Note' : 'New Note'}
                </h1>
                <div className="flex items-center gap-3">
                    {/* Toggle View Mode */}
                    <div className="bg-muted p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === 'edit' ? "bg-white dark:bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Edit2 size={14} /> Write
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === 'preview' ? "bg-white dark:bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Eye size={14} /> Preview
                        </button>
                    </div>

                </div>
            </div>

            <div className={clsx("grid gap-6", isTutorialMode ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 lg:grid-cols-12")}>
                {/* Reference Area (Video Player) */}
                {isTutorialMode && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-4 overflow-hidden">
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2 text-primary">
                                <PlayCircle size={18} /> Tutorial Link
                            </label>
                            <input
                                type="text"
                                name="videoUrl"
                                value={videoUrl}
                                onChange={onChange}
                                placeholder="Paste YouTube or Vimeo URL here..."
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                                autoFocus
                            />
                        </div>

                        {videoUrl && (
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-border">
                                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${videoUrl.includes('watch?v=') ? videoUrl.split('watch?v=')[1].split('&')[0] : videoUrl.split('/').pop()}`}
                                        title="Tutorial Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : videoUrl.includes('vimeo.com') ? (
                                    <iframe
                                        src={`https://player.vimeo.com/video/${videoUrl.split('/').pop()}`}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/20">
                                        <PlayCircle size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm">Video provider not directly supported for embedded playback. You can still save the link below.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!videoUrl && (
                            <div className="aspect-video bg-muted/10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                                <PlayCircle size={48} className="mb-4 opacity-10" />
                                <p className="text-sm font-medium">Link a tutorial video to see it here while you take notes.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Area */}
                <div className={clsx(isTutorialMode ? "" : "lg:col-span-8", "space-y-6 transition-all duration-500")}>
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        {/* Title Input */}
                        <div className="p-4 border-b border-border">
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={onChange}
                                placeholder="Note Title..."
                                className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        {/* Editor / Preview */}
                        <div className="min-h-[500px] flex flex-col">
                            {viewMode === 'edit' ? (
                                <div className="flex-1 border-t border-border">
                                    <Editor
                                        height="600px"
                                        language="javascript"
                                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                        value={content}
                                        onChange={onMonacoChange}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 16,
                                            lineNumbers: 'on',
                                            roundedSelection: false,
                                            scrollBeyondLastLine: false,
                                            readOnly: false,
                                            automaticLayout: true,
                                            padding: { top: 20 }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {content || '*No content yet...*'}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Playground Area */}
                    {isPlaygroundMode && (
                        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden mt-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 bg-muted/50 border-b border-border flex justify-between items-center">
                                <h3 className="flex items-center gap-2 font-bold text-sm">
                                    <Terminal size={16} className="text-primary" /> LIVE OUTPUT PREVIEW
                                </h3>
                                <button
                                    onClick={runCode}
                                    className="btn-premium-primary py-1 px-4 text-xs"
                                >
                                    Run Code
                                </button>
                            </div>
                            <div className="bg-white" style={{ height: '400px' }}>
                                <iframe
                                    srcDoc={playgroundDoc}
                                    title="output"
                                    sandbox="allow-scripts"
                                    frameBorder="0"
                                    width="100%"
                                    height="100%"
                                />
                            </div>
                        </div>
                    )}

                    {/* Separate Code Snippet Field (Optional but kept for specific 'code' type notes) */}
                    {type === 'code' && viewMode === 'edit' && (
                        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                                <Code size={16} /> Dedicated Code Snippet (Optional)
                            </label>
                            <textarea
                                name="codeSnippet"
                                value={codeSnippet}
                                onChange={onChange}
                                placeholder="// Paste pure code here if separate from body..."
                                rows="8"
                                className="w-full bg-muted border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Settings (Hidden or moved in tutorial mode for focus?) */}
                {!isTutorialMode ? (
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Organization</label>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Category</label>
                                        {!isCreatingCategory ? (
                                            <select
                                                name="categoryId"
                                                value={categoryId}
                                                onChange={(e) => {
                                                    if (e.target.value === 'NEW_CATEGORY_OPTION') {
                                                        setIsCreatingCategory(true);
                                                    } else {
                                                        onChange(e);
                                                    }
                                                }}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                                <option value="NEW_CATEGORY_OPTION" className="font-semibold text-primary">+ Create New Category</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    placeholder="Category name..."
                                                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleCreateCategory();
                                                        }
                                                        if (e.key === 'Escape') setIsCreatingCategory(false);
                                                    }}
                                                />
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent onBlur of input
                                                            handleCreateCategory();
                                                        }}
                                                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                                                        title="Save Category"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCreatingCategory(false)}
                                                        className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted-foreground/10 transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['doc', 'code', 'cheatsheet'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: t })}
                                                    className={clsx(
                                                        "text-xs font-medium py-2 rounded-md border transition-all capitalize",
                                                        type === t
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-transparent border-border text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                        <Globe size={14} /> Visibility
                                    </label>
                                    <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={isPublic}
                                            onChange={onChange}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <span className="text-sm">Make Public</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pin"><line x1="12" x2="12" y1="17" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>
                                        Pin Note
                                    </label>
                                    <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
                                        <input
                                            type="checkbox"
                                            name="isPinned"
                                            checked={isPinned}
                                            onChange={onChange}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <span className="text-sm">Pin to Top</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-5">
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Meta</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                        <Hash size={14} /> Tags
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={tags}
                                        onChange={onChange}
                                        placeholder="react, css, hooks"
                                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                {type !== 'code' && (
                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <LinkIcon size={14} /> Attachment URL
                                        </label>
                                        <input
                                            type="text"
                                            name="attachmentUrl"
                                            value={attachmentUrl}
                                            onChange={onChange}
                                            placeholder="https://..."
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                        <LinkIcon size={14} /> Upload Attachment
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        onChange={onChange}
                                        className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {filePreview && (
                                        <div className="mt-4 border rounded-lg overflow-hidden bg-background">
                                            {filePreview.type === 'image' && (
                                                <img src={filePreview.url} alt="Preview" className="w-full max-h-48 object-cover" />
                                            )}
                                            {filePreview.type === 'pdf' && (
                                                <div className="h-48 w-full bg-muted flex items-center justify-center relative group">
                                                    <iframe src={filePreview.url} className="w-full h-full pointer-events-none" title="PDF Preview"></iframe>
                                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">PDF Preview</span>
                                                    </div>
                                                </div>
                                            )}
                                            {filePreview.type === 'other' && (
                                                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted/30">
                                                    <File size={16} /> <span>{filePreview.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Save Button */}
                        <button
                            onClick={onSubmit}
                            disabled={isLoading}
                            className="btn-premium-primary w-full text-base"
                        >
                            <Save size={18} />
                            {isLoading ? 'Saving Note...' : 'Save Note'}
                        </button>
                        <div className="h-4"></div> {/* Spacer */}
                    </div>
                ) : (
                    /* Floating Save for Tutorial Mode */
                    <div className="fixed bottom-8 right-8 z-[100] animate-in zoom-in duration-300">
                        <button
                            onClick={onSubmit}
                            disabled={isLoading}
                            className="btn-premium-primary px-8 py-4 rounded-full text-lg shadow-2xl ring-4 ring-background"
                        >
                            <Save size={20} />
                            {isLoading ? 'Saving...' : 'Save Tutorial Note'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteEditor;
