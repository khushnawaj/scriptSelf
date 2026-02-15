
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import NeuralGraph from '../components/NeuralGraph';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { Share2, Activity, Database, ArrowLeft, Rss, Network as NetworkIcon, MessageSquare, ThumbsUp, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Network() {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState(user ? 'feed' : 'graph');
    const [notes, setNotes] = useState([]); // For Graph
    const [feedItems, setFeedItems] = useState([]); // For Feed
    const [loading, setLoading] = useState(true);
    const [feedLoading, setFeedLoading] = useState(true);

    // Feed Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Fetch Graph Data (Once)
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const res = await api.get('/notes?public=true');
                setNotes(res.data.data || []);
            } catch (err) {
                console.error("Failed to load network graph data");
            } finally {
                setLoading(false);
            }
        };
        fetchGraphData();
    }, []);

    // Fetch Feed Data (On Page Change)
    useEffect(() => {
        if (!user) {
            setFeedLoading(false);
            return;
        }

        const fetchFeed = async () => {
            setFeedLoading(true);
            try {
                const res = await api.get(`/notes/feed?page=${page}&limit=${limit}`);
                setFeedItems(res.data.data || []);
                setTotal(res.data.total || 0);
            } catch (err) {
                console.error("Failed to load network feed");
            } finally {
                setFeedLoading(false);
            }
        };
        fetchFeed();
    }, [page, user]);

    // Like Functionality
    const handleLike = async (noteId) => {
        if (!user) return;

        // Optimistic update
        setFeedItems(prev => prev.map(note => {
            if (note._id === noteId) {
                const isLiked = note.likes?.includes(user._id);
                return {
                    ...note,
                    likes: isLiked
                        ? note.likes.filter(id => id !== user._id)
                        : [...(note.likes || []), user._id]
                };
            }
            return note;
        }));

        try {
            await api.put(`/notes/${noteId}/like`);
        } catch (err) {
            console.error("Failed to like/unlike");
            // Revert on error could be added here
        }
    };

    if (loading && activeTab === 'graph') return <Spinner fullPage message="Mapping Intelligence Web..." />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all group mb-2">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO CONSOLE
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            {activeTab === 'feed' ? <Rss size={24} /> : <NetworkIcon size={24} />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
                                {activeTab === 'feed' ? 'Network Feed' : 'Neural Graph'}
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium italic opacity-70">
                                {activeTab === 'feed'
                                    ? 'Live intelligence stream from your professional connections.'
                                    : 'Visualizing inter-connected intelligence nodes.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                        <Rss size={14} /> Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'graph' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                        <NetworkIcon size={14} /> Graph
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'feed' ? (
                    <motion.div
                        key="feed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 max-w-3xl mx-auto"
                    >
                        {feedLoading ? (
                            <div className="py-20 flex justify-center"><Spinner /></div>
                        ) : !user ? (
                            <div className="text-center py-20 bg-card border border-border rounded-xl">
                                <Activity size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-bold">Network Access Restricted</h3>
                                <p className="text-muted-foreground text-sm mt-2">Log in to track the intelligence stream of other architects.</p>
                                <Link to="/login" className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">Authenticate</Link>
                            </div>
                        ) : feedItems.length === 0 ? (
                            <div className="text-center py-20 bg-card border border-border rounded-xl">
                                <Activity size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-bold">Your feed is quiet</h3>
                                <p className="text-muted-foreground text-sm mt-2">Follow more explorer to see their logic updates here.</p>
                                <Link to="/explorers" className="inline-block mt-4 text-primary font-bold text-xs uppercase hover:underline">Find Architects</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedItems.map((note) => (
                                    <div key={note._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all shadow-sm group">
                                        <div className="flex items-start gap-4">
                                            <Link to={`/u/${note.user?.username}`} className="shrink-0">
                                                {note.user?.avatar ? (
                                                    <img src={note.user.avatar} alt={note.user.username} className="w-10 h-10 rounded-lg object-cover border border-border" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground font-black">
                                                        {note.user?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <Link to={`/u/${note.user?.username}`} className="font-bold text-sm hover:underline flex items-center gap-2">
                                                            {note.user?.username}
                                                            {note.user?.headline && <span className="text-[10px] text-muted-foreground font-normal truncate max-w-[200px] border-l border-border pl-2 border-opacity-50 hidden sm:block">{note.user.headline}</span>}
                                                        </Link>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {note.isPublic ? 'Public' : 'Private'}
                                                        </p>
                                                    </div>
                                                    {note.category && (
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-secondary/50 border border-border/50 text-muted-foreground">
                                                            {note.category.name}
                                                        </span>
                                                    )}
                                                </div>

                                                <Link to={`/notes/${note._id}`} className="block mt-3 group-hover:bg-muted/5 -mx-2 px-2 py-2 rounded-lg transition-colors">
                                                    <h3 className="font-bold text-base text-link group-hover:underline mb-1 flex items-center gap-2">
                                                        {note.isPinned && <Pin size={14} className="text-primary fill-primary" />}
                                                        {note.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {note.content.replace(/[#*`\[\]]/g, '').slice(0, 200)}...
                                                    </p>
                                                </Link>

                                                <button
                                                    onClick={() => handleLike(note._id)}
                                                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${note.likes?.includes(user._id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                                >
                                                    <ThumbsUp size={14} className={note.likes?.includes(user._id) ? 'fill-primary' : ''} />
                                                    {note.likes?.length > 0 ? note.likes.length : 'Like'}
                                                </button>
                                                <Link to={`/notes/${note._id}#comments`} className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium hover:text-primary transition-colors">
                                                    <MessageSquare size={14} /> Comment
                                                </Link>

                                                <div className="ml-auto flex gap-2">
                                                    {note.tags?.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-[9px] text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                        ))}
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(total / limit)}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </motion.div>
            ) : (
            <motion.div
                key="graph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-[24px] p-2 shadow-2xl relative"
            >
                <div className="absolute inset-0 bg-primary/5 rounded-[24px] blur-3xl opacity-20 pointer-events-none" />
                <NeuralGraph data={notes} />
            </motion.div>
                )}
        </AnimatePresence>

            {
        activeTab === 'graph' && (
            <footer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card border border-border rounded-2xl space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Interconnectivity</h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">Nodes are linked based on shared semantic tags and categorical alignment. Stronger connections represent higher thematic synergy.</p>
                </div>
                <div className="p-6 bg-card border border-border rounded-2xl space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Navigation Protocol</h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">Use the scroll wheel to zoom into specific clusters. Click and drag to move through the network. Individual nodes can be accessed via direct link.</p>
                </div>
                <div className="p-6 bg-card border border-border rounded-2xl space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">System Intelligence</h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">The graph view is synchronized with the live archive database. New records are integrated as cold-storage nodes before establishing neural links.</p>
                </div>
            </footer>
        )
    }
        </div >
    );
}
