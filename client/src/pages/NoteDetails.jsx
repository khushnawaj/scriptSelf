import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    Pin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import Mermaid from '../components/Mermaid';
import { getNote, deleteNote, cloneNote, addComment, deleteComment, updateComment, markSolution, togglePin } from '../features/notes/noteSlice';
import { followUser, unfollowUser } from '../features/auth/authSlice';
import ShareNoteModal from '../components/ShareNoteModal';
import SaveToShelfModal from '../components/SaveToShelfModal';

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

    useEffect(() => {
        dispatch(getNote(id));
    }, [id, dispatch]);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const handleSaveConfirm = async (folderId) => {
        setIsCloning(true);
        try {
            const res = await dispatch(cloneNote({ id, folderId }));
            if (!res.error) {
                navigate(`/notes/${res.payload._id}`);
                toast.success('Record cloned successfully');
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
            toast.success('Record deleted');
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

    const handleQuickAction = (text) => {
        setCommentText(prev => prev ? `${prev}\n\n${text}` : text);
    };

    if (isLoading || !note) {
        return <Spinner />;
    }

    return (
        <div className="space-y-4 max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="border-b border-border pb-6 mb-6">
                {/* ... (keep header content) ... */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                    <h1 className="text-[24px] sm:text-[32px] font-normal text-foreground leading-tight tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
                        {note.isPinned && <Pin className="text-amber-500 fill-amber-500 w-5 h-5 sm:w-6 sm:h-6" />}
                        {note.title}
                        {note.type === 'issue' && (note.comments?.length || 0) === 0 && (
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest animate-pulse">
                                Unanswered
                            </span>
                        )}
                    </h1>
                    <div className="flex gap-2 shrink-0">
                        {user && user.role === 'admin' && (
                            <button
                                onClick={handlePin}
                                className={`so-btn border transition-all font-bold flex items-center gap-2 ${note.isPinned ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'border-border text-muted-foreground hover:text-foreground'}`}
                                title={note.isPinned ? 'Unpin Post' : 'Pin Post to Top'}
                            >
                                <Pin size={14} className={note.isPinned ? 'fill-amber-500' : ''} />
                            </button>
                        )}
                        {/* ... (keep existing buttons) ... */}
                        {user && note.user?._id === user._id ? (
                            <Link to={`/notes/edit/${id}`} className="so-btn border border-border hover:bg-muted/50 text-foreground transition-all">
                                <Edit size={14} /> Edit
                            </Link>
                        ) : (
                            user && note.isPublic && (
                                <>
                                    <button
                                        onClick={() => setIsSaveModalOpen(true)}
                                        disabled={isCloning}
                                        className="so-btn border border-primary text-primary hover:bg-primary/5 transition-all font-bold flex items-center gap-2"
                                    >
                                        <Copy size={14} /> {isCloning ? 'Cloning...' : 'Clone to My Shelf'}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="so-btn border border-border hover:bg-muted/50 text-foreground transition-all"
                                        title="Download as Markdown"
                                    >
                                        <FileDown size={14} />
                                    </button>
                                </>
                            )
                        )}
                        <Link to="/notes/new" className="so-btn so-btn-primary py-2.5 px-3">
                            Post new record
                        </Link>
                    </div>
                </div>
                {/* ... (keep existing metadata) ... */}
                <div className="flex flex-wrap gap-x-4 gap-y-3 sm:gap-6 text-[12px] sm:text-[13px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 border-r border-border pr-4 sm:pr-6 last:border-0 whitespace-nowrap">
                        <span className="font-normal opacity-60">Recorded</span>
                        <span className="text-foreground font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1.5 border-r border-border pr-4 sm:pr-6 last:border-0 whitespace-nowrap">
                        <span className="font-normal opacity-60">Status</span>
                        <span className="text-primary font-bold uppercase tracking-widest text-[10px] sm:text-[11px]">{note.isPublic ? 'PUBLIC' : 'VAULT'}</span>
                    </span>
                    {note.type === 'adr' && (
                        <span className="flex items-center gap-1.5 border-r border-border pr-4 sm:pr-6 last:border-0 whitespace-nowrap">
                            <span className="font-normal opacity-60">Decision</span>
                            <span className="bg-primary/20 text-primary font-bold uppercase tracking-widest text-[10px] sm:text-[11px] px-2 py-0.5 rounded-[2px]">{note.adrStatus}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-normal opacity-60">Path</span>
                        <span className="text-link font-medium flex items-center gap-1">
                            {note.category?.name || 'GENERIC'}
                            {note.folder && (
                                <>
                                    <span className="opacity-40">/</span>
                                    {note.folder.name}
                                </>
                            )}
                        </span>
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                {/* Voting Sidebar */}
                <div className="flex lg:flex-col items-center justify-center sm:justify-start gap-4 sm:gap-2 pt-1 border-b lg:border-none border-border pb-4 lg:pb-0">
                    <button className="p-2 sm:p-3 border border-border rounded-full hover:bg-accent/50 transition-colors text-muted-foreground group">
                        <ChevronUp className="w-5 h-5 sm:w-7 sm:h-7 group-hover:text-primary transition-colors" />
                    </button>
                    <span className="text-[20px] sm:text-[24px] font-bold text-foreground">1</span>
                    <button className="p-2 sm:p-3 border border-border rounded-full hover:bg-accent/50 transition-colors text-muted-foreground group">
                        <ChevronDown className="w-5 h-5 sm:w-7 sm:h-7 group-hover:text-primary transition-colors" />
                    </button>

                    <div className="flex lg:flex-col gap-4 lg:mt-6">
                        <button className="p-2 text-muted-foreground/30 hover:text-primary transition-all scale-100 sm:scale-110">
                            <Bookmark className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                        </button>
                        <button className="p-2 text-muted-foreground/30 hover:text-muted-foreground transition-all scale-100 sm:scale-110">
                            <History className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
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
                                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{match[1]}</span>
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
                        <div className="mt-12 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8">
                            {note.relatedNotes && note.relatedNotes.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <History size={14} /> Outbound Pulses
                                    </h3>
                                    <div className="space-y-2">
                                        {note.relatedNotes.map((link) => (
                                            <Link
                                                key={link._id}
                                                to={`/notes/${link._id}`}
                                                className="block p-3 border border-border rounded-[3px] bg-muted/20 hover:border-primary/50 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[13px] text-foreground font-medium truncate group-hover:text-primary transition-colors">{link.title}</span>
                                                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {note.backlinks && note.backlinks.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <ExternalLink size={14} /> Knowledge Backlinks
                                    </h3>
                                    <div className="space-y-2">
                                        {note.backlinks.map((link) => (
                                            <Link
                                                key={link._id}
                                                to={`/notes/${link._id}`}
                                                className="block p-3 border border-border rounded-[3px] bg-muted/20 hover:border-primary/50 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[13px] text-foreground font-medium truncate group-hover:text-primary transition-colors">{link.title}</span>
                                                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
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

                    {/* Actions & Attribution */}
                    <div className="flex flex-col sm:flex-row justify-between items-start mt-8 pt-6 gap-6 pb-8 sm:pb-16 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[12px] sm:text-[13px] text-muted-foreground w-full sm:w-auto">
                            <button onClick={handleShare} className="hover:text-primary transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
                                <Share2 size={14} /> Share
                            </button>
                            <button onClick={handleCopyReference} className="hover:text-primary transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer" title="Copy as Wiki-Link reference">
                                <LinkIcon size={14} /> Reference
                            </button>
                            <button
                                onClick={handleFollow}
                                className={`${isFollowing ? 'text-primary' : 'hover:text-primary'} transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer`}
                            >
                                <Bookmark size={14} className={isFollowing ? 'fill-primary' : ''} /> {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            {user && (user.role === 'admin' || note.user?._id === user._id) && (
                                <button onClick={handleDelete} className="hover:text-rose-500 transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
                                    <Trash2 size={14} /> Delete
                                </button>
                            )}
                        </div>

                        <div className="bg-accent/30 p-4 rounded-[3px] w-full sm:w-[220px] shrink-0 border border-transparent hover:border-primary/20 transition-all shadow-sm">
                            <p className="text-[12px] text-muted-foreground mb-2">
                                documented {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-[3px] flex items-center justify-center text-white text-[16px] font-bold shadow-sm">
                                    {note.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="text-[13px]">
                                    <p className="text-link font-bold leading-tight">
                                        {note.user?.username || 'System User'}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-bold mt-0.5">
                                        <span title="Reputation Points">{reputation.toLocaleString()}</span>
                                        {/* Rank Badge */}
                                        {reputation > 500 && (
                                            <span
                                                className={`px-1.5 py-0.5 rounded-[2px] text-[9px] uppercase tracking-wider text-white ${reputation > 2000 ? 'bg-amber-400' :
                                                    reputation > 1000 ? 'bg-slate-300' : 'bg-amber-600'
                                                    }`}
                                                title={reputation > 2000 ? 'Gold Contributor' : reputation > 1000 ? 'Silver Contributor' : 'Bronze Contributor'}
                                            >
                                                {reputation > 2000 ? 'GOLD' : reputation > 1000 ? 'SILVER' : 'BRONZE'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Resources Section */}
                    {note.attachmentUrl && (
                        <div className="mt-8 pt-6 border-t border-border">
                            <h3 className="text-[19px] font-normal mb-4 text-foreground flex items-center gap-3">
                                <FileCode size={20} className="text-primary" /> Technical Resources
                            </h3>
                            <div className="bg-muted/20 border border-border border-dashed rounded-[3px] p-6 flex flex-col items-center justify-center text-center group hover:bg-muted/30 transition-all">
                                <div className="p-3 bg-secondary rounded-full mb-3 text-muted-foreground group-hover:text-primary transition-colors">
                                    <FileDown size={32} />
                                </div>
                                <p className="text-[14px] font-bold text-foreground mb-1">
                                    {note.attachment?.originalName || 'Download Documentation'}
                                </p>
                                <a
                                    href={note.attachmentUrl.startsWith('http') ? note.attachmentUrl : `http://localhost:5000/${note.attachmentUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="so-btn so-btn-primary px-6 flex items-center gap-2"
                                >
                                    <ExternalLink size={14} /> Open Document
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Tutorial Section if exists */}
                    {note.videoUrl && (
                        <div className="mt-8 pt-8 border-t border-border">
                            <h3 className="text-[22px] font-normal mb-6 text-foreground flex items-center gap-3">
                                <Video size={20} className="text-primary" /> Integrated Video Context
                            </h3>
                            <div className="aspect-video bg-black rounded-[3px] overflow-hidden border border-border shadow-2xl">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${note.videoUrl.includes('watch?v=') ? note.videoUrl.split('watch?v=')[1].split('&')[0] : note.videoUrl.split('/').pop()}`}
                                    title="Tutorial"
                                    frameBorder="0"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    {/* Community Discussion Layer */}
                    <div className="mt-12 pt-10 border-t border-border">
                        <h3 className="text-[19px] font-normal mb-6 text-foreground flex items-center gap-3">
                            <MessageSquare size={20} className="text-primary" /> {note.type === 'issue' ? 'Answers & Solutions' : 'Discussion & Contributions'}
                        </h3>

                        {user ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!commentText.trim()) return;
                                dispatch(addComment({ id, text: commentText }));
                                setCommentText('');
                                setCommentPreview(false);
                            }} className="mb-10 bg-secondary/10 p-6 rounded-[8px] border border-border/50 shadow-sm relative overflow-hidden">
                                {/* Decorative Accent */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />

                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Drafting Response</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setCommentPreview(!commentPreview)}
                                            className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded transition-all ${commentPreview ? 'bg-primary text-white' : 'bg-background border border-border text-muted-foreground hover:border-primary/50'}`}
                                        >
                                            {commentPreview ? 'Editor' : 'Preview Result'}
                                        </button>
                                    </div>
                                </div>

                                {commentPreview ? (
                                    <div className="min-h-[140px] bg-background border border-border p-4 rounded-[3px] prose prose-sm dark:prose-invert max-w-none mb-3">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {commentText || "*Nothing to preview yet...*"}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Use Markdown to share code snippets... `backticks` for code blocks."
                                        className="w-full bg-background border border-border rounded-[3px] p-4 text-[14px] text-foreground focus:border-primary outline-none min-h-[140px] font-mono transition-all mb-3 placeholder:opacity-50"
                                    />
                                )}

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    {/* Quick Context Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Step/Steps?', text: 'Can you provide the step-by-step instructions to reproduce this?' },
                                            { label: 'Environment?', text: 'What is your current OS/Browser and version?' },
                                            { label: 'Check Logs', text: 'Please check your console/terminal logs and paste the error here.' }
                                        ].map((btn, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleQuickAction(btn.text)}
                                                className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-all uppercase"
                                            >
                                                + {btn.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button type="submit" className="so-btn so-btn-primary py-2.5 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto">
                                        Post Contribution
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-8 bg-muted/20 border border-border border-dashed rounded-[12px] text-center mb-10 overflow-hidden relative">
                                <div className="relative z-10">
                                    <p className="text-[14px] text-muted-foreground mb-4 font-medium italic">Shared knowledge builds better systems.</p>
                                    <Link to="/login" className="so-btn so-btn-primary inline-flex items-center gap-2">
                                        Log in to respond
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {note.comments?.length > 0 ? (
                                [...note.comments]
                                    .sort((a, b) => (b.isSolution === a.isSolution) ? 0 : b.isSolution ? 1 : -1)
                                    .map((comment, index) => (
                                        <div key={index} className={`flex gap-4 group p-4 rounded-[6px] transition-all ${comment.isSolution ? 'bg-green-500/5 border border-green-500/20' : ''}`}>
                                            <div className="w-8 h-8 bg-secondary rounded-[3px] flex items-center justify-center text-[12px] font-bold text-muted-foreground shrink-0 border border-border">
                                                {comment.user?.username?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[13px] font-bold text-link">{comment.user?.username || 'Unknown User'}</span>
                                                        <span className="text-[11px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                        {comment.isSolution && (
                                                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                                                <CheckCircle2 size={10} /> Solution
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Mark Solution Button (Only for Issue Author) */}
                                                        {user && note.type === 'issue' && note.user._id === user._id && !comment.isSolution && (
                                                            <button
                                                                onClick={() => handleMarkSolution(comment._id)}
                                                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase text-green-600 bg-green-500/5 border border-green-500/20 px-3 py-1 rounded hover:bg-green-500 hover:text-white flex items-center gap-1.5"
                                                                title="Mark as Solution"
                                                            >
                                                                <CheckCircle2 size={12} /> Mark Best Answer
                                                            </button>
                                                        )}

                                                        {user && (user._id === comment.user?._id || user.role === 'admin') && (
                                                            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
                                                                <button
                                                                    onClick={() => startEditingComment(comment)}
                                                                    className="text-muted-foreground hover:text-primary"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {editingCommentId === comment._id ? (
                                                    <div className="mt-2">
                                                        <textarea
                                                            value={editCommentText}
                                                            onChange={(e) => setEditCommentText(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-[3px] p-2 text-[14px] text-foreground focus:border-primary outline-none min-h-[100px] mb-2 font-mono"
                                                            placeholder="Use Markdown for code blocks..."
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => saveEditedComment(comment._id)}
                                                                className="so-btn so-btn-primary py-1 px-3 text-[12px]"
                                                            >
                                                                Save Changes
                                                            </button>
                                                            <button
                                                                onClick={cancelEditingComment}
                                                                className="so-btn border border-border py-1 px-3 text-[12px]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border mt-2">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({ node, inline, className, children, ...props }) {
                                                                    const match = /language-(\w+)/.exec(className || '')
                                                                    const codeString = String(children).replace(/\n$/, '');
                                                                    return !inline && match ? (
                                                                        <SyntaxHighlighter
                                                                            style={theme === 'dark' ? vscDarkPlus : prism}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            className="!rounded-[3px] !text-[12px] !p-4"
                                                                            {...props}
                                                                        >
                                                                            {codeString}
                                                                        </SyntaxHighlighter>
                                                                    ) : (
                                                                        <code className="bg-accent/40 text-primary px-1 py-0.5 rounded-[2px] font-mono text-[12px]" {...props}>
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
                                <p className="text-[13px] text-muted-foreground italic">No feedback recorded yet. Be the first to contribute.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ShareNoteModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                noteId={id}
                currentSharedWith={note.sharedWith}
            />

            <SaveToShelfModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleSaveConfirm}
                isCloning={isCloning}
            />
        </div>
    );
};

export default NoteDetails;
