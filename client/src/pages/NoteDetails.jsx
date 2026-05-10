import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../context/ThemeContext';
import {
    Edit,
    Trash2,
    Share2,
    ChevronUp,
    ChevronDown,
    Bookmark,
    History,
    Video,
    Copy,
    Check,
    FileCode,
    FileDown,
    ExternalLink,
    MessageSquare,
    Link as LinkIcon,
    ChevronRight,
    Tag as TagIcon,
    FolderTree,
    CheckCircle2,
    Pin,
    Zap as ZapIcon,
    Flame,
    Brain,
    Clock,
    Activity
} from 'lucide-react';

import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import Mermaid from '../components/Mermaid';
import { getNote, deleteNote, cloneNote, addComment, deleteComment, updateComment, markSolution, togglePin } from '../features/notes/noteSlice';
import { followUser, unfollowUser } from '../features/auth/authSlice';
import ShareNoteModal from '../components/ShareNoteModal';
import SaveToShelfModal from '../components/SaveToShelfModal';
import LogicSeal from '../components/LogicSeal';
import FlashQuiz from '../components/FlashQuiz';
import { motion, AnimatePresence } from 'framer-motion';





import { addToRecent } from '../utils/recentTracker';
import { getCoverGradientStyle } from '../utils/noteCover';

const NoteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useTheme();

    const { notes, isLoading } = useSelector((state) => state.notes);
    const { user } = useSelector((state) => state.auth);
    const note = notes.find((n) => n._id === id);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [isCloning, setIsCloning] = useState(false);

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        dispatch(getNote({ id, token }));
    }, [id, token, dispatch]);

    useEffect(() => {
        if (location.hash === '#comments') {
            setTimeout(() => {
                const element = document.getElementById('comments');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 500); // Small delay to ensure render
        }
    }, [location.hash, note]);


    // Track recent access
    useEffect(() => {
        if (note) {
            addToRecent(note);
        }
    }, [note]);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isInterviewMode, setIsInterviewMode] = useState(false);
    const [interviewData, setInterviewData] = useState(null);
    const [isInterviewLoading, setIsInterviewLoading] = useState(false);



    const handleSaveConfirm = async (folderId) => {
        setIsCloning(true);
        try {
            const res = await dispatch(cloneNote({ id, folderId }));
            if (!res.error) {
                navigate(`/notes/${res.payload._id}`);
            }
        } finally {
            setIsCloning(false);
            setIsSaveModalOpen(false);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([note.content], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        // Sanitize filename
        const filename = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".md";
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            await dispatch(deleteNote(id));
            navigate('/notes');
        }
    };

    const reputation = (note?.views || 0) * 5 + 10;

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const isFollowing = user?.following?.includes(note?.user?._id);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShare = () => {
        if (user && note?.user?._id === user._id) {
            setIsShareModalOpen(true);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    const handleFollow = () => {
        if (!user) return navigate('/login');
        if (isFollowing) {
            dispatch(unfollowUser(note.user._id));
        } else {
            dispatch(followUser(note.user._id));
        }
    };

    const handleCopyReference = () => {
        const ref = `[[${note.title}]]`;
        navigator.clipboard.writeText(ref);
        toast.success(`Copied reference: ${ref}`);
    };

    const startEditingComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentText(comment.text);
    };

    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditCommentText('');
    };

    const saveEditedComment = (commentId) => {
        if (!editCommentText.trim()) return;
        dispatch(updateComment({ noteId: id, commentId, text: editCommentText }));
        setEditingCommentId(null);
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm('Delete this contribution?')) {
            dispatch(deleteComment({ noteId: id, commentId }));
        }
    };

    const handleMarkSolution = (commentId) => {
        dispatch(markSolution({ noteId: id, commentId }));
    };

    const [commentPreview, setCommentPreview] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handlePin = () => {
        dispatch(togglePin(id));
    };

    const toggleInterviewMode = async () => {
        if (!isInterviewMode && !interviewData) {
            setIsInterviewLoading(true);
            try {
                const res = await api.get(`/notes/${id}/interview`);
                if (res.data.success) {
                    setInterviewData(res.data.data);
                }
            } catch (err) {
                toast.error('Failed to prepare Cheat Sheet');
            } finally {
                setIsInterviewLoading(false);
            }
        }
        setIsInterviewMode(!isInterviewMode);
        if (!isInterviewMode) {
            toast.success('Interview Protocol Activated', { icon: '🔥' });
        }
    };


    const handleQuickAction = (text) => {
        setCommentText(prev => prev ? `${prev}\n\n${text}` : text);
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Brain className="w-16 h-16 text-muted-foreground opacity-20" />
                <h2 className="text-xl font-bold text-foreground italic">Restricted Neural Link</h2>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    Access to this record is either restricted or the link has expired.
                    Ensure you have the correct bypass token.
                </p>
                <Link to="/notes" className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold  tracking-widest hover:scale-105 active:scale-95 transition-all mt-4">
                    Return to Library
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-700">
                {(note.coverImageUrl || note.coverGradient) && (
                    <div className="relative w-full h-56 sm:h-72 rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl group">
                        
                        {note.coverImageUrl ? (
                            <img
                                src={note.coverImageUrl}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div
                                className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
                                style={getCoverGradientStyle(note.coverGradient) || undefined}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none z-[5]" />
                    </div>
                )}

                {/* Header Section */}
                <div className="border-b border-border/50 pb-10 mb-10 relative">
                    <div className="flex flex-col xl:flex-row justify-between items-start gap-8 mb-8">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
                                    <LogicSeal content={note.content} id={note._id} size={56} className="opacity-80" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-xl font-bold text-foreground  tracking-tighter leading-tight flex items-center gap-4">
                                        {note.isPinned && <Pin size={24} className="text-primary fill-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
                                        {note.title}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/60">RECORD_HASH::{note._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 shrink-0 relative z-20">
                            {user && user.role === 'admin' && (
                                <button
                                    onClick={handlePin}
                                    className={`h-12 px-5 rounded-xl border transition-all flex items-center gap-2 ${note.isPinned ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-card/40 backdrop-blur-xl border-border/50 text-muted-foreground hover:border-primary/30'}`}
                                    title={note.isPinned ? 'Unpin_Record' : 'Pin_Record'}
                                >
                                    <Pin size={16} strokeWidth={3} className={note.isPinned ? 'fill-white' : ''} />
                                </button>
                            )}
                            {user && note.user?._id === user._id ? (
                                <Link to={`/notes/edit/${id}`} className="h-12 px-6 bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl text-[10px] font-bold  tracking-[0.2em] flex items-center gap-2 hover:border-primary/30 transition-all">
                                    <Edit size={16} strokeWidth={3} /> EDIT_SOURCE
                                </Link>
                            ) : (
                                user && note.isPublic && (
                                    <>
                                        <button
                                            onClick={() => setIsSaveModalOpen(true)}
                                            disabled={isCloning}
                                            className="h-12 px-6 bg-primary text-white shadow-xl shadow-primary/20 rounded-xl text-[10px] font-bold  tracking-[0.2em] flex items-center gap-3 group active:scale-95 transition-all relative overflow-hidden"
                                        >
                                            
                                            <Copy size={16} strokeWidth={3} /> {isCloning ? 'CLONING...' : 'SYNC_TO_VAULT'}
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="h-12 w-12 bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl flex items-center justify-center hover:border-primary/30 transition-all text-muted-foreground"
                                            title="Download_Raw_Markdown"
                                        >
                                            <FileDown size={18} strokeWidth={2.5} />
                                        </button>
                                    </>
                                )
                            )}
                            <button
                                onClick={toggleInterviewMode}
                                className={`h-12 px-6 rounded-xl border font-bold text-[10px]  tracking-[0.2em] flex items-center gap-3 transition-all relative overflow-hidden ${isInterviewMode ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-card/40 backdrop-blur-xl border-border/50 text-muted-foreground hover:border-amber-500/30 hover:text-amber-500'}`}
                            >
                                
                                <Flame size={16} strokeWidth={3} className={isInterviewMode ? 'fill-white' : ''} /> {isInterviewMode ? 'PROTOCOL_ACTIVE' : 'BRIEFING_MODE'}
                            </button>
                        </div>
                    </div>

                    {/* Neural Sync CTA */}
                    {user && (
                        <div className="mb-10 p-6 bg-primary/5 border border-primary/20 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden" onClick={() => setIsQuizOpen(true)}>
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                                    <Brain size={32} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-[16px] font-bold text-foreground  tracking-tighter mb-1">Initialize_Neural_Sync</h4>
                                    <p className="text-[11px] text-muted-foreground/80 font-bold  tracking-[0.2em]">Validate core understanding // EARN_XP_REPUTATION</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-primary font-bold text-[11px]  tracking-[0.3em] mt-4 sm:mt-0 relative z-10">
                                START_SYNC <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-8 text-[11px] font-bold  tracking-[0.2em] text-muted-foreground">
                        <div className="flex items-center gap-3 group">
                            <Clock size={14} className="text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-foreground/40 group-hover:text-foreground transition-colors">RECORDED: {new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <CheckCircle2 size={14} className={note.isPublic ? 'text-emerald-500' : 'text-muted-foreground/30'} />
                            <span className={note.isPublic ? 'text-emerald-500' : 'text-foreground/40'}>{note.isPublic ? 'PULSE_PUBLIC' : 'VAULT_SECURE'}</span>
                        </div>
                        {note.type === 'adr' && (
                            <div className="flex items-center gap-3 group">
                                <ZapIcon size={14} className="text-primary" />
                                <span className={`px-2 py-1 rounded-lg border ${note.adrStatus === 'accepted' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-primary/10 border-primary text-primary'}`}>
                                    DECISION::{note.adrStatus}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 group ml-auto">
                            <FolderTree size={14} className="text-primary" />
                            <span className="text-foreground/40 group-hover:text-primary transition-colors">PATH: {note.category?.name || 'ROOT'} {note.folder && `// ${note.folder.name}`}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Voting Sidebar */}
                    <div className="flex lg:flex-col items-center justify-center sm:justify-start gap-4 pt-2">
                        <button
                            onClick={() => setIsQuizOpen(true)}
                            className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all group mb-4 hidden lg:flex items-center justify-center relative shadow-xl shadow-primary/5"
                            title="Neural_Sync_Core"
                        >
                            
                            <Brain className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                        </button>
                        <div className="flex lg:flex-col items-center gap-3 bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-2xl">
                            <button className="p-3 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all group">
                                <ChevronUp size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <span className="text-2xl font-bold tabular-nums tracking-tighter text-foreground">1</span>
                            <button className="p-3 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all group">
                                <ChevronDown size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="flex lg:flex-col gap-6 lg:mt-8">
                            <button className="text-muted-foreground/30 hover:text-primary transition-all group">
                                <Bookmark size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="text-muted-foreground/30 hover:text-foreground transition-all group">
                                <History size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                        {/* Main Content Area */}
                        <div className={`flex-1 min-w-0 transition-all duration-700 bg-card/20 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden ${isInterviewMode ? 'max-w-4xl mx-auto ring-2 ring-amber-500/20' : ''}`}>
                            

                            {isInterviewMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 mb-12 shadow-2xl overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <Flame size={80} />
                                    </div>

                                    <h3 className="text-[11px] font-bold text-amber-500  tracking-[0.4em] mb-6 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 " />
                                        TACTICAL_BRIEFING_CORE
                                    </h3>

                                    {isInterviewLoading ? (
                                        <div className="flex items-center gap-4 text-amber-500/60 ">
                                            <div className="h-2 w-2 bg-amber-500 rounded-full" />
                                            <span className="text-[12px] font-bold  tracking-widest">SYST-AI: ANALYZING_LOGIC_GATES...</span>
                                        </div>
                                    ) : interviewData ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <h4 className="text-[11px] font-bold text-foreground  tracking-[0.2em] border-b border-amber-500/20 pb-2">CRITICAL_POINTS</h4>
                                                <ul className="space-y-3">
                                                    {interviewData.talkingPoints.map((point, i) => (
                                                        <li key={i} className="text-[13px] text-muted-foreground/90 flex gap-3 font-medium italic">
                                                            <span className="text-amber-500 font-bold">#</span> {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-6">
                                                <h4 className="text-[11px] font-bold text-foreground  tracking-[0.2em] border-b border-amber-500/20 pb-2">NEURAL_Q&A</h4>
                                                <div className="space-y-5">
                                                    {interviewData.questions.slice(0, 2).map((q, i) => (
                                                        <div key={i} className="space-y-2 bg-background/40 p-4 rounded-xl border border-amber-500/10">
                                                            <p className="text-[12px] font-bold text-foreground  tracking-tight">Q: {q.q}</p>
                                                            <p className="text-[12px] text-muted-foreground italic leading-relaxed">A: {q.a}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[12px] text-muted-foreground/60 italic font-bold  tracking-widest">Prepare for technical scrutiny. Protocol standing by.</p>
                                    )}
                                </motion.div>
                            )}

                        {/* ... (keep Article, Backlinks, Tags) ... */}

                        <article className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-[17px] prose-p:leading-[1.8] text-foreground font-normal prose-headings:font-bold prose-headings:tracking-tight">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        const codeString = String(children).replace(/\n$/, '');
                                        const blockIndex = node ? node.position?.start.line : 0;

                                        if (match?.[1] === 'mermaid') {
                                            return <Mermaid chart={codeString} />;
                                        }

                                        return !inline && match ? (
                                            <div className="relative group my-8">
                                                {/* Code Block Header */}
                                                <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border border-border border-b-0 rounded-t-[3px]">
                                                    <div className="flex items-center gap-2">
                                                        <FileCode size={14} className="text-muted-foreground" />
                                                        <span className="text-[11px] font-bold text-muted-foreground  tracking-widest">{match[1]}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(codeString, blockIndex)}
                                                        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {copiedIndex === blockIndex ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                                                        {copiedIndex === blockIndex ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={theme === 'dark' ? vscDarkPlus : prism}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    className="!rounded-b-[3px] !rounded-t-0 !m-0 !bg-background !p-6 !border !border-border !text-[14px] !leading-relaxed"
                                                    {...props}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-accent/40 text-primary px-1.5 py-0.5 rounded-[3px] font-mono text-[14px] font-semibold" {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    p({ children }) {
                                        const processNodes = (nodes) => {
                                            return nodes.flatMap((node, i) => {
                                                if (typeof node === 'string') {
                                                    if (!node.includes('[[')) return node;
                                                    const parts = node.split(/(\[\[.*?\]\])/g);
                                                    return parts.map((part, j) => {
                                                        if (part.startsWith('[[') && part.endsWith(']]')) {
                                                            const inner = part.slice(2, -2);
                                                            const [linkPath, linkLabel] = inner.split('|');
                                                            const title = linkPath.trim();
                                                            const label = (linkLabel || linkPath).trim();

                                                            // System page routing
                                                            let to = `/notes?search=${encodeURIComponent(title)}`;
                                                            if (title.toLowerCase() === 'technical library') to = '/notes';
                                                            if (title.toLowerCase() === 'system metrics') to = '/dashboard';

                                                            return (
                                                                <Link
                                                                    key={`${i}-${j}`}
                                                                    to={to}
                                                                    className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
                                                                >
                                                                    {label}
                                                                </Link>
                                                            );
                                                        }
                                                        return part;
                                                    });
                                                }
                                                // Recursively handle nodes if they have children (e.g. strong, em)
                                                if (node?.props?.children) {
                                                    const newChildren = processNodes(Array.isArray(node.props.children) ? node.props.children : [node.props.children]);
                                                    return { ...node, props: { ...node.props, children: newChildren } };
                                                }
                                                return node;
                                            });
                                        };

                                        const content = processNodes(Array.isArray(children) ? children : [children]);
                                        return <p>{content}</p>;
                                    },
                                    li({ children }) {
                                        const processNodes = (nodes) => {
                                            return nodes.flatMap((node, i) => {
                                                if (typeof node === 'string') {
                                                    if (!node.includes('[[')) return node;
                                                    const parts = node.split(/(\[\[.*?\]\])/g);
                                                    return parts.map((part, j) => {
                                                        if (part.startsWith('[[') && part.endsWith(']]')) {
                                                            const inner = part.slice(2, -2);
                                                            const [linkPath, linkLabel] = inner.split('|');
                                                            const title = linkPath.trim();
                                                            const label = (linkLabel || linkPath).trim();

                                                            return (
                                                                <Link
                                                                    key={`${i}-${j}`}
                                                                    to={`/notes?search=${encodeURIComponent(title)}`}
                                                                    className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
                                                                >
                                                                    {label}
                                                                </Link>
                                                            );
                                                        }
                                                        return part;
                                                    });
                                                }
                                                if (node?.props?.children) {
                                                    const newChildren = processNodes(Array.isArray(node.props.children) ? node.props.children : [node.props.children]);
                                                    return { ...node, props: { ...node.props, children: newChildren } };
                                                }
                                                return node;
                                            });
                                        };
                                        return <li>{processNodes(Array.isArray(children) ? children : [children])}</li>;
                                    }
                                }}
                            >
                                {note.content}
                            </ReactMarkdown>
                        </article>

                        {((note.relatedNotes && note.relatedNotes.length > 0) || (note.backlinks && note.backlinks.length > 0)) && (
                            <div className="mt-20 pt-12 border-t border-border/20 grid grid-cols-1 md:grid-cols-2 gap-10">
                                {note.relatedNotes && note.relatedNotes.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold text-primary  tracking-[0.3em] flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            OUTBOUND_PULSES
                                        </h3>
                                        <div className="space-y-3">
                                            {note.relatedNotes.map((link) => (
                                                <Link
                                                    key={link._id}
                                                    to={`/notes/${link._id}`}
                                                    className="block p-4 bg-background/40 border border-border/50 rounded-2xl hover:border-primary/40 transition-all group relative overflow-hidden"
                                                >
                                                    
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="text-[13px] text-foreground font-bold  tracking-tight truncate group-hover:text-primary transition-colors">{link.title}</span>
                                                        <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {note.backlinks && note.backlinks.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold text-muted-foreground  tracking-[0.3em] flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                            KNOWLEDGE_BACKLINS
                                        </h3>
                                        <div className="space-y-3">
                                            {note.backlinks.map((link) => (
                                                <Link
                                                    key={link._id}
                                                    to={`/notes/${link._id}`}
                                                    className="block p-4 bg-background/40 border border-border/50 rounded-2xl hover:border-primary/40 transition-all group relative overflow-hidden"
                                                >
                                                    
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="text-[13px] text-foreground font-bold  tracking-tight truncate group-hover:text-primary transition-colors">{link.title}</span>
                                                        <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-10">
                            {note.category && (
                                <span className="so-tag py-1.5 px-4 text-[12px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-2">
                                    <FolderTree size={12} />
                                    {note.category.name}
                                </span>
                            )}
                            {note.tags?.map((tag, i) => (
                                <Link
                                    key={i}
                                    to={`/notes?search=${encodeURIComponent(tag)}`}
                                    className="so-tag py-1.5 px-4 text-[12px] text-muted-foreground bg-accent/30 border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all flex items-center gap-2"
                                >
                                    <TagIcon size={12} className="opacity-50" />
                                    {tag}
                                </Link>
                            ))}
                        </div>

                        <div className="flex flex-col xl:flex-row justify-between items-start mt-12 pt-8 gap-8 pb-10 border-t border-border/20">
                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/60 w-full sm:w-auto">
                                <button onClick={handleShare} className="hover:text-primary transition-all flex items-center gap-2 bg-transparent cursor-pointer group">
                                    <Share2 size={14} className="group-hover:scale-110 transition-transform" /> SHARE_SIGNAL
                                </button>
                                <button onClick={handleCopyReference} className="hover:text-primary transition-all flex items-center gap-2 bg-transparent cursor-pointer group" title="Copy as Wiki-Link reference">
                                    <LinkIcon size={14} className="group-hover:scale-110 transition-transform" /> COPY_REF
                                </button>
                                <button
                                    onClick={handleFollow}
                                    className={`${isFollowing ? 'text-primary' : 'hover:text-primary'} transition-all flex items-center gap-2 bg-transparent cursor-pointer group`}
                                >
                                    <Bookmark size={14} className={`${isFollowing ? 'fill-primary' : ''} group-hover:scale-110 transition-transform`} /> {isFollowing ? 'FOLLOWING_ENTITY' : 'FOLLOW_ENTITY'}
                                </button>
                                {user && (user.role === 'admin' || note.user?._id === user._id) && (
                                    <button onClick={handleDelete} className="hover:text-rose-500 transition-all flex items-center gap-2 bg-transparent cursor-pointer group">
                                        <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> WIPE_RECORD
                                    </button>
                                )}
                            </div>

                            <div className="bg-card/40 backdrop-blur-xl p-5 rounded-3xl w-full sm:w-[280px] shrink-0 border border-border/50 group hover:border-primary/30 transition-all shadow-2xl relative overflow-hidden">
                                
                                <p className="text-[9px] font-bold  tracking-[0.3em] text-muted-foreground/40 mb-3 relative z-10">
                                    AUTH_IDENTITY // TS::{new Date(note.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-primary/20 border border-white/10">
                                        {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground font-bold  tracking-tight truncate">
                                            {note.user?.username || 'ANON_USER'}
                                        </p>
                                        <div className="flex items-center gap-2 text-[9px] text-primary font-bold  tracking-widest mt-1">
                                            <Activity size={10} strokeWidth={3} className="text-emerald-500" />
                                            <span>REP::{(note.user?.reputation || 0).toLocaleString()}</span>
                                            {(note.user?.reputation || 0) > 500 && (
                                                <span className="bg-primary/20 px-1.5 py-0.5 rounded text-[8px]">
                                                    {(note.user?.reputation || 0) > 2000 ? 'GOLD' : (note.user?.reputation || 0) > 1000 ? 'SILVER' : 'BRONZE'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {note.attachmentUrl && (
                            <div className="mt-12 pt-8 border-t border-border/20">
                                <h3 className="text-[10px] font-bold  tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary " />
                                    TECHNICAL_RESOURCES_VAULT
                                </h3>
                                <div className="bg-card/40 backdrop-blur-xl border border-border/50 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-all relative overflow-hidden shadow-2xl">
                                    
                                    <div className="p-5 bg-primary/10 rounded-full mb-6 text-primary group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/5 border border-primary/20">
                                        <FileDown size={40} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-xl font-bold text-foreground  tracking-tighter mb-2 relative z-10">
                                        {note.attachment?.originalName || 'RAW_DOCUMENTATION'}
                                    </p>
                                    <p className="text-[11px] font-bold text-muted-foreground  tracking-[0.2em] mb-8 relative z-10">PROTOCOL_READY // AUTHORIZED_DOWNLOAD_ONLY</p>
                                    <a
                                        href={note.attachmentUrl.startsWith('http') ? note.attachmentUrl : `http://localhost:5005/${note.attachmentUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-12 px-10 bg-primary text-white shadow-xl shadow-primary/20 rounded-xl text-[10px] font-bold  tracking-[0.3em] flex items-center gap-3 active:scale-95 transition-all relative z-10"
                                    >
                                        <ExternalLink size={16} strokeWidth={3} /> INITIALIZE_EXTRACTION
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Tutorial Section if exists */}
                        {note.videoUrl && (
                            <div className="mt-12 pt-10 border-t border-border/20">
                                <h3 className="text-[10px] font-bold  tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary " />
                                    INTEGRATED_VISUAL_SYNC
                                </h3>
                                <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl relative group">
                                    
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${note.videoUrl.includes('watch?v=') ? note.videoUrl.split('watch?v=')[1].split('&')[0] : note.videoUrl.split('/').pop()}`}
                                        title="Tutorial"
                                        frameBorder="0"
                                        allowFullScreen
                                        className="relative z-10"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Community Discussion Layer */}
                        {/* Community Discussion Layer */}
                        {!isInterviewMode && (
                            <div id="comments" className="mt-20 pt-12 border-t border-border/20">
                                <h3 className="text-[10px] font-bold  tracking-[0.4em] text-primary mb-10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary " />
                                    {note.type === 'issue' ? 'ANSWERS_&_SOLUTIONS_PROTOCOL' : 'DISCUSSION_&_LOGIC_CONTRIBUTIONS'}
                                </h3>

                                {user ? (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!commentText.trim()) return;
                                        dispatch(addComment({ id, text: commentText }));
                                        setCommentText('');
                                        setCommentPreview(false);
                                    }} className="mb-12 bg-card/40 backdrop-blur-xl p-8 rounded-[2rem] border border-border/50 shadow-2xl relative overflow-hidden group">
                                        
                                        
                                        <div className="flex justify-between items-center mb-6 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[11px] font-bold  tracking-[0.2em] text-foreground">DRAFTING_CONTRIBUTION</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCommentPreview(!commentPreview)}
                                                className={`text-[9px]  font-bold tracking-[0.3em] px-4 py-2 rounded-lg transition-all ${commentPreview ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background/50 border border-border/50 text-muted-foreground hover:border-primary/30'}`}
                                            >
                                                {commentPreview ? 'EDITOR_MODE' : 'PREVIEW_SIGNAL'}
                                            </button>
                                        </div>

                                        {commentPreview ? (
                                            <div className="min-h-[160px] bg-background/50 border border-border/50 p-6 rounded-2xl prose prose-sm dark:prose-invert max-w-none mb-6 relative z-10 italic">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {commentText || "*No neural signal detected...*"}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Initialize contribution logic... (Markdown Supported)"
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl p-6 text-[14px] text-foreground focus:border-primary outline-none min-h-[160px] font-mono transition-all mb-6 placeholder:opacity-30 relative z-10"
                                            />
                                        )}

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                            {note.type === 'issue' && (
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { label: 'STEPS_REQ?', text: 'Can you provide the step-by-step instructions to reproduce this?' },
                                                        { label: 'ENV_METRICS?', text: 'What is your current OS/Browser and version?' },
                                                        { label: 'FETCH_LOGS', text: 'Please check your console/terminal logs and paste the error here.' }
                                                    ].map((btn, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => handleQuickAction(btn.text)}
                                                            className="text-[9px] font-bold  tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                                                        >
                                                            + {btn.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <button type="submit" className="h-12 px-8 bg-primary text-white shadow-xl shadow-primary/20 rounded-xl text-[10px] font-bold  tracking-[0.3em] flex items-center gap-2 group active:scale-95 transition-all w-full sm:w-auto relative overflow-hidden">
                                                
                                                POST_CONTRIBUTION <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-12 bg-card/20 backdrop-blur-xl border border-border/50 border-dashed rounded-[2rem] text-center mb-12 relative overflow-hidden group">
                                        
                                        <div className="relative z-10">
                                            <p className="text-[12px] text-muted-foreground/60 mb-6 font-bold  tracking-[0.3em]">SHARED_KNOWLEDGE_BUILDS_STABLE_SYSTEMS</p>
                                            <Link to="/login" className="h-12 px-8 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-xl font-bold  tracking-[0.3em] text-[10px] inline-flex items-center gap-3 transition-all">
                                                AUTH_BYPASS_TO_RESPOND <ExternalLink size={14} strokeWidth={3} />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    {note.comments?.length > 0 ? (
                                        [...note.comments]
                                            .sort((a, b) => (b.isSolution === a.isSolution) ? 0 : b.isSolution ? 1 : -1)
                                            .map((comment, index) => (
                                                <div key={index} className={`flex gap-6 group p-8 rounded-[2rem] transition-all relative overflow-hidden ${comment.isSolution ? 'bg-emerald-500/5 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/10' : 'bg-card/20 border border-border/50 shadow-xl'}`}>
                                                    
                                                    
                                                    <div className="w-12 h-12 bg-background/50 backdrop-blur border border-border/50 rounded-2xl flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0 relative z-10 shadow-lg">
                                                        {comment.user?.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    
                                                    <div className="flex-1 relative z-10">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="text-[13px] font-bold text-foreground  tracking-tight">{comment.user?.username || 'ANON_ENTITY'}</span>
                                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                                <span className="text-[10px] text-muted-foreground font-bold  tracking-widest">TS::{new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                                {comment.isSolution && (
                                                                    <span className="flex items-center gap-1.5 text-[9px]  font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                                        <CheckCircle2 size={12} strokeWidth={3} /> VERIFIED_LOGIC
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {user && note.type === 'issue' && note.user._id === user._id && !comment.isSolution && (
                                                                    <button
                                                                        onClick={() => handleMarkSolution(comment._id)}
                                                                        className="h-9 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-bold  tracking-widest flex items-center gap-2 shadow-lg"
                                                                    >
                                                                        <CheckCircle2 size={12} strokeWidth={3} /> MARK_SOLUTION
                                                                    </button>
                                                                )}

                                                                {user && (user._id === comment.user?._id || user.role === 'admin') && (
                                                                    <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => startEditingComment(comment)} className="p-2 hover:text-primary transition-colors">
                                                                            <Edit size={14} strokeWidth={3} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteComment(comment._id)} className="p-2 hover:text-rose-500 transition-colors">
                                                                            <Trash2 size={14} strokeWidth={3} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {editingCommentId === comment._id ? (
                                                            <div className="mt-4 space-y-4">
                                                                <textarea
                                                                    value={editCommentText}
                                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                                    className="w-full bg-background/50 border border-border/50 rounded-2xl p-4 text-[14px] text-foreground focus:border-primary outline-none min-h-[120px] font-mono shadow-inner"
                                                                />
                                                                <div className="flex gap-3">
                                                                    <button onClick={() => saveEditedComment(comment._id)} className="h-10 px-6 bg-primary text-white rounded-xl text-[10px] font-bold  tracking-widest shadow-lg shadow-primary/20">SAVE_INPUT</button>
                                                                    <button onClick={cancelEditingComment} className="h-10 px-6 bg-background border border-border text-muted-foreground rounded-xl text-[10px] font-bold  tracking-widest">CANCEL</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-[15px] prose-p:leading-relaxed text-foreground/90 font-medium italic bg-background/30 p-6 rounded-2xl border border-border/10 shadow-inner">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        code({ node, inline, className, children, ...props }) {
                                                                            const match = /language-(\w+)/.exec(className || '')
                                                                            const codeString = String(children).replace(/\n$/, '');
                                                                            return !inline && match ? (
                                                                                <div className="my-4 rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                                                                                    <SyntaxHighlighter
                                                                                        style={theme === 'dark' ? vscDarkPlus : prism}
                                                                                        language={match[1]}
                                                                                        PreTag="div"
                                                                                        className="!rounded-none !text-[12px] !p-6 !m-0 !bg-background/80"
                                                                                        {...props}
                                                                                    >
                                                                                        {codeString}
                                                                                    </SyntaxHighlighter>
                                                                                </div>
                                                                            ) : (
                                                                                <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg font-mono text-[13px] font-bold" {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            )
                                                                        }
                                                                    }}
                                                                >
                                                                    {comment.text}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="py-12 text-center opacity-40">
                                            <p className="text-[12px] font-bold  tracking-[0.4em]">NO_LOGIC_CONTRIBUTIONS_DETECTED</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <ShareNoteModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    noteId={id}
                    currentSharedWith={note.sharedWith}
                    shareToken={note.shareToken}
                />

                <SaveToShelfModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onConfirm={handleSaveConfirm}
                    isCloning={isCloning}
                />
                {/* Quiz Modal */}
            </div>
            <AnimatePresence>
                {isQuizOpen && (
                    <FlashQuiz noteId={id} onClose={() => setIsQuizOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default NoteDetails;
