import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, deleteNote } from '../features/notes/noteSlice';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Tag,
    Folder,
    ExternalLink,
    Files,
    Link as LinkIcon,
    PlayCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';

const NoteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { notes, isLoading } = useSelector((state) => state.notes);

    // Find the specific note from the store
    const note = notes.find((n) => n._id === id);

    useEffect(() => {
        if (!note) {
            dispatch(getNotes());
        }
    }, [id, note, dispatch]);

    const handleDelete = async () => {
        if (window.confirm('Delete this note permanently?')) {
            await dispatch(deleteNote(id));
            toast.success('Note deleted');
            navigate('/notes');
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };



    if (isLoading || !note) {
        return <Spinner fullPage message="Fetching note details..." />;
    }

    // Helper to extract Table of Contents from Markdown
    const extractToC = (content) => {
        const lines = content.split('\n');
        return lines
            .filter(line => line.startsWith('#'))
            .map(line => {
                const level = line.match(/^#+/)[0].length;
                const text = line.replace(/^#+\s*/, '');
                return { level, text };
            });
    };

    const toc = extractToC(note.content);

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-20 px-4">
            {/* Sidebar for ToC (DX Enhancement) */}
            <aside className="lg:w-64 hidden lg:block sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="p-4 bg-card/50 backdrop-blur border border-border rounded-xl">
                    <h3 className="text-sm font-bold uppercase text-primary mb-4 flex items-center gap-2">
                        <Files size={14} /> Contents
                    </h3>
                    <nav className="space-y-2">
                        {toc.length > 0 ? toc.map((item, idx) => (
                            <div
                                key={idx}
                                className={`text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors truncate ${item.level === 1 ? 'font-bold' : item.level === 2 ? 'pl-3 border-l' : 'pl-6 border-l font-light'}`}
                            >
                                {item.text}
                            </div>
                        )) : (
                            <p className="text-xs italic text-muted-foreground">No headers found</p>
                        )}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-6 animate-fade-in min-w-0">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-premium-secondary px-4 py-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>

                    <div className="flex items-center gap-2">
                        <Link
                            to={`/notes/edit/${id}`}
                            className="btn-premium-outline px-4 py-2"
                        >
                            <Edit size={16} /> Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="btn-premium-danger px-4 py-2"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{note.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                            <Folder size={14} className="text-primary" />
                            {note.category?.name || 'Uncategorized'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(note.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                        {note.tags && note.tags.length > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Tag size={14} />
                                {note.tags.map(t => `#${t}`).join(', ')}
                            </span>
                        )}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Tutorial Video Section */}
                {note.videoUrl && (
                    <div className="space-y-4 animate-in fade-in duration-700">
                        <div className="flex items-center gap-2 text-primary font-bold bg-primary/5 w-fit px-4 py-1.5 rounded-full border border-primary/10">
                            <PlayCircle size={18} />
                            <span>Tutorial Context</span>
                        </div>
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-border">
                            {note.videoUrl.includes('youtube.com') || note.videoUrl.includes('youtu.be') ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${note.videoUrl.includes('watch?v=') ? note.videoUrl.split('watch?v=')[1].split('&')[0] : note.videoUrl.split('/').pop()}`}
                                    title="Tutorial Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : note.videoUrl.includes('vimeo.com') ? (
                                <iframe
                                    src={`https://player.vimeo.com/video/${note.videoUrl.split('/').pop()}`}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/20 gap-4">
                                    <PlayCircle size={48} className="opacity-20" />
                                    <div>
                                        <p className="font-bold text-foreground">External Tutorial Source</p>
                                        <p className="text-sm">Video provider not directly supported for embedded playback.</p>
                                    </div>
                                    <a href={note.videoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">
                                        Watch on source site <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content Viewer (Markdown) */}
                <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')
                                const codeString = String(children).replace(/\n$/, '');

                                return !inline && match ? (
                                    <div className="relative group rounded-lg overflow-hidden my-6 border border-border">
                                        <div className="flex items-center justify-between px-4 py-2 bg-muted/80 backdrop-blur border-b border-border">
                                            <span className="text-xs font-mono text-muted-foreground">{match[1]}</span>
                                            <button
                                                onClick={() => copyToClipboard(codeString)}
                                                className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                                                title="Copy Code"
                                            >
                                                <Files size={14} />
                                            </button>
                                        </div>
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                margin: 0,
                                                borderRadius: 0,
                                                fontSize: '1em',
                                                fontWeight: '500',
                                                fontFamily: 'JetBrains Mono, Fira Code, monospace'
                                            }}
                                            {...props}
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-medium text-pink-500 font-mono" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {note.content}
                    </ReactMarkdown>
                </div>



                {/* Attachment Link */}
                {note.attachmentUrl && (
                    <div className="mt-8 p-4 bg-muted/50 border border-border rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <ExternalLink size={24} />
                            </div>
                            <div>
                                <h4 className="font-medium">Attached Resource</h4>
                                <p className="text-sm text-muted-foreground truncate max-w-md">{note.attachmentUrl}</p>
                            </div>
                        </div>
                        <a
                            href={note.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                        >
                            Open Link
                        </a>
                    </div>
                )}

                {/* Related Notes Section */}
                {note.relatedNotes && note.relatedNotes.length > 0 && (
                    <div className="mt-12 border-t border-border pt-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <LinkIcon className="text-primary" /> Related Notes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {note.relatedNotes.map(related => (
                                <Link
                                    key={related._id || related}
                                    to={`/notes/${related._id || related}`}
                                    className="block p-4 rounded-lg border border-border bg-card/30 hover:bg-muted/50 hover:border-primary/50 transition-all group"
                                >
                                    <h4 className="font-medium group-hover:text-primary transition-colors truncate">{related.title || 'Linked Note'}</h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteDetails;
