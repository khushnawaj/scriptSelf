import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, Users, Filter, TrendingUp, Flame, Trophy,
    ArrowLeft, ChevronRight, UserPlus, UserCheck
} from 'lucide-react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { useSelector, useDispatch } from 'react-redux';
import { followUser, unfollowUser } from '../features/auth/authSlice';
import { getReputationTier } from '../utils/reputation';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function Explorers() {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        tier: '',
        active: false,
        sort: 'reputation'
    });
    const [localFollowing, setLocalFollowing] = useState(new Set());

    useEffect(() => {
        if (currentUser?.following) {
            setLocalFollowing(new Set(currentUser.following));
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (filters.tier) params.append('tier', filters.tier);
            if (filters.active) params.append('active', 'true');
            params.append('sort', filters.sort);
            params.append('page', page);
            params.append('limit', limit);

            const res = await api.get(`/users/search?${params.toString()}`);
            setUsers(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error('Failed to fetch users');
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, filters, page]);

    // Reset page when search or filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, filters]);

    const handleFollow = async (userId) => {
        if (!currentUser) {
            toast.error('Please login to follow users');
            return;
        }

        const isFollowing = localFollowing.has(userId);

        // Optimistic update
        setLocalFollowing(prev => {
            const newSet = new Set(prev);
            if (isFollowing) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });

        try {
            if (isFollowing) {
                await dispatch(unfollowUser(userId));
            } else {
                await dispatch(followUser(userId));
            }
        } catch (err) {
            // Revert on error
            setLocalFollowing(prev => {
                const newSet = new Set(prev);
                if (isFollowing) {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }
                return newSet;
            });
        }
    };

    const topContributors = users
        .filter(u => u.reputation > 0)
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <header className="space-y-4">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    BACK TO DASHBOARD
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                <Users size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
                                    Explorers
                                </h1>
                                <p className="text-sm text-muted-foreground font-medium italic opacity-70">
                                    Discover architects building the future of ScriptShelf.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-card border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                            <Users size={16} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-foreground">{users.length}</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Architects
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Filters & Top Contributors */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Filters */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Filters
                            </h3>
                        </div>

                        {/* Tier Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Reputation Tier
                            </label>
                            <select
                                value={filters.tier}
                                onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Tiers</option>
                                <option value="beginner">Beginner (0-99)</option>
                                <option value="intermediate">Intermediate (100-499)</option>
                                <option value="advanced">Advanced (500-999)</option>
                                <option value="expert">Expert (1000-2499)</option>
                                <option value="legendary">Legendary (2500+)</option>
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Sort By
                            </label>
                            <select
                                value={filters.sort}
                                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="reputation">Reputation</option>
                                <option value="streak">Streak</option>
                                <option value="newest">Newest</option>
                                <option value="alphabetical">A-Z</option>
                            </select>
                        </div>

                        {/* Active Filter */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.active}
                                onChange={(e) => setFilters({ ...filters, active: e.target.checked })}
                                className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <span className="text-xs font-medium text-foreground">Active (Last 7 days)</span>
                        </label>
                    </div>

                    {/* Top Contributors */}
                    {topContributors.length > 0 && (
                        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-primary" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Top Contributors
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {topContributors.map((user, idx) => {
                                    const tier = getReputationTier(user.reputation || 0);
                                    return (
                                        <Link
                                            key={user._id}
                                            to={`/u/${user.username}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-all group"
                                        >
                                            <div className="w-8 h-8 bg-secondary border border-border rounded-lg flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm shrink-0">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">{user.username.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {user.username}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground">
                                                    {user.reputation || 0} pts
                                                </p>
                                            </div>
                                            {idx < 3 && (
                                                <Trophy
                                                    size={12}
                                                    className={idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-600'}
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content - User Grid */}
                <main className="lg:col-span-3 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by username or bio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        />
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Spinner />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                                Scanning network...
                            </p>
                        </div>
                    ) : users.length > 0 ? (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {users.map((user) => {
                                    const tier = getReputationTier(user.reputation || 0);
                                    const isFollowing = localFollowing.has(user._id);
                                    const isCurrentUser = currentUser?._id === user._id;

                                    return (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/40 transition-all group"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <Link to={`/u/${user.username}`} className="shrink-0">
                                                    <div className={`p-1 rounded-2xl ${tier.bg} shadow-lg`}>
                                                        <div className="w-16 h-16 bg-card rounded-xl overflow-hidden flex items-center justify-center border border-card">
                                                            {user.avatar ? (
                                                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-2xl font-black text-muted-foreground">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div>
                                                        <Link to={`/u/${user.username}`} className="group/name">
                                                            <h3 className="text-base font-black text-foreground truncate group-hover/name:text-primary transition-colors italic">
                                                                {user.username}
                                                            </h3>
                                                        </Link>
                                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${tier.bg} ${tier.color} ${tier.border} border mt-1`}>
                                                            {tier.name}
                                                        </div>
                                                    </div>

                                                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                                                        {user.bio || 'ScriptShelf Architect'}
                                                    </p>

                                                    {/* Stats */}
                                                    <div className="flex items-center gap-4 pt-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <Trophy size={12} className="text-primary" />
                                                            <span className="text-[10px] font-bold text-foreground">{user.reputation || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Flame size={12} className="text-orange-500" />
                                                            <span className="text-[10px] font-bold text-foreground">{user.arcade?.streak || 0}d</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Users size={12} className="text-muted-foreground" />
                                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                                {user.followers?.length || 0} followers
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {!isCurrentUser && currentUser && (
                                                    <button
                                                        onClick={() => handleFollow(user._id)}
                                                        className={`shrink-0 p-2.5 rounded-lg border transition-all ${isFollowing
                                                            ? 'border-border bg-secondary text-muted-foreground hover:text-rose-500 hover:border-rose-500/50'
                                                            : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm'
                                                            }`}
                                                    >
                                                        {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                                                    </button>
                                                )}
                                            </div>

                                            {/* View Profile Link */}
                                            <Link
                                                to={`/u/${user.username}`}
                                                className="mt-4 flex items-center justify-center gap-2 py-2 border-t border-border/50 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group/link"
                                            >
                                                View Profile
                                                <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                            <Pagination
                                currentPage={page}
                                totalPages={Math.ceil(total / limit)}
                                onPageChange={setPage}
                            />
                        </>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-border rounded-xl bg-muted/10">
                            <Users size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-2">
                                No Users Found
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium italic">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div >
    );
}
