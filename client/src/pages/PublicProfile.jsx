import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    Github,
    Linkedin,
    Twitter,
    Globe,
    ExternalLink,
    Calendar,
    ChevronRight,
    ShieldCheck,
    Mail,
    ArrowLeft,
    Trophy,
    Flame,
    X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser } from '../features/auth/authSlice';
import ContributionGraph from '../components/profile/ContributionGraph';
import Spinner from '../components/Spinner';
import UserListModal from '../components/UserListModal';
import { useFeature } from '../hooks/useFeature';

const PublicProfile = () => {
    const dispatch = useDispatch();
    const isExperimentB = useFeature('v2_bars', { abTest: 'B' });
    const { user: currentUser } = useSelector((state) => state.auth);
    const { username } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState({ isOpen: false, type: '', title: '' });

    const isFollowing = currentUser?.following?.includes(data?.profile?._id);

    const handleFollow = async () => {
        if (!currentUser) {
            return toast.error("Please login to follow users");
        }
        if (isFollowing) {
            await dispatch(unfollowUser(data.profile._id));
            setData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    followers: prev.profile.followers.filter(id => id !== currentUser._id)
                }
            }));
        } else {
            await dispatch(followUser(data.profile._id));
            setData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    followers: [...prev.profile.followers, currentUser._id]
                }
            }));
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/profile/${username}`);
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Profile not found');
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <Spinner fullPage message="Locating Architect..." />;
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-border/50">
                <X size={40} className="text-muted-foreground opacity-20" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-widest text-foreground">Sector Not Found</h2>
                <p className="text-muted-foreground text-sm font-medium italic">The requested identity does not exist in the database.</p>
            </div>
            <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Return to Command Center
            </Link>
        </div>
    );

    if (!data) return null;

    const { profile, recentNotes } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            {/* Top Navigation */}
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO NETWORK
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">

                {/* --- SIDEBAR: Profile Identity --- */}
                <aside className="lg:w-72 space-y-6 shrink-0">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative group">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 bg-secondary border border-border rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-muted-foreground">{profile.username.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                            </div>

                            <div className="text-center space-y-1 mb-6">
                                <h1 className="text-xl font-bold text-foreground truncate max-w-[200px] flex items-center justify-center gap-2">
                                    {profile.username}
                                    {profile.role === 'admin' && <ShieldCheck size={18} className="text-primary" />}
                                </h1>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        {profile.reputation >= 1000 ? 'Grandmaster Architect' :
                                            profile.reputation >= 500 ? 'Lead Architect' :
                                                profile.reputation >= 250 ? 'Senior Architect' :
                                                    profile.reputation >= 100 ? 'Associate Architect' : 'Junior Architect'}
                                    </p>

                                    {/* XP Progress Bar */}
                                    <div className="w-full max-w-[140px] mx-auto space-y-1">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">
                                            <span>LVL {Math.floor((profile.reputation || 0) / 100) + 1}</span>
                                            <span>{profile.reputation % 100}/100 XP</span>
                                        </div>
                                        <div className={`h-1 w-full bg-secondary rounded-full overflow-hidden border border-border/50 relative ${isExperimentB ? 'h-1.5' : ''}`}>
                                            <div
                                                className={`h-full relative shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-1000 ${isExperimentB
                                                    ? 'bg-gradient-to-r from-primary to-blue-400'
                                                    : 'bg-primary'
                                                    }`}
                                                style={{ width: `${profile.reputation % 100}%` }}
                                            >
                                                {isExperimentB && (
                                                    <motion.div
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {isExperimentB && (
                                            <p className="text-[7px] text-primary/60 font-black uppercase tracking-[0.2em] text-center pt-1 animate-pulse">Neural Sync Active</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                {currentUser && currentUser.username !== profile.username && (
                                    <button
                                        onClick={handleFollow}
                                        className={`w-full py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${isFollowing
                                            ? 'border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500 hover:bg-rose-500/5'
                                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:translate-y-[-1px]'
                                            }`}
                                    >
                                        {isFollowing ? 'Retract_Follow' : 'Establish_Link'}
                                    </button>
                                )}

                                <div className="flex items-center gap-6 border-t border-border pt-6 w-full justify-center">
                                    <button
                                        onClick={() => setModalData({ isOpen: true, type: 'followers', title: 'Network_Followers' })}
                                        className="text-center group"
                                    >
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{profile.followers?.length || 0}</p>
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Followers</p>
                                    </button>
                                    <div className="w-[1px] h-8 bg-border opacity-50" />
                                    <button
                                        onClick={() => setModalData({ isOpen: true, type: 'following', title: 'Network_Following' })}
                                        className="text-center group"
                                    >
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{profile.following?.length || 0}</p>
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Following</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Information</h3>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1">
                            "{profile.bio || 'Active contributor and architect at ScriptShelf.'}"
                        </p>

                        <div className="flex flex-col gap-2.5 text-[11px] text-muted-foreground pt-2">
                            <span className="flex items-center gap-2 px-1"><Mail size={13} className="opacity-50" /> {profile.email}</span>
                            <span className="flex items-center gap-2 px-1"><Globe size={13} className="opacity-50" /> Joined {new Date(profile.createdAt).getFullYear()}</span>
                        </div>

                        {/* External Presence */}
                        <div className="pt-4 border-t border-border space-y-4">
                            {(profile.socialLinks?.github || profile.socialLinks?.linkedin || profile.socialLinks?.twitter) && (
                                <div className="flex items-center gap-3">
                                    {profile.socialLinks?.github && (
                                        <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                            <Github size={16} />
                                        </a>
                                    )}
                                    {profile.socialLinks?.linkedin && (
                                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                            <Linkedin size={16} />
                                        </a>
                                    )}
                                    {profile.socialLinks?.twitter && (
                                        <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                            <Twitter size={16} />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Custom Links */}
                            {profile.customLinks?.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {profile.customLinks.filter(l => l.url).map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-2 truncate"
                                        >
                                            <ExternalLink size={10} className="shrink-0" /> {link.label || 'Web Resource'}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Arcade Progress */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <Trophy size={14} /> Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-center">
                                <p className="text-sm font-black text-primary">{profile.arcade?.points || 0}</p>
                                <p className="text-[9px] uppercase font-bold text-muted-foreground">Total XP</p>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-center">
                                <p className="text-sm font-black text-orange-500">{profile.arcade?.streak || 0}d</p>
                                <p className="text-[9px] uppercase font-bold text-muted-foreground">Streak</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            {[
                                { min: 1, label: "Initiator", icon: Flame, color: "text-blue-500" },
                                { min: 30, label: "Technician", icon: ShieldCheck, color: "text-emerald-500" },
                                { min: 60, label: "Legend", icon: Trophy, color: "text-orange-500" }
                            ].map((badge, idx) => {
                                const isEarned = (profile.arcade?.streak || 0) >= badge.min;
                                return (
                                    <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${isEarned ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border/30 opacity-40 grayscale'}`}>
                                        <badge.icon size={13} className={isEarned ? badge.color : ''} />
                                        <span className="text-[11px] font-bold">{badge.label}</span>
                                        {isEarned && <div className="w-1 h-1 bg-primary rounded-full ml-auto" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 space-y-8">
                    {/* Visual Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Public Scripts</p>
                            <h4 className="text-2xl font-bold flex items-center gap-2">{recentNotes.length} Archive</h4>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Reputation</p>
                            <h4 className="text-2xl font-bold flex items-center gap-2">{profile.reputation || 0} Points</h4>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Simulations</p>
                            <h4 className="text-2xl font-bold flex items-center gap-2">{profile.arcade?.gamesPlayed || 0} Completed</h4>
                        </div>
                    </div>

                    <ContributionGraph logs={profile.activityLogs} />

                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Technical Records
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full border border-border/50">Public Access</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentNotes.length > 0 ? recentNotes.map(note => (
                                <Link key={note._id} to={`/notes/${note._id}`} className="group p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition-all shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-[0.1em]">{note.category?.name || 'GENERIC'}</span>
                                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors truncate max-w-[200px]">{note.title}</h4>
                                        </div>
                                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-medium italic opacity-80">
                                        {note.content?.replace(/[#*`]/g, '').slice(0, 90)}...
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
                                        {note.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[8px] font-bold text-primary border border-primary/10 bg-primary/5 px-2 py-0.5 rounded uppercase tracking-tighter">{tag}</span>
                                        ))}
                                        <span className="text-[9px] text-muted-foreground ml-auto font-mono">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl bg-muted/10">
                                    <p className="text-muted-foreground font-medium italic">No public records available for this identity.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            <UserListModal
                isOpen={modalData.isOpen}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
                userId={profile?._id}
                type={modalData.type}
                title={modalData.title}
            />
        </div>
    );
};

export default PublicProfile;
