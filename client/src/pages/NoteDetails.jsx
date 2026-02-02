import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, deleteNote } from '../features/notes/noteSlice';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Share2,
    ChevronUp,
    ChevronDown,
    Bookmark,
    History,
    MessageSquare,
    Video,
    Clock,
    User,
    Copy,
    Check,
    List,
    FileCode,
    FileDown,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';

const NoteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useTheme();

    const { notes, isLoading } = useSelector((state) => state.notes);
    const note = notes.find((n) => n._id === id);
    const [copiedIndex, setCopiedIndex] = useState(null);

    useEffect(() => {
        if (!note) {
            dispatch(getNotes());
        }
    }, [id, note, dispatch]);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            await dispatch(deleteNote(id));
            toast.success('Record deleted');
            navigate('/notes');
        }
    };

    if (isLoading || !note) {
        return <Spinner />;
    }

    return (
        <div className="space-y-4 max-w-[1100px] animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="border-b border-border pb-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <h1 className="text-[32px] font-normal text-foreground leading-tight tracking-tight">
                        {note.title}
                    </h1>
                    <div className="flex gap-2 shrink-0">
                        <Link to={`/notes/edit/${id}`} className="so-btn border border-border hover:bg-muted/50 text-foreground transition-all">
                            <Edit size={14} /> Edit
                        </Link>
                        <Link to="/notes/new" className="so-btn so-btn-primary py-2.5 px-3">
                            Post new record
                        </Link>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 text-[13px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 border-r border-border pr-6 last:border-0">
                        <span className="font-normal opacity-60">Recorded</span>
                        <span className="text-foreground font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1.5 border-r border-border pr-6 last:border-0">
                        <span className="font-normal opacity-60">Status</span>
                        <span className="text-primary font-bold uppercase tracking-widest text-[11px]">{note.isPublic ? 'PUBLIC' : 'VAULT'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="font-normal opacity-60">Collection</span>
                        <span className="text-link font-medium">{note.category?.name || 'GENERIC'}</span>
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Visual Metadata Column */}
                <div className="flex lg:flex-col items-center gap-2 pt-1">
                    <button className="p-3 border border-border rounded-full hover:bg-accent/50 transition-colors text-muted-foreground group">
                        <ChevronUp size={28} className="group-hover:text-primary transition-colors" />
                    </button>
                    <span className="text-[24px] font-bold text-foreground">1</span>
                    <button className="p-3 border border-border rounded-full hover:bg-accent/50 transition-colors text-muted-foreground group">
                        <ChevronDown size={28} className="group-hover:text-primary transition-colors" />
                    </button>

                    <div className="flex lg:flex-col gap-4 mt-6">
                        <button className="p-2 text-muted-foreground/30 hover:text-primary transition-all scale-110">
                            <Bookmark size={20} />
                        </button>
                        <button className="p-2 text-muted-foreground/30 hover:text-muted-foreground transition-all scale-110">
                            <History size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <article className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-[16px] prose-p:leading-[1.7] text-foreground font-normal">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const codeString = String(children).replace(/\n$/, '');
                                    const blockIndex = node ? node.position?.start.line : 0;

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
                                }
                            }}
                        >
                            {note.content}
                        </ReactMarkdown>
                    </article>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-10">
                        {note.category && <span className="so-tag py-1 px-3 text-[13px]">{note.category.name}</span>}
                        {note.tags?.map((tag, i) => (
                            <span key={i} className="so-tag py-1 px-3 text-[13px] bg-muted/50 text-muted-foreground">#{tag}</span>
                        ))}
                    </div>

                    {/* Actions & Attribution */}
                    <div className="flex flex-col sm:flex-row justify-between items-start mt-8 pt-6 gap-6 pb-16 border-t border-border/50">
                        <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
                            <button className="hover:text-primary transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
                                <Share2 size={14} /> Share
                            </button>
                            <button className="hover:text-primary transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
                                <Bookmark size={14} /> Follow
                            </button>
                            <button onClick={handleDelete} className="hover:text-rose-500 transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>

                        <div className="bg-accent/30 p-4 rounded-[3px] w-[220px] shrink-0 border border-transparent hover:border-primary/20 transition-all shadow-sm">
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
                                        <span>4,281</span>
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                                            <span className="w-2 h-2 rounded-full bg-zinc-300" />
                                        </div>
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
                                <p className="text-[12px] text-muted-foreground mb-4">
                                    Research paper or technical reference attached to this record.
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
                </div>
            </div>
        </div>
    );
};

export default NoteDetails;
