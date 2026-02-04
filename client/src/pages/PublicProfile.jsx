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
    Flame
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser } from '../features/auth/authSlice';
import ContributionGraph from '../components/profile/ContributionGraph';
import Spinner from '../components/Spinner';
import UserListModal from '../components/UserListModal';

const PublicProfile = () => {
    const dispatch = useDispatch();
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

    if (loading) return <Spinner />;
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{error}</h2>
            <Link to="/" className="text-primary hover:underline">Return to ScriptShelf</Link>
        </div>
    );

    if (!data) return null;

    const { profile, recentNotes } = data;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-[12px] font-bold uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} /> BACK TO SCRIPTSHELF
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start border-b border-border pb-10">
                <div className="shrink-0">
                    <div className="w-[128px] h-[128px] bg-primary rounded-[3px] flex items-center justify-center text-white text-[64px] font-bold overflow-hidden shadow-sm">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            profile.username.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-[32px] font-bold text-foreground flex items-center gap-3 leading-tight">
                                {profile.username}
                                {profile.role === 'admin' && <ShieldCheck size={24} className="text-primary" />}
                            </h1>
                            <p className="text-primary font-bold text-[13px] uppercase tracking-[0.2em] mt-1">Logic Architect</p>
                        </div>
                        <div className="flex gap-3">
                            {profile.socialLinks?.github && (
                                <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noreferrer" className="p-2 border border-border rounded-[3px] hover:bg-muted transition-colors">
                                    <Github size={20} className="text-muted-foreground" />
                                </a>
                            )}
                            {profile.socialLinks?.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 border border-border rounded-[3px] hover:bg-muted transition-colors">
                                    <Linkedin size={20} className="text-muted-foreground" />
                                </a>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noreferrer" className="p-2 border border-border rounded-[3px] hover:bg-muted transition-colors">
                                    <Globe size={20} className="text-muted-foreground" />
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="text-[16px] text-foreground/80 max-w-3xl leading-relaxed italic">
                        "{profile.bio || 'Public contributor at ScriptShelf.'}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Performance Identity</h3>
                        <div className="bg-card border border-border p-6 rounded-[3px] space-y-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[24px] font-bold text-foreground">{profile.arcade?.points || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1"><Trophy size={12} className="text-primary" /> Global XP</p>
                                </div>
                                <div className="space-y-1 border-l border-border pl-6">
                                    <p className="text-[24px] font-bold text-orange-500">{profile.arcade?.streak || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1"><Flame size={12} fill="currentColor" /> Peak Streak</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setModalData({ isOpen: true, type: 'followers', title: 'Network_Followers' })}
                                    className="space-y-1 text-left hover:bg-muted/30 p-2 rounded-[3px] transition-colors"
                                >
                                    <p className="text-[18px] font-bold text-foreground">{profile.followers?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Followers</p>
                                </button>
                                <button
                                    onClick={() => setModalData({ isOpen: true, type: 'following', title: 'Network_Following' })}
                                    className="space-y-1 text-left border-l border-border pl-6 hover:bg-muted/30 p-2 rounded-[3px] transition-colors"
                                >
                                    <p className="text-[18px] font-bold text-foreground">{profile.following?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Following</p>
                                </button>
                            </div>

                            {currentUser && currentUser.username !== profile.username && (
                                <button
                                    onClick={handleFollow}
                                    className={`w-full py-2.5 rounded-[3px] text-[12px] font-bold uppercase tracking-widest transition-all ${isFollowing
                                        ? 'border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500 hover:bg-rose-500/5'
                                        : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]'
                                        }`}
                                >
                                    {isFollowing ? 'Retract_Follow' : 'Establish_Link'}
                                </button>
                            )}
                        </div>

                        <UserListModal
                            isOpen={modalData.isOpen}
                            onClose={() => setModalData({ ...modalData, isOpen: false })}
                            userId={profile?._id}
                            type={modalData.type}
                            title={modalData.title}
                        />
                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mt-4 px-1 italic opacity-60">
                            <Calendar size={14} /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground px-1">Accomplishments</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { days: 1, label: "Hello World" },
                                { days: 3, label: "Script Kiddie" },
                                { days: 7, label: "Code Ninja" },
                                { days: 30, label: "Full Stack" },
                                { days: 60, label: "Architect" },
                            ].map((badge, i) => {
                                const isUnlocked = (profile.arcade?.streak || 0) >= badge.days;
                                return (
                                    <div key={i} className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-tight rounded-[2px] transition-all
                                        ${isUnlocked ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-dashed border-border text-muted-foreground/10 grayscale'}
                                    `}>
                                        {badge.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-12">
                    <section className="bg-card border border-border p-6 rounded-[3px]">
                        <ContributionGraph logs={profile.activityLogs} />
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="text-[19px] font-normal text-foreground">Technical Records</h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Public Domain</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {recentNotes.length > 0 ? recentNotes.map(note => (
                                <Link key={note._id} to={`/notes/${note._id}`} className="group p-5 bg-card border border-border rounded-[3px] flex items-center justify-between hover:border-primary transition-all">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <div className="min-w-0 space-y-1">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">{note.category?.name || 'GENERIC'}</span>
                                            <h4 className="text-[16px] font-bold text-foreground group-hover:text-primary transition-colors truncate">{note.title}</h4>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )) : (
                                <div className="p-12 text-center border border-dashed border-border rounded-[3px] text-muted-foreground italic">No public records found.</div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
