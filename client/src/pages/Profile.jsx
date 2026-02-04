import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import {
    Edit3,
    Github,
    Linkedin,
    Twitter,
    FileText,
    Mail,
    Globe,
    ExternalLink,
    Plus,
    Trash2,
    Terminal,
    ShieldCheck,
    Flame,
    Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ContributionGraph from '../components/profile/ContributionGraph';
import UserListModal from '../components/UserListModal';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, isLoading, isSuccess } = useSelector((state) => state.auth);
    const { notes } = useSelector((state) => state.notes);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: '',
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            website: '',
            leetcode: ''
        },
        customLinks: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [modalData, setModalData] = useState({ isOpen: false, type: '', title: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                socialLinks: {
                    github: user.socialLinks?.github || '',
                    linkedin: user.socialLinks?.linkedin || '',
                    twitter: user.socialLinks?.twitter || '',
                    website: user.website || '',
                    leetcode: user.socialLinks?.leetcode || ''
                },
                customLinks: user.customLinks || []
            });
        }
    }, [user]);

    useEffect(() => {
        if (isSuccess && isEditing) {
            toast.success('Profile updated');
            setIsEditing(false);
            dispatch(reset());
        }
    }, [isSuccess, isEditing, dispatch]);

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('socialLinks.')) {
            const child = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCustomLinkChange = (index, field, value) => {
        const newLinks = [...formData.customLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, customLinks: newLinks }));
    };

    const addCustomLink = () => {
        setFormData(prev => ({
            ...prev,
            customLinks: [...prev.customLinks, { label: '', url: '' }]
        }));
    };

    const removeCustomLink = (index) => {
        const newLinks = formData.customLinks.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, customLinks: newLinks }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const updateData = new FormData();
        updateData.append('username', formData.username);
        updateData.append('email', formData.email);
        updateData.append('bio', formData.bio);
        updateData.append('socialLinks', JSON.stringify(formData.socialLinks));
        updateData.append('customLinks', JSON.stringify(formData.customLinks));
        if (formData.avatarFile) updateData.append('avatar', formData.avatarFile);
        dispatch(updateProfile(updateData));
    };

    if (isLoading && !isEditing) return <Spinner />;

    const currentUserNotes = notes.filter(n => (n.user?._id || n.user) === user?._id);
    const userNotes = currentUserNotes.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start pb-8 border-b border-border">
                <div className="relative group">
                    <div className="w-[128px] h-[128px] bg-primary rounded-[3px] flex items-center justify-center text-white text-[64px] font-bold overflow-hidden shadow-md">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.username?.charAt(0).toUpperCase()
                        )}
                    </div>
                    {isEditing && (
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[3px]">
                            <Edit3 className="text-white" size={24} />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                if (e.target.files[0]) {
                                    setFormData(prev => ({
                                        ...prev,
                                        avatarFile: e.target.files[0],
                                        avatar: URL.createObjectURL(e.target.files[0])
                                    }));
                                }
                            }} />
                        </label>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-[28px] font-bold text-foreground flex items-center gap-3">
                                {user?.username}
                                {user?.role === 'admin' && <ShieldCheck size={20} className="text-primary" />}
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2 text-[14px]">
                                <Mail size={14} /> {user?.email}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/u/${user?.username}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Public link copied!');
                                }}
                                className="so-btn border border-border text-muted-foreground hover:text-foreground px-4 py-2 flex items-center gap-2 transition-all"
                            >
                                <ExternalLink size={16} /> Share Profile
                            </button>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="so-btn so-btn-primary px-6 py-2 flex items-center gap-2"
                            >
                                <Edit3 size={16} /> {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <p className="text-[15px] text-foreground max-w-2xl leading-relaxed">
                        {user?.bio || 'Professional developer and ScriptShelf contributor.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats & Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-[19px] font-normal text-foreground">Performance</h3>
                        <div className="glass-frost p-6 rounded-[3px] grid grid-cols-2 gap-y-6 gap-x-4 shadow-sm border border-border/50">
                            <div className="space-y-1">
                                <p className="text-[21px] font-bold text-foreground">{userNotes}</p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Total Scripts</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[21px] font-bold text-primary flex items-center gap-1">
                                    <Trophy size={16} /> {user?.arcade?.points || 0}
                                </p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Arcade XP</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[21px] font-bold text-orange-500 flex items-center gap-1">
                                    <Flame size={16} className="fill-orange-500" /> {user?.arcade?.streak || 0}
                                </p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Active Streak</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[21px] font-bold text-foreground">
                                    {user?.role === 'admin' ? 'Elite' : 'Member'}
                                </p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Rank</p>
                            </div>

                            <div className="pt-4 border-t border-border/50 col-span-2 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setModalData({ isOpen: true, type: 'followers', title: 'Network_Followers' })}
                                    className="space-y-1 text-left hover:bg-muted/30 p-2 rounded-[3px] transition-colors"
                                >
                                    <p className="text-[18px] font-bold text-foreground">{user?.followers?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Followers</p>
                                </button>
                                <button
                                    onClick={() => setModalData({ isOpen: true, type: 'following', title: 'Network_Following' })}
                                    className="space-y-1 text-left border-l border-border pl-4 hover:bg-muted/30 p-2 rounded-[3px] transition-colors"
                                >
                                    <p className="text-[18px] font-bold text-foreground">{user?.following?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Following</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <UserListModal
                        isOpen={modalData.isOpen}
                        onClose={() => setModalData({ ...modalData, isOpen: false })}
                        userId={user?._id}
                        type={modalData.type}
                        title={modalData.title}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[19px] font-normal text-foreground">Badges</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { days: 1, label: "Hello World", color: "emerald" },
                                { days: 3, label: "Script Kiddie", color: "yellow" },
                                { days: 7, label: "Code Ninja", color: "violet" },
                                { days: 30, label: "Full Stack", color: "rose" },
                                { days: 60, label: "Architect", color: "cyan" },
                            ].map((badge, i) => {
                                const isUnlocked = (user?.arcade?.streak || 0) >= badge.days;
                                return (
                                    <div key={i} className={`px-2 py-1 rounded-[2px] border text-[11px] font-bold tracking-tight ${isUnlocked ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/10 border-dashed border-border text-muted-foreground/30 saturate-0'}`}>
                                        {badge.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Area */}
                <div className="lg:col-span-8 space-y-10">
                    {isEditing ? (
                        <div className="glass-frost p-8 rounded-[3px] border border-border">
                            <h3 className="text-[19px] font-bold mb-8 border-b border-border pb-4">Edit Profile</h3>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Username</label>
                                        <input name="username" value={formData.username} onChange={onChange} className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] outline-none focus:border-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                                        <input name="email" value={formData.email} onChange={onChange} className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] outline-none focus:border-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Bio</label>
                                    <textarea name="bio" value={formData.bio} onChange={onChange} className="w-full border border-border bg-background rounded-[3px] py-2 px-3 text-[13px] min-h-[100px] outline-none focus:border-primary" />
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <h4 className="text-[13px] font-bold uppercase mb-4 tracking-widest text-muted-foreground">Social Presence</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="socialLinks.github" value={formData.socialLinks.github} onChange={onChange} className="border border-border bg-background py-2 px-3 text-[13px] rounded-[3px]" placeholder="GitHub username" />
                                        <input name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={onChange} className="border border-border bg-background py-2 px-3 text-[13px] rounded-[3px]" placeholder="LinkedIn URL" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="so-btn so-btn-primary px-8">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="so-btn bg-transparent px-6">Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            {/* Heatmap */}
                            <section className="bg-card border border-border p-6 rounded-[3px]">
                                <ContributionGraph logs={user?.activityLogs} />
                            </section>

                            {/* Recent Activity */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-[19px] font-normal text-foreground">Recent Activity</h3>
                                    <Link to="/notes" className="text-[12px] text-link hover:underline">View All</Link>
                                </div>
                                <div className="bg-card border border-border rounded-[3px] divide-y divide-border overflow-hidden">
                                    {currentUserNotes.slice(0, 5).map(note => (
                                        <Link key={note._id} to={`/notes/${note._id}`} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold px-1.5 rounded-[2px] ${note.isPublic ? 'bg-primary text-white' : 'border border-border text-muted-foreground'}`}>
                                                    {note.isPublic ? 'PUB' : 'PVT'}
                                                </span>
                                                <span className="text-[14px] font-medium text-foreground">{note.title}</span>
                                            </div>
                                            <span className="text-[12px] text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </Link>
                                    ))}
                                    {currentUserNotes.length === 0 && <div className="p-8 text-center text-muted-foreground italic">No recent scripts found.</div>}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {[...new Set(currentUserNotes.map(n => n.category?.name).filter(Boolean))].map(name => (
                                        <span key={name} className="so-tag">{name}</span>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
