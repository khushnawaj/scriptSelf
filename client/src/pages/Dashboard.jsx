import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import {
    Plus,
    Brain,
    Activity,
    Zap,
    LifeBuoy,
    Shield,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import EngineeringLanding from '../components/EngineeringLanding';
import { getReputationTier } from '../utils/reputation';
import NeuralBackground from '../components/NeuralBackground';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getAllNotes());
        dispatch(getCategories());
    }, [dispatch]);

    if (notesLoading) return <Spinner />;

    const userNotes = notes.filter(n => (n.user?._id || n.user) === user?._id);
    const currentTier = getReputationTier(user?.reputation || 0);

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
            {/* Dynamic Background for High Tiers */}
            {currentTier.name === 'Legendary Master' && <NeuralBackground variant="overlord" />}
            {currentTier.name === 'Expert Architect' && <NeuralBackground variant="grid" />}

            {/* Simple Modern Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                            <Brain size={32} strokeWidth={2.5} />
                        </div>
                        Home
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm pl-1">
                        Welcome back, <span className="text-foreground font-bold">{user?.username}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/notes/new')}
                        className="so-btn so-btn-primary h-14 px-10 shadow-xl shadow-primary/10 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 group active:scale-95 transition-all"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Create Note
                    </button>
                </div>
            </header>

            {/* Dashboard Content */}
            <EngineeringLanding notes={userNotes} user={user} />

            {/* Simple Footer */}
            <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Connected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Status: Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/guide')} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                        <LifeBuoy size={14} /> Help Guide
                    </button>
                    <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-xl border border-border text-[11px] font-bold">
                        <Search size={14} className="opacity-40" />
                        <span className="opacity-40 uppercase tracking-widest">Search</span>
                        <div className="flex gap-1 ml-2">
                            <kbd className="min-w-[20px] text-center text-foreground font-sans uppercase">Ctrl</kbd>
                            <span className="opacity-40">+</span>
                            <kbd className="min-w-[20px] text-center text-foreground font-sans uppercase">K</kbd>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
