
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import NeuralGraph from '../components/NeuralGraph';
import Spinner from '../components/Spinner';
import { Share2, Activity, Database, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Network() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllNotes = async () => {
            try {
                // Fetch public notes for the graph
                const res = await api.get('/notes?public=true');
                setNotes(res.data.data || []);
            } catch (err) {
                console.error("Failed to load network data");
            } finally {
                setLoading(false);
            }
        };
        fetchAllNotes();
    }, []);

    if (loading) return <Spinner fullPage message="Mapping Intelligence Web..." />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all group mb-4">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO CONSOLE
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Neural Graph</h1>
                            <p className="text-sm text-muted-foreground font-medium italic opacity-70">Visualizing inter-connected intelligence nodes within the ScriptShelf archive.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-card border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <Database size={16} className="text-primary" />
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black text-foreground">{notes.length}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Global Nodes</span>
                        </div>
                    </div>
                    <div className="bg-card border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <Share2 size={16} className="text-emerald-500" />
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black text-foreground">{notes.reduce((acc, n) => acc + (n.tags?.length || 0), 0)}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Active Links</span>
                        </div>
                    </div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-[24px] p-2 shadow-2xl relative"
            >
                <div className="absolute inset-0 bg-primary/5 rounded-[24px] blur-3xl opacity-20 pointer-events-none" />
                <NeuralGraph data={notes} />
            </motion.div>

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
        </div>
    );
}
